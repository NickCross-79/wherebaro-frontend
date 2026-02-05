import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { fetchCurrentBaro } from '../services/api';
import { dbHelpers, storageHelpers } from '../utils/storage';
import { normalizeItem } from '../utils/normalizeItem';
import { parseLocation } from '../utils/dateUtils';
import { sendBaroArrivalNotification, sendWishlistNotification } from '../services/notificationService';

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
  const previousIsHere = useRef(null);

  const fetchBaroInventory = async (forceRefresh = false) => {
    try {
      setLoading(true);

      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const now = Date.now();
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
            // Check if cached dates are still valid
            const cachedBaroIsHere = await storageHelpers.getBoolean('baroIsHere', false);
            const nextDate = cachedBaroIsHere ? cachedExpiry : cachedActivation;
            const nextDateTime = nextDate ? new Date(nextDate).getTime() : null;
            
            // If the next event date has passed, invalidate cache
            if (nextDateTime && now >= nextDateTime) {
              console.log('Cached Baro dates have passed, fetching fresh data');
            } else {
              console.log('Using cached inventory items');
              setItems(cachedItems);
              
              // Restore Baro state from cache
              const cachedLocation = await storageHelpers.get('baroLocation');
              
              previousIsHere.current = cachedBaroIsHere;
              setIsHere(cachedBaroIsHere);
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
          }
        } else {
          console.log('No complete cache found, fetching from API');
        }
      }

      const data = await fetchCurrentBaro();
      const baroIsHere = Boolean(data?.isActive);

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
      
      // Cache Baro state
      await storageHelpers.setBoolean('baroIsHere', baroIsHere);
      if (data?.expiry) await storageHelpers.set('baroExpiry', data.expiry);
      if (data?.activation) await storageHelpers.set('baroActivation', data.activation);
      if (data?.location) await storageHelpers.set('baroLocation', data.location);

      setItems(sortedItems);
      
      // Check if Baro just arrived and send notification
      if (baroIsHere && previousIsHere.current === false) {
        console.log('Baro has arrived! Sending notification...');
        await sendBaroArrivalNotification();
        
        // Check for wishlist items
        const wishlistIds = await dbHelpers.getWishlistIds();
        const wishlistCount = sortedItems.filter(item => 
          wishlistIds.includes(item.id || item._id)
        ).length;
        
        if (wishlistCount > 0) {
          await sendWishlistNotification(wishlistCount);
        }
      }
      
      previousIsHere.current = baroIsHere;
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
          
          previousIsHere.current = cachedBaroIsHere;
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
  }, [nextArrival]);

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
