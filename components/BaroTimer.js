import { StyleSheet, Text, View } from 'react-native';
import { useState, useEffect } from 'react';

export default function BaroTimer({ nextArrival, location, centered = false }) {
  const [timeRemaining, setTimeRemaining] = useState('');

  const formatTimeRemaining = (date) => {
    if (!date) return 'Unknown';
    const now = new Date();
    const diff = date - now;
    
    if (diff <= 0) return 'Arriving Soon';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  useEffect(() => {
    // Update timer immediately
    setTimeRemaining(formatTimeRemaining(nextArrival));
    
    // Update every minute
    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(nextArrival));
    }, 60000);

    return () => clearInterval(interval);
  }, [nextArrival]);

  return (
    <View style={[styles.timerContainer, centered && styles.centered]}>
      <View style={[styles.headerRow, centered && styles.centeredRow]}>
        <Text style={[styles.timerLabel, centered && styles.centeredText]}>Next Arrival</Text>
        {location && (
          <Text style={[styles.locationText, centered && styles.centeredText]}>
            {location.name}, ({location.planet})
          </Text>
        )}
      </View>
      <Text style={[styles.timerValue, centered && styles.centeredText]}>{timeRemaining}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  timerContainer: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#1A2332',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#C89B3C',
  },
  centered: {
    marginTop: 0,
    padding: 20,
    alignItems: 'center',
    borderLeftWidth: 0,
    borderWidth: 2,
    borderColor: '#C89B3C',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  centeredRow: {
    flexDirection: 'column',
    gap: 12,
  },
  timerLabel: {
    fontSize: 12,
    color: '#8B9DC3',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  locationText: {
    fontSize: 12,
    color: '#C89B3C',
    fontWeight: '600',
  },
  centeredText: {
    textAlign: 'center',
  },
  timerValue: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 8,
  },
});
