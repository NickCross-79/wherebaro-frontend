import { forwardRef } from 'react';
import { ScrollView } from 'react-native';
import ItemCard from '../items/ItemCard';
import EmptyState from '../ui/EmptyState';
import styles from '../../styles/components/baro/InventoryList.styles';

const InventoryList = forwardRef(({ items, onItemPress }, ref) => {
  return (
    <ScrollView
      ref={ref}
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
    >
      {items.length === 0 ? (
        <EmptyState />
      ) : (
        items.map((item, index) => (
          <ItemCard
            key={item.id || item._id || `item-${index}`}
            item={item}
            onPress={() => onItemPress && onItemPress(item)}
            isNew={index === 0}
          />
        ))
      )}
    </ScrollView>
  );
});

InventoryList.displayName = 'InventoryList';

export default InventoryList;

