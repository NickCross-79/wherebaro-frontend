import { useState, useEffect } from 'react';

// Replace with your actual API endpoint
const API_URL = 'https://your-api-endpoint.azurewebsites.net/api';

export default function useBaroInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextArrival, setNextArrival] = useState(null);
  const [nextLocation, setNextLocation] = useState(null);
  const [isHere, setIsHere] = useState(false);

  const fetchBaroInventory = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration - replace with actual API call
      // const response = await fetch(`${API_URL}/baro-inventory`);
      // const data = await response.json();
      
      // Mock data - Toggle this to test both modes
      const baroIsHere = false; // Set to true to test "is here" mode
      
      const mockData = baroIsHere ? [
        {
          name: 'Primed Continuity',
          image: 'https://via.placeholder.com/150',
          creditPrice: 100000,
          ducatPrice: 350,
          type: 'Mod',
          likes: 245,
          dateAdded: new Date('2026-01-27')
        },
        {
          name: 'Prisma Gorgon',
          image: 'https://via.placeholder.com/150',
          creditPrice: 250000,
          ducatPrice: 600,
          type: 'Weapon',
          likes: 189,
          dateAdded: new Date('2026-01-29')
        },
        {
          name: 'Primed Flow',
          image: 'https://via.placeholder.com/150',
          creditPrice: 110000,
          ducatPrice: 350,
          type: 'Mod',
          likes: 312,
          dateAdded: new Date('2026-01-28')
        }
      ] : [];
      
      // Sort items by date (newest first)
      const sortedItems = mockData.sort((a, b) => b.dateAdded - a.dateAdded);
      
      setItems(sortedItems);
      setIsHere(baroIsHere);
      
      // Calculate next arrival (mock - replace with actual logic)
      const now = new Date();
      const next = baroIsHere 
        ? new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000)) // Leaves in 2 days
        : new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // Arrives in 7 days
      setNextArrival(next);
      
      // Mock location data - replace with actual API data
      const locations = [
        { name: 'Strata Relay', planet: 'Earth' },
        { name: 'Orcus Relay', planet: 'Pluto' },
        { name: 'Kronia Relay', planet: 'Saturn' },
        { name: 'Vesper Relay', planet: 'Venus' },
      ];
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      setNextLocation(randomLocation);
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
