import { StatusBar } from 'expo-status-bar';
import { View, Text, FlatList } from 'react-native';
import { useRef, useState, useCallback, useMemo } from 'react';
import { useScrollToTop } from '@react-navigation/native';
import ItemCard from '../components/items/ItemCard';
import CollapsibleSearchBar from '../components/search/CollapsibleSearchBar';
import { useWishlist } from '../contexts/WishlistContext';
import { applyAllFilters } from '../utils/filterUtils';
import styles from '../styles/screens/WishlistScreen.styles';
import { colors } from '../constants/theme';

export default function WishlistScreen({ navigation }) {
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ categories: [], popularity: 'all' });
  const { wishlistItems } = useWishlist();

  const finalItems = useMemo(() => applyAllFilters(wishlistItems, searchQuery, filters), [wishlistItems, searchQuery, filters]);

  const keyExtractor = useCallback((item, index) => item.id || item._id || `item-${index}`, []);

  const renderItem = useCallback(({ item }) => (
    <ItemCard
      item={item}
      onPress={() => navigation.navigate('ItemDetail', { item })}
      hideWishlistBadge={true}

    />
  ), [navigation]);

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
          titleColor={colors.textSecondary}
          titleStyle={{ fontSize: 14, fontWeight: '600', letterSpacing: 1 }}
          filters={filters}
          onApplyFilters={setFilters}
        />
      </View>

      <FlatList
        ref={scrollRef}
        data={finalItems}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.scrollContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {wishlistItems.length === 0 ? 'Your wishlist is empty' : 'No items found'}
            </Text>
            <Text style={styles.emptySubtext}>
              {wishlistItems.length === 0
                ? 'Tap the heart (or long-press an item) to add it here'
                : 'Try a different search term'}
            </Text>
          </View>
        )}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </View>
  );
}

