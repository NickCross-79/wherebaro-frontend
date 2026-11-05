/**
 * Vote API service — buy/skip voting for current Baro items.
 */
import { buildUrl, apiPost } from './apiConfig';

const ENDPOINTS = {
  GET_VOTES: buildUrl('getVotes'),
  VOTE_ITEM: buildUrl('voteItem'),
  REMOVE_VOTE: buildUrl('removeVote'),
};

// In-memory cache: { [itemId]: { data, timestamp } }
const votesCache = new Map();
const VOTES_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

/**
 * Invalidate the votes cache for a specific item.
 */
export const invalidateVotesCache = (itemId) => {
  votesCache.delete(itemId);
};

/**
 * Fetch votes for an item (cached 2 min).
 * @param {string} itemId
 * @param {string} [uid] - This device's uid, used only to mark its own entries
 * @returns {Promise<{ buyCount: number, skipCount: number, votes: Array }>}
 */
export const fetchVotes = async (itemId, uid) => {
  const cached = votesCache.get(itemId);
  if (cached && Date.now() - cached.timestamp < VOTES_CACHE_TTL) {
    return cached.data;
  }
  // POST so this device's uid travels in the body, not the (logged) URL. The
  // backend uses it only to mark which entries are ours (isOwn).
  const data = await apiPost(ENDPOINTS.GET_VOTES, { item_id: itemId, uid });
  votesCache.set(itemId, { data, timestamp: Date.now() });
  return data;
};

/**
 * Cast or change a vote.
 * @param {string} itemId
 * @param {string} uid
 * @param {'buy'|'skip'} voteType
 */
export const voteItem = async (itemId, uid, voteType) => {
  invalidateVotesCache(itemId);
  return apiPost(ENDPOINTS.VOTE_ITEM, { item_oid: itemId, uid, voteType });
};

/**
 * Remove a user's vote from an item.
 * @param {string} itemId
 * @param {string} uid
 */
export const removeVote = async (itemId, uid) => {
  invalidateVotesCache(itemId);
  return apiPost(ENDPOINTS.REMOVE_VOTE, { item_oid: itemId, uid });
};
