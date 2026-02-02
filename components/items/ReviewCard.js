import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ReviewCard({
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
        <Text style={styles.reviewDate}>{getRelativeTime(review.date)}</Text>
      </View>
      <Text style={styles.reviewText}>{review.content}</Text>

      {isEditing && (
        <View style={styles.reviewEditContainer}>
          <TextInput
            style={styles.reviewEditInput}
            value={editingReviewText}
            onChangeText={setEditingReviewText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
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
