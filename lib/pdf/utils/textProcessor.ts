import { TextLayout, StyleObject } from '../types';
import { PDF_CONSTANTS } from '../constants';
import { getFontWithFallback } from '../fonts';

export interface TextProcessor {
  calculateTextLayout(text: string, fontSize: number, maxWidth: number, fontFamily?: string): TextLayout;
  applyTextAlignment(alignment: "left" | "center" | "right"): StyleObject;
  formatText(text: string, listType?: "none" | "bullet" | "numbered"): string[];
  validateTextContent(text: string): boolean;
  truncateText(text: string, maxLength: number): string;
}

class PDFTextProcessor implements TextProcessor {
  private textCache: Map<string, TextLayout> = new Map();

  calculateTextLayout(
    text: string, 
    fontSize: number, 
    maxWidth: number, 
    fontFamily: string = PDF_CONSTANTS.DEFAULT_FONT_FAMILY
  ): TextLayout {
    try {
      // Check cache first
      const cacheKey = `${text}_${fontSize}_${maxWidth}_${fontFamily}`;
      if (this.textCache.has(cacheKey)) {
        return this.textCache.get(cacheKey)!;
      }

      // Validate inputs
      if (!text || fontSize <= 0 || maxWidth <= 0) {
        return {
          lines: [],
          lineHeight: fontSize * PDF_CONSTANTS.DEFAULT_LINE_HEIGHT,
          totalHeight: 0,
          wordCount: 0
        };
      }

      // Estimate line height (this would be more accurate with actual font metrics)
      const lineHeight = fontSize * PDF_CONSTANTS.DEFAULT_LINE_HEIGHT;
      
      // Simple word wrapping algorithm
      const words = text.split(/\s+/);
      const lines: string[] = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        
        // Estimate text width (this is approximate - in production you'd use actual font metrics)
        const estimatedWidth = this.estimateTextWidth(testLine, fontSize, fontFamily);
        
        if (estimatedWidth <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            // Word is too long for one line, break it
            lines.push(word);
          }
        }
      }
      
      if (currentLine) {
        lines.push(currentLine);
      }

      const layout: TextLayout = {
        lines,
        lineHeight,
        totalHeight: lines.length * lineHeight,
        wordCount: words.length
      };

      // Cache the result
      this.textCache.set(cacheKey, layout);
      
      return layout;

    } catch (error) {
      console.error('Text layout calculation failed:', error);
      return {
        lines: [text],
        lineHeight: fontSize * PDF_CONSTANTS.DEFAULT_LINE_HEIGHT,
        totalHeight: fontSize * PDF_CONSTANTS.DEFAULT_LINE_HEIGHT,
        wordCount: text.split(/\s+/).length
      };
    }
  }

  applyTextAlignment(alignment: "left" | "center" | "right"): StyleObject {
    const textAlign = alignment === "left" ? "left" : 
                     alignment === "center" ? "center" : "right";
    
    return {
      fontFamily: PDF_CONSTANTS.DEFAULT_FONT_FAMILY,
      fontSize: PDF_CONSTANTS.DEFAULT_FONT_SIZE,
      color: PDF_CONSTANTS.DEFAULT_TEXT_COLOR,
      textAlign,
      lineHeight: PDF_CONSTANTS.DEFAULT_LINE_HEIGHT
    };
  }

  formatText(text: string, listType: "none" | "bullet" | "numbered" = "none"): string[] {
    if (!text) return [];

    const lines = text.split('\n').filter(line => line.trim());
    
    if (listType === "none") {
      return lines;
    }

    return lines.map((line, index) => {
      if (listType === "bullet") {
        return `• ${line}`;
      } else if (listType === "numbered") {
        return `${index + 1}. ${line}`;
      }
      return line;
    });
  }

  validateTextContent(text: string): boolean {
    if (typeof text !== 'string') {
      return false;
    }

    // Check for reasonable length
    if (text.length > 10000) {
      return false;
    }

    // Check for valid characters (basic validation)
    const validPattern = /^[\x20-\x7E\xA0-\xFF\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\u2C60-\u2C7F\uA720-\uA7FF\uFB00-\uFB4F]*$/;
    return validPattern.test(text);
  }

  truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) {
      return text;
    }

    // Try to truncate at word boundary
    const truncated = text.substring(0, maxLength - 3);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    if (lastSpaceIndex > maxLength * 0.8) {
      return truncated.substring(0, lastSpaceIndex) + '...';
    }
    
    return truncated + '...';
  }

  private estimateTextWidth(text: string, fontSize: number, fontFamily: string): number {
    // This is a very rough estimation
    // In production, you'd use actual font metrics or a library like opentype.js
    
    // Average character width estimation (varies by font)
    const avgCharWidth = fontSize * 0.6; // Rough estimate for most fonts
    
    // Adjust for font family (very approximate)
    let widthMultiplier = 1.0;
    if (fontFamily.includes('Arial') || fontFamily.includes('Helvetica')) {
      widthMultiplier = 0.9;
    } else if (fontFamily.includes('Times') || fontFamily.includes('Serif')) {
      widthMultiplier = 1.1;
    } else if (fontFamily.includes('Inter')) {
      widthMultiplier = 0.95;
    }
    
    return text.length * avgCharWidth * widthMultiplier;
  }

  // Clear cache to free memory
  clearCache(): void {
    this.textCache.clear();
  }

  // Get cache statistics
  getCacheStats(): { entries: number } {
    return {
      entries: this.textCache.size
    };
  }
}

// Export singleton instance
export const textProcessor = new PDFTextProcessor();

// Helper function to create text style object
export function createTextStyle(
  fontSize: number,
  color: string = PDF_CONSTANTS.DEFAULT_TEXT_COLOR,
  fontFamily: string = PDF_CONSTANTS.DEFAULT_FONT_FAMILY,
  alignment: "left" | "center" | "right" = "left",
  lineHeight?: number
): StyleObject {
  return {
    fontFamily: getFontWithFallback(fontFamily),
    fontSize: Math.max(PDF_CONSTANTS.MIN_FONT_SIZE, Math.min(PDF_CONSTANTS.MAX_FONT_SIZE, fontSize)),
    color,
    textAlign: alignment,
    lineHeight: lineHeight || PDF_CONSTANTS.DEFAULT_LINE_HEIGHT
  };
}

// Helper function to process text with list formatting
export function processTextWithListFormatting(
  text: string,
  listType: "none" | "bullet" | "numbered" = "none",
  fontSize: number = PDF_CONSTANTS.DEFAULT_FONT_SIZE
): { lines: string[]; layout: TextLayout } {
  const formattedLines = textProcessor.formatText(text, listType);
  const layout = textProcessor.calculateTextLayout(
    formattedLines.join('\n'),
    fontSize,
    500 // Default max width, will be overridden by actual container width
  );
  
  return {
    lines: formattedLines,
    layout
  };
}
