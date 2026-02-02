import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWishlist } from '../contexts/WishlistContext';
import { useInventory } from '../contexts/InventoryContext';
import { useAllItems } from '../contexts/AllItemsContext';
import { getCurrentUID, getCurrentUsername } from '../utils/userStorage';
import { GestureDetector } from 'react-native-gesture-handler';
import { fetchReviews, fetchLikes } from '../services/api';
import ItemDetailsTab from '../components/items/ItemDetailsTab';
import ItemReviewsTab from '../components/items/ItemReviewsTab';
import ItemDetailHeader from '../components/items/ItemDetailHeader';
import ItemDetailTabs from '../components/items/ItemDetailTabs';
import { useLike } from '../hooks/useLike';
import { useReviewManagement } from '../hooks/useReviewManagement';
import { formatDate, getRelativeTime } from '../utils/dateUtils';
import { createSwipeGesture } from '../utils/gestureHelpers';

export default function ItemDetailScreen({ route, navigation }) {
  const { item } = route.params;
  const [CURRENT_UID, setCURRENT_UID] = useState(null);
  const [showOfferings, setShowOfferings] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const { toggleWishlist, isInWishlist, updateWishlistLikes } = useWishlist();
  const { updateItemLikes: updateInventoryLikes } = useInventory();
  const { updateItemLikes: updateAllItemsLikes } = useAllItems();
  const onWishlist = isInWishlist(item.id || item._id);
  const insets = useSafeAreaInsets();
  const bottomSpacer = insets.bottom + 90;

  const syncLikeCount = (newCount) => {
    const itemId = item.id || item._id;
    updateInventoryLikes(itemId, newCount);
    updateAllItemsLikes(itemId, newCount);
    updateWishlistLikes(itemId, newCount);
  };

  const {
    userLiked,
    likeCount,
    isLiking,
    handleLike: handleLikeClick,
  } = useLike(
    false,
    item?.likes?.length || 0,
    syncLikeCount
  );

  const {
    reviews,
    newReview,
    setNewReview,
    isPostingReview,
    isLoadingReviews,
    editingReviewKey,
    editingReviewText,
    setEditingReviewText,
    getReviewKey,
    getReviewId,
    handlePostReview,
    startEditingReview,
    cancelEditingReview,
    saveEditingReview,
    confirmDeleteReview,
    hasUserReview,
  } = useReviewManagement(item.id || item._id);

  const swipeGesture = createSwipeGesture(activeTab, setActiveTab, navigation);

  // Get user UID on mount
  useEffect(() => {
    const loadUID = async () => {
      const uid = await getCurrentUID();
      setCURRENT_UID(uid);
    };
    loadUID();
  }, []);

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

  const handleWishlist = () => {
    toggleWishlist(item);
  };

  const handlePostReviewWrapper = async () => {
    await handlePostReview(CURRENT_UID, item._id?.$oid || item._id || item.id);
  };
  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <ItemDetailHeader
        title={item.name}
        onBack={() => navigation.goBack()}
        onToggleWishlist={handleWishlist}
        isWishlisted={onWishlist}
        styles={styles}
      />

      {/* Tab Navigation */}
      <ItemDetailTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        styles={styles}
      />

      {activeTab === 'details' ? (
        <ItemDetailsTab
          item={item}
          bottomSpacer={bottomSpacer}
          showOfferings={showOfferings}
          setShowOfferings={setShowOfferings}
          formatDate={formatDate}
          lastBrought={lastBrought}
          styles={styles}
        />
      ) : (
        <ItemReviewsTab
          bottomSpacer={bottomSpacer}
          isLoadingReviews={isLoadingReviews}
          likeCount={likeCount}
          userLiked={userLiked}
          isLiking={isLiking}
          handleLike={() => handleLikeClick(String(item.id || item._id))}
          hasUserReview={CURRENT_UID ? hasUserReview(CURRENT_UID) : false}
          newReview={newReview}
          setNewReview={setNewReview}
          isPostingReview={isPostingReview}
          handlePostReview={handlePostReviewWrapper}
          reviews={reviews}
          CURRENT_UID={CURRENT_UID}
          getRelativeTime={getRelativeTime}
          editingReviewKey={editingReviewKey}
          getReviewKey={getReviewKey}
          editingReviewText={editingReviewText}
          setEditingReviewText={setEditingReviewText}
          saveEditingReview={saveEditingReview}
          cancelEditingReview={cancelEditingReview}
          startEditingReview={startEditingReview}
          confirmDeleteReview={confirmDeleteReview}
          styles={styles}
        />
      )}
      </View>
    </GestureDetector>
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
  likeButtonLoading: {
    opacity: 0.6,
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
  loadingReviews: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingReviewsText: {
    fontSize: 16,
    color: '#8B9DC3',
    fontWeight: '600',
    marginTop: 12,
  },
  reviewCard: {
    backgroundColor: '#0F1419',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A2332',
    marginBottom: 12,
  },
  ownReviewCard: {
    borderColor: '#D4A574',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewActionButton: {
    padding: 6,
  },
  reviewActionsBottom: {
    flexDirection: 'row',
    gap: 20,
    alignSelf: 'flex-end',
    marginTop: 12,
  },
  reviewEditContainer: {
    marginTop: 12,
  },
  reviewEditInput: {
    backgroundColor: '#0F1419',
    borderWidth: 1,
    borderColor: '#1A2332',
    borderRadius: 10,
    padding: 10,
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 80,
  },
  reviewEditActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 10,
  },
  reviewEditButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  reviewEditSave: {
    backgroundColor: '#D4A574',
  },
  reviewEditCancel: {
    backgroundColor: '#3A4556',
  },
  reviewEditButtonText: {
    color: '#0A0E1A',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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