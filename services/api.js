/**
 * Main API index - exports all API services
 * This file serves as a convenient single import point
 */

// Re-export all services
export * from './itemService';
export * from './reviewService';
export * from './likeService';

// For backward compatibility, also export as default
import itemService from './itemService';
import reviewService from './reviewService';
import likeService from './likeService';

export default {
  ...itemService,
  ...reviewService,
  ...likeService,
};
