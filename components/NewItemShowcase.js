import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';

export default function NewItemShowcase({ item, onPress }) {
  if (!item) return null;

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>NEW ITEM</Text>
      </View>
      
      <TouchableOpacity style={styles.showcaseCard} onPress={onPress}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.itemImage}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemType}>{item.type}</Text>
          
          <View style={styles.priceRow}>
            <View style={styles.priceItem}>
              <Image
                source={require('../assets/icons/icon_credits.png')}
                style={styles.priceIcon}
              />
              <Text style={styles.creditPrice}>{item.creditPrice?.toLocaleString()}</Text>
            </View>
            <View style={styles.priceItem}>
              <Image
                source={require('../assets/icons/icon_ducats.png')}
                style={styles.priceIcon}
              />
              <Text style={styles.ducatPrice}>{item.ducatPrice}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#D4A574',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginBottom: -1,
    marginLeft: 0,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A0E1A',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  showcaseCard: {
    flexDirection: 'row',
    backgroundColor: '#0F1419',
    borderRadius: 16,
    borderTopLeftRadius: 0,
    padding: 16,
    borderWidth: 2,
    borderColor: '#D4A574',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  imageContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#151B23',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  itemImage: {
    width: 80,
    height: 80,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  itemType: {
    fontSize: 12,
    color: '#9BA5B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    gap: 20,
  },
  priceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceIcon: {
    width: 16,
    height: 16,
  },
  creditPrice: {
    fontSize: 16,
    color: '#E8E8E8',
    fontWeight: '700',
  },
  ducatPrice: {
    fontSize: 16,
    color: '#D4A574',
    fontWeight: '700',
  },
});
