import { StyleSheet, TextInput, TouchableOpacity, View, Text } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import FilterMenu from './FilterMenu';

export default function CollapsibleSearchBar({ value, onChangeText, placeholder = "Search items...", title, titleColor = '#FFFFFF', titleStyle, filters, onApplyFilters }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (isExpanded && value) {
      // Clear search when collapsing
      onChangeText('');
    }
  };

  const hasActiveFilters = filters && ((filters.categories || []).length > 0 || filters.popularity !== 'all');
  const activeFilterCount = filters ? (filters.categories || []).length + (filters.popularity !== 'all' ? 1 : 0) : 0;

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
              <Ionicons name="filter" size={24} color="#8B9DC3" />
              {hasActiveFilters && activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          {isExpanded ? (
          <View style={styles.expandedContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder={placeholder}
              placeholderTextColor="#5A6B8C"
              value={value}
              onChangeText={onChangeText}
              autoFocus
            />
            <TouchableOpacity style={styles.closeButton} onPress={handleToggle}>
              <Ionicons name="close" size={20} color="#8B9DC3" />
            </TouchableOpacity>
          </View>
          ) : (
            <TouchableOpacity style={styles.iconButton} onPress={handleToggle}>
              <Ionicons name="search" size={24} color="#8B9DC3" />
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

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  searchWrapper: {
    flex: 1,
    alignItems: 'flex-end',
  },
  iconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandedContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1419',
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#1A2332',
  },
  searchInput: {
    flex: 1,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    padding: 12,
  },
  iconButton: {
    backgroundColor: '#0F1419',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1A2332',
  },
  filterButton: {
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#D4A574',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    color: '#0A0E1A',
    fontSize: 11,
    fontWeight: '700',
  },
});
