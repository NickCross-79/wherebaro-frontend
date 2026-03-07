import { useState, useEffect, useCallback } from 'react';
import { fetchVotes, voteItem } from '../services/api';
import { useUserActions } from '../contexts/UserActionsContext';

/**
 * Hook for buy/skip voting on an item.
 * @param {string} itemId   - The item's MongoDB _id
 * @param {string|null} uid - Current user's UID
 * @returns {{ buyCount, skipCount, userVote, isVoting, handleVote }}
 */
export const useVote = (itemId, uid) => {
  const { setItemVoteData } = useUserActions();
  const [buyCount, setBuyCount] = useState(0);
  const [skipCount, setSkipCount] = useState(0);
  const [userVote, setUserVote] = useState(null); // 'buy' | 'skip' | null
  const [isVoting, setIsVoting] = useState(false);

  // Helper that sets local state AND pushes to shared context
  const applyVoteCounts = useCallback((buy, skip) => {
    setBuyCount(buy);
    setSkipCount(skip);
    if (itemId) setItemVoteData(itemId, buy, skip);
  }, [itemId, setItemVoteData]);

  // Load votes on mount / when itemId or uid changes
  useEffect(() => {
    if (!itemId) return;
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchVotes(itemId);
        if (cancelled) return;

        applyVoteCounts(data.buyCount ?? 0, data.skipCount ?? 0);

        if (uid && Array.isArray(data.votes)) {
          const mine = data.votes.find((v) => String(v.uid) === String(uid));
          setUserVote(mine ? mine.voteType : null);
        }
      } catch (err) {
        console.error('Failed to load votes', { itemId, err });
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [itemId, uid]);

  /**
   * Cast or switch a vote. Tapping the same option again is a no-op
   * (server uses upsert so toggling off isn't supported).
   */
  const handleVote = useCallback(async (type) => {
    if (!uid || isVoting || type === userVote) return;
    setIsVoting(true);

    const prevUserVote = userVote;
    const prevBuy = buyCount;
    const prevSkip = skipCount;

    // Optimistic update
    setUserVote(type);
    const newBuy  = type === 'buy'  ? prevBuy + 1  : (prevUserVote === 'buy'  ? Math.max(prevBuy - 1, 0) : prevBuy);
    const newSkip = type === 'skip' ? prevSkip + 1 : (prevUserVote === 'skip' ? Math.max(prevSkip - 1, 0) : prevSkip);
    applyVoteCounts(newBuy, newSkip);

    try {
      await voteItem(itemId, uid, type);
    } catch (err) {
      console.error('Failed to cast vote', { itemId, type, err });
      // Revert on failure
      setUserVote(prevUserVote);
      applyVoteCounts(prevBuy, prevSkip);
    } finally {
      setIsVoting(false);
    }
  }, [uid, isVoting, userVote, buyCount, skipCount, itemId, applyVoteCounts]);

  return { buyCount, skipCount, userVote, isVoting, handleVote };
};
