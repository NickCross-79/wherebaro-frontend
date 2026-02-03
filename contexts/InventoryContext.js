import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { fetchCurrentBaro } from '../services/api';
import { dbHelpers, storageHelpers } from '../utils/storage';
import { normalizeItem } from '../utils/normalizeItem';
import { parseLocation } from '../utils/dateUtils';

const InventoryContext = createContext();

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

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

  const fetchBaroInventory = async (forceRefresh = false) => {
    try {
      setLoading(true);

      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const lastRefresh = await storageHelpers.getLastDataRefresh();
        const now = Date.now();
        
        if (now - lastRefresh < CACHE_DURATION) {
          // Use cached data
          const cachedItems = await dbHelpers.getCachedItems();
          const cachedExpiry = await storageHelpers.get('baroExpiry');
          const cachedActivation = await storageHelpers.get('baroActivation');
          
          // Only use cache if we have both items AND Baro state
          if (cachedItems.length > 0 && (cachedExpiry || cachedActivation)) {
            const hasOfferingDates = cachedItems.some(
              (cached) => Array.isArray(cached?.offeringDates) && cached.offeringDates.length > 0
            );

            if (!hasOfferingDates) {
              console.log('Cached inventory missing offering dates, fetching from API');
            } else {
              console.log('Using cached inventory items');
              setItems(cachedItems);
              
              // Restore Baro state from cache
              const cachedBaroIsHere = await storageHelpers.getBoolean('baroIsHere', false);
              const cachedLocation = await storageHelpers.get('baroLocation');
              
              setIsHere(cachedBaroIsHere);
              const nextDate = cachedBaroIsHere ? cachedExpiry : cachedActivation;
              setNextArrival(nextDate ? new Date(nextDate) : null);
              setNextLocation(parseLocation(cachedLocation));
              
              console.log('Restored Baro state from cache:', { 
                isHere: cachedBaroIsHere, 
                nextDate, 
                location: cachedLocation 
              });
              
              setLoading(false);
              return;
            }
          } else {
            console.log('No complete cache found, fetching from API');
          }
        }
      }

      const data = await fetchCurrentBaro();
      const baroIsHere = Boolean(data?.isActive);

      console.log('API Response:', { 
        isActive: data?.isActive, 
        expiry: data?.expiry, 
        activation: data?.activation,
        location: data?.location 
      });

      const normalizedItems = Array.isArray(data?.items)
        ? data.items.map((current) => normalizeItem(current, { includeDateAdded: true }))
        : [];

      const sortedItems = normalizedItems.sort((a, b) => {
        if (!a.dateAdded) return 1;
        if (!b.dateAdded) return -1;
        return b.dateAdded - a.dateAdded;
      });

      // Cache the items
      await dbHelpers.clearItemsCache();
      await dbHelpers.cacheItems(sortedItems);
      await storageHelpers.setLastDataRefresh(Date.now());
      await storageHelpers.setLastBaroCheck(Date.now());
      
      // Cache Baro state
      await storageHelpers.setBoolean('baroIsHere', baroIsHere);
      if (data?.expiry) await storageHelpers.set('baroExpiry', data.expiry);
      if (data?.activation) await storageHelpers.set('baroActivation', data.activation);
      if (data?.location) await storageHelpers.set('baroLocation', data.location);

      setItems(sortedItems);
      setIsHere(baroIsHere);

      const nextDate = baroIsHere ? data?.expiry : data?.activation;
      console.log('Setting nextArrival:', { nextDate, baroIsHere });
      setNextArrival(nextDate ? new Date(nextDate) : null);
      setNextLocation(parseLocation(data?.location));
    } catch (error) {
      console.error('Error fetching Baro inventory:', error);
      
      // Fall back to cache on error
      try {
        const cachedItems = await dbHelpers.getCachedItems();
        if (cachedItems.length > 0) {
          console.log('Using cached inventory on error');
          setItems(cachedItems);
          
          // Restore Baro state from cache
          const cachedBaroIsHere = await storageHelpers.getBoolean('baroIsHere', false);
          const cachedExpiry = await storageHelpers.get('baroExpiry');
          const cachedActivation = await storageHelpers.get('baroActivation');
          const cachedLocation = await storageHelpers.get('baroLocation');
          
          setIsHere(cachedBaroIsHere);
          const nextDate = cachedBaroIsHere ? cachedExpiry : cachedActivation;
          setNextArrival(nextDate ? new Date(nextDate) : null);
          setNextLocation(parseLocation(cachedLocation));
        }
      } catch (cacheError) {
        console.error('Error loading cache:', cacheError);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBaroInventory();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBaroInventory(true); // Force refresh
  }, []);

  const updateItemLikes = useCallback(async (itemId, likeCount) => {
    setItems((prevItems) =>
      prevItems.map((current) => {
        const currentId = current?.id || current?._id;
        if (currentId === itemId) {
          return { ...current, likes: likeCount };
        }
        return current;
      })
    );

    try {
      await dbHelpers.updateItemLikes(itemId, likeCount);
    } catch (error) {
      console.error('Failed to update cached likes:', error);
    }
  }, []);

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
