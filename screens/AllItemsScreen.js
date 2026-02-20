import { StatusBar } from 'expo-status-bar';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useScrollToTop } from '@react-navigation/native';
import ItemCard from '../components/items/ItemCard';
import CollapsibleSearchBar from '../components/search/CollapsibleSearchBar';
import { useAllItems } from '../contexts/AllItemsContext';
import { storageHelpers } from '../utils/storage';
import { applyAllFilters } from '../utils/filterUtils';
import styles from '../styles/screens/AllItemsScreen.styles';
import { colors } from '../constants/theme';

export default function AllItemsScreen({ navigation }) {
  const listRef = useRef(null);
  useScrollToTop(listRef);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ categories: [], popularity: 'all' });
  const { items, loading, error } = useAllItems();

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

  const finalItems = useMemo(() => applyAllFilters(items, searchQuery, filters), [items, searchQuery, filters]);

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
        <Text style={styles.headerTitle}>ALL ITEMS</Text>
        
        <CollapsibleSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          title={`${finalItems.length} items in archive`}
          titleColor={colors.textSecondary}
          titleStyle={{ fontSize: 14, fontWeight: '600', letterSpacing: 1 }}
          filters={filters}
          onApplyFilters={setFilters}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading Baro's archive...</Text>
        </View>
      ) : error ? (
        <FlatList
          data={[]}
          renderItem={null}
          contentContainerStyle={styles.scrollContent}
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
          contentContainerStyle={styles.scrollContent}
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
        />
      )}
    </View>
  );
}

