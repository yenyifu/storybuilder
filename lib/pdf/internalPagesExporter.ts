import jsPDF from 'jspdf';
import { PDFBlock, BaseExportOptions, ExportResult, PDFPageConfig } from './types';
import { PDF_CONSTANTS, DEFAULT_PDF_PAGE_CONFIG, PDF_ERROR_MESSAGES } from './constants';
import { fontManager } from './fonts';
import { imageProcessor } from './utils/imageProcessor';
import { textProcessor } from './utils/textProcessor';
import { coordinateConverter } from './utils/coordinateConverter';
import type { BookLayout, PageContent, PageBlock } from '@/lib/layout-types';

export interface InternalPagesExportOptions extends BaseExportOptions {
  includePageNumbers?: boolean;
}

interface PDFPage {
  type: 'title' | 'left' | 'right' | 'ending';
  content: PageContent;
  pageNumber: number;
}

interface ProcessedPDFPage {
  type: 'title' | 'left' | 'right' | 'ending';
  blocks: PDFBlock[];
  pageNumber: number;
}

export async function exportInternalPages(
  options: InternalPagesExportOptions
): Promise<ExportResult> {
  try {
    // Validate input
    if (!options.layout) {
      return {
        success: false,
        error: PDF_ERROR_MESSAGES.LAYOUT_REQUIRED
      };
    }

    if (options.quality && !['low', 'medium', 'high'].includes(options.quality)) {
      return {
        success: false,
        error: PDF_ERROR_MESSAGES.INVALID_QUALITY
      };
    }

    const quality = options.quality || 'medium';

    // Register fonts
    await fontManager.registerFonts();

    // Flatten pages from layout
    const pages = flattenPages(options.layout);

    // Process pages
    const processedPages = await processPages(pages, quality);

    // Generate PDF
    const pdfBlob = await generatePDF(processedPages, options);

    return {
      success: true,
      pdfBlob,
      pageCount: processedPages.length
    };

  } catch (error) {
    console.error('Internal pages export failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

function flattenPages(layout: BookLayout): PDFPage[] {
  const pages: PDFPage[] = [];

  // Add title page (single page)
  pages.push({
    type: 'title',
    content: layout.title.content,
    pageNumber: 1
  });

  // Add internal spreads (each spread = 2 pages)
  layout.spreads.forEach((spread, index) => {
    pages.push({
      type: 'left',
      content: spread.left,
      pageNumber: 2 + (index * 2)
    });

    pages.push({
      type: 'right',
      content: spread.right,
      pageNumber: 3 + (index * 2)
    });
  });

  // Add ending page (single page)
  pages.push({
    type: 'ending',
    content: layout.ending.content,
    pageNumber: 2 + (layout.spreads.length * 2)
  });

  return pages;
}

async function processPages(pages: PDFPage[], quality: 'low' | 'medium' | 'high'): Promise<ProcessedPDFPage[]> {
  const processedPages: ProcessedPDFPage[] = [];

  for (const page of pages) {
    const processedBlocks = await processBlocks(page.content.blocks || [], quality);
    
    processedPages.push({
      type: page.type,
      blocks: processedBlocks,
      pageNumber: page.pageNumber
    });
  }

  return processedPages;
}

function processBlocks(blocks: PageBlock[], quality: 'low' | 'medium' | 'high'): PDFBlock[] {
  return blocks
    .sort((a, b) => (a.z || 0) - (b.z || 0)) // Sort by z-index
    .map(block => ({
      id: block.id,
      type: block.type,
      x: coordinateConverter.convertX(block.x),
      y: coordinateConverter.convertY(block.y),
      w: coordinateConverter.convertWidth(block.w),
      h: coordinateConverter.convertHeight(block.h),
      z: block.z,
      
      // Text properties
      text: block.text,
      fontSize: coordinateConverter.convertFontSize(block.fontSize || 22),
      align: block.align,
      color: block.color,
      fontFamily: block.fontFamily,
      listType: block.listType,
      backgroundColor: block.backgroundColor,
      backgroundOpacity: block.backgroundOpacity,
      
      // Image properties
      image: block.image,
      zoom: block.zoom,
      offsetX: block.offsetX,
      offsetY: block.offsetY,
    }));
}

async function generatePDF(
  pages: ProcessedPDFPage[], 
  options: InternalPagesExportOptions
): Promise<Blob> {
  try {
    // Create PDF document using jsPDF with A4 landscape as base
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'pt'
    });

    // Set default font
    pdf.setFont('helvetica');
    pdf.setFontSize(12);

    // Process each page
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      
      // Add new page (except for the first page)
      if (i > 0) {
        pdf.addPage();
      }

      // Get page dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();


      
      // Render blocks (text and images)
      for (const block of page.blocks) {
        if (block.type === 'text' && block.text) {
          const textContent = block.text.toString().trim();
          if (textContent) {
            // Convert block position to PDF coordinates with proper scaling
            const scaleX = pageWidth / 720;
            const scaleY = pageHeight / 540;
            
            const x = block.x * scaleX;
            const y = block.y * scaleY;
            const width = block.w * scaleX;
            
            // Set font properties with proper scaling
            // Scale the font size to match the UI appearance
            const baseFontSize = block.fontSize || 12;
            const scaledFontSize = Math.max(12, Math.min(48, baseFontSize * 1.5));
            

            pdf.setFontSize(scaledFontSize);
            pdf.setTextColor(0, 0, 0);
            
            // Split text to fit block width
            const lines = pdf.splitTextToSize(textContent, width);
            
            // Calculate proper line spacing based on font size
            const lineSpacing = scaledFontSize * 1.2;
            
            // Draw text lines with proper positioning
            for (let i = 0; i < lines.length; i++) {
              const lineY = y + (i * lineSpacing);
              if (lineY < pageHeight - 20) {
                // Handle text alignment
                let textX = x;
                if (block.align === 'center') {
                  textX = x + (width / 2);
                  pdf.text(lines[i], textX, lineY, { align: 'center' });
                } else if (block.align === 'right') {
                  textX = x + width;
                  pdf.text(lines[i], textX, lineY, { align: 'right' });
                } else {
                  // Default left alignment
                  pdf.text(lines[i], textX, lineY);
                }
              }
            }
          }
        } else if (block.type === 'image' && block.image) {
          try {
            // Convert block position to PDF coordinates with proper scaling
            // UI canvas is 720x540, PDF is A5 landscape (595.28 x 834.33 points)
            const scaleX = pageWidth / 720;
            const scaleY = pageHeight / 540;
            
            // Ensure coordinates are within page bounds
            const x = Math.max(0, Math.min(pageWidth - block.w * scaleX, block.x * scaleX));
            const y = Math.max(0, Math.min(pageHeight - block.h * scaleY, block.y * scaleY));
            const width = Math.min(block.w * scaleX, pageWidth - x);
            const height = Math.min(block.h * scaleY, pageHeight - y);
            
            // Handle different image formats
            let imageData = block.image;
            let imageFormat = 'JPEG';
            

            
                        // If it's a URL path, we need to convert it to base64 or use a placeholder
            if (imageData && (imageData.startsWith('/') || imageData.startsWith('http'))) {
              // Draw a placeholder with the image path - positioned correctly
              pdf.setDrawColor(100, 100, 100);
              pdf.setFillColor(240, 240, 240);
              pdf.rect(x, y, width, height, 'F');
              pdf.setTextColor(50, 50, 50);
              pdf.setFontSize(8);
              
              // Split the image path to fit in the rectangle
              const imagePath = imageData.split('/').pop() || 'Image';
              const lines = pdf.splitTextToSize(imagePath, width - 4);
              for (let i = 0; i < lines.length && i < 3; i++) {
                pdf.text(lines[i], x + 2, y + 12 + (i * 10));
              }
            } else if (imageData && imageData.startsWith('data:')) {
              // Try to add the image (assuming it's base64 data)
              try {
                // Force the image to be drawn at the correct position with proper sizing
                // Use the full page width and height - no margins
                const imageX = 0;
                const imageY = 0;
                const imageWidth = pageWidth;
                const imageHeight = pageHeight;
                
                pdf.addImage(imageData, imageFormat, imageX, imageY, imageWidth, imageHeight);
                
              } catch (imgError) {
                console.warn('Failed to add base64 image:', imgError);
                // Fallback to placeholder
                pdf.setDrawColor(100, 100, 100);
                pdf.setFillColor(240, 240, 240);
                pdf.rect(x, y, width, height, 'F');
                pdf.setTextColor(50, 50, 50);
                pdf.text('Base64 Image', x + width/2 - 20, y + height/2);
              }
            } else {
              // No image data or unknown format
              pdf.setDrawColor(200, 200, 200);
              pdf.setFillColor(240, 240, 240);
              pdf.rect(x, y, width, height, 'F');
              pdf.setTextColor(100, 100, 100);
              pdf.text('No Image', x + width/2 - 15, y + height/2);
            }
          } catch (error) {
            console.warn('Failed to add image to PDF:', error);
            // Fallback: draw a placeholder rectangle
            const scaleX = pageWidth / 720;
            const scaleY = pageHeight / 540;
            
            const x = block.x * scaleX;
            const y = block.y * scaleY;
            const width = block.w * scaleX;
            const height = block.h * scaleY;
            
            pdf.setDrawColor(200, 200, 200);
            pdf.setFillColor(240, 240, 240);
            pdf.rect(x, y, width, height, 'F');
            pdf.setTextColor(100, 100, 100);
            pdf.text('Image', x + width/2 - 10, y + height/2);
          }
        }
      }

      // Add page number if requested
      if (options.includePageNumbers) {
        try {
          pdf.setFontSize(10);
          pdf.setTextColor(102, 102, 102);
          pdf.text(
            page.pageNumber.toString(),
            pageWidth - 40,
            pageHeight - 20
          );
        } catch (error) {
          console.error('Error adding page number:', error);
        }
      }

      // Add watermark if specified
      if (options.watermark) {
        try {
          pdf.setFontSize(24);
          pdf.setTextColor(0, 0, 0);
          pdf.text(
            options.watermark,
            pageWidth / 2,
            pageHeight / 2
          );
        } catch (error) {
          console.error('Error adding watermark:', error);
        }
      }
    }

    // Generate PDF blob
    const pdfBlob = pdf.output('blob');
    return pdfBlob;

  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
}

// Helper function to calculate total page count
export function calculateInternalPageCount(layout: BookLayout): number {
  // Title page (1) + Spreads (2 pages each) + Ending page (1)
  return 1 + (layout.spreads.length * 2) + 1;
}

// Helper function to validate layout for internal pages export
export function validateLayoutForInternalPages(layout: BookLayout): boolean {
  if (!layout.title || !layout.ending) {
    return false;
  }

  if (!Array.isArray(layout.spreads)) {
    return false;
  }

  return true;
}
