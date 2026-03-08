/**
 * Tests for ItemDetailsTab component.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ItemDetailsTab from '../../components/items/ItemDetailsTab';

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: function MockIonicons({ name }) {
      return <Text>{name}</Text>;
    },
  };
});
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

describe('ItemDetailsTab', () => {
  const mockStyles = {
    content: {},
    imageBackgroundContainer: {},
    imageBackgroundImage: {},
    gradientOverlay: {},
    imageContainer: {},
    itemImage: {},
    infoSection: {},
    itemName: {},
    categoryText: {},
    dateContainer: {},
    dateLabel: {},
    dateValue: {},
    pricesContainer: {},
    priceBox: {},
    priceLabelRow: {},
    creditIcon: {},
    priceLabel: {},
    creditValue: {},
    ducatIcon: {},
    ducatValue: {},
    dropdownContainer: {},
    dropdownHeader: {},
    dropdownTitle: {},
    dropdownMeta: {},
    dropdownCount: {},
    dropdownList: {},
    dropdownItem: {},
    dropdownItemText: {},
    dropdownEmpty: {},
  };

  const baseItem = {
    name: 'Primed Flow',
    type: 'Mod',
    image: 'https://example.com/flow.png',
    creditPrice: 250000,
    ducatPrice: 300,
    offeringDates: ['2024-01-15', '2023-11-10'],
  };

  const formatDate = (d) => d || 'N/A';

  it('renders item name and type', () => {
    const { getByText } = render(
      <ItemDetailsTab
        item={baseItem}
        bottomSpacer={80}
        showOfferings={false}
        setShowOfferings={jest.fn()}
        formatDate={formatDate}
        lastBrought="2024-01-15"
        styles={mockStyles}
      />
    );
    expect(getByText('Primed Flow')).toBeTruthy();
    expect(getByText('Mod')).toBeTruthy();
  });

  it('renders formatted credit and ducat prices', () => {
    const { getByText } = render(
      <ItemDetailsTab
        item={baseItem}
        bottomSpacer={80}
        showOfferings={false}
        setShowOfferings={jest.fn()}
        formatDate={formatDate}
        lastBrought="2024-01-15"
        styles={mockStyles}
      />
    );
    expect(getByText('250,000')).toBeTruthy();
    expect(getByText('300')).toBeTruthy();
  });

  it('shows N/A when prices are null', () => {
    const item = { ...baseItem, creditPrice: null, ducatPrice: null };
    const { getAllByText } = render(
      <ItemDetailsTab
        item={item}
        bottomSpacer={80}
        showOfferings={false}
        setShowOfferings={jest.fn()}
        formatDate={formatDate}
        lastBrought="2024-01-15"
        styles={mockStyles}
      />
    );
    expect(getAllByText('N/A').length).toBe(2);
  });

  it('renders offering dates toggle', () => {
    const { getByText } = render(
      <ItemDetailsTab
        item={baseItem}
        bottomSpacer={80}
        showOfferings={false}
        setShowOfferings={jest.fn()}
        formatDate={formatDate}
        lastBrought="2024-01-15"
        styles={mockStyles}
      />
    );
    expect(getByText('Offering Dates')).toBeTruthy();
    expect(getByText('2')).toBeTruthy(); // count of offering dates
  });

  it('shows offering dates when showOfferings is true', () => {
    const { getAllByText, getByText } = render(
      <ItemDetailsTab
        item={baseItem}
        bottomSpacer={80}
        showOfferings={true}
        setShowOfferings={jest.fn()}
        formatDate={formatDate}
        lastBrought="2024-01-15"
        styles={mockStyles}
      />
    );
    // 2024-01-15 appears both as "Last Brought" and in offering dates
    expect(getAllByText('2024-01-15').length).toBeGreaterThanOrEqual(1);
    expect(getByText('2023-11-10')).toBeTruthy();
  });

  it('calls setShowOfferings on dropdown toggle press', () => {
    const setShowOfferings = jest.fn();
    const { getByText } = render(
      <ItemDetailsTab
        item={baseItem}
        bottomSpacer={80}
        showOfferings={false}
        setShowOfferings={setShowOfferings}
        formatDate={formatDate}
        lastBrought="2024-01-15"
        styles={mockStyles}
      />
    );
    fireEvent.press(getByText('Offering Dates'));
    expect(setShowOfferings).toHaveBeenCalledWith(true);
  });

  it('hides Last Brought for Void Surplus', () => {
    const voidItem = { ...baseItem, name: 'Void Surplus' };
    const { queryByText } = render(
      <ItemDetailsTab
        item={voidItem}
        bottomSpacer={80}
        showOfferings={false}
        setShowOfferings={jest.fn()}
        formatDate={formatDate}
        lastBrought="2024-01-15"
        styles={mockStyles}
      />
    );
    expect(queryByText('Last Brought')).toBeNull();
  });
});
