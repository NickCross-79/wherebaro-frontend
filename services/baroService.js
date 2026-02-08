/**
 * Baro Ki'Teer API service
 * Handles fetching Baro status from warframestat.us API
 * with optional simulation mode for testing arrivals.
 */
import { buildUrl } from './apiConfig';
import logger from '../utils/logger';

const BARO_API_URL = 'https://api.warframestat.us/pc/voidTrader/';

// ─── SIMULATION MODE ───────────────────────────────────────────────
// Set to true to simulate a Baro arrival. The first fetch uses the mock
// endpoint (Baro absent). When the timer expires, subsequent fetches
// use the real warframestat.us API (where Baro is currently active).
const SIMULATE_BARO_ARRIVAL = false; // Toggle simulation mode on/off
const SIMULATE_MOCK_URL = buildUrl('mockBaroAbsent');
// ────────────────────────────────────────────────────────────────────

let simulationUsed = false; // Tracks if the simulation endpoint has been used (only first fetch should use it)

/**
 * Fetch raw Baro data from the warframestat.us API.
 * In simulation mode, the first call returns mock "absent" data,
 * and all subsequent calls use the real API.
 * @returns {Promise<Object>} Raw Baro API response
 */
export const fetchBaroData = async () => {
  let fetchUrl = BARO_API_URL;

  if (SIMULATE_BARO_ARRIVAL && !simulationUsed) {
    fetchUrl = SIMULATE_MOCK_URL;
    simulationUsed = true;
    logger.debug('BaroService', '🧪 Simulation mode: using mock endpoint');
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
