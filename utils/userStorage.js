import { mmkvHelpers } from '../storage/storageManager';

/**
 * Get the current user's UID (generated on first launch)
 */
export const getCurrentUID = () => {
  return mmkvHelpers.getOrCreateUID();
};

/**
 * Get the current username
 */
export const getCurrentUsername = () => {
  return mmkvHelpers.getUsername();
};

/**
 * Set the current username
 */
export const setCurrentUsername = (username) => {
  mmkvHelpers.setUsername(username);
};

/**
 * Check if this is the first launch
 */
export const isFirstLaunch = () => {
  return mmkvHelpers.getIsFirstLaunch();
};

/**
 * Get the last time Baro was checked
 */
export const getLastBaroCheck = () => {
  return mmkvHelpers.getLastBaroCheck();
};

/**
 * Get the last data refresh time
 */
export const getLastDataRefresh = () => {
  return mmkvHelpers.getLastDataRefresh();
};

/**
 * Get app settings
 */
export const getAppSettings = () => {
  return {
    theme: mmkvHelpers.getTheme(),
    language: mmkvHelpers.getLanguage(),
  };
};

/**
 * Update app settings
 */
export const updateAppSettings = (settings) => {
  if (settings.theme) {
    mmkvHelpers.setTheme(settings.theme);
  }
  if (settings.language) {
    mmkvHelpers.setLanguage(settings.language);
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
