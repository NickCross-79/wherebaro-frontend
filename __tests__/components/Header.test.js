/**
 * Tests for Header component.
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import Header from '../../components/ui/Header';

// Mock child components
jest.mock('../../components/baro/BaroTimer', () => {
  const { Text } = require('react-native');
  return function MockBaroTimer({ label, expiredText }) {
    return <Text testID="baro-timer">{label}</Text>;
  };
});
jest.mock('../../components/baro/NewItemShowcase', () => {
  const { Text } = require('react-native');
  return function MockNewItemShowcase({ item }) {
    return <Text testID="new-item">{item.name}</Text>;
  };
});
jest.mock('../../styles/components/ui/Header.styles', () => ({
  header: {},
  headerTitle: {},
  headerSubtitle: {},
}));

describe('Header', () => {
  it('renders title and subtitle by default', () => {
    const { getByText } = render(<Header />);
    expect(getByText('WHERE BARO')).toBeTruthy();
    expect(getByText('Void Trader Tracker')).toBeTruthy();
  });

  it('hides title when showTitle is false', () => {
    const { queryByText } = render(<Header showTitle={false} />);
    expect(queryByText('WHERE BARO')).toBeNull();
  });

  it('renders BaroTimer when nextArrival is provided', () => {
    const future = new Date(Date.now() + 60000);
    const { getByTestId } = render(<Header nextArrival={future} />);
    expect(getByTestId('baro-timer')).toBeTruthy();
  });

  it('passes "Leaving In" label when isHere', () => {
    const future = new Date(Date.now() + 60000);
    const { getByText } = render(<Header nextArrival={future} isHere={true} />);
    expect(getByText('Leaving In')).toBeTruthy();
  });

  it('renders NewItemShowcase when newItem is provided', () => {
    const item = { name: 'Primed Flow' };
    const { getByTestId } = render(<Header newItem={item} />);
    expect(getByTestId('new-item')).toBeTruthy();
  });

  it('renders children', () => {
    const { getByText } = render(
      <Header>
        <Text>Child Content</Text>
      </Header>
    );
    expect(getByText('Child Content')).toBeTruthy();
  });

  it('does not render BaroTimer when nextArrival is null', () => {
    const { queryByTestId } = render(<Header />);
    expect(queryByTestId('baro-timer')).toBeNull();
  });
});
