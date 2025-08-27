import React from 'react';
import { Image, View } from '@react-pdf/renderer';
import { PDFBlock, TransformMatrix } from '../types';
import { coordinateConverter } from '../utils/coordinateConverter';
import { imageProcessor } from '../utils/imageProcessor';

interface ImageBlockRendererProps {
  block: PDFBlock;
  pageConfig: any;
  quality?: 'low' | 'medium' | 'high';
}

export function ImageBlockRenderer({ block, pageConfig, quality = 'medium' }: ImageBlockRendererProps) {
  if (block.type !== 'image' || !block.image) {
    return null;
  }

  // Convert coordinates
  const pdfCoords = coordinateConverter.convertPoint({ x: block.x, y: block.y });
  const pdfDimensions = coordinateConverter.convertDimensions({ 
    width: block.w, 
    height: block.h 
  });

  // Calculate image transform
  const transform = calculateImageTransform(block);

  // Create image style with transform
  const imageStyle = {
    position: 'absolute' as const,
    left: pdfCoords.x + (transform.translateX || 0),
    top: pdfCoords.y + (transform.translateY || 0),
    width: pdfDimensions.width * (transform.scaleX || 1),
    height: pdfDimensions.height * (transform.scaleY || 1),
  };

  return (
    <View style={imageStyle}>
      <Image
        src={block.image}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </View>
  );
}

// Helper function to calculate image transform
function calculateImageTransform(block: PDFBlock): TransformMatrix {
  const zoom = block.zoom || 1;
  const offsetX = block.offsetX || 0;
  const offsetY = block.offsetY || 0;

  return {
    scaleX: Math.max(0.1, Math.min(3, zoom)),
    scaleY: Math.max(0.1, Math.min(3, zoom)),
    translateX: offsetX,
    translateY: offsetY,
    rotation: 0, // Could be extended to support rotation
  };
}

// Helper function to render image block with custom styling
export function renderImageBlock(
  block: PDFBlock,
  pageConfig: any,
  quality: 'low' | 'medium' | 'high' = 'medium',
  customStyle?: any
): React.ReactElement | null {
  if (block.type !== 'image' || !block.image) {
    return null;
  }

  // Convert coordinates
  const pdfCoords = coordinateConverter.convertPoint({ x: block.x, y: block.y });
  const pdfDimensions = coordinateConverter.convertDimensions({ 
    width: block.w, 
    height: block.h 
  });

  // Calculate image transform
  const transform = calculateImageTransform(block);

  // Create image style with transform and custom overrides
  const imageStyle = {
    position: 'absolute' as const,
    left: pdfCoords.x + (transform.translateX || 0),
    top: pdfCoords.y + (transform.translateY || 0),
    width: pdfDimensions.width * (transform.scaleX || 1),
    height: pdfDimensions.height * (transform.scaleY || 1),
    ...customStyle,
  };

  return (
    <View style={imageStyle}>
      <Image
        src={block.image}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </View>
  );
}

// Helper function to process image for PDF
export async function processImageForPDF(
  imageUrl: string,
  quality: 'low' | 'medium' | 'high' = 'medium'
): Promise<string> {
  try {
    return await imageProcessor.processImageForPDF(imageUrl, quality);
  } catch (error) {
    console.error('Failed to process image for PDF:', error);
    // Return original URL if processing fails
    return imageUrl;
  }
}

// Helper function to validate image block
export function validateImageBlock(block: PDFBlock): boolean {
  if (block.type !== 'image') {
    return false;
  }

  if (!block.image) {
    return false;
  }

  // Validate zoom range
  if (block.zoom && (block.zoom < 0.1 || block.zoom > 3)) {
    return false;
  }

  // Validate dimensions
  if (block.w <= 0 || block.h <= 0) {
    return false;
  }

  return true;
}
