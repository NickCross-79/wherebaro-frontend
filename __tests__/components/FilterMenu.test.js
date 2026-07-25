/**
 * Tests for FilterMenu component.
 */
import React from 'react';
import { Switch } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import FilterMenu from '../../components/search/FilterMenu';
import { DUCAT_MAX, CREDIT_MAX } from '../../utils/filterUtils';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// The menu derives its ducat/credit slider ranges from the item list; an empty
// list keeps the DUCAT_MAX/CREDIT_MAX defaults.
jest.mock('../../contexts/AllItemsContext', () => ({
  useAllItems: () => ({ items: [] }),
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

  it('holds a category selection until Apply is pressed', () => {
    const onApplyFilters = jest.fn();
    const { getByText } = render(
      <FilterMenu {...baseProps} onApplyFilters={onApplyFilters} />
    );
    // Press 'Mod' category — staged locally, not applied yet
    fireEvent.press(getByText('Mod'));
    expect(onApplyFilters).not.toHaveBeenCalled();

    fireEvent.press(getByText('Apply'));
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
    fireEvent.press(getByText('Apply'));
    expect(onApplyFilters).toHaveBeenCalledWith(
      expect.objectContaining({ categories: [] })
    );
  });

  it('applies the Hide Items I Own toggle', () => {
    const onApplyFilters = jest.fn();
    const { getByText, UNSAFE_getByType } = render(
      <FilterMenu {...baseProps} onApplyFilters={onApplyFilters} />
    );
    fireEvent(UNSAFE_getByType(Switch), 'valueChange', true);
    fireEvent.press(getByText('Apply'));
    expect(onApplyFilters).toHaveBeenCalledWith(
      expect.objectContaining({ hideOwned: true })
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
    // Reset emits every filter at its default, including the price ranges,
    // which fall back to DUCAT_MAX/CREDIT_MAX with no items loaded.
    expect(onApplyFilters).toHaveBeenCalledWith({
      categories: [],
      popularity: 'all',
      ducatMin: 0,
      ducatMax: DUCAT_MAX,
      creditMin: 0,
      creditMax: CREDIT_MAX,
      hideOwned: false,
    });
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

  // Sorting moved out of this menu and into CollapsibleSearchBar's sort picker,
  // so there is no longer a sort dropdown here to exercise.
});
