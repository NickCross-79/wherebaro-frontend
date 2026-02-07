import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { dbHelpers, storageHelpers } from '../utils/storage';
import { parseLocation } from '../utils/dateUtils';
import { useItemLikesSync } from '../hooks/useItemLikesSync';
import { useAllItems } from './AllItemsContext';
import { fetchBaroStatus } from '../services/itemService';

const BARO_API_URL = 'https://api.warframestat.us/pc/voidTrader/';

/**
 * Extracts the last segment from a uniqueName path.
 * e.g. "/Lotus/StoreItems/Types/Items/ShipDecos/Foo" -> "Foo"
 */
const getUniqueNameSuffix = (uniqueName) => {
  if (!uniqueName) return '';
  const parts = uniqueName.split('/');
  return parts[parts.length - 1];
};

/**
 * Build a Map of uniqueName suffix -> cached item for fast matching.
 */
const buildSuffixMap = (cachedItems) => {
  const map = new Map();
  for (const item of cachedItems) {
    if (item.uniqueName) {
      const suffix = getUniqueNameSuffix(item.uniqueName);
      if (suffix) {
        map.set(suffix.toLowerCase(), item);
      }
    }
  }
  return map;
};

/**
 * Match Baro API inventory items to cached all-items using uniqueName suffix.
 * Falls back to name matching if uniqueName is not available.
 */
const matchInventoryItems = (inventory, cachedItems) => {
  const suffixMap = buildSuffixMap(cachedItems);
  const nameMap = new Map(cachedItems.map(item => [item.name?.toLowerCase(), item]));

  return inventory.map(invItem => {
    // Primary: match by uniqueName suffix
    const invSuffix = getUniqueNameSuffix(invItem.uniqueName)?.toLowerCase();
    let fullItem = invSuffix ? suffixMap.get(invSuffix) : null;

    // Fallback: match by name
    if (!fullItem && invItem.item) {
      fullItem = nameMap.get(invItem.item.toLowerCase());
    }

    if (!fullItem) {
      return {
        _unmatched: true,
        name: invItem.item,
        image: '',
        creditPrice: invItem.credits,
        ducatPrice: invItem.ducats,
        type: 'Unknown',
        offeringDates: [],
        likes: [],
        reviews: []
      };
    }

    return {
      ...fullItem,
      creditPrice: invItem.credits,
      ducatPrice: invItem.ducats
    };
  });
};

const InventoryContext = createContext();

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

