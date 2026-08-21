import React from 'react';
import { render, screen } from '@testing-library/react-native';
import EmptyState from '../../components/ui/EmptyState';

// Mock the styles
jest.mock('../../styles/components/ui/EmptyState.styles', () => ({
  emptyContainer: {},
  emptyText: {},
  emptySubtext: {},
}));

describe('EmptyState', () => {
  it('renders the empty message', () => {
    render(<EmptyState />);
    expect(screen.getByText('Baro is not currently visiting')).toBeTruthy();
  });

  it('renders the subtext', () => {
    render(<EmptyState />);
    expect(screen.getByText('Check back later, Tenno')).toBeTruthy();
  });

  it('renders custom title and subtitle when provided', () => {
    render(<EmptyState title="Inventory unavailable" subtitle="Pull down to refresh" />);
    expect(screen.getByText('Inventory unavailable')).toBeTruthy();
    expect(screen.getByText('Pull down to refresh')).toBeTruthy();
    expect(screen.queryByText('Baro is not currently visiting')).toBeNull();
  });
});
