/**
 * Whether a review, like or vote belongs to this device.
 *
 * The backend no longer returns anyone's uid from getReviews/getLikes/getVotes
 * (a uid is what proves authorship, so exposing it let anyone act as anyone).
 * It returns `isOwn` instead, computed against the uid this app sends. Entries
 * the app creates itself (a review it just posted or edited) still carry its
 * own uid, so that is accepted too.
 *
 * @param {Object} entry - A review, like or vote
 * @param {string} [uid] - This device's uid
 * @returns {boolean}
 */
export const isOwnEntry = (entry, uid) => {
  if (!entry) return false;
  if (entry.isOwn === true) return true;
  return Boolean(uid) && entry.uid !== undefined && String(entry.uid) === String(uid);
};
