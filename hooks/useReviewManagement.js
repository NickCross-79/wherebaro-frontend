import { useState } from 'react';
import { Alert } from 'react-native';
import { fetchReviews, postReview, updateReview, deleteReview } from '../services/api';
import { getCurrentUsername } from '../utils/userStorage';

export const useReviewManagement = (itemId) => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [isPostingReview, setIsPostingReview] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [editingReviewKey, setEditingReviewKey] = useState(null);
  const [editingReviewText, setEditingReviewText] = useState('');

  const getReviewKey = (review, index) => {
    if (review?._id?.$oid) return review._id.$oid;
    if (review?._id) return String(review._id);
    return String(index);
  };

  const getReviewId = (review) => {
    if (review?._id?.$oid) return review._id.$oid;
    if (review?._id) return String(review._id);
    return null;
  };

  const fetchReviewsAndLikes = async (currentUid, syncLikeCount, initialLikesLength) => {
    try {
      setIsLoadingReviews(true);
      
      const [reviewsResult] = await Promise.all([
        fetchReviews(itemId),
      ]);

      const fetchedReviews = reviewsResult.reviews || [];

      fetchedReviews.sort((a, b) => {
        if (a?.uid === currentUid && b?.uid !== currentUid) return -1;
        if (b?.uid === currentUid && a?.uid !== currentUid) return 1;
        return 0;
      });

      setReviews(fetchedReviews);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
      setReviews([]);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handlePostReview = async (currentUid, item_oid) => {
    const reviewText = newReview.trim();
    if (!reviewText) return;

    if (!currentUid) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      setIsPostingReview(true);
      const username = await getCurrentUsername();
      
      const payload = {
        item_id: String(itemId),
        user: username,
        content: reviewText,
        date: new Date().toISOString().slice(0, 10),
        time: new Date().toTimeString().slice(0, 8),
        uid: currentUid,
      };

      const result = await postReview(payload);
      const postedReview = result?.review || {
        _id: Date.now().toString(),
        user: username,
        content: reviewText,
        date: payload.date,
        time: payload.time,
        uid: currentUid,
      };
      setReviews((prev) => [postedReview, ...prev]);
      setNewReview('');
    } catch (error) {
      console.error('Failed to post review', error);
      Alert.alert('Error', 'Failed to post review. Please try again.');
    } finally {
      setIsPostingReview(false);
    }
  };

  const startEditingReview = (review, index) => {
    const key = getReviewKey(review, index);
    setEditingReviewKey(key);
    setEditingReviewText(review?.content || '');
  };

  const cancelEditingReview = () => {
    setEditingReviewKey(null);
    setEditingReviewText('');
  };

  const saveEditingReview = async (index) => {
    const updatedText = editingReviewText.trim();
    if (!updatedText) return;

    const reviewToUpdate = reviews[index];
    const reviewId = getReviewId(reviewToUpdate);

    if (reviewId) {
      try {
        const payload = {
          review_id: reviewId,
          uid: 'current_uid',
          content: updatedText,
          date: new Date().toISOString().slice(0, 10),
          time: new Date().toTimeString().slice(0, 8),
        };

        const result = await updateReview(payload);
        const updatedReview = result?.review;

        setReviews((prev) =>
          prev.map((review, i) =>
            i === index ? { ...review, ...updatedReview } : review
          )
        );
      } catch (error) {
        console.error('Failed to update review', error);
        Alert.alert('Error', 'Failed to update review. Please try again.');
        return;
      }
    } else {
      setReviews((prev) =>
        prev.map((review, i) =>
          i === index ? { ...review, content: updatedText } : review
        )
      );
    }

    setEditingReviewKey(null);
    setEditingReviewText('');
  };

  const confirmDeleteReview = (review, index) => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete your review? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const reviewId = getReviewId(review);

            if (!reviewId) {
              console.error('Review ID missing');
              return;
            }

            try {
              await deleteReview(reviewId, 'current_uid');
              setReviews((prev) => prev.filter((_, i) => i !== index));
            } catch (error) {
              console.error('Failed to delete review', error);
              Alert.alert('Error', 'Failed to delete review. Please try again.');
            }
          },
        },
      ]
    );
  };

  const hasUserReview = (currentUid) => {
    return reviews.some((review) => review?.uid === currentUid);
  };

  return {
    reviews,
    setReviews,
    newReview,
    setNewReview,
    isPostingReview,
    isLoadingReviews,
    editingReviewKey,
    editingReviewText,
    setEditingReviewText,
    getReviewKey,
    getReviewId,
    fetchReviewsAndLikes,
    handlePostReview,
    startEditingReview,
    cancelEditingReview,
    saveEditingReview,
    confirmDeleteReview,
    hasUserReview,
  };
};
