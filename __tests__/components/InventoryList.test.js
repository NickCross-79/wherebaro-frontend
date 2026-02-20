/**
 * Tests for InventoryList component.
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import InventoryList from '../../components/baro/InventoryList';

// Mock child components
const mockItemCardCalls = [];
jest.mock('../../components/items/ItemCard', () => {
  const { Text } = require('react-native');
  return function MockItemCard({ item, isNew }) {
    mockItemCardCalls.push({ name: item.name, isNew });
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
  beforeEach(() => {
    mockItemCardCalls.length = 0;
  });

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

  it('marks items with exactly one offering date as new', () => {
    const items = [
      { id: '1', name: 'Primed Flow', offeringDates: ['2025-01-10', '2024-06-15'] },
      { id: '2', name: 'Brand New Mod', offeringDates: ['2025-01-10'] },
      { id: '3', name: 'Another Veteran', offeringDates: ['2025-01-10', '2024-01-05', '2023-06-20'] },
      { id: '4', name: 'Also New', offeringDates: ['2025-01-10'] },
    ];
    render(<InventoryList items={items} refreshing={false} onRefresh={jest.fn()} />);

    expect(mockItemCardCalls).toEqual([
      { name: 'Primed Flow', isNew: false },
      { name: 'Brand New Mod', isNew: true },
      { name: 'Another Veteran', isNew: false },
      { name: 'Also New', isNew: true },
    ]);
  });
});
