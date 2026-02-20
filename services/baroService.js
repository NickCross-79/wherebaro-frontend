/**
 * Baro Ki'Teer API service
 * Handles fetching Baro status from warframestat.us API
 * with fallback to our backend's current document,
 * and optional simulation mode for testing arrivals.
 */
import { buildUrl } from './apiConfig';
import logger from '../utils/logger';

const BARO_API_URL = 'https://api.warframestat.us/pc/voidTraders/';
const GET_CURRENT_URL = buildUrl('getCurrent');

// ─── SIMULATION MODE ───────────────────────────────────────────────
// SIMULATE_BARO_ARRIVAL: First fetch returns mock "absent" data with
//   a near-future arrival. Timer expires → polls real API for active Baro.
//
// SIMULATE_BARO_DEPARTURE: First fetch returns mock "active" data with
//   inventory and a near-future expiry. Timer expires → fetches real API
//   which shows Baro has left. Set SIMULATE_DEPARTURE_SECONDS to control
//   how many seconds until the mock Baro "leaves".
//
// Only enable ONE at a time!
const SIMULATE_BARO_ARRIVAL = false; // Simulate Baro arrival on first fetch
const SIMULATE_BARO_DEPARTURE = false; // Simulate Baro departure on first fetch
const SIMULATE_DEPARTURE_SECONDS = 30; // How soon mock Baro leaves
const SIMULATE_MOCK_URL = buildUrl('mockBaroAbsent');
// ────────────────────────────────────────────────────────────────────

let simulationUsed = false;

/**
 * Fetch raw Baro data from the warframestat.us API.
 * In simulation mode, the first call returns mock "absent" data,
 * and all subsequent calls use the real API.
 * @returns {Promise<Object>} Raw Baro API response
 */
export const fetchBaroData = async () => {
  // Departure simulation: first call returns mock "Baro is here" data
  // with a near-future expiry so the departure timer fires quickly.
  if (SIMULATE_BARO_DEPARTURE && !simulationUsed) {
    simulationUsed = true;
    const now = new Date();
    const activation = new Date(now.getTime() - 60 * 60 * 1000); // 1h ago
    const expiry = new Date(now.getTime() + SIMULATE_DEPARTURE_SECONDS * 1000);
    logger.debug('BaroService', `Departure sim: Baro leaves in ${SIMULATE_DEPARTURE_SECONDS}s`);

    // Fetch real inventory from warframestat.us so matching works
    let inventory = [];
    try {
      const realResp = await fetch(BARO_API_URL);
      if (realResp.ok) {
        const realArr = await realResp.json();
        const realData = Array.isArray(realArr) ? realArr[0] : realArr;
        inventory = realData?.inventory || [];
      }
    } catch (e) {
      logger.warn('BaroService', 'Could not fetch real inventory for departure sim');
    }

    return {
      activation: activation.toISOString(),
      expiry: expiry.toISOString(),
      inventory,
      location: 'Simulation Relay',
    };
  }

  // Arrival simulation: first call returns mock "absent" data
  let fetchUrl = BARO_API_URL;
  if (SIMULATE_BARO_ARRIVAL && !simulationUsed) {
    fetchUrl = SIMULATE_MOCK_URL;
    simulationUsed = true;
    logger.debug('BaroService', 'Arrival sim: using mock absent endpoint');
  }

  logger.debug('BaroService', `Fetching: ${fetchUrl}`);
  const response = await fetch(fetchUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch Baro data: ${response.status}`);
  }
  const json = await response.json();
  const data = Array.isArray(json) ? json[0] : json;
  if (!data) {
    throw new Error('Empty response from voidTraders endpoint');
  }
  logger.debug('BaroService', `Response: active=${isBaroActive(data.activation, data.expiry)}, inventory=${data.inventory?.length || 0}, location=${data.location}`);
  return data;
};

/**
 * Fetch Baro data with automatic fallback.
 * Tries warframestat.us first, falls back to our backend's current document.
 * @returns {Promise<Object>} Baro data with { activation, expiry, inventory, location }
 */
export const fetchBaroDataWithFallback = async () => {
  let data;
  try {
    data = await fetchBaroData();
  } catch (error) {
    logger.warn('BaroService', `Warframestat API failed: ${error.message}, falling back to backend...`);
    return await fetchFromBackend(error);
  }

  // Baro is active but API returned no inventory — fall back to backend
  const active = isBaroActive(data.activation, data.expiry);
  if (active && (!data.inventory || data.inventory.length === 0)) {
    logger.warn('BaroService', 'Warframestat returned active Baro with empty inventory, falling back to backend...');
    try {
      const fallback = await fetchFromBackend();
      if (fallback.inventory && fallback.inventory.length > 0) {
        return fallback;
      }
      logger.warn('BaroService', 'Backend also returned empty inventory — using warframestat response');
    } catch {
      logger.warn('BaroService', 'Backend fallback failed — using warframestat response');
    }
  }

  return data;
};

/**
 * Fetch Baro data from our backend's current document.
 * @param {Error} [originalError] - If provided, re-thrown when backend also fails
 * @returns {Promise<Object>} Normalized Baro data
 */
const fetchFromBackend = async (originalError) => {
  try {
    const response = await fetch(GET_CURRENT_URL);
    if (!response.ok) {
      throw new Error(`Backend getCurrent failed: ${response.status}`);
    }
    const current = await response.json();
    logger.debug('BaroService', `Backend fallback: isActive=${current.isActive}, items=${current.items?.length || 0}`);
    // Normalize shape: backend returns full item documents,
    // consumers expect warframestat-style { uniqueName, item, ducats, credits }
    const inventory = (current.items || []).map(item => ({
      uniqueName: item.uniqueName || '',
      item: item.name || '',
      ducats: item.ducatPrice ?? 0,
      credits: item.creditPrice ?? 0,
    }));
    return {
      activation: current.activation,
      expiry: current.expiry,
      location: current.location,
      inventory,
    };
  } catch (fallbackError) {
    logger.error('BaroService', `Backend fallback also failed: ${fallbackError.message}`);
    throw originalError || fallbackError;
  }
};

/**
 * Determine if Baro is currently active based on activation/expiry times.
 * @param {string} activation - ISO date string
 * @param {string} expiry - ISO date string
 * @returns {boolean}
 */
export const isBaroActive = (activation, expiry) => {
  const now = new Date();
  return now >= new Date(activation) && now < new Date(expiry);
};

/**
 * Reset simulation state (for testing).
 */
export const resetSimulation = () => {
  simulationUsed = false;
};
