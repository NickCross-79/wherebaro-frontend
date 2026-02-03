import { Text, View, Image, Pressable, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BaroIcon from '../../assets/icons/icon_baro.svg';
import { useWishlist } from '../../contexts/WishlistContext';
import { useState, useRef, useEffect, memo } from 'react';
import styles from '../../styles/components/items/ItemCard.styles';

function ItemCard({ item, onPress, isNew, hideWishlistBadge = false, hideWishlistBorder = false }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [showHeart, setShowHeart] = useState(false);
  const heartOpacity = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(0.5)).current;
  const inWishlist = isInWishlist(item?.id || item?._id);

  const handleLongPress = () => {
    // Only show heart animation if adding to wishlist (not already in wishlist)
    if (!inWishlist) {
      setShowHeart(true);
      heartOpacity.setValue(1);
      heartScale.setValue(0.5);

      Animated.parallel([
        Animated.timing(heartOpacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(heartScale, {
          toValue: 1.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowHeart(false);
      });
    }
    
    toggleWishlist(item);
  };

  return (
    <View>
      {showHeart && (
        <Animated.View 
          style={[
            styles.heartPopup,
            {
              opacity: heartOpacity,
              transform: [{ scale: heartScale }],
            }
          ]}
          pointerEvents="none"
        >
          <Ionicons name="heart" size={80} color="#D4A574" />
        </Animated.View>
      )}
      {isNew && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW ITEM</Text>
        </View>
      )}
      {inWishlist && !hideWishlistBadge && (
        <View style={styles.wishlistBadge}>
          <Text style={styles.wishlistBadgeText}>WISHLIST</Text>
        </View>
      )}
      <Pressable 
        style={({ pressed }) => [styles.itemCard, isNew && styles.itemCardNew, inWishlist && !hideWishlistBorder && styles.itemCardWishlist, { opacity: pressed ? 0.7 : 1 }]} 
        onPress={onPress}
        onLongPress={handleLongPress}
      >
      <View style={styles.cardContent}>
        <View style={styles.imageContainer}>
          {item?.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.itemImage}
              resizeMode="contain"
            />
          ) : (
            <BaroIcon width={64} height={64} color="#D4A574" />
          )}
        </View>
        
        <View style={styles.itemInfo}>
          <View style={styles.nameAndLikes}>
            <View style={styles.nameContainer}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.categoryText}>{item.type}</Text>
            </View>
            <View style={styles.likesContainer}>
              <Ionicons name="thumbs-up" size={16} color="#D4A574" />
              <Text style={styles.likesText}>{Array.isArray(item.likes) ? item.likes.length : item.likes || 0}</Text>
            </View>
          </View>
          
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <View style={styles.priceLabelRow}>
                <Image
                  source={require('../../assets/imgs/img_credit.png')}
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
                  source={require('../../assets/imgs/img_ducat.png')}
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
    </Pressable>
    </View>
  );
}

export default memo(ItemCard, (prevProps, nextProps) => {
  return (
    prevProps.item?.id === nextProps.item?.id &&
    prevProps.item?._id === nextProps.item?._id &&
    prevProps.item?.likes?.length === nextProps.item?.likes?.length &&
    prevProps.onPress === nextProps.onPress &&
    prevProps.isNew === nextProps.isNew &&
    prevProps.hideWishlistBadge === nextProps.hideWishlistBadge &&
    prevProps.hideWishlistBorder === nextProps.hideWishlistBorder
  );
});
