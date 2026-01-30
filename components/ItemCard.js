import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ItemCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.itemCard} onPress={onPress}>
      <View style={styles.cardContent}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.itemImage}
            resizeMode="contain"
            defaultSource={require('../assets/logo_baro.png')}
          />
        </View>
        
        <View style={styles.itemInfo}>
          <View style={styles.nameAndLikes}>
            <View style={styles.nameContainer}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.categoryText}>{item.type}</Text>
            </View>
            <View style={styles.likesContainer}>
              <Ionicons name="thumbs-up" size={16} color="#FF6B6B" />
              <Text style={styles.likesText}>{item.likes || 0}</Text>
            </View>
          </View>
          
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <View style={styles.priceLabelRow}>
                <Image
                  source={require('../assets/icons/icon_credits.png')}
                  style={styles.creditIcon}
                />
                <Text style={styles.priceLabel}>Credits</Text>
              </View>
              <Text style={styles.priceValue}>
                {item.creditPrice.toLocaleString()}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <View style={styles.priceLabelRow}>
                <Image
                  source={require('../assets/icons/icon_ducats.png')}
                  style={styles.ducatIcon}
                />
                <Text style={styles.priceLabel}>Ducats</Text>
              </View>
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
    backgroundColor: '#0F1419',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1A2332',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1A2332',
  },
  typeTag: {
    backgroundColor: '#D4A574',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  typeText: {
    color: '#0A0E1A',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    backgroundColor: '#151B23',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  itemImage: {
    width: 80,
    height: 80,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  nameAndLikes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nameContainer: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9BA5B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 0,
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
    fontWeight: '600',
  },
  priceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  creditIcon: {
    width: 18,
    height: 18,
  },
  ducatIcon: {
    width: 18,
    height: 18,
  },
  priceValue: {
    fontSize: 16,
    color: '#E8E8E8',
    fontWeight: '700',
  },
  ducatValue: {
    fontSize: 16,
    color: '#D4A574',
    fontWeight: '700',
  },
});
