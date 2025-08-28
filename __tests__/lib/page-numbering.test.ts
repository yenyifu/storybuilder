import {
  calculateBasePage,
  getFixedPageType,
  shouldShowPageNumber,
  getPageDisplayText,
  generatePageNumbering,
} from '@/lib/page-numbering';

describe('Page Numbering Utilities', () => {
  describe('calculateBasePage', () => {
    test('should calculate correct basePage for fixed pages', () => {
      // Cover page (index 0)
      expect(calculateBasePage(0, 'cover')).toBe(0);
      
      // Title page (index 1) 
      expect(calculateBasePage(1, 'title')).toBe(1);
      
      // Ending page with 2 story spreads
      expect(calculateBasePage(5, 'ending', 2)).toBe(6); // 2 spreads * 2 + 2
    });

    test('should calculate correct basePage for story spreads', () => {
      // Story spread 1 (index 2)
      expect(calculateBasePage(2, undefined)).toBe(2); // 2 * 2 - 2 = 2
      
      // Story spread 2 (index 3) 
      expect(calculateBasePage(3, undefined)).toBe(4); // 3 * 2 - 2 = 4
      
      // Story spread 3 (index 4)
      expect(calculateBasePage(4, undefined)).toBe(6); // 4 * 2 - 2 = 6
    });
  });

  describe('getFixedPageType', () => {
    test('should correctly identify page types by currentIndex', () => {
      expect(getFixedPageType(0, 0)).toBe('cover');
      expect(getFixedPageType(1, 0)).toBe('title');
      expect(getFixedPageType(5, 2)).toBe('ending'); // spreads.length = 2
      expect(getFixedPageType(2, 2)).toBe(undefined); // story spread
    });
  });

  describe('shouldShowPageNumber', () => {
    test('should show page numbers for story spreads', () => {
      expect(shouldShowPageNumber(false, undefined, 'left', 2)).toBe(true);
      expect(shouldShowPageNumber(false, undefined, 'right', 3)).toBe(true);
    });

    test('should not show page numbers for cover pages', () => {
      expect(shouldShowPageNumber(true, 'cover', 'left', 0)).toBe(false);
      expect(shouldShowPageNumber(true, 'cover', 'right', 0)).toBe(false);
    });

    test('should show page number only on title page right side', () => {
      expect(shouldShowPageNumber(true, 'title', 'left', 1)).toBe(false);
      expect(shouldShowPageNumber(true, 'title', 'right', 2)).toBe(true);
      expect(shouldShowPageNumber(true, 'title', 'right', 0)).toBe(false);
    });

    test('should show page number only on ending page left side', () => {
      expect(shouldShowPageNumber(true, 'ending', 'left', 6)).toBe(true);
      expect(shouldShowPageNumber(true, 'ending', 'right', 7)).toBe(false);
      expect(shouldShowPageNumber(true, 'ending', 'left', 0)).toBe(false);
    });
  });

  describe('getPageDisplayText', () => {
    test('should return correct labels for cover pages', () => {
      expect(getPageDisplayText(true, 'cover', 'left', 0)).toBe('Back Cover');
      expect(getPageDisplayText(true, 'cover', 'right', 0)).toBe('Cover');
    });

    test('should return Page 1 only for title page right side', () => {
      expect(getPageDisplayText(true, 'title', 'left', 1)).toBe(null);
      expect(getPageDisplayText(true, 'title', 'right', 2)).toBe('Page 1');
    });

    test('should return page number only for ending page left side', () => {
      expect(getPageDisplayText(true, 'ending', 'left', 6)).toBe('Page 6');
      expect(getPageDisplayText(true, 'ending', 'right', 7)).toBe(null);
    });

    test('should return page numbers for story spreads', () => {
      expect(getPageDisplayText(false, undefined, 'left', 2)).toBe('Page 2');
      expect(getPageDisplayText(false, undefined, 'right', 3)).toBe('Page 3');
    });
  });

  describe('generatePageNumbering', () => {
    test('should generate correct page sequence for book with 2 story spreads', () => {
      const pageNumbers = generatePageNumbering(2);
      expect(pageNumbers).toEqual([
        { type: 'cover', left: 'Back Cover', right: 'Cover' },
        { type: 'title', left: null, right: 'Page 1' },
        { type: 'spread', left: 'Page 2', right: 'Page 3' },
        { type: 'spread', left: 'Page 4', right: 'Page 5' },
        { type: 'ending', left: 'Page 6', right: null }
      ]);
    });

    test('should handle book with no story spreads', () => {
      const pageNumbers = generatePageNumbering(0);
      expect(pageNumbers).toEqual([
        { type: 'cover', left: 'Back Cover', right: 'Cover' },
        { type: 'title', left: null, right: 'Page 1' }
      ]);
    });

    test('should handle book with many story spreads', () => {
      const pageNumbers = generatePageNumbering(10);
      const endingPage = pageNumbers.find(p => p.type === 'ending');
      expect(endingPage?.left).toBe('Page 22'); // 10 spreads * 2 + 2
    });
  });
});
