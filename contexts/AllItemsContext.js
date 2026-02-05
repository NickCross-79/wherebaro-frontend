import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { fetchAllItems } from '../services/api';
import { dbHelpers, storageHelpers } from '../utils/storage';
import { normalizeItem } from '../utils/normalizeItem';
import { CACHE_DURATION_MS } from '../constants/items';
import { useItemLikesSync } from '../hooks/useItemLikesSync';

const AllItemsContext = createContext();

export const useAllItems = () => {
  const context = useContext(AllItemsContext);
  if (!context) {
    throw new Error('useAllItems must be used within an AllItemsProvider');
  }
  return context;
};

export const AllItemsProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = async (forceRefresh = false) => {
    try {
      setError(null);

      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const lastRefresh = await storageHelpers.getLastDataRefresh();
        const now = Date.now();
        
        if (now - lastRefresh < CACHE_DURATION_MS) {
          // Use cached data
          const cachedItems = await dbHelpers.getCachedItems();
          if (cachedItems.length > 0) {
            const hasOfferingDates = cachedItems.some(
              (cached) => Array.isArray(cached?.offeringDates) && cached.offeringDates.length > 0
            );
            if (hasOfferingDates) {
              console.log('Using cached all items');
              setItems(cachedItems);
              setLoading(false);
              setRefreshing(false);
              return;
            }
          }
        }
      }

      const data = await fetchAllItems();
      const normalized = data.map(normalizeItem);
      
      // Cache the items
      await dbHelpers.clearItemsCache();
      await dbHelpers.cacheItems(normalized);
      await storageHelpers.setLastDataRefresh(Date.now());
      
      setItems(normalized);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError(err.message);
      
      // Fall back to cache on error
      try {
        const cachedItems = await dbHelpers.getCachedItems();
        if (cachedItems.length > 0) {
          console.log('Using cached all items on error');
          setItems(cachedItems);
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
    fetchItems();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchItems(true); // Force refresh
  }, []);

  const updateItemLikes = useItemLikesSync(setItems);

  const value = useMemo(
    () => ({
      items,
      loading,
      refreshing,
      error,
      onRefresh,
      updateItemLikes,
    }),
    [items, loading, refreshing, error, onRefresh, updateItemLikes]
  );

  return <AllItemsContext.Provider value={value}>{children}</AllItemsContext.Provider>;
};
