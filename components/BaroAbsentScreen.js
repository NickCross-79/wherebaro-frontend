import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import BaroTimer from './BaroTimer';

export default function BaroAbsentScreen({ nextArrival, nextLocation }) {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <Text style={styles.title}>BARO KI'TEER</Text>
        <Text style={styles.subtitle}>The Void Trader is not currently visiting</Text>
        
        <View style={styles.timerWrapper}>
          {nextArrival && <BaroTimer nextArrival={nextArrival} location={nextLocation} centered />}
        </View>
        
        <Text style={styles.hint}>Pull down to refresh</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
    maxWidth: 500,
    width: '100%',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#C89B3C',
    letterSpacing: 3,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8B9DC3',
    textAlign: 'center',
    marginBottom: 40,
  },
  timerWrapper: {
    width: '100%',
    marginBottom: 30,
  },
  hint: {
    fontSize: 14,
    color: '#5A6B8C',
    fontStyle: 'italic',
  },
});
