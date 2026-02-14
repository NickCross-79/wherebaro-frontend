import React, { memo } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { decodeHtmlEntities } from '../../utils/htmlDecode';

function ReviewCard({
  review,
  index,
  currentUid,
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
}) {
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
          <Ionicons name="person-circle" size={32} color="#D4A574" />
          <Text style={styles.reviewerName}>{review.user}</Text>
        </View>
        <View style={styles.reviewHeaderRight}>
          <Text style={styles.reviewDate}>{getRelativeTime(review.date)}</Text>
          {!isOwnReview && onReportReview && (
            <TouchableOpacity
              style={styles.reportButton}
              onPress={() => onReportReview(review, index)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="flag" size={16} color="#D23B35" />
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
            >
              <Text style={styles.reviewEditButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.reviewEditButton, styles.reviewEditCancel]}
              onPress={cancelEditingReview}
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
          >
            <Ionicons
              name="pencil"
              size={22}
              color="#D4A574"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.reviewActionButton}
            onPress={() => confirmDeleteReview(review, index)}
          >
            <Ionicons name="trash" size={22} color="#D23B35" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default memo(ReviewCard);
