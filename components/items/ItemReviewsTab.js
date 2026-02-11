import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ReviewCard from './ReviewCard';

export default function ItemReviewsTab({
  bottomSpacer,
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
  CURRENT_UID,
  getRelativeTime,
  editingReviewKey,
  getReviewKey,
  editingReviewText,
  setEditingReviewText,
  saveEditingReview,
  cancelEditingReview,
  startEditingReview,
  confirmDeleteReview,
  onReportReview,
  reportedReviewKeys = [],
  styles,
}) {
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
          <Ionicons name="hourglass-outline" size={48} color="#D4A574" />
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
            >
              <Ionicons
                name={userLiked ? 'thumbs-up' : 'thumbs-up-outline'}
                size={24}
                color={userLiked ? '#D4A574' : '#8B9DC3'}
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
                placeholderTextColor="#5A6B8C"
                multiline
                numberOfLines={4}
                value={newReview}
                onChangeText={setNewReview}
                textAlignVertical="top"
                maxLength={250}
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
              >
                <Text style={styles.postButtonText}>Post Review</Text>
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
                <Ionicons name="chatbubbles-outline" size={48} color="#5A6B8C" />
                <Text style={styles.emptyReviewsText}>No reviews yet</Text>
                <Text style={styles.emptyReviewsSubtext}>Be the first to review this item!</Text>
              </View>
            ) : (
              visibleReviews.map((review, index) => (
                <ReviewCard
                  key={getReviewKey(review, index)}
                  review={review}
                  index={index}
                  currentUid={CURRENT_UID}
                  editingReviewKey={editingReviewKey}
                  getReviewKey={getReviewKey}
                  editingReviewText={editingReviewText}
                  setEditingReviewText={setEditingReviewText}
                  saveEditingReview={saveEditingReview}
                  cancelEditingReview={cancelEditingReview}
                  startEditingReview={startEditingReview}
                  confirmDeleteReview={confirmDeleteReview}
                  getRelativeTime={getRelativeTime}
                  onReportReview={onReportReview}
                  styles={styles}
                />
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}
