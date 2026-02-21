import { Text, View, Image, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BaroIcon from '../../assets/icons/icon_baro.svg';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAllItems } from '../../contexts/AllItemsContext';
import { useInventory } from '../../contexts/InventoryContext';
import { useState, useRef, useEffect, memo } from 'react';
import styles from '../../styles/components/items/ItemCard.styles';
import { colors } from '../../constants/theme';

const PARTICLE_DIRECTIONS = [
  { dx:   0, dy: -60 },
  { dx:  48, dy: -38 },
  { dx:  54, dy:  18 },
  { dx:  22, dy:  56 },
  { dx: -40, dy:  44 },
  { dx: -54, dy: -14 },
];

function ItemCard({ item, onPress, isNew, hideWishlistBadge = false, hideWishlistBorder = false }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { updateItemWishlistCount: updateAllItemsWishlistCount } = useAllItems();
  const { updateItemWishlistCount: updateInventoryWishlistCount } = useInventory();
  const inWishlist = isInWishlist(item?.id || item?._id);

  const cardScale    = useRef(new Animated.Value(1)).current;
  const cardShakeX   = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const particleProgress = useRef(
    PARTICLE_DIRECTIONS.map(() => new Animated.Value(0))
  ).current;
  const ribbonSlide    = useRef(new Animated.Value(inWishlist ? 0 : -160)).current;
  const glowOpacity    = useRef(new Animated.Value(inWishlist ? 1 : 0)).current;
  const prevInWishlist = useRef(inWishlist);
  const [ribbonVisible, setRibbonVisible] = useState(inWishlist);

  useEffect(() => {
    if (inWishlist && !prevInWishlist.current) {
      setRibbonVisible(true);
      ribbonSlide.setValue(-160);
    Animated.parallel([
        Animated.spring(ribbonSlide, {
          toValue: 0,
          friction: 7,
          tension: 180,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }),
      ]).start();
    }
    prevInWishlist.current = inWishlist;
  }, [inWishlist]);

  const [showParticles, setShowParticles] = useState(false);
  const [showFlash,     setShowFlash]     = useState(false);
  const pressOpacity = useRef(new Animated.Value(1)).current;

  const playAddAnimation = () => {
    cardScale.setValue(1);
    flashOpacity.setValue(0);
    particleProgress.forEach(p => p.setValue(0));
    setShowParticles(true);
    setShowFlash(true);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(cardScale, { toValue: 0.94, duration: 80,  useNativeDriver: true }),
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

  const playRemoveAnimation = () => {
    Animated.parallel([
      Animated.timing(ribbonSlide, { toValue: -160, duration: 350, useNativeDriver: true }),
      Animated.timing(glowOpacity, { toValue: 0,    duration: 600, useNativeDriver: false }),
    ]).start(() => setRibbonVisible(false));
  };

  const handleLongPress = () => {
    pressOpacity.setValue(1);
    if (!inWishlist) {
      playAddAnimation();
    } else {
      playRemoveAnimation();
    }
    const itemId = item?.id || item?._id;
    const delta = inWishlist ? -1 : 1;
    updateAllItemsWishlistCount(itemId, delta);
    updateInventoryWishlistCount(itemId, delta);
    toggleWishlist(item);
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
      <Animated.View style={{ transform: [{ scale: cardScale }, { translateX: cardShakeX }] }}>
          <Animated.View style={[styles.cardWrapper, {
            opacity: pressOpacity,
            shadowOpacity: glowOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] }),
            elevation: glowOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }),
          }]}>
            <Pressable 
            style={[styles.itemCard, isNew && styles.itemCardNew]}
            onPress={onPress}
            onLongPress={handleLongPress}
            onPressIn={() => Animated.timing(pressOpacity, { toValue: 0.7, duration: 80, useNativeDriver: false }).start()}
            onPressOut={() => Animated.timing(pressOpacity, { toValue: 1,   duration: 80, useNativeDriver: false }).start()}
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
      <View style={styles.cardContent}>
        <View style={styles.imageContainer}>
          {item?.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.itemImage}
              resizeMode="contain"
            />
          ) : (
            <BaroIcon width={64} height={64} color={colors.accent} />
          )}
        </View>
        
        <View style={styles.itemInfo}>
          <View style={styles.nameAndLikes}>
            <View style={styles.nameContainer}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.categoryText}>{item.type}</Text>
            </View>
            <View style={styles.statsContainer}>
              <View style={[styles.likesContainer, { opacity: (Array.isArray(item.likes) ? item.likes.length : item.likes || 0) > 0 ? 1 : 0 }]}>
                <Ionicons name="thumbs-up" size={20} color={colors.accent} />
                <Text style={styles.likesText}>{Array.isArray(item.likes) ? item.likes.length : item.likes || 0}</Text>
              </View>
              <View style={[styles.reviewsContainer, { opacity: (Array.isArray(item.reviews) ? item.reviews.length : 0) > 0 ? 1 : 0 }]}>
                <Ionicons name="chatbubbles" size={18} color={colors.accent} />
                <Text style={styles.reviewsText}>{Array.isArray(item.reviews) ? item.reviews.length : 0}</Text>
              </View>
              <View style={[styles.wishlistCountContainer, { opacity: (item.wishlistCount || 0) > 0 ? 1 : 0 }]}>
                <Ionicons name="heart" size={18} color={colors.accent} />
                <Text style={styles.wishlistCountText}>{item.wishlistCount || 0}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <Image
                source={require('../../assets/imgs/img_credit.png')}
                style={styles.creditIcon}
              />
              <Text style={styles.priceValue}>
                {item.creditPrice.toLocaleString()}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Image
                source={require('../../assets/imgs/img_ducat.png')}
                style={styles.ducatIcon}
              />
              <Text style={styles.ducatValue}>
                {item.ducatPrice}
              </Text>
            </View>
          </View>
        </View>
      </View>
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
    prevProps.onPress === nextProps.onPress &&
    prevProps.isNew === nextProps.isNew &&
    prevProps.hideWishlistBadge === nextProps.hideWishlistBadge &&
    prevProps.hideWishlistBorder === nextProps.hideWishlistBorder
  );
});
