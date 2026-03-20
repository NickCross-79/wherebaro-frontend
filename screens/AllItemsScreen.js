import { StatusBar } from 'expo-status-bar';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useScrollToTop } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import ItemCard from '../components/items/ItemCard';
import CollapsibleSearchBar from '../components/search/CollapsibleSearchBar';
import { useAllItems } from '../contexts/AllItemsContext';
import { storageHelpers } from '../utils/storage';
import { applyAllFilters } from '../utils/filterUtils';
import { useUserActions } from '../contexts/UserActionsContext';
import styles from '../styles/screens/AllItemsScreen.styles';
import { colors } from '../constants/theme';

export default function AllItemsScreen({ navigation }) {
  const listRef = useRef(null);
  useScrollToTop(listRef);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ categories: [], popularity: 'all', ducatMin: 0, ducatMax: null, creditMin: 0, creditMax: null, hideOwned: false });
  const [searchBarHeight, setSearchBarHeight] = useState(75);
  const { items, loading, error, refreshing, onRefresh } = useAllItems();
  const { isOwned } = useUserActions();

  // Load filters on mount
  useEffect(() => {
    const loadFilters = async () => {
      const savedFilters = await storageHelpers.getFilters();
      setFilters(savedFilters);
    };
    loadFilters();
  }, []);

  // Save filters whenever they change
  useEffect(() => {
    storageHelpers.setFilters(filters);
  }, [filters]);

  // Scroll to top when filters change
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [filters]);

  const finalItems = useMemo(() => applyAllFilters(items, searchQuery, filters, undefined, isOwned), [items, searchQuery, filters, isOwned]);

  const keyExtractor = useCallback((item, index) => item.id || item._id || `item-${index}`, []);
  
  const renderItem = useCallback(({ item }) => (
    <ItemCard
      item={item}
      onPress={() => navigation.navigate('ItemDetail', { item })}
    />
  ), [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>ALL ITEMS</Text>
          <Text style={styles.headerSubtitle}>{finalItems.length} items in archive</Text>
        </View>
      </View>

      {/* Content area with floating search bar */}
      <View style={{ flex: 1 }}>
        {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading Baro's archive...</Text>
        </View>
      ) : error ? (
        <FlatList
          data={[]}
          renderItem={null}
          contentContainerStyle={[styles.scrollContent, { paddingTop: searchBarHeight }]}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Error loading items</Text>
              <Text style={styles.emptySubtext}>{error}</Text>
            </View>
          )}
        />
      ) : (
        <FlatList
          ref={listRef}
          data={finalItems}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={[styles.scrollContent, { paddingTop: searchBarHeight }]}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {items.length === 0 ? 'No items in archive' : 'No items found'}
              </Text>
              <Text style={styles.emptySubtext}>
                {items.length === 0 ? 'Try restarting the app' : 'Try a different search term'}
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
      )}


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

