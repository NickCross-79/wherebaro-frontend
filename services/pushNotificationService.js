/**
 * Push notification service for Expo Push Notifications
 */
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { storageHelpers } from '../utils/storage';
import { registerPushToken } from './api';

/**
 * Truncate sensitive data for logging
 */
function truncate(value, maxLength = 20) {
  if (!value || value.length <= maxLength) return value;
  return `${value.substring(0, maxLength)}...`;
}

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Register for push notifications and send token to backend.
 * @param {boolean} [notifyArrival=true] - Whether to receive arrival notifications
 * @param {boolean} [notifyDeparture=true] - Whether to receive departure notifications
 * @returns {Promise<string|null>} The Expo push token or null if failed
 */
export const registerForPushNotifications = async (notifyArrival = true, notifyDeparture = true) => {
  try {
    // Check if physical device
    if (!Device.isDevice) {
      console.log('Push notifications require a physical device');
      return null;
    }

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permissions denied');
      return null;
    }

    // Get Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: '379c5464-62fb-4458-9164-4b3d78449fcd',
    });
    const token = tokenData.data;
    console.log('Device push token:', truncate(token, 30));

    // Check if token is already registered with backend
    const storedToken = await storageHelpers.get('expoPushToken');
    const isRegistered = await storageHelpers.get('pushTokenRegistered');
    if (storedToken === token && isRegistered) {
      console.log('Push token unchanged and already registered, skipping');
      return token;
    }

    // For Android, create notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('baro-alerts', {
        name: 'Baro Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D4A574',
      });
    }

    // Send token to backend
    console.log('Registering push token with backend...');
    try {
      // Get device UID to associate with token
      const deviceId = await storageHelpers.getOrCreateUID();
      await registerPushToken(token, deviceId, notifyArrival, notifyDeparture);
      console.log('Push token registered successfully');
    } catch (backendError) {
      console.error('Failed to register token with backend:', backendError);
      // Don't store token if backend registration failed
      throw backendError;
    }
    
    // Store token locally only after successful backend registration
    await storageHelpers.set('expoPushToken', token);
    await storageHelpers.set('pushTokenRegistered', true);
    
    console.log('Push token stored and registered with backend');
    return token;

  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
};

/**
 * Update notification type preferences on an already-registered token.
 * Lightweight alternative to full re-registration — no permission/token fetch needed.
 * @param {boolean} notifyArrival - Whether to receive arrival notifications
 * @param {boolean} notifyDeparture - Whether to receive departure notifications
 */
export const updateNotificationPreferences = async (notifyArrival, notifyDeparture) => {
  try {
    const token = await storageHelpers.get('expoPushToken');
    if (!token) {
      console.warn('No stored push token — cannot update preferences');
      return;
    }
    const deviceId = await storageHelpers.getOrCreateUID();
    await registerPushToken(token, deviceId, notifyArrival, notifyDeparture);
    console.log(`Notification preferences updated: arrival=${notifyArrival}, departure=${notifyDeparture}`);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
  }
};

/**
 * Get or create a local push token without registering with the backend.
 * Use this when you need a token for item-level notifications (e.g. wishlist)
 * but don't want to register for general push notifications (e.g. Baro alerts).
 * @returns {Promise<string|null>} The Expo push token or null if failed
 */
export const getLocalPushToken = async () => {
  try {
    // Return existing token if available
    const storedToken = await storageHelpers.get('expoPushToken');
    if (storedToken) return storedToken;

    // Check if physical device
    if (!Device.isDevice) {
      console.log('Push notifications require a physical device');
      return null;
    }

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permissions denied');
      return null;
    }

    // Get Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: '379c5464-62fb-4458-9164-4b3d78449fcd',
    });
    const token = tokenData.data;

    // For Android, create notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('baro-alerts', {
        name: 'Baro Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D4A574',
      });
    }

    // Store token locally (no backend registration)
    await storageHelpers.set('expoPushToken', token);
    console.log('Push token obtained and stored locally (not registered with backend)');
    return token;
  } catch (error) {
    console.error('Error getting local push token:', error);
    return null;
  }
};

/**
 * Remove push token from backend but keep it stored locally.
 * Use when disabling Baro alerts but keeping wishlist alerts active.
 */
export const unregisterFromBackend = async () => {
  try {
    const token = await storageHelpers.get('expoPushToken');
    if (!token) return;

    const { removePushToken: removeToken } = await import('./api');
    await removeToken(token);
    await storageHelpers.remove('pushTokenRegistered');
    console.log('Push token unregistered from backend (kept locally)');
  } catch (error) {
    console.error('Error unregistering push token from backend:', error);
  }
};

/**
 * Remove push token from backend (for logout or opt-out)
 */
export const unregisterPushToken = async () => {
  try {
    const token = await storageHelpers.get('expoPushToken');
    if (!token) return;

    // Call backend to remove token
    const { removePushToken: removeToken } = await import('./api');
    await removeToken(token);
    
    await storageHelpers.remove('expoPushToken');
    await storageHelpers.remove('pushTokenRegistered');
    console.log('Push token unregistered');
  } catch (error) {
    console.error('Error unregistering push token:', error);
  }
};
