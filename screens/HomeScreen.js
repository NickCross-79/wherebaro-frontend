import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, TextInput } from 'react-native';
import { useState } from 'react';
import Header from '../components/Header';
import InventoryList from '../components/InventoryList';
import LoadingScreen from '../components/LoadingScreen';
import BaroAbsentScreen from '../components/BaroAbsentScreen';
import ItemDetailModal from '../components/ItemDetailModal';
import useBaroInventory from '../hooks/useBaroInventory';

export default function HomeScreen() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { items, loading, refreshing, nextArrival, nextLocation, isHere, onRefresh } = useBaroInventory();

  const filteredItems = searchQuery
    ? items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : items;

  const handleItemPress = (item) => {
    setSelectedItem(item);
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
      <Header nextArrival={nextArrival} nextLocation={nextLocation}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
          placeholderTextColor="#5A6B8C"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </Header>
      <InventoryList
        items={filteredItems}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onItemPress={handleItemPress}
      />
      <ItemDetailModal
        item={selectedItem}
        visible={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  searchInput: {
    marginTop: 15,
    backgroundColor: '#1A2332',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
});
