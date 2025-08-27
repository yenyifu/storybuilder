import { Font } from '@react-pdf/renderer';
import { PDF_CONSTANTS } from './constants';

export interface FontManager {
  registerFonts(): Promise<void>;
  getPDFFont(fontFamily: string): string;
  getFontFallback(fontFamily: string): string[];
  isFontRegistered(fontFamily: string): boolean;
}

class PDFFontManager implements FontManager {
  private registeredFonts: Set<string> = new Set();
  private fontMapping: Map<string, string> = new Map();

  async registerFonts(): Promise<void> {
    try {
      // Register Inter font (primary)
      Font.register({
        family: 'Inter',
        fonts: [
          {
            src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
            fontWeight: 'normal',
          },
          {
            src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
            fontWeight: 'bold',
          },
        ],
      });

      // Register Arial as fallback
      Font.register({
        family: 'Arial',
        fonts: [
          {
            src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2',
            fontWeight: 'normal',
          },
          {
            src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4.woff2',
            fontWeight: 'bold',
          },
        ],
      });

      // Register Times New Roman as fallback
      Font.register({
        family: 'Times New Roman',
        fonts: [
          {
            src: 'https://fonts.gstatic.com/s/robotoslab/v24/BngbUXZYTXPIvIBgJJSb6s3BzlRRfKOFbvjojISWaA.woff2',
            fontWeight: 'normal',
          },
          {
            src: 'https://fonts.gstatic.com/s/robotoslab/v24/BngbUXZYTXPIvIBgJJSb6s3BzlRRfKOFbvjojISWaA.woff2',
            fontWeight: 'bold',
          },
        ],
      });

      // Mark fonts as registered
      this.registeredFonts.add('Inter');
      this.registeredFonts.add('Arial');
      this.registeredFonts.add('Times New Roman');
      this.registeredFonts.add('Helvetica');
      this.registeredFonts.add('sans-serif');

      // Set up font mapping
      this.fontMapping.set('Inter, ui-sans-serif, system-ui, Arial', 'Inter');
      this.fontMapping.set('Inter', 'Inter');
      this.fontMapping.set('Arial', 'Arial');
      this.fontMapping.set('Times New Roman', 'Times New Roman');
      this.fontMapping.set('Helvetica', 'Helvetica');
      this.fontMapping.set('sans-serif', 'Arial');

    } catch (error) {
      console.error('Failed to register fonts:', error);
      throw new Error('Font registration failed');
    }
  }

  getPDFFont(fontFamily: string): string {
    // Check if we have a direct mapping
    if (this.fontMapping.has(fontFamily)) {
      return this.fontMapping.get(fontFamily)!;
    }

    // Check if the font family is registered
    if (this.registeredFonts.has(fontFamily)) {
      return fontFamily;
    }

    // Try to extract the first font from a font stack
    const firstFont = fontFamily.split(',')[0]?.trim().replace(/['"]/g, '');
    if (firstFont && this.registeredFonts.has(firstFont)) {
      return firstFont;
    }

    // Return default font
    return PDF_CONSTANTS.DEFAULT_FONT_FAMILY;
  }

  getFontFallback(fontFamily: string): string[] {
    const primaryFont = this.getPDFFont(fontFamily);
    const fallbacks = PDF_CONSTANTS.FONT_FALLBACKS.filter(
      fallback => fallback !== primaryFont
    );
    return [primaryFont, ...fallbacks];
  }

  isFontRegistered(fontFamily: string): boolean {
    return this.registeredFonts.has(fontFamily);
  }
}

// Export singleton instance
export const fontManager = new PDFFontManager();

// Helper function to get font with fallback
export function getFontWithFallback(fontFamily: string): string {
  return fontManager.getPDFFont(fontFamily);
}

// Helper function to validate font family
export function validateFontFamily(fontFamily: string): boolean {
  return fontManager.isFontRegistered(fontFamily) || 
         fontManager.getPDFFont(fontFamily) !== PDF_CONSTANTS.DEFAULT_FONT_FAMILY;
}
