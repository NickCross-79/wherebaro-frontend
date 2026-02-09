import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { dbHelpers } from '../utils/storage';
import { useItemLikesSync, useItemReviewCountSync, useItemWishlistCountSync } from '../hooks/useItemFieldSync';
import { storageHelpers } from '../utils/storage';
import { addWishlistPushToken, removeWishlistPushToken } from '../services/api';
import { WISHLIST_THROTTLE_MS } from '../constants/items';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoaded, setWishlistLoaded] = useState(false);

  // Load wishlist from SQLite on mount
  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const items = await dbHelpers.getWishlistItems();
      const ids = await dbHelpers.getWishlistIds();
      setWishlistItems(items);
      setWishlistIds(ids);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setWishlistIds([]);
      setWishlistItems([]);
    } finally {
      setWishlistLoaded(true);
    }
  };

  // ── Throttled backend sync ──────────────────────────────────────────
  // Tracks per-item pending sync so rapid toggles collapse into one call.
  // Local state (SQLite + React) updates immediately; only the backend
  // push-token call is debounced.
  const syncThrottleRef = useRef({}); // { [itemId]: { timerId, pendingAction, inFlight } }

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      Object.values(syncThrottleRef.current).forEach((entry) => {
        if (entry.timerId) clearTimeout(entry.timerId);
      });
    };
  }, []);

  const sendWishlistSync = async (itemId, isAdding) => {
    try {
      const wishlistAlertsEnabled = await storageHelpers.getBoolean('wishlistAlertsEnabled', true);
      const pushToken = await storageHelpers.get('expoPushToken');
      const tokenToSend = wishlistAlertsEnabled && pushToken ? pushToken : null;
      if (isAdding) {
        await addWishlistPushToken(itemId, tokenToSend);
      } else {
        await removeWishlistPushToken(itemId, tokenToSend);
      }
    } catch (error) {
      console.warn('Failed to sync wishlist push token:', error);
    }
  };

  const flushWishlistSync = async (itemId) => {
    const throttle = syncThrottleRef.current[itemId];
    if (!throttle || throttle.inFlight) return;

    const action = throttle.pendingAction;
    if (action === null || action === undefined) return;

    throttle.pendingAction = null;
    throttle.inFlight = true;

    try {
      await sendWishlistSync(itemId, action);
    } finally {
      throttle.inFlight = false;
      // If another toggle happened while in-flight, schedule again
      if (throttle.pendingAction !== null && throttle.pendingAction !== undefined) {
        scheduleWishlistSync(itemId);
      }
    }
  };

  const scheduleWishlistSync = (itemId) => {
    const throttle = syncThrottleRef.current[itemId];
    if (!throttle) return;
    if (throttle.timerId) return; // already scheduled

    throttle.timerId = setTimeout(() => {
      throttle.timerId = null;
      void flushWishlistSync(itemId);
    }, WISHLIST_THROTTLE_MS);
  };

  const enqueueWishlistSync = (itemId, isAdding) => {
    if (!syncThrottleRef.current[itemId]) {
      syncThrottleRef.current[itemId] = { timerId: null, pendingAction: null, inFlight: false };
    }
    const throttle = syncThrottleRef.current[itemId];
    throttle.pendingAction = isAdding;

    if (throttle.inFlight) {
      scheduleWishlistSync(itemId);
      return;
    }

    // Fire immediately if no recent call, otherwise schedule
    if (!throttle.timerId) {
      throttle.pendingAction = null;
      throttle.inFlight = true;
      sendWishlistSync(itemId, isAdding)
        .finally(() => {
          throttle.inFlight = false;
          if (throttle.pendingAction !== null && throttle.pendingAction !== undefined) {
            scheduleWishlistSync(itemId);
          }
        });
    }
  };

  const toggleWishlist = useCallback(async (item) => {
    const itemId = item?.id || item?._id;
    if (!itemId) {
      return;
    }

    try {
      const isAlready = wishlistIds.includes(itemId);

      if (isAlready) {
        // Remove from wishlist
        await dbHelpers.removeFromWishlist(itemId);
        setWishlistIds((prev) => prev.filter((id) => id !== itemId));
        setWishlistItems((prev) => prev.filter((wishlistItem) => (wishlistItem?.id || wishlistItem?._id) !== itemId));
      } else {
        // Add to wishlist with updated wishlistCount
        const updatedItem = { ...item, wishlistCount: (item.wishlistCount || 0) + 1 };
        await dbHelpers.addToWishlist(updatedItem);
        setWishlistIds((prev) => [...prev, itemId]);
        setWishlistItems((prev) => [...prev, updatedItem]);
      }

      // Throttled backend sync — collapses rapid toggles into one call
      enqueueWishlistSync(itemId, !isAlready);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  }, [wishlistIds]);

  const isInWishlist = useCallback((itemId) => {
    return wishlistIds.includes(itemId);
  }, [wishlistIds]);

  const getWishlistCount = useCallback((currentInventory) => {
    if (!currentInventory || currentInventory.length === 0) return 0;

    // Count how many wishlist items are in current inventory
    return currentInventory.filter(item => wishlistIds.includes(item.id || item._id)).length;
  }, [wishlistIds]);

  const updateWishlistLikes = useItemLikesSync(setWishlistItems);
  const updateWishlistReviewCount = useItemReviewCountSync(setWishlistItems);
  const updateWishlistItemWishlistCount = useItemWishlistCountSync(setWishlistItems);

  const contextValue = useMemo(
    () => ({
      wishlistIds,
      wishlistItems,
      wishlistLoaded,
      toggleWishlist,
      isInWishlist,
      getWishlistCount,
      updateWishlistLikes,
      updateWishlistReviewCount,
      updateWishlistItemWishlistCount,
    }),
    [wishlistIds, wishlistItems, wishlistLoaded, toggleWishlist, isInWishlist, getWishlistCount, updateWishlistLikes, updateWishlistReviewCount, updateWishlistItemWishlistCount]
  );

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
};
