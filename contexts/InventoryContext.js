import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { dbHelpers, storageHelpers } from '../utils/storage';
import { parseLocation } from '../utils/dateUtils';
import { useItemLikesSync, useItemReviewCountSync, useItemWishlistCountSync } from '../hooks/useItemFieldSync';
import { useAllItems } from './AllItemsContext';
import { fetchBaroStatus, fetchBaroDataWithFallback, isBaroActive } from '../services/api';
import { PERMANENT_BARO_ITEMS } from '../constants/items';
import logger from '../utils/logger';

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

  let matchedBySuffix = 0, matchedByName = 0, unmatched = 0;

  const results = inventory.map(invItem => {
    // Primary: match by uniqueName suffix
    const invSuffix = getUniqueNameSuffix(invItem.uniqueName)?.toLowerCase();
    let fullItem = invSuffix ? suffixMap.get(invSuffix) : null;

    if (fullItem) {
      matchedBySuffix++;
    } else if (invItem.item) {
      // Fallback: match by name
      fullItem = nameMap.get(invItem.item.toLowerCase());
      if (fullItem) matchedByName++;
    }

    if (!fullItem) {
      unmatched++;
      logger.debug('Baro', `Unmatched item: "${invItem.item}" (suffix: ${invSuffix || 'none'})`);
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

    const merged = {
      ...fullItem,
      creditPrice: invItem.credits,
      ducatPrice: invItem.ducats
    };
    // New = has exactly one offering date (first time Baro has ever brought it)
    // Permanent items are never new
    merged.isNew = Array.isArray(merged.offeringDates)
      && merged.offeringDates.length === 1
      && !PERMANENT_BARO_ITEMS.includes(merged.name?.toLowerCase());
    return merged;
  });

  logger.debug('Baro', `Match results: ${matchedBySuffix} by suffix, ${matchedByName} by name, ${unmatched} unmatched (${inventory.length} total)`);
  return results;
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
  const prevAllItemsCountRef = useRef(0);
  const { items: allItems, loading: allItemsLoading, refreshInBackground } = useAllItems();

  const fetchBaroInventory = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);

      logger.debug('Baro', `fetchBaroInventory called (forceRefresh=${forceRefresh})`);

      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const now = Date.now();
        const cachedBaroResponse = await storageHelpers.getBaroResponse();
        
        if (cachedBaroResponse) {
          const cachedBaroIsHere = cachedBaroResponse.isActive;
          const nextDate = cachedBaroIsHere ? cachedBaroResponse.expiry : cachedBaroResponse.activation;
          const nextDateTime = nextDate ? new Date(nextDate).getTime() : null;
          
          // If the next event date has passed, invalidate cache and force allItems refresh
          if (nextDateTime && now >= nextDateTime) {
            logger.log('Cached Baro dates have passed, refreshing allItems and fetching fresh Baro data');
            await refreshInBackground();
          } else {
            logger.log('Using cached Baro response');
            
            // Store raw inventory for re-matching when allItems loads
            rawInventoryRef.current = cachedBaroResponse.inventory;
            
            // Match Baro inventory with all items from context (or SQLite fallback)
            const itemsToMatch = await dbHelpers.getCachedItems();
            logger.debug('Baro', `Matching ${cachedBaroResponse.inventory.length} cached inventory items against ${itemsToMatch.length} items (source: SQLite)`);
            const matchedItems = matchInventoryItems(cachedBaroResponse.inventory, itemsToMatch);
            
            setItems(matchedItems);
            setIsHere(cachedBaroResponse.isActive);
            setNextArrival(nextDate ? new Date(nextDate) : null);
            setNextLocation(parseLocation(cachedBaroResponse.location));
            
            logger.debug('Baro', 'Restored from cache:', { 
              isHere: cachedBaroResponse.isActive, 
              nextDate, 
              location: cachedBaroResponse.location 
            });
            
            setLoading(false);
            return;
          }
        } else {
          logger.log('No cached Baro response found, fetching from API');
        }
      }

      // Fetch Baro data from API (or mock in simulation mode)
      logger.debug('Baro', 'Fetching fresh Baro data from API...');
      const baroData = await fetchBaroDataWithFallback();

      const now = new Date();
      const isBaroCurrentlyActive = isBaroActive(baroData.activation, baroData.expiry);
      logger.debug('Baro', `API response: isActive=${isBaroCurrentlyActive}, inventory=${baroData.inventory?.length || 0} items, activation=${baroData.activation}, expiry=${baroData.expiry}`);

      // Cache the raw Baro API response
      await storageHelpers.setBaroResponse({
        inventory: baroData.inventory,
        activation: baroData.activation,
        expiry: baroData.expiry,
        location: baroData.location,
        isActive: isBaroCurrentlyActive
      });

      // Store raw inventory for re-matching when allItems loads
      rawInventoryRef.current = baroData.inventory;
      
      // Match Baro inventory with freshly cached items from SQLite
      const itemsToMatch = await dbHelpers.getCachedItems();
      logger.debug('Baro', `Matching ${baroData.inventory?.length || 0} inventory items against ${itemsToMatch.length} items (source: SQLite)`);
      const matchedItems = matchInventoryItems(baroData.inventory, itemsToMatch);

      setItems(matchedItems);
      setIsHere(isBaroCurrentlyActive);

      const nextDate = isBaroCurrentlyActive ? baroData.expiry : baroData.activation;
      logger.debug('Baro', `State set: isHere=${isBaroCurrentlyActive}, nextArrival=${nextDate}`);
      setNextArrival(nextDate ? new Date(nextDate) : null);
      setNextLocation(parseLocation(baroData.location));
    } catch (error) {
      logger.error('Error fetching Baro inventory:', error);
      
      // Fall back to cached Baro response on error
      try {
        const cachedBaroResponse = await storageHelpers.getBaroResponse();
        if (cachedBaroResponse) {
          logger.log('Using cached Baro response on error');
          
          rawInventoryRef.current = cachedBaroResponse.inventory;
          const itemsToMatch = await dbHelpers.getCachedItems();
          const matchedItems = matchInventoryItems(cachedBaroResponse.inventory, itemsToMatch);
          
          setItems(matchedItems);
          setIsHere(cachedBaroResponse.isActive);
          const nextDate = cachedBaroResponse.isActive ? cachedBaroResponse.expiry : cachedBaroResponse.activation;
          setNextArrival(nextDate ? new Date(nextDate) : null);
          setNextLocation(parseLocation(cachedBaroResponse.location));
        }
      } catch (cacheError) {
        logger.error('Error loading cached Baro response:', cacheError);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshInBackground]); // refreshInBackground forces allItems update when Baro dates expire

  useEffect(() => {
    fetchBaroInventory();
  }, [fetchBaroInventory]);

  // Re-match inventory items when allItems count actually changes (not just reference)
  useEffect(() => {
    if (!allItemsLoading && allItems.length > 0 && rawInventoryRef.current && rawInventoryRef.current.length > 0) {
      // Skip re-match if count is unchanged, UNLESS we're syncing (need to clear syncing state)
      if (allItems.length === prevAllItemsCountRef.current && !syncing) return;
      prevAllItemsCountRef.current = allItems.length;

      logger.debug('Baro', `Re-match triggered: allItems=${allItems.length}, rawInventory=${rawInventoryRef.current.length}`);
      const matchedItems = matchInventoryItems(rawInventoryRef.current, allItems);
      setItems(matchedItems);

      // Check if unmatched items remain and retry if needed
      const hasUnmatched = matchedItems.some(item => item._unmatched);
      if (hasUnmatched && unmatchedRetryRef.current < 5) {
        unmatchedRetryRef.current += 1;
        const delay = unmatchedRetryRef.current * 30_000; // 30s, 60s, 90s, 120s, 150s
        const unmatchedItems = matchedItems.filter(i => i._unmatched);
        logger.log(`${unmatchedItems.length} unmatched items remain, retrying allItems refresh in ${delay / 1000}s (attempt ${unmatchedRetryRef.current}/5): ${unmatchedItems.map(i => i.name).join(', ')}`);
        unmatchedTimerRef.current = setTimeout(() => refreshInBackground(), delay);
      } else {
        // Either fully matched, or retries exhausted — clear syncing either way
        if (hasUnmatched) {
          const exhaustedItems = matchedItems.filter(i => i._unmatched);
          logger.log(`Retries exhausted with ${exhaustedItems.length} unmatched items remaining, clearing syncing state: ${exhaustedItems.map(i => i.name).join(', ')}`);
        }
        unmatchedRetryRef.current = 0;
        setSyncing(false);
      }
    }
    return () => {
      if (unmatchedTimerRef.current) clearTimeout(unmatchedTimerRef.current);
    };
  }, [allItems, allItemsLoading, refreshInBackground, syncing]);

  // Auto-refresh when timer expires
  useEffect(() => {
    if (!nextArrival) return;

    const now = Date.now();
    const timeUntilExpiry = nextArrival.getTime() - now;

    // If the time has already passed, don't set a timeout
    if (timeUntilExpiry <= 0) return;

    logger.debug('Baro', `Auto-refresh timer set: ${Math.round(timeUntilExpiry / 1000)}s until ${nextArrival.toISOString()} (isHere=${isHere})`);

    const timeoutId = setTimeout(() => {
      logger.debug('Baro', `Timer expired! isHere=${isHere}, starting ${isHere ? 'departure' : 'arrival'} flow`);

      // When Baro is arriving (absent timer hit 0), show syncing state
      // and poll our backend until it confirms Baro is active.
      if (!isHere) {
        logger.debug('Baro', 'Entering syncing state, beginning poll loop...');
        setSyncing(true);

        let attempts = 0;
        const maxAttempts = 20; // 20 * 20s = ~6.5 min max

        const poll = async () => {
          attempts++;
          try {
            logger.debug('Baro', `Polling backend (attempt ${attempts}/${maxAttempts})...`);
            const status = await fetchBaroStatus();
            logger.debug('Baro', `Poll response: isActive=${status.isActive}, items=${status.items?.length || 0}`);
            if (status.isActive) {
              logger.debug('Baro', 'Backend confirms Baro is active! Refreshing allItems then inventory...');
              await refreshInBackground();
              await fetchBaroInventory(true);
              setSyncing(false);
              return; // Stop polling
            }
          } catch (err) {
            logger.warn('Baro status poll failed:', err.message);
          }

          if (attempts < maxAttempts) {
            logger.debug('Baro', 'Backend not ready yet, next poll in 20s...');
            pollTimerRef.current = setTimeout(poll, 20_000);
          } else {
            logger.debug('Baro', 'Max poll attempts reached, falling back to direct refresh');
            refreshInBackground();
            setSyncing(false);
          }
        };

        poll();
      } else {
        logger.debug('Baro', 'Baro departure timer expired, refreshing...');
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
        logger.log('Cold start: Baro is here with unmatched items, entering syncing state');
        setSyncing(true);
      }
    }
  }, [loading, isHere]); // Only on initial load, not every items change

  // Auto-refresh inventory on an interval when the setting is enabled
  useEffect(() => {
    let intervalId = null;

    const startAutoRefresh = async () => {
      const enabled = await storageHelpers.getBoolean('autoRefreshEnabled', false);
      if (enabled) {
        const AUTO_REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour
        logger.debug('Baro', 'Auto-refresh enabled, polling every hour');
        intervalId = setInterval(() => {
          logger.debug('Baro', 'Auto-refresh: refreshing inventory...');
          refreshInBackground();
        }, AUTO_REFRESH_INTERVAL);
      }
    };

    startAutoRefresh();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [refreshInBackground]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBaroInventory(true); // Force refresh
  }, [fetchBaroInventory]);

  const updateItemLikes = useItemLikesSync(setItems);
  const updateItemReviewCount = useItemReviewCountSync(setItems);
  const updateItemWishlistCount = useItemWishlistCountSync(setItems);

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
      updateItemReviewCount,
      updateItemWishlistCount,
    }),
    [items, loading, refreshing, syncing, nextArrival, nextLocation, isHere, onRefresh, updateItemLikes, updateItemReviewCount, updateItemWishlistCount]
  );

  return (
    <InventoryContext.Provider value={contextValue}>
      {children}
    </InventoryContext.Provider>
  );
};
