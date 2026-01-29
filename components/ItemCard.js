import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';

export default function ItemCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.itemCard} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.typeTag}>
          <Text style={styles.typeText}>{item.type}</Text>
        </View>
        <View style={styles.likesContainer}>
          <Text style={styles.likesText}>♥ {item.likes}</Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.itemImage}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Credits</Text>
              <Text style={styles.priceValue}>
                {item.creditPrice.toLocaleString()}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Ducats</Text>
              <Text style={styles.ducatValue}>
                {item.ducatPrice}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  itemCard: {
    backgroundColor: '#121825',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1A2332',
  },
  typeTag: {
    backgroundColor: '#C89B3C',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeText: {
    color: '#0A0E1A',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  imageContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#1A2332',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemImage: {
    width: 80,
    height: 80,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  priceContainer: {
    gap: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 13,
    color: '#8B9DC3',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  ducatValue: {
    fontSize: 16,
    color: '#C89B3C',
    fontWeight: '600',
  },
});
