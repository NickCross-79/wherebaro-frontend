/**
 * Item and inventory API service
 */
import { buildUrl, apiFetch } from './apiConfig';
import logger from '../utils/logger';

const ENDPOINTS = {
  GET_ALL_ITEMS: buildUrl('getAllItems'),
  GET_CURRENT: buildUrl('getCurrent'),
};

/**
 * Fetch Baro status from our backend (lightweight check).
 * Returns { isActive, activation, expiry, location, items }
 */
export const fetchBaroStatus = async () => {
  logger.debug('ItemService', `Fetching Baro status from: ${ENDPOINTS.GET_CURRENT}`);
  const result = await apiFetch(ENDPOINTS.GET_CURRENT);
  logger.debug('ItemService', `Baro status: isActive=${result.isActive}, items=${result.items?.length || 0}`);
  return result;
};

/**
 * Fetch all items
 * @returns {Promise<Array>} Array of all items
 */
export const fetchAllItems = async () => {
  return apiFetch(ENDPOINTS.GET_ALL_ITEMS);
};

export default {
  fetchAllItems,
  fetchBaroStatus,
};
