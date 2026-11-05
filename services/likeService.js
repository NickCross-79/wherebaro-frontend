/**
 * Like API service
 */
import { buildUrl, apiPost } from './apiConfig';

const ENDPOINTS = {
  GET_LIKES: buildUrl('getLikes'),
  LIKE_ITEM: buildUrl('likeItem'),
  UNLIKE_ITEM: buildUrl('unlikeItem'),
};

// In-memory cache: { [itemId]: { data, timestamp } }
const likesCache = new Map();
const LIKES_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

/**
 * Invalidate the likes cache for a specific item.
 * Call after liking or unliking.
 */
export const invalidateLikesCache = (itemId) => {
  likesCache.delete(itemId);
};

/**
 * Fetch likes for an item.
 * Results are cached in memory for 2 minutes.
 * @param {string} itemId - Item ID
 * @param {string} [uid] - This device's uid, used only to mark its own entries
 * @returns {Promise<Object>} Likes data
 */
export const fetchLikes = async (itemId, uid) => {
  const cached = likesCache.get(itemId);
  if (cached && Date.now() - cached.timestamp < LIKES_CACHE_TTL) {
    return cached.data;
  }
  // POST so this device's uid travels in the body, not the (logged) URL. The
  // backend uses it only to mark which entries are ours (isOwn).
  const data = await apiPost(ENDPOINTS.GET_LIKES, { item_id: itemId, uid });
  likesCache.set(itemId, { data, timestamp: Date.now() });
  return data;
};

/**
 * Like an item
 * @param {string} itemId - Item ID
 * @param {string} uid - User ID
 * @returns {Promise<Object>} Like result
 */
export const likeItem = async (itemId, uid) => {
  invalidateLikesCache(itemId);
  return apiPost(ENDPOINTS.LIKE_ITEM, { item_oid: itemId, uid });
};

/**
 * Unlike an item
 * @param {string} itemId - Item ID
 * @param {string} uid - User ID
 * @returns {Promise<Object>} Unlike result
 */
export const unlikeItem = async (itemId, uid) => {
  invalidateLikesCache(itemId);
  return apiPost(ENDPOINTS.UNLIKE_ITEM, { item_oid: itemId, uid });
};
