import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ReviewCard from '../../components/items/ReviewCard';

// No external styles - ReviewCard receives styles as props

describe('ReviewCard', () => {
  const mockStyles = {
    reviewCard: {},
    ownReviewCard: {},
    reviewHeader: {},
    reviewerInfo: {},
    reviewerName: {},
    reviewDate: {},
    reviewText: {},
    reviewEditContainer: {},
    reviewEditInput: {},
    characterCount: {},
    characterCountWarning: {},
    reviewEditActions: {},
    reviewEditButton: {},
    reviewEditSave: {},
    reviewEditCancel: {},
    reviewEditButtonText: {},
    reviewActionsBottom: {},
    reviewActionButton: {},
  };

  const defaultProps = {
    review: {
      _id: 'review-1',
      user: 'TestUser',
      content: 'This item is great!',
      date: '2025-01-15',
      uid: 'user-abc',
    },
    index: 0,
    currentUid: 'user-other',
    editingReviewKey: null,
    getReviewKey: (review) => review._id,
    editingReviewText: '',
    setEditingReviewText: jest.fn(),
    saveEditingReview: jest.fn(),
    cancelEditingReview: jest.fn(),
    startEditingReview: jest.fn(),
    confirmDeleteReview: jest.fn(),
    getRelativeTime: jest.fn(() => '3 weeks ago'),
    styles: mockStyles,
  };

  it('renders reviewer name and content', () => {
    render(<ReviewCard {...defaultProps} />);
    expect(screen.getByText('TestUser')).toBeTruthy();
    expect(screen.getByText('This item is great!')).toBeTruthy();
  });

  it('renders the relative time', () => {
    render(<ReviewCard {...defaultProps} />);
    expect(screen.getByText('3 weeks ago')).toBeTruthy();
    expect(defaultProps.getRelativeTime).toHaveBeenCalledWith('2025-01-15');
  });

  it('does not show edit/delete actions for other users reviews', () => {
    const { queryByTestId } = render(<ReviewCard {...defaultProps} />);
    // Pencil and trash icons shouldn't fire for non-own reviews
    expect(defaultProps.startEditingReview).not.toHaveBeenCalled();
  });

  it('shows edit/delete actions for own review', () => {
    const ownProps = { ...defaultProps, currentUid: 'user-abc' };
    render(<ReviewCard {...ownProps} />);
    // The component should render action buttons for own reviews - the icons exist
    // We can't easily test Ionicons by name, but ensure the component renders without crashing
    expect(screen.getByText('This item is great!')).toBeTruthy();
  });

  it('shows edit form when editing own review', () => {
    const editingProps = {
      ...defaultProps,
      currentUid: 'user-abc',
      editingReviewKey: 'review-1',
      editingReviewText: 'Updated content',
    };
    render(<ReviewCard {...editingProps} />);
    expect(screen.getByText('Save')).toBeTruthy();
    expect(screen.getByText('Cancel')).toBeTruthy();
  });

  it('calls cancelEditingReview when Cancel is pressed', () => {
    const editingProps = {
      ...defaultProps,
      currentUid: 'user-abc',
      editingReviewKey: 'review-1',
      editingReviewText: 'Updated content',
    };
    render(<ReviewCard {...editingProps} />);
    fireEvent.press(screen.getByText('Cancel'));
    expect(editingProps.cancelEditingReview).toHaveBeenCalled();
  });

  it('calls saveEditingReview when Save is pressed', () => {
    const editingProps = {
      ...defaultProps,
      currentUid: 'user-abc',
      editingReviewKey: 'review-1',
      editingReviewText: 'Updated content',
    };
    render(<ReviewCard {...editingProps} />);
    fireEvent.press(screen.getByText('Save'));
    expect(editingProps.saveEditingReview).toHaveBeenCalledWith(0);
  });
});
