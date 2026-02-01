import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ScrollView, Text, Image, TouchableOpacity, TextInput, ImageBackground } from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWishlist } from '../contexts/WishlistContext';

export default function ItemDetailScreen({ route, navigation }) {
  const { item } = route.params;
  const [userLiked, setUserLiked] = useState(false);
  const [showOfferings, setShowOfferings] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [newReview, setNewReview] = useState('');
  const { toggleWishlist, isInWishlist } = useWishlist();
  const onWishlist = isInWishlist(item.id || item._id);
  const insets = useSafeAreaInsets();
  const bottomSpacer = insets.bottom + 90;

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      if (navigation.canGoBack()) {
        navigation.popToTop();
      }
    });

    return unsubscribe;
  }, [navigation]);

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Item not found</Text>
      </View>
    );
  }

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
  };

  const handleWishlist = () => {
    toggleWishlist(item);
  };

  const handlePostReview = () => {
    if (newReview.trim()) {
      setNewReview('');
    }
  };

  const reviews = item.reviews || [];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#D4A574" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{item.name}</Text>
        <TouchableOpacity 
          style={styles.wishlistButton}
          onPress={handleWishlist}
        >
          <Ionicons 
            name={onWishlist ? "heart" : "heart-outline"} 
            size={28} 
            color={onWishlist ? "#D4A574" : "#5A6B8C"} 
          />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNav}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'details' && styles.tabActive]}
          onPress={() => setActiveTab('details')}
        >
          <Ionicons 
            name="information-circle" 
            size={20} 
            color={activeTab === 'details' ? '#D4A574' : '#8B9DC3'} 
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
            color={activeTab === 'reviews' ? '#D4A574' : '#8B9DC3'} 
          />
          <Text style={[styles.tabText, activeTab === 'reviews' && styles.tabTextActive]}>
            Reviews
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'details' ? (
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: bottomSpacer }}
        showsVerticalScrollIndicator={false}
      >
        {/* Item Image with Background */}
        <ImageBackground
          source={require('../assets/background_newItem.png')}
          style={styles.imageBackgroundContainer}
          imageStyle={styles.imageBackgroundImage}
          resizeMode="cover"
          blurRadius={4}
        >
          <LinearGradient
            colors={['rgba(10, 14, 26, 0.95)', 'rgba(10, 14, 26, 0.15)']}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
            style={styles.gradientOverlay}
            pointerEvents="none"
          />
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.image }}
              style={styles.itemImage}
              resizeMode="contain"
            />
          </View>
        </ImageBackground>

        {/* Item Name and Type */}
        <View style={styles.infoSection}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.categoryText}>{item.type}</Text>
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
                color="#D4A574"
              />
            </View>
          </TouchableOpacity>

          {showOfferings && (
            <View style={styles.dropdownList}>
              {offeringDates.length === 0 ? (
                <Text style={styles.dropdownEmpty}>No offering dates available</Text>
              ) : (
                offeringDates.map((date, index) => (
                  <View key={`${date}-${index}`} style={styles.dropdownItem}>
                    <Text style={styles.dropdownItemText}>{formatDate(date)}</Text>
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>
      ) : (
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: bottomSpacer }}
        showsVerticalScrollIndicator={false}
      >
        {/* Like Button - At top of Reviews Tab */}
        <View style={styles.likeSection}>
          <TouchableOpacity 
            style={[styles.likeButton, userLiked && styles.likeButtonActive]} 
            onPress={handleLike}
          >
            <Ionicons 
              name={userLiked ? "thumbs-up" : "thumbs-up-outline"} 
              size={24} 
              color={userLiked ? "#D4A574" : "#8B9DC3"} 
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
                    <Ionicons name="person-circle" size={32} color="#D4A574" />
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 56,
    backgroundColor: '#0F1419',
    borderBottomWidth: 1,
    borderBottomColor: '#1A2332',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  wishlistButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  tabNav: {
    flexDirection: 'row',
    backgroundColor: '#0F1419',
    borderBottomWidth: 1,
    borderBottomColor: '#1A2332',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#D4A574',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B9DC3',
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: '#D4A574',
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 0,
  },
  imageBackgroundContainer: {
    width: '100%',
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageBackgroundImage: {
    borderRadius: 0,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImage: {
    width: '80%',
    height: '80%',
  },
  infoSection: {
    padding: 16,
  },
  itemName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9BA5B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 0,
  },
  pricesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  priceBox: {
    flex: 1,
    backgroundColor: '#0F1419',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A2332',
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
  priceLabel: {
    fontSize: 12,
    color: '#8B9DC3',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  creditValue: {
    fontSize: 18,
    color: '#E8E8E8',
    fontWeight: '700',
  },
  ducatValue: {
    fontSize: 18,
    color: '#D4A574',
    fontWeight: '700',
  },
  dateContainer: {
    backgroundColor: '#0F1419',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A2332',
    marginBottom: 24,
    marginHorizontal: 16,
  },
  dateLabel: {
    fontSize: 12,
    color: '#8B9DC3',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
    marginBottom: 8,
  },
  dateValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dropdownContainer: {
    backgroundColor: '#0F1419',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A2332',
    marginBottom: 24,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#151B23',
  },
  dropdownTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdownMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownCount: {
    fontSize: 14,
    color: '#D4A574',
    fontWeight: '700',
  },
  dropdownList: {
    backgroundColor: '#0F1419',
  },
  dropdownItem: {
    padding: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#1A2332',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#9BA5B8',
    fontWeight: '600',
  },
  dropdownEmpty: {
    padding: 16,
    color: '#5A6B8C',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  likeSection: {
    backgroundColor: '#0F1419',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1A2332',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#151B23',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A2332',
    gap: 8,
  },
  likeButtonActive: {
    backgroundColor: 'rgba(212, 165, 116, 0.1)',
    borderColor: '#D4A574',
  },
  likeText: {
    fontSize: 16,
    color: '#8B9DC3',
    fontWeight: '700',
  },
  likeTextActive: {
    color: '#D4A574',
  },
  postReviewSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reviewInput: {
    backgroundColor: '#0F1419',
    borderWidth: 1,
    borderColor: '#1A2332',
    borderRadius: 12,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 100,
    marginBottom: 12,
  },
  postButton: {
    backgroundColor: '#D4A574',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: '#3A4556',
    opacity: 0.5,
  },
  postButtonText: {
    color: '#0A0E1A',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reviewsListSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  emptyReviews: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyReviewsText: {
    fontSize: 16,
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
    backgroundColor: '#0F1419',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A2332',
    marginBottom: 12,
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
    fontWeight: '700',
    color: '#D4A574',
  },
  reviewDate: {
    fontSize: 12,
    color: '#5A6B8C',
  },
  reviewText: {
    fontSize: 14,
    color: '#9BA5B8',
    lineHeight: 20,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
  },
});
