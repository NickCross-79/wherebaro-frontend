import { useState, useEffect } from 'react';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_AZURE_FUNCTION_APP_BASE_URL ||
  process.env.AZURE_FUNCTION_APP_BASE_URL ||
  '';

const buildApiUrl = () => {
  if (!API_BASE_URL) return '';
  const normalizedBase = API_BASE_URL.startsWith('http')
    ? API_BASE_URL
    : `https://${API_BASE_URL}`;
  return `${normalizedBase.replace(/\/$/, '')}/getBaroCurrent`;
};

const API_URL = buildApiUrl();
const WARFRAME_IMAGE_BASE = 'https://wiki.warframe.com/images/';

// Normalize backend data to frontend format
const normalizeItem = (item) => {
  // Get the most recent offering date
  const offeringDates = item.offeringDates || [];
  const lastOffering = offeringDates.length > 0 
    ? new Date(offeringDates[offeringDates.length - 1])
    : null;

  return {
    id: item._id,
    name: item.name,
    image: item.image ? `${WARFRAME_IMAGE_BASE}/${item.image}` : 'https://via.placeholder.com/150',
    link: item.link,
    creditPrice: item.creditPrice,
    ducatPrice: item.ducatPrice,
    type: item.type,
    offeringDates: item.offeringDates,
    likes: item.likes || 0,
    reviews: item.reviews || [],
    dateAdded: lastOffering,
  };
};

export default function useBaroInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextArrival, setNextArrival] = useState(null);
  const [nextLocation, setNextLocation] = useState(null);
  const [isHere, setIsHere] = useState(false);

  const parseLocation = (location) => {
    if (!location) return null;
    const trimmed = String(location).trim();
    if (!trimmed) return null;

    const parenMatch = trimmed.match(/^(.*?)\s*\((.*?)\)\s*$/);
    if (parenMatch) {
      return { name: parenMatch[1].trim(), planet: parenMatch[2].trim() };
    }

    const commaParts = trimmed.split(',').map((part) => part.trim()).filter(Boolean);
    if (commaParts.length >= 2) {
      return { name: commaParts[0], planet: commaParts[1] };
    }

    return { name: trimmed, planet: '' };
  };

  const fetchBaroInventory = async () => {
    try {
      setLoading(true);
      if (!API_URL) {
        throw new Error('Missing functions app base URL');
      }

      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const baroIsHere = Boolean(data?.isActive);

      const normalizedItems = Array.isArray(data?.items)
        ? data.items.map(normalizeItem)
        : [];

      const sortedItems = normalizedItems.sort((a, b) => {
        if (!a.dateAdded) return 1;
        if (!b.dateAdded) return -1;
        return b.dateAdded - a.dateAdded;
      });

      setItems(sortedItems);
      setIsHere(baroIsHere);

      const nextDate = baroIsHere ? data?.expiry : data?.activation;
      setNextArrival(nextDate ? new Date(nextDate) : null);
      setNextLocation(parseLocation(data?.location));
    } catch (error) {
      console.error('Error fetching Baro inventory:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBaroInventory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBaroInventory();
  };

  return {
    items,
    loading,
    refreshing,
    nextArrival,
    nextLocation,
    isHere,
    onRefresh,
  };
}
