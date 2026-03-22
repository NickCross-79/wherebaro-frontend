import { storageHelpers } from './storage';

/**
 * Get the current user's UID (generated on first launch)
 */
export const getCurrentUID = async () => {
  return await storageHelpers.getOrCreateUID();
};

/**
 * Get the current username
 */
export const getCurrentUsername = async () => {
  return await storageHelpers.getUsername();
};

/**
 * Set the current username
 */
export const setCurrentUsername = async (username) => {
  await storageHelpers.setUsername(username);
};

/**
 * Check if this is the first launch
 */
export const isFirstLaunch = async () => {
  return await storageHelpers.getIsFirstLaunch();
};

/**
 * Get the last data refresh time
 */
export const getLastDataRefresh = async () => {
  return await storageHelpers.getLastDataRefresh();
};

/**
 * Get notification-related settings
 */
export const getNotificationSettings = async () => {
  const [arrivalAlerts, departureAlertsRaw, wishlistAlerts, autoRefresh] = await Promise.all([
    storageHelpers.getBoolean('notificationsEnabled', true),
    // null means the key has never been written (pre-split-toggle update)
    storageHelpers.get('departureAlertsEnabled'),
    storageHelpers.getBoolean('wishlistAlertsEnabled', true),
    storageHelpers.getBoolean('autoRefreshEnabled', false),
  ]);

  // If departureAlertsEnabled has never been set, mirror the arrival setting so
  // that users who had Baro Alerts OFF stay fully OFF after the update.
  const departureAlerts = departureAlertsRaw === null || departureAlertsRaw === undefined
    ? arrivalAlerts
    : departureAlertsRaw === true || departureAlertsRaw === 'true';

  return {
    arrivalAlerts,
    departureAlerts,
    wishlistAlerts,
    autoRefresh,
  };
};

/**
 * Update notification-related settings
 */
export const updateNotificationSettings = async (settings) => {
  if (typeof settings.arrivalAlerts === 'boolean') {
    await storageHelpers.setBoolean('notificationsEnabled', settings.arrivalAlerts);
  }
  if (typeof settings.departureAlerts === 'boolean') {
    await storageHelpers.setBoolean('departureAlertsEnabled', settings.departureAlerts);
  }
  if (typeof settings.wishlistAlerts === 'boolean') {
    await storageHelpers.setBoolean('wishlistAlertsEnabled', settings.wishlistAlerts);
  }
  if (typeof settings.autoRefresh === 'boolean') {
    await storageHelpers.setBoolean('autoRefreshEnabled', settings.autoRefresh);
  }
};

export default {
  getCurrentUID,
  getCurrentUsername,
  setCurrentUsername,
  isFirstLaunch,
  getLastDataRefresh,
  getNotificationSettings,
  updateNotificationSettings,
};
