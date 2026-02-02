import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useState } from 'react';
import Header from '../components/ui/Header';
import InventoryList from '../components/baro/InventoryList';
import LoadingScreen from './LoadingScreen';
import BaroAbsentScreen from './BaroAbsentScreen';
import CollapsibleSearchBar from '../components/search/CollapsibleSearchBar';
import { useInventory } from '../contexts/InventoryContext';

export default function BaroScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ categories: [], popularity: 'all' });
  const { items, loading, refreshing, nextArrival, nextLocation, isHere, onRefresh } = useInventory();

  const filteredItems = searchQuery
    ? items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : items;

  // Apply category filters
  const categoryFilteredItems = filters.categories.length > 0
    ? filteredItems.filter(item => filters.categories.some(category => item.type.toLowerCase().includes(category.toLowerCase())))
    : filteredItems;

  // Apply popularity sorting
  let finalItems = [...categoryFilteredItems];
  if (filters.popularity === 'popular') {
    finalItems.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } else if (filters.popularity === 'unpopular') {
    finalItems.sort((a, b) => (a.likes || 0) - (b.likes || 0));
  } else if (filters.popularity === 'most-reviews') {
    finalItems.sort((a, b) => ((b.reviews || []).length) - ((a.reviews || []).length));
  } else if (filters.popularity === 'least-reviews') {
    finalItems.sort((a, b) => ((a.reviews || []).length) - ((b.reviews || []).length));
  }

  // Get newest item (first in sorted list when Baro is here)
  const newestItem = isHere && items.length > 0 ? items[0] : null;

  const handleItemPress = (item) => {
    navigation.navigate('ItemDetail', { item });
  };

  if (loading && !refreshing) {
    return <LoadingScreen />;
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
        items={finalItems}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onItemPress={handleItemPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
});
