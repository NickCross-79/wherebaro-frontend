/**
 * Tests for likeService.
 */

jest.mock('../../services/apiConfig', () => ({
  buildUrl: jest.fn((endpoint) => `https://api.test.com/${endpoint}`),
  apiFetch: jest.fn(),
  apiPost: jest.fn(),
}));

import { fetchLikes, likeItem, unlikeItem } from '../../services/likeService';
import { apiFetch, apiPost } from '../../services/apiConfig';

describe('likeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchLikes', () => {
    it('POSTs the item ID and this device\'s uid, keeping the uid out of the URL', async () => {
      const mockLikes = { likes: [{ isOwn: true }], count: 1 };
      apiPost.mockResolvedValue(mockLikes);

      const result = await fetchLikes('item-123', 'uid-me');
      expect(apiPost).toHaveBeenCalledWith('https://api.test.com/getLikes', {
        item_id: 'item-123',
        uid: 'uid-me',
      });
      expect(apiFetch).not.toHaveBeenCalled();
      expect(result).toEqual(mockLikes);
    });
  });

  describe('likeItem', () => {
    it('posts like with item_oid and uid', async () => {
      apiPost.mockResolvedValue({ success: true });

      const result = await likeItem('item-123', 'user-456');
      expect(apiPost).toHaveBeenCalledWith('https://api.test.com/likeItem', {
        item_oid: 'item-123',
        uid: 'user-456',
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe('unlikeItem', () => {
    it('posts unlike with item_oid and uid', async () => {
      apiPost.mockResolvedValue({ success: true });

      const result = await unlikeItem('item-123', 'user-456');
      expect(apiPost).toHaveBeenCalledWith('https://api.test.com/unlikeItem', {
        item_oid: 'item-123',
        uid: 'user-456',
      });
      expect(result).toEqual({ success: true });
    });
  });
});
