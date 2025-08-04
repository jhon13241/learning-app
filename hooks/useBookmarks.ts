import { useState, useEffect, useCallback } from 'react';
import { BookmarkService } from '../services/bookmarkService';
import { Bookmark } from '../types';

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load bookmarks on mount
  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const loadedBookmarks = await BookmarkService.getBookmarks();
      setBookmarks(loadedBookmarks);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  const addBookmark = useCallback(async (bookmark: Omit<Bookmark, 'id' | 'dateCreated'>) => {
    try {
      const newBookmark = await BookmarkService.saveBookmark(bookmark);
      // Optimistically update the state instead of reloading all bookmarks
      setBookmarks(prev => [...prev, newBookmark]);
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  }, []);

  const deleteBookmark = useCallback(async (bookmarkId: string) => {
    try {
      await BookmarkService.deleteBookmark(bookmarkId);
      // Optimistically update the state instead of reloading all bookmarks
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      throw error;
    }
  }, []);

  const isBookmarked = useCallback((reference: string): boolean => {
    // Use current state instead of async call for better performance
    return bookmarks.some(b => b.reference === reference);
  }, [bookmarks]);

  const isBookmarkedAsync = useCallback(async (reference: string): Promise<boolean> => {
    try {
      return await BookmarkService.isBookmarked(reference);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      return false;
    }
  }, []);

  return {
    bookmarks,
    isLoading,
    addBookmark,
    deleteBookmark,
    isBookmarked,
    isBookmarkedAsync,
    refreshBookmarks: loadBookmarks
  };
};