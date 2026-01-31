import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useState } from 'react';
import ItemCard from '../components/ItemCard';
import CollapsibleSearchBar from '../components/CollapsibleSearchBar';
import { useWishlist } from '../contexts/WishlistContext';

export default function WishlistScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ types: [], popularity: 'all' });
  const { wishlistItems } = useWishlist();

  const filteredItems = searchQuery
    ? wishlistItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : wishlistItems;

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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WISHLIST</Text>
        <CollapsibleSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          title="Items you're waiting for"
          titleColor="#8B9DC3"
          titleStyle={{ fontSize: 14, fontWeight: '600', letterSpacing: 1 }}
          filters={filters}
          onApplyFilters={setFilters}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {finalItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {wishlistItems.length === 0 ? 'Your wishlist is empty' : 'No items found'}
            </Text>
            <Text style={styles.emptySubtext}>
              {wishlistItems.length === 0
                ? 'Tap the heart on items to add them here'
                : 'Try a different search term'}
            </Text>
          </View>
        ) : (
          finalItems.map((item, index) => (
            <ItemCard
              key={index}
              item={item}
              onPress={() => navigation.navigate('ItemDetail', { item })}
            />
          ))
        )}
      </ScrollView>
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
  scrollView: {
    flex: 1,
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
