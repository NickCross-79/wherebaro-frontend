/**
 * Integration tests for Baro inventory matching logic.
 * Tests the matchInventoryItems function extracted from InventoryContext
 * which is the core logic for matching API inventory to cached items.
 */

// Re-implement the matching functions here for isolated testing
// (they're defined inside InventoryContext.js as module-level functions)

const getUniqueNameSuffix = (uniqueName) => {
  if (!uniqueName) return '';
  const parts = uniqueName.split('/');
  return parts[parts.length - 1];
};

const buildSuffixMap = (cachedItems) => {
  const map = new Map();
  for (const item of cachedItems) {
    if (item.uniqueName) {
      const suffix = getUniqueNameSuffix(item.uniqueName);
      if (suffix) {
        map.set(suffix.toLowerCase(), item);
      }
    }
  }
  return map;
};

const matchInventoryItems = (inventory, cachedItems, visitDate) => {
  const suffixMap = buildSuffixMap(cachedItems);
  const nameMap = new Map(cachedItems.map(item => [item.name?.toLowerCase(), item]));
  const visitDay = visitDate ? new Date(visitDate).toISOString().split('T')[0] : null;

  const results = inventory.map(invItem => {
    const invSuffix = getUniqueNameSuffix(invItem.uniqueName)?.toLowerCase();
    let fullItem = invSuffix ? suffixMap.get(invSuffix) : null;

    if (!fullItem && invItem.item) {
      fullItem = nameMap.get(invItem.item.toLowerCase());
    }

    if (!fullItem) {
      return {
        _unmatched: true,
        name: invItem.item,
        image: '',
        creditPrice: invItem.credits,
        ducatPrice: invItem.ducats,
        type: 'Unknown',
        offeringDates: [],
        likes: [],
        reviews: [],
      };
    }

    const merged = {
      ...fullItem,
      creditPrice: invItem.credits,
      ducatPrice: invItem.ducats,
    };
    merged.isNew = visitDay
      && Array.isArray(merged.offeringDates)
      && merged.offeringDates.length === 1
      && merged.offeringDates[0] === visitDay;
    return merged;
  });

  return results;
};

// --- Test Data ---

const cachedItems = [
  {
    _id: '1',
    name: 'Primed Flow',
    uniqueName: '/Lotus/StoreItems/Types/Mods/FusionMods/PrimedFlow',
    image: '/img/primed_flow.png',
    type: 'Primed Mod',
    likes: 10,
    reviews: [],
    offeringDates: ['2025-01-10', '2025-06-20'],
  },
  {
    _id: '2',
    name: 'Prisma Grinlok',
    uniqueName: '/Lotus/StoreItems/Types/Weapons/Tenno/PrismaGrinlok',
    image: '/img/prisma_grinlok.png',
    type: 'Prisma Primary',
    likes: 5,
    reviews: [],
    offeringDates: ['2025-06-20'],
  },
  {
    _id: '3',
    name: "Ki'Teer Syandana",
    uniqueName: '/Lotus/StoreItems/Types/Cosmetics/KiTeerSyandana',
    image: '/img/kiteer_syandana.png',
    type: 'Cosmetic',
    likes: 2,
    reviews: [],
    offeringDates: [],
  },
];

describe('getUniqueNameSuffix', () => {
  it('extracts the last segment of a path', () => {
    expect(getUniqueNameSuffix('/Lotus/StoreItems/Types/Mods/PrimedFlow')).toBe('PrimedFlow');
  });

  it('returns empty string for null/undefined', () => {
    expect(getUniqueNameSuffix(null)).toBe('');
    expect(getUniqueNameSuffix(undefined)).toBe('');
    expect(getUniqueNameSuffix('')).toBe('');
  });

  it('returns the string itself when no slashes', () => {
    expect(getUniqueNameSuffix('PrimedFlow')).toBe('PrimedFlow');
  });
});

describe('matchInventoryItems', () => {
  it('matches items by uniqueName suffix', () => {
    const inventory = [
      {
        item: 'Primed Flow',
        uniqueName: '/Lotus/Upgrades/Mods/Fusionmods/PrimedFlow',
        credits: 150000,
        ducats: 300,
      },
    ];

    const result = matchInventoryItems(inventory, cachedItems);
    expect(result).toHaveLength(1);
    expect(result[0]._unmatched).toBeUndefined();
    expect(result[0].name).toBe('Primed Flow');
    expect(result[0].creditPrice).toBe(150000); // Overwritten from API
    expect(result[0].ducatPrice).toBe(300);
    expect(result[0].image).toBe('/img/primed_flow.png'); // From cache
    expect(result[0].type).toBe('Primed Mod');
  });

  it('falls back to name matching when uniqueName does not match', () => {
    const inventory = [
      {
        item: "Ki'Teer Syandana",
        uniqueName: '/Lotus/Something/Completely/Different',
        credits: 50000,
        ducats: 200,
      },
    ];

    const result = matchInventoryItems(inventory, cachedItems);
    expect(result).toHaveLength(1);
    expect(result[0]._unmatched).toBeUndefined();
    expect(result[0].name).toBe("Ki'Teer Syandana");
    expect(result[0].creditPrice).toBe(50000);
  });

  it('marks items as unmatched when neither suffix nor name matches', () => {
    const inventory = [
      {
        item: 'Brand New Item',
        uniqueName: '/Lotus/StoreItems/Types/NewStuff/BrandNew',
        credits: 75000,
        ducats: 150,
      },
    ];

    const result = matchInventoryItems(inventory, cachedItems);
    expect(result).toHaveLength(1);
    expect(result[0]._unmatched).toBe(true);
    expect(result[0].name).toBe('Brand New Item');
    expect(result[0].creditPrice).toBe(75000);
    expect(result[0].ducatPrice).toBe(150);
    expect(result[0].type).toBe('Unknown');
  });

  it('matches multiple items in a single inventory', () => {
    const inventory = [
      {
        item: 'Primed Flow',
        uniqueName: '/Lotus/Upgrades/PrimedFlow',
        credits: 100000,
        ducats: 300,
      },
      {
        item: 'Prisma Grinlok',
        uniqueName: '/Lotus/Weapons/PrismaGrinlok',
        credits: 125000,
        ducats: 500,
      },
      {
        item: 'Unknown Widget',
        uniqueName: '/Lotus/Unknown/Widget',
        credits: 10000,
        ducats: 50,
      },
    ];

    const result = matchInventoryItems(inventory, cachedItems);
    expect(result).toHaveLength(3);
    expect(result[0]._unmatched).toBeUndefined();
    expect(result[1]._unmatched).toBeUndefined();
    expect(result[2]._unmatched).toBe(true);
  });

  it('handles empty inventory', () => {
    const result = matchInventoryItems([], cachedItems);
    expect(result).toEqual([]);
  });

  it('handles empty cached items (all unmatched)', () => {
    const inventory = [
      { item: 'Primed Flow', uniqueName: '/Lotus/PrimedFlow', credits: 100000, ducats: 300 },
    ];

    const result = matchInventoryItems(inventory, []);
    expect(result).toHaveLength(1);
    expect(result[0]._unmatched).toBe(true);
  });

  it('overrides creditPrice and ducatPrice from API data', () => {
    const inventory = [
      {
        item: 'Primed Flow',
        uniqueName: '/Lotus/PrimedFlow',
        credits: 999999,
        ducats: 888,
      },
    ];

    const result = matchInventoryItems(inventory, cachedItems);
    expect(result[0].creditPrice).toBe(999999);
    expect(result[0].ducatPrice).toBe(888);
  });

  it('is case-insensitive for suffix matching', () => {
    const inventory = [
      {
        item: 'Primed Flow',
        uniqueName: '/Lotus/Something/primedflow', // lowercase
        credits: 100000,
        ducats: 300,
      },
    ];

    const result = matchInventoryItems(inventory, cachedItems);
    expect(result[0]._unmatched).toBeUndefined();
    expect(result[0].name).toBe('Primed Flow');
  });

  it('marks item as new when it has exactly one offering date matching the visit', () => {
    const inventory = [
      { item: 'Prisma Grinlok', uniqueName: '/Lotus/PrismaGrinlok', credits: 125000, ducats: 500 },
    ];
    // Prisma Grinlok has offeringDates: ['2025-06-20'], visit is 2025-06-20
    const result = matchInventoryItems(inventory, cachedItems, '2025-06-20T14:00:00.000Z');
    expect(result[0].isNew).toBe(true);
  });

  it('does not mark item as new when it has multiple offering dates', () => {
    const inventory = [
      { item: 'Primed Flow', uniqueName: '/Lotus/PrimedFlow', credits: 100000, ducats: 300 },
    ];
    // Primed Flow has offeringDates: ['2025-01-10', '2025-06-20']
    const result = matchInventoryItems(inventory, cachedItems, '2025-06-20T14:00:00.000Z');
    expect(result[0].isNew).toBe(false);
  });

  it('does not mark item as new when its single date does not match the visit', () => {
    const inventory = [
      { item: 'Prisma Grinlok', uniqueName: '/Lotus/PrismaGrinlok', credits: 125000, ducats: 500 },
    ];
    // Prisma Grinlok has offeringDates: ['2025-06-20'], but visit is a different date
    const result = matchInventoryItems(inventory, cachedItems, '2025-07-04T14:00:00.000Z');
    expect(result[0].isNew).toBe(false);
  });

  it('does not mark item as new when offeringDates is empty', () => {
    const inventory = [
      { item: "Ki'Teer Syandana", uniqueName: '/Lotus/KiTeerSyandana', credits: 50000, ducats: 200 },
    ];
    // Ki'Teer Syandana has offeringDates: []
    const result = matchInventoryItems(inventory, cachedItems, '2025-06-20T14:00:00.000Z');
    expect(result[0].isNew).toBe(false);
  });

  it('does not mark item as new when no visitDate is provided', () => {
    const inventory = [
      { item: 'Prisma Grinlok', uniqueName: '/Lotus/PrismaGrinlok', credits: 125000, ducats: 500 },
    ];
    const result = matchInventoryItems(inventory, cachedItems);
    expect(result[0].isNew).toBeFalsy();
  });
});
