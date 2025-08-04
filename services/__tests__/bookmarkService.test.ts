/**
 * Tests for Bookmark Service
 * 
 * Tests for bookmark storage and management functionality
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookmarkService } from '../bookmarkService';
import { Bookmark } from '../../types';

// Mock AsyncStorage
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('BookmarkService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBookmarks', () => {
    it('should return empty array when no bookmarks exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await BookmarkService.getBookmarks();
      
      expect(result).toEqual([]);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('breslov_bookmarks');
    });

    it('should return bookmarks with converted dates', async () => {
      const mockBookmarks = [
        {
          id: '1',
          textTitle: 'Test Text',
          reference: 'Test.1.1',
          passage: 'Test passage',
          dateCreated: '2024-01-01T00:00:00.000Z'
        }
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockBookmarks));

      const result = await BookmarkService.getBookmarks();
      
      expect(result).toHaveLength(1);
      expect(result[0].dateCreated).toBeInstanceOf(Date);
      expect(result[0].textTitle).toBe('Test Text');
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await BookmarkService.getBookmarks();
      
      expect(result).toEqual([]);
    });
  });

  describe('saveBookmark', () => {
    it('should save a new bookmark successfully', async () => {
      const existingBookmarks: Bookmark[] = [];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingBookmarks));
      mockAsyncStorage.setItem.mockResolvedValue();

      const newBookmark = {
        textTitle: 'Test Text',
        reference: 'Test.1.1',
        passage: 'Test passage'
      };

      await BookmarkService.saveBookmark(newBookmark);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'breslov_bookmarks',
        expect.stringContaining('"textTitle":"Test Text"')
      );
    });

    it('should throw error when bookmark already exists', async () => {
      const existingBookmarks = [
        {
          id: '1',
          textTitle: 'Test Text',
          reference: 'Test.1.1',
          passage: 'Test passage',
          dateCreated: new Date()
        }
      ];
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingBookmarks));

      const duplicateBookmark = {
        textTitle: 'Test Text',
        reference: 'Test.1.1',
        passage: 'Test passage'
      };

      await expect(BookmarkService.saveBookmark(duplicateBookmark))
        .rejects.toThrow('Bookmark already exists for this passage');
    });
  });

  describe('deleteBookmark', () => {
    it('should delete bookmark by ID', async () => {
      const existingBookmarks = [
        {
          id: '1',
          textTitle: 'Test Text 1',
          reference: 'Test.1.1',
          passage: 'Test passage 1',
          dateCreated: new Date()
        },
        {
          id: '2',
          textTitle: 'Test Text 2',
          reference: 'Test.2.1',
          passage: 'Test passage 2',
          dateCreated: new Date()
        }
      ];
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingBookmarks));
      mockAsyncStorage.setItem.mockResolvedValue();

      await BookmarkService.deleteBookmark('1');

      const setItemCall = mockAsyncStorage.setItem.mock.calls[0];
      const savedBookmarks = JSON.parse(setItemCall[1]);
      
      expect(savedBookmarks).toHaveLength(1);
      expect(savedBookmarks[0].id).toBe('2');
    });
  });

  describe('isBookmarked', () => {
    it('should return true when reference is bookmarked', async () => {
      const existingBookmarks = [
        {
          id: '1',
          textTitle: 'Test Text',
          reference: 'Test.1.1',
          passage: 'Test passage',
          dateCreated: new Date()
        }
      ];
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingBookmarks));

      const result = await BookmarkService.isBookmarked('Test.1.1');
      
      expect(result).toBe(true);
    });

    it('should return false when reference is not bookmarked', async () => {
      const existingBookmarks: Bookmark[] = [];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingBookmarks));

      const result = await BookmarkService.isBookmarked('Test.1.1');
      
      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await BookmarkService.isBookmarked('Test.1.1');
      
      expect(result).toBe(false);
    });
  });
});