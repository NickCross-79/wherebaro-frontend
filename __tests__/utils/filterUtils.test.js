import {
  filterBySearch,
  filterByCategories,
  sortByPopularity,
  applyAllFilters,
} from '../../utils/filterUtils';

const mockItems = [
  { name: 'Primed Flow', type: 'Primed Mod', likes: 10, reviews: [1, 2, 3] },
  { name: 'Primed Continuity', type: 'Primed Mod', likes: 5, reviews: [1] },
  { name: 'Prisma Grinlok', type: 'Prisma Primary', likes: 8, reviews: [] },
  { name: 'Ki\'Teer Syandana', type: 'Cosmetic Syandana', likes: 2, reviews: [1, 2] },
  { name: 'Sands of Inaros', type: 'Quest Blueprint', likes: 15, reviews: [1, 2, 3, 4] },
  { name: 'Ki\'Teer Weapon Skin', type: 'Cosmetic (weapon)', likes: 3, reviews: [] },
  { name: 'Ship Display', type: 'Ship Decoration', likes: 4, reviews: [] },
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

  it('sorts by least popular (lowest likes first)', () => {
    const result = sortByPopularity(mockItems, 'unpopular');
    expect(result[0].name).toBe('Ki\'Teer Syandana');
  });

  it('sorts by most reviews', () => {
    const result = sortByPopularity(mockItems, 'most-reviews');
    expect(result[0].name).toBe('Sands of Inaros');
    expect(result[0].reviews).toHaveLength(4);
  });

  it('sorts by least reviews', () => {
    const result = sortByPopularity(mockItems, 'least-reviews');
    // Two items have 0 reviews, so check first item has 0 reviews
    expect(result[0].reviews).toHaveLength(0);
  });

  it('returns same order for unknown sort type', () => {
    const result = sortByPopularity(mockItems, 'all');
    expect(result.map(i => i.name)).toEqual(mockItems.map(i => i.name));
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
