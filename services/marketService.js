/**
 * Market API service
 */

import { toMarketSlug } from '../utils/marketSlug';

/**
 * Check if cached market data is still valid
 * @param {string} lastFetched - ISO timestamp of when data was last fetched
 * @returns {boolean} True if cache is still valid
 */
const isCacheValid = (lastFetched) => {
  const lastFetchTime = new Date(lastFetched);
  const now = new Date();
  const currentHour = now.getUTCHours();
  const currentMinute = now.getUTCMinutes();
  
  // Data is updated daily at 20:00 UTC, allow 10 min buffer (20:10)
  const isAfterUpdate = currentHour > 20 || (currentHour === 20 && currentMinute >= 10);
  
  // Check if cached data is from today
  const isSameDay = lastFetchTime.getUTCDate() === now.getUTCDate() &&
                   lastFetchTime.getUTCMonth() === now.getUTCMonth() &&
                   lastFetchTime.getUTCFullYear() === now.getUTCFullYear();
  
  // If cached data is from today and we're before the update time, cache is valid
  if (isSameDay && !isAfterUpdate) {
    return true;
  }
  
  // If cached data is from today after update time, cache is valid
  if (isSameDay && isAfterUpdate && lastFetchTime.getUTCHours() >= 20) {
    return true;
  }
  
  return false;
};


/**
 * Fetch market data for an item directly from warframe.market
 * @param {string} itemName - Item name (e.g., 'Primed Flow')
 * @returns {Promise<Object>} Market data from warframe.market
 */
export const fetchMarketData = async (itemName) => {
  const slug = toMarketSlug(itemName);
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
