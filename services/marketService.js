/**
 * Market API service
 */
import { buildUrl, apiFetch } from './apiConfig';
import { storageHelpers } from '../utils/storage';

const ENDPOINTS = {
  GET_MARKET_DATA: buildUrl('getMarketData'),
};

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
 * Fetch market data for an item (with caching)
 * @param {string} itemId - Item ID
 * @returns {Promise<Object>} Market data with price history
 */
export const fetchMarketData = async (itemId) => {
  // Check cache first
  const cachedEntry = await storageHelpers.getMarketData(itemId);
  
  if (cachedEntry && isCacheValid(cachedEntry.lastFetched)) {
    console.log(`📦 Using cached market data for item ${itemId}`);
    return { market: cachedEntry.data };
  }
  
  // Fetch fresh data
  console.log(`🌐 Fetching fresh market data for item ${itemId}`);
  const response = await apiFetch(`${ENDPOINTS.GET_MARKET_DATA}?item_id=${itemId}`);
  
  // Cache the fresh data
  if (response?.market) {
    await storageHelpers.setMarketData(itemId, response.market);
  }
  
  return response;
};

export default {
  fetchMarketData,
};
