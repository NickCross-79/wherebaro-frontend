import React, { memo, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, Pressable } from 'react-native';
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

  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

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
          <Ionicons
            name="person-circle"
            size={32}
            color={isOwnReview ? colors.accent : colors.textSecondary}
          />
          <View>
            <View style={styles.reviewerNameRow}>
              <Text style={[styles.reviewerName, isOwnReview && styles.ownReviewerName]}>
                {review.user}
              </Text>
              {isOwnReview && (
                <View style={styles.youBadge}>
                  <Text style={styles.youBadgeText}>You</Text>
                </View>
              )}
            </View>
            <Text style={styles.reviewDate}>{getRelativeTime(review.date)}</Text>
          </View>
        </View>
        <View style={styles.reviewHeaderRight}>
          {isOwnReview && !isEditing && (
            <TouchableOpacity
              style={styles.reviewActionButton}
              onPress={() => setMenuVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Review options"
            >
              <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
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

      {/* Options menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuSheet}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                startEditingReview(review, index);
              }}
              accessibilityRole="button"
              accessibilityLabel="Edit review"
            >
              <Ionicons name="pencil" size={18} color={colors.accent} />
              <Text style={styles.menuItemText}>Edit</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                confirmDeleteReview(review, index);
              }}
              accessibilityRole="button"
              accessibilityLabel="Delete review"
            >
              <Ionicons name="trash" size={18} color={colors.danger} />
              <Text style={[styles.menuItemText, styles.menuItemDanger]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
      <Text
        style={styles.reviewText}
        numberOfLines={expanded ? undefined : 3}
        onTextLayout={(e) => {
          if (!expanded && e.nativeEvent.lines.length >= 3) {
            setIsTruncated(true);
          }
        }}
      >
        {decodeHtmlEntities(review.content)}
      </Text>
      {isTruncated && (
        <TouchableOpacity
          onPress={() => setExpanded((prev) => !prev)}
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Read less' : 'Read more'}
        >
          <Text style={styles.readMoreText}>
            {expanded ? 'Read less' : 'Read more'}
          </Text>
        </TouchableOpacity>
      )}

      {isEditing && (
        <View style={styles.reviewEditContainer}>
          <TextInput
            style={styles.reviewEditInput}
            value={editingReviewText}
            onChangeText={(text) => setEditingReviewText(text)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
          {(500 - editingReviewText.length) <= 100 && (
            <Text style={[styles.characterCount, (500 - editingReviewText.length) <= 20 && styles.characterCountWarning]}>
              {500 - editingReviewText.length}
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
    </View>
  );
}

export default memo(ReviewCard);
