/**
 * Tests for AllItemsContext.
 */
import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { AllItemsProvider, useAllItems } from '../../contexts/AllItemsContext';

// Mock dependencies
jest.mock('../../services/api', () => ({
  fetchAllItems: jest.fn(),
}));
jest.mock('../../utils/storage', () => ({
  dbHelpers: {
    getCachedItems: jest.fn().mockResolvedValue([]),
    clearItemsCache: jest.fn().mockResolvedValue(undefined),
    cacheItems: jest.fn().mockResolvedValue(undefined),
  },
  storageHelpers: {
    getLastDataRefresh: jest.fn().mockResolvedValue(0),
    setLastDataRefresh: jest.fn().mockResolvedValue(undefined),
  },
}));
jest.mock('../../utils/normalizeItem', () => ({
  normalizeItem: jest.fn((item) => ({ ...item, normalized: true })),
}));
jest.mock('../../constants/items', () => ({
  CACHE_DURATION_MS: 60 * 60 * 1000,
}));
jest.mock('../../hooks/useItemFieldSync', () => ({
  useItemLikesSync: jest.fn(() => jest.fn()),
  useItemReviewCountSync: jest.fn(() => jest.fn()),
  useItemWishlistCountSync: jest.fn(() => jest.fn()),
}));
jest.mock('../../utils/logger', () => ({
  debug: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
}));

const { fetchAllItems } = require('../../services/api');
const { dbHelpers, storageHelpers } = require('../../utils/storage');

const flushPromises = () =>
  new Promise((resolve) => jest.requireActual('timers').setImmediate(resolve));

const wrapper = ({ children }) => <AllItemsProvider>{children}</AllItemsProvider>;

describe('AllItemsContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    storageHelpers.getLastDataRefresh.mockResolvedValue(0);
    dbHelpers.getCachedItems.mockResolvedValue([]);
    fetchAllItems.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws when useAllItems is used outside provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      renderHook(() => useAllItems());
    }).toThrow('useAllItems must be used within an AllItemsProvider');
    spy.mockRestore();
  });

  it('starts with loading true', () => {
    fetchAllItems.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useAllItems(), { wrapper });
    expect(result.current.loading).toBe(true);
  });

  it('fetches items from API when cache is stale', async () => {
    storageHelpers.getLastDataRefresh.mockResolvedValue(0); // stale
    fetchAllItems.mockResolvedValue([
      { name: 'Item A' },
      { name: 'Item B' },
    ]);

    const { result } = renderHook(() => useAllItems(), { wrapper });

    await act(async () => {
      await flushPromises();
    });

    expect(fetchAllItems).toHaveBeenCalled();
    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0].normalized).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it('uses cached items when cache is fresh', async () => {
    const now = Date.now();
    storageHelpers.getLastDataRefresh.mockResolvedValue(now); // fresh
    dbHelpers.getCachedItems.mockResolvedValue([
      { name: 'Cached Item', offeringDates: ['2024-01-01'] },
    ]);

    const { result } = renderHook(() => useAllItems(), { wrapper });

    await act(async () => {
      await flushPromises();
    });

    expect(fetchAllItems).not.toHaveBeenCalled();
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].name).toBe('Cached Item');
  });

  it('falls back to cache on API error', async () => {
    storageHelpers.getLastDataRefresh.mockResolvedValue(0);
    fetchAllItems.mockRejectedValue(new Error('Network error'));
    dbHelpers.getCachedItems.mockResolvedValue([{ name: 'Fallback' }]);

    const { result } = renderHook(() => useAllItems(), { wrapper });

    await act(async () => {
      await flushPromises();
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].name).toBe('Fallback');
    expect(result.current.error).toBe('Network error');
  });

  it('onRefresh forces API fetch', async () => {
    fetchAllItems.mockResolvedValue([{ name: 'Refreshed' }]);

    const { result } = renderHook(() => useAllItems(), { wrapper });

    await act(async () => {
      await flushPromises();
    });

    fetchAllItems.mockClear();
    fetchAllItems.mockResolvedValue([{ name: 'Refreshed v2' }]);

    await act(async () => {
      result.current.onRefresh();
      await flushPromises();
    });

    expect(fetchAllItems).toHaveBeenCalled();
  });

  it('provides updateItemLikes function', async () => {
    fetchAllItems.mockResolvedValue([]);
    const { result } = renderHook(() => useAllItems(), { wrapper });

    await act(async () => {
      await flushPromises();
    });

    expect(typeof result.current.updateItemLikes).toBe('function');
  });
});
