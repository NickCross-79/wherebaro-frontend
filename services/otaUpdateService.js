/**
 * OTA update checks (expo-updates).
 * By default expo-updates only checks on a cold start, so users who
 * background/foreground the app without a full relaunch never receive
 * updates. This adds a check on every foreground resume — the update is
 * downloaded silently and applied on the next app launch, no reload
 * forced mid-session.
 */
import * as Updates from 'expo-updates';
import logger from '../utils/logger';

let checking = false;

export const checkForOtaUpdate = async () => {
  if (!Updates.isEnabled || checking) return;

  checking = true;
  try {
    const { isAvailable } = await Updates.checkForUpdateAsync();
    if (isAvailable) {
      await Updates.fetchUpdateAsync();
      logger.log('OTA update downloaded — will apply on next launch');
    }
  } catch (error) {
    logger.warn('OTA update check failed:', error.message);
  } finally {
    checking = false;
  }
};
