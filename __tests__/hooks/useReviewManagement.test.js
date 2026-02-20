/**
 * Tests for useReviewManagement hook.
 */
import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('../../services/api', () => ({
  fetchReviews: jest.fn(),
  postReview: jest.fn(),
  updateReview: jest.fn(),
  deleteReview: jest.fn(),
}));
jest.mock('../../utils/userStorage', () => ({
  getCurrentUsername: jest.fn().mockResolvedValue('TestUser'),
}));

import { useReviewManagement } from '../../hooks/useReviewManagement';
import { fetchReviews, postReview, updateReview, deleteReview } from '../../services/api';
import { getCurrentUsername } from '../../utils/userStorage';

const flushPromises = () =>
  new Promise((resolve) => jest.requireActual('timers').setImmediate(resolve));

describe('useReviewManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getReviewKey', () => {
    it('uses $oid if available', () => {
      const { result } = renderHook(() => useReviewManagement('item-1'));
      const review = { _id: { $oid: 'abc123' } };
      expect(result.current.getReviewKey(review, 0)).toBe('abc123');
    });

    it('uses _id string if no $oid', () => {
      const { result } = renderHook(() => useReviewManagement('item-1'));
      const review = { _id: 'simple-id' };
      expect(result.current.getReviewKey(review, 0)).toBe('simple-id');
    });

    it('falls back to index', () => {
      const { result } = renderHook(() => useReviewManagement('item-1'));
      const review = {};
      expect(result.current.getReviewKey(review, 5)).toBe('5');
    });
  });

  describe('getReviewId', () => {
    it('returns $oid if available', () => {
      const { result } = renderHook(() => useReviewManagement('item-1'));
      expect(result.current.getReviewId({ _id: { $oid: 'x' } })).toBe('x');
    });

    it('returns _id as string', () => {
      const { result } = renderHook(() => useReviewManagement('item-1'));
      expect(result.current.getReviewId({ _id: 42 })).toBe('42');
    });

    it('returns null when no _id', () => {
      const { result } = renderHook(() => useReviewManagement('item-1'));
      expect(result.current.getReviewId({})).toBeNull();
    });
  });

  describe('fetchReviewsAndLikes', () => {
    it('fetches and sorts reviews (current user first, then newest)', async () => {
      const reviews = [
        { uid: 'other1', content: 'Oldest', date: '2026-01-01', time: '10:00:00' },
        { uid: 'me', content: 'Mine', date: '2026-01-02', time: '12:00:00' },
        { uid: 'other2', content: 'Newest', date: '2026-02-15', time: '08:00:00' },
      ];
      fetchReviews.mockResolvedValue({ reviews });

      const { result } = renderHook(() => useReviewManagement('item-1'));

      await act(async () => {
        await result.current.fetchReviewsAndLikes('me');
        await flushPromises();
      });

      expect(result.current.reviews[0].uid).toBe('me');
      expect(result.current.reviews[1].uid).toBe('other2');
      expect(result.current.reviews[2].uid).toBe('other1');
      expect(result.current.isLoadingReviews).toBe(false);
    });

    it('sets empty reviews on error', async () => {
      fetchReviews.mockRejectedValue(new Error('fail'));

      const { result } = renderHook(() => useReviewManagement('item-1'));

      await act(async () => {
        await result.current.fetchReviewsAndLikes('me');
        await flushPromises();
      });

      expect(result.current.reviews).toEqual([]);
    });
  });

  describe('handlePostReview', () => {
    it('posts a review and prepends it to the list', async () => {
      const postedReview = { _id: 'new-1', content: 'Great!', uid: 'me', user: 'TestUser' };
      postReview.mockResolvedValue({ review: postedReview });
      getCurrentUsername.mockResolvedValue('TestUser');

      const { result } = renderHook(() => useReviewManagement('item-1'));

      // Set newReview text
      act(() => {
        result.current.setNewReview('Great!');
      });

      await act(async () => {
        await result.current.handlePostReview('me', 'item-1');
        await flushPromises();
      });

      expect(postReview).toHaveBeenCalledWith(
        expect.objectContaining({
          item_id: 'item-1',
          content: 'Great!',
          uid: 'me',
          user: 'TestUser',
        })
      );
      expect(result.current.reviews[0]).toEqual(postedReview);
      expect(result.current.newReview).toBe('');
    });

    it('does nothing on empty text', async () => {
      const { result } = renderHook(() => useReviewManagement('item-1'));
      
      await act(async () => {
        await result.current.handlePostReview('me', 'item-1');
      });

      expect(postReview).not.toHaveBeenCalled();
    });

    it('shows alert when no uid', async () => {
      jest.spyOn(Alert, 'alert');
      const { result } = renderHook(() => useReviewManagement('item-1'));

      act(() => {
        result.current.setNewReview('review text');
      });

      await act(async () => {
        await result.current.handlePostReview(null, 'item-1');
        await flushPromises();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'User not authenticated');
    });
  });

  describe('editing flow', () => {
    it('starts and cancels editing', () => {
      const { result } = renderHook(() => useReviewManagement('item-1'));
      const review = { _id: 'r1', content: 'original' };

      act(() => {
        result.current.startEditingReview(review, 0);
      });

      expect(result.current.editingReviewKey).toBe('r1');
      expect(result.current.editingReviewText).toBe('original');

      act(() => {
        result.current.cancelEditingReview();
      });

      expect(result.current.editingReviewKey).toBeNull();
      expect(result.current.editingReviewText).toBe('');
    });

    it('saves edited review via API', async () => {
      const updatedReview = { _id: 'r1', content: 'updated' };
      updateReview.mockResolvedValue({ review: updatedReview });

      const { result } = renderHook(() => useReviewManagement('item-1'));

      // Set up initial reviews
      fetchReviews.mockResolvedValue({ reviews: [{ _id: 'r1', content: 'original', uid: 'me' }] });
      await act(async () => {
        await result.current.fetchReviewsAndLikes('me');
        await flushPromises();
      });

      // Start editing
      act(() => {
        result.current.startEditingReview(result.current.reviews[0], 0);
        result.current.setEditingReviewText('updated');
      });

      // Save
      await act(async () => {
        await result.current.saveEditingReview(0, 'me');
        await flushPromises();
      });

      expect(updateReview).toHaveBeenCalledWith(
        expect.objectContaining({
          review_id: 'r1',
          uid: 'me',
          content: 'updated',
        })
      );
      expect(result.current.editingReviewKey).toBeNull();
    });
  });

  describe('hasUserReview', () => {
    it('returns true when user has a review', async () => {
      fetchReviews.mockResolvedValue({ reviews: [{ uid: 'me', content: 'test' }] });
      const { result } = renderHook(() => useReviewManagement('item-1'));

      await act(async () => {
        await result.current.fetchReviewsAndLikes('me');
        await flushPromises();
      });

      expect(result.current.hasUserReview('me')).toBe(true);
    });

    it('returns false when user has no review', () => {
      const { result } = renderHook(() => useReviewManagement('item-1'));
      expect(result.current.hasUserReview('me')).toBe(false);
    });
  });
});
