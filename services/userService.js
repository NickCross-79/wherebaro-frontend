/**
 * User service - handles user-related API calls
 */
import { buildUrl, apiFetch } from './apiConfig';

/**
 * Register a push notification token
 * @param {string} token - Expo push token
 * @returns {Promise<Object>}
 */
export const registerPushToken = async (token) => {
  const url = buildUrl('/registerPushToken');
  return apiFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });
};

/**
 * Remove a push notification token
 * @param {string} token - Expo push token
 * @returns {Promise<Object>}
 */
export const removePushToken = async (token) => {
  const url = buildUrl('/removePushToken');
  return apiFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });
};

export default {
  registerPushToken,
  removePushToken,
};
