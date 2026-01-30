
import { StyleSheet, View, Text, Image, Modal, TouchableOpacity, ScrollView, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';

export default function ItemDetailModal({ item, visible, onClose }) {
  const [activeTab, setActiveTab] = useState('details');
  const [newReview, setNewReview] = useState('');
  const [userLiked, setUserLiked] = useState(false);
  const [showOfferings, setShowOfferings] = useState(false);

  // Reset to details tab whenever modal opens
  useEffect(() => {
    if (visible) {
      setActiveTab('details');
      setShowOfferings(false);
    }
  }, [visible]);

  
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

  const handleLike = () => {
    setUserLiked(!userLiked);
    // TODO: Send like to backend
  };

  const handlePostReview = () => {
    if (newReview.trim()) {
      // TODO: Send review to backend
      console.log('Posting review:', newReview);
      setNewReview('');
    }
  };

  const reviews = item.reviews || [];

  const renderDetailsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
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
          <View style={styles.priceLabelRow}>
            <Image
              source={require('../assets/icons/icon_credits.png')}
              style={styles.creditIcon}
            />
            <Text style={styles.priceLabel}>Credits</Text>
          </View>
          <Text style={styles.creditValue}>
            {item.creditPrice?.toLocaleString() || 'N/A'}
          </Text>
        </View>
        <View style={styles.priceBox}>
          <View style={styles.priceLabelRow}>
            <Image
              source={require('../assets/icons/icon_ducats.png')}
              style={styles.ducatIcon}
            />
            <Text style={styles.priceLabel}>Ducats</Text>
          </View>
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

      {/* Offering Dates Dropdown */}
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={styles.dropdownHeader}
          onPress={() => setShowOfferings(!showOfferings)}
        >
          <Text style={styles.dropdownTitle}>Offering Dates</Text>
          <View style={styles.dropdownMeta}>
            <Text style={styles.dropdownCount}>{offeringDates.length}</Text>
            <Ionicons
              name={showOfferings ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#C89B3C"
            />
          </View>
        </TouchableOpacity>

        {showOfferings && (
          <View style={styles.dropdownList}>
            {offeringDates.length === 0 ? (
              <Text style={styles.dropdownEmpty}>No offering dates available</Text>
            ) : (
              offeringDates.map((date, index) => (
                <View key={`${date}-${index}`} style={styles.dropdownItem}
                  >
                  <Text style={styles.dropdownItemText}>{formatDate(date)}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderReviewsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Like Section */}
      <View style={styles.likeSection}>
        <TouchableOpacity 
          style={[styles.likeButton, userLiked && styles.likeButtonActive]} 
          onPress={handleLike}
        >
          <Ionicons 
            name={userLiked ? "heart" : "heart-outline"} 
            size={24} 
            color={userLiked ? "#C89B3C" : "#8B9DC3"} 
          />
          <Text style={[styles.likeText, userLiked && styles.likeTextActive]}>
            {(item.likes || 0) + (userLiked ? 1 : 0)} Likes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Post Review Section */}
      <View style={styles.postReviewSection}>
        <Text style={styles.sectionTitle}>Write a Review</Text>
        <TextInput
          style={styles.reviewInput}
          placeholder="Share your thoughts about this item..."
          placeholderTextColor="#5A6B8C"
          multiline
          numberOfLines={4}
          value={newReview}
          onChangeText={setNewReview}
          textAlignVertical="top"
        />
        <TouchableOpacity 
          style={[styles.postButton, !newReview.trim() && styles.postButtonDisabled]}
          onPress={handlePostReview}
          disabled={!newReview.trim()}
        >
          <Text style={styles.postButtonText}>Post Review</Text>
        </TouchableOpacity>
      </View>

      {/* Reviews List */}
      <View style={styles.reviewsListSection}>
        <Text style={styles.sectionTitle}>
          Reviews ({reviews.length})
        </Text>
        {reviews.length === 0 ? (
          <View style={styles.emptyReviews}>
            <Ionicons name="chatbubbles-outline" size={48} color="#5A6B8C" />
            <Text style={styles.emptyReviewsText}>No reviews yet</Text>
            <Text style={styles.emptyReviewsSubtext}>Be the first to review this item!</Text>
          </View>
        ) : (
          reviews.map((review, index) => (
            <View key={index} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewerInfo}>
                  <Ionicons name="person-circle" size={32} color="#C89B3C" />
                  <Text style={styles.reviewerName}>Tenno #{index + 1}</Text>
                </View>
                <Text style={styles.reviewDate}>Just now</Text>
              </View>
              <Text style={styles.reviewText}>{review}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.overlayPressable} onPress={onClose} />
        <View style={styles.modalContent}>

          {/* Tab Navigation */}
          <View style={styles.tabNav}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'details' && styles.tabActive]}
              onPress={() => setActiveTab('details')}
            >
              <Ionicons 
                name="information-circle" 
                size={20} 
                color={activeTab === 'details' ? '#C89B3C' : '#8B9DC3'} 
              />
              <Text style={[styles.tabText, activeTab === 'details' && styles.tabTextActive]}>
                Details
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'reviews' && styles.tabActive]}
              onPress={() => setActiveTab('reviews')}
            >
              <Ionicons 
                name="chatbubbles" 
                size={20} 
                color={activeTab === 'reviews' ? '#C89B3C' : '#8B9DC3'} 
              />
              <Text style={[styles.tabText, activeTab === 'reviews' && styles.tabTextActive]}>
                Reviews
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'details' ? renderDetailsTab() : renderReviewsTab()}
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
    maxHeight: '85%',
    backgroundColor: '#121825',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#C89B3C',
    overflow: 'hidden',
    zIndex: 2,
  },
  overlayPressable: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  tabNav: {
    flexDirection: 'row',
    backgroundColor: '#0A0E1A',
    borderBottomWidth: 2,
    borderBottomColor: '#1F2937',
    paddingTop: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#C89B3C',
  },
  tabText: {
    fontSize: 16,
    color: '#8B9DC3',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#C89B3C',
  },
  tabContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
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
  priceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  creditIcon: {
    width: 20,
    height: 20,
  },
  ducatIcon: {
    width: 20,
    height: 20,
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
  dropdownContainer: {
    backgroundColor: '#1A2332',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A3442',
    overflow: 'hidden',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  dropdownTitle: {
    fontSize: 14,
    color: '#8B9DC3',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dropdownMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownCount: {
    fontSize: 16,
    color: '#C89B3C',
    fontWeight: 'bold',
  },
  dropdownList: {
    borderTopWidth: 1,
    borderTopColor: '#2A3442',
    paddingVertical: 8,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  dropdownEmpty: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#5A6B8C',
    fontSize: 14,
  },
  likeSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1A2332',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#2A3442',
  },
  likeButtonActive: {
    borderColor: '#C89B3C',
    backgroundColor: '#1F2332',
  },
  likeText: {
    fontSize: 16,
    color: '#8B9DC3',
    fontWeight: '600',
  },
  likeTextActive: {
    color: '#C89B3C',
  },
  postReviewSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#C89B3C',
    fontWeight: 'bold',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  reviewInput: {
    backgroundColor: '#1A2332',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#2A3442',
    marginBottom: 12,
  },
  postButton: {
    backgroundColor: '#C89B3C',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: '#3A3A3A',
    opacity: 0.5,
  },
  postButtonText: {
    color: '#0A0E1A',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  reviewsListSection: {
    marginBottom: 16,
  },
  emptyReviews: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyReviewsText: {
    fontSize: 18,
    color: '#8B9DC3',
    fontWeight: '600',
    marginTop: 12,
  },
  emptyReviewsSubtext: {
    fontSize: 14,
    color: '#5A6B8C',
    marginTop: 4,
  },
  reviewCard: {
    backgroundColor: '#1A2332',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#C89B3C',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewerName: {
    fontSize: 14,
    color: '#C89B3C',
    fontWeight: '600',
  },
  reviewDate: {
    fontSize: 12,
    color: '#5A6B8C',
  },
  reviewText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
});
