import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch, TextInput } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen({ navigation }) {
  const [notifications, setNotifications] = useState(true);
  const [wishlistAlerts, setWishlistAlerts] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [displayName, setDisplayName] = useState('Anonymous');
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SETTINGS</Text>
        <Text style={styles.headerSubtitle}>Customize your experience</Text>
      </View>

      <ScrollView
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
              onValueChange={setNotifications}
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
              onValueChange={setWishlistAlerts}
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
              onChangeText={setDisplayName}
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
              onValueChange={setAutoRefresh}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#0F1419',
    borderBottomWidth: 2,
    borderBottomColor: '#D4A574',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#D4A574',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9BA5B8',
    marginTop: 4,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D4A574',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  settingItem: {
    backgroundColor: '#0F1419',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1A2332',
  },
  settingItemColumn: {
    backgroundColor: '#0F1419',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1A2332',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#9BA5B8',
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 16,
    color: '#9BA5B8',
    fontWeight: '600',
  },
  textInput: {
    marginTop: 12,
    backgroundColor: '#151B23',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1A2332',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  credits: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  creditsText: {
    fontSize: 14,
    color: '#9BA5B8',
    fontWeight: '700',
  },
  creditsSubtext: {
    fontSize: 12,
    color: '#5A6B8C',
    marginTop: 4,
  },
});
