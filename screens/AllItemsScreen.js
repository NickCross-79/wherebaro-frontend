import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, FlatList, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { useState } from 'react';
import ItemCard from '../components/ItemCard';
import useAllBaroItems from '../hooks/useAllBaroItems';

export default function AllItemsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { items, loading, refreshing, error, onRefresh } = useAllBaroItems();

  const filteredItems = searchQuery
    ? items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : items;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ALL ITEMS</Text>
        <Text style={styles.headerSubtitle}>{items.length} items in archive</Text>
        
        {/* Search Bar */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
          placeholderTextColor="#5A6B8C"
          value={searchQuery}
          onChangeText={setSearchQuery}
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
          data={filteredItems}
          keyExtractor={(item, index) => item.id || `item-${index}`}
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              onPress={() => console.log('All items - pressed:', item.name)}
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#121825',
    borderBottomWidth: 2,
    borderBottomColor: '#C89B3C',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#C89B3C',
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8B9DC3',
    marginTop: 4,
    letterSpacing: 1,
  },
  searchInput: {
    marginTop: 15,
    backgroundColor: '#1A2332',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    bordView: {
        flex: 1,
    }
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    color: '#8B9DC3',
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#5A6B8C',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: '#C89B3C',
    fontSize: 16,
    marginTop: 20,
    fontWeight: '500',
  },
});
