import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { dbHelpers } from '../utils/storage';

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
        // Add to wishlist
        await dbHelpers.addToWishlist(item);
        setWishlistIds((prev) => [...prev, itemId]);
        setWishlistItems((prev) => [...prev, item]);
      }
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

  const updateWishlistLikes = useCallback(async (itemId, likeCount) => {
    setWishlistItems((prevItems) =>
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
      console.error('Failed to update wishlist likes:', error);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      wishlistIds,
      wishlistItems,
      wishlistLoaded,
      toggleWishlist,
      isInWishlist,
      getWishlistCount,
      updateWishlistLikes,
    }),
    [wishlistIds, wishlistItems, wishlistLoaded, toggleWishlist, isInWishlist, getWishlistCount, updateWishlistLikes]
  );

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
};
