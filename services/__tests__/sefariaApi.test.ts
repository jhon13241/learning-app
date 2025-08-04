/**
 * Tests for Sefaria API Service
 * 
 * Basic tests to verify API service functionality
 */

import { getText, getIndex } from '../sefariaApi';

// Mock fetch for testing
global.fetch = jest.fn();

describe('Sefaria API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getText', () => {
    it('should fetch text successfully', async () => {
      const mockResponse = {
        ref: 'Sichot_HaRan.1',
        heRef: 'שיחות הר"ן א׳',
        text: ['Test text content'],
        he: ['תוכן טקסט לבדיקה'],
        book: 'Sichot HaRan',
        categories: ['Chasidut', 'Breslov'],
        versions: [],
        sections: [1],
        sectionNames: ['Chapter'],
        textDepth: 1
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getText('Sichot_HaRan.1');
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://www.sefaria.org/api/texts/Sichot_HaRan.1'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const result = await getText('Invalid.Ref');
      
      expect(result.error).toBe('Text not found. Please check the reference.');
      expect(result.text).toEqual(['Text not available']);
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await getText('Sichot_HaRan.1');
      
      expect(result.error).toBe('An unexpected error occurred. Please try again.');
      expect(result.text).toEqual(['Text not available']);
    });

    it('should include query parameters when provided', async () => {
      const mockResponse = {
        ref: 'Sichot_HaRan.1',
        text: ['English text'],
        he: ['Hebrew text']
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await getText('Sichot_HaRan.1', { language: 'en', version: 'Test Version' });
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://www.sefaria.org/api/texts/Sichot_HaRan.1?lang=en&version=Test+Version'
      );
    });
  });

  describe('getIndex', () => {
    it('should fetch index successfully', async () => {
      const mockResponse = {
        title: 'Sichot HaRan',
        heTitle: 'שיחות הר"ן',
        categories: ['Chasidut', 'Breslov'],
        sectionNames: ['Chapter'],
        lengths: [123],
        textDepth: 1,
        schema: {}
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getIndex('Sichot_HaRan');
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://www.sefaria.org/api/index/Sichot_HaRan'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle index errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const result = await getIndex('Invalid_Title');
      
      expect(result.error).toBe('Text not found. Please check the reference.');
      expect(result.title).toBe('Invalid_Title');
    });
  });
});