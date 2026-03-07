import { StatusBar } from 'expo-status-bar';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useRef, useState, useCallback, useMemo } from 'react';
import { useScrollToTop } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import ItemCard from '../components/items/ItemCard';
import CollapsibleSearchBar from '../components/search/CollapsibleSearchBar';
import { useWishlist } from '../contexts/WishlistContext';
import { useAllItems } from '../contexts/AllItemsContext';
import { applyAllFilters } from '../utils/filterUtils';
import styles from '../styles/screens/WishlistScreen.styles';
import { colors } from '../constants/theme';

export default function WishlistScreen({ navigation }) {
  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ categories: [], popularity: 'all' });
  const [searchBarHeight, setSearchBarHeight] = useState(75);
  const { wishlistItems } = useWishlist();
  const { refreshing, onRefresh } = useAllItems();

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
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>WISHLIST</Text>
          <Text style={styles.headerSubtitle}>{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} on your wishlist</Text>
        </View>
      </View>

      {/* Content area with floating search bar */}
      <View style={{ flex: 1 }}>
        <FlatList
          ref={scrollRef}
          data={finalItems}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={[styles.scrollContent, { paddingTop: searchBarHeight }]}
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
              progressBackgroundColor={colors.background}
              progressViewOffset={searchBarHeight}
            />
          }
        />

        {/* Floating gradient search bar */}
        <LinearGradient
          colors={[colors.background, colors.background, 'transparent']}
          locations={[0, 0.6, 1]}
          style={styles.searchBarGradient}
          pointerEvents="box-none"
          onLayout={(e) => setSearchBarHeight(e.nativeEvent.layout.height)}
        >
          <CollapsibleSearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            filters={filters}
            onApplyFilters={setFilters}
            containerStyle={styles.searchBar}
          />
        </LinearGradient>
      </View>
    </View>
  );
}

