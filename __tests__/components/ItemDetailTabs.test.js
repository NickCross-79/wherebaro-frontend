/**
 * Tests for ItemDetailTabs component.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ItemDetailTabs from '../../components/items/ItemDetailTabs';

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: function MockIonicons({ name }) {
      return <Text>{name}</Text>;
    },
  };
});

describe('ItemDetailTabs', () => {
  const mockStyles = {
    tabNav: {},
    tab: {},
    tabActive: {},
    tabText: {},
    tabTextActive: {},
  };

  it('renders Details and Reviews tabs', () => {
    const { getByText } = render(
      <ItemDetailTabs
        activeTab="details"
        setActiveTab={jest.fn()}
        styles={mockStyles}
        hasMarketTab={false}
      />
    );
    expect(getByText('Details')).toBeTruthy();
    expect(getByText('Reviews')).toBeTruthy();
  });

  it('does NOT render Market tab when hasMarketTab is false', () => {
    const { queryByText } = render(
      <ItemDetailTabs
        activeTab="details"
        setActiveTab={jest.fn()}
        styles={mockStyles}
        hasMarketTab={false}
      />
    );
    expect(queryByText('Market')).toBeNull();
  });

  it('renders Market tab when hasMarketTab is true', () => {
    const { getByText } = render(
      <ItemDetailTabs
        activeTab="details"
        setActiveTab={jest.fn()}
        styles={mockStyles}
        hasMarketTab={true}
      />
    );
    expect(getByText('Market')).toBeTruthy();
  });

  it('calls setActiveTab with correct tab name on press', () => {
    const setActiveTab = jest.fn();
    const { getByText } = render(
      <ItemDetailTabs
        activeTab="details"
        setActiveTab={setActiveTab}
        styles={mockStyles}
        hasMarketTab={true}
      />
    );

    fireEvent.press(getByText('Reviews'));
    expect(setActiveTab).toHaveBeenCalledWith('reviews');

    fireEvent.press(getByText('Market'));
    expect(setActiveTab).toHaveBeenCalledWith('market');

    fireEvent.press(getByText('Details'));
    expect(setActiveTab).toHaveBeenCalledWith('details');
  });
});
