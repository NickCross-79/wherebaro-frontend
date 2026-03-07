import { TextInput, TouchableOpacity, View, Text, Animated, Pressable, Easing } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import FilterMenu from './FilterMenu';
import styles from '../../styles/components/search/CollapsibleSearchBar.styles';
import { colors } from '../../constants/theme';

const SORT_OPTIONS = [
  { label: 'Default', value: 'all' },
  { label: 'Likes', value: 'popular' },
  { label: 'Wishlists', value: 'most-wishlisted' },
  { label: 'Reviews', value: 'most-reviews' },
  { label: 'Last Brought', value: 'last-brought' },
  { label: 'Credits', value: 'credits' },
  { label: 'Ducats', value: 'ducats' },
];

export default function CollapsibleSearchBar({ value, onChangeText, placeholder = "Search items...", title, titleColor = colors.text, titleStyle, filters, onApplyFilters, containerStyle }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;
  const dirButtonAnim = useRef(new Animated.Value(0)).current;
  const dirRotateAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  // Close dropdown when navigating away (swipe back, tab switch, etc.)
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setShowSortDropdown(false);
      setShowFilterMenu(false);
    });
    return unsubscribe;
  }, [navigation]);

  const handleToggle = () => {
    if (!isExpanded) {
      setShowSortDropdown(false);
      setIsExpanded(true);
      expandAnim.setValue(0);
      Animated.timing(expandAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    } else {
      Animated.timing(expandAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
        setIsExpanded(false);
        if (value) onChangeText('');
      });
    }
  };

  const hasActiveFilters = filters && ((filters.categories || []).length > 0 || filters.popularity !== 'all');
  const activeFilterCount = filters ? (filters.categories || []).length : 0;
  const currentSort = SORT_OPTIONS.find(o => o.value === (filters?.popularity ?? 'all')) ?? SORT_OPTIONS[0];
  const sortDir = filters?.sortDir ?? 'desc';
  const showDirButton = filters?.popularity && filters.popularity !== 'all';

  // Animate direction button in/out (width + opacity) so the sort button smoothly resizes
  useEffect(() => {
    Animated.timing(dirButtonAnim, {
      toValue: showDirButton ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [showDirButton]);

  // Animate arrow rotation when sort direction changes (asc=0deg, desc=180deg)
  useEffect(() => {
    Animated.timing(dirRotateAnim, {
      toValue: sortDir === 'asc' ? 0 : 1,
      duration: 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [sortDir]);

  return (
    <View style={[styles.container, containerStyle]}>
      {isExpanded ? (
        /* Expanded search — full width */
        <Animated.View style={[styles.expandedContainer, {
          opacity: expandAnim,
          transform: [{ translateX: expandAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
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
        <>
          {/* Invisible full-screen backdrop — closes dropdown on outside tap */}
          {showSortDropdown && (
            <Pressable
              style={{ position: 'absolute', top: -1000, left: -1000, width: 6000, height: 6000, zIndex: 1 }}
              onPress={() => setShowSortDropdown(false)}
            />
          )}

          {/* Sort picker — left side */}
          {filters && onApplyFilters && (
            <View style={[styles.sortContainer, showSortDropdown && { zIndex: 2 }]}>
              <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortDropdown(v => !v)}>
                <Text style={styles.sortLabel}>{currentSort.label}</Text>
                <Ionicons name={showSortDropdown ? 'chevron-up' : 'chevron-down'} size={13} color={colors.textSecondary} />
              </TouchableOpacity>
              {showSortDropdown && (
                <View style={styles.sortDropdown}>
                  {SORT_OPTIONS.map(opt => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.sortOption, filters.popularity === opt.value && styles.sortOptionActive]}
                      onPress={() => { onApplyFilters({ ...filters, popularity: opt.value, sortDir: opt.value === 'all' ? 'desc' : sortDir }); setShowSortDropdown(false); }}
                    >
                      <Text style={[styles.sortOptionText, filters.popularity === opt.value && styles.sortOptionTextActive]}>
                        {opt.label}
                      </Text>
                      {filters.popularity === opt.value && (
                        <Ionicons name="checkmark" size={16} color={colors.accent} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Asc/Desc toggle — animates in/out when a sort is active */}
          {filters && onApplyFilters && (
            <Animated.View style={{
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
              width: dirButtonAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 44] }),
              marginRight: dirButtonAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 8] }),
              opacity: dirButtonAnim,
            }}>
              <TouchableOpacity
                style={[styles.iconButton, styles.dirButton]}
                onPress={() => onApplyFilters({ ...filters, sortDir: sortDir === 'asc' ? 'desc' : 'asc' })}
              >
                <Animated.View style={{ transform: [{ rotate: dirRotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }}>
                  <Ionicons name="arrow-up" size={20} color={colors.accent} />
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Filter + Search icons — right side */}
          <View style={styles.iconsRow}>
            {filters && onApplyFilters && (
              <TouchableOpacity style={[styles.iconButton, styles.filterButton]} onPress={() => setShowFilterMenu(true)}>
                <Ionicons name="filter" size={24} color={colors.textSecondary} />
                {hasActiveFilters && activeFilterCount > 0 && (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity testID="icon-search" style={styles.iconButton} onPress={handleToggle}>
              <Ionicons name="search" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </>
      )}

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


