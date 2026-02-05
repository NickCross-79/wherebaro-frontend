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
 * Get app settings
 */
export const getAppSettings = async () => {
  return {
    theme: await storageHelpers.getTheme(),
    language: await storageHelpers.getLanguage(),
  };
};

/**
 * Update app settings
 */
export const updateAppSettings = async (settings) => {
  if (settings.theme) {
    await storageHelpers.setTheme(settings.theme);
  }
  if (settings.language) {
    await storageHelpers.setLanguage(settings.language);
  }
};

/**
 * Get notification-related settings
 */
export const getNotificationSettings = async () => {
  const [notifications, wishlistAlerts, autoRefresh] = await Promise.all([
    storageHelpers.getBoolean('notificationsEnabled', true),
    storageHelpers.getBoolean('wishlistAlertsEnabled', true),
    storageHelpers.getBoolean('autoRefreshEnabled', false),
  ]);

  return {
    notifications,
    wishlistAlerts,
    autoRefresh,
  };
};

/**
 * Update notification-related settings
 */
export const updateNotificationSettings = async (settings) => {
  if (typeof settings.notifications === 'boolean') {
    await storageHelpers.setBoolean('notificationsEnabled', settings.notifications);
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
  getAppSettings,
  updateAppSettings,
  getNotificationSettings,
  updateNotificationSettings,
};
