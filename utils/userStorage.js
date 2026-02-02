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
 * Get the last time Baro was checked
 */
export const getLastBaroCheck = async () => {
  return await storageHelpers.getLastBaroCheck();
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

export default {
  getCurrentUID,
  getCurrentUsername,
  setCurrentUsername,
  isFirstLaunch,
  getLastBaroCheck,
  getLastDataRefresh,
  getAppSettings,
  updateAppSettings,
};
