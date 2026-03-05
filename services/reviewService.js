/**
 * Review API service
 */
import { buildUrl, apiFetch, apiPost } from './apiConfig';

const ENDPOINTS = {
  GET_REVIEWS: buildUrl('getReviews'),
  POST_REVIEW: buildUrl('postReview'),
  UPDATE_REVIEW: buildUrl('updateReview'),
  DELETE_REVIEW: buildUrl('deleteReview'),
  REPORT_REVIEW: buildUrl('reportReview'),
};

// In-memory cache: { [itemId]: { data, timestamp } }
const reviewsCache = new Map();
const REVIEWS_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

/**
 * Invalidate the reviews cache for a specific item.
 * Call after posting, updating, or deleting a review.
 */
export const invalidateReviewsCache = (itemId) => {
  reviewsCache.delete(itemId);
};

/**
 * Fetch reviews for an item.
 * Results are cached in memory for 2 minutes.
 * @param {string} itemId - Item ID
 * @returns {Promise<Array>} Array of reviews
 */
export const fetchReviews = async (itemId) => {
  const cached = reviewsCache.get(itemId);
  if (cached && Date.now() - cached.timestamp < REVIEWS_CACHE_TTL) {
    return cached.data;
  }
  const data = await apiFetch(`${ENDPOINTS.GET_REVIEWS}?item_id=${itemId}`);
  reviewsCache.set(itemId, { data, timestamp: Date.now() });
  return data;
};

/**
 * Post a new review
 * @param {Object} reviewData - Review data {item_id, uid, content, date, time, user}
 * @returns {Promise<Object>} Created review
 */
export const postReview = async (reviewData) => {
  // Convert item_id to item_oid for backend
  const payload = { ...reviewData };
  if (payload.item_id && !payload.item_oid) {
    payload.item_oid = payload.item_id;
    delete payload.item_id;
  }
  // Invalidate cache for this item
  const cacheKey = reviewData.item_id || reviewData.item_oid;
  if (cacheKey) invalidateReviewsCache(cacheKey);
  return apiPost(ENDPOINTS.POST_REVIEW, payload);
};

/**
 * Update an existing review
 * @param {Object} reviewData - Review data {review_id, uid, content, date, time}
 * @returns {Promise<Object>} Updated review
 */
export const updateReview = async (reviewData) => {
  return apiPost(ENDPOINTS.UPDATE_REVIEW, reviewData);
};

/**
 * Delete a review
 * @param {string} reviewId - Review ID
 * @param {string} uid - User ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteReview = async (reviewId, uid) => {
  return apiPost(ENDPOINTS.DELETE_REVIEW, { review_id: reviewId, uid });
};

/**
 * Report a review
 * @param {string} reviewId - Review ID
 * @returns {Promise<Object>} Report result
 */
export const reportReview = async (reviewId) => {
  return apiPost(ENDPOINTS.REPORT_REVIEW, { review_id: reviewId });
};
