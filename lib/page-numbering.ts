export type FixedPageType = "cover" | "title" | "ending";

export interface PageNumberingConfig {
  currentIndex: number;
  spreadsLength: number;
  fixedPageType?: FixedPageType;
  side?: "left" | "right";
}

/**
 * Calculate the base page number for a given page index and type
 */
export function calculateBasePage(
  currentIndex: number, 
  fixedPageType: FixedPageType | undefined, 
  spreadsLength: number = 0
): number {
  if (fixedPageType === "cover") {
    return 0; // Cover pages don't have page numbers
  }
  
  if (fixedPageType === "title") {
    return 1; // Title page is always page 1
  }
  
  if (fixedPageType === "ending") {
    return spreadsLength * 2 + 2; // After all story spreads
  }
  
  // Story spreads
  return currentIndex * 2 - 2;
}

/**
 * Get the fixed page type based on current index and spreads length
 */
export function getFixedPageType(currentIndex: number, spreadsLength: number): FixedPageType | undefined {
  if (currentIndex === 0) return "cover";
  if (currentIndex === 1) return "title";
  if (currentIndex === spreadsLength + 3) return "ending";
  return undefined; // Story spread
}

/**
 * Determine if a page should show a page number
 */
export function shouldShowPageNumber(
  isFixedPage: boolean,
  fixedPageType: FixedPageType | undefined,
  side: "left" | "right",
  pageNumber: number
): boolean {
  if (!isFixedPage) {
    return true; // Story spreads always show page numbers
  }
  
  if (fixedPageType === "cover") {
    return false; // Cover pages show labels instead
  }
  
  if (fixedPageType === "title") {
    return side === "right" && pageNumber > 0; // Only right side shows "Page 1"
  }
  
  if (fixedPageType === "ending") {
    return side === "left" && pageNumber > 0; // Only left side shows page number
  }
  
  return true;
}

/**
 * Get the display text for a page number or label
 */
export function getPageDisplayText(
  isFixedPage: boolean,
  fixedPageType: FixedPageType | undefined,
  side: "left" | "right",
  pageNumber: number
): string | null {
  if (!isFixedPage) {
    return `Page ${pageNumber}`;
  }
  
  if (fixedPageType === "cover") {
    if (side === "left") return "Back Cover";
    if (side === "right") return "Cover";
    return null;
  }
  
  if (fixedPageType === "title") {
    if (side === "right" && pageNumber > 0) return "Page 1";
    return null;
  }
  
  if (fixedPageType === "ending") {
    if (side === "left" && pageNumber > 0) return `Page ${pageNumber}`;
    return null;
  }
  
  return `Page ${pageNumber}`;
}

/**
 * Generate the complete page numbering sequence for a book
 */
export function generatePageNumbering(spreadsLength: number): Array<{
  type: "cover" | "title" | "spread" | "ending";
  left: string | null;
  right: string | null;
}> {
  const pages = [];
  
  // Cover page
  pages.push({
    type: "cover",
    left: "Back Cover",
    right: "Cover"
  });
  
  // Title page
  pages.push({
    type: "title",
    left: null,
    right: "Page 1"
  });
  
  // Story spreads
  for (let i = 0; i < spreadsLength; i++) {
    const basePage = (i + 2) * 2 - 2;
    pages.push({
      type: "spread",
      left: `Page ${basePage}`,
      right: `Page ${basePage + 1}`
    });
  }
  
  // Ending page
  if (spreadsLength > 0) {
    const endingPageNumber = spreadsLength * 2 + 2;
    pages.push({
      type: "ending",
      left: `Page ${endingPageNumber}`,
      right: null
    });
  }
  
  return pages;
}
