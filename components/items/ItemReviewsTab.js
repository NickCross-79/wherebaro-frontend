import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ReviewCard from './ReviewCard';
import { useReviewContext } from '../../contexts/ReviewContext';
import { colors } from '../../constants/theme';

export default function ItemReviewsTab({ bottomSpacer }) {
  const {
    isLoadingReviews,
    likeCount,
    userLiked,
    isLiking,
    handleLike,
    hasUserReview,
    newReview,
    setNewReview,
    isPostingReview,
    handlePostReview,
    reviews,
    getReviewKey,
    reportedReviewKeys,
    styles,
  } = useReviewContext();

  const visibleReviews = reviews.filter((review, index) => {
    const key = getReviewKey(review, index);
    return !reportedReviewKeys.includes(key);
  });
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={{ paddingBottom: bottomSpacer }}
      showsVerticalScrollIndicator={false}
    >
      {isLoadingReviews ? (
        <View style={styles.loadingReviews}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingReviewsText}>Loading reviews and likes...</Text>
        </View>
      ) : (
        <>
          {/* Like Button - At top of Reviews Tab */}
          <View style={styles.likeSection}>
            <TouchableOpacity
              style={[styles.likeButton, userLiked && styles.likeButtonActive, isLiking && styles.likeButtonLoading]}
              onPress={handleLike}
              disabled={isLiking}
              accessibilityRole="button"
              accessibilityLabel={`${userLiked ? 'Unlike' : 'Like'} this item, ${likeCount} likes`}
              accessibilityState={{ selected: userLiked, disabled: isLiking }}
            >
              <Ionicons
                name={userLiked ? 'thumbs-up' : 'thumbs-up-outline'}
                size={24}
                color={userLiked ? colors.accent : colors.textSecondary}
              />
              <Text style={[styles.likeText, userLiked && styles.likeTextActive]}>
                {likeCount} Likes
              </Text>
            </TouchableOpacity>
          </View>

          {/* Post Review Section */}
          {!hasUserReview && (
            <View style={styles.postReviewSection}>
              <Text style={styles.sectionTitle}>Write a Review</Text>
              <TextInput
                style={styles.reviewInput}
                placeholder="Share your thoughts about this item..."
                placeholderTextColor={colors.textDim}
                multiline
                numberOfLines={4}
                value={newReview}
                onChangeText={(text) => setNewReview(text.replace(/[\n\r]/g, ''))}
                textAlignVertical="top"
                maxLength={250}
                accessibilityLabel="Write a review"
              />
              {(250 - newReview.length) <= 50 && (
                <Text style={[styles.characterCount, (250 - newReview.length) <= 10 && styles.characterCountWarning]}>
                  {250 - newReview.length}
                </Text>
              )}
              <TouchableOpacity
                style={[
                  styles.postButton,
                  (!newReview.trim() || isPostingReview) && styles.postButtonDisabled,
                ]}
                onPress={handlePostReview}
                disabled={!newReview.trim() || isPostingReview}
                accessibilityRole="button"
                accessibilityLabel="Post Review"
                accessibilityState={{ disabled: !newReview.trim() || isPostingReview }}
              >
                <Text style={[styles.postButtonText, (!newReview.trim() || isPostingReview) && styles.postButtonTextDisabled]}>Post Review</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Reviews List */}
          <View style={styles.reviewsListSection}>
            <Text style={styles.sectionTitle}>
              Reviews ({visibleReviews.length})
            </Text>
            {visibleReviews.length === 0 ? (
              <View style={styles.emptyReviews}>
                <Ionicons name="chatbubbles-outline" size={48} color={colors.textDim} />
                <Text style={styles.emptyReviewsText}>No reviews yet</Text>
                <Text style={styles.emptyReviewsSubtext}>Be the first to review this item!</Text>
              </View>
            ) : (
              visibleReviews.map((review, index) => (
                <ReviewCard
                  key={getReviewKey(review, index)}
                  review={review}
                  index={index}
                />
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}
