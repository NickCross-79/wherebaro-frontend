import { createContext, useContext } from 'react';

/**
 * Context for review/like state on the ItemDetail screen.
 * Eliminates prop-drilling from ItemDetailScreen → ItemReviewsTab → ReviewCard.
 */
const ReviewContext = createContext(null);

export const ReviewProvider = ReviewContext.Provider;

export const useReviewContext = () => {
  const ctx = useContext(ReviewContext);
  if (!ctx) {
    throw new Error('useReviewContext must be used within a ReviewProvider');
  }
  return ctx;
};
