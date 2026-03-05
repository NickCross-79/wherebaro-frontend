import { forwardRef, useCallback } from 'react';
import { FlatList } from 'react-native';
import ItemCard from '../items/ItemCard';
import EmptyState from '../ui/EmptyState';
import styles from '../../styles/components/baro/InventoryList.styles';

const InventoryList = forwardRef(({ items, onItemPress }, ref) => {
  const keyExtractor = useCallback((item, index) => item.id || item._id || `item-${index}`, []);

  const renderItem = useCallback(({ item }) => (
    <ItemCard
      item={item}
      onPress={() => onItemPress && onItemPress(item)}
      isNew={item.isNew}
    />
  ), [onItemPress]);

  return (
    <FlatList
      ref={ref}
      data={items}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
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

