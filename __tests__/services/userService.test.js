/**
 * Tests for userService.
 */

jest.mock('../../services/apiConfig', () => ({
  buildUrl: jest.fn((endpoint) => `https://api.test.com${endpoint}`),
  apiFetch: jest.fn(),
}));

import { registerPushToken, removePushToken } from '../../services/userService';
import { apiFetch } from '../../services/apiConfig';

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerPushToken', () => {
    it('posts token and deviceId', async () => {
      apiFetch.mockResolvedValue({ success: true });

      await registerPushToken('expo-push-token-abc', 'device-123');

      expect(apiFetch).toHaveBeenCalledWith(
        'https://api.test.com/registerPushToken',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: 'expo-push-token-abc', deviceId: 'device-123' }),
        }
      );
    });
  });

  describe('removePushToken', () => {
    it('posts token for removal', async () => {
      apiFetch.mockResolvedValue({ success: true });

      await removePushToken('expo-push-token-abc');

      expect(apiFetch).toHaveBeenCalledWith(
        'https://api.test.com/removePushToken',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: 'expo-push-token-abc' }),
        }
      );
    });
  });
});
