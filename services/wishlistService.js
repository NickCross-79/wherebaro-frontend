/**
 * Wishlist push token API service
 * Syncs wishlist changes with the backend so users get
 * notified when Baro brings a wishlisted item.
 */
import { buildUrl, apiPost } from './apiConfig';

const ENDPOINTS = {
  ADD_WISHLIST_PUSH_TOKEN: buildUrl('addWishlistPushToken'),
  REMOVE_WISHLIST_PUSH_TOKEN: buildUrl('removeWishlistPushToken'),
  BULK_SYNC_WISHLIST_PUSH_TOKEN: buildUrl('bulkSyncWishlistPushToken'),
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

/**
 * Bulk add or remove push token across multiple wishlisted items.
 * Does not change wishlist counts — used for notification preference toggling.
 * @param {string[]} itemIds - Array of item MongoDB _ids
 * @param {string} pushToken - Expo push token
 * @param {'add'|'remove'} action - Whether to add or remove the token
 * @returns {Promise<Object>}
 */
export const bulkSyncWishlistPushToken = async (itemIds, pushToken, action) => {
  return apiPost(ENDPOINTS.BULK_SYNC_WISHLIST_PUSH_TOKEN, {
    item_oids: itemIds,
    pushToken,
    action,
  });
};
