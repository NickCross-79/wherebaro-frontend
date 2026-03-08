import { StatusBar } from 'expo-status-bar';
import { View, Text, ScrollView, TouchableOpacity, Switch, TextInput, Alert, Linking, Modal, Pressable } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useRef, useState } from 'react';
import { useScrollToTop } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentUsername, setCurrentUsername, getNotificationSettings, updateNotificationSettings } from '../utils/userStorage';
import { storageHelpers } from '../utils/storage';
import { registerForPushNotifications, unregisterPushToken, bulkSyncWishlistPushToken } from '../services/api';
import { getLocalPushToken, unregisterFromBackend } from '../services/pushNotificationService';
import { useWishlist } from '../contexts/WishlistContext';
import { useNewVersion } from '../contexts/NewVersionContext';
import styles from '../styles/screens/SettingsScreen.styles';
import { colors } from '../constants/theme';

export default function SettingsScreen({ navigation }) {
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);
  const { wishlistIds } = useWishlist();
  const { hasNewVersion, markVersionSeen, APP_VERSION, CHANGELOG } = useNewVersion();
  const [notifications, setNotifications] = useState(true);
  const [wishlistAlerts, setWishlistAlerts] = useState(true);
  const [displayName, setDisplayName] = useState('Anonymous');
  const [deviceId, setDeviceId] = useState('');
  const [deviceIdInfoVisible, setDeviceIdInfoVisible] = useState(false);
  const [versionInfoVisible, setVersionInfoVisible] = useState(false);
  const insets = useSafeAreaInsets();

  // Load username and settings on mount
  useEffect(() => {
    const loadUsername = async () => {
      const username = await getCurrentUsername();
      setDisplayName(username);
    };
    const loadSettings = async () => {
      const settings = await getNotificationSettings();

      // Check actual permission state — override stored prefs if denied
      if (Device.isDevice) {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
          setNotifications(false);
          setWishlistAlerts(false);
          if (settings.notifications || settings.wishlistAlerts) {
            await updateNotificationSettings({ notifications: false, wishlistAlerts: false });
          }
          return;
        }
      }
      setNotifications(settings.notifications);
      setWishlistAlerts(settings.wishlistAlerts);
    };
    const loadDeviceId = async () => {
      const uid = await storageHelpers.getOrCreateUID();
      setDeviceId(uid);
    };
    loadUsername();
    loadSettings();
    loadDeviceId();
  }, []);

  /**
   * Request notification permissions. Returns true if granted.
   * If the OS won't show a prompt (previously denied), directs user to settings.
   */
  const requestNotificationPermission = async () => {
    if (!Device.isDevice) {
      // On simulator, just allow — no real push but preference is saved
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      return true;
    }

    // Permission denied — OS may not show the prompt again
    Alert.alert(
      'Notifications Disabled',
      'Please enable notifications for this app in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ],
    );
    return false;
  };

  // Save username when it changes
  const handleDisplayNameChange = async (newName) => {
    const sanitized = newName.replace(/ /g, '');
    setDisplayName(sanitized);
    await setCurrentUsername(sanitized);
  };

  const handleNotificationsChange = async (value) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) return;
      setNotifications(true);
      await updateNotificationSettings({ notifications: true });
      registerForPushNotifications().catch(() => {});
    } else {
      setNotifications(false);
      await updateNotificationSettings({ notifications: false });
      if (!wishlistAlerts) {
        // No alerts at all — full unregister (backend + local)
        unregisterPushToken().catch(() => {});
      } else {
        // Wishlist still needs local token — only remove from backend
        unregisterFromBackend().catch(() => {});
      }
    }
  };

  const handleWishlistAlertsChange = async (value) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) return;
      setWishlistAlerts(true);
      await updateNotificationSettings({ wishlistAlerts: true });
      // Get token locally — don't register with backend general push tokens
      // (that's only for Baro alerts)
      const token = await getLocalPushToken();
      // Bulk add push token to all existing wishlisted items
      if (token && wishlistIds.length > 0) {
        bulkSyncWishlistPushToken(wishlistIds, token, 'add').catch((err) =>
          console.warn('Failed to bulk add wishlist push tokens:', err)
        );
      }
    } else {
      setWishlistAlerts(false);
      await updateNotificationSettings({ wishlistAlerts: false });
      // Bulk remove push token from all wishlisted items
      const pushToken = await storageHelpers.get('expoPushToken');
      if (pushToken && wishlistIds.length > 0) {
        bulkSyncWishlistPushToken(wishlistIds, pushToken, 'remove').catch((err) =>
          console.warn('Failed to bulk remove wishlist push tokens:', err)
        );
      }
      // Only unregister token if baro alerts are also off
      if (!notifications) {
        unregisterPushToken().catch(() => {});
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>SETTINGS</Text>
          <Text style={styles.headerSubtitle}>Customize your experience</Text>
        </View>
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={versionInfoVisible}
        onRequestClose={() => setVersionInfoVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setVersionInfoVisible(false)}
          />
          <View style={styles.modalBox}>
            <View style={styles.changelogTitleRow}>
              <Text style={styles.modalTitle}>What's New</Text>
              {CHANGELOG[0] && (
                <>
                  <Text style={styles.changelogVersion}>v{CHANGELOG[0].version}</Text>
                  <Text style={styles.changelogDate}>{CHANGELOG[0].date}</Text>
                </>
              )}
            </View>
            <ScrollView style={styles.changelogScroll} showsVerticalScrollIndicator={false}>
              {CHANGELOG.map((entry) => (
                <View key={entry.version} style={styles.changelogEntry}>
                  {entry.summary ? (
                    <Text style={styles.changelogSummary}>{entry.summary}</Text>
                  ) : null}
                  {entry.changes.map((change, i) => (
                    <View key={i} style={styles.changelogRow}>
                      <Text style={styles.changelogBullet}>•</Text>
                      <Text style={styles.changelogChange}>{change}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
            <View style={[styles.modalButtonRow, { marginTop: 20 }]}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => setVersionInfoVisible(false)}
              >
                <Text style={styles.modalButtonTextPrimary}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={deviceIdInfoVisible}
        onRequestClose={() => setDeviceIdInfoVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setDeviceIdInfoVisible(false)}>
          <Pressable style={styles.modalBox} onPress={() => {}}>
            <Text style={styles.modalTitle}>Your Device ID</Text>
            <Text style={styles.modalBody}>
              {'A randomly-generated identifier assigned to your device. It is used to save your votes, likes, and reviews anonymously across sessions — no account required.\n\nThis is your unique device ID:'}
            </Text>
            <Text style={styles.modalDeviceId} numberOfLines={2} selectable>{deviceId}</Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => { Clipboard.setStringAsync(deviceId); setDeviceIdInfoVisible(false); }}
              >
                <Text style={styles.modalButtonTextSecondary}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => setDeviceIdInfoVisible(false)}
              >
                <Text style={styles.modalButtonTextPrimary}>Got it</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
      >
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Baro Alerts</Text>
              <Text style={styles.settingDescription}>
                Get notified when Baro arrives or leaves
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={handleNotificationsChange}
              trackColor={{ false: colors.controlOff, true: colors.accent }}
              thumbColor={notifications ? colors.text : colors.textSecondary}
              accessibilityLabel="Baro Alerts"
              accessibilityRole="switch"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Wishlist Alerts</Text>
              <Text style={styles.settingDescription}>
                Notify me when Baro brings wishlist items
              </Text>
            </View>
            <Switch
              value={wishlistAlerts}
              onValueChange={handleWishlistAlertsChange}
              trackColor={{ false: colors.controlOff, true: colors.accent }}
              thumbColor={wishlistAlerts ? colors.text : colors.textSecondary}
              accessibilityLabel="Wishlist Alerts"
              accessibilityRole="switch"
            />
          </View>
        </View>

        {/* General Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>

          <View style={styles.settingItemColumn}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Display Name</Text>
              <Text style={styles.settingDescription}>
                This name will appear on your reviews
              </Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={displayName}
              onChangeText={handleDisplayNameChange}
              placeholder="Enter display name"
              placeholderTextColor={colors.textDim}
              maxLength={24}
              accessibilityLabel="Display Name"
            />
          </View>
          
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            accessibilityLabel={`Version ${APP_VERSION}`}
            accessibilityRole="button"
            onPress={() => {
              setVersionInfoVisible(true);
              if (hasNewVersion) markVersionSeen();
            }}
          >
            <View style={styles.settingLabelRow}>
              <Text style={styles.settingLabel}>Version</Text>
              {hasNewVersion && (
                <Ionicons name="alert-circle" size={18} color={colors.accent} style={{ marginBottom: 4 }} />
              )}
            </View>
            <Text style={styles.settingValue}>{APP_VERSION}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            accessibilityLabel="Device ID"
            accessibilityRole="button"
            onPress={() => setDeviceIdInfoVisible(true)}
          >
            <Text style={styles.settingLabel}>Device ID</Text>
            <Text style={styles.settingValue}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('Feedback')}
            accessibilityLabel="Feedback"
            accessibilityRole="button"
          >
            <Text style={styles.settingLabel}>Feedback</Text>
            <Text style={styles.settingValue}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => Linking.openURL('https://privacy.whenbaro.app')}
            accessibilityLabel="Privacy Policy"
            accessibilityRole="link"
          >
            <Text style={styles.settingLabel}>Privacy Policy</Text>
            <Text style={styles.settingValue}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Credits */}
        <View style={styles.credits}>
          <Text style={styles.creditsText}>Made for Tenno by Tenno</Text>
          <Text style={styles.creditsSubtext}>Data sourced from Warframe Wiki</Text>
          <Text style={styles.creditsSubtext}>Powered by the Warframestat API</Text>
          <Text style={styles.creditsDisclaimer}>This app is not affiliated with or endorsed by Digital Extremes.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

