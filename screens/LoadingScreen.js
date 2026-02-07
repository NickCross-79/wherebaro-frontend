import { Text, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import styles from '../styles/screens/LoadingScreen.styles';

export default function LoadingScreen({ message = "Loading Baro's Inventory..." }) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#D4A574" />
      <Text style={styles.loadingText}>{message}</Text>
      <StatusBar style="light" />
    </View>
  );
}

