/**
 * Item and inventory API service
 */
import { buildUrl, apiFetch } from './apiConfig';

const ENDPOINTS = {
  GET_ALL_ITEMS: buildUrl('getAllItems'),
};

const BARO_API_URL = 'https://api.warframestat.us/pc/voidTrader/';

/**
 * Determine if Baro is currently active
 * @param {string} activation - ISO date string
 * @param {string} expiry - ISO date string
 * @returns {boolean}
 */
const isBaroActive = (activation, expiry) => {
  const now = new Date();
  const activationDate = new Date(activation);
  const expiryDate = new Date(expiry);
  return now >= activationDate && now <= expiryDate;
};

/**
 * Extracts the last segment from a uniqueName path.
 */
const getUniqueNameSuffix = (uniqueName) => {
  if (!uniqueName) return '';
  const parts = uniqueName.split('/');
  return parts[parts.length - 1];
};

/**
 * Fetch current Baro inventory from warframestat.us API
 * @returns {Promise<Object>} Current Baro data
 */
export const fetchCurrentBaro = async () => {
  try {
    // Fetch Baro data from Warframestat API
    const baroResponse = await fetch(BARO_API_URL);
    if (!baroResponse.ok) {
      throw new Error(`Failed to fetch Baro data: ${baroResponse.status}`);
    }
    const baroData = await baroResponse.json();

    // Fetch all items from our backend to get full metadata
    const allItems = await fetchAllItems();

    // Build uniqueName suffix map for matching
    const itemsBySuffix = new Map();
    for (const item of allItems) {
      if (item.uniqueName) {
        const suffix = getUniqueNameSuffix(item.uniqueName)?.toLowerCase();
        if (suffix) itemsBySuffix.set(suffix, item);
      }
    }
    // Fallback name map
    const itemsByName = new Map(allItems.map(item => [item.name?.toLowerCase(), item]));

    // Match inventory items using uniqueName suffix, fallback to name
    const items = baroData.inventory.map(inventoryItem => {
      const invSuffix = getUniqueNameSuffix(inventoryItem.uniqueName)?.toLowerCase();
      let fullItem = invSuffix ? itemsBySuffix.get(invSuffix) : null;

      if (!fullItem && inventoryItem.item) {
        fullItem = itemsByName.get(inventoryItem.item.toLowerCase());
      }

      if (!fullItem) {
        return {
          name: inventoryItem.item,
          image: '',
          link: '',
          creditPrice: inventoryItem.credits,
          ducatPrice: inventoryItem.ducats,
          type: 'Unknown',
          offeringDates: [],
          likes: [],
          reviews: []
        };
      }
      return {
        ...fullItem,
        creditPrice: inventoryItem.credits,
        ducatPrice: inventoryItem.ducats
      };
    });

    return {
      isActive: isBaroActive(baroData.activation, baroData.expiry),
      activation: baroData.activation,
      expiry: baroData.expiry,
      location: baroData.location,
      items
    };
  } catch (error) {
    console.error('Error fetching Baro data:', error);
    throw error;
  }
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
