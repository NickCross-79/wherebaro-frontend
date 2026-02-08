/**
 * Tests for ItemDetailHeader component.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ItemDetailHeader from '../../components/items/ItemDetailHeader';

// Mock @expo/vector-icons (already globally mocked, but be explicit)
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: function MockIonicons({ name, ...props }) {
      return <Text>{name}</Text>;
    },
  };
});

describe('ItemDetailHeader', () => {
  const mockStyles = {
    header: {},
    backButton: {},
    headerTitle: {},
    wishlistButton: {},
  };

  it('renders the title', () => {
    const { getByText } = render(
      <ItemDetailHeader
        title="Primed Flow"
        onBack={jest.fn()}
        onToggleWishlist={jest.fn()}
        isWishlisted={false}
        styles={mockStyles}
      />
    );
    expect(getByText('Primed Flow')).toBeTruthy();
  });

  it('calls onBack when back button is pressed', () => {
    const onBack = jest.fn();
    const { getByText } = render(
      <ItemDetailHeader
        title="Test"
        onBack={onBack}
        onToggleWishlist={jest.fn()}
        isWishlisted={false}
        styles={mockStyles}
      />
    );
    fireEvent.press(getByText('chevron-back'));
    expect(onBack).toHaveBeenCalled();
  });

  it('calls onToggleWishlist when heart is pressed', () => {
    const onToggle = jest.fn();
    const { getByText } = render(
      <ItemDetailHeader
        title="Test"
        onBack={jest.fn()}
        onToggleWishlist={onToggle}
        isWishlisted={false}
        styles={mockStyles}
      />
    );
    fireEvent.press(getByText('heart-outline'));
    expect(onToggle).toHaveBeenCalled();
  });

  it('shows filled heart when wishlisted', () => {
    const { getByText } = render(
      <ItemDetailHeader
        title="Test"
        onBack={jest.fn()}
        onToggleWishlist={jest.fn()}
        isWishlisted={true}
        styles={mockStyles}
      />
    );
    expect(getByText('heart')).toBeTruthy();
  });
});
