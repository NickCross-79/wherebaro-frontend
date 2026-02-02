import { mmkvHelpers } from './storage';

/**
 * Get the current user's UID (generated on first launch)
 */
export const getCurrentUID = async () => {
  return await mmkvHelpers.getOrCreateUID();
};

/**
 * Get the current username
 */
export const getCurrentUsername = async () => {
  return await mmkvHelpers.getUsername();
};

/**
 * Set the current username
 */
export const setCurrentUsername = async (username) => {
  await mmkvHelpers.setUsername(username);
};

/**
 * Check if this is the first launch
 */
export const isFirstLaunch = async () => {
  return await mmkvHelpers.getIsFirstLaunch();
};

/**
 * Get the last time Baro was checked
 */
export const getLastBaroCheck = async () => {
  return await mmkvHelpers.getLastBaroCheck();
};

/**
 * Get the last data refresh time
 */
export const getLastDataRefresh = async () => {
  return await mmkvHelpers.getLastDataRefresh();
};

/**
 * Get app settings
 */
export const getAppSettings = async () => {
  return {
    theme: await mmkvHelpers.getTheme(),
    language: await mmkvHelpers.getLanguage(),
  };
};

/**
 * Update app settings
 */
export const updateAppSettings = async (settings) => {
  if (settings.theme) {
    await mmkvHelpers.setTheme(settings.theme);
  }
  if (settings.language) {
    await mmkvHelpers.setLanguage(settings.language);
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
