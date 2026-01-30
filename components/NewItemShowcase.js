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
    backgroundColor: '#C89B3C',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginBottom: -1,
    marginLeft: 0,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0A0E1A',
    letterSpacing: 1.5,
  },
  showcaseCard: {
    flexDirection: 'row',
    backgroundColor: '#1A2332',
    borderRadius: 8,
    borderTopLeftRadius: 0,
    padding: 16,
    borderWidth: 2,
    borderColor: '#C89B3C',
    gap: 16,
  },
  imageContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#121825',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  itemType: {
    fontSize: 12,
    color: '#8B9DC3',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
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
    color: '#FFFFFF',
    fontWeight: '600',
  },
  ducatPrice: {
    fontSize: 16,
    color: '#C89B3C',
    fontWeight: '600',
  },
});