export const InventoryProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextArrival, setNextArrival] = useState(null);
  const [nextLocation, setNextLocation] = useState(null);
  const [isHere, setIsHere] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const rawInventoryRef = useRef(null);
  const unmatchedRetryRef = useRef(0);
  const unmatchedTimerRef = useRef(null);
  const pollTimerRef = useRef(null);
  const { items: allItems, loading: allItemsLoading, refreshInBackground } = useAllItems();

  const fetchBaroInventory = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);

      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const now = Date.now();
        const cachedBaroResponse = await storageHelpers.getBaroResponse();
        
        if (cachedBaroResponse) {
          const cachedBaroIsHere = cachedBaroResponse.isActive;
          const nextDate = cachedBaroIsHere ? cachedBaroResponse.expiry : cachedBaroResponse.activation;
          const nextDateTime = nextDate ? new Date(nextDate).getTime() : null;
          
          // If the next event date has passed, invalidate cache
          if (nextDateTime && now >= nextDateTime) {
            console.log('Cached Baro dates have passed, fetching fresh data');
          } else {
            console.log('Using cached Baro response');
            
            // Store raw inventory for re-matching when allItems loads
            rawInventoryRef.current = cachedBaroResponse.inventory;
            
            // Match Baro inventory with all items from context (or SQLite fallback)
            const itemsToMatch = allItems.length > 0 ? allItems : await dbHelpers.getCachedItems();
            const matchedItems = matchInventoryItems(cachedBaroResponse.inventory, itemsToMatch);
            
            setItems(matchedItems);
            setIsHere(cachedBaroResponse.isActive);
            setNextArrival(nextDate ? new Date(nextDate) : null);
            setNextLocation(parseLocation(cachedBaroResponse.location));
            
            console.log('Restored Baro state from cache:', { 
              isHere: cachedBaroResponse.isActive, 
              nextDate, 
              location: cachedBaroResponse.location 
            });
            
            setLoading(false);
            return;
          }
        } else {
          console.log('No cached Baro response found, fetching from API');
        }
      }

      // Fetch Baro data from Warframestat API
      const baroResponse = await fetch(BARO_API_URL);
      if (!baroResponse.ok) {
        throw new Error(`Failed to fetch Baro data: ${baroResponse.status}`);
      }
      const baroData = await baroResponse.json();

      const now = new Date();
      const activation = new Date(baroData.activation);
      const expiry = new Date(baroData.expiry);
      const isBaroActive = now >= activation && now < expiry;

      // Cache the raw Baro API response
      await storageHelpers.setBaroResponse({
        inventory: baroData.inventory,
        activation: baroData.activation,
        expiry: baroData.expiry,
        location: baroData.location,
        isActive: isBaroActive
      });

      // Store raw inventory for re-matching when allItems loads
      rawInventoryRef.current = baroData.inventory;
      
      // Match Baro inventory with all items from context (or SQLite fallback)
      const itemsToMatch = allItems.length > 0 ? allItems : await dbHelpers.getCachedItems();
      const matchedItems = matchInventoryItems(baroData.inventory, itemsToMatch);

      setItems(matchedItems);
      setIsHere(isBaroActive);

      const nextDate = isBaroActive ? baroData.expiry : baroData.activation;
      console.log('Setting nextArrival:', { nextDate, isBaroActive });
      setNextArrival(nextDate ? new Date(nextDate) : null);
      setNextLocation(parseLocation(baroData.location));
    } catch (error) {
      console.error('Error fetching Baro inventory:', error);
      
      // Fall back to cached Baro response on error
      try {
        const cachedBaroResponse = await storageHelpers.getBaroResponse();
        if (cachedBaroResponse) {
          console.log('Using cached Baro response on error');
          
          rawInventoryRef.current = cachedBaroResponse.inventory;
          const itemsToMatch = allItems.length > 0 ? allItems : await dbHelpers.getCachedItems();
          const matchedItems = matchInventoryItems(cachedBaroResponse.inventory, itemsToMatch);
          
          setItems(matchedItems);
          setIsHere(cachedBaroResponse.isActive);
          const nextDate = cachedBaroResponse.isActive ? cachedBaroResponse.expiry : cachedBaroResponse.activation;
          setNextArrival(nextDate ? new Date(nextDate) : null);
          setNextLocation(parseLocation(cachedBaroResponse.location));
        }
      } catch (cacheError) {
        console.error('Error loading cached Baro response:', cacheError);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBaroInventory();
  }, [fetchBaroInventory]);

  // Re-match inventory items when allItems finishes loading
  useEffect(() => {
    if (!allItemsLoading && allItems.length > 0 && rawInventoryRef.current) {
      console.log('AllItems loaded, re-matching Baro inventory');
      const matchedItems = matchInventoryItems(rawInventoryRef.current, allItems);
      setItems(matchedItems);

      // Check if unmatched items remain and retry if needed
      const hasUnmatched = matchedItems.some(item => item._unmatched);
      if (hasUnmatched && unmatchedRetryRef.current < 5) {
        unmatchedRetryRef.current += 1;
        const delay = unmatchedRetryRef.current * 30_000; // 30s, 60s, 90s, 120s, 150s
        console.log(`${matchedItems.filter(i => i._unmatched).length} unmatched items remain, retrying allItems refresh in ${delay / 1000}s (attempt ${unmatchedRetryRef.current}/5)`);
        unmatchedTimerRef.current = setTimeout(() => refreshInBackground(), delay);
      } else if (!hasUnmatched) {
        unmatchedRetryRef.current = 0; // Reset on full match
        setSyncing(false);
      }
    }
    return () => {
      if (unmatchedTimerRef.current) clearTimeout(unmatchedTimerRef.current);
    };
  }, [allItems, allItemsLoading, refreshInBackground]);

  // Auto-refresh when timer expires
  useEffect(() => {
    if (!nextArrival) return;

    const now = Date.now();
    const timeUntilExpiry = nextArrival.getTime() - now;

    // If the time has already passed, don't set a timeout
    if (timeUntilExpiry <= 0) return;

    console.log(`Setting auto-refresh timer for ${Math.round(timeUntilExpiry / 1000)}s`);

    const timeoutId = setTimeout(() => {
      console.log('Timer expired, auto-refreshing Baro data...');

      // When Baro is arriving (absent timer hit 0), show syncing state
      // and poll our backend until it confirms Baro is active.
      if (!isHere) {
        setSyncing(true);
        fetchBaroInventory(true);

        let attempts = 0;
        const maxAttempts = 20; // 20 * 20s = ~6.5 min max

        const poll = async () => {
          attempts++;
          try {
            console.log(`Polling backend for Baro status (attempt ${attempts}/${maxAttempts})`);
            const status = await fetchBaroStatus();
            if (status.isActive) {
              console.log('Backend confirms Baro is active, refreshing allItems then Baro inventory');
              await refreshInBackground();
              await fetchBaroInventory(true);
              setSyncing(false);
              return; // Stop polling
            }
          } catch (err) {
            console.warn('Baro status poll failed:', err.message);
          }

          if (attempts < maxAttempts) {
            pollTimerRef.current = setTimeout(poll, 20_000);
          } else {
            console.log('Max poll attempts reached, falling back to direct refresh');
            refreshInBackground();
            setSyncing(false);
          }
        };

        poll();
      } else {
        fetchBaroInventory(true);
      }
    }, timeUntilExpiry);

    return () => {
      clearTimeout(timeoutId);
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, [nextArrival, fetchBaroInventory, isHere, refreshInBackground]);

  // On cold start: if Baro is here and there are unmatched items, enter syncing state
  useEffect(() => {
    if (!loading && isHere && items.length > 0) {
      const hasUnmatched = items.some(item => item._unmatched);
      if (hasUnmatched) {
        console.log('Cold start: Baro is here with unmatched items, entering syncing state');
        setSyncing(true);
      }
    }
  }, [loading, isHere]); // Only on initial load, not every items change

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBaroInventory(true); // Force refresh
  }, [fetchBaroInventory]);

  const updateItemLikes = useItemLikesSync(setItems);

  const contextValue = useMemo(
    () => ({
      items,
      loading,
      refreshing,
      syncing,
      nextArrival,
      nextLocation,
      isHere,
      onRefresh,
      updateItemLikes,
    }),
    [items, loading, refreshing, syncing, nextArrival, nextLocation, isHere, onRefresh, updateItemLikes]
  );

  return (
    <InventoryContext.Provider value={contextValue}>
      {children}
    </InventoryContext.Provider>
  );
};
