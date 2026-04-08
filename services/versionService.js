import { buildUrl } from './apiConfig';
import logger from '../utils/logger';

const GET_MIN_VERSION_URL = buildUrl('getMinVersion');

/**
 * Fetches the minimum required app version from the backend.
 * @returns {Promise<string|null>} The minimum version string, or null on failure.
 */
export const fetchMinVersion = async () => {
  try {
    const response = await fetch(GET_MIN_VERSION_URL);
    if (!response.ok) return null;
    const data = await response.json();
    return data.minVersion || null;
  } catch (error) {
    logger.error('Failed to fetch min version:', error);
    return null;
  }
};

/**
 * Compares two semver strings (e.g. "1.2.0" < "1.3.0").
 * @returns {boolean} true if current < required
 */
export const isVersionOutdated = (current, required) => {
  if (!current || !required) return false;
  const c = current.split('.').map(Number);
  const r = required.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((c[i] || 0) < (r[i] || 0)) return true;
    if ((c[i] || 0) > (r[i] || 0)) return false;
  }
  return false;
};
