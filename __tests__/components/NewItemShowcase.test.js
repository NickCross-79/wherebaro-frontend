/**
 * Tests for NewItemShowcase component.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NewItemShowcase from '../../components/baro/NewItemShowcase';

// Mock dependencies
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));
jest.mock('../../styles/components/baro/NewItemShowcase.styles', () => ({
  container: {},
  badge: {},
  badgeText: {},
  showcaseCard: {},
  showcaseCardBackground: {},
  showcaseCardImage: {},
  gradientOverlay: {},
  imageContainer: {},
  itemImage: {},
  itemInfo: {},
  itemName: {},
  itemType: {},
  priceStack: {},
  priceItem: {},
  priceIcon: {},
  creditPrice: {},
  ducatPrice: {},
}));

describe('NewItemShowcase', () => {
  const mockItem = {
    name: 'Primed Flow',
    type: 'Mod',
    image: 'https://example.com/flow.png',
    creditPrice: 250000,
    ducatPrice: 300,
  };

  it('returns null when no item is provided', () => {
    const { toJSON } = render(<NewItemShowcase item={null} />);
    expect(toJSON()).toBeNull();
  });

  it('renders item name and type', () => {
    const { getByText } = render(<NewItemShowcase item={mockItem} />);
    expect(getByText('Primed Flow')).toBeTruthy();
    expect(getByText('Mod')).toBeTruthy();
  });

  it('renders "NEW ITEM" badge', () => {
    const { getByText } = render(<NewItemShowcase item={mockItem} />);
    expect(getByText('NEW ITEM')).toBeTruthy();
  });

  it('renders formatted prices', () => {
    const { getByText } = render(<NewItemShowcase item={mockItem} />);
    expect(getByText('250,000')).toBeTruthy();
    expect(getByText('300')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <NewItemShowcase item={mockItem} onPress={onPress} />
    );
    fireEvent.press(getByText('Primed Flow'));
    expect(onPress).toHaveBeenCalled();
  });
});
