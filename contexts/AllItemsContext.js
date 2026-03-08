import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { fetchAllItems } from '../services/api';
import { dbHelpers, storageHelpers } from '../utils/storage';
import { normalizeItem } from '../utils/normalizeItem';
import { CACHE_DURATION_MS } from '../constants/items';
import { useItemLikesSync, useItemReviewCountSync, useItemWishlistCountSync, useItemVoteSync } from '../hooks/useItemFieldSync';
import logger from '../utils/logger';

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
      logger.debug('AllItems', `fetchItems called (forceRefresh=${forceRefresh})`);
      setError(null);

      // Always try to load cache first on initial launch
      if (!forceRefresh) {
        const cachedItems = await dbHelpers.getCachedItems();
        if (cachedItems.length > 0) {
          const hasOfferingDates = cachedItems.some(
            (cached) => Array.isArray(cached?.offeringDates) && cached.offeringDates.length > 0
          );
          if (hasOfferingDates) {
            logger.debug('AllItems', `Showing cached items (${cachedItems.length} items)`);
            setItems(cachedItems);
            setLoading(false);

            // Check if cache is still fresh
            const lastRefresh = await storageHelpers.getLastDataRefresh();
            const now = Date.now();
            if (now - lastRefresh < CACHE_DURATION_MS) {
              logger.debug('AllItems', 'Cache is fresh, skipping API fetch');
              setRefreshing(false);
              return;
            }

            // Cache is stale — refresh in background while showing cached data
            logger.debug('AllItems', 'Cache is stale, refreshing in background...');
            try {
              const data = await fetchAllItems();
              const normalized = data.map(normalizeItem);
              logger.debug('AllItems', `Background update: ${normalized.length} items from API`);
              await dbHelpers.cacheItems(normalized);
              await storageHelpers.setLastDataRefresh(Date.now());
              setItems(normalized);
            } catch (bgErr) {
              logger.error('Background refresh failed, keeping cached data:', bgErr);
            }
            setRefreshing(false);
            return;
          }
        }
      }

      logger.debug('AllItems', 'Fetching from backend API...');
      const data = await fetchAllItems();
      const normalized = data.map(normalizeItem);
      logger.debug('AllItems', `Received ${normalized.length} items from API, caching...`);
      
      // Cache the items (INSERT OR REPLACE handles updates, no need to clear first)
      await dbHelpers.cacheItems(normalized);
      await storageHelpers.setLastDataRefresh(Date.now());
      
      logger.debug('AllItems', `Cache updated with ${normalized.length} items`);
      setItems(normalized);
    } catch (err) {
      logger.error('Error fetching items:', err);
      setError(err.message);
      
      // Fall back to cache on error
      try {
        const cachedItems = await dbHelpers.getCachedItems();
        if (cachedItems.length > 0) {
          logger.log('Using cached all items on error');
          setItems(cachedItems);
        }
      } catch (cacheError) {
        logger.error('Error loading cache:', cacheError);
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

  // Silent background refresh — no loading/refreshing UI state changes
  const refreshInBackground = useCallback(async () => {
    logger.debug('AllItems', 'Starting background refresh...');
    try {
      await fetchItems(true);
      logger.debug('AllItems', 'Background refresh complete');
    } catch (err) {
      logger.error('[AllItems] Background refresh failed:', err);
    }
  }, []);

  const updateItemLikes = useItemLikesSync(setItems);
  const updateItemReviewCount = useItemReviewCountSync(setItems);
  const updateItemWishlistCount = useItemWishlistCountSync(setItems);
  const updateItemVoteCounts = useItemVoteSync(setItems);

  const value = useMemo(
    () => ({
      items,
      loading,
      refreshing,
      error,
      onRefresh,
      refreshInBackground,
      updateItemLikes,
      updateItemReviewCount,
      updateItemWishlistCount,
      updateItemVoteCounts,
    }),
    [items, loading, refreshing, error, onRefresh, refreshInBackground, updateItemLikes, updateItemReviewCount, updateItemWishlistCount, updateItemVoteCounts]
  );

  return <AllItemsContext.Provider value={value}>{children}</AllItemsContext.Provider>;
};
