import { ScrollView, StyleSheet, RefreshControl } from 'react-native';
import ItemCard from './ItemCard';
import EmptyState from './EmptyState';

export default function InventoryList({ items, refreshing, onRefresh, onItemPress }) {
  return (
    <ScrollView
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
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
});
