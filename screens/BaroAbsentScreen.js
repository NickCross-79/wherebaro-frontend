import { Text, View, Animated, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import EarthIcon from '../assets/icons/icon_earth.svg';
import TimeIcon from '../assets/icons/icon_time.svg';
import BaroIcon from '../assets/icons/icon_baro.svg';
import styles from '../styles/screens/BaroAbsentScreen.styles';

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
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else {
      return `${minutes}m ${seconds}s`;
    }
  };

  useEffect(() => {
    // Update timer immediately
    setTimeRemaining(formatTimeRemaining(nextArrival));
    
    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(nextArrival));
    }, 1000);

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

  // Memoize interpolations so they aren't recreated on every timer re-render
  const dotAnimations = useMemo(() => Array.from({ length: NUM_DOTS }).map((_, index) => {
    const startTime = (index * STAGGER_DELAY) / TOTAL_CYCLE;
    const endTime = (index * STAGGER_DELAY + ANIMATION_DURATION) / TOTAL_CYCLE;

    return {
      translateY: cycleAnim.interpolate({
        inputRange: [0, startTime, startTime + (endTime - startTime) * 0.35, endTime, 1],
        outputRange: [0, 0, -20, 0, 0],
      }),
    };
  }), [cycleAnim]);
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <Text style={styles.title}>Where Baro?</Text>
        <Text style={styles.subtitle}>The Void Trader is traveling through the Void</Text>
        
        <View style={styles.journeyContainer}>
          {/* Baro Icon on Left */}
          <View style={styles.iconWrapper}>
            <BaroIcon
              width={80}
              height={80}
              color="#F0EFF4"
            />
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

