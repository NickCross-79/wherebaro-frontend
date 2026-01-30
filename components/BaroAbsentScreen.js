import { StyleSheet, Text, View, Animated, Easing, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import EarthIcon from '../assets/icons/icon_earth.svg';
import TimeIcon from '../assets/icons/icon_time.svg';

export default function BaroAbsentScreen({ nextArrival, nextLocation }) {
  const cycleAnim = useRef(new Animated.Value(0)).current;
  const [timeRemaining, setTimeRemaining] = useState('');
  const STAGGER_DELAY = 150; // ms between each dot
  const ANIMATION_DURATION = 1200; // ms for each dot to animate
  const PAUSE = 300; // ms pause at end
  const NUM_DOTS = 8;
  const TOTAL_CYCLE = STAGGER_DELAY * (NUM_DOTS - 1) + ANIMATION_DURATION + PAUSE; // 2550ms

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

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(cycleAnim, {
        toValue: 1,
        duration: TOTAL_CYCLE,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [cycleAnim]);

  // Create interpolations for each dot based on the cycle animation
  const dotAnimations = Array.from({ length: NUM_DOTS }).map((_, index) => {
    const startTime = (index * STAGGER_DELAY) / TOTAL_CYCLE;
    const endTime = (index * STAGGER_DELAY + ANIMATION_DURATION) / TOTAL_CYCLE;

    return {
      translateY: cycleAnim.interpolate({
        inputRange: [0, startTime, startTime + (endTime - startTime) * 0.35, endTime, 1],
        outputRange: [0, 0, -20, 0, 0],
      }),
    };
  });
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <Text style={styles.title}>Where Baro?</Text>
        <Text style={styles.subtitle}>The Void Trader is traveling through the Void</Text>
        
        <View style={styles.journeyContainer}>
          {/* Baro Icon on Left */}
          <View style={styles.iconWrapper}>
            <Image
              source={require('../assets/logo_baro.png')}
              style={styles.baroIcon}
              resizeMode="contain"
            />
            <Text style={styles.iconLabel}>Void</Text>
          </View>

          {/* Travel Animation Container */}
          <View style={styles.travelPath}>
            {/* Wave dots */}
            {dotAnimations.map((dotAnim, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.waveDot,
                  {
                    left: `${(index / 7) * 100}%`,
                    transform: [{ translateY: dotAnim.translateY }],
                  },
                ]}
              />
            ))}
          </View>

          {/* Earth Icon on Right */}
          <View style={styles.iconWrapper}>
            <EarthIcon width={80} height={80} />
            <Text style={styles.iconLabel}>Relay</Text>
          </View>
        </View>
        
        <View style={styles.timerSection}>
          <View style={styles.timerRow}>
            <TimeIcon width={24} height={24} />
            <Text style={styles.timerValue}>{timeRemaining}</Text>
          </View>
          {nextLocation && (
            <Text style={styles.locationText}>
              {nextLocation.name}, ({nextLocation.planet})
            </Text>
          )}
        </View>
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
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#C89B3C',
    marginBottom: 10,
    textAlign: 'center',
  },
  journeyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 50,
  },
  iconWrapper: {
    alignItems: 'center',
    gap: 8,
  },
  baroIcon: {
    width: 80,
    height: 80,
    opacity: 0.8,
  },
  earthIcon: {
    width: 80,
    height: 80,
    opacity: 0.8,
  },
  iconLabel: {
    fontSize: 12,
    color: '#8B9DC3',
    fontWeight: '600',
  },
  travelPath: {
    flex: 1,
    height: 80,
    marginHorizontal: 20,
    justifyContent: 'center',
    position: 'relative',
  },
  waveDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C89B3C',
    top: '50%',
    marginTop: -4, // Center the dot vertically
  },
  subtitle: {
    fontSize: 16,
    color: '#8B9DC3',
    textAlign: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 150,
    height: 150,
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    opacity: 0.7,
  },
  timerSection: {
    alignItems: 'center',
    gap: 8,
    marginTop: 30,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timerValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  locationText: {
    fontSize: 12,
    color: '#C89B3C',
    fontWeight: '600',
    marginTop: 4,
  },
  hint: {
    fontSize: 14,
    color: '#5A6B8C',
    fontStyle: 'italic',
  },
});
