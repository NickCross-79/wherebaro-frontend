/**
 * Baro Ki'Teer API service
 * Handles fetching Baro status from warframestat.us API
 * with optional simulation mode for testing arrivals.
 */
import { buildUrl } from './apiConfig';
import logger from '../utils/logger';

const BARO_API_URL = 'https://api.warframestat.us/pc/voidTrader/';

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
const SIMULATE_BARO_ARRIVAL = false;
const SIMULATE_BARO_DEPARTURE = false;
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
    logger.debug('BaroService', `🧪 Departure sim: Baro leaves in ${SIMULATE_DEPARTURE_SECONDS}s`);

    // Fetch real inventory from warframestat.us so matching works
    let inventory = [];
    try {
      const realResp = await fetch(BARO_API_URL);
      if (realResp.ok) {
        const realData = await realResp.json();
        inventory = realData.inventory || [];
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
    logger.debug('BaroService', '🧪 Arrival sim: using mock absent endpoint');
  }

  logger.debug('BaroService', `Fetching: ${fetchUrl}`);
  const response = await fetch(fetchUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch Baro data: ${response.status}`);
  }
  const data = await response.json();
  logger.debug('BaroService', `Response: active=${isBaroActive(data.activation, data.expiry)}, inventory=${data.inventory?.length || 0}, location=${data.location}`);
  return data;
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
