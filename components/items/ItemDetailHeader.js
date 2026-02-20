import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/theme';

function ItemDetailHeader({
  title,
  onBack,
  onToggleWishlist,
  isWishlisted,
  styles,
}) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
      >
        <Ionicons name="chevron-back" size={28} color={colors.accent} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <TouchableOpacity
        style={styles.wishlistButton}
        onPress={onToggleWishlist}
      >
        <Ionicons
          name={isWishlisted ? 'heart' : 'heart-outline'}
          size={28}
          color={isWishlisted ? colors.accent : colors.textDim}
        />
      </TouchableOpacity>
    </View>
  );
}

export default memo(ItemDetailHeader);
