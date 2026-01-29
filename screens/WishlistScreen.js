import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import ItemCard from '../components/ItemCard';

export default function WishlistScreen() {
  // Mock wishlist data - replace with actual saved wishlist
  const wishlistItems = [
    {
      name: 'Primed Flow',
      image: 'https://via.placeholder.com/150',
      creditPrice: 110000,
      ducatPrice: 350,
      type: 'Mod',
      likes: 312
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WISHLIST</Text>
        <Text style={styles.headerSubtitle}>Items you're waiting for</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {wishlistItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Your wishlist is empty</Text>
            <Text style={styles.emptySubtext}>Tap the heart on items to add them here</Text>
          </View>
        ) : (
          wishlistItems.map((item, index) => (
            <ItemCard
              key={index}
              item={item}
              onPress={() => console.log('Wishlist item pressed:', item.name)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#121825',
    borderBottomWidth: 2,
    borderBottomColor: '#C89B3C',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#C89B3C',
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8B9DC3',
    marginTop: 4,
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    color: '#8B9DC3',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#5A6B8C',
    marginTop: 8,
    textAlign: 'center',
  },
});
