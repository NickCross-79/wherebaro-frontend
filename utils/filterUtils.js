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
  const last = new Date(item.offeringDates[item.offeringDates.length - 1]);
  return isNaN(last.getTime()) ? null : last;
};

/**
 * Sorts items by popularity, reviews, wishlists, or last brought date
 * @param {Array} items - Items to sort
 * @param {string} sortType - Sort type
 * @param {Function} [isInWishlist] - Optional function (item) => bool for wishlist-aware default sort
 * @returns {Array} Sorted items
 */
export const sortByPopularity = (items, sortType, isInWishlist, sortDir = 'desc') => {
  const sorted = [...items];
  const dir = sortDir === 'asc' ? -1 : 1;

  const alpha = (a, b) => (a.name || '').localeCompare(b.name || '');

  if (sortType === 'popular') {
    sorted.sort((a, b) => dir * ((b.likes || 0) - (a.likes || 0)) || alpha(a, b));
  } else if (sortType === 'unpopular') {
    sorted.sort((a, b) => (a.likes || 0) - (b.likes || 0) || alpha(a, b));
  } else if (sortType === 'most-reviews') {
    sorted.sort((a, b) => dir * (((b.reviews || []).length) - ((a.reviews || []).length)) || alpha(a, b));
  } else if (sortType === 'least-reviews') {
    sorted.sort((a, b) => ((a.reviews || []).length) - ((b.reviews || []).length) || alpha(a, b));
  } else if (sortType === 'most-wishlisted') {
    sorted.sort((a, b) => dir * ((b.wishlistCount || 0) - (a.wishlistCount || 0)) || alpha(a, b));
  } else if (sortType === 'least-wishlisted') {
    sorted.sort((a, b) => (a.wishlistCount || 0) - (b.wishlistCount || 0) || alpha(a, b));
  } else if (sortType === 'last-brought') {
    sorted.sort((a, b) => {
      const dateA = getMostRecentOfferingDate(a);
      const dateB = getMostRecentOfferingDate(b);
      if (!dateA && !dateB) return alpha(a, b);
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dir * (dateB.getTime() - dateA.getTime()) || alpha(a, b);
    });
  } else if (sortType === 'credits') {
    sorted.sort((a, b) => dir * ((b.creditPrice ?? 0) - (a.creditPrice ?? 0)) || alpha(a, b));
  } else if (sortType === 'ducats') {
    sorted.sort((a, b) => dir * ((b.ducatPrice ?? 0) - (a.ducatPrice ?? 0)) || alpha(a, b));
  } else if (sortType === 'buy-votes') {
    sorted.sort((a, b) => {
      const aBuy = a.buy?.length ?? 0;
      const bBuy = b.buy?.length ?? 0;
      const aSkip = a.skip?.length ?? 0;
      const bSkip = b.skip?.length ?? 0;
      // Items where buy wins come before items where skip wins
      const aWins = aBuy >= aSkip ? 1 : 0;
      const bWins = bBuy >= bSkip ? 1 : 0;
      return (bWins - aWins) || (bBuy - aBuy) || alpha(a, b);
    });
  } else if (sortType === 'skip-votes') {
    sorted.sort((a, b) => {
      const aBuy = a.buy?.length ?? 0;
      const bBuy = b.buy?.length ?? 0;
      const aSkip = a.skip?.length ?? 0;
      const bSkip = b.skip?.length ?? 0;
      // Items where skip wins come before items where buy wins (ties go to buy, so excluded here)
      const aWins = aSkip > aBuy ? 1 : 0;
      const bWins = bSkip > bBuy ? 1 : 0;
      return (bWins - aWins) || (bSkip - aSkip) || alpha(a, b);
    });
  } else {
    // Default: new items first, then wishlisted alphabetically, then remaining alphabetically
    sorted.sort((a, b) => {
      const aNew = !!a.isNew;
      const bNew = !!b.isNew;
      const aWish = isInWishlist ? !!isInWishlist(a.id || a._id) : false;
      const bWish = isInWishlist ? !!isInWishlist(b.id || b._id) : false;
      if (aNew !== bNew) return aNew ? -1 : 1;
      if (!aNew && !bNew && aWish !== bWish) return aWish ? -1 : 1;
      return (a.name || '').localeCompare(b.name || '');
    });
  }
  
  return sorted;
};

/**
 * Applies all filters and sorting to items
 * @param {Array} items - Items to filter
 * @param {string} searchQuery - Search query
 * @param {Object} filters - Filter object { categories: [], popularity: 'all' }
 * @param {Function} [isInWishlist] - Optional function (id) => bool for wishlist-aware default sort
 * @returns {Array} Filtered and sorted items
 */
export const applyAllFilters = (items, searchQuery, filters, isInWishlist) => {
  let filtered = filterBySearch(items, searchQuery);
  filtered = filterByCategories(filtered, filters.categories);
  return sortByPopularity(filtered, filters.popularity, isInWishlist, filters.sortDir ?? 'desc');
};
