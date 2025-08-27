import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { PDFBlock, StyleObject } from '../types';
import { coordinateConverter } from '../utils/coordinateConverter';
import { textProcessor, createTextStyle } from '../utils/textProcessor';
import { getFontWithFallback } from '../fonts';

interface TextBlockRendererProps {
  block: PDFBlock;
  pageConfig: any;
}

export function TextBlockRenderer({ block, pageConfig }: TextBlockRendererProps) {
  if (block.type !== 'text' || !block.text) {
    return null;
  }

  // Convert coordinates
  const pdfCoords = coordinateConverter.convertPoint({ x: block.x, y: block.y });
  const pdfDimensions = coordinateConverter.convertDimensions({ 
    width: block.w, 
    height: block.h 
  });
  const pdfFontSize = coordinateConverter.convertFontSize(block.fontSize || 22);

  // Create text style
  const textStyle = createTextStyle(
    pdfFontSize,
    block.color || '#1f2937',
    block.fontFamily || 'Inter',
    block.align || 'left',
    block.backgroundColor ? 1.4 : 1.2
  );

  // Calculate text layout
  const textLayout = textProcessor.calculateTextLayout(
    block.text,
    pdfFontSize,
    pdfDimensions.width - 10, // Leave some padding
    textStyle.fontFamily
  );

  // Format text based on list type
  const formattedLines = textProcessor.formatText(block.text, block.listType);

  // Create background if specified
  const backgroundStyle = block.backgroundColor ? {
    backgroundColor: block.backgroundColor,
    opacity: block.backgroundOpacity || 1,
    padding: 5,
    borderRadius: 3,
  } : {};

  return (
    <View
      style={{
        position: 'absolute',
        left: pdfCoords.x,
        top: pdfCoords.y,
        width: pdfDimensions.width,
        height: pdfDimensions.height,
        ...backgroundStyle,
      }}
    >
      {formattedLines.map((line, index) => (
        <Text
          key={`${block.id}-line-${index}`}
          style={{
            fontFamily: textStyle.fontFamily,
            fontSize: textStyle.fontSize,
            color: textStyle.color,
            textAlign: textStyle.textAlign,
            lineHeight: textStyle.lineHeight,
            marginBottom: index < formattedLines.length - 1 ? 2 : 0,
          }}
        >
          {line}
        </Text>
      ))}
    </View>
  );
}

// Helper function to render text block with custom styling
export function renderTextBlock(
  block: PDFBlock,
  pageConfig: any,
  customStyle?: Partial<StyleObject>
): React.ReactElement | null {
  if (block.type !== 'text' || !block.text) {
    return null;
  }

  // Convert coordinates
  const pdfCoords = coordinateConverter.convertPoint({ x: block.x, y: block.y });
  const pdfDimensions = coordinateConverter.convertDimensions({ 
    width: block.w, 
    height: block.h 
  });
  const pdfFontSize = coordinateConverter.convertFontSize(block.fontSize || 22);

  // Create text style with custom overrides
  const textStyle = createTextStyle(
    pdfFontSize,
    block.color || '#1f2937',
    block.fontFamily || 'Inter',
    block.align || 'left',
    block.backgroundColor ? 1.4 : 1.2
  );

  // Apply custom style overrides
  const finalStyle = { ...textStyle, ...customStyle };

  // Format text
  const formattedLines = textProcessor.formatText(block.text, block.listType);

  // Create background if specified
  const backgroundStyle = block.backgroundColor ? {
    backgroundColor: block.backgroundColor,
    opacity: block.backgroundOpacity || 1,
    padding: 5,
    borderRadius: 3,
  } : {};

  return (
    <View
      style={{
        position: 'absolute',
        left: pdfCoords.x,
        top: pdfCoords.y,
        width: pdfDimensions.width,
        height: pdfDimensions.height,
        ...backgroundStyle,
      }}
    >
      {formattedLines.map((line, index) => (
        <Text
          key={`${block.id}-line-${index}`}
          style={{
            fontFamily: finalStyle.fontFamily,
            fontSize: finalStyle.fontSize,
            color: finalStyle.color,
            textAlign: finalStyle.textAlign,
            lineHeight: finalStyle.lineHeight,
            marginBottom: index < formattedLines.length - 1 ? 2 : 0,
          }}
        >
          {line}
        </Text>
      ))}
    </View>
  );
}
