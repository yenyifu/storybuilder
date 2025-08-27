import type { PageBlock, PageContent, BookLayout } from "@/lib/layout-types";

// Common PDF configuration
export interface PDFPageConfig {
  width: number;
  height: number;
  bleedMargin: number;
  safeMargin: number;
  contentArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// Common PDF block (converted from PageBlock)
export interface PDFBlock {
  id: string;
  type: "text" | "image";
  x: number;
  y: number;
  w: number;
  h: number;
  z?: number;
  
  // Text properties
  text?: string;
  fontSize?: number;
  align?: "left" | "center" | "right";
  color?: string;
  fontFamily?: string;
  listType?: "none" | "bullet" | "numbered";
  backgroundColor?: string;
  backgroundOpacity?: number;
  
  // Image properties
  image?: string | null;
  zoom?: number;
  offsetX?: number;
  offsetY?: number;
}

// Common export options
export interface BaseExportOptions {
  layout: BookLayout;
  quality?: 'low' | 'medium' | 'high';
  watermark?: string;
}

// Common export result
export interface ExportResult {
  success: boolean;
  pdfBlob?: Blob;
  error?: string;
  pageCount?: number;
}

// Coordinate conversion utilities
export interface Point {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Text layout information
export interface TextLayout {
  lines: string[];
  lineHeight: number;
  totalHeight: number;
  wordCount: number;
}

// Processed image data
export interface ProcessedImage {
  data: string;
  width: number;
  height: number;
  format: 'JPEG' | 'PNG';
  size: number;
}

// Transform matrix for image positioning
export interface TransformMatrix {
  scaleX: number;
  scaleY: number;
  translateX: number;
  translateY: number;
  rotation: number;
}

// Style object for text rendering
export interface StyleObject {
  fontFamily: string;
  fontSize: number;
  color: string;
  textAlign: string;
  lineHeight?: number;
  fontWeight?: string;
  fontStyle?: string;
}
