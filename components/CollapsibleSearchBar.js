import { StyleSheet, TextInput, TouchableOpacity, View, Text } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import FilterMenu from './FilterMenu';

export default function CollapsibleSearchBar({ value, onChangeText, placeholder = "Search items...", title, filters, onApplyFilters }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (isExpanded && value) {
      // Clear search when collapsing
      onChangeText('');
    }
  };

  const hasActiveFilters = filters && (filters.types.length > 0 || filters.popularity !== 'all');

  return (
    <View style={styles.container}>
      {title && !isExpanded && <Text style={styles.title}>{title}</Text>}
      <View style={styles.searchWrapper}>
        <View style={styles.iconsRow}>
          {!isExpanded && (
            <TouchableOpacity 
              style={[styles.iconButton, styles.filterButton]} 
              onPress={() => setShowFilterMenu(true)}
            >
              <Ionicons name="filter" size={24} color="#8B9DC3" />
              {hasActiveFilters && <View style={styles.filterBadge} />}
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
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    backgroundColor: '#1A2332',
    borderRadius: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  closeButton: {
    padding: 12,
  },
  iconButton: {
    backgroundColor: '#1A2332',
    padding: 12,
    borderRadius: 8,
  },
  filterButton: {
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C89B3C',
  },
});
