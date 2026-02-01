import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useState } from 'react';
import Header from '../components/Header';
import InventoryList from '../components/InventoryList';
import LoadingScreen from '../components/LoadingScreen';
import BaroAbsentScreen from '../components/BaroAbsentScreen';
import CollapsibleSearchBar from '../components/CollapsibleSearchBar';
import useInventory from '../hooks/useInventory';

export default function HomeScreen({ navigation }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ types: [], popularity: 'all' });
  const { items, loading, refreshing, nextArrival, nextLocation, isHere, onRefresh } = useInventory();

  const filteredItems = searchQuery
    ? items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : items;

  // Apply type filters
  const typeFilteredItems = filters.types.length > 0
    ? filteredItems.filter(item => filters.types.some(filterType => item.type.startsWith(filterType)))
    : filteredItems;

  // Apply popularity sorting
  let finalItems = [...typeFilteredItems];
  if (filters.popularity === 'popular') {
    finalItems.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } else if (filters.popularity === 'unpopular') {
    finalItems.sort((a, b) => (a.likes || 0) - (b.likes || 0));
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
      {/* <ItemDetailModal
        item={selectedItem}
        visible={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
});
