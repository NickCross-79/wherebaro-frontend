import React, { createContext, useContext, useState, useEffect } from 'react';
import { dbHelpers } from '../storage/storageManager';

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

  const toggleWishlist = async (item) => {
    const itemId = item?.id || item?._id;
    if (!itemId) {
      return;
    }

    try {
      const isAlready = wishlistIds.includes(itemId);

      if (isAlready) {
        // Remove from wishlist
        await dbHelpers.removeFromWishlist(itemId);
        setWishlistIds(wishlistIds.filter((id) => id !== itemId));
        setWishlistItems(wishlistItems.filter((wishlistItem) => (wishlistItem?.id || wishlistItem?._id) !== itemId));
      } else {
        // Add to wishlist
        await dbHelpers.addToWishlist(item);
        setWishlistIds([...wishlistIds, itemId]);
        setWishlistItems([...wishlistItems, item]);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const isInWishlist = (itemId) => {
    return wishlistIds.includes(itemId);
  };

  const getWishlistCount = (currentInventory) => {
    if (!currentInventory || currentInventory.length === 0) return 0;

    // Count how many wishlist items are in current inventory
    return currentInventory.filter(item => wishlistIds.includes(item.id || item._id)).length;
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistItems,
        wishlistLoaded,
        toggleWishlist,
        isInWishlist,
        getWishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
