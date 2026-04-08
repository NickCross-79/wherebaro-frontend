import { View, Text, TouchableOpacity, Linking, Platform, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../constants/theme';

const STORE_URL = Platform.select({
  ios: 'https://apps.apple.com/app/when-baro/id6760981438',
  android: 'https://play.google.com/store/apps/details?id=com.whenbaro.app',
});

export default function ForceUpdateScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Ionicons name="arrow-up-circle-outline" size={64} color={colors.accent} />
      <Text style={styles.title}>Update Required</Text>
      <Text style={styles.message}>
        A new version of When Baro? is available. Please update to continue using the app.
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => Linking.openURL(STORE_URL)}>
        <Text style={styles.buttonText}>Update Now</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.supportLink} onPress={() => Linking.openURL('mailto:support@seventhlayer.ca')}>
        <Text style={styles.supportText}>Need help? support@seventhlayer.ca</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
  },
  message: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  buttonText: {
    color: colors.textOnAccent,
    fontSize: 16,
    fontWeight: '700',
  },
  supportLink: {
    marginTop: 24,
  },
  supportText: {
    color: colors.textDim,
    fontSize: 13,
  },
});
