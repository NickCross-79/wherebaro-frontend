import { View, Text, Modal, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from '../../styles/components/search/FilterMenu.styles';
import { colors } from '../../constants/theme';
import { DUCAT_MAX, CREDIT_MAX } from '../../utils/filterUtils';
import { useAllItems } from '../../contexts/AllItemsContext';

const DUCAT_STEP = 5;
const CREDIT_STEP = 100;

const formatCredits = (val) => {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
  return `${val}`;
};

export default function FilterMenu({ visible, onClose, filters, onApplyFilters }) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [sliderWidth, setSliderWidth] = useState(0);
  const insets = useSafeAreaInsets();
  const { items: allItems } = useAllItems();

  const maxDucat = useMemo(() => {
    if (!allItems || allItems.length === 0) return DUCAT_MAX;
    return Math.max(...allItems.map(i => i.ducatPrice || 0), 1);
  }, [allItems]);

  const maxCredit = useMemo(() => {
    if (!allItems || allItems.length === 0) return CREDIT_MAX;
    return Math.max(...allItems.map(i => i.creditPrice || 0), 1);
  }, [allItems]);
  
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
    const clearedFilters = { categories: [], popularity: 'all', ducatMin: 0, ducatMax: maxDucat, creditMin: 0, creditMax: maxCredit };
    setLocalFilters(clearedFilters);
    onApplyFilters(clearedFilters);
    onClose();
  };

  const hasActiveFilters =
    (localFilters.categories || []).length > 0 ||
    localFilters.popularity !== 'all' ||
    (localFilters.ducatMin ?? 0) > 0 ||
    (localFilters.ducatMax ?? maxDucat) < maxDucat ||
    (localFilters.creditMin ?? 0) > 0 ||
    (localFilters.creditMax ?? maxCredit) < maxCredit;

  const hasChanges =
    localFilters.popularity !== filters.popularity ||
    (localFilters.categories || []).length !== (filters.categories || []).length ||
    (localFilters.categories || []).some(c => !(filters.categories || []).includes(c)) ||
    (localFilters.ducatMin ?? 0) !== (filters.ducatMin ?? 0) ||
    (localFilters.ducatMax ?? maxDucat) !== (filters.ducatMax ?? maxDucat) ||
    (localFilters.creditMin ?? 0) !== (filters.creditMin ?? 0) ||
    (localFilters.creditMax ?? maxCredit) !== (filters.creditMax ?? maxCredit);

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

            {/* Ducats */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Ducats</Text>
                <Text style={styles.rangeValue}>
                  {localFilters.ducatMin ?? 0} – {localFilters.ducatMax ?? maxDucat}
                </Text>
              </View>
              <View onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}>
                {sliderWidth > 0 && (
                  <MultiSlider
                    values={[localFilters.ducatMin ?? 0, localFilters.ducatMax ?? maxDucat]}
                    min={0}
                    max={maxDucat}
                    step={DUCAT_STEP}
                    sliderLength={sliderWidth}
                    onValuesChange={([min, max]) => setLocalFilters(prev => ({ ...prev, ducatMin: min, ducatMax: max }))}
                    selectedStyle={{ backgroundColor: colors.accent }}
                    unselectedStyle={{ backgroundColor: colors.controlBorder }}
                    markerStyle={styles.sliderThumb}
                    containerStyle={styles.sliderContainer}
                    trackStyle={styles.sliderTrack}
                  />
                )}
              </View>
            </View>

            {/* Credits */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Credits</Text>
                <Text style={styles.rangeValue}>
                  {formatCredits(localFilters.creditMin ?? 0)} – {formatCredits(localFilters.creditMax ?? maxCredit)}
                </Text>
              </View>
              <View>
                {sliderWidth > 0 && (
                  <MultiSlider
                    values={[localFilters.creditMin ?? 0, localFilters.creditMax ?? maxCredit]}
                    min={0}
                    max={maxCredit}
                    step={CREDIT_STEP}
                    sliderLength={sliderWidth}
                    onValuesChange={([min, max]) => setLocalFilters(prev => ({ ...prev, creditMin: min, creditMax: max }))}
                    selectedStyle={{ backgroundColor: colors.accent }}
                    unselectedStyle={{ backgroundColor: colors.controlBorder }}
                    markerStyle={styles.sliderThumb}
                    containerStyle={styles.sliderContainer}
                    trackStyle={styles.sliderTrack}
                  />
                )}
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

