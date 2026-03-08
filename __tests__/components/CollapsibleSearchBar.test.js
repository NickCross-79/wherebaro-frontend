/**
 * Tests for CollapsibleSearchBar component.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CollapsibleSearchBar from '../../components/search/CollapsibleSearchBar';

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: function MockIonicons({ name, ...props }) {
      return <Text testID={`icon-${name}`}>{name}</Text>;
    },
  };
});
jest.mock('../../components/search/FilterMenu', () => {
  const { Text } = require('react-native');
  return function MockFilterMenu({ visible }) {
    return visible ? <Text testID="filter-menu">FilterMenu</Text> : null;
  };
});
jest.mock('../../styles/components/search/CollapsibleSearchBar.styles', () => ({
  container: {},
  title: {},
  searchWrapper: {},
  iconsRow: {},
  iconButton: {},
  filterButton: {},
  filterBadge: {},
  filterBadgeText: {},
  expandedContainer: {},
  searchInput: {},
  closeButton: {},
}));

describe('CollapsibleSearchBar', () => {
  const baseProps = {
    value: '',
    onChangeText: jest.fn(),
  };

  it('renders search icon in collapsed state', () => {
    const { getByTestId } = render(<CollapsibleSearchBar {...baseProps} />);
    expect(getByTestId('icon-search')).toBeTruthy();
  });

  it('shows title when collapsed and title is provided', () => {
    const { getByText } = render(
      <CollapsibleSearchBar {...baseProps} title="All Items" />
    );
    expect(getByText('All Items')).toBeTruthy();
  });

  it('expands search input on search icon press', () => {
    const { getByTestId, getByPlaceholderText } = render(
      <CollapsibleSearchBar {...baseProps} />
    );
    fireEvent.press(getByTestId('icon-search'));
    expect(getByPlaceholderText('Search items...')).toBeTruthy();
  });

  it('uses custom placeholder', () => {
    const { getByTestId, getByPlaceholderText } = render(
      <CollapsibleSearchBar {...baseProps} placeholder="Find something..." />
    );
    fireEvent.press(getByTestId('icon-search'));
    expect(getByPlaceholderText('Find something...')).toBeTruthy();
  });

  it('clears search when collapsing', () => {
    const onChangeText = jest.fn();
    const { getByTestId } = render(
      <CollapsibleSearchBar value="test" onChangeText={onChangeText} />
    );
    // Expand first
    fireEvent.press(getByTestId('icon-search'));
    // Then close it
    fireEvent.press(getByTestId('icon-close'));
    expect(onChangeText).toHaveBeenCalledWith('');
  });

  it('shows filter badge when filters are active', () => {
    const filters = { categories: ['Mod', 'Weapon'], popularity: 'all' };
    const { getByText } = render(
      <CollapsibleSearchBar {...baseProps} filters={filters} onApplyFilters={jest.fn()} />
    );
    expect(getByText('2')).toBeTruthy(); // badge count
  });

  it('does not show filter badge count when only popularity filter is active', () => {
    const filters = { categories: [], popularity: 'popular' };
    const { queryByText } = render(
      <CollapsibleSearchBar {...baseProps} filters={filters} onApplyFilters={jest.fn()} />
    );
    // No badge should appear since popularity doesn't count
    expect(queryByText('1')).toBeNull();
  });

  it('does not show filter badge when no active filters', () => {
    const filters = { categories: [], popularity: 'all' };
    const { queryByText } = render(
      <CollapsibleSearchBar {...baseProps} filters={filters} onApplyFilters={jest.fn()} />
    );
    // No badge should appear (count is 0)
    expect(queryByText('0')).toBeNull();
  });
});
