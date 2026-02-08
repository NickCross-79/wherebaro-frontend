/**
 * Tests for InventoryList component.
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import InventoryList from '../../components/baro/InventoryList';

// Mock child components
jest.mock('../../components/items/ItemCard', () => {
  const { Text } = require('react-native');
  return function MockItemCard({ item }) {
    return <Text>{item.name}</Text>;
  };
});
jest.mock('../../components/ui/EmptyState', () => {
  const { Text } = require('react-native');
  return function MockEmptyState() {
    return <Text>No items</Text>;
  };
});
jest.mock('../../styles/components/baro/InventoryList.styles', () => ({
  scrollView: {},
  scrollContent: {},
}));

describe('InventoryList', () => {
  it('shows EmptyState when items array is empty', () => {
    const { getByText } = render(
      <InventoryList items={[]} refreshing={false} onRefresh={jest.fn()} />
    );
    expect(getByText('No items')).toBeTruthy();
  });

  it('renders ItemCard for each item', () => {
    const items = [
      { id: '1', name: 'Primed Flow' },
      { id: '2', name: 'Primed Vigor' },
    ];
    const { getByText } = render(
      <InventoryList items={items} refreshing={false} onRefresh={jest.fn()} />
    );
    expect(getByText('Primed Flow')).toBeTruthy();
    expect(getByText('Primed Vigor')).toBeTruthy();
  });

  it('renders with a forwarded ref without crashing', () => {
    const ref = React.createRef();
    const { getByText } = render(
      <InventoryList ref={ref} items={[]} refreshing={false} onRefresh={jest.fn()} />
    );
    expect(getByText('No items')).toBeTruthy();
  });
});
