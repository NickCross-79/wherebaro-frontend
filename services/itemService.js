/**
 * Item and inventory API service
 */
import { buildUrl, apiFetch } from './apiConfig';

const ENDPOINTS = {
  GET_CURRENT: buildUrl('getCurrent'),
  GET_ALL_ITEMS: buildUrl('getAllItems'),
};

/**
 * Fetch current Baro inventory
 * @returns {Promise<Object>} Current Baro data
 */
export const fetchCurrentBaro = async () => {
  return apiFetch(ENDPOINTS.GET_CURRENT);
};

/**
 * Fetch all items
 * @returns {Promise<Array>} Array of all items
 */
export const fetchAllItems = async () => {
  return apiFetch(ENDPOINTS.GET_ALL_ITEMS);
};

export default {
  fetchCurrentBaro,
  fetchAllItems,
};
