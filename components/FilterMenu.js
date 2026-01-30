import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function FilterMenu({ visible, onClose, filters, onApplyFilters }) {
  const [localFilters, setLocalFilters] = useState(filters);
  
  // Sync local state when filters change from parent
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, visible]);
  
  const itemTypes = ['Mod', 'Weapon', 'Cosmetic', 'Resource', 'Blueprint'];
  const popularityOptions = [
    { label: 'All Items', value: 'all' },
    { label: 'Most Popular', value: 'popular' },
    { label: 'Least Popular', value: 'unpopular' },
  ];

  const toggleType = (type) => {
    const newTypes = localFilters.types.includes(type)
      ? localFilters.types.filter(t => t !== type)
      : [...localFilters.types, type];
    setLocalFilters({ ...localFilters, types: newTypes });
  };

  const setPopularity = (value) => {
    setLocalFilters({ ...localFilters, popularity: value });
  };

  const clearFilters = () => {
    setLocalFilters({ types: [], popularity: 'all' });
  };

  const applyFilters = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const hasActiveFilters = localFilters.types.length > 0 || localFilters.popularity !== 'all';

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
            <Text style={styles.headerTitle}>Filter Items</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Item Types */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Item Type</Text>
              {itemTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.filterOption}
                  onPress={() => toggleType(type)}
                >
                  <View style={[styles.checkbox, localFilters.types.includes(type) && styles.checkboxActive]}>
                    {localFilters.types.includes(type) && (
                      <Ionicons name="checkmark" size={16} color="#0A0E1A" />
                    )}
                  </View>
                  <Text style={styles.optionLabel}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Popularity */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Popularity</Text>
              {popularityOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.filterOption}
                  onPress={() => setPopularity(option.value)}
                >
                  <View style={[styles.radio, localFilters.popularity === option.value && styles.radioActive]}>
                    {localFilters.popularity === option.value && (
                      <View style={styles.radioDot} />
                    )}
                  </View>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D4A574',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
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
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#5A6B8C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#D4A574',
    borderColor: '#D4A574',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#5A6B8C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    borderColor: '#D4A574',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D4A574',
  },
  optionLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
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
