import { Text, View, Animated } from 'react-native';
import { useState, useEffect, memo } from 'react';
import TimeIcon from '../../assets/icons/icon_time.svg';
import { formatTimeRemaining } from '../../utils/dateUtils';
import styles from '../../styles/components/baro/BaroTimer.styles';

function BaroTimer({ nextArrival, location, centered = false, label = 'Next Arrival', expiredText = 'Check back soon for Baro\'s next location and time', detailsStyle, containerStyle }) {
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    // Update timer immediately
    setTimeRemaining(formatTimeRemaining(nextArrival, expiredText));
    
    // Update every second for accurate countdown
    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(nextArrival, expiredText));
    }, 1000);

    return () => clearInterval(interval);
  }, [nextArrival, expiredText]);

  return (
    <View
      style={[styles.timerContainer, centered && styles.centered, containerStyle]}
      accessibilityRole="timer"
      accessibilityLabel={`${label}: ${timeRemaining}${location ? `, at ${location.name}, ${location.planet}` : ''}`}
    >
      <Animated.View style={[styles.headerRow, centered && styles.centeredRow, detailsStyle]}>
        <Text style={[styles.timerLabel, centered && styles.centeredText]}>{label}</Text>
        {location && (
          <Text style={[styles.locationText, centered && styles.centeredText]}>
            {location.name} ({location.planet})
          </Text>
        )}
      </Animated.View>
      <View style={styles.timerValueRow}>
        <TimeIcon width={20} height={20} />
        <Text style={[styles.timerValue, centered && styles.centeredText]}>{timeRemaining}</Text>
      </View>
    </View>
  );
}

export default memo(BaroTimer);

