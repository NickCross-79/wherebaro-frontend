import React, { memo, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/theme';

function ItemDetailHeader({
  title,
  onBack,
  onToggleWishlist,
  isWishlisted,
  styles,
}) {
  const heartScale    = useRef(new Animated.Value(1)).current;
  // 0 = outline (not wishlisted), 1 = filled (wishlisted)
  const fillProgress  = useRef(new Animated.Value(isWishlisted ? 1 : 0)).current;

  // Keep in sync if prop changes externally (e.g. navigating back)
  useEffect(() => {
    fillProgress.setValue(isWishlisted ? 1 : 0);
  }, [isWishlisted]);

  const handlePress = () => {
    const addingToWishlist = !isWishlisted;

    heartScale.setValue(0.75);
    Animated.parallel([
      Animated.spring(heartScale, {
        toValue: 1,
        friction: 4,
        tension: 280,
        useNativeDriver: true,
      }),
      Animated.timing(fillProgress, {
        toValue: addingToWishlist ? 1 : 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    onToggleWishlist();
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="chevron-back" size={28} color={colors.accent} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <TouchableOpacity style={styles.wishlistButton} onPress={handlePress} activeOpacity={0.7}>
        <Animated.View style={{ transform: [{ scale: heartScale }] }}>
          {/* Outline icon — visible when not wishlisted */}
          <Animated.View style={{ position: 'absolute', opacity: fillProgress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }}>
            <Ionicons name="heart-outline" size={28} color={colors.textDim} />
          </Animated.View>
          {/* Filled icon — visible when wishlisted */}
          <Animated.View style={{ opacity: fillProgress }}>
            <Ionicons name="heart" size={28} color={colors.accent} />
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

export default memo(ItemDetailHeader);
