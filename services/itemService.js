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

    // Create a map of items by name for quick lookup
    const itemsByName = new Map(allItems.map(item => [item.name, item]));

    // Match inventory items to our database
    const items = baroData.inventory.map(inventoryItem => {
      const fullItem = itemsByName.get(inventoryItem.item);
      if (!fullItem) {
        // If item not found in database, create a minimal item
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
      // Return full item with prices from Baro API
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
