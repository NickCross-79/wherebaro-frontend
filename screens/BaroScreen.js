import { StatusBar } from 'expo-status-bar';
import { View, Animated } from 'react-native';
import { useRef, useState, useCallback, useMemo } from 'react';
import { useScrollToTop } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBaroHeader, { COLLAPSED_HEADER_HEIGHT } from '../components/baro/AnimatedBaroHeader';
import InventoryList from '../components/baro/InventoryList';
import LoadingScreen from './LoadingScreen';
import BaroAbsentScreen from './BaroAbsentScreen';
import CollapsibleSearchBar from '../components/search/CollapsibleSearchBar';
import { useInventory } from '../contexts/InventoryContext';
import { useWishlist } from '../contexts/WishlistContext';
import { applyAllFilters } from '../utils/filterUtils';
import logger from '../utils/logger';
import styles from '../styles/screens/BaroScreen.styles';
import { colors } from '../constants/theme';

const BARO_SORT_OPTIONS = [
  { label: 'Default',      value: 'all' },
  { label: 'Buy Votes',    value: 'buy-votes' },
  { label: 'Skip Votes',   value: 'skip-votes' },
  { label: 'Likes',        value: 'popular' },
  { label: 'Wishlists',    value: 'most-wishlisted' },
  { label: 'Reviews',      value: 'most-reviews' },
  { label: 'Last Brought', value: 'last-brought' },
  { label: 'Credits',      value: 'credits' },
  { label: 'Ducats',       value: 'ducats' },
];

export default function BaroScreen({ navigation }) {
  const scrollRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  useScrollToTop(scrollRef);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ categories: [], popularity: 'all' });
  const [searchBarHeight, setSearchBarHeight] = useState(75);
  const [expandedHeaderHeight, setExpandedHeaderHeight] = useState(152);
  const { items, loading, syncing, nextArrival, nextLocation, isHere, refreshing, onRefresh } = useInventory();
  const { isInWishlist } = useWishlist();

  const scrollDistance = Math.max(expandedHeaderHeight - COLLAPSED_HEADER_HEIGHT, 1);

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, scrollDistance],
    outputRange: [0, -scrollDistance],
    extrapolate: 'clamp',
  });

  const finalItems = useMemo(() => applyAllFilters(items, searchQuery, filters, isInWishlist), [items, searchQuery, filters, isInWishlist]);

  const handleItemPress = useCallback((item) => {
    navigation.navigate('ItemDetail', { item });
  }, [navigation]);

  const onScroll = useMemo(() => Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  ), [scrollY]);

  logger.debug('BaroScreen', `Render: loading=${loading}, syncing=${syncing}, isHere=${isHere}, items=${items.length}`);

  if (syncing) {
    logger.debug('BaroScreen', '→ Showing syncing screen');
    return <LoadingScreen message="Retrieving Baro Ki'Teer's Inventory..." subtitle="This may take a moment..." />;
  }

  if (loading) {
    logger.debug('BaroScreen', '→ Showing LoadingScreen (initial load)');
    return <LoadingScreen />;
  }

  if (!isHere) {
    logger.debug('BaroScreen', `→ Showing BaroAbsentScreen (nextArrival=${nextArrival})`);
    return <BaroAbsentScreen nextArrival={nextArrival} nextLocation={nextLocation} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <AnimatedBaroHeader
        scrollY={scrollY}
        nextArrival={nextArrival}
        nextLocation={nextLocation}
        onHeightMeasured={setExpandedHeaderHeight}
      />
      <View style={{ flex: 1 }}>
        <InventoryList
          ref={scrollRef}
          items={finalItems}
          onItemPress={handleItemPress}
          contentContainerStyle={{ paddingTop: expandedHeaderHeight + searchBarHeight }}
          onScroll={onScroll}
          scrollEventThrottle={16}
          refreshing={refreshing}
          onRefresh={onRefresh}
          progressViewOffset={expandedHeaderHeight + searchBarHeight}
        />
        <Animated.View
          style={[
            styles.searchBarGradient,
            { top: expandedHeaderHeight, transform: [{ translateY: headerTranslateY }] },
          ]}
          pointerEvents="box-none"
          onLayout={(e) => setSearchBarHeight(e.nativeEvent.layout.height)}
        >
          <LinearGradient
            colors={[colors.background, colors.background, 'transparent']}
            locations={[0, 0.6, 1]}
            style={{ paddingBottom: 28 }}
          >
            <CollapsibleSearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              filters={filters}
              onApplyFilters={setFilters}
              sortOptions={BARO_SORT_OPTIONS}
              containerStyle={{ marginTop: 0, ...styles.searchBar }}
            />
          </LinearGradient>
        </Animated.View>
      </View>
    </View>
  );
}
