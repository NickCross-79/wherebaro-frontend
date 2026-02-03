import { useState, useRef, useEffect } from 'react';
import { Alert } from 'react-native';
import { likeItem, unlikeItem } from '../services/api';

const LIKE_THROTTLE_MS = 3000;

export const useLike = (initialLiked, initialCount, syncLikeCount) => {
  const [userLiked, setUserLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [isLiking, setIsLiking] = useState(false);

  const likeThrottleRef = useRef({
    lastSentAt: 0,
    pendingTarget: null,
    timerId: null,
    inFlight: false,
    lastSentTarget: null,
    uid: null,
    itemId: null,
  });

  const likeStateRef = useRef({ likeCount, userLiked });

  useEffect(() => {
    likeStateRef.current = { likeCount, userLiked };
  }, [likeCount, userLiked]);

  const schedulePendingLikeRequest = (itemId, uid) => {
    const throttle = likeThrottleRef.current;
    if (throttle.timerId) return;

    const elapsed = Date.now() - throttle.lastSentAt;
    const delay = Math.max(LIKE_THROTTLE_MS - elapsed, 0);

    throttle.timerId = setTimeout(() => {
      throttle.timerId = null;
      void flushPendingLikeRequest(itemId, uid);
    }, delay);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      const throttle = likeThrottleRef.current;
      if (throttle.timerId) {
        clearTimeout(throttle.timerId);
        throttle.timerId = null;
      }
    };
  }, []);

  const sendLikeRequest = async (targetLiked, itemId, uid) => {
    const throttle = likeThrottleRef.current;
    throttle.inFlight = true;
    setIsLiking(true);

    try {
      if (targetLiked) {
        console.log('📌 Making like API call', { itemId, uid });
        await likeItem(itemId, uid);
        console.log('✅ Like API call succeeded', { itemId, uid });
      } else {
        console.log('📌 Making unlike API call', { itemId, uid });
        await unlikeItem(itemId, uid);
        console.log('✅ Unlike API call succeeded', { itemId, uid });
      }
    } catch (error) {
      console.error(
        targetLiked ? '❌ Failed to add like' : '❌ Failed to remove like',
        { itemId, uid, error }
      );
      Alert.alert(
        'Error',
        targetLiked
          ? 'Failed to add like. Please try again.'
          : 'Failed to remove like. Please try again.'
      );

      const { likeCount: currentCount, userLiked: currentLiked } = likeStateRef.current;
      if (currentLiked === targetLiked) {
        const revertedLiked = !targetLiked;
        const revertedCount = targetLiked
          ? Math.max(currentCount - 1, 0)
          : currentCount + 1;
        setUserLiked(revertedLiked);
        syncLikeCount(revertedCount);
      }
    } finally {
      throttle.inFlight = false;
      throttle.lastSentAt = Date.now();
      throttle.lastSentTarget = targetLiked;
      setIsLiking(false);

      if (throttle.pendingTarget !== null && throttle.pendingTarget !== throttle.lastSentTarget) {
        schedulePendingLikeRequest(itemId, uid);
      }
    }
  };

  const flushPendingLikeRequest = async (itemId, uid) => {
    const throttle = likeThrottleRef.current;
    if (throttle.inFlight) return;

    const target = throttle.pendingTarget;
    if (target === null || target === throttle.lastSentTarget) {
      throttle.pendingTarget = null;
      return;
    }

    throttle.pendingTarget = null;
    await sendLikeRequest(target, itemId, uid);
  };

  const enqueueLikeRequest = (targetLiked, itemId, uid) => {
    const throttle = likeThrottleRef.current;
    throttle.pendingTarget = targetLiked;

    if (throttle.inFlight) {
      schedulePendingLikeRequest(itemId, uid);
      return;
    }

    const elapsed = Date.now() - throttle.lastSentAt;
    if (elapsed >= LIKE_THROTTLE_MS) {
      throttle.pendingTarget = null;
      void sendLikeRequest(targetLiked, itemId, uid);
      return;
    }

    schedulePendingLikeRequest(itemId, uid);
  };

  const handleLike = (itemId, uid) => {
    const targetLiked = !userLiked;
    const nextCount = targetLiked ? likeCount + 1 : Math.max(likeCount - 1, 0);

    setUserLiked(targetLiked);
    setLikeCount(nextCount);
    syncLikeCount(nextCount);
    enqueueLikeRequest(targetLiked, itemId, uid);
  };

  return {
    userLiked,
    setUserLiked,
    likeCount,
    setLikeCount,
    isLiking,
    handleLike,
  };
};
