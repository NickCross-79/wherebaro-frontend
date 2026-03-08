/**
 * Tests for BaroTimer component.
 */
import React from 'react';
import { render, act } from '@testing-library/react-native';
import BaroTimer from '../../components/baro/BaroTimer';

// Mock SVG + styles
jest.mock('../../assets/icons/icon_time.svg', () => 'TimeIcon');
jest.mock('../../styles/components/baro/BaroTimer.styles', () => ({
  timerContainer: {},
  centered: {},
  headerRow: {},
  centeredRow: {},
  timerLabel: {},
  locationText: {},
  centeredText: {},
  timerValueRow: {},
  timerValue: {},
}));

describe('BaroTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the label text', () => {
    const future = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    const { getByText } = render(<BaroTimer nextArrival={future} />);
    expect(getByText('Next Arrival')).toBeTruthy();
  });

  it('uses custom label when provided', () => {
    const future = new Date(Date.now() + 60 * 60 * 1000);
    const { getByText } = render(<BaroTimer nextArrival={future} label="Leaving In" />);
    expect(getByText('Leaving In')).toBeTruthy();
  });

  it('shows location if provided', () => {
    const future = new Date(Date.now() + 60 * 60 * 1000);
    const { getByText } = render(
      <BaroTimer nextArrival={future} location={{ name: 'Strata Relay', planet: 'Earth' }} />
    );
    expect(getByText('Strata Relay, (Earth)')).toBeTruthy();
  });

  it('shows expiredText when timer expires', () => {
    const past = new Date(Date.now() - 1000);
    const { getByText } = render(<BaroTimer nextArrival={past} expiredText="Arriving Soon" />);
    expect(getByText('Arriving Soon')).toBeTruthy();
  });

  it('shows "Unknown" for null nextArrival', () => {
    const { getByText } = render(<BaroTimer nextArrival={null} />);
    expect(getByText('Unknown')).toBeTruthy();
  });

  it('shows days format for long durations', () => {
    const future = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000); // 2d 3h
    const { getByText } = render(<BaroTimer nextArrival={future} />);
    // Should show something like "2d 3h 0m"
    expect(getByText(/\d+d \d+h \d+m/)).toBeTruthy();
  });

  it('shows hours format for medium durations', () => {
    const future = new Date(Date.now() + 3 * 60 * 60 * 1000 + 15 * 60 * 1000); // 3h 15m
    const { getByText } = render(<BaroTimer nextArrival={future} />);
    expect(getByText(/\d+h \d+m \d+s/)).toBeTruthy();
  });

  it('shows minutes format for short durations', () => {
    const future = new Date(Date.now() + 5 * 60 * 1000 + 30 * 1000); // 5m 30s
    const { getByText } = render(<BaroTimer nextArrival={future} />);
    expect(getByText(/\d+m \d+s/)).toBeTruthy();
  });

  it('updates countdown on interval tick', () => {
    const future = new Date(Date.now() + 65 * 1000); // 1m 5s
    const { getByText } = render(<BaroTimer nextArrival={future} />);
    expect(getByText(/1m 5s|1m 4s/)).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(getByText(/1m 3s|1m 2s/)).toBeTruthy();
  });
});
