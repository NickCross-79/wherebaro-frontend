import { Text, Animated } from 'react-native';
import { useRef, useState, useEffect, useCallback, memo } from 'react';
import BaroTimer from './BaroTimer';
import TimeIcon from '../../assets/icons/icon_time.svg';
import { formatTimeRemaining } from '../../utils/dateUtils';
import { colors } from '../../constants/theme';
import styles from '../../styles/screens/BaroScreen.styles';

export const COLLAPSED_HEADER_HEIGHT = 94;

function AnimatedBaroHeader({ scrollY, nextArrival, nextLocation, onHeightMeasured }) {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [expandedHeight, setExpandedHeight] = useState(152);
  const measuredRef = useRef(false);

  const scrollDistance = Math.max(expandedHeight - COLLAPSED_HEADER_HEIGHT, 1);

  useEffect(() => {
    if (!nextArrival) return;
    setTimeRemaining(formatTimeRemaining(nextArrival, 'Leaving Soon'));
    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(nextArrival, 'Leaving Soon'));
    }, 1000);
    return () => clearInterval(interval);
  }, [nextArrival]);

  const handleLayout = useCallback((e) => {
    if (!measuredRef.current) {
      measuredRef.current = true;
      const h = e.nativeEvent.layout.height;
      setExpandedHeight(h);
      onHeightMeasured?.(h);
    }
  }, [onHeightMeasured]);

  // All interpolations drive off scrollY — fully native, no JS frames
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, scrollDistance],
    outputRange: [0, -scrollDistance],
    extrapolate: 'clamp',
  });

  const expandedOpacity = scrollY.interpolate({
    inputRange: [0, scrollDistance * 0.6],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const collapsedOpacity = scrollY.interpolate({
    inputRange: [scrollDistance * 0.4, scrollDistance],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const relayName = nextLocation ? `${nextLocation.name}, (${nextLocation.planet})` : '';

  return (
    <Animated.View
      style={[styles.headerAbsolute, { transform: [{ translateY: headerTranslateY }] }]}
      onLayout={handleLayout}
    >
      {/* Expanded card — in flow, determines header height */}
      <Animated.View style={{ opacity: expandedOpacity }}>
        <BaroTimer
          nextArrival={nextArrival}
          location={nextLocation}
          label="Leaving In"
          expiredText="Leaving Soon"
          containerStyle={{ marginTop: 0 }}
        />
      </Animated.View>

      {/* Collapsed row — pinned to bottom, fades in as header slides up */}
      <Animated.View style={[styles.collapsedTimerOverlay, { opacity: collapsedOpacity }]} pointerEvents="none">
        <TimeIcon width={18} height={18} color={colors.textSecondary} />
        <Text style={styles.collapsedTimerText}>{timeRemaining}</Text>
        {relayName ? <Text style={styles.collapsedRelayText}>{relayName}</Text> : null}
      </Animated.View>
    </Animated.View>
  );
}

export default memo(AnimatedBaroHeader);
