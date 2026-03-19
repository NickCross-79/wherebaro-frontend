import { View, Text, Modal, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from '../../styles/components/search/FilterMenu.styles';
import { colors } from '../../constants/theme';

export default function FilterMenu({ visible, onClose, filters, onApplyFilters }) {
  const [localFilters, setLocalFilters] = useState(filters);
  const insets = useSafeAreaInsets();
  
  // Sync local state when filters change from parent
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, visible]);
  
  const categories = ['Mod', 'Weapon', 'Cosmetic', 'Booster', 'Somachord', 'Consumable', 'Decoration', 'Glyph', 'Void Relic', 'Captura Scene', 'Emote', 'Color Palette'];

  const toggleCategory = (category) => {
    const newCategories = (localFilters.categories || []).includes(category)
      ? (localFilters.categories || []).filter(c => c !== category)
      : [...(localFilters.categories || []), category];
    setLocalFilters({ ...localFilters, categories: newCategories });
  };

  const applyFilters = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const clearFilters = () => {
    const clearedFilters = { categories: [], popularity: 'all' };
    setLocalFilters(clearedFilters);
    onApplyFilters(clearedFilters);
    onClose();
  };

  const hasActiveFilters = (localFilters.categories || []).length > 0 || localFilters.popularity !== 'all';

  const hasChanges =
    localFilters.popularity !== filters.popularity ||
    (localFilters.categories || []).length !== (filters.categories || []).length ||
    (localFilters.categories || []).some(c => !(filters.categories || []).includes(c));

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
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

          <View style={[styles.footer, styles.footerRow, { paddingBottom: 20 + insets.bottom }]}>
            <TouchableOpacity
              style={[styles.clearButton, styles.clearButtonFlex, !hasActiveFilters && styles.clearButtonDisabled]}
              onPress={clearFilters}
              disabled={!hasActiveFilters}
            >
              <Text style={[styles.clearButtonText, !hasActiveFilters && styles.clearButtonTextDisabled]}>
                Reset
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.applyButton, !hasChanges && styles.applyButtonDisabled]} onPress={applyFilters} disabled={!hasChanges}>
              <Text style={[styles.applyButtonText, !hasChanges && styles.applyButtonTextDisabled]}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

