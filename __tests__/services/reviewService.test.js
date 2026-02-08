/**
 * Tests for reviewService.
 */

jest.mock('../../services/apiConfig', () => ({
  buildUrl: jest.fn((endpoint) => `https://api.test.com/${endpoint}`),
  apiFetch: jest.fn(),
  apiPost: jest.fn(),
}));

import { fetchReviews, postReview, updateReview, deleteReview } from '../../services/reviewService';
import { apiFetch, apiPost } from '../../services/apiConfig';

describe('reviewService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchReviews', () => {
    it('fetches reviews for item ID', async () => {
      const mockReviews = { reviews: [{ content: 'Great' }] };
      apiFetch.mockResolvedValue(mockReviews);

      const result = await fetchReviews('item-123');
      expect(apiFetch).toHaveBeenCalledWith(
        'https://api.test.com/getReviews?item_id=item-123'
      );
      expect(result).toEqual(mockReviews);
    });
  });

  describe('postReview', () => {
    it('converts item_id to item_oid in payload', async () => {
      apiPost.mockResolvedValue({ success: true });

      const data = { item_id: 'abc', uid: 'u1', content: 'Nice' };
      await postReview(data);

      expect(apiPost).toHaveBeenCalledWith(
        'https://api.test.com/postReview',
        expect.objectContaining({
          item_oid: 'abc',
          uid: 'u1',
          content: 'Nice',
        })
      );
      // Should NOT have item_id in the payload
      const calledPayload = apiPost.mock.calls[0][1];
      expect(calledPayload.item_id).toBeUndefined();
    });

    it('keeps item_oid if already provided', async () => {
      apiPost.mockResolvedValue({ success: true });

      const data = { item_oid: 'abc', uid: 'u1', content: 'Nice' };
      await postReview(data);

      const calledPayload = apiPost.mock.calls[0][1];
      expect(calledPayload.item_oid).toBe('abc');
    });

    it('sends data without item_id/item_oid if neither present', async () => {
      apiPost.mockResolvedValue({ success: true });

      const data = { uid: 'u1', content: 'Nice' };
      await postReview(data);

      const calledPayload = apiPost.mock.calls[0][1];
      expect(calledPayload.item_oid).toBeUndefined();
      expect(calledPayload.item_id).toBeUndefined();
    });
  });

  describe('updateReview', () => {
    it('posts update payload as-is', async () => {
      apiPost.mockResolvedValue({ review: { content: 'Updated' } });

      const data = { review_id: 'r1', uid: 'u1', content: 'Updated' };
      const result = await updateReview(data);

      expect(apiPost).toHaveBeenCalledWith(
        'https://api.test.com/updateReview',
        data
      );
      expect(result).toEqual({ review: { content: 'Updated' } });
    });
  });

  describe('deleteReview', () => {
    it('posts review_id and uid', async () => {
      apiPost.mockResolvedValue({ success: true });

      await deleteReview('r1', 'u1');

      expect(apiPost).toHaveBeenCalledWith(
        'https://api.test.com/deleteReview',
        { review_id: 'r1', uid: 'u1' }
      );
    });
  });
});
