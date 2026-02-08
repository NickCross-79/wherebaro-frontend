/**
 * Tests for apiConfig utility.
 */

// We need to control environment variables before importing
const originalEnv = { ...process.env };

describe('apiConfig', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('normalizeBaseUrl', () => {
    it('returns empty string when no URL set', () => {
      delete process.env.EXPO_PUBLIC_AZURE_FUNCTION_APP_BASE_URL;
      delete process.env.AZURE_FUNCTION_APP_BASE_URL;
      const { normalizeBaseUrl } = require('../../services/apiConfig');
      expect(normalizeBaseUrl()).toBe('');
    });

    it('prepends https:// if missing', () => {
      process.env.EXPO_PUBLIC_AZURE_FUNCTION_APP_BASE_URL = 'example.com';
      const { normalizeBaseUrl } = require('../../services/apiConfig');
      expect(normalizeBaseUrl()).toBe('https://example.com');
    });

    it('leaves http:// URLs as-is', () => {
      process.env.EXPO_PUBLIC_AZURE_FUNCTION_APP_BASE_URL = 'http://localhost:7071';
      const { normalizeBaseUrl } = require('../../services/apiConfig');
      expect(normalizeBaseUrl()).toBe('http://localhost:7071');
    });

    it('leaves https:// URLs as-is', () => {
      process.env.EXPO_PUBLIC_AZURE_FUNCTION_APP_BASE_URL = 'https://api.example.com';
      const { normalizeBaseUrl } = require('../../services/apiConfig');
      expect(normalizeBaseUrl()).toBe('https://api.example.com');
    });

    it('strips trailing slash', () => {
      process.env.EXPO_PUBLIC_AZURE_FUNCTION_APP_BASE_URL = 'https://api.example.com/';
      const { normalizeBaseUrl } = require('../../services/apiConfig');
      expect(normalizeBaseUrl()).toBe('https://api.example.com');
    });
  });

  describe('buildUrl', () => {
    it('returns empty string when no base URL set', () => {
      delete process.env.EXPO_PUBLIC_AZURE_FUNCTION_APP_BASE_URL;
      delete process.env.AZURE_FUNCTION_APP_BASE_URL;
      const { buildUrl } = require('../../services/apiConfig');
      expect(buildUrl('getItems')).toBe('');
    });

    it('combines base URL and endpoint', () => {
      process.env.EXPO_PUBLIC_AZURE_FUNCTION_APP_BASE_URL = 'https://api.example.com';
      const { buildUrl } = require('../../services/apiConfig');
      expect(buildUrl('getItems')).toBe('https://api.example.com/getItems');
    });
  });

  describe('apiFetch', () => {
    it('returns parsed JSON on success', async () => {
      process.env.EXPO_PUBLIC_AZURE_FUNCTION_APP_BASE_URL = 'https://api.example.com';
      const { apiFetch } = require('../../services/apiConfig');
      const mockData = { items: [1, 2, 3] };
      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      });

      const result = await apiFetch('https://api.example.com/items');
      expect(result).toEqual(mockData);
    });

    it('throws on non-ok response', async () => {
      const { apiFetch } = require('../../services/apiConfig');
      global.fetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(apiFetch('https://api.example.com/items')).rejects.toThrow(
        'API request failed: 404 Not Found'
      );
    });

    it('passes options to fetch', async () => {
      const { apiFetch } = require('../../services/apiConfig');
      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });

      await apiFetch('https://url.com', { headers: { 'X-Test': '1' } });
      expect(global.fetch).toHaveBeenCalledWith('https://url.com', {
        headers: { 'X-Test': '1' },
      });
    });
  });

  describe('apiPost', () => {
    it('sends POST with JSON body', async () => {
      const { apiPost } = require('../../services/apiConfig');
      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      const result = await apiPost('https://url.com/create', { name: 'test' });

      expect(global.fetch).toHaveBeenCalledWith('https://url.com/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'test' }),
      });
      expect(result).toEqual({ success: true });
    });
  });
});
