import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // Load wishlist from storage on mount
  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const stored = await AsyncStorage.getItem('wishlist');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Legacy format: array of ids or array of item objects
          if (parsed.length > 0 && typeof parsed[0] === 'object') {
            const ids = parsed
              .map((item) => item?.id || item?._id)
              .filter(Boolean);
            setWishlistItems(parsed);
            setWishlistIds(ids);
          } else {
            setWishlistIds(parsed);
            setWishlistItems([]);
          }
        } else if (parsed && typeof parsed === 'object') {
          const ids = Array.isArray(parsed.ids) ? parsed.ids : [];
          const items = Array.isArray(parsed.items) ? parsed.items : [];
          setWishlistIds(ids);
          setWishlistItems(items);
        } else {
          setWishlistIds([]);
          setWishlistItems([]);
          await AsyncStorage.setItem('wishlist', JSON.stringify({ ids: [], items: [] }));
        }
      } else {
        setWishlistIds([]);
        setWishlistItems([]);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setWishlistIds([]);
      setWishlistItems([]);
    } finally {
      setWishlistLoaded(true);
    }
  };

  const saveWishlist = async (ids, items) => {
    try {
      await AsyncStorage.setItem('wishlist', JSON.stringify({ ids, items }));
    } catch (error) {
      console.error('Error saving wishlist:', error);
    }
  };

  const toggleWishlist = (item) => {
    const itemId = item?.id || item?._id;
    if (!itemId) {
      return;
    }

    setWishlistIds((prevIds) => {
      const isAlready = prevIds.includes(itemId);
      const newIds = isAlready ? prevIds.filter((id) => id !== itemId) : [...prevIds, itemId];

      setWishlistItems((prevItems) => {
        const newItems = isAlready
          ? prevItems.filter((wishlistItem) => (wishlistItem?.id || wishlistItem?._id) !== itemId)
          : [...prevItems, item];
        saveWishlist(newIds, newItems);
        return newItems;
      });

      return newIds;
    });
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
