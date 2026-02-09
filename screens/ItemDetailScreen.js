import { StatusBar } from 'expo-status-bar';
import { Alert, View, Text } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWishlist } from '../contexts/WishlistContext';
import { useInventory } from '../contexts/InventoryContext';
import { useAllItems } from '../contexts/AllItemsContext';
import { getCurrentUID, getCurrentUsername } from '../utils/userStorage';
import { GestureDetector } from 'react-native-gesture-handler';
import { fetchReviews, fetchLikes, reportReview, fetchMarketData } from '../services/api';
import { dbHelpers } from '../utils/storage';
import { storageHelpers } from '../utils/storage';
import ItemDetailsTab from '../components/items/ItemDetailsTab';
import ItemReviewsTab from '../components/items/ItemReviewsTab';
import ItemMarketTab from '../components/items/ItemMarketTab';
import ItemDetailHeader from '../components/items/ItemDetailHeader';
import ItemDetailTabs from '../components/items/ItemDetailTabs';
import { useLike } from '../hooks/useLike';
import { useReviewManagement } from '../hooks/useReviewManagement';
import { formatDate, getRelativeTime } from '../utils/dateUtils';
import { createSwipeGesture } from '../utils/gestureHelpers';
import { MARKET_EXCLUDED_ITEMS } from '../constants/items';
import styles from '../styles/screens/ItemDetailScreen.styles';

export default function ItemDetailScreen({ route, navigation }) {
  const { item } = route.params;
  const [CURRENT_UID, setCURRENT_UID] = useState(null);
  const [showOfferings, setShowOfferings] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [marketData, setMarketData] = useState(null);
  const [isLoadingMarket, setIsLoadingMarket] = useState(false);
  const [reportedReviewKeys, setReportedReviewKeys] = useState([]);

  // Load reported reviews on mount
  useEffect(() => {
    const loadReported = async () => {
      const reported = await storageHelpers.getReportedReviews();
      setReportedReviewKeys(reported);
    };
    loadReported();
  }, []);

  const handleReportReview = useCallback((review, index) => {
    const reviewKey = review?._id?.$oid || review?._id || String(index);
    Alert.alert(
      'Report Review',
      'Are you sure you want to report this review? It will be hidden from your view.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          style: 'destructive',
          onPress: async () => {
            await storageHelpers.addReportedReview(reviewKey);
            setReportedReviewKeys((prev) => [...prev, reviewKey]);
            // Increment report count on the backend (fire-and-forget)
            reportReview(reviewKey).catch((err) =>
              console.error('Failed to report review to server:', err)
            );
          },
        },
      ]
    );
  }, []);

  // Disable default swipe gesture to prevent navigating away
  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: false,
    });
  }, [navigation]);
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
    // Single DB write (hooks only update in-memory state)
    dbHelpers.updateItemLikes(itemId, newCount);
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
    fetchReviewsAndLikes,
    handlePostReview,
    startEditingReview,
    cancelEditingReview,
    saveEditingReview,
    confirmDeleteReview,
    hasUserReview,
  } = useReviewManagement(item.id || item._id);

  // Check if market tab should be shown
  const hasMarketTab = item && ['Mod', 'Weapon', 'Void Relic'].some(
    category => item.type.toLowerCase().startsWith(category.toLowerCase())
  ) && !MARKET_EXCLUDED_ITEMS.includes(item.name.toLowerCase());

  const swipeGesture = createSwipeGesture(activeTab, setActiveTab, navigation, hasMarketTab);

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

  useEffect(() => {
    if (CURRENT_UID && itemId) {
      void fetchReviewsAndLikes(CURRENT_UID);
    }
  }, [CURRENT_UID, itemId]);

  useEffect(() => {
    const loadMarketData = async () => {
      if (!hasMarketTab || !item?.name) return;

      try {
        setIsLoadingMarket(true);
        const data = await fetchMarketData(item.name);
        setMarketData(data?.market || null);
      } catch (error) {
        console.error('❌ Failed to load market data', { itemId, error });
        setMarketData(null);
      } finally {
        setIsLoadingMarket(false);
      }
    };

    void loadMarketData();
  }, [itemId, hasMarketTab]);

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
        item={item}
        hasMarketTab={hasMarketTab}
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
      ) : activeTab === 'market' ? (
        <ItemMarketTab
          item={displayItem}
          bottomSpacer={bottomSpacer}
          styles={styles}
          marketData={marketData}
          isLoadingMarket={isLoadingMarket}
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
          onReportReview={handleReportReview}
          reportedReviewKeys={reportedReviewKeys}
          styles={styles}
        />
      )}
      </View>
    </GestureDetector>
  );
}

