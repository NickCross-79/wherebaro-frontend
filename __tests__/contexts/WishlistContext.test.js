/**
 * Tests for WishlistContext.
 */
import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { WishlistProvider, useWishlist } from '../../contexts/WishlistContext';

// Mock dependencies
jest.mock('../../utils/storage', () => ({
  dbHelpers: {
    getWishlistItems: jest.fn().mockResolvedValue([]),
    getWishlistIds: jest.fn().mockResolvedValue([]),
    addToWishlist: jest.fn().mockResolvedValue(undefined),
    removeFromWishlist: jest.fn().mockResolvedValue(undefined),
  },
}));
jest.mock('../../hooks/useItemFieldSync', () => ({
  useItemLikesSync: jest.fn(() => jest.fn()),
  useItemReviewCountSync: jest.fn(() => jest.fn()),
  useItemWishlistCountSync: jest.fn(() => jest.fn()),
}));

const { dbHelpers } = require('../../utils/storage');

const flushPromises = () =>
  new Promise((resolve) => jest.requireActual('timers').setImmediate(resolve));

const wrapper = ({ children }) => <WishlistProvider>{children}</WishlistProvider>;

describe('WishlistContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    dbHelpers.getWishlistItems.mockResolvedValue([]);
    dbHelpers.getWishlistIds.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws when useWishlist is used outside provider', () => {
    // Suppress console.error from React
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      renderHook(() => useWishlist());
    }).toThrow('useWishlist must be used within a WishlistProvider');
    spy.mockRestore();
  });

  it('loads wishlist on mount', async () => {
    dbHelpers.getWishlistIds.mockResolvedValue(['id-1']);
    dbHelpers.getWishlistItems.mockResolvedValue([{ id: 'id-1', name: 'Item' }]);

    const { result } = renderHook(() => useWishlist(), { wrapper });
    await act(async () => {
      await flushPromises();
    });

    expect(result.current.wishlistIds).toEqual(['id-1']);
    expect(result.current.wishlistItems).toHaveLength(1);
    expect(result.current.wishlistLoaded).toBe(true);
  });

  it('toggleWishlist adds an item', async () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });
    await act(async () => {
      await flushPromises();
    });

    const item = { id: 'new-1', name: 'New Item' };
    await act(async () => {
      await result.current.toggleWishlist(item);
      await flushPromises();
    });

    expect(dbHelpers.addToWishlist).toHaveBeenCalledWith({ ...item, wishlistCount: 1 });
    expect(result.current.wishlistIds).toContain('new-1');
  });

  it('toggleWishlist removes an existing item', async () => {
    dbHelpers.getWishlistIds.mockResolvedValue(['id-1']);
    dbHelpers.getWishlistItems.mockResolvedValue([{ id: 'id-1', name: 'Item' }]);

    const { result } = renderHook(() => useWishlist(), { wrapper });
    await act(async () => {
      await flushPromises();
    });

    await act(async () => {
      await result.current.toggleWishlist({ id: 'id-1' });
      await flushPromises();
    });

    expect(dbHelpers.removeFromWishlist).toHaveBeenCalledWith('id-1');
    expect(result.current.wishlistIds).not.toContain('id-1');
  });

  it('isInWishlist returns correct value', async () => {
    dbHelpers.getWishlistIds.mockResolvedValue(['id-1']);

    const { result } = renderHook(() => useWishlist(), { wrapper });
    await act(async () => {
      await flushPromises();
    });

    expect(result.current.isInWishlist('id-1')).toBe(true);
    expect(result.current.isInWishlist('id-2')).toBe(false);
  });

  it('getWishlistCount counts matching inventory items', async () => {
    dbHelpers.getWishlistIds.mockResolvedValue(['id-1', 'id-3']);

    const { result } = renderHook(() => useWishlist(), { wrapper });
    await act(async () => {
      await flushPromises();
    });

    const inventory = [
      { id: 'id-1', name: 'A' },
      { id: 'id-2', name: 'B' },
      { id: 'id-3', name: 'C' },
    ];
    expect(result.current.getWishlistCount(inventory)).toBe(2);
  });

  it('getWishlistCount returns 0 for empty inventory', async () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });
    await act(async () => {
      await flushPromises();
    });

    expect(result.current.getWishlistCount([])).toBe(0);
    expect(result.current.getWishlistCount(null)).toBe(0);
  });

  it('ignores toggle for item without id', async () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });
    await act(async () => {
      await flushPromises();
    });

    await act(async () => {
      await result.current.toggleWishlist({});
    });

    expect(dbHelpers.addToWishlist).not.toHaveBeenCalled();
    expect(dbHelpers.removeFromWishlist).not.toHaveBeenCalled();
  });
});
