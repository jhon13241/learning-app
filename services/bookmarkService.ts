import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bookmark } from '../types';

const BOOKMARKS_KEY = 'breslov_bookmarks';

export class BookmarkService {
  /**
   * Get all bookmarks from AsyncStorage
   */
  static async getBookmarks(): Promise<Bookmark[]> {
    try {
      const bookmarksJson = await AsyncStorage.getItem(BOOKMARKS_KEY);
      if (!bookmarksJson) return [];
      
      const bookmarks = JSON.parse(bookmarksJson);
      // Convert date strings back to Date objects
      return bookmarks.map((bookmark: any) => ({
        ...bookmark,
        dateCreated: new Date(bookmark.dateCreated)
      }));
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      return [];
    }
  }

  /**
   * Save a new bookmark
   */
  static async saveBookmark(bookmark: Omit<Bookmark, 'id' | 'dateCreated'>): Promise<Bookmark> {
    try {
      const existingBookmarks = await this.getBookmarks();
      
      // Check if bookmark already exists for this reference
      const existingBookmark = existingBookmarks.find(b => b.reference === bookmark.reference);
      if (existingBookmark) {
        throw new Error('Bookmark already exists for this passage');
      }

      const newBookmark: Bookmark = {
        ...bookmark,
        id: Date.now().toString(), // Simple ID generation
        dateCreated: new Date()
      };

      const updatedBookmarks = [...existingBookmarks, newBookmark];
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
      
      return newBookmark;
    } catch (error) {
      console.error('Error saving bookmark:', error);
      throw error;
    }
  }

  /**
   * Delete a bookmark by ID
   */
  static async deleteBookmark(bookmarkId: string): Promise<void> {
    try {
      const existingBookmarks = await this.getBookmarks();
      const updatedBookmarks = existingBookmarks.filter(b => b.id !== bookmarkId);
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      throw error;
    }
  }

  /**
   * Check if a reference is already bookmarked
   */
  static async isBookmarked(reference: string): Promise<boolean> {
    try {
      const bookmarks = await this.getBookmarks();
      return bookmarks.some(b => b.reference === reference);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      return false;
    }
  }
}