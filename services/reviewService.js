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

/**
 * Fetch reviews for an item
 * @param {string} itemId - Item ID
 * @returns {Promise<Array>} Array of reviews
 */
export const fetchReviews = async (itemId) => {
  return apiFetch(`${ENDPOINTS.GET_REVIEWS}?item_id=${itemId}`);
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

export default {
  fetchReviews,
  postReview,
  updateReview,
  deleteReview,
  reportReview,
};
