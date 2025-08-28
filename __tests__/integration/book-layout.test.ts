import { generatePageNumbering } from '@/lib/page-numbering';

describe('Book Layout Integration', () => {
  describe('Page Numbering Integration', () => {
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

    test('should have sequential page numbers for story spreads', () => {
      const pageNumbers = generatePageNumbering(3);
      const spreads = pageNumbers.filter(p => p.type === 'spread');
      
      expect(spreads).toHaveLength(3);
      expect(spreads[0]).toEqual({ type: 'spread', left: 'Page 2', right: 'Page 3' });
      expect(spreads[1]).toEqual({ type: 'spread', left: 'Page 4', right: 'Page 5' });
      expect(spreads[2]).toEqual({ type: 'spread', left: 'Page 6', right: 'Page 7' });
    });

    test('should have correct ending page number', () => {
      const pageNumbers = generatePageNumbering(5);
      const endingPage = pageNumbers.find(p => p.type === 'ending');
      expect(endingPage?.left).toBe('Page 12'); // 5 spreads * 2 + 2
    });
  });

  describe('Page Numbering Consistency', () => {
    test('should maintain consistent page numbering across different book sizes', () => {
      const sizes = [0, 1, 2, 5, 10];
      
      sizes.forEach(spreadsLength => {
        const pageNumbers = generatePageNumbering(spreadsLength);
        
        // Cover should always be first
        expect(pageNumbers[0].type).toBe('cover');
        expect(pageNumbers[0].left).toBe('Back Cover');
        expect(pageNumbers[0].right).toBe('Cover');
        
        // Title should always be second
        expect(pageNumbers[1].type).toBe('title');
        expect(pageNumbers[1].left).toBe(null);
        expect(pageNumbers[1].right).toBe('Page 1');
        
        // Story spreads should be sequential
        const spreads = pageNumbers.filter(p => p.type === 'spread');
        expect(spreads).toHaveLength(spreadsLength);
        
        // Ending page should be last (if there are story spreads)
        if (spreadsLength > 0) {
          const endingPage = pageNumbers[pageNumbers.length - 1];
          expect(endingPage.type).toBe('ending');
          expect(endingPage.right).toBe(null);
        }
      });
    });
  });
});
