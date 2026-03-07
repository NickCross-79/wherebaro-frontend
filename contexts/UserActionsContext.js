import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { secureStorage } from '../utils/storage';

const STORAGE_KEY_LIKED    = 'user_liked_items';
const STORAGE_KEY_REVIEWED = 'user_reviewed_items';

const UserActionsContext = createContext({
  hasLiked:         () => false,
  hasReviewed:      () => false,
  markLiked:        () => {},
  markReviewed:     () => {},
  getItemVoteData:  () => null,
  setItemVoteData:  () => {},
});

export function UserActionsProvider({ children }) {
  const [likedIds,    setLikedIds]    = useState(new Set());
  const [reviewedIds, setReviewedIds] = useState(new Set());
  // { [itemId]: { buyCount: number, skipCount: number } }
  const [voteDataMap, setVoteDataMap] = useState({});

  // Load persisted sets on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [likedRaw, reviewedRaw] = await Promise.all([
          secureStorage.getItem(STORAGE_KEY_LIKED),
          secureStorage.getItem(STORAGE_KEY_REVIEWED),
        ]);
        if (likedRaw)    setLikedIds(new Set(JSON.parse(likedRaw)));
        if (reviewedRaw) setReviewedIds(new Set(JSON.parse(reviewedRaw)));
      } catch {}
    };
    load();
  }, []);

  const markLiked = useCallback((itemId, liked) => {
    const id = String(itemId);
    setLikedIds(prev => {
      const next = new Set(prev);
      if (liked) next.add(id); else next.delete(id);
      secureStorage.setItem(STORAGE_KEY_LIKED, JSON.stringify([...next])).catch(() => {});
      return next;
    });
  }, []);

  const markReviewed = useCallback((itemId, reviewed) => {
    const id = String(itemId);
    setReviewedIds(prev => {
      const next = new Set(prev);
      if (reviewed) next.add(id); else next.delete(id);
      secureStorage.setItem(STORAGE_KEY_REVIEWED, JSON.stringify([...next])).catch(() => {});
      return next;
    });
  }, []);

  const hasLiked    = useCallback((itemId) => likedIds.has(String(itemId)),    [likedIds]);
  const hasReviewed = useCallback((itemId) => reviewedIds.has(String(itemId)), [reviewedIds]);

  const setItemVoteData = useCallback((itemId, buyCount, skipCount) => {
    const id = String(itemId);
    setVoteDataMap(prev => ({
      ...prev,
      [id]: { buyCount: buyCount ?? 0, skipCount: skipCount ?? 0 },
    }));
  }, []);

  const getItemVoteData = useCallback((itemId) => {
    return voteDataMap[String(itemId)] ?? null;
  }, [voteDataMap]);

  return (
    <UserActionsContext.Provider value={{
      hasLiked, hasReviewed, markLiked, markReviewed,
      getItemVoteData, setItemVoteData,
    }}>
      {children}
    </UserActionsContext.Provider>
  );
}

export const useUserActions = () => useContext(UserActionsContext);
