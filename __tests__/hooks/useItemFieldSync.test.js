/**
 * Tests for item field sync hooks (useItemSync).
 */
import { renderHook, act } from '@testing-library/react-native';
import {
  useItemLikesSync,
  useItemReviewCountSync,
  useItemWishlistCountSync,
} from '../../hooks/useItemFieldSync';

// ── Helper ─────────────────────────────────────────────────────────────

/** Create a mock setItems that applies updater functions in-place. */
const createSetItems = (initialItems) => {
  let items = initialItems;
  const setItems = jest.fn((updater) => {
    items = updater(items);
  });
  return { setItems, getItems: () => items };
};

// ── useItemLikesSync ───────────────────────────────────────────────────

describe('useItemLikesSync', () => {
  it('returns an updateItemLikes function', () => {
    const setItems = jest.fn();
    const { result } = renderHook(() => useItemLikesSync(setItems));
    expect(typeof result.current).toBe('function');
  });

  it('updates likes for matching item by id', () => {
    const { setItems, getItems } = createSetItems([
      { id: 'a1', name: 'Item A', likes: 5 },
      { id: 'b2', name: 'Item B', likes: 3 },
    ]);
    const { result } = renderHook(() => useItemLikesSync(setItems));

    act(() => result.current('a1', 10));

    expect(getItems()[0].likes).toBe(10);
    expect(getItems()[1].likes).toBe(3);
  });

  it('updates likes for matching item by _id', () => {
    const { setItems, getItems } = createSetItems([
      { _id: 'x1', name: 'X', likes: 1 },
    ]);
    const { result } = renderHook(() => useItemLikesSync(setItems));

    act(() => result.current('x1', 99));

    expect(getItems()[0].likes).toBe(99);
  });

  it('does not modify items with no matching id', () => {
    const { setItems, getItems } = createSetItems([
      { id: 'a1', name: 'A', likes: 5 },
    ]);
    const { result } = renderHook(() => useItemLikesSync(setItems));

    act(() => result.current('no-match', 100));

    expect(getItems()[0].likes).toBe(5);
  });
});

// ── useItemReviewCountSync ─────────────────────────────────────────────

describe('useItemReviewCountSync', () => {
  it('increments review count by adding a placeholder', () => {
    const { setItems, getItems } = createSetItems([
      { id: 'a1', reviews: [{ content: 'Great' }] },
    ]);
    const { result } = renderHook(() => useItemReviewCountSync(setItems));

    act(() => result.current('a1', 1));

    expect(getItems()[0].reviews).toHaveLength(2);
    expect(getItems()[0].reviews[0]._placeholder).toBe(true);
  });

  it('decrements review count by removing a placeholder first', () => {
    const { setItems, getItems } = createSetItems([
      { id: 'a1', reviews: [{ _placeholder: true }, { content: 'Real' }] },
    ]);
    const { result } = renderHook(() => useItemReviewCountSync(setItems));

    act(() => result.current('a1', -1));

    expect(getItems()[0].reviews).toHaveLength(1);
    expect(getItems()[0].reviews[0].content).toBe('Real');
  });

  it('decrements by removing first entry when no placeholders exist', () => {
    const { setItems, getItems } = createSetItems([
      { id: 'a1', reviews: [{ content: 'A' }, { content: 'B' }] },
    ]);
    const { result } = renderHook(() => useItemReviewCountSync(setItems));

    act(() => result.current('a1', -1));

    expect(getItems()[0].reviews).toHaveLength(1);
    expect(getItems()[0].reviews[0].content).toBe('B');
  });

  it('handles item with no reviews array', () => {
    const { setItems, getItems } = createSetItems([
      { id: 'a1' },
    ]);
    const { result } = renderHook(() => useItemReviewCountSync(setItems));

    act(() => result.current('a1', 1));

    expect(getItems()[0].reviews).toHaveLength(1);
  });

  it('does not modify non-matching items', () => {
    const { setItems, getItems } = createSetItems([
      { id: 'a1', reviews: [{ content: 'X' }] },
    ]);
    const { result } = renderHook(() => useItemReviewCountSync(setItems));

    act(() => result.current('no-match', 1));

    expect(getItems()[0].reviews).toHaveLength(1);
  });
});

// ── useItemWishlistCountSync ───────────────────────────────────────────

describe('useItemWishlistCountSync', () => {
  it('increments wishlistCount', () => {
    const { setItems, getItems } = createSetItems([
      { id: 'a1', wishlistCount: 3 },
    ]);
    const { result } = renderHook(() => useItemWishlistCountSync(setItems));

    act(() => result.current('a1', 1));

    expect(getItems()[0].wishlistCount).toBe(4);
  });

  it('decrements wishlistCount', () => {
    const { setItems, getItems } = createSetItems([
      { id: 'a1', wishlistCount: 3 },
    ]);
    const { result } = renderHook(() => useItemWishlistCountSync(setItems));

    act(() => result.current('a1', -1));

    expect(getItems()[0].wishlistCount).toBe(2);
  });

  it('does not go below zero', () => {
    const { setItems, getItems } = createSetItems([
      { id: 'a1', wishlistCount: 0 },
    ]);
    const { result } = renderHook(() => useItemWishlistCountSync(setItems));

    act(() => result.current('a1', -1));

    expect(getItems()[0].wishlistCount).toBe(0);
  });

  it('handles missing wishlistCount (defaults to 0)', () => {
    const { setItems, getItems } = createSetItems([
      { id: 'a1' },
    ]);
    const { result } = renderHook(() => useItemWishlistCountSync(setItems));

    act(() => result.current('a1', 1));

    expect(getItems()[0].wishlistCount).toBe(1);
  });

  it('does not modify non-matching items', () => {
    const { setItems, getItems } = createSetItems([
      { id: 'a1', wishlistCount: 5 },
    ]);
    const { result } = renderHook(() => useItemWishlistCountSync(setItems));

    act(() => result.current('no-match', 1));

    expect(getItems()[0].wishlistCount).toBe(5);
  });
});
