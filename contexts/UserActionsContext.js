import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { secureStorage } from '../utils/storage';

const STORAGE_KEY_LIKED    = 'user_liked_items';
const STORAGE_KEY_REVIEWED = 'user_reviewed_items';
const STORAGE_KEY_VOTED    = 'user_voted_items'; // { [itemId]: 'buy' | 'skip' }
const STORAGE_KEY_OWNED    = 'user_owned_items';

const UserActionsContext = createContext({
  hasLiked:     () => false,
  hasReviewed:  () => false,
  isOwned:      () => false,
  markLiked:    () => {},
  markReviewed: () => {},
  markOwned:    () => {},
  getVoteType:  () => null,
  markVoted:    () => {},
});

export function UserActionsProvider({ children }) {
  const [likedIds,    setLikedIds]    = useState(new Set());
  const [reviewedIds, setReviewedIds] = useState(new Set());
  const [ownedIds,    setOwnedIds]    = useState(new Set());
  const [votedMap,    setVotedMap]    = useState({});

  // Load persisted sets on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [likedRaw, reviewedRaw, ownedRaw, votedRaw] = await Promise.all([
          secureStorage.getItem(STORAGE_KEY_LIKED),
          secureStorage.getItem(STORAGE_KEY_REVIEWED),
          secureStorage.getItem(STORAGE_KEY_OWNED),
          secureStorage.getItem(STORAGE_KEY_VOTED),
        ]);
        if (likedRaw)    setLikedIds(new Set(JSON.parse(likedRaw)));
        if (reviewedRaw) setReviewedIds(new Set(JSON.parse(reviewedRaw)));
        if (ownedRaw)    setOwnedIds(new Set(JSON.parse(ownedRaw)));
        if (votedRaw)    setVotedMap(JSON.parse(votedRaw));
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

  const markOwned = useCallback((itemId, owned) => {
    const id = String(itemId);
    setOwnedIds(prev => {
      const next = new Set(prev);
      if (owned) next.add(id); else next.delete(id);
      secureStorage.setItem(STORAGE_KEY_OWNED, JSON.stringify([...next])).catch(() => {});
      return next;
    });
  }, []);

  const hasLiked    = useCallback((itemId) => likedIds.has(String(itemId)),    [likedIds]);
  const hasReviewed = useCallback((itemId) => reviewedIds.has(String(itemId)), [reviewedIds]);
  const isOwned     = useCallback((itemId) => ownedIds.has(String(itemId)),    [ownedIds]);

  const getVoteType = useCallback((itemId) => votedMap[String(itemId)] ?? null, [votedMap]);

  const markVoted = useCallback((itemId, voteType) => {
    const id = String(itemId);
    setVotedMap(prev => {
      const next = { ...prev };
      if (voteType) {
        next[id] = voteType;
      } else {
        delete next[id];
      }
      secureStorage.setItem(STORAGE_KEY_VOTED, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  return (
    <UserActionsContext.Provider value={{
      hasLiked, hasReviewed, isOwned, markLiked, markReviewed, markOwned,
      getVoteType, markVoted,
    }}>
      {children}
    </UserActionsContext.Provider>
  );
}

export const useUserActions = () => useContext(UserActionsContext);
