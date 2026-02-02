import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
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
import styles from '../styles/screens/ItemDetailScreen.styles';

export default function ItemDetailScreen({ route, navigation }) {
  const { item } = route.params;
  const [CURRENT_UID, setCURRENT_UID] = useState(null);
  const [showOfferings, setShowOfferings] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const { toggleWishlist, isInWishlist, updateWishlistLikes } = useWishlist();
  const { items: inventoryItems, updateItemLikes: updateInventoryLikes } = useInventory();
  const { items: allItems, updateItemLikes: updateAllItemsLikes } = useAllItems();
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
    setUserLiked,
    likeCount,
    setLikeCount,
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
  const lastBrought = offeringDates.length >= 1 
    ? offeringDates[offeringDates.length - 1]
    : null;

  const handleWishlist = () => {
    toggleWishlist(item);
  };

  const itemId = String(item._id?.$oid || item._id || item.id);
  const fallbackItem =
    allItems?.find((current) => String(current?.id || current?._id) === itemId) ||
    inventoryItems?.find((current) => String(current?.id || current?._id) === itemId);
  const displayItem = fallbackItem?.offeringDates?.length
    ? { ...item, offeringDates: fallbackItem.offeringDates }
    : item;

  const handlePostReviewWrapper = async () => {
    await handlePostReview(CURRENT_UID, itemId);
  };

  useEffect(() => {
    const loadLikes = async () => {
      try {
        if (!itemId) return;
        const likeData = await fetchLikes(itemId);
        const likes = Array.isArray(likeData?.likes) ? likeData.likes : [];
        const count = Number.isFinite(likeData?.count) ? likeData.count : likes.length;

        setLikeCount(count);
        syncLikeCount(count);

        if (!CURRENT_UID) {
          return;
        }

        const currentUid = String(CURRENT_UID);
        const likedByUser = likes.some((like) => String(like?.uid) === currentUid);
        setUserLiked(likedByUser);
      } catch (error) {
        console.error('❌ Failed to load likes', { itemId, error });
      }
    };

    void loadLikes();
  }, [itemId, CURRENT_UID, setLikeCount, setUserLiked]);
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
          item={displayItem}
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
          handleLike={() => handleLikeClick(itemId, CURRENT_UID)}
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
          saveEditingReview={(index) => saveEditingReview(index, CURRENT_UID)}
          cancelEditingReview={cancelEditingReview}
          startEditingReview={startEditingReview}
          confirmDeleteReview={(review, index) => confirmDeleteReview(review, index, CURRENT_UID)}
          styles={styles}
        />
      )}
      </View>
    </GestureDetector>
  );
}

