import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useState } from 'react';
import Header from '../components/Header';
import InventoryList from '../components/InventoryList';
import LoadingScreen from '../components/LoadingScreen';
import BaroAbsentScreen from '../components/BaroAbsentScreen';
import ItemDetailModal from '../components/ItemDetailModal';
import useBaroInventory from '../hooks/useBaroInventory';

export default function HomeScreen() {
  const [selectedItem, setSelectedItem] = useState(null);
  const { items, loading, refreshing, nextArrival, nextLocation, isHere, onRefresh } = useBaroInventory();

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
      <Header nextArrival={nextArrival} nextLocation={nextLocation} />
      <InventoryList
        items={items}
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
});
