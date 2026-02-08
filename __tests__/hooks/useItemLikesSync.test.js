/**
 * Tests for useItemLikesSync hook.
 */
import { renderHook, act } from '@testing-library/react-native';
import { useItemLikesSync } from '../../hooks/useItemLikesSync';

describe('useItemLikesSync', () => {
  it('returns an updateItemLikes function', () => {
    const setItems = jest.fn();
    const { result } = renderHook(() => useItemLikesSync(setItems));
    expect(typeof result.current).toBe('function');
  });

  it('updates likes for matching item by id', () => {
    let items = [
      { id: 'a1', name: 'Item A', likes: 5 },
      { id: 'b2', name: 'Item B', likes: 3 },
    ];
    const setItems = jest.fn((updater) => {
      items = updater(items);
    });

    const { result } = renderHook(() => useItemLikesSync(setItems));

    act(() => {
      result.current('a1', 10);
    });

    expect(setItems).toHaveBeenCalled();
    expect(items[0].likes).toBe(10);
    expect(items[1].likes).toBe(3); // unchanged
  });

  it('updates likes for matching item by _id', () => {
    let items = [
      { _id: 'x1', name: 'X', likes: 1 },
    ];
    const setItems = jest.fn((updater) => {
      items = updater(items);
    });

    const { result } = renderHook(() => useItemLikesSync(setItems));

    act(() => {
      result.current('x1', 99);
    });

    expect(items[0].likes).toBe(99);
  });

  it('does not modify items with no matching id', () => {
    let items = [
      { id: 'a1', name: 'A', likes: 5 },
    ];
    const setItems = jest.fn((updater) => {
      items = updater(items);
    });

    const { result } = renderHook(() => useItemLikesSync(setItems));

    act(() => {
      result.current('no-match', 100);
    });

    expect(items[0].likes).toBe(5);
  });
});
