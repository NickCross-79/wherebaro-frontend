import { forwardRef } from 'react';
import { ScrollView, StyleSheet, RefreshControl } from 'react-native';
import ItemCard from '../items/ItemCard';
import EmptyState from '../ui/EmptyState';

const InventoryList = forwardRef(({ items, refreshing, onRefresh, onItemPress }, ref) => {
  return (
    <ScrollView
      ref={ref}
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#D4A574"
        />
      }
    >
      {items.length === 0 ? (
        <EmptyState />
      ) : (
        items.map((item, index) => (
          <ItemCard
            key={index}
            item={item}
            onPress={() => onItemPress && onItemPress(item)}
            isNew={index === 0}
          />
        ))
      )}
    </ScrollView>
  );
});

export default InventoryList;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
});
