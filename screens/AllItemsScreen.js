import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, ScrollView, TextInput } from 'react-native';
import { useState } from 'react';
import ItemCard from '../components/ItemCard';

export default function AllItemsScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock all items data - replace with actual API call
  const allItems = [
    {
      name: 'Primed Continuity',
      image: 'https://via.placeholder.com/150',
      creditPrice: 100000,
      ducatPrice: 350,
      type: 'Mod',
      likes: 245
    },
    {
      name: 'Prisma Gorgon',
      image: 'https://via.placeholder.com/150',
      creditPrice: 250000,
      ducatPrice: 600,
      type: 'Weapon',
      likes: 189
    },
    {
      name: 'Primed Flow',
      image: 'https://via.placeholder.com/150',
      creditPrice: 110000,
      ducatPrice: 350,
      type: 'Mod',
      likes: 312
    },
    {
      name: 'Prisma Skana',
      image: 'https://via.placeholder.com/150',
      creditPrice: 175000,
      ducatPrice: 510,
      type: 'Weapon',
      likes: 156
    }
  ];

  const filteredItems = searchQuery
    ? allItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : allItems;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ALL ITEMS</Text>
        <Text style={styles.headerSubtitle}>{allItems.length} items in archive</Text>
        
        {/* Search Bar */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
          placeholderTextColor="#5A6B8C"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {filteredItems.map((item, index) => (
          <ItemCard
            key={index}
            item={item}
            onPress={() => console.log('All items - pressed:', item.name)}
          />
        ))}
        {filteredItems.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items found</Text>
            <Text style={styles.emptySubtext}>Try a different search term</Text>
          </View>
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
    borderWidth: 1,
    borderColor: '#2A3442',
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
  },
});
