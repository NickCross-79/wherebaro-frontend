import { Text, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import styles from '../styles/screens/LoadingScreen.styles';
import { colors } from '../constants/theme';

export default function LoadingScreen({ message = "Loading Baro's Inventory...", subtitle }) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={styles.loadingText}>{message}</Text>
      {subtitle && <Text style={styles.loadingSubtext}>{subtitle}</Text>}
      <StatusBar style="light" />
    </View>
  );
}

