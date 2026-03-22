/**
 * User service - handles user-related API calls
 */
import { buildUrl, apiFetch } from './apiConfig';

/**
 * Register a push notification token
 * @param {string} token - Expo push token
 * @param {string} deviceId - Device unique ID
 * @param {boolean} [notifyArrival] - Whether to receive arrival notifications
 * @param {boolean} [notifyDeparture] - Whether to receive departure notifications
 * @returns {Promise<Object>}
 */
export const registerPushToken = async (token, deviceId, notifyArrival, notifyDeparture) => {
  const url = buildUrl('/registerPushToken');
  return apiFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, deviceId, notifyArrival, notifyDeparture }),
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
