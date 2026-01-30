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
    backgroundColor: '#121825',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#C89B3C',
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3442',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C89B3C',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#8B9DC3',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    fontWeight: '600',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
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
    backgroundColor: '#C89B3C',
    borderColor: '#C89B3C',
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
    borderColor: '#C89B3C',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#C89B3C',
  },
  optionLabel: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A3442',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#C89B3C',
    alignItems: 'center',
  },
  clearButtonDisabled: {
    borderColor: '#3A3A3A',
    opacity: 0.5,
  },
  clearButtonText: {
    color: '#C89B3C',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  clearButtonTextDisabled: {
    color: '#5A6B8C',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#C89B3C',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#0A0E1A',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
