import { StatusBar } from 'expo-status-bar';
import { Alert, View, Text, useWindowDimensions, Animated as RNAnimated } from 'react-native';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWishlist } from '../contexts/WishlistContext';
import { useInventory } from '../contexts/InventoryContext';
import { useAllItems } from '../contexts/AllItemsContext';
import { getCurrentUID, getCurrentUsername } from '../utils/userStorage';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { fetchReviews, fetchLikes, reportReview, fetchMarketData } from '../services/api';
import { dbHelpers } from '../utils/storage';
import { storageHelpers } from '../utils/storage';
import ItemDetailsTab from '../components/items/ItemDetailsTab';
import ItemReviewsTab from '../components/items/ItemReviewsTab';
import ItemMarketTab from '../components/items/ItemMarketTab';
import ItemDetailHeader from '../components/items/ItemDetailHeader';
import ItemDetailTabs from '../components/items/ItemDetailTabs';
import { useLike } from '../hooks/useLike';
import { useVote } from '../hooks/useVote';
import { useReviewManagement } from '../hooks/useReviewManagement';
import { formatDate, getRelativeTime } from '../utils/dateUtils';
import { MARKET_EXCLUDED_ITEMS } from '../constants/items';
import { ReviewProvider } from '../contexts/ReviewContext';
import { useUserActions } from '../contexts/UserActionsContext';
import styles from '../styles/screens/ItemDetailScreen.styles';

