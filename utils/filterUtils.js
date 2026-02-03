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
 * Filters items by category - matches first word of item type or full category
 * @param {Array} items - Items to filter
 * @param {Array} categories - Category filters
 * @returns {Array} Filtered items
 */
export const filterByCategories = (items, categories) => {
  if (!categories || categories.length === 0) return items;
  
  return items.filter(item => {
    const itemType = item.type.toLowerCase();
    const firstWord = itemType.split(/\s+/)[0];
    
    return categories.some(category => {
      const categoryLower = category.toLowerCase();
      // Match either the full type or just the first word
      return itemType === categoryLower || firstWord === categoryLower;
    });
  });
};

/**
 * Sorts items by popularity
 * @param {Array} items - Items to sort
 * @param {string} sortType - Sort type: 'all', 'popular', 'unpopular', 'most-reviews', 'least-reviews'
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
