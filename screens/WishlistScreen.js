import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, ScrollView, TextInput } from 'react-native';
import { useState } from 'react';
import ItemCard from '../components/ItemCard';

export default function WishlistScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  // Mock wishlist data - replace with actual saved wishlist
  const wishlistItems = [
    {
      _id: '1',
      name: 'Primed Flow',
      image: 'https://via.placeholder.com/150',
      creditPrice: 110000,
      ducatPrice: 350,
      type: 'Mod',
      likes: 312,
      offeringDates: ['2026-01-29']
    }
  ];

  const filteredItems = searchQuery
    ? wishlistItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : wishlistItems;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WISHLIST</Text>
        <Text style={styles.headerSubtitle}>Items you're waiting for</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
          placeholderTextColor="#5A6B8C"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {wishlistItems.length === 0 ? 'Your wishlist is empty' : 'No items found'}
            </Text>
            <Text style={styles.emptySubtext}>
              {wishlistItems.length === 0
                ? 'Tap the heart on items to add them here'
                : 'Try a different search term'}
            </Text>
          </View>
        ) : (
          filteredItems.map((item, index) => (
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
  searchInput: {
    marginTop: 15,
    backgroundColor: '#1A2332',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
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
