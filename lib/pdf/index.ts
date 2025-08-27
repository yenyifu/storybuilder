// Main PDF export functions
export { exportInternalPages, calculateInternalPageCount, validateLayoutForInternalPages } from './internalPagesExporter';
export { exportCover, calculateInteriorPageCount, validateLayoutForCover } from './cover/coverExporter';

// Shared utilities
export { fontManager } from './fonts';
export { imageProcessor } from './utils/imageProcessor';
export { textProcessor } from './utils/textProcessor';
export { coordinateConverter } from './utils/coordinateConverter';
export { spineCalculator } from './cover/spineCalculator';

// Types
export type {
  PDFBlock,
  BaseExportOptions,
  ExportResult,
  PDFPageConfig,
  Point,
  Dimensions,
  Bounds,
  TextLayout,
  ProcessedImage,
  TransformMatrix,
  StyleObject
} from './types';

// Constants
export { PDF_CONSTANTS, DEFAULT_PDF_PAGE_CONFIG, PDF_ERROR_MESSAGES, PDF_SUCCESS_MESSAGES } from './constants';

// Renderers
export { TextBlockRenderer, ImageBlockRenderer } from './renderers';

// Combined export function
import { exportInternalPages, InternalPagesExportOptions } from './internalPagesExporter';
import { exportCover, CoverExportOptions } from './cover/coverExporter';
import type { BookLayout } from '@/lib/layout-types';

// Re-export BookLayout type for convenience
export type { BookLayout };

export interface CombinedExportOptions {
  layout: BookLayout;
  quality?: 'low' | 'medium' | 'high';
  includePageNumbers?: boolean;
  includeSpineText?: boolean;
  spineTextColor?: string;
  spineFontSize?: number;
  watermark?: string;
}

export interface CombinedExportResult {
  success: boolean;
  internalPagesPdf?: Blob;
  coverPdf?: Blob;
  error?: string;
  internalPageCount?: number;
  coverSpineWidth?: number;
  coverTotalWidth?: number;
}

export async function exportBothPDFs(
  options: CombinedExportOptions
): Promise<CombinedExportResult> {
  try {
    // Calculate interior page count
    const interiorPageCount = 1 + (options.layout.spreads.length * 2) + 1;

    // Export internal pages
    const internalPagesResult = await exportInternalPages({
      layout: options.layout,
      quality: options.quality,
      includePageNumbers: options.includePageNumbers,
      watermark: options.watermark,
    });

    // Export cover
    const coverResult = await exportCover({
      layout: options.layout,
      interiorPageCount,
      quality: options.quality,
      includeSpineText: options.includeSpineText,
      spineTextColor: options.spineTextColor,
      spineFontSize: options.spineFontSize,
    });

    // Check if both exports were successful
    if (!internalPagesResult.success || !coverResult.success) {
      return {
        success: false,
        error: internalPagesResult.error || coverResult.error || 'Export failed',
      };
    }

    return {
      success: true,
      internalPagesPdf: internalPagesResult.pdfBlob,
      coverPdf: coverResult.pdfBlob,
      internalPageCount: internalPagesResult.pageCount,
      coverSpineWidth: coverResult.spineWidth,
      coverTotalWidth: coverResult.totalWidth,
    };

  } catch (error) {
    console.error('Combined PDF export failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Helper function to download PDF
export function downloadPDF(pdfBlob: Blob, filename: string): void {
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Helper function to download both PDFs
export function downloadBothPDFs(
  internalPagesPdf: Blob,
  coverPdf: Blob,
  baseFilename: string = 'story'
): void {
  downloadPDF(internalPagesPdf, `${baseFilename}-internal-pages.pdf`);
  downloadPDF(coverPdf, `${baseFilename}-cover.pdf`);
}
