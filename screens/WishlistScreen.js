import { StatusBar } from 'expo-status-bar';
import { View, Text, ScrollView } from 'react-native';
import { useRef, useState } from 'react';
import { useScrollToTop } from '@react-navigation/native';
import ItemCard from '../components/items/ItemCard';
import CollapsibleSearchBar from '../components/search/CollapsibleSearchBar';
import { useWishlist } from '../contexts/WishlistContext';
import { applyAllFilters } from '../utils/filterUtils';
import styles from '../styles/screens/WishlistScreen.styles';

export default function WishlistScreen({ navigation }) {
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ categories: [], popularity: 'all' });
  const { wishlistItems } = useWishlist();

  // Use cached wishlist items directly (likes are already stored locally)
  const displayItems = wishlistItems;

  const finalItems = applyAllFilters(displayItems, searchQuery, filters);

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
        ref={scrollRef}
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
                ? 'Tap the heart (or long-press an item) to add it here'
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

