/**
 * API configuration and utilities
 */
import Constants from 'expo-constants';

export const API_BASE_URL =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_AZURE_FUNCTION_APP_BASE_URL ||
  process.env.EXPO_PUBLIC_AZURE_FUNCTION_APP_BASE_URL ||
  process.env.AZURE_FUNCTION_APP_BASE_URL ||
  '';

/**
 * Normalizes the base URL by adding https:// if needed
 */
export const normalizeBaseUrl = () => {
  if (!API_BASE_URL) return '';
  const normalizedBase = API_BASE_URL.startsWith('http')
    ? API_BASE_URL
    : `https://${API_BASE_URL}`;
  return normalizedBase.replace(/\/$/, '');
};

/**
 * Builds an API endpoint URL
 * @param {string} endpoint - The endpoint path (e.g., 'postReview')
 * @returns {string} Full API URL
 */
export const buildUrl = (endpoint) => {
  const base = normalizeBaseUrl();
  if (!base) return '';
  return `${base}/${endpoint}`;
};

/**
 * Common fetch wrapper with error handling
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} Response data
 */
export const apiFetch = async (url, options = {}) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

/**
 * POST request helper
 * @param {string} url - The URL to POST to
 * @param {Object} data - Data to send
 * @returns {Promise<any>} Response data
 */
export const apiPost = async (url, data) => {
  return apiFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};
