import { useState, useEffect } from 'react';

const API_URL = 'https://wherebaro-function-app-a0gfdxabe3caemg7.canadacentral-01.azurewebsites.net/getAllBaroItems';
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
