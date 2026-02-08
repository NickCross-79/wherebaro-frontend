/**
 * Tests for marketService.
 */

jest.mock('../../utils/slugify', () => ({
  toSlug: jest.fn((name) => name.toLowerCase().replace(/\s+/g, '_')),
}));

describe('marketService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches market data with slugified item name', async () => {
    const { fetchMarketData } = require('../../services/marketService');
    const payload = { statistics_closed: { '48hours': [{ avg_price: 10 }] } };
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ payload }),
    });

    const result = await fetchMarketData('Primed Flow');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.warframe.market/v1/items/primed_flow/statistics'
    );
    expect(result).toEqual({ market: payload });
  });

  it('returns data directly when payload is missing', async () => {
    const { fetchMarketData } = require('../../services/marketService');
    const responseData = { some: 'data' };
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(responseData),
    });

    const result = await fetchMarketData('Some Item');
    expect(result).toEqual({ market: responseData });
  });

  it('throws on network error', async () => {
    const { fetchMarketData } = require('../../services/marketService');
    global.fetch.mockRejectedValue(new Error('fetch failed'));

    await expect(fetchMarketData('Item')).rejects.toThrow('Network error fetching market data');
  });

  it('throws on non-ok response', async () => {
    const { fetchMarketData } = require('../../services/marketService');
    global.fetch.mockResolvedValue({
      ok: false,
      status: 404,
      text: jest.fn().mockResolvedValue('Not found'),
    });

    await expect(fetchMarketData('Item')).rejects.toThrow('Failed to fetch market data: 404');
  });
});
