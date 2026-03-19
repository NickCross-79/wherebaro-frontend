import { StatusBar } from 'expo-status-bar';
import { View, Text, FlatList, RefreshControl, Animated } from 'react-native';
import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { useScrollToTop } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ItemCard from '../components/items/ItemCard';
import CollapsibleSearchBar from '../components/search/CollapsibleSearchBar';
import { useWishlist } from '../contexts/WishlistContext';
import { useAllItems } from '../contexts/AllItemsContext';
import { useInventory } from '../contexts/InventoryContext';
import { applyAllFilters } from '../utils/filterUtils';
import styles from '../styles/screens/WishlistScreen.styles';
import { colors } from '../constants/theme';

// Height of the fixed title bar (paddingTop 50 + title row ~32 + paddingBottom 12)
const TITLE_BAR_HEIGHT = 94;

export default function WishlistScreen({ navigation }) {
  const scrollRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  useScrollToTop(scrollRef);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ categories: [], popularity: 'all' });
  const [searchBarHeight, setSearchBarHeight] = useState(75);
  const [budgetHeight, setBudgetHeight] = useState(80);
  const { wishlistItems } = useWishlist();
  const { refreshing, onRefresh } = useAllItems();
  const { items: inventoryItems, isHere: isBaroHere } = useInventory();

  // Scroll to top when filters change
  useEffect(() => {
    scrollRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [filters]);

  const finalItems = useMemo(() => {
    const filtered = applyAllFilters(wishlistItems, searchQuery, filters);
    if (!isBaroHere || inventoryItems.length === 0) return filtered;
    const inventoryIds = new Set(inventoryItems.map(inv => String(inv._id?.$oid || inv._id || inv.id)));
    const isAvailable = (item) => inventoryIds.has(String(item._id?.$oid || item._id || item.id));
    return [...filtered].sort((a, b) => {
      const aAvail = isAvailable(a) ? 1 : 0;
      const bAvail = isAvailable(b) ? 1 : 0;
      return bAvail - aAvail;
    });
  }, [wishlistItems, searchQuery, filters, inventoryItems, isBaroHere]);

  const { totalDucats, totalCredits, availableDucats, availableCredits, availableCount } = useMemo(() => {
    const inventoryIds = new Set(inventoryItems.map(inv => String(inv._id?.$oid || inv._id || inv.id)));
    let totalDucats = 0, totalCredits = 0, availableDucats = 0, availableCredits = 0, availableCount = 0;
    for (const item of wishlistItems) {
      const ducats = item.ducatPrice ?? 0;
      const credits = item.creditPrice ?? 0;
      totalDucats += ducats;
      totalCredits += credits;
      if (isBaroHere && inventoryIds.has(String(item._id?.$oid || item._id || item.id))) {
        availableDucats += ducats;
        availableCredits += credits;
        availableCount++;
      }
    }
    return { totalDucats, totalCredits, availableDucats, availableCredits, availableCount };
  }, [wishlistItems, inventoryItems, isBaroHere]);

  const hasPrices = totalDucats > 0 || totalCredits > 0;
  const showBudget = wishlistItems.length > 0 && hasPrices;

  const budgetTranslateY = scrollY.interpolate({
    inputRange: [0, budgetHeight],
    outputRange: [0, -(budgetHeight + 2)],
    extrapolate: 'clamp',
  });

  const budgetOpacity = scrollY.interpolate({
    inputRange: [0, budgetHeight * 0.6],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const onScroll = useMemo(() => Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  ), [scrollY]);

  const handleBudgetLayout = useCallback((e) => {
    setBudgetHeight(e.nativeEvent.layout.height);
  }, []);

  const keyExtractor = useCallback((item, index) => item.id || item._id || `item-${index}`, []);

  const renderItem = useCallback(({ item }) => (
    <ItemCard
      item={item}
      onPress={() => navigation.navigate('ItemDetail', { item })}
      hideWishlistBadge={true}
      showAvailableBadge={true}
    />
  ), [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Fixed title bar — always visible */}
      <View style={styles.titleBar}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>WISHLIST</Text>
          <Text style={styles.headerSubtitle}>{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} on your wishlist</Text>
        </View>
      </View>

      {/* Animated budget section — slides up under the title bar */}
      {showBudget && (
        <Animated.View
          style={[styles.budgetBar, { transform: [{ translateY: budgetTranslateY }], opacity: budgetOpacity }]}
          onLayout={handleBudgetLayout}
        >
          <View style={styles.ducatPlannerRow}>
            <Ionicons name="calculator-outline" size={13} color={colors.textDim} />
            <Text style={styles.ducatPlannerLabel}>Total cost for all items</Text>
          </View>
          <View style={styles.ducatPlannerCosts}>
            {totalDucats > 0 && (
              <View style={styles.ducatPlannerStat}>
                <Text style={styles.ducatPlannerValue}>{totalDucats.toLocaleString()}</Text>
                <Text style={styles.ducatPlannerUnit}> ducats</Text>
              </View>
            )}
            {totalDucats > 0 && totalCredits > 0 && (
              <Text style={styles.ducatPlannerSep}>·</Text>
            )}
            {totalCredits > 0 && (
              <View style={styles.ducatPlannerStat}>
                <Text style={styles.ducatPlannerValue}>{totalCredits.toLocaleString()}</Text>
                <Text style={styles.ducatPlannerUnit}> credits</Text>
              </View>
            )}
          </View>
          {isBaroHere && availableCount > 0 && (
            <View style={styles.ducatPlannerAvailable}>
              <Ionicons name="storefront-outline" size={12} color={colors.accent} />
              <Text style={styles.ducatPlannerAvailableText}>
                {availableCount} available now · {availableDucats > 0 ? `${availableDucats.toLocaleString()} ducats` : ''}{availableDucats > 0 && availableCredits > 0 ? ' · ' : ''}{availableCredits > 0 ? `${availableCredits.toLocaleString()} credits` : ''}
              </Text>
            </View>
          )}
        </Animated.View>
      )}

      {/* Content area with floating search bar */}
      <View style={{ flex: 1 }}>
        <FlatList
          ref={scrollRef}
          data={finalItems}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={[styles.scrollContent, { paddingTop: TITLE_BAR_HEIGHT + (showBudget ? budgetHeight : 0) + searchBarHeight }]}
          onScroll={onScroll}
          scrollEventThrottle={16}
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
              progressViewOffset={TITLE_BAR_HEIGHT + (showBudget ? budgetHeight : 0) + searchBarHeight}
            />
          }
        />

        {/* Floating gradient search bar — slides up with budget */}
        <Animated.View
          style={[
            styles.searchBarGradient,
            {
              top: TITLE_BAR_HEIGHT + (showBudget ? budgetHeight : 0),
              transform: showBudget ? [{ translateY: budgetTranslateY }] : [],
            },
          ]}
          pointerEvents="box-none"
          onLayout={(e) => setSearchBarHeight(e.nativeEvent.layout.height)}
        >
          <LinearGradient
            colors={[colors.background, colors.background, 'transparent']}
            locations={[0, 0.6, 1]}
            style={{ paddingBottom: 28 }}
          >
            <CollapsibleSearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              filters={filters}
              onApplyFilters={setFilters}
              containerStyle={styles.searchBar}
            />
          </LinearGradient>
        </Animated.View>
      </View>
    </View>
  );
}

