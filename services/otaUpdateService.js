/**
 * OTA update checks (expo-updates).
 * By default expo-updates only checks on a cold start, so users who
 * background/foreground the app without a full relaunch never receive
 * updates. This adds a check on every foreground resume — the update is
 * downloaded silently and applied on the next app launch, no reload
 * forced mid-session.
 */
import logger from '../utils/logger';

// expo-updates resolves its native module at import time, which throws outright
// when that module isn't in the binary — Expo Go, or a dev build made before
// expo-updates was added. Require it defensively so a missing native module
// leaves OTA checks inert instead of crashing the whole bundle on startup.
let Updates = null;
try {
  Updates = require('expo-updates');
} catch (error) {
  logger.warn('expo-updates native module unavailable — OTA checks disabled');
}

let checking = false;

export const checkForOtaUpdate = async () => {
  if (!Updates?.isEnabled || checking) return;

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
