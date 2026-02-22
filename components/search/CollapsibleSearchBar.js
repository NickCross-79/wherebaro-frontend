import { TextInput, TouchableOpacity, View, Text, Animated } from 'react-native';
import { useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import FilterMenu from './FilterMenu';
import styles from '../../styles/components/search/CollapsibleSearchBar.styles';
import { colors } from '../../constants/theme';

export default function CollapsibleSearchBar({ value, onChangeText, placeholder = "Search items...", title, titleColor = colors.text, titleStyle, filters, onApplyFilters }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;

  const handleToggle = () => {
    if (!isExpanded) {
      // Expand: show expanded view, animate in
      setIsExpanded(true);
      expandAnim.setValue(0);
      Animated.timing(expandAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    } else {
      // Collapse: animate out, then hide and clear
      Animated.timing(expandAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
        setIsExpanded(false);
        if (value) onChangeText('');
      });
    }
  };

  const hasActiveFilters = filters && ((filters.categories || []).length > 0 || filters.popularity !== 'all');
  const activeFilterCount = filters ? (filters.categories || []).length : 0;

  return (
    <View style={styles.container}>
      {title && !isExpanded && (
        <Text style={[styles.title, { color: titleColor }, titleStyle]}>{title}</Text>
      )}
      <View style={styles.searchWrapper}>
        <View style={styles.iconsRow}>
          {!isExpanded && (
            <TouchableOpacity 
              style={[styles.iconButton, styles.filterButton]} 
              onPress={() => setShowFilterMenu(true)}
            >
              <Ionicons name="filter" size={24} color={colors.textSecondary} />
              {hasActiveFilters && activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          {isExpanded ? (
          <Animated.View style={[styles.expandedContainer, {
            opacity: expandAnim,
            transform: [{
              translateX: expandAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }),
            }],
          }]}>
            <TextInput
              style={styles.searchInput}
              placeholder={placeholder}
              placeholderTextColor={colors.textDim}
              value={value}
              onChangeText={onChangeText}
              autoFocus
            />
            <TouchableOpacity testID="icon-close" style={styles.closeButton} onPress={handleToggle}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </Animated.View>
          ) : (
            <TouchableOpacity testID="icon-search" style={styles.iconButton} onPress={handleToggle}>
              <Ionicons name="search" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {filters && onApplyFilters && (
        <FilterMenu
          visible={showFilterMenu}
          onClose={() => setShowFilterMenu(false)}
          filters={filters}
          onApplyFilters={onApplyFilters}
        />
      )}
    </View>
  );
}


