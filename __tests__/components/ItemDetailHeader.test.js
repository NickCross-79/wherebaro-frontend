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
  };

  it('renders the title', () => {
    const { getByText } = render(
      <ItemDetailHeader
        title="Primed Flow"
        onBack={jest.fn()}
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
        styles={mockStyles}
      />
    );
    fireEvent.press(getByText('chevron-back'));
    expect(onBack).toHaveBeenCalled();
  });
});
