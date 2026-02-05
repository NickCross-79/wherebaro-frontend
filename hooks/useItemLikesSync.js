/**
 * Shared hook for synchronizing item likes across contexts
 * Eliminates duplication of updateItemLikes logic
 */
import { useCallback } from 'react';
import { dbHelpers } from '../utils/storage';
import logger from '../utils/logger';

/**
 * Create an updateItemLikes function that updates state and syncs to database
 * @param {Function} setItems - State setter function for items array
 * @returns {Function} updateItemLikes function
 */
export const useItemLikesSync = (setItems) => {
  const updateItemLikes = useCallback(async (itemId, likeCount) => {
    // Update state
    setItems((prevItems) =>
      prevItems.map((current) => {
        const currentId = current?.id || current?._id;
        if (currentId === itemId) {
          return { ...current, likes: likeCount };
        }
        return current;
      })
    );

    // Sync to database
    try {
      await dbHelpers.updateItemLikes(itemId, likeCount);
    } catch (error) {
      logger.error('Failed to update cached likes:', error);
    }
  }, [setItems]);

  return updateItemLikes;
};

export default useItemLikesSync;
