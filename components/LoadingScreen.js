import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#D4A574" />
      <Text style={styles.loadingText}>Loading Baro's Inventory...</Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0E1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#D4A574',
    fontSize: 16,
    marginTop: 20,
    fontWeight: '500',
  },
});
