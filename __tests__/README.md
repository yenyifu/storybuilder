# Testing Guide

This directory contains comprehensive tests for the StoryBuilder application, with a focus on the page numbering logic that was particularly challenging to implement correctly.

## Test Structure

```
__tests__/
├── lib/
│   └── page-numbering.test.ts          # Unit tests for page numbering utilities
├── components/
│   └── PageNumber.test.tsx             # Component tests for PageNumber
├── integration/
│   └── book-layout.test.ts             # Integration tests for complete book layout
└── README.md                           # This file
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### With Coverage
```bash
npm run test:coverage
```

## Test Categories

### 1. Page Numbering Utilities (`lib/page-numbering.test.ts`)
Tests the core logic for:
- Calculating base page numbers for different page types
- Determining fixed page types (cover, title, ending)
- Deciding when to show page numbers vs labels
- Generating complete page numbering sequences

### 2. PageNumber Component (`components/PageNumber.test.tsx`)
Tests the React component that displays page numbers:
- Correct labels for cover pages ("Back Cover", "Cover")
- Page 1 display only on title page right side
- Page numbers only on ending page left side
- Regular page numbers for story spreads

### 3. Book Layout Integration (`integration/book-layout.test.ts`)
Tests the complete page numbering system:
- Correct page sequences for books with different numbers of spreads
- Edge cases (0 spreads, many spreads)
- Consistency across different book sizes

## Key Issues These Tests Catch

1. **Missing `side` prop** - PageNumber component not receiving the `side` prop
2. **Incorrect `basePage` calculations** - Wrong formulas for page numbering
3. **Fixed page type detection** - Logic for identifying cover/title/ending pages
4. **Page number display logic** - Which sides should show page numbers vs labels
5. **Edge cases** - Books with 0, 1, or many story spreads

## Adding New Tests

When adding new features or fixing bugs:

1. **Unit tests** - Test individual functions in `lib/` directory
2. **Component tests** - Test React components in `components/` directory  
3. **Integration tests** - Test complete workflows in `integration/` directory

## Test Naming Convention

- Use descriptive test names that explain the expected behavior
- Group related tests using `describe` blocks
- Test both happy path and edge cases
- Include comments explaining complex test logic

## Example Test Structure

```typescript
describe('Feature Name', () => {
  describe('Specific Functionality', () => {
    test('should handle normal case', () => {
      // Test implementation
    });

    test('should handle edge case', () => {
      // Test implementation
    });
  });
});
```
