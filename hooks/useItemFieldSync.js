/**
 * Shared hooks for synchronizing item fields across contexts.
 *
 * Each hook wraps a context's `setItems` and returns an updater function
 * that maps over the items array, finds the matching item by id, and
 * applies a field update. This keeps AllItemsContext, InventoryContext,
 * and WishlistContext in sync without a full server refresh.
 *
 * DB persistence is handled once centrally by the caller (e.g.
 * ItemDetailScreen.syncLikeCount) — these hooks only touch in-memory state.
 */
import { useCallback } from 'react';

// ── Helpers ────────────────────────────────────────────────────────────

/** Resolve the canonical ID from an item object. */
const getItemId = (item) => item?.id || item?._id;

/**
 * Generic factory: given a setItems setter and a field-updater function,
 * return a memoised callback that maps over items and applies the update
 * to the matching item.
 *
 * @param {Function} setItems   - React state setter for the items array
 * @param {Function} updateFn   - (item) => partial props to merge
 * @returns {Function} (itemId, ...args) => void
 */
const useItemFieldSync = (setItems, updateFn) =>
  useCallback(
    (itemId, ...args) => {
      setItems((prev) =>
        prev.map((item) =>
          getItemId(item) === itemId
            ? { ...item, ...updateFn(item, ...args) }
            : item
        )
      );
    },
    [setItems]
  );

// ── Likes ──────────────────────────────────────────────────────────────

/**
 * Sync `likes` (absolute count) across a context's items.
 * @param {Function} setItems
 * @returns {Function} updateItemLikes(itemId, likeCount)
 */
export const useItemLikesSync = (setItems) =>
  useItemFieldSync(setItems, (_item, likeCount) => ({ likes: likeCount }));

// ── Reviews ────────────────────────────────────────────────────────────

/**
 * Sync `reviews` array length across a context's items.
 * ItemCard reads `item.reviews.length`, so we grow/shrink the array
 * with lightweight placeholder entries.
 *
 * @param {Function} setItems
 * @returns {Function} updateItemReviewCount(itemId, delta)  — +1 or -1
 */
export const useItemReviewCountSync = (setItems) =>
  useItemFieldSync(setItems, (item, delta) => {
    const current = Array.isArray(item.reviews) ? item.reviews : [];
    if (delta > 0) {
      return { reviews: [{ _placeholder: true }, ...current] };
    }
    // Remove one entry — prefer placeholders to avoid losing real data
    const idx = current.findIndex((r) => r?._placeholder);
    if (idx >= 0) {
      return { reviews: current.filter((_, i) => i !== idx) };
    }
    return { reviews: current.slice(1) };
  });

// ── Wishlist count ─────────────────────────────────────────────────────

/**
 * Sync `wishlistCount` (delta-based) across a context's items.
 * @param {Function} setItems
 * @returns {Function} updateItemWishlistCount(itemId, delta)  — +1 or −1
 */
export const useItemWishlistCountSync = (setItems) =>
  useItemFieldSync(setItems, (item, delta) => ({
    wishlistCount: Math.max(0, (item.wishlistCount || 0) + delta),
  }));

// ── Vote arrays ────────────────────────────────────────────────────────

/**
 * Sync `buy` and `skip` arrays (absolute replacement) across a context's items.
 * @param {Function} setItems
 * @returns {Function} updateItemVoteCounts(itemId, buy, skip)
 */
export const useItemVoteSync = (setItems) =>
  useItemFieldSync(setItems, (_item, buy, skip) => ({
    buy: buy ?? [],
    skip: skip ?? [],
  }));
