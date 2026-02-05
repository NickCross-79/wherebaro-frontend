/**
 * Notification service for handling local notifications
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getNotificationSettings } from '../utils/userStorage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Request notification permissions
 * @returns {Promise<boolean>} Whether permissions were granted
 */
export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions denied');
      return false;
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

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Send a local notification that Baro has arrived
 */
export const sendBaroArrivalNotification = async () => {
  try {
    // Check if notifications are enabled in settings
    const settings = await getNotificationSettings();
    if (!settings.notifications) {
      console.log('Notifications disabled in settings');
      return;
    }

    // Send the notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🎭 Baro Ki'Teer Has Arrived!",
        body: 'The Void Trader is here with new items. Check what he brought!',
        data: { type: 'baro_arrival' },
        sound: true,
      },
      trigger: null, // Send immediately
    });

    console.log('Baro arrival notification sent');
  } catch (error) {
    console.error('Error sending Baro arrival notification:', error);
  }
};

/**
 * Send a notification about wishlist items being available
 * @param {number} itemCount - Number of wishlist items available
 */
export const sendWishlistNotification = async (itemCount) => {
  try {
    const settings = await getNotificationSettings();
    if (!settings.wishlistAlerts) {
      console.log('Wishlist alerts disabled in settings');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⭐ Wishlist Items Available!',
        body: `Baro brought ${itemCount} item${itemCount > 1 ? 's' : ''} from your wishlist!`,
        data: { type: 'wishlist_alert' },
        sound: true,
      },
      trigger: null,
    });

    console.log('Wishlist notification sent');
  } catch (error) {
    console.error('Error sending wishlist notification:', error);
  }
};

export default {
  requestNotificationPermissions,
  sendBaroArrivalNotification,
  sendWishlistNotification,
};
