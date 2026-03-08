import { renderHook, act } from '@testing-library/react-native';
import { useLike } from '../../hooks/useLike';

// Mock the API calls
jest.mock('../../services/api', () => ({
  likeItem: jest.fn(() => Promise.resolve()),
  unlikeItem: jest.fn(() => Promise.resolve()),
}));

// Mock the throttle constant
jest.mock('../../constants/items', () => ({
  LIKE_THROTTLE_MS: 100, // Short throttle for tests
}));

const { likeItem, unlikeItem } = require('../../services/api');

describe('useLike', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes with provided values', () => {
    const { result } = renderHook(() => useLike(false, 5, jest.fn()));
    expect(result.current.userLiked).toBe(false);
    expect(result.current.likeCount).toBe(5);
    expect(result.current.isLiking).toBe(false);
  });

  // Helper: flush all pending microtasks (promise callbacks) inside act()
  const flushPromises = () => new Promise((r) => jest.requireActual('timers').setImmediate(r));

  it('toggles like state optimistically on handleLike', async () => {
    const syncFn = jest.fn();
    const { result } = renderHook(() => useLike(false, 5, syncFn));

    await act(async () => {
      result.current.handleLike('item-1', 'user-1');
      await flushPromises();
    });

    expect(result.current.userLiked).toBe(true);
    expect(result.current.likeCount).toBe(6);
    expect(syncFn).toHaveBeenCalledWith(6);
  });

  it('toggles unlike state optimistically', async () => {
    const syncFn = jest.fn();
    const { result } = renderHook(() => useLike(true, 5, syncFn));

    await act(async () => {
      result.current.handleLike('item-1', 'user-1');
      await flushPromises();
    });

    expect(result.current.userLiked).toBe(false);
    expect(result.current.likeCount).toBe(4);
    expect(syncFn).toHaveBeenCalledWith(4);
  });

  it('never goes below 0 likes', async () => {
    const syncFn = jest.fn();
    const { result } = renderHook(() => useLike(true, 0, syncFn));

    await act(async () => {
      result.current.handleLike('item-1', 'user-1');
      await flushPromises();
    });

    expect(result.current.likeCount).toBe(0);
  });

  it('calls likeItem API when liking', async () => {
    const syncFn = jest.fn();
    const { result } = renderHook(() => useLike(false, 5, syncFn));

    await act(async () => {
      result.current.handleLike('item-1', 'user-1');
      await flushPromises();
    });

    expect(likeItem).toHaveBeenCalledWith('item-1', 'user-1');
  });

  it('calls unlikeItem API when unliking', async () => {
    const syncFn = jest.fn();
    const { result } = renderHook(() => useLike(true, 5, syncFn));

    await act(async () => {
      result.current.handleLike('item-1', 'user-1');
      await flushPromises();
    });

    expect(unlikeItem).toHaveBeenCalledWith('item-1', 'user-1');
  });
});
