import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ItemDetailHeader({
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
        <Ionicons name="chevron-back" size={28} color="#D4A574" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <TouchableOpacity
        style={styles.wishlistButton}
        onPress={onToggleWishlist}
      >
        <Ionicons
          name={isWishlisted ? 'heart' : 'heart-outline'}
          size={28}
          color={isWishlisted ? '#D4A574' : '#5A6B8C'}
        />
      </TouchableOpacity>
    </View>
  );
}
