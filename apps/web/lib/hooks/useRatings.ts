'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'feed-ratings';

export type RatingValue = 1 | -1 | null;
export type RatingTag = 'actionable' | 'noise' | 'already_knew' | 'too_late';

export interface Rating {
  value: RatingValue;
  tags: RatingTag[];
}

interface RatingsMap {
  [itemId: string]: Rating;
}

export function useRatings() {
  const [ratings, setRatings] = useState<RatingsMap>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object') {
          setRatings(parsed);
        }
      }
    } catch (error) {
      console.warn('Failed to load ratings from localStorage:', error);
    }
    setIsLoaded(true);
  }, []);

  // Persist to localStorage whenever ratings change
  const persistToStorage = useCallback((newRatings: RatingsMap) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRatings));
    } catch (error) {
      console.warn('Failed to save ratings to localStorage:', error);
    }
  }, []);

  // Sync rating to server (fire and forget)
  const syncToServer = useCallback(async (itemId: string, rating: Rating | null) => {
    try {
      if (rating === null || rating.value === null) {
        // Delete rating
        await fetch(`/api/ratings?item_id=${itemId}`, { method: 'DELETE' });
      } else {
        // Create/update rating
        await fetch('/api/ratings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            feed_item_id: itemId,
            rating: rating.value,
            tags: rating.tags,
          }),
        });
      }
    } catch (error) {
      console.warn('Failed to sync rating to server:', error);
    }
  }, []);

  // Rate an item (thumbs up = 1, thumbs down = -1)
  const rate = useCallback((itemId: string, value: RatingValue, tags: RatingTag[] = []) => {
    setRatings(prev => {
      const newRatings = { ...prev };

      if (value === null) {
        delete newRatings[itemId];
      } else {
        newRatings[itemId] = { value, tags };
      }

      persistToStorage(newRatings);

      // Sync to server in background
      const rating = value === null ? null : { value, tags };
      syncToServer(itemId, rating);

      return newRatings;
    });
  }, [persistToStorage, syncToServer]);

  // Toggle thumbs up (if already up, remove rating)
  const thumbsUp = useCallback((itemId: string) => {
    const current = ratings[itemId];
    if (current?.value === 1) {
      rate(itemId, null);
    } else {
      rate(itemId, 1, current?.tags || []);
    }
  }, [ratings, rate]);

  // Toggle thumbs down (if already down, remove rating)
  const thumbsDown = useCallback((itemId: string) => {
    const current = ratings[itemId];
    if (current?.value === -1) {
      rate(itemId, null);
    } else {
      rate(itemId, -1, current?.tags || []);
    }
  }, [ratings, rate]);

  // Add/remove a tag for an item
  const toggleTag = useCallback((itemId: string, tag: RatingTag) => {
    const current = ratings[itemId];
    if (!current || current.value === null) return;

    const currentTags = current.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];

    rate(itemId, current.value, newTags);
  }, [ratings, rate]);

  // Get rating for an item
  const getRating = useCallback((itemId: string): Rating | null => {
    return ratings[itemId] || null;
  }, [ratings]);

  // Check if item is rated up/down
  const isRatedUp = useCallback((itemId: string) => ratings[itemId]?.value === 1, [ratings]);
  const isRatedDown = useCallback((itemId: string) => ratings[itemId]?.value === -1, [ratings]);
  const hasTag = useCallback((itemId: string, tag: RatingTag) =>
    ratings[itemId]?.tags?.includes(tag) || false, [ratings]);

  // Remove rating
  const removeRating = useCallback((itemId: string) => {
    rate(itemId, null);
  }, [rate]);

  // Clear all ratings
  const clearAll = useCallback(() => {
    setRatings({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear ratings from localStorage:', error);
    }
  }, []);

  return {
    ratings,
    rate,
    thumbsUp,
    thumbsDown,
    toggleTag,
    getRating,
    isRatedUp,
    isRatedDown,
    hasTag,
    removeRating,
    clearAll,
    isLoaded,
    isSyncing,
    count: Object.keys(ratings).length,
  };
}
