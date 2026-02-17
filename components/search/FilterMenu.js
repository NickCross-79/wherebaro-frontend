import { View, Text, Modal, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from '../../styles/components/search/FilterMenu.styles';

export default function FilterMenu({ visible, onClose, filters, onApplyFilters }) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const insets = useSafeAreaInsets();
  
  // Sync local state when filters change from parent
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, visible]);
  
  const categories = ['Mod', 'Weapon', 'Cosmetic', 'Booster', 'Somachord', 'Consumable', 'Decoration', 'Glyph', 'Void Relic', 'Captura Scene', 'Emote', 'Color Palette'];
  const popularityOptions = [
    { label: 'Alphabetical', value: 'all' },
    { label: 'Most Liked', value: 'popular' },
    { label: 'Most Wishlisted', value: 'most-wishlisted' },
    { label: 'Most Reviewed', value: 'most-reviews' },
    { label: 'Last Brought', value: 'last-brought' },
  ];

  const toggleCategory = (category) => {
    const newCategories = (localFilters.categories || []).includes(category)
      ? (localFilters.categories || []).filter(c => c !== category)
      : [...(localFilters.categories || []), category];
    const updatedFilters = { ...localFilters, categories: newCategories };
    setLocalFilters(updatedFilters);
    onApplyFilters(updatedFilters);
  };

  const setPopularity = (value) => {
    const updatedFilters = { ...localFilters, popularity: value };
    setLocalFilters(updatedFilters);
    onApplyFilters(updatedFilters);
    setShowSortDropdown(false);
  };

  const clearFilters = () => {
    const clearedFilters = { categories: [], popularity: 'all' };
    setLocalFilters(clearedFilters);
    onApplyFilters(clearedFilters);
    onClose();
  };

  const hasActiveFilters = (localFilters.categories || []).length > 0 || localFilters.popularity !== 'all';

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.overlayPressable} onPress={onClose} />
        <View style={styles.menuContent}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Filter Items</Text>
              {hasActiveFilters && (localFilters.categories || []).length > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>
                    {(localFilters.categories || []).length}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Sort By */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowSortDropdown(!showSortDropdown)}
              >
                <Text style={styles.dropdownText}>
                  {popularityOptions.find(opt => opt.value === localFilters.popularity)?.label || 'Alphabetical'}
                </Text>
                <Ionicons 
                  name={showSortDropdown ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#8B9DC3" 
                />
              </TouchableOpacity>
              {showSortDropdown && (
                <View style={styles.dropdownMenu}>
                  {popularityOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.dropdownItem,
                        localFilters.popularity === option.value && styles.dropdownItemActive
                      ]}
                      onPress={() => setPopularity(option.value)}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        localFilters.popularity === option.value && styles.dropdownItemTextActive
                      ]}>
                        {option.label}
                      </Text>
                      {localFilters.popularity === option.value && (
                        <Ionicons name="checkmark" size={20} color="#D4A574" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <View style={styles.chipGrid}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.chip,
                      (localFilters.categories || []).includes(category) && styles.chipActive
                    ]}
                    onPress={() => toggleCategory(category)}
                  >
                    <Text style={[
                      styles.chipText,
                      (localFilters.categories || []).includes(category) && styles.chipTextActive
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: 20 + insets.bottom }]}>
            <TouchableOpacity
              style={[styles.clearButton, !hasActiveFilters && styles.clearButtonDisabled]}
              onPress={clearFilters}
              disabled={!hasActiveFilters}
            >
              <Text style={[styles.clearButtonText, !hasActiveFilters && styles.clearButtonTextDisabled]}>
                Reset
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

