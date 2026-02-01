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
  return `${normalizedBase.replace(/\/$/, '')}/getAllBaroItems`;
};

const API_URL = buildApiUrl();
const WARFRAME_IMAGE_BASE = 'https://wiki.warframe.com/images/';

const normalizeItem = (item) => {
  return {
    id: item._id,
    name: item.name,
    image: item.image ? `${WARFRAME_IMAGE_BASE}${item.image}` : 'https://via.placeholder.com/150',
    link: item.link,
    creditPrice: item.creditPrice,
    ducatPrice: item.ducatPrice,
    type: item.type,
    offeringDates: item.offeringDates || [],
    likes: item.likes || 0,
    reviews: item.reviews || [],
  };
};

export default function useAllBaroItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = async () => {
    try {
      if (!API_URL) {
        throw new Error('Missing functions app base URL');
      }
      setError(null);
      console.log('Fetching items from:', API_URL);
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched items');
      const normalized = data.map(normalizeItem);
      setItems(normalized);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  return {
    items,
    loading,
    refreshing,
    error,
    onRefresh,
  };
}
