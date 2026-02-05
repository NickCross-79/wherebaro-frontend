/**
 * Market API service
 */

import { toSlug } from '../utils/slugify';

/**
 * Fetch market data for an item directly from warframe.market
 * @param {string} itemName - Item name (e.g., 'Primed Flow')
 * @returns {Promise<Object>} Market data from warframe.market
 */
export const fetchMarketData = async (itemName) => {
  const slug = toSlug(itemName);
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
  return { market: data.payload || data };
};

export default {
  fetchMarketData,
};
