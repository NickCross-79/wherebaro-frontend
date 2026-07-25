/**
 * Tests for ItemReviewsTab component.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ItemReviewsTab from '../../components/items/ItemReviewsTab';
import { ReviewProvider } from '../../contexts/ReviewContext';

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: function MockIonicons({ name }) {
      return <Text>{name}</Text>;
    },
  };
});
jest.mock('../../components/items/ReviewCard', () => {
  const { Text } = require('react-native');
  return function MockReviewCard({ review }) {
    return <Text testID="review-card">{review.content}</Text>;
  };
});

describe('ItemReviewsTab', () => {
  const mockStyles = {
    content: {},
    loadingReviews: {},
    loadingReviewsText: {},
    likeSection: {},
    likeButton: {},
    likeButtonActive: {},
    likeButtonLoading: {},
    likeText: {},
    likeTextActive: {},
    postReviewSection: {},
    sectionTitle: {},
    reviewInput: {},
    characterCount: {},
    characterCountWarning: {},
    postButton: {},
    postButtonDisabled: {},
    postButtonText: {},
    reviewsListSection: {},
    emptyReviews: {},
    emptyReviewsText: {},
    emptyReviewsSubtext: {},
  };

  // The tab reads its state from ReviewContext; only bottomSpacer is a prop.
  const baseContext = {
    isLoadingReviews: false,
    likeCount: 5,
    userLiked: false,
    isLiking: false,
    handleLike: jest.fn(),
    hasUserReview: false,
    newReview: '',
    setNewReview: jest.fn(),
    isPostingReview: false,
    handlePostReview: jest.fn(),
    reviews: [],
    reportedReviewKeys: [],
    CURRENT_UID: 'user-1',
    getRelativeTime: jest.fn((d) => '2 hours ago'),
    editingReviewKey: null,
    getReviewKey: jest.fn((r, i) => String(i)),
    editingReviewText: '',
    setEditingReviewText: jest.fn(),
    saveEditingReview: jest.fn(),
    cancelEditingReview: jest.fn(),
    startEditingReview: jest.fn(),
    confirmDeleteReview: jest.fn(),
    styles: mockStyles,
  };

  const renderTab = (ctx = {}) =>
    render(
      <ReviewProvider value={{ ...baseContext, ...ctx }}>
        <ItemReviewsTab bottomSpacer={80} />
      </ReviewProvider>
    );

  it('shows loading state', () => {
    const { getByText } = renderTab({ isLoadingReviews: true });
    expect(getByText('Loading reviews and likes...')).toBeTruthy();
  });

  it('shows like count', () => {
    const { getByText } = renderTab();
    expect(getByText('5 Likes')).toBeTruthy();
  });

  it('calls handleLike on like button press', () => {
    const handleLike = jest.fn();
    const { getByText } = renderTab({ handleLike });
    fireEvent.press(getByText('5 Likes'));
    expect(handleLike).toHaveBeenCalled();
  });

  it('shows review input when user has no review', () => {
    const { getByText, getByPlaceholderText } = renderTab({ hasUserReview: false });
    expect(getByText('Write a Review')).toBeTruthy();
    expect(getByPlaceholderText('Share your thoughts about this item...')).toBeTruthy();
  });

  it('hides review input when user already has a review', () => {
    const { queryByText } = renderTab({ hasUserReview: true });
    expect(queryByText('Write a Review')).toBeNull();
  });

  it('shows empty reviews message when no reviews', () => {
    const { getByText } = renderTab({ reviews: [] });
    expect(getByText('No reviews yet')).toBeTruthy();
    expect(getByText('Be the first to review this item!')).toBeTruthy();
  });

  it('renders review cards', () => {
    const reviews = [
      { content: 'Great item!', uid: 'user-2' },
      { content: 'Worth the ducats', uid: 'user-3' },
    ];
    const { getAllByTestId } = renderTab({ reviews });
    expect(getAllByTestId('review-card')).toHaveLength(2);
  });

  it('shows review count in section title', () => {
    const reviews = [{ content: 'Test', uid: 'u1' }];
    const { getByText } = renderTab({ reviews });
    expect(getByText('Reviews (1)')).toBeTruthy();
  });

  it('hides reviews the user has reported', () => {
    const reviews = [
      { content: 'Great item!', uid: 'user-2' },
      { content: 'Spam spam spam', uid: 'user-3' },
    ];
    const { getAllByTestId } = renderTab({ reviews, reportedReviewKeys: ['1'] });
    expect(getAllByTestId('review-card')).toHaveLength(1);
  });
});
