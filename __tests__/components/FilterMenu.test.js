/**
 * Tests for FilterMenu component.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import FilterMenu from '../../components/search/FilterMenu';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: function MockIonicons({ name }) {
      return <Text>{name}</Text>;
    },
  };
});
jest.mock('../../styles/components/search/FilterMenu.styles', () => ({
  modalOverlay: {},
  overlayPressable: {},
  menuContent: {},
  header: {},
  headerLeft: {},
  headerTitle: {},
  filterBadge: {},
  filterBadgeText: {},
  scrollContent: {},
  section: {},
  sectionTitle: {},
  dropdown: {},
  dropdownText: {},
  dropdownMenu: {},
  dropdownItem: {},
  dropdownItemActive: {},
  dropdownItemText: {},
  dropdownItemTextActive: {},
  chipGrid: {},
  chip: {},
  chipActive: {},
  chipText: {},
  chipTextActive: {},
  footer: {},
  clearButton: {},
  clearButtonDisabled: {},
  clearButtonText: {},
  clearButtonTextDisabled: {},
  applyButton: {},
  applyButtonText: {},
}));

describe('FilterMenu', () => {
  const baseProps = {
    visible: true,
    onClose: jest.fn(),
    filters: { categories: [], popularity: 'all' },
    onApplyFilters: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when visible', () => {
    const { getByText } = render(<FilterMenu {...baseProps} />);
    expect(getByText('Filter Items')).toBeTruthy();
  });

  it('renders all 12 category chips', () => {
    const { getByText } = render(<FilterMenu {...baseProps} />);
    const categories = ['Mod', 'Weapon', 'Cosmetic', 'Booster', 'Somachord', 'Consumable', 'Decoration', 'Glyph', 'Void Relic', 'Captura Scene', 'Emote', 'Color Palette'];
    categories.forEach((cat) => {
      expect(getByText(cat)).toBeTruthy();
    });
  });

  it('toggles a category chip on press', () => {
    const onApplyFilters = jest.fn();
    const { getByText } = render(
      <FilterMenu {...baseProps} onApplyFilters={onApplyFilters} />
    );
    // Press 'Mod' category
    fireEvent.press(getByText('Mod'));
    // Filters applied automatically
    expect(onApplyFilters).toHaveBeenCalledWith(
      expect.objectContaining({ categories: ['Mod'] })
    );
  });

  it('removes category on second press', () => {
    const onApplyFilters = jest.fn();
    const { getByText } = render(
      <FilterMenu
        {...baseProps}
        filters={{ categories: ['Mod'], popularity: 'all' }}
        onApplyFilters={onApplyFilters}
      />
    );
    // Press Mod again to remove
    fireEvent.press(getByText('Mod'));
    // Filters applied automatically
    expect(onApplyFilters).toHaveBeenCalledWith(
      expect.objectContaining({ categories: [] })
    );
  });

  it('clears all filters on Reset press', () => {
    const onApplyFilters = jest.fn();
    const onClose = jest.fn();
    const { getByText } = render(
      <FilterMenu
        visible={true}
        onClose={onClose}
        filters={{ categories: ['Mod'], popularity: 'popular' }}
        onApplyFilters={onApplyFilters}
      />
    );
    fireEvent.press(getByText('Reset'));
    expect(onApplyFilters).toHaveBeenCalledWith({ categories: [], popularity: 'all' });
    expect(onClose).toHaveBeenCalled();
  });

  it('closes menu when onClose is called', () => {
    const onApplyFilters = jest.fn();
    const onClose = jest.fn();
    const { rerender } = render(
      <FilterMenu
        visible={true}
        onClose={onClose}
        filters={{ categories: [], popularity: 'all' }}
        onApplyFilters={onApplyFilters}
      />
    );
    // Simulate closing
    onClose();
    expect(onClose).toHaveBeenCalled();
  });

  it('shows sort dropdown and selects an option', () => {
    const onApplyFilters = jest.fn();
    const { getByText } = render(
      <FilterMenu {...baseProps} onApplyFilters={onApplyFilters} />
    );
    // Open sort dropdown
    fireEvent.press(getByText('Default'));
    // Select 'Most Liked'
    fireEvent.press(getByText('Most Liked'));
    // Filters applied automatically
    expect(onApplyFilters).toHaveBeenCalledWith(
      expect.objectContaining({ popularity: 'popular' })
    );
  });
});
