import { Text, View, Image, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BaroIcon from '../../assets/icons/icon_baro.svg';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAllItems } from '../../contexts/AllItemsContext';
import { useInventory } from '../../contexts/InventoryContext';
import { useState, useRef, useEffect, memo } from 'react';
import styles from '../../styles/components/items/ItemCard.styles';
import { colors } from '../../constants/theme';
import { MARK_OWNED_EXCLUDED_ITEMS } from '../../constants/items';
import { useUserActions } from '../../contexts/UserActionsContext';

const formatCredits = n => {
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${+(n / 1_000).toFixed(1)}k`;
  return String(n);
};

const PARTICLE_DIRECTIONS = [
  { dx:   0, dy: -60 },
  { dx:  48, dy: -38 },
  { dx:  54, dy:  18 },
  { dx:  22, dy:  56 },
  { dx: -40, dy:  44 },
  { dx: -54, dy: -14 },
];

function ItemCard({ item, onPress, isNew, hideWishlistBadge = false, showAvailableBadge = false }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { updateItemWishlistCount: updateAllItemsWishlistCount } = useAllItems();
  const { updateItemWishlistCount: updateInventoryWishlistCount, items: inventoryItems, isHere: isBaroHere } = useInventory();
  const { hasLiked, hasReviewed, isOwned, markOwned } = useUserActions();
  const itemId       = item?.id || item?._id;
  const inWishlist   = isInWishlist(itemId);
  const userLiked    = hasLiked(itemId);
  const userReviewed = hasReviewed(itemId);
  const owned        = isOwned(itemId);
  const [useCdnFallback, setUseCdnFallback] = useState(false);
  useEffect(() => setUseCdnFallback(false), [item?.wikiImageLink]);

  // Check if this item is in Baro's current inventory
  const isInCurrentInventory = isBaroHere && inventoryItems.some(
    (inv) => String(inv._id?.$oid || inv._id || inv.id) === String(item?._id?.$oid || item?._id || item?.id)
  );

  // Vote badge — derived from item's buy[]/skip[] arrays
  const voteBadge = (() => {
    if (!isInCurrentInventory) return null;
    const buyCount = Array.isArray(item.buy) ? item.buy.length : 0;
    const skipCount = Array.isArray(item.skip) ? item.skip.length : 0;
    if (buyCount === 0 && skipCount === 0) return null;
    const total = buyCount + skipCount;
    const winner = buyCount >= skipCount ? 'buy' : 'skip';
    const winnerCount = winner === 'buy' ? buyCount : skipCount;
    const pct = Math.round((winnerCount / total) * 100);
    return { label: winner === 'buy' ? 'Buy' : 'Skip', pct, winner };
  })();

  const cardScale    = useRef(new Animated.Value(1)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const particleProgress = useRef(
    PARTICLE_DIRECTIONS.map(() => new Animated.Value(0))
  ).current;
  const ribbonSlide       = useRef(new Animated.Value(inWishlist ? 0 : -160)).current;
  const glowOpacity       = useRef(new Animated.Value(inWishlist && !hideWishlistBadge ? 1 : 0)).current;
  const prevInWishlist    = useRef(inWishlist);
  const internalToggleRef = useRef(false);
  const longPressActivated = useRef(false);
  const [ribbonVisible, setRibbonVisible] = useState(inWishlist);

  useEffect(() => {
    if (inWishlist && !prevInWishlist.current) {
      setRibbonVisible(true);
      ribbonSlide.setValue(-160);
      const animations = [
        Animated.spring(ribbonSlide, {
          toValue: 0,
          friction: 7,
          tension: 180,
          useNativeDriver: true,
        }),
      ];
      if (!hideWishlistBadge) {
        animations.push(Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }));
      }
      Animated.parallel(animations).start();
    } else if (!inWishlist && prevInWishlist.current && !internalToggleRef.current) {
      // Removed externally (e.g. from item detail screen) — play remove animation
      Animated.parallel([
        Animated.timing(ribbonSlide, { toValue: -160, duration: 350, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0,    duration: 600, useNativeDriver: false }),
      ]).start(() => setRibbonVisible(false));
    }
    internalToggleRef.current = false;
    prevInWishlist.current = inWishlist;
  }, [inWishlist]);

  const [showParticles, setShowParticles] = useState(false);
  const [showFlash,     setShowFlash]     = useState(false);
  const pressOpacity = useRef(new Animated.Value(1)).current;

  const playAddAnimation = () => {
    // Don't reset cardScale — let it animate from whatever pressed state it's already in
    flashOpacity.setValue(0);
    particleProgress.forEach(p => p.setValue(0));
    setShowParticles(true);
    setShowFlash(true);

    Animated.parallel([
      Animated.sequence([
        Animated.spring(cardScale,  { toValue: 1.05, friction: 4, tension: 220, useNativeDriver: true }),
        Animated.spring(cardScale,  { toValue: 1,    friction: 6, tension: 200, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(flashOpacity, { toValue: 0.28, duration: 100, useNativeDriver: true }),
        Animated.timing(flashOpacity, { toValue: 0,    duration: 450, useNativeDriver: true }),
      ]),
      Animated.stagger(50, particleProgress.map(p =>
        Animated.timing(p, { toValue: 1, duration: 750, useNativeDriver: true })
      )),
    ]).start(() => {
      setShowParticles(false);
      setShowFlash(false);
    });
  };

  const playRemoveAnimation = (onDone) => {
    if (hideWishlistBadge) {
      // Wishlist screen: shrink + fade out, then let parent remove from list
      Animated.parallel([
        Animated.timing(pressOpacity, { toValue: 0, duration: 200, useNativeDriver: false }),
        Animated.timing(cardScale,    { toValue: 0.85, duration: 200, useNativeDriver: true }),
      ]).start(() => onDone?.());
      return;
    }
    Animated.parallel([
      Animated.timing(ribbonSlide, { toValue: -160, duration: 350, useNativeDriver: true }),
      Animated.timing(glowOpacity, { toValue: 0, duration: 600, useNativeDriver: false }),
    ]).start(() => {
      setRibbonVisible(false);
      onDone?.();
    });
  };

  const handleLongPress = () => {
    longPressActivated.current = true;
    internalToggleRef.current = true;
    const delta = inWishlist ? -1 : 1;

    if (!inWishlist) {
      pressOpacity.setValue(1);
      playAddAnimation();
      updateAllItemsWishlistCount(itemId, delta);
      updateInventoryWishlistCount(itemId, delta);
      toggleWishlist(item);
    } else if (hideWishlistBadge) {
      // Wishlist screen: animate out first, then remove from context
      playRemoveAnimation(() => {
        updateAllItemsWishlistCount(itemId, delta);
        updateInventoryWishlistCount(itemId, delta);
        toggleWishlist(item);
      });
    } else {
      pressOpacity.setValue(1);
      Animated.spring(cardScale, { toValue: 1, friction: 6, tension: 200, useNativeDriver: true }).start();
      playRemoveAnimation();
      updateAllItemsWishlistCount(itemId, delta);
      updateInventoryWishlistCount(itemId, delta);
      toggleWishlist(item);
    }
  };

  return (
    <View>
      {/* Particle hearts burst */}
      {showParticles && PARTICLE_DIRECTIONS.map(({ dx, dy }, i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={[
            styles.heartPopup,
            {
              opacity: particleProgress[i].interpolate({
                inputRange: [0, 0.15, 0.85, 1],
                outputRange: [0, 1, 1, 0],
              }),
              transform: [
                { translateX: particleProgress[i].interpolate({ inputRange: [0, 1], outputRange: [0, dx] }) },
                { translateY: particleProgress[i].interpolate({ inputRange: [0, 1], outputRange: [0, dy] }) },
                { scale: particleProgress[i].interpolate({ inputRange: [0, 0.35, 1], outputRange: [0.2, 1.1, 0.7] }) },
              ],
            },
          ]}
        >
          <Ionicons name="heart" size={22} color={colors.accent} />
        </Animated.View>
      ))}
      <Animated.View style={{ transform: [{ scale: cardScale }] }}>
          <Animated.View style={[styles.cardWrapper, {
            opacity: pressOpacity,
            shadowOpacity: glowOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] }),
            elevation: glowOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }),
          }]}>
            <Pressable 
            style={[styles.itemCard, isNew && styles.itemCardNew]}
            onPress={onPress}
            onLongPress={handleLongPress}
            accessibilityRole="button"
            accessibilityLabel={`${item.name}, ${item.type}, ${item.creditPrice.toLocaleString()} credits, ${item.ducatPrice} ducats${inWishlist ? ', in wishlist' : ''}`}
            accessibilityHint="Tap to view details, long press to toggle wishlist"
            onPressIn={() => {
              longPressActivated.current = false;
              Animated.timing(pressOpacity, { toValue: 0.7, duration: 80, useNativeDriver: false }).start();
              Animated.timing(cardScale,    { toValue: 0.97, duration: 80, useNativeDriver: true }).start();
            }}
            onPressOut={() => {
              if (longPressActivated.current) return;
              Animated.timing(pressOpacity, { toValue: 1, duration: 80, useNativeDriver: false }).start();
              Animated.timing(cardScale,    { toValue: 1,   duration: 80, useNativeDriver: true }).start();
            }}
          >
        {showFlash && (
          <Animated.View pointerEvents="none" style={[styles.flashOverlay, { opacity: flashOpacity }]} />
        )}
        {isNew && (
          <View style={styles.newRibbon} pointerEvents="none">
            <View style={styles.newRibbonFoldLeft} />
            <View style={styles.newRibbonFoldRight} />
            <Text style={styles.newRibbonText}>NEW</Text>
          </View>
        )}
        {ribbonVisible && !hideWishlistBadge && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.wishlistRibbon,
              { transform: [{ rotate: '-45deg' }, { translateX: ribbonSlide }] },
            ]}
          >
            <View style={styles.wishlistRibbonFoldLeft} />
            <View style={styles.wishlistRibbonFoldRight} />
            <Text style={styles.wishlistRibbonText}>WISHLIST</Text>
          </Animated.View>
        )}
        {showAvailableBadge && isInCurrentInventory && (
          <View style={styles.availableRibbon} pointerEvents="none">
            <View style={styles.availableRibbonFoldLeft} />
            <View style={styles.availableRibbonFoldRight} />
            <Text style={styles.availableRibbonText}>AVAILABLE</Text>
          </View>
        )}
      <View style={styles.cardContent}>
        <View style={styles.imageContainer}>
          {item?.wikiImageLink && item.wikiImageLink !== 'temp:modImage' && !item.wikiImageLink.endsWith('/temp:modImage') ? (
            <Image
              source={{ uri: useCdnFallback ? item.cdnImageLink : item.wikiImageLink }}
              style={styles.itemImage}
              resizeMode="contain"
              onError={() => { if (!useCdnFallback && item.cdnImageLink) setUseCdnFallback(true); }}
            />
          ) : (
            <BaroIcon width={64} height={64} color={colors.accent} />
          )}
        </View>
        
        <View style={styles.itemInfo}>
          <View style={styles.nameAndLikes}>
            <View style={styles.nameContainer}>
              <Text style={styles.itemName} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{item.name}</Text>
              <Text style={styles.categoryText}>{item.type}</Text>
            </View>
          </View>

          {/* Compact stat row — only shows non-zero counts */}
          {(() => {
            const likesCount = Array.isArray(item.likes) ? item.likes.length : (item.likes || 0);
            const reviewsCount = Array.isArray(item.reviews) ? item.reviews.length : 0;
            const wishlistCount = item.wishlistCount || 0;
            const stats = [
              { icon: 'thumbs-up',   count: likesCount,    active: userLiked },
              { icon: 'chatbubbles', count: reviewsCount,  active: userReviewed },
              { icon: 'heart',       count: wishlistCount, active: inWishlist },
            ].filter(s => s.count > 0);
            return (
              <View style={styles.statsRow}>
                {stats.map((s, i) => (
                  <View key={s.icon} style={styles.statItem}>
                    <Ionicons name={s.icon} size={12} color={s.active ? colors.accent : colors.textSecondary} />
                    <Text style={[styles.statText, s.active && styles.statTextActive]}>{s.count}</Text>
                  </View>
                ))}
                {voteBadge && (
                  <View style={styles.voteBadge} pointerEvents="none">
                    <Ionicons
                      name={voteBadge.winner === 'buy' ? 'cart' : 'close-circle'}
                      size={11}
                      color={voteBadge.winner === 'buy' ? colors.accent : colors.danger}
                    />
                    <Text style={[
                      styles.voteBadgeText,
                      voteBadge.winner === 'buy' && styles.voteBadgeTextBuy,
                      voteBadge.winner === 'skip' && styles.voteBadgeTextSkip,
                    ]}>
                      {voteBadge.pct}% voted to {voteBadge.label}
                    </Text>
                  </View>
                )}
              </View>
            );
          })()}
          
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <Image
                source={require('../../assets/imgs/img_ducat.png')}
                style={styles.ducatIcon}
              />
              <Text style={styles.ducatValue}>
                {item.ducatPrice ?? 0}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Image
                source={require('../../assets/imgs/img_credit.png')}
                style={styles.creditIcon}
              />
              <Text style={styles.priceValue}>
                {formatCredits(item.creditPrice)}
              </Text>
            </View>
          </View>
        </View>
      </View>
      {!MARK_OWNED_EXCLUDED_ITEMS.includes(item.name?.toLowerCase()) && (
        <Pressable
          style={[styles.ownedButton, owned && styles.ownedButtonActive]}
          onPress={() => markOwned(itemId, !owned)}
          hitSlop={8}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: owned }}
          accessibilityLabel={owned ? 'Owned — tap to unmark' : 'Mark as owned'}
        >
          <Ionicons
            name={owned ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={16}
            color={owned ? colors.textOnAccent : colors.textDim}
          />
          <Text style={[styles.ownedButtonLabel, owned && styles.ownedButtonLabelActive]}>
            {owned ? 'Owned' : 'Mark Owned'}
          </Text>
        </Pressable>
      )}
          </Pressable>
          </Animated.View>
        </Animated.View>
    </View>
  );
}

export default memo(ItemCard, (prevProps, nextProps) => {
  // Only re-render if item data actually changed
  const prevItem = prevProps.item;
  const nextItem = nextProps.item;
  
  return (
    prevItem?.id === nextItem?.id &&
    prevItem?._id === nextItem?._id &&
    prevItem?.name === nextItem?.name &&
    prevItem?.type === nextItem?.type &&
    prevItem?.image === nextItem?.image &&
    prevItem?.creditPrice === nextItem?.creditPrice &&
    prevItem?.ducatPrice === nextItem?.ducatPrice &&
    (prevItem?.likes?.length || prevItem?.likes || 0) === (nextItem?.likes?.length || nextItem?.likes || 0) &&
    (prevItem?.reviews?.length || 0) === (nextItem?.reviews?.length || 0) &&
    (prevItem?.wishlistCount || 0) === (nextItem?.wishlistCount || 0) &&
    (prevItem?.buy?.length || 0) === (nextItem?.buy?.length || 0) &&
    (prevItem?.skip?.length || 0) === (nextItem?.skip?.length || 0) &&
    prevProps.onPress === nextProps.onPress &&
    prevProps.isNew === nextProps.isNew &&
    prevProps.hideWishlistBadge === nextProps.hideWishlistBadge
  );
});
