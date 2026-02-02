import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchCurrentBaro } from '../services/api';
import { dbHelpers, mmkvHelpers } from '../utils/storage';
import { normalizeItem } from '../utils/normalizeItem';

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

  const parseLocation = (location) => {
    if (!location) return null;
    const trimmed = String(location).trim();
    if (!trimmed) return null;

    const parenMatch = trimmed.match(/^(.*?)\s*\((.*?)\)\s*$/);
    if (parenMatch) {
      return { name: parenMatch[1].trim(), planet: parenMatch[2].trim() };
    }

    const commaParts = trimmed.split(',').map((part) => part.trim()).filter(Boolean);
    if (commaParts.length >= 2) {
      return { name: commaParts[0], planet: commaParts[1] };
    }

    return { name: trimmed, planet: '' };
  };

  const fetchBaroInventory = async (forceRefresh = false) => {
    try {
      setLoading(true);

      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const lastRefresh = await mmkvHelpers.getLastDataRefresh();
        const now = Date.now();
        
        if (now - lastRefresh < CACHE_DURATION) {
          // Use cached data
          const cachedItems = await dbHelpers.getCachedItems();
          const cachedExpiry = await mmkvHelpers.get('baroExpiry');
          const cachedActivation = await mmkvHelpers.get('baroActivation');
          
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
              const cachedBaroIsHere = await mmkvHelpers.getBoolean('baroIsHere', false);
              const cachedLocation = await mmkvHelpers.get('baroLocation');
              
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
      await mmkvHelpers.setLastDataRefresh(Date.now());
      await mmkvHelpers.setLastBaroCheck(Date.now());
      
      // Cache Baro state
      await mmkvHelpers.setBoolean('baroIsHere', baroIsHere);
      if (data?.expiry) await mmkvHelpers.set('baroExpiry', data.expiry);
      if (data?.activation) await mmkvHelpers.set('baroActivation', data.activation);
      if (data?.location) await mmkvHelpers.set('baroLocation', data.location);

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
          const cachedBaroIsHere = await mmkvHelpers.getBoolean('baroIsHere', false);
          const cachedExpiry = await mmkvHelpers.get('baroExpiry');
          const cachedActivation = await mmkvHelpers.get('baroActivation');
          const cachedLocation = await mmkvHelpers.get('baroLocation');
          
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchBaroInventory(true); // Force refresh
  };

  const updateItemLikes = async (itemId, likeCount) => {
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
  };

  return (
    <InventoryContext.Provider
      value={{
        items,
        loading,
        refreshing,
        nextArrival,
        nextLocation,
        isHere,
        onRefresh,
        updateItemLikes,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};
