/**
 * Item-related constants
 */

// Items excluded from market data display
export const MARKET_EXCLUDED_ITEMS = [
  'ignis wraith',
  'primed dissapointment',
];

// Permanent items that appear in Baro's inventory every week
// These items should not display offering dates or "last brought" information
export const PERMANENT_BARO_ITEMS = [
  'void surplus',
  'sands of inaros blueprint',
  'fae path ephemera'
];

// Default values
export const DEFAULT_ITEM_TYPE = 'Unknown';
export const DEFAULT_USERNAME = 'Anonymous';

// Timing constants
export const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour
export const LIKE_THROTTLE_MS = 3000; // 3 seconds
export const REVIEW_COOLDOWN_MS = 3000; // 3 seconds between review submissions
export const WISHLIST_THROTTLE_MS = 2000; // 2 seconds — collapses rapid toggles

// Image URLs
export const WARFRAME_IMAGE_BASE = 'https://wiki.warframe.com/images';
export const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/150';
export const PRIMED_DISAPPOINTMENT_IMAGE = 'https://i.imgur.com/ZYakUku.png';
