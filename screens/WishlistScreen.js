import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import ItemCard from '../components/items/ItemCard';
import CollapsibleSearchBar from '../components/search/CollapsibleSearchBar';
import { useWishlist } from '../contexts/WishlistContext';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_AZURE_FUNCTION_APP_BASE_URL ||
  process.env.AZURE_FUNCTION_APP_BASE_URL ||
  '';

const buildGetLikesUrl = () => {
  if (!API_BASE_URL) return '';
  const normalizedBase = API_BASE_URL.startsWith('http')
    ? API_BASE_URL
    : `https://${API_BASE_URL}`;
  return `${normalizedBase.replace(/\/$/, '')}/getLikes`;
};

const GET_LIKES_URL = buildGetLikesUrl();

export default function WishlistScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ categories: [], popularity: 'all' });
  const { wishlistItems } = useWishlist();
  const [itemsWithLikes, setItemsWithLikes] = useState([]);

  // Fetch fresh likes for all wishlist items
  useEffect(() => {
    const fetchLikesForWishlist = async () => {
      if (wishlistItems.length === 0) {
        setItemsWithLikes([]);
        return;
      }

      if (!GET_LIKES_URL) {
        console.warn('GET_LIKES_URL is not configured');
        setItemsWithLikes(wishlistItems);
        return;
      }

      try {
        const itemsWithUpdatedLikes = await Promise.all(
          wishlistItems.map(async (item) => {
            try {
              const response = await fetch(`${GET_LIKES_URL}?item_id=${item.id || item._id}`);
              if (response.ok) {
                const data = await response.json();
                return { ...item, likes: data.likes || [] };
              }
              return item;
            } catch (error) {
              console.error(`Error fetching likes for item ${item.id || item._id}:`, error);
              return item;
            }
          })
        );
        setItemsWithLikes(itemsWithUpdatedLikes);
      } catch (error) {
        console.error('Error fetching likes for wishlist:', error);
        setItemsWithLikes(wishlistItems);
      }
    };

    fetchLikesForWishlist();
  }, [wishlistItems]);

  // Use items with updated likes instead of wishlistItems
  const displayItems = itemsWithLikes.length > 0 ? itemsWithLikes : wishlistItems;

  const filteredItems = searchQuery
    ? displayItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : displayItems;

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
              {displayItems.length === 0 ? 'Your wishlist is empty' : 'No items found'}
            </Text>
            <Text style={styles.emptySubtext}>
              {wishlistItems.length === 0
                ? 'Tap the heart on items or hold down on the item card to add them here'
                : 'Try a different search term'}
            </Text>
          </View>
        ) : (
          finalItems.map((item, index) => (
            <ItemCard
              key={index}
              item={item}
              onPress={() => navigation.navigate('ItemDetail', { item })}
              hideWishlistBadge={true}
              hideWishlistBorder={true}
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
    paddingBottom: 100,
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
