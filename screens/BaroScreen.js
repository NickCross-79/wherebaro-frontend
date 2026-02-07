import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useRef, useState, useCallback } from 'react';
import { useScrollToTop } from '@react-navigation/native';
import Header from '../components/ui/Header';
import InventoryList from '../components/baro/InventoryList';
import LoadingScreen from './LoadingScreen';
import BaroAbsentScreen from './BaroAbsentScreen';
import CollapsibleSearchBar from '../components/search/CollapsibleSearchBar';
import { useInventory } from '../contexts/InventoryContext';
import { applyAllFilters } from '../utils/filterUtils';
import styles from '../styles/screens/BaroScreen.styles';

export default function BaroScreen({ navigation }) {
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ categories: [], popularity: 'all' });
  const { items, loading, refreshing, syncing, nextArrival, nextLocation, isHere, onRefresh } = useInventory();

  const finalItems = applyAllFilters(items, searchQuery, filters);

  // Get newest item (first in sorted list when Baro is here)
  const newestItem = isHere && items.length > 0 ? items[0] : null;

  const handleItemPress = useCallback((item) => {
    navigation.navigate('ItemDetail', { item });
  }, [navigation]);

  if (loading && !refreshing) {
    return <LoadingScreen />;
  }

  // Show syncing screen when transitioning to Baro active state
  if (syncing) {
    return <LoadingScreen message="Retrieving Baro Ki'Teer's Inventory..." />;
  }

  // Show absent screen when Baro is not here
  if (!isHere) {
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
          titleColor="#8B9DC3"
          titleStyle={{ fontSize: 14, fontWeight: '600', letterSpacing: 1 }}
          filters={filters}
          onApplyFilters={setFilters}
        />
      </Header>
      <InventoryList
        ref={scrollRef}
        items={finalItems}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onItemPress={handleItemPress}
      />
    </View>
  );
}

