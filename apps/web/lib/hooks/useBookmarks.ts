'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'feed-bookmarks';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setBookmarks(new Set(parsed));
        }
      }
    } catch (error) {
      console.warn('Failed to load bookmarks from localStorage:', error);
    }
    setIsLoaded(true);
  }, []);

  const toggle = useCallback((id: string) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      // Persist to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch (error) {
        console.warn('Failed to save bookmarks to localStorage:', error);
      }
      return next;
    });
  }, []);

  const isBookmarked = useCallback((id: string) => bookmarks.has(id), [bookmarks]);

  const add = useCallback((id: string) => {
    setBookmarks(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch (error) {
        console.warn('Failed to save bookmarks to localStorage:', error);
      }
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setBookmarks(prev => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch (error) {
        console.warn('Failed to save bookmarks to localStorage:', error);
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setBookmarks(new Set());
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear bookmarks from localStorage:', error);
    }
  }, []);

  return {
    bookmarks,
    toggle,
    isBookmarked,
    add,
    remove,
    clear,
    isLoaded,
    count: bookmarks.size,
  };
}
