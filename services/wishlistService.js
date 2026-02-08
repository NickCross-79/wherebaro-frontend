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
 * Add the device's push token to an item's wishlist
 * @param {string} itemId - Item MongoDB _id
 * @param {string} pushToken - Expo push token
 * @returns {Promise<Object>}
 */
export const addWishlistPushToken = async (itemId, pushToken) => {
  return apiPost(ENDPOINTS.ADD_WISHLIST_PUSH_TOKEN, {
    item_oid: itemId,
    pushToken,
  });
};

/**
 * Remove the device's push token from an item's wishlist
 * @param {string} itemId - Item MongoDB _id
 * @param {string} pushToken - Expo push token
 * @returns {Promise<Object>}
 */
export const removeWishlistPushToken = async (itemId, pushToken) => {
  return apiPost(ENDPOINTS.REMOVE_WISHLIST_PUSH_TOKEN, {
    item_oid: itemId,
    pushToken,
  });
};

export default {
  addWishlistPushToken,
  removeWishlistPushToken,
};
