/**
 * Market API service
 */
import { buildUrl, apiFetch } from './apiConfig';

const ENDPOINTS = {
  GET_MARKET_DATA: buildUrl('getMarketData'),
};

/**
 * Fetch market data for an item
 * @param {string} itemId - Item ID
 * @returns {Promise<Object>} Market data with price history
 */
export const fetchMarketData = async (itemId) => {
  return apiFetch(`${ENDPOINTS.GET_MARKET_DATA}?item_id=${itemId}`);
};

export default {
  fetchMarketData,
};
