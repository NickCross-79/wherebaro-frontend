import React from 'react';
import { Linking } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ReviewCard from '../../components/items/ReviewCard';
import { ReviewProvider } from '../../contexts/ReviewContext';

describe('ReviewCard', () => {
  const mockStyles = {
    reviewCard: {},
    ownReviewCard: {},
    reviewHeader: {},
    reviewerInfo: {},
    reviewerName: {},
    reviewDate: {},
    reviewText: {},
    reviewLinkText: {},
    readMoreText: {},
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

  const defaultReview = {
    _id: 'review-1',
    user: 'TestUser',
    content: 'This item is great!',
    date: '2025-01-15',
    uid: 'user-abc',
  };

  const defaultContext = {
    CURRENT_UID: 'user-other',
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

  const renderCard = (review = defaultReview, ctx = {}) =>
    render(
      <ReviewProvider value={{ ...defaultContext, ...ctx }}>
        <ReviewCard review={review} index={0} />
      </ReviewProvider>
    );

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders reviewer name and content', () => {
    renderCard();
    expect(screen.getByText('TestUser')).toBeTruthy();
    expect(screen.getByText('This item is great!')).toBeTruthy();
  });

  it('renders the relative time', () => {
    renderCard();
    expect(screen.getByText('3 weeks ago')).toBeTruthy();
    expect(defaultContext.getRelativeTime).toHaveBeenCalledWith('2025-01-15');
  });

  it('does not show edit/delete actions for other users reviews', () => {
    renderCard();
    expect(defaultContext.startEditingReview).not.toHaveBeenCalled();
  });

  it('shows edit/delete actions for own review', () => {
    renderCard(defaultReview, { CURRENT_UID: 'user-abc' });
    expect(screen.getByText('This item is great!')).toBeTruthy();
  });

  it('shows edit form when editing own review', () => {
    renderCard(defaultReview, {
      CURRENT_UID: 'user-abc',
      editingReviewKey: 'review-1',
      editingReviewText: 'Updated content',
    });
    expect(screen.getByText('Save')).toBeTruthy();
    expect(screen.getByText('Cancel')).toBeTruthy();
  });

  it('calls cancelEditingReview when Cancel is pressed', () => {
    renderCard(defaultReview, {
      CURRENT_UID: 'user-abc',
      editingReviewKey: 'review-1',
      editingReviewText: 'Updated content',
    });
    fireEvent.press(screen.getByText('Cancel'));
    expect(defaultContext.cancelEditingReview).toHaveBeenCalled();
  });

  it('calls saveEditingReview when Save is pressed', () => {
    renderCard(defaultReview, {
      CURRENT_UID: 'user-abc',
      editingReviewKey: 'review-1',
      editingReviewText: 'Updated content',
    });
    fireEvent.press(screen.getByText('Save'));
    expect(defaultContext.saveEditingReview).toHaveBeenCalledWith(0);
  });

  it('renders a URL in content as a pressable link that opens via Linking', () => {
    const spy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    renderCard({ ...defaultReview, content: 'Check https://example.com/page for info' });
    fireEvent.press(screen.getByText('https://example.com/page'));
    expect(spy).toHaveBeenCalledWith('https://example.com/page');
  });

  it('prefixes https:// for bare domains', () => {
    const spy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    renderCard({ ...defaultReview, content: 'prices on warframe.market today' });
    fireEvent.press(screen.getByText('warframe.market'));
    expect(spy).toHaveBeenCalledWith('https://warframe.market');
  });

  it('renders backend-escaped URLs correctly', () => {
    renderCard({ ...defaultReview, content: 'see https:&#x2F;&#x2F;example.com' });
    expect(screen.getByText('https://example.com')).toBeTruthy();
  });
});
