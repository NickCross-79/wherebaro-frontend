import React, { memo } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { decodeHtmlEntities } from '../../utils/htmlDecode';
import { useReviewContext } from '../../contexts/ReviewContext';
import { colors } from '../../constants/theme';

function ReviewCard({ review, index }) {
  const {
    CURRENT_UID: currentUid,
    editingReviewKey,
    getReviewKey,
    editingReviewText,
    setEditingReviewText,
    saveEditingReview,
    cancelEditingReview,
    startEditingReview,
    confirmDeleteReview,
    getRelativeTime,
    onReportReview,
    styles,
  } = useReviewContext();

  const isOwnReview = review?.uid === currentUid;
  const isEditing = isOwnReview && editingReviewKey === getReviewKey(review, index);

  return (
    <View
      style={[
        styles.reviewCard,
        isOwnReview && styles.ownReviewCard,
      ]}
    >
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <Ionicons name="person-circle" size={32} color={colors.accent} />
          <Text style={styles.reviewerName}>{review.user}</Text>
        </View>
        <View style={styles.reviewHeaderRight}>
          <Text style={styles.reviewDate}>{getRelativeTime(review.date)}</Text>
          {!isOwnReview && onReportReview && (
            <TouchableOpacity
              style={styles.reportButton}
              onPress={() => onReportReview(review, index)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={`Report review by ${review.user}`}
            >
              <Ionicons name="flag" size={16} color={colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Text style={styles.reviewText}>{decodeHtmlEntities(review.content)}</Text>

      {isEditing && (
        <View style={styles.reviewEditContainer}>
          <TextInput
            style={styles.reviewEditInput}
            value={editingReviewText}
            onChangeText={setEditingReviewText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={250}
          />
          {(250 - editingReviewText.length) <= 50 && (
            <Text style={[styles.characterCount, (250 - editingReviewText.length) <= 10 && styles.characterCountWarning]}>
              {250 - editingReviewText.length}
            </Text>
          )}
          <View style={styles.reviewEditActions}>
            <TouchableOpacity
              style={[styles.reviewEditButton, styles.reviewEditSave]}
              onPress={() => saveEditingReview(index)}
              accessibilityRole="button"
              accessibilityLabel="Save edited review"
            >
              <Text style={styles.reviewEditButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.reviewEditButton, styles.reviewEditCancel]}
              onPress={cancelEditingReview}
              accessibilityRole="button"
              accessibilityLabel="Cancel editing review"
            >
              <Text style={styles.reviewEditButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isOwnReview && (
        <View style={styles.reviewActionsBottom}>
          <TouchableOpacity
            style={styles.reviewActionButton}
            onPress={() => startEditingReview(review, index)}
            accessibilityRole="button"
            accessibilityLabel="Edit review"
          >
            <Ionicons
              name="pencil"
              size={22}
              color={colors.accent}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.reviewActionButton}
            onPress={() => confirmDeleteReview(review, index)}
            accessibilityRole="button"
            accessibilityLabel="Delete review"
          >
            <Ionicons name="trash" size={22} color={colors.danger} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default memo(ReviewCard);
