import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function FilterMenu({ visible, onClose, filters, onApplyFilters }) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  
  // Sync local state when filters change from parent
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, visible]);
  
  const categories = ['Mod', 'Weapon', 'Cosmetic', 'Booster', 'Somachord', 'Consumable', 'Decoration', 'Glyph', 'Void Relic', 'Captura Scene', 'Emote', 'Color Palette'];
  const popularityOptions = [
    { label: 'Default', value: 'all' },
    { label: 'Most Popular', value: 'popular' },
    { label: 'Least Popular', value: 'unpopular' },
    { label: 'Most Reviews', value: 'most-reviews' },
    { label: 'Least Reviews', value: 'least-reviews' },
  ];

  const toggleCategory = (category) => {
    const newCategories = (localFilters.categories || []).includes(category)
      ? (localFilters.categories || []).filter(c => c !== category)
      : [...(localFilters.categories || []), category];
    setLocalFilters({ ...localFilters, categories: newCategories });
  };

  const setPopularity = (value) => {
    setLocalFilters({ ...localFilters, popularity: value });
    setShowSortDropdown(false);
  };

  const clearFilters = () => {
    const clearedFilters = { categories: [], popularity: 'all' };
    setLocalFilters(clearedFilters);
    onApplyFilters(clearedFilters);
    onClose();
  };

  const applyFilters = () => {
    onApplyFilters(localFilters);
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
              {hasActiveFilters && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>
                    {(localFilters.categories || []).length + (localFilters.popularity !== 'all' ? 1 : 0)}
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
                  {popularityOptions.find(opt => opt.value === localFilters.popularity)?.label || 'Default'}
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

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.clearButton, !hasActiveFilters && styles.clearButtonDisabled]}
              onPress={clearFilters}
              disabled={!hasActiveFilters}
            >
              <Text style={[styles.clearButtonText, !hasActiveFilters && styles.clearButtonTextDisabled]}>
                Clear All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  overlayPressable: {
    flex: 1,
  },
  menuContent: {
    backgroundColor: '#0F1419',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#D4A574',
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2332',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D4A574',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  filterBadge: {
    backgroundColor: '#D4A574',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  filterBadgeText: {
    color: '#0A0E1A',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#9BA5B8',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
    fontWeight: '700',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#5A6B8C',
    backgroundColor: 'transparent',
  },
  chipActive: {
    borderColor: '#D4A574',
    backgroundColor: '#D4A574',
  },
  chipText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#0A0E1A',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#151B23',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1A2332',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dropdownMenu: {
    marginTop: 8,
    backgroundColor: '#151B23',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1A2332',
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2332',
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(212, 165, 116, 0.1)',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    color: '#D4A574',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#1A2332',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D4A574',
    alignItems: 'center',
  },
  clearButtonDisabled: {
    borderColor: '#3A3A3A',
    opacity: 0.5,
  },
  clearButtonText: {
    color: '#D4A574',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearButtonTextDisabled: {
    color: '#5A6B8C',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#D4A574',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#0A0E1A',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
