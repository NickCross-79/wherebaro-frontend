/**
 * Tests for itemService.
 */

jest.mock('../../services/apiConfig', () => ({
  buildUrl: jest.fn((endpoint) => `https://api.test.com/${endpoint}`),
  apiFetch: jest.fn(),
}));
jest.mock('../../utils/logger', () => ({
  debug: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
}));

import { fetchBaroStatus, fetchAllItems } from '../../services/itemService';
import { apiFetch } from '../../services/apiConfig';

describe('itemService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchBaroStatus', () => {
    it('calls apiFetch with getCurrent endpoint and returns result', async () => {
      const mockResponse = { isActive: true, items: [{ name: 'Item1' }] };
      apiFetch.mockResolvedValue(mockResponse);

      const result = await fetchBaroStatus();
      expect(apiFetch).toHaveBeenCalledWith('https://api.test.com/getCurrent');
      expect(result).toEqual(mockResponse);
    });

    it('propagates errors', async () => {
      apiFetch.mockRejectedValue(new Error('Network error'));
      await expect(fetchBaroStatus()).rejects.toThrow('Network error');
    });
  });

  describe('fetchAllItems', () => {
    it('calls apiFetch with getAllItems endpoint', async () => {
      const mockItems = [{ name: 'Item1' }, { name: 'Item2' }];
      apiFetch.mockResolvedValue(mockItems);

      const result = await fetchAllItems();
      expect(apiFetch).toHaveBeenCalledWith('https://api.test.com/getAllItems');
      expect(result).toEqual(mockItems);
    });
  });
});
