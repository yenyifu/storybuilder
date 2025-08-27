import type { PDFPageConfig } from './types';

// PDF Generation Constants
export const PDF_CONSTANTS = {
  // Page dimensions (A5 Landscape)
  PAGE_WIDTH_MM: 154,
  PAGE_HEIGHT_MM: 216,
  PAGE_WIDTH_POINTS: 595.28,
  PAGE_HEIGHT_POINTS: 834.33,
  
  // Bleed and margins
  BLEED_MARGIN_MM: 3,
  BLEED_MARGIN_POINTS: 8.5,
  SAFE_MARGIN_MM: 5,
  SAFE_MARGIN_POINTS: 14.2,
  
  // Conversion factors
  MM_TO_POINTS: 2.83465,
  
  // Screen to PDF conversion ratios
  SCREEN_TO_PDF_X_RATIO: 595.28 / 720, // 0.8268
  SCREEN_TO_PDF_Y_RATIO: 834.33 / 540, // 1.5451
  FONT_SIZE_SCALE_FACTOR: 0.8,
  
  // Quality settings
  QUALITY_SETTINGS: {
    low: { 
      imageQuality: 0.7, 
      compression: 0.8,
      maxImageWidth: 800,
      maxImageHeight: 600
    },
    medium: { 
      imageQuality: 0.85, 
      compression: 0.9,
      maxImageWidth: 1200,
      maxImageHeight: 900
    },
    high: { 
      imageQuality: 0.95, 
      compression: 0.95,
      maxImageWidth: 2000,
      maxImageHeight: 1500
    }
  },
  
  // Font settings
  DEFAULT_FONT_FAMILY: 'Inter',
  FONT_FALLBACKS: ['Arial', 'Helvetica', 'sans-serif'],
  
  // Spine calculation constants
  SPINE_PAGES_PER_MM: 17.48,
  SPINE_BASE_MM: 1.524,
  
  // Default colors
  DEFAULT_TEXT_COLOR: '#1f2937',
  DEFAULT_BACKGROUND_COLOR: '#ffffff',
  
  // Text settings
  DEFAULT_FONT_SIZE: 22,
  MIN_FONT_SIZE: 8,
  MAX_FONT_SIZE: 72,
  DEFAULT_LINE_HEIGHT: 1.2,
  
  // Image settings
  DEFAULT_IMAGE_ZOOM: 1,
  MAX_IMAGE_ZOOM: 3,
  MIN_IMAGE_ZOOM: 0.1,
  
  // Performance settings
  MAX_CONCURRENT_IMAGE_PROCESSING: 3,
  IMAGE_PROCESSING_TIMEOUT: 30000, // 30 seconds
  PDF_GENERATION_TIMEOUT: 60000, // 60 seconds
};

// Default PDF page configuration
export const DEFAULT_PDF_PAGE_CONFIG: PDFPageConfig = {
  width: PDF_CONSTANTS.PAGE_WIDTH_POINTS,
  height: PDF_CONSTANTS.PAGE_HEIGHT_POINTS,
  bleedMargin: PDF_CONSTANTS.BLEED_MARGIN_POINTS,
  safeMargin: PDF_CONSTANTS.SAFE_MARGIN_POINTS,
  contentArea: {
    x: PDF_CONSTANTS.SAFE_MARGIN_POINTS,
    y: PDF_CONSTANTS.SAFE_MARGIN_POINTS,
    width: PDF_CONSTANTS.PAGE_WIDTH_POINTS - (PDF_CONSTANTS.SAFE_MARGIN_POINTS * 2),
    height: PDF_CONSTANTS.PAGE_HEIGHT_POINTS - (PDF_CONSTANTS.SAFE_MARGIN_POINTS * 2),
  },
};

// Error messages
export const PDF_ERROR_MESSAGES = {
  LAYOUT_REQUIRED: 'Book layout is required for PDF generation',
  INVALID_QUALITY: 'Invalid quality setting. Must be low, medium, or high',
  IMAGE_PROCESSING_FAILED: 'Failed to process image for PDF',
  FONT_LOADING_FAILED: 'Failed to load fonts for PDF generation',
  PDF_GENERATION_FAILED: 'Failed to generate PDF',
  TIMEOUT: 'PDF generation timed out',
  INVALID_PAGE_COUNT: 'Invalid page count for spine calculation',
  CONTENT_OVERFLOW: 'Content exceeds page boundaries',
  UNSUPPORTED_IMAGE_FORMAT: 'Unsupported image format',
  MEMORY_ERROR: 'Insufficient memory for PDF generation',
};

// Success messages
export const PDF_SUCCESS_MESSAGES = {
  INTERNAL_PAGES_GENERATED: 'Internal pages PDF generated successfully',
  COVER_GENERATED: 'Cover PDF generated successfully',
  BOTH_GENERATED: 'Both PDFs generated successfully',
};
