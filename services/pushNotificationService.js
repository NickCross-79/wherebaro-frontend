/**
 * Push notification service for Expo Push Notifications
 */
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { storageHelpers } from '../utils/storage';
import { registerPushToken } from './api';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Register for push notifications and send token to backend
 * @returns {Promise<string|null>} The Expo push token or null if failed
 */
export const registerForPushNotifications = async () => {
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
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;
    console.log('Device push token:', token);

    // Check if token changed
    const storedToken = await storageHelpers.get('expoPushToken');
    if (storedToken === token) {
      console.log('Push token unchanged, skipping registration');
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
      await registerPushToken(token, deviceId);
      console.log('Push token registered successfully');
    } catch (backendError) {
      console.error('Failed to register token with backend:', backendError);
      // Don't store token if backend registration failed
      throw backendError;
    }
    
    // Store token locally only after successful backend registration
    await storageHelpers.set('expoPushToken', token);
    
    console.log('Push token stored locally');
    return token;

  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
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
    console.log('Push token unregistered');
  } catch (error) {
    console.error('Error unregistering push token:', error);
  }
};
