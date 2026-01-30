import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useState } from 'react';
import ItemCard from '../components/ItemCard';
import CollapsibleSearchBar from '../components/CollapsibleSearchBar';
import useAllBaroItems from '../hooks/useAllBaroItems';

export default function AllItemsScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ types: [], popularity: 'all' });
  const { items, loading, refreshing, error, onRefresh } = useAllBaroItems();

  const filteredItems = searchQuery
    ? items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : items;

  // Apply type filters
  const typeFilteredItems = filters.types.length > 0
    ? filteredItems.filter(item => filters.types.includes(item.type))
    : filteredItems;

  // Apply popularity sorting
  let finalItems = [...typeFilteredItems];
  if (filters.popularity === 'popular') {
    finalItems.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } else if (filters.popularity === 'unpopular') {
    finalItems.sort((a, b) => (a.likes || 0) - (b.likes || 0));
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ALL ITEMS</Text>
        
        <CollapsibleSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          title={`${items.length} items in archive`}
          titleColor="#8B9DC3"
          titleStyle={{ fontSize: 14, fontWeight: '600', letterSpacing: 1 }}
          filters={filters}
          onApplyFilters={setFilters}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C89B3C" />
          <Text style={styles.loadingText}>Loading Baro's archive...</Text>
        </View>
      ) : error ? (
        <FlatList
          data={[]}
          renderItem={null}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#C89B3C"
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Error loading items</Text>
              <Text style={styles.emptySubtext}>{error}</Text>
              <Text style={styles.emptySubtext}>Pull down to retry</Text>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={finalItems}
          keyExtractor={(item, index) => item.id || `item-${index}`}
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              onPress={() => navigation.navigate('ItemDetail', { item })}
            />
          )}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#C89B3C"
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {items.length === 0 ? 'No items in archive' : 'No items found'}
              </Text>
              <Text style={styles.emptySubtext}>
                {items.length === 0 ? 'Pull down to refresh' : 'Try a different search term'}
              </Text>
            </View>
          )}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 20,
    backgroundColor: '#0F1419',
    borderBottomWidth: 2,
    borderBottomColor: '#D4A574',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#D4A574',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8B9DC3',
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B9DC3',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#5A6B8C',
    textAlign: 'center',
  },
});
