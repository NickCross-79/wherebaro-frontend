/**
 * Filters items by search query
 * @param {Array} items - Items to filter
 * @param {string} searchQuery - Search query string
 * @returns {Array} Filtered items
 */
export const filterBySearch = (items, searchQuery) => {
  if (!searchQuery) return items;
  return items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
};

/**
 * Filters items by category - matches any word in type except parenthetical descriptors
 * @param {Array} items - Items to filter
 * @param {Array} categories - Category filters
 * @returns {Array} Filtered items
 */
export const filterByCategories = (items, categories) => {
  if (!categories || categories.length === 0) return items;
  
  return items.filter(item => {
    const itemType = item.type.toLowerCase();
    // Remove parenthetical content (e.g., "Cosmetic (weapon)" -> "Cosmetic")
    const typeWithoutParens = itemType.replace(/\s*\([^)]*\)/g, '').trim();
    const typeWords = typeWithoutParens.split(/\s+/);
    
    return categories.some(category => {
      const categoryLower = category.toLowerCase();
      // Match if category matches exact type or any word in the type (excluding parenthetical content)
      return typeWithoutParens === categoryLower || typeWords.includes(categoryLower);
    });
  });
};

/**
 * Gets the most recent date from an item's offeringDates array
 * @param {Object} item - Item with offeringDates array
 * @returns {Date|null} Most recent date or null if no dates
 */
const getMostRecentOfferingDate = (item) => {
  if (!item.offeringDates || !Array.isArray(item.offeringDates) || item.offeringDates.length === 0) {
    return null;
  }
  
  const dates = item.offeringDates
    .map(dateStr => new Date(dateStr))
    .filter(date => !isNaN(date.getTime()));
  
  if (dates.length === 0) return null;
  
  return new Date(Math.max(...dates.map(d => d.getTime())));
};

/**
 * Sorts items by popularity, reviews, wishlists, or last brought date
 * @param {Array} items - Items to sort
 * @param {string} sortType - Sort type: 'all', 'popular', 'unpopular', 'most-reviews', 'least-reviews', 'most-wishlisted', 'least-wishlisted', 'last-brought'
 * @returns {Array} Sorted items
 */
export const sortByPopularity = (items, sortType) => {
  const sorted = [...items];
  
  if (sortType === 'popular') {
    sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } else if (sortType === 'unpopular') {
    sorted.sort((a, b) => (a.likes || 0) - (b.likes || 0));
  } else if (sortType === 'most-reviews') {
    sorted.sort((a, b) => ((b.reviews || []).length) - ((a.reviews || []).length));
  } else if (sortType === 'least-reviews') {
    sorted.sort((a, b) => ((a.reviews || []).length) - ((b.reviews || []).length));
  } else if (sortType === 'most-wishlisted') {
    sorted.sort((a, b) => (b.wishlistCount || 0) - (a.wishlistCount || 0));
  } else if (sortType === 'least-wishlisted') {
    sorted.sort((a, b) => (a.wishlistCount || 0) - (b.wishlistCount || 0));
  } else if (sortType === 'last-brought') {
    sorted.sort((a, b) => {
      const dateA = getMostRecentOfferingDate(a);
      const dateB = getMostRecentOfferingDate(b);
      
      // Items without dates go to the end
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      
      // Most recent first (descending order)
      return dateB.getTime() - dateA.getTime();
    });
  }
  
  return sorted;
};

/**
 * Applies all filters and sorting to items
 * @param {Array} items - Items to filter
 * @param {string} searchQuery - Search query
 * @param {Object} filters - Filter object { categories: [], popularity: 'all' }
 * @returns {Array} Filtered and sorted items
 */
export const applyAllFilters = (items, searchQuery, filters) => {
  let filtered = filterBySearch(items, searchQuery);
  filtered = filterByCategories(filtered, filters.categories);
  return sortByPopularity(filtered, filters.popularity);
};
