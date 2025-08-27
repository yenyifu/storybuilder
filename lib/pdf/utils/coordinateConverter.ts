import { Point, Dimensions, Bounds } from '../types';
import { PDF_CONSTANTS } from '../constants';

export interface CoordinateConverter {
  convertX(screenX: number): number;
  convertY(screenY: number): number;
  convertWidth(screenWidth: number): number;
  convertHeight(screenHeight: number): number;
  convertFontSize(screenFontSize: number): number;
  convertPoint(screenPoint: Point): Point;
  convertDimensions(screenDimensions: Dimensions): Dimensions;
  convertBounds(screenBounds: Bounds): Bounds;
}

class PDFCoordinateConverter implements CoordinateConverter {
  private xRatio: number;
  private yRatio: number;
  private fontSizeScale: number;

  constructor() {
    this.xRatio = PDF_CONSTANTS.SCREEN_TO_PDF_X_RATIO;
    this.yRatio = PDF_CONSTANTS.SCREEN_TO_PDF_Y_RATIO;
    this.fontSizeScale = PDF_CONSTANTS.FONT_SIZE_SCALE_FACTOR;
  }

  convertX(screenX: number): number {
    return Math.max(0, screenX * this.xRatio);
  }

  convertY(screenY: number): number {
    return Math.max(0, screenY * this.yRatio);
  }

  convertWidth(screenWidth: number): number {
    return Math.max(1, screenWidth * this.xRatio);
  }

  convertHeight(screenHeight: number): number {
    return Math.max(1, screenHeight * this.yRatio);
  }

  convertFontSize(screenFontSize: number): number {
    const convertedSize = screenFontSize * this.fontSizeScale;
    return Math.max(
      PDF_CONSTANTS.MIN_FONT_SIZE, 
      Math.min(PDF_CONSTANTS.MAX_FONT_SIZE, convertedSize)
    );
  }

  convertPoint(screenPoint: Point): Point {
    return {
      x: this.convertX(screenPoint.x),
      y: this.convertY(screenPoint.y)
    };
  }

  convertDimensions(screenDimensions: Dimensions): Dimensions {
    return {
      width: this.convertWidth(screenDimensions.width),
      height: this.convertHeight(screenDimensions.height)
    };
  }

  convertBounds(screenBounds: Bounds): Bounds {
    return {
      x: this.convertX(screenBounds.x),
      y: this.convertY(screenBounds.y),
      width: this.convertWidth(screenBounds.width),
      height: this.convertHeight(screenBounds.height)
    };
  }

  // Validate if converted coordinates are within PDF page bounds
  validateCoordinates(point: Point, dimensions: Dimensions): boolean {
    const maxX = PDF_CONSTANTS.PAGE_WIDTH_POINTS - dimensions.width;
    const maxY = PDF_CONSTANTS.PAGE_HEIGHT_POINTS - dimensions.height;
    
    return point.x >= 0 && point.x <= maxX && 
           point.y >= 0 && point.y <= maxY;
  }

  // Get safe area bounds
  getSafeAreaBounds(): Bounds {
    return {
      x: PDF_CONSTANTS.SAFE_MARGIN_POINTS,
      y: PDF_CONSTANTS.SAFE_MARGIN_POINTS,
      width: PDF_CONSTANTS.PAGE_WIDTH_POINTS - (PDF_CONSTANTS.SAFE_MARGIN_POINTS * 2),
      height: PDF_CONSTANTS.PAGE_HEIGHT_POINTS - (PDF_CONSTANTS.SAFE_MARGIN_POINTS * 2)
    };
  }

  // Check if point is within safe area
  isWithinSafeArea(point: Point, dimensions: Dimensions): boolean {
    const safeArea = this.getSafeAreaBounds();
    const maxX = safeArea.x + safeArea.width - dimensions.width;
    const maxY = safeArea.y + safeArea.height - dimensions.height;
    
    return point.x >= safeArea.x && point.x <= maxX && 
           point.y >= safeArea.y && point.y <= maxY;
  }
}

// Export singleton instance
export const coordinateConverter = new PDFCoordinateConverter();

// Helper function to convert screen coordinates to PDF coordinates
export function convertScreenToPDF(
  screenX: number,
  screenY: number,
  screenWidth: number,
  screenHeight: number,
  screenFontSize: number
): {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
} {
  return {
    x: coordinateConverter.convertX(screenX),
    y: coordinateConverter.convertY(screenY),
    width: coordinateConverter.convertWidth(screenWidth),
    height: coordinateConverter.convertHeight(screenHeight),
    fontSize: coordinateConverter.convertFontSize(screenFontSize)
  };
}

// Helper function to validate converted coordinates
export function validatePDFCoordinates(
  x: number,
  y: number,
  width: number,
  height: number
): boolean {
  return coordinateConverter.validateCoordinates(
    { x, y },
    { width, height }
  );
}
