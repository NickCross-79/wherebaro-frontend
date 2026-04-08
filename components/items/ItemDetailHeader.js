import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/theme';

function ItemDetailHeader({
  title,
  onBack,
  styles,
}) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="chevron-back" size={28} color={colors.accent} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      {/* Spacer to keep title centered */}
      <View style={{ width: 44 }} />
    </View>
  );
}

export default memo(ItemDetailHeader);