export default function ItemDetailScreen({ route, navigation }) {
  const { item } = route.params;
  const { width: screenWidth } = useWindowDimensions();
  const [CURRENT_UID, setCURRENT_UID] = useState(null);
  const [showOfferings, setShowOfferings] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [marketData, setMarketData] = useState(null);
  const [isLoadingMarket, setIsLoadingMarket] = useState(false);
  const [reportedReviewKeys, setReportedReviewKeys] = useState([]);

  // Animated pager
  const translateX = useRef(new RNAnimated.Value(0)).current;
  const tabIndexRef = useRef(0);

  const updateTabIndex = useCallback((newIndex) => {
    tabIndexRef.current = newIndex;
    setTabIndex(newIndex);
  }, []);

  const { markLiked, markReviewed } = useUserActions();

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
  const { toggleWishlist, isInWishlist, updateWishlistLikes, updateWishlistReviewCount, updateWishlistVoteCounts } = useWishlist();
  const { items: inventoryItems, isHere: isBaroHere, updateItemLikes: updateInventoryLikes, updateItemReviewCount: updateInventoryReviewCount, updateItemWishlistCount: updateInventoryWishlistCount, updateItemVoteCounts: updateInventoryVoteCounts } = useInventory();
  const { items: allItems, updateItemLikes: updateAllItemsLikes, updateItemReviewCount: updateAllItemsReviewCount, updateItemWishlistCount: updateAllItemsWishlistCount, updateItemVoteCounts: updateAllItemsVoteCounts } = useAllItems();
  const onWishlist = isInWishlist(item.id || item._id);
  const insets = useSafeAreaInsets();
  const bottomSpacer = insets.bottom + 90;

  // Check if market tab should be shown
  const hasMarketTab = item && (
    item.type.toLowerCase().includes('mod') ||
    item.type.toLowerCase().startsWith('weapon') ||
    item.type.toLowerCase().startsWith('void relic')
  ) && !MARKET_EXCLUDED_ITEMS.includes(item.name.toLowerCase());

  const tabCount = hasMarketTab ? 3 : 2;

  // Build tab routes for the tab bar
  const routes = useMemo(() => {
    const r = [
      { key: 'details', title: 'Details', icon: 'information-circle' },
      { key: 'reviews', title: 'Reviews', icon: 'chatbubbles' },
    ];
    if (hasMarketTab) {
      r.push({ key: 'market', title: 'Market', icon: 'trending-up' });
    }
    return r;
  }, [hasMarketTab]);

  // Animate to a tab index
  const animateToIndex = useCallback((index) => {
    RNAnimated.spring(translateX, {
      toValue: -index * screenWidth,
      damping: 20,
      stiffness: 200,
      mass: 0.5,
      useNativeDriver: true,
    }).start();
  }, [screenWidth, translateX]);

  // Swipe gesture
  const panGesture = useMemo(() =>
    Gesture.Pan()
      .activeOffsetX([-15, 15])
      .failOffsetY([-10, 10])
      .onUpdate((event) => {
        const base = -tabIndexRef.current * screenWidth;
        translateX.setValue(base + event.translationX);
      })
      .onEnd((event) => {
        const { translationX, velocityX } = event;
        let newIndex = tabIndexRef.current;

        // Swipe right
        if (translationX > 50 || velocityX > 500) {
          if (tabIndexRef.current === 0) {
            // First tab — go back
            animateToIndex(0);
            navigation.goBack();
            return;
          } else {
            newIndex = tabIndexRef.current - 1;
          }
        }
        // Swipe left
        else if (translationX < -50 || velocityX < -500) {
          if (tabIndexRef.current < tabCount - 1) {
            newIndex = tabIndexRef.current + 1;
          }
        }

        newIndex = Math.max(0, Math.min(newIndex, tabCount - 1));
        animateToIndex(newIndex);
        if (newIndex !== tabIndexRef.current) {
          updateTabIndex(newIndex);
        }
      })
      .runOnJS(true),
    [screenWidth, tabCount, navigation, updateTabIndex, animateToIndex]
  );

  // Animate to correct position when tab is tapped
  useEffect(() => {
    animateToIndex(tabIndex);
    tabIndexRef.current = tabIndex;
  }, [tabIndex, animateToIndex]);

  const syncLikeCount = (newCount) => {
    const itemId = item.id || item._id;
    updateInventoryLikes(itemId, newCount);
    updateAllItemsLikes(itemId, newCount);
    updateWishlistLikes(itemId, newCount);
    dbHelpers.updateItemLikes(itemId, newCount);
  };

  const syncReviewCount = useCallback((delta) => {
    const id = item.id || item._id;
    updateInventoryReviewCount(id, delta);
    updateAllItemsReviewCount(id, delta);
    updateWishlistReviewCount(id, delta);
    dbHelpers.updateItemReviewCount(id, delta);
  }, [item, updateInventoryReviewCount, updateAllItemsReviewCount, updateWishlistReviewCount]);

  const syncVoteArrays = useCallback((buy, skip) => {
    const id = item.id || item._id;
    updateInventoryVoteCounts(id, buy, skip);
    updateAllItemsVoteCounts(id, buy, skip);
    updateWishlistVoteCounts(id, buy, skip);
    dbHelpers.updateItemVoteCounts(id, buy, skip);
  }, [item, updateInventoryVoteCounts, updateAllItemsVoteCounts, updateWishlistVoteCounts]);

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
    buyCount,
    skipCount,
    userVote,
    isVoting,
    handleVote,
  } = useVote(
    String(item?._id?.$oid || item?._id || item?.id || ''),
    CURRENT_UID,
    syncVoteArrays,
    item?.buy || [],
    item?.skip || [],
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
  } = useReviewManagement(item.id || item._id, syncReviewCount);

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
  // Only skip the last offering date if Baro is active AND this item is in the current inventory.
  // Items from the archive not in the current visit should always show their actual last date.
  const isInCurrentInventory = isBaroHere && inventoryItems.some(
    (inv) => String(inv._id?.$oid || inv._id || inv.id) === String(item._id?.$oid || item._id || item.id)
  );
  const lastBrought = isInCurrentInventory
    ? (offeringDates.length >= 2 ? offeringDates[offeringDates.length - 2] : null)
    : (offeringDates.length >= 1 ? offeringDates[offeringDates.length - 1] : null);

  const handleWishlist = () => {
    const id = item.id || item._id;
    const isCurrentlyWishlisted = isInWishlist(id);
    const delta = isCurrentlyWishlisted ? -1 : 1;
    updateInventoryWishlistCount(id, delta);
    updateAllItemsWishlistCount(id, delta);
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
        console.error('Failed to load likes', { itemId, error });
      }
    };

    void loadLikes();
  }, [itemId, CURRENT_UID, setLikeCount, setUserLiked]);

  useEffect(() => {
    if (CURRENT_UID && itemId) {
      void fetchReviewsAndLikes(CURRENT_UID);
    }
  }, [CURRENT_UID, itemId]);

  // Persist liked state to UserActionsContext for card display
  useEffect(() => {
    if (CURRENT_UID && itemId) markLiked(itemId, userLiked);
  }, [userLiked, CURRENT_UID, itemId]);

  // Persist reviewed state to UserActionsContext for card display
  useEffect(() => {
    if (CURRENT_UID && itemId) markReviewed(itemId, hasUserReview(CURRENT_UID));
  }, [reviews, CURRENT_UID, itemId]);

  useEffect(() => {
    const loadMarketData = async () => {
      if (!hasMarketTab || !item?.name) return;

      try {
        setIsLoadingMarket(true);
        const data = await fetchMarketData(item.name);
        setMarketData(data?.market || null);
      } catch (error) {
        console.error('Failed to load market data', { itemId, error });
        setMarketData(null);
      } finally {
        setIsLoadingMarket(false);
      }
    };

    void loadMarketData();
  }, [itemId, hasMarketTab]);

  // Set active tab by key (for tab bar taps)
  const setActiveTabByKey = useCallback((key) => {
    const idx = routes.findIndex((r) => r.key === key);
    if (idx !== -1) updateTabIndex(idx);
  }, [routes, updateTabIndex]);

  // Bundle review/like state into context to avoid prop-drilling
  const handleLike = useCallback(() => handleLikeClick(itemId, CURRENT_UID), [handleLikeClick, itemId, CURRENT_UID]);
  const boundSaveEditing = useCallback((index) => saveEditingReview(index, CURRENT_UID), [saveEditingReview, CURRENT_UID]);
  const boundConfirmDelete = useCallback((review, index) => confirmDeleteReview(review, index, CURRENT_UID), [confirmDeleteReview, CURRENT_UID]);
  const hasReview = CURRENT_UID ? hasUserReview(CURRENT_UID) : false;

  const reviewContextValue = useMemo(() => ({
    isLoadingReviews,
    likeCount,
    userLiked,
    isLiking,
    handleLike,
    hasUserReview: hasReview,
    newReview,
    setNewReview,
    isPostingReview,
    handlePostReview: handlePostReviewWrapper,
    reviews,
    CURRENT_UID,
    getRelativeTime,
    editingReviewKey,
    getReviewKey,
    editingReviewText,
    setEditingReviewText,
    saveEditingReview: boundSaveEditing,
    cancelEditingReview,
    startEditingReview,
    confirmDeleteReview: boundConfirmDelete,
    onReportReview: handleReportReview,
    reportedReviewKeys,
    styles,
  }), [
    isLoadingReviews, likeCount, userLiked, isLiking, handleLike,
    hasReview, newReview, isPostingReview, reviews, CURRENT_UID,
    editingReviewKey, editingReviewText, boundSaveEditing,
    boundConfirmDelete, reportedReviewKeys,
  ]);

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        <StatusBar style="light" />
        
        {/* Header */}
        <ItemDetailHeader
          title={item.name}
          onBack={() => navigation.goBack()}
          styles={styles}
        />

        {/* Tab Navigation */}
        <ItemDetailTabs
          activeTab={routes[tabIndex]?.key}
          setActiveTab={setActiveTabByKey}
          styles={styles}
          item={item}
          hasMarketTab={hasMarketTab}
        />

        {/* Swipeable tab content */}
        <ReviewProvider value={reviewContextValue}>
          <View style={{ flex: 1, overflow: 'hidden' }}>
            <RNAnimated.View
              style={{
                flexDirection: 'row',
                width: screenWidth * tabCount,
                flex: 1,
                transform: [{ translateX }],
              }}
            >
              <View style={{ width: screenWidth, flex: 1 }}>
                <ItemDetailsTab
                  item={displayItem}
                  bottomSpacer={bottomSpacer}
                  showOfferings={showOfferings}
                  setShowOfferings={setShowOfferings}
                  formatDate={formatDate}
                  lastBrought={lastBrought}
                  styles={styles}
                  isInCurrentInventory={isInCurrentInventory}
                  voteData={{ buyCount, skipCount, userVote, isVoting, handleVote }}
                  onToggleWishlist={handleWishlist}
                  isWishlisted={onWishlist}
                />
              </View>
              <View style={{ width: screenWidth, flex: 1 }}>
                <ItemReviewsTab bottomSpacer={bottomSpacer} />
              </View>
              {hasMarketTab && (
                <View style={{ width: screenWidth, flex: 1 }}>
                  <ItemMarketTab
                    item={displayItem}
                    bottomSpacer={bottomSpacer}
                    styles={styles}
                    marketData={marketData}
                    isLoadingMarket={isLoadingMarket}
                  />
                </View>
              )}
            </RNAnimated.View>
          </View>
        </ReviewProvider>
      </View>
    </GestureDetector>
  );
}