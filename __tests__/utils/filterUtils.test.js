import {
  filterBySearch,
  filterByCategories,
  sortByPopularity,
  applyAllFilters,
} from '../../utils/filterUtils';

const mockItems = [
  { name: 'Primed Flow', type: 'Primed Mod', likes: 10, reviews: [1, 2, 3], wishlistCount: 25, offeringDates: ['2024-01-15', '2024-06-20'], isNew: false },
  { name: 'Primed Continuity', type: 'Primed Mod', likes: 5, reviews: [1], wishlistCount: 30, offeringDates: ['2023-12-10', '2024-08-05'], isNew: false },
  { name: 'Prisma Grinlok', type: 'Prisma Primary', likes: 8, reviews: [], wishlistCount: 10, offeringDates: ['2024-03-15'], isNew: true },
  { name: 'Ki\'Teer Syandana', type: 'Cosmetic Syandana', likes: 2, reviews: [1, 2], wishlistCount: 5, offeringDates: [], isNew: false },
  { name: 'Sands of Inaros', type: 'Quest Blueprint', likes: 15, reviews: [1, 2, 3, 4], wishlistCount: 50, offeringDates: ['2024-09-01', '2024-10-15'], isNew: false },
  { name: 'Ki\'Teer Weapon Skin', type: 'Cosmetic (weapon)', likes: 3, reviews: [], wishlistCount: 0, isNew: false },
  { name: 'Ship Display', type: 'Ship Decoration', likes: 4, reviews: [], wishlistCount: 2, offeringDates: ['2024-02-20', '2024-07-10'], isNew: false },
];

describe('filterBySearch', () => {
  it('returns all items when query is empty', () => {
    expect(filterBySearch(mockItems, '')).toEqual(mockItems);
    expect(filterBySearch(mockItems, null)).toEqual(mockItems);
    expect(filterBySearch(mockItems, undefined)).toEqual(mockItems);
  });

  it('filters case-insensitively by name', () => {
    const result = filterBySearch(mockItems, 'primed');
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Primed Flow');
    expect(result[1].name).toBe('Primed Continuity');
  });

  it('filters partial matches', () => {
    const result = filterBySearch(mockItems, 'grin');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Prisma Grinlok');
  });

  it('returns empty array when no matches', () => {
    expect(filterBySearch(mockItems, 'nonexistent')).toEqual([]);
  });
});

describe('filterByCategories', () => {
  it('returns all items when categories is empty or null', () => {
    expect(filterByCategories(mockItems, [])).toEqual(mockItems);
    expect(filterByCategories(mockItems, null)).toEqual(mockItems);
    expect(filterByCategories(mockItems, undefined)).toEqual(mockItems);
  });

  it('filters by first word of type', () => {
    const result = filterByCategories(mockItems, ['Primed']);
    expect(result).toHaveLength(2);
  });

  it('filters by full type match', () => {
    const result = filterByCategories(mockItems, ['Primed Mod']);
    expect(result).toHaveLength(2);
  });

  it('matches first word against category (e.g. "Prisma" matches "Prisma Primary")', () => {
    const result = filterByCategories(mockItems, ['Prisma']);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Prisma Grinlok');
  });

  it('supports multiple categories', () => {
    const result = filterByCategories(mockItems, ['Primed', 'Quest']);
    expect(result).toHaveLength(3); // 2 Primed + 1 Quest
  });

  it('does not match parenthetical descriptors (e.g. "Weapon" should not match "Cosmetic (weapon)")', () => {
    const result = filterByCategories(mockItems, ['Weapon']);
    expect(result).toHaveLength(0); // Should not match 'Cosmetic (weapon)'
  });

  it('matches cosmetic category correctly', () => {
    const result = filterByCategories(mockItems, ['Cosmetic']);
    expect(result).toHaveLength(2); // 'Cosmetic Syandana' + 'Cosmetic (weapon)'
  });

  it('matches multi-word types like "Ship Decoration" when filtering for "Decoration"', () => {
    const result = filterByCategories(mockItems, ['Decoration']);
    expect(result).toHaveLength(1); // 'Ship Decoration'
    expect(result[0].name).toBe('Ship Display');
  });
});

describe('sortByPopularity', () => {
  it('sorts by most popular (highest likes first)', () => {
    const result = sortByPopularity(mockItems, 'popular');
    expect(result[0].name).toBe('Sands of Inaros');
    expect(result[1].name).toBe('Primed Flow');
  });

  it('sorts by most reviews, then alphabetically on ties', () => {
    const result = sortByPopularity(mockItems, 'most-reviews');
    expect(result[0].name).toBe('Sands of Inaros');       // 4 reviews
    expect(result[0].reviews).toHaveLength(4);
    // 0-review items sorted alphabetically
    const zeroReviewNames = result.filter(i => (i.reviews || []).length === 0).map(i => i.name);
    expect(zeroReviewNames).toEqual(['Ki\'Teer Weapon Skin', 'Prisma Grinlok', 'Ship Display']);
  });

  it('sorts new items first, then alphabetically by default (sortType "all")', () => {
    const result = sortByPopularity(mockItems, 'all');
    const names = result.map(i => i.name);
    expect(names).toEqual([
      'Prisma Grinlok',       // new (1 offering date) — first
      'Ki\'Teer Syandana',    // then alphabetical
      'Ki\'Teer Weapon Skin',
      'Primed Continuity',
      'Primed Flow',
      'Sands of Inaros',
      'Ship Display',
    ]);
  });

  it('sorts by most wishlisted', () => {
    const result = sortByPopularity(mockItems, 'most-wishlisted');
    expect(result[0].name).toBe('Sands of Inaros');
    expect(result[0].wishlistCount).toBe(50);
  });

  it('sorts by last brought (most recent date first)', () => {
    const result = sortByPopularity(mockItems, 'last-brought');
    // Sands of Inaros has 2024-10-15 (most recent)
    expect(result[0].name).toBe('Sands of Inaros');
    // Primed Continuity has 2024-08-05
    expect(result[1].name).toBe('Primed Continuity');
    // Ship Display has 2024-07-10
    expect(result[2].name).toBe('Ship Display');
  });

  it('sorts last brought with items without dates alphabetically at end', () => {
    const result = sortByPopularity(mockItems, 'last-brought');
    const lastTwo = result.slice(-2).map(i => i.name);
    // Both have no dates — alphabetical tiebreaker
    expect(lastTwo).toEqual(['Ki\'Teer Syandana', 'Ki\'Teer Weapon Skin']);
  });

  it('does not mutate the original array', () => {
    const copy = [...mockItems];
    sortByPopularity(mockItems, 'popular');
    expect(mockItems).toEqual(copy);
  });
});

describe('applyAllFilters', () => {
  it('combines search + category + sort', () => {
    const result = applyAllFilters(mockItems, 'primed', {
      categories: ['Primed'],
      popularity: 'popular',
    });
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Primed Flow'); // higher likes
    expect(result[1].name).toBe('Primed Continuity');
  });

  it('applies search only when no category/sort filters', () => {
    const result = applyAllFilters(mockItems, 'sands', {
      categories: [],
      popularity: 'all',
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Sands of Inaros');
  });

  it('returns all items with no filters applied', () => {
    const result = applyAllFilters(mockItems, '', {
      categories: [],
      popularity: 'all',
    });
    expect(result).toHaveLength(7);
  });
});
