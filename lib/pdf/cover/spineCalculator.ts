import { PDF_CONSTANTS } from '../constants';

export interface SpineCalculator {
  calculateSpineWidth(interiorPageCount: number): number;
  getTotalCoverWidth(interiorPageCount: number): number;
  validateSpineWidth(spineWidth: number): boolean;
  getSpineWidthInMm(interiorPageCount: number): number;
}

export class PDFSpineCalculator implements SpineCalculator {
  private static readonly PAGES_PER_MM = PDF_CONSTANTS.SPINE_PAGES_PER_MM;
  private static readonly BASE_SPINE_MM = PDF_CONSTANTS.SPINE_BASE_MM;
  private static readonly MM_TO_POINTS = PDF_CONSTANTS.MM_TO_POINTS;
  
  // Minimum and maximum spine widths in mm
  private static readonly MIN_SPINE_MM = 2;
  private static readonly MAX_SPINE_MM = 50;

  calculateSpineWidth(interiorPageCount: number): number {
    if (interiorPageCount <= 0) {
      throw new Error('Interior page count must be greater than 0');
    }

    const spineWidthMm = this.getSpineWidthInMm(interiorPageCount);
    return spineWidthMm * PDFSpineCalculator.MM_TO_POINTS;
  }

  getSpineWidthInMm(interiorPageCount: number): number {
    // Formula: (# of Interior Pages / 17.48) + 1.524 mm
    const calculatedSpineWidth = (interiorPageCount / this.PAGES_PER_MM) + this.BASE_SPINE_MM;
    
    // Apply constraints
    return Math.max(
      this.MIN_SPINE_MM,
      Math.min(this.MAX_SPINE_MM, calculatedSpineWidth)
    );
  }

  getTotalCoverWidth(interiorPageCount: number): number {
    const spineWidth = this.calculateSpineWidth(interiorPageCount);
    const frontBackWidth = PDF_CONSTANTS.PAGE_WIDTH_POINTS * 2; // Front + Back
    const bleedWidth = PDF_CONSTANTS.BLEED_MARGIN_POINTS * 2; // Left + Right bleed
    return frontBackWidth + spineWidth + bleedWidth;
  }

  validateSpineWidth(spineWidth: number): boolean {
    const spineWidthMm = spineWidth / PDFSpineCalculator.MM_TO_POINTS;
    return spineWidthMm >= PDFSpineCalculator.MIN_SPINE_MM && spineWidthMm <= PDFSpineCalculator.MAX_SPINE_MM;
  }

  // Get spine width for different page count ranges
  getSpineWidthForRange(minPages: number, maxPages: number): { min: number; max: number } {
    const minSpine = this.calculateSpineWidth(minPages);
    const maxSpine = this.calculateSpineWidth(maxPages);
    return { min: minSpine, max: maxSpine };
  }

  // Get recommended page count ranges for different spine widths
  getPageCountRangeForSpine(spineWidthMm: number): { min: number; max: number } {
    const spineWithoutBase = spineWidthMm - this.BASE_SPINE_MM;
    const pagesForSpine = spineWithoutBase * this.PAGES_PER_MM;
    
    // Add some tolerance (±10%)
    const tolerance = pagesForSpine * 0.1;
    return {
      min: Math.max(1, Math.floor(pagesForSpine - tolerance)),
      max: Math.ceil(pagesForSpine + tolerance)
    };
  }

  // Validate if a page count is reasonable for spine calculation
  validatePageCount(pageCount: number): boolean {
    if (pageCount <= 0 || pageCount > 1000) {
      return false;
    }
    
    const spineWidth = this.getSpineWidthInMm(pageCount);
    return this.validateSpineWidth(spineWidth * PDFSpineCalculator.MM_TO_POINTS);
  }
}

// Export singleton instance
export const spineCalculator = new PDFSpineCalculator();

// Helper function to calculate spine width
export function calculateSpineWidth(interiorPageCount: number): number {
  return spineCalculator.calculateSpineWidth(interiorPageCount);
}

// Helper function to get total cover width
export function getTotalCoverWidth(interiorPageCount: number): number {
  return spineCalculator.getTotalCoverWidth(interiorPageCount);
}

// Helper function to validate spine width
export function validateSpineWidth(spineWidth: number): boolean {
  return spineCalculator.validateSpineWidth(spineWidth);
}
