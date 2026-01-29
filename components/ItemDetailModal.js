
import { StyleSheet, View, Text, Image, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ItemDetailModal({ item, visible, onClose }) {
  if (!item) return null;

  // Get the second-to-last offering date (last time it was brought)
  const offeringDates = item.offeringDates || [];
  const lastBrought = offeringDates.length >= 2 
    ? offeringDates[offeringDates.length - 2]
    : offeringDates.length === 1
    ? offeringDates[0]
    : null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Item Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.image }}
              style={styles.itemImage}
              resizeMode="contain"
            />
          </View>

          {/* Item Name */}
          <Text style={styles.itemName}>{item.name}</Text>

          {/* Type Badge */}
          <View style={styles.typeContainer}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{item.type}</Text>
            </View>
          </View>

          {/* Prices */}
          <View style={styles.pricesContainer}>
            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>Credits</Text>
              <Text style={styles.creditValue}>
                {item.creditPrice?.toLocaleString() || 'N/A'}
              </Text>
            </View>
            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>Ducats</Text>
              <Text style={styles.ducatValue}>
                {item.ducatPrice || 'N/A'}
              </Text>
            </View>
          </View>

          {/* Last Brought Date */}
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>Last Brought</Text>
            <Text style={styles.dateValue}>{formatDate(lastBrought)}</Text>
          </View>

          {/* Total Offerings */}
          <View style={styles.statsContainer}>
            <Text style={styles.statsLabel}>Total Offerings</Text>
            <Text style={styles.statsValue}>{offeringDates.length}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: '#121825',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#C89B3C',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: '#1A2332',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#1A2332',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  itemImage: {
    width: 180,
    height: 180,
  },
  itemName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  typeBadge: {
    backgroundColor: '#C89B3C',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  typeText: {
    color: '#0A0E1A',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  pricesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    gap: 16,
  },
  priceBox: {
    flex: 1,
    backgroundColor: '#1A2332',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A3442',
  },
  priceLabel: {
    fontSize: 12,
    color: '#8B9DC3',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  creditValue: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  ducatValue: {
    fontSize: 20,
    color: '#C89B3C',
    fontWeight: 'bold',
  },
  dateContainer: {
    backgroundColor: '#1A2332',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#C89B3C',
  },
  dateLabel: {
    fontSize: 12,
    color: '#8B9DC3',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  dateValue: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsContainer: {
    backgroundColor: '#1A2332',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsLabel: {
    fontSize: 14,
    color: '#8B9DC3',
  },
  statsValue: {
    fontSize: 18,
    color: '#C89B3C',
    fontWeight: 'bold',
  },
});
