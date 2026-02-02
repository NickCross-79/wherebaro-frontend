import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchAllItems } from '../services/api';
import { dbHelpers, mmkvHelpers } from '../utils/storage';

const AllItemsContext = createContext();

const WARFRAME_IMAGE_BASE = 'https://wiki.warframe.com/images/';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

const normalizeItem = (item) => {
  return {
    id: item._id,
    name: item.name,
    image: item.image ? `${WARFRAME_IMAGE_BASE}${item.image}` : 'https://via.placeholder.com/150',
    link: item.link,
    creditPrice: item.creditPrice,
    ducatPrice: item.ducatPrice,
    type: item.type,
    offeringDates: item.offeringDates || [],
    likes: Array.isArray(item.likes) ? item.likes.length : item.likes || 0,
    reviews: item.reviews || [],
  };
};

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
        const lastRefresh = await mmkvHelpers.getLastDataRefresh();
        const now = Date.now();
        
        if (now - lastRefresh < CACHE_DURATION) {
          // Use cached data
          const cachedItems = await dbHelpers.getCachedItems();
          if (cachedItems.length > 0) {
            console.log('Using cached all items');
            setItems(cachedItems);
            setLoading(false);
            setRefreshing(false);
            return;
          }
        }
      }

      const data = await fetchAllItems();
      const normalized = data.map(normalizeItem);
      
      // Cache the items
      await dbHelpers.clearItemsCache();
      await dbHelpers.cacheItems(normalized);
      await mmkvHelpers.setLastDataRefresh(Date.now());
      
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems(true); // Force refresh
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
    <AllItemsContext.Provider
      value={{
        items,
        loading,
        refreshing,
        error,
        onRefresh,
        updateItemLikes,
      }}
    >
      {children}
    </AllItemsContext.Provider>
  );
};
