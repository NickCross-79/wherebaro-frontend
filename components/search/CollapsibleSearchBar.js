import { TextInput, TouchableOpacity, View, Text } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import FilterMenu from './FilterMenu';
import styles from '../../styles/components/search/CollapsibleSearchBar.styles';

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

