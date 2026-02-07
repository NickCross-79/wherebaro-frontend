/**
 * Shared hook for synchronizing item likes across contexts
 * Eliminates duplication of updateItemLikes logic
 */
import { useCallback } from 'react';

/**
 * Create an updateItemLikes function that updates item state in-memory.
 * DB sync is handled once centrally in ItemDetailScreen.syncLikeCount.
 * @param {Function} setItems - State setter function for items array
 * @returns {Function} updateItemLikes function
 */
export const useItemLikesSync = (setItems) => {
  const updateItemLikes = useCallback((itemId, likeCount) => {
    setItems((prevItems) =>
      prevItems.map((current) => {
        const currentId = current?.id || current?._id;
        if (currentId === itemId) {
          return { ...current, likes: likeCount };
        }
        return current;
      })
    );
  }, [setItems]);

  return updateItemLikes;
};

export default useItemLikesSync;
