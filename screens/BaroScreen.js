import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useRef, useState, useCallback, useMemo } from 'react';
import { useScrollToTop } from '@react-navigation/native';
import Header from '../components/ui/Header';
import InventoryList from '../components/baro/InventoryList';
import LoadingScreen from './LoadingScreen';
import BaroAbsentScreen from './BaroAbsentScreen';
import CollapsibleSearchBar from '../components/search/CollapsibleSearchBar';
import { useInventory } from '../contexts/InventoryContext';
import { applyAllFilters } from '../utils/filterUtils';
import logger from '../utils/logger';
import styles from '../styles/screens/BaroScreen.styles';
import { colors } from '../constants/theme';

export default function BaroScreen({ navigation }) {
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ categories: [], popularity: 'all' });
  const { items, loading, syncing, nextArrival, nextLocation, isHere } = useInventory();

  const finalItems = useMemo(() => applyAllFilters(items, searchQuery, filters), [items, searchQuery, filters]);

  const handleItemPress = useCallback((item) => {
    navigation.navigate('ItemDetail', { item });
  }, [navigation]);

  logger.debug('BaroScreen', `Render: loading=${loading}, syncing=${syncing}, isHere=${isHere}, items=${items.length}`);

  // Show syncing screen when transitioning to Baro active state (check first — takes priority)
  if (syncing) {
    logger.debug('BaroScreen', '→ Showing syncing screen');
    return <LoadingScreen message="Retrieving Baro Ki'Teer's Inventory..." />;
  }

  if (loading) {
    logger.debug('BaroScreen', '→ Showing LoadingScreen (initial load)');
    return <LoadingScreen />;
  }

  // Show absent screen when Baro is not here
  if (!isHere) {
    logger.debug('BaroScreen', `→ Showing BaroAbsentScreen (nextArrival=${nextArrival})`);
    return <BaroAbsentScreen nextArrival={nextArrival} nextLocation={nextLocation} />;
  }

  // Show inventory when Baro is here
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Header 
        nextArrival={nextArrival} 
        nextLocation={nextLocation} 
        isHere={isHere} 
        showTitle={false}
      >
        <CollapsibleSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          title="This Week's Items"
          titleColor={colors.textSecondary}
          titleStyle={{ fontSize: 14, fontWeight: '600', letterSpacing: 1 }}
          filters={filters}
          onApplyFilters={setFilters}
        />
      </Header>
      <InventoryList
        ref={scrollRef}
        items={finalItems}
        onItemPress={handleItemPress}
      />
    </View>
  );
}

