import { StatusBar } from 'expo-status-bar';
import { View, Text, ScrollView, TouchableOpacity, Switch, TextInput } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useScrollToTop } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCurrentUsername, setCurrentUsername, getNotificationSettings, updateNotificationSettings } from '../utils/userStorage';
import styles from '../styles/screens/SettingsScreen.styles';

export default function SettingsScreen({ navigation }) {
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);
  const [notifications, setNotifications] = useState(true);
  const [wishlistAlerts, setWishlistAlerts] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [displayName, setDisplayName] = useState('Anonymous');
  const insets = useSafeAreaInsets();

  // Load username and settings on mount
  useEffect(() => {
    const loadUsername = async () => {
      const username = await getCurrentUsername();
      setDisplayName(username);
    };
    const loadSettings = async () => {
      const settings = await getNotificationSettings();
      setNotifications(settings.notifications);
      setWishlistAlerts(settings.wishlistAlerts);
      setAutoRefresh(settings.autoRefresh);
    };
    loadUsername();
    loadSettings();
  }, []);

  // Save username when it changes
  const handleDisplayNameChange = async (newName) => {
    setDisplayName(newName);
    await setCurrentUsername(newName);
  };

  const handleNotificationsChange = async (value) => {
    setNotifications(value);
    await updateNotificationSettings({ notifications: value });
  };

  const handleWishlistAlertsChange = async (value) => {
    setWishlistAlerts(value);
    await updateNotificationSettings({ wishlistAlerts: value });
  };

  const handleAutoRefreshChange = async (value) => {
    setAutoRefresh(value);
    await updateNotificationSettings({ autoRefresh: value });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SETTINGS</Text>
        <Text style={styles.headerSubtitle}>Customize your experience</Text>
      </View>

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
              <Text style={styles.settingLabel}>Baro Arrival Alerts</Text>
              <Text style={styles.settingDescription}>
                Get notified when Baro arrives
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={handleNotificationsChange}
              trackColor={{ false: '#2A3442', true: '#D4A574' }}
              thumbColor={notifications ? '#FFFFFF' : '#8B9DC3'}
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
              trackColor={{ false: '#2A3442', true: '#D4A574' }}
              thumbColor={wishlistAlerts ? '#FFFFFF' : '#8B9DC3'}
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
              placeholderTextColor="#5A6B8C"
              maxLength={24}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto Refresh</Text>
              <Text style={styles.settingDescription}>
                Automatically refresh inventory
              </Text>
            </View>
            <Switch
              value={autoRefresh}
              onValueChange={handleAutoRefreshChange}
              trackColor={{ false: '#2A3442', true: '#D4A574' }}
              thumbColor={autoRefresh ? '#FFFFFF' : '#8B9DC3'}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Version</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('Feedback')}
          >
            <Text style={styles.settingLabel}>Feedback</Text>
            <Text style={styles.settingValue}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Privacy Policy</Text>
            <Text style={styles.settingValue}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Credits */}
        <View style={styles.credits}>
          <Text style={styles.creditsText}>Made for Tenno</Text>
          <Text style={styles.creditsSubtext}>Data sourced from Warframe Wiki</Text>
        </View>
      </ScrollView>
    </View>
  );
}

