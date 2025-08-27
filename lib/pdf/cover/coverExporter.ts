import jsPDF from 'jspdf';
import { BaseExportOptions, ExportResult, PDFBlock } from '../types';
import { PDF_CONSTANTS, PDF_ERROR_MESSAGES } from '../constants';
import { fontManager } from '../fonts';
import { coordinateConverter } from '../utils/coordinateConverter';
import { spineCalculator } from './spineCalculator';
import type { BookLayout, PageContent, PageBlock } from '@/lib/layout-types';

export interface CoverExportOptions extends BaseExportOptions {
  interiorPageCount: number;
  includeSpineText?: boolean;
  spineTextColor?: string;
  spineFontSize?: number;
}

export interface CoverExportResult extends ExportResult {
  spineWidth?: number;
  totalWidth?: number;
}

interface CoverLayout {
  dimensions: {
    frontWidth: number;
    spineWidth: number;
    backWidth: number;
    height: number;
    totalWidth: number;
    bleedMargin: number;
    safeMargin: number;
  };
  sections: CoverSection[];
}

interface CoverSection {
  type: 'front' | 'spine' | 'back';
  x: number;
  y: number;
  width: number;
  height: number;
  content: PageContent;
}

export async function exportCover(
  options: CoverExportOptions
): Promise<CoverExportResult> {
  try {
    // Validate input
    if (!options.layout) {
      return {
        success: false,
        error: PDF_ERROR_MESSAGES.LAYOUT_REQUIRED
      };
    }

    if (!options.interiorPageCount || options.interiorPageCount <= 0) {
      return {
        success: false,
        error: PDF_ERROR_MESSAGES.INVALID_PAGE_COUNT
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

    // Calculate spine width
    const spineWidth = spineCalculator.calculateSpineWidth(options.interiorPageCount);
    const totalWidth = spineCalculator.getTotalCoverWidth(options.interiorPageCount);

    // Generate cover layout
    const coverLayout = generateCoverLayout(options.layout, options.interiorPageCount);

    // Process cover sections
    const processedSections = await processCoverSections(coverLayout.sections, quality);

    // Generate PDF
    const pdfBlob = await generateCoverPDF(processedSections, coverLayout, options);

    return {
      success: true,
      pdfBlob,
      pageCount: 1,
      spineWidth,
      totalWidth
    };

  } catch (error) {
    console.error('Cover export failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

function generateCoverLayout(
  layout: BookLayout, 
  interiorPageCount: number
): CoverLayout {
  const spineWidth = spineCalculator.calculateSpineWidth(interiorPageCount);
  const totalWidth = spineCalculator.getTotalCoverWidth(interiorPageCount);
  
  return {
    dimensions: {
      frontWidth: PDF_CONSTANTS.PAGE_WIDTH_POINTS,
      spineWidth,
      backWidth: PDF_CONSTANTS.PAGE_WIDTH_POINTS,
      height: PDF_CONSTANTS.PAGE_HEIGHT_POINTS,
      totalWidth,
      bleedMargin: PDF_CONSTANTS.BLEED_MARGIN_POINTS,
      safeMargin: PDF_CONSTANTS.SAFE_MARGIN_POINTS
    },
    sections: [
      {
        type: 'front',
        x: PDF_CONSTANTS.BLEED_MARGIN_POINTS,
        y: PDF_CONSTANTS.BLEED_MARGIN_POINTS,
        width: PDF_CONSTANTS.PAGE_WIDTH_POINTS,
        height: PDF_CONSTANTS.PAGE_HEIGHT_POINTS,
        content: layout.cover.content
      },
      {
        type: 'spine',
        x: PDF_CONSTANTS.BLEED_MARGIN_POINTS + PDF_CONSTANTS.PAGE_WIDTH_POINTS,
        y: PDF_CONSTANTS.BLEED_MARGIN_POINTS,
        width: spineWidth,
        height: PDF_CONSTANTS.PAGE_HEIGHT_POINTS,
        content: generateSpineContent(layout)
      },
      {
        type: 'back',
        x: PDF_CONSTANTS.BLEED_MARGIN_POINTS + PDF_CONSTANTS.PAGE_WIDTH_POINTS + spineWidth,
        y: PDF_CONSTANTS.BLEED_MARGIN_POINTS,
        width: PDF_CONSTANTS.PAGE_WIDTH_POINTS,
        height: PDF_CONSTANTS.PAGE_HEIGHT_POINTS,
        content: layout.cover.content // Or separate back cover content
      }
    ]
  };
}

function generateSpineContent(layout: BookLayout): PageContent {
  const title = extractTitle(layout.cover.content);
  const author = extractAuthor(layout.cover.content);
  
  return {
    text: `${title}\n${author}`,
    image: null,
    fontSize: 12,
    align: 'center',
    textColor: '#000000',
    padding: 0,
    blocks: [
      {
        id: crypto.randomUUID(),
        type: 'text',
        x: 0,
        y: 0,
        w: 0, // Will be set by spine renderer
        h: 0, // Will be set by spine renderer
        text: `${title}\n${author}`,
        fontSize: 12,
        align: 'center',
        color: '#000000',
        fontFamily: 'Inter, Arial, sans-serif',
        listType: 'none',
        z: 1
      }
    ]
  };
}

function extractTitle(content: PageContent): string {
  // Try to extract title from text blocks
  const titleBlock = content.blocks?.find(block => 
    block.type === 'text' && block.text && block.text.length > 0
  );
  
  if (titleBlock?.text) {
    return titleBlock.text.split('\n')[0]; // First line
  }
  
  return content.text?.split('\n')[0] || 'Untitled';
}

function extractAuthor(content: PageContent): string {
  // Try to extract author from text blocks
  const authorBlock = content.blocks?.find(block => 
    block.type === 'text' && block.text && block.text.includes('By')
  );
  
  if (authorBlock?.text) {
    const authorMatch = authorBlock.text.match(/By\s+(.+)/);
    if (authorMatch) {
      return authorMatch[1];
    }
  }
  
  return 'Unknown Author';
}

async function processCoverSections(
  sections: CoverSection[], 
  quality: 'low' | 'medium' | 'high'
): Promise<Array<CoverSection & { blocks: PDFBlock[] }>> {
  const processedSections: Array<CoverSection & { blocks: PDFBlock[] }> = [];

  for (const section of sections) {
    const processedBlocks = await processCoverBlocks(section.content.blocks || [], quality, section);
    
    processedSections.push({
      ...section,
      blocks: processedBlocks
    });
  }

  return processedSections;
}

function processCoverBlocks(
  blocks: PageBlock[], 
  quality: 'low' | 'medium' | 'high',
  section: CoverSection
): PDFBlock[] {
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

async function generateCoverPDF(
  sections: Array<CoverSection & { blocks: PDFBlock[] }>,
  coverLayout: CoverLayout,
  options: CoverExportOptions
): Promise<Blob> {
  try {
    // Create PDF document using jsPDF with standard A4 landscape
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'pt'
    });

    // Set default font
    pdf.setFont('helvetica');
    pdf.setFontSize(12);

    // Get page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Render blocks from all sections
    for (const section of sections) {
      for (const block of section.blocks) {
        if (block.type === 'text' && block.text) {
          const textContent = block.text.toString().trim();
          if (textContent) {
            // Convert block position to PDF coordinates with proper scaling
            const scaleX = pageWidth / 720;
            const scaleY = pageHeight / 540;
            
            const x = block.x * scaleX;
            const y = block.y * scaleY;
            const width = block.w * scaleX;
            
            // Set font properties
            pdf.setFontSize(block.fontSize || 12);
            pdf.setTextColor(0, 0, 0);
            
            // Split text to fit block width
            const lines = pdf.splitTextToSize(textContent, width);
            
            // Draw text lines
            for (let i = 0; i < lines.length; i++) {
              const lineY = y + (i * 15); // Line spacing
              if (lineY < pageHeight - 20) {
                pdf.text(lines[i], x, lineY);
              }
            }
          }
        } else if (block.type === 'image' && block.image) {
          try {
            // Convert block position to PDF coordinates with proper scaling
            const scaleX = pageWidth / 720;
            const scaleY = pageHeight / 540;
            
            const x = block.x * scaleX;
            const y = block.y * scaleY;
            const width = block.w * scaleX;
            const height = block.h * scaleY;
            
            // Handle different image formats
            let imageData = block.image;
            let imageFormat = 'JPEG';
            
            // If it's a URL path, we need to convert it to base64 or use a placeholder
            if (imageData.startsWith('/') || imageData.startsWith('http')) {
              // For now, draw a placeholder with the image path
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
            } else {
              // Try to add the image (assuming it's base64 data)
              pdf.addImage(imageData, imageFormat, x, y, width, height);
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
    }

    // Generate PDF blob
    const pdfBlob = pdf.output('blob');
    return pdfBlob;

  } catch (error) {
    console.error('Cover PDF generation error:', error);
    throw error;
  }
}

// Helper function to calculate interior page count from layout
export function calculateInteriorPageCount(layout: BookLayout): number {
  // Title page (1) + Spreads (2 pages each) + Ending page (1)
  return 1 + (layout.spreads.length * 2) + 1;
}

// Helper function to validate layout for cover export
export function validateLayoutForCover(layout: BookLayout): boolean {
  if (!layout.cover) {
    return false;
  }

  return true;
}
