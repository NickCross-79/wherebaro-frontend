import { useState, useEffect } from 'react';

// Replace with your actual API endpoint
const API_URL = 'http://localhost:7071/getAllBaroItems';
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

  const fetchBaroInventory = async () => {
    try {
      setLoading(true);
      
      // Toggle this to test both modes
      const baroIsHere = true; // Set to true to test "is here" mode
      
      // Mock data for when Baro is currently here
      const mockData = baroIsHere ? [
        {
          _id: '697ac785ddd92b4eafb3b221',
          name: 'Primed Continuity',
          image: 'PrimedContinuityMod.png',
          link: 'Primed Continuity',
          creditPrice: 100000,
          ducatPrice: 350,
          type: 'Mod',
          offeringDates: ['2026-01-27', '2026-01-29'],
          likes: 245,
          reviews: []
        },
        {
          _id: '697ac785ddd92b4eafb3b222',
          name: 'Prisma Gorgon',
          image: 'PrismaGorgon.png',
          link: 'Prisma Gorgon',
          creditPrice: 250000,
          ducatPrice: 600,
          type: 'Weapon',
          offeringDates: ['2026-01-28'],
          likes: 189,
          reviews: []
        },
        {
          _id: '697ac785ddd92b4eafb3b223',
          name: 'Primed Flow',
          image: 'PrimedFlowMod.png',
          link: 'Primed Flow',
          creditPrice: 110000,
          ducatPrice: 350,
          type: 'Mod',
          offeringDates: ['2026-01-26', '2026-01-29'],
          likes: 312,
          reviews: []
        },
        {
          _id: '697ac785ddd92b4eafb3b224',
          name: 'Primed Pressure Point',
          image: 'PrimedPressurePointMod.png',
          link: 'Primed Pressure Point',
          creditPrice: 110000,
          ducatPrice: 350,
          type: 'Mod',
          offeringDates: ['2026-01-28'],
          likes: 278,
          reviews: []
        },
        {
          _id: '697ac785ddd92b4eafb3b225',
          name: 'Prisma Skana',
          image: 'PrismaSkana.png',
          link: 'Prisma Skana',
          creditPrice: 175000,
          ducatPrice: 510,
          type: 'Weapon',
          offeringDates: ['2026-01-27'],
          likes: 156,
          reviews: []
        },
        {
          _id: '697ac785ddd92b4eafb3b226',
          name: 'Primed Reach',
          image: 'PrimedReachMod.png',
          link: 'Primed Reach',
          creditPrice: 100000,
          ducatPrice: 350,
          type: 'Mod',
          offeringDates: ['2026-01-29'],
          likes: 201,
          reviews: []
        },
        {
          _id: '697ac785ddd92b4eafb3b227',
          name: 'Prisma Grakata',
          image: 'PrismaGrakata.png',
          link: 'Prisma Grakata',
          creditPrice: 250000,
          ducatPrice: 600,
          type: 'Weapon',
          offeringDates: ['2026-01-26'],
          likes: 324,
          reviews: []
        },
        {
          _id: '697ac785ddd92b4eafb3b228',
          name: 'Primed Target Cracker',
          image: 'PrimedTargetCrackerMod.png',
          link: 'Primed Target Cracker',
          creditPrice: 100000,
          ducatPrice: 350,
          type: 'Mod',
          offeringDates: ['2026-01-28'],
          likes: 167,
          reviews: []
        },
        {
          _id: '697ac785ddd92b4eafb3b229',
          name: 'Prisma Tetra',
          image: 'PrismaTetra.png',
          link: 'Prisma Tetra',
          creditPrice: 200000,
          ducatPrice: 550,
          type: 'Weapon',
          offeringDates: ['2026-01-27'],
          likes: 143,
          reviews: []
        },
        {
          _id: '697ac785ddd92b4eafb3b22a',
          name: 'Primed Pistol Gambit',
          image: 'PrimedPistolGambitMod.png',
          link: 'Primed Pistol Gambit',
          creditPrice: 100000,
          ducatPrice: 350,
          type: 'Mod',
          offeringDates: ['2026-01-29'],
          likes: 289,
          reviews: []
        }
      ] : [];
      
      // Normalize and sort items by most recent offering date (newest first)
      const normalizedItems = mockData.map(normalizeItem);
      const sortedItems = normalizedItems.sort((a, b) => {
        if (!a.dateAdded) return 1;
        if (!b.dateAdded) return -1;
        return b.dateAdded - a.dateAdded;
      });
      
      setItems(sortedItems);
      setIsHere(baroIsHere);
      
      // Calculate next arrival
      const now = new Date();
      const next = baroIsHere 
        ? new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000)) // Leaves in 2 days
        : new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // Arrives in 7 days
      setNextArrival(next);
      
      // Mock location data
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
