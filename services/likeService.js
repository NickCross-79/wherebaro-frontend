/**
 * Like API service
 */
import { buildUrl, apiFetch, apiPost } from './apiConfig';

const ENDPOINTS = {
  GET_LIKES: buildUrl('getLikes'),
  LIKE_ITEM: buildUrl('likeItem'),
  UNLIKE_ITEM: buildUrl('unlikeItem'),
};

/**
 * Fetch likes for an item
 * @param {string} itemId - Item ID
 * @returns {Promise<Object>} Likes data
 */
export const fetchLikes = async (itemId) => {
  return apiFetch(`${ENDPOINTS.GET_LIKES}?item_id=${itemId}`);
};

/**
 * Like an item
 * @param {string} itemId - Item ID
 * @param {string} uid - User ID
 * @returns {Promise<Object>} Like result
 */
export const likeItem = async (itemId, uid) => {
  return apiPost(ENDPOINTS.LIKE_ITEM, { item_oid: itemId, uid });
};

/**
 * Unlike an item
 * @param {string} itemId - Item ID
 * @param {string} uid - User ID
 * @returns {Promise<Object>} Unlike result
 */
export const unlikeItem = async (itemId, uid) => {
  return apiPost(ENDPOINTS.UNLIKE_ITEM, { item_oid: itemId, uid });
};

export default {
  fetchLikes,
  likeItem,
  unlikeItem,
};
