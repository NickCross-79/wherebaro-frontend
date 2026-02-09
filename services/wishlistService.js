/**
 * Wishlist push token API service
 * Syncs wishlist changes with the backend so users get
 * notified when Baro brings a wishlisted item.
 */
import { buildUrl, apiPost } from './apiConfig';

const ENDPOINTS = {
  ADD_WISHLIST_PUSH_TOKEN: buildUrl('addWishlistPushToken'),
  REMOVE_WISHLIST_PUSH_TOKEN: buildUrl('removeWishlistPushToken'),
};

/**
 * Add to an item's wishlist count (and optionally register push token)
 * @param {string} itemId - Item MongoDB _id
 * @param {string|null} pushToken - Expo push token (optional)
 * @returns {Promise<Object>}
 */
export const addWishlistPushToken = async (itemId, pushToken = null) => {
  return apiPost(ENDPOINTS.ADD_WISHLIST_PUSH_TOKEN, {
    item_oid: itemId,
    ...(pushToken && { pushToken }),
  });
};

/**
 * Remove from an item's wishlist count (and optionally unregister push token)
 * @param {string} itemId - Item MongoDB _id
 * @param {string|null} pushToken - Expo push token (optional)
 * @returns {Promise<Object>}
 */
export const removeWishlistPushToken = async (itemId, pushToken = null) => {
  return apiPost(ENDPOINTS.REMOVE_WISHLIST_PUSH_TOKEN, {
    item_oid: itemId,
    ...(pushToken && { pushToken }),
  });
};

export default {
  addWishlistPushToken,
  removeWishlistPushToken,
};
