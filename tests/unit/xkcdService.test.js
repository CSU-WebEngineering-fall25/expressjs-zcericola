// tests/unit/xkcdService.test.js
const XKCDService = require('../../src/services/xkcdService');
const fetch = require('node-fetch');

jest.mock('node-fetch');
const mockFetch = fetch;

describe('XKCDService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    XKCDService.cache.clear();
  });

  describe('getLatest', () => {
    test('should fetch and return latest comic with correct structure', async () => {
      const mockComic = {
        num: 2750,
        title: 'Test Comic',
        img: 'https://imgs.xkcd.com/comics/test.png',
        alt: 'Test alt text',
        transcript: 'Test transcript',
        year: '2023',
        month: '4',
        day: '1',
        safe_title: 'Test Comic'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockComic
      });

      const result = await XKCDService.getLatest();

      expect(mockFetch).toHaveBeenCalledWith('https://xkcd.com/info.0.json');
      expect(result).toEqual({
        id: 2750,
        title: 'Test Comic',
        img: 'https://imgs.xkcd.com/comics/test.png',
        alt: 'Test alt text',
        transcript: 'Test transcript',
        year: '2023',
        month: '4',
        day: '1',
        safe_title: 'Test Comic'
      });
    });

    test('should handle missing transcript gracefully', async () => {
      const mockComic = {
        num: 1,
        title: 'Test',
        img: 'https://test.com/test.png',
        alt: 'Alt text',
        year: '2023',
        month: '1',
        day: '1',
        safe_title: 'Test'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockComic
      });

      const result = await XKCDService.getLatest();
      expect(result.transcript).toBe('');
    });

    test('should cache results for performance', async () => {
      const mockComic = {
        num: 1,
        title: 'Cached',
        img: 'https://test.com/cached.png',
        alt: 'Cached comic',
        year: '2023',
        month: '1',
        day: '1',
        safe_title: 'Cached'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockComic
      });

      await XKCDService.getLatest();
      await XKCDService.getLatest();

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    test('should handle HTTP errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(XKCDService.getLatest()).rejects.toThrow('Failed to fetch latest comic: HTTP 500: Internal Server Error');
    });

    test('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(XKCDService.getLatest()).rejects.toThrow('Failed to fetch latest comic: Network error');
    });
  });

  describe('getById', () => {
    test('should fetch comic by ID when implemented', async () => {
      await expect(XKCDService.getById(614)).rejects.toThrow('getById method not implemented');
    });

    test('should validate ID parameter when implemented', async () => {
      await expect(XKCDService.getById(0)).rejects.toThrow();
      await expect(XKCDService.getById(-1)).rejects.toThrow();
      await expect(XKCDService.getById('invalid')).rejects.toThrow();
    });
  });

  describe('getRandom', () => {
    test('should return random comic when implemented', async () => {
      await expect(XKCDService.getRandom()).rejects.toThrow('getRandom method not implemented');
    });
  });

  describe('search', () => {
    test('should search comics when implemented', async () => {
      await expect(XKCDService.search('test')).rejects.toThrow('search method not implemented');
    });
  });

  describe('processComic', () => {
    test('should process comic data correctly', () => {
      const rawComic = {
        num: 1,
        title: 'Barrel - Part 1',
        img: 'https://imgs.xkcd.com/comics/barrel_cropped_(1).jpg',
        alt: 'Don\'t we all.',
        transcript: 'Test transcript',
        year: '2006',
        month: '1',
        day: '1',
        safe_title: 'Barrel - Part 1'
      };

      const processed = XKCDService.processComic(rawComic);

      expect(processed).toEqual({
        id: 1,
        title: 'Barrel - Part 1',
        img: 'https://imgs.xkcd.com/comics/barrel_cropped_(1).jpg',
        alt: 'Don\'t we all.',
        transcript: 'Test transcript',
        year: '2006',
        month: '1',
        day: '1',
        safe_title: 'Barrel - Part 1'
      });
    });

    test('should handle missing transcript', () => {
      const rawComic = {
        num: 1,
        title: 'Test',
        img: 'https://test.com/test.png',
        alt: 'Alt text',
        year: '2023',
        month: '1',
        day: '1',
        safe_title: 'Test'
      };

      const processed = XKCDService.processComic(rawComic);
      expect(processed.transcript).toBe('');
    });
  });
});