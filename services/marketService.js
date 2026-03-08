/**
 * Market API service
 */

import { toSlug } from '../utils/slugify';

// In-memory cache: { [slug]: { data, timestamp } }
const marketCache = new Map();
const MARKET_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch market data for an item directly from warframe.market.
 * Results are cached in memory for 5 minutes to avoid redundant calls
 * when navigating back and forth to the same item.
 * @param {string} itemName - Item name (e.g., 'Primed Flow')
 * @returns {Promise<Object>} Market data from warframe.market
 */
export const fetchMarketData = async (itemName) => {
  const slug = toSlug(itemName);

  // Return cached data if fresh
  const cached = marketCache.get(slug);
  if (cached && Date.now() - cached.timestamp < MARKET_CACHE_TTL) {
    console.log('[Market] Using cached data for:', slug);
    return cached.data;
  }

  const url = `https://api.warframe.market/v1/items/${slug}/statistics`;
  console.log('[Market] Fetching:', url);
  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    console.error('[Market] Network error:', err);
    throw new Error('Network error fetching market data');
  }
  if (!response.ok) {
    const text = await response.text();
    console.error(`[Market] API error ${response.status}:`, text);
    throw new Error(`Failed to fetch market data: ${response.status}`);
  }
  const data = await response.json();
  console.log('[Market] Full API response:', data);
  if (!data.payload) {
    console.error('[Market] Unexpected response:', data);
  }
  const result = { market: data.payload || data };
  marketCache.set(slug, { data: result, timestamp: Date.now() });
  return result;
};
