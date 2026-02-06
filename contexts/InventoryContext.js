import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { dbHelpers, storageHelpers } from '../utils/storage';
import { parseLocation } from '../utils/dateUtils';
import { useItemLikesSync } from '../hooks/useItemLikesSync';

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
            
            // Match Baro inventory with cached all items using uniqueName
            const allCachedItems = await dbHelpers.getCachedItems();
            const matchedItems = matchInventoryItems(cachedBaroResponse.inventory, allCachedItems);
            
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

      // Match Baro inventory with cached all items using uniqueName
      const allCachedItems = await dbHelpers.getCachedItems();
      const matchedItems = matchInventoryItems(baroData.inventory, allCachedItems);

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
          
          const allCachedItems = await dbHelpers.getCachedItems();
          const matchedItems = matchInventoryItems(cachedBaroResponse.inventory, allCachedItems);
          
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
      fetchBaroInventory(true);
    }, timeUntilExpiry);

    return () => clearTimeout(timeoutId);
  }, [nextArrival, fetchBaroInventory]);

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
      nextArrival,
      nextLocation,
      isHere,
      onRefresh,
      updateItemLikes,
    }),
    [items, loading, refreshing, nextArrival, nextLocation, isHere, onRefresh, updateItemLikes]
  );

  return (
    <InventoryContext.Provider value={contextValue}>
      {children}
    </InventoryContext.Provider>
  );
};
