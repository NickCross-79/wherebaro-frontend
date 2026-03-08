import { useState, useEffect, useCallback } from 'react';
import { fetchVotes, voteItem, removeVote } from '../services/api';
import { useUserActions } from '../contexts/UserActionsContext';

/**
 * Hook for buy/skip voting on an item.
 * Follows the same pattern as useLike — initialises from item data,
 * confirms from server, optimistic updates with revert on failure.
 *
 * @param {string}   itemId          - The item's MongoDB _id
 * @param {string|null} uid          - Current user's UID
 * @param {Function} syncVoteArrays  - (buy[], skip[]) => void — syncs across contexts + DB
 * @param {string[]} initialBuy      - Item's buy[] array from context
 * @param {string[]} initialSkip     - Item's skip[] array from context
 * @returns {{ buyCount, skipCount, userVote, isVoting, handleVote }}
 */
export const useVote = (itemId, uid, syncVoteArrays, initialBuy = [], initialSkip = []) => {
  const { getVoteType, markVoted } = useUserActions();

  const [buyArr, setBuyArr] = useState(initialBuy);
  const [skipArr, setSkipArr] = useState(initialSkip);
  // Initialise from persisted storage so the button lights up immediately
  const [userVote, setUserVote] = useState(() => getVoteType(itemId));
  const [isVoting, setIsVoting] = useState(false);

  const buyCount = buyArr.length;
  const skipCount = skipArr.length;

  // Helper that sets local state AND syncs across all contexts
  const applyVoteArrays = useCallback((buy, skip) => {
    setBuyArr(buy);
    setSkipArr(skip);
    if (syncVoteArrays) syncVoteArrays(buy, skip);
  }, [syncVoteArrays]);

  // Confirm vote state from server (same pattern as loadLikes in ItemDetailScreen)
  useEffect(() => {
    if (!itemId) return;
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchVotes(itemId);
        if (cancelled) return;

        if (uid && Array.isArray(data.votes)) {
          const mine = data.votes.find((v) => String(v.uid) === String(uid));
          const voteType = mine ? mine.voteType : null;
          setUserVote(voteType);
          if (voteType) markVoted(itemId, voteType);
        }
      } catch (err) {
        console.error('Failed to load votes', { itemId, err });
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [itemId, uid, markVoted]);

  /**
   * Cast or switch a vote. Tapping the same option again is a no-op
   * (server uses upsert so toggling off isn't supported).
   */
  const handleVote = useCallback(async (type) => {
    if (!uid || isVoting) return;
    setIsVoting(true);

    const prevUserVote = userVote;
    const prevBuy = [...buyArr];
    const prevSkip = [...skipArr];

    const placeholder = `optimistic_${uid}`;
    let newBuy = [...buyArr];
    let newSkip = [...skipArr];

    if (type === prevUserVote) {
      // Tapping active vote — remove it
      newBuy = newBuy.filter(id => id !== placeholder && id !== uid);
      newSkip = newSkip.filter(id => id !== placeholder && id !== uid);
      setUserVote(null);
      markVoted(itemId, null);
      applyVoteArrays(newBuy, newSkip);

      try {
        await removeVote(itemId, uid);
      } catch (err) {
        console.error('Failed to remove vote', { itemId, err });
        setUserVote(prevUserVote);
        if (prevUserVote) markVoted(itemId, prevUserVote);
        applyVoteArrays(prevBuy, prevSkip);
      } finally {
        setIsVoting(false);
      }
      return;
    }

    // Switching or casting a new vote
    if (prevUserVote === 'buy') {
      newBuy = newBuy.filter(id => id !== placeholder && id !== uid);
    } else if (prevUserVote === 'skip') {
      newSkip = newSkip.filter(id => id !== placeholder && id !== uid);
    }
    if (type === 'buy') {
      newBuy.push(placeholder);
    } else {
      newSkip.push(placeholder);
    }

    setUserVote(type);
    markVoted(itemId, type);
    applyVoteArrays(newBuy, newSkip);

    try {
      await voteItem(itemId, uid, type);
    } catch (err) {
      console.error('Failed to cast vote', { itemId, type, err });
      setUserVote(prevUserVote);
      if (prevUserVote) markVoted(itemId, prevUserVote);
      applyVoteArrays(prevBuy, prevSkip);
    } finally {
      setIsVoting(false);
    }
  }, [uid, isVoting, userVote, buyArr, skipArr, itemId, applyVoteArrays, markVoted]);

  return { buyCount, skipCount, userVote, isVoting, handleVote };
};
