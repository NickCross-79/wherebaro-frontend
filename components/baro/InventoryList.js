import { forwardRef, useCallback } from 'react';
import { Animated, RefreshControl } from 'react-native';
import ItemCard from '../items/ItemCard';
import EmptyState from '../ui/EmptyState';
import styles from '../../styles/components/baro/InventoryList.styles';
import { colors } from '../../constants/theme';

const InventoryList = forwardRef(({ items, onItemPress, contentContainerStyle, onScroll, scrollEventThrottle = 16, refreshing = false, onRefresh, progressViewOffset = 0 }, ref) => {
  const keyExtractor = useCallback((item, index) => item.id || item._id || `item-${index}`, []);

  const renderItem = useCallback(({ item }) => (
    <ItemCard
      item={item}
      onPress={() => onItemPress && onItemPress(item)}
      isNew={item.isNew}
    />
  ), [onItemPress]);

  return (
    <Animated.FlatList
      ref={ref}
      data={items}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      style={styles.scrollView}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
          progressBackgroundColor={colors.background}
          progressViewOffset={progressViewOffset}
        />
      }
      ListEmptyComponent={EmptyState}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
    />
  );
});

InventoryList.displayName = 'InventoryList';

export default InventoryList;

