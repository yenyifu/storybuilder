# PDF Export Implementation

This document describes the implemented PDF export functionality for the StoryBuilder application.

## Overview

The PDF export system generates two types of PDFs:
1. **Internal Pages PDF**: Contains all pages from title page to ending page
2. **Cover PDF**: Contains front cover, spine, and back cover in a single spread

## Architecture

### Shared Infrastructure

The implementation follows the technical specification with shared components:

```
lib/pdf/
├── types.ts                 # Common type definitions
├── constants.ts             # PDF constants and configurations
├── fonts.ts                 # Font management
├── utils/
│   ├── imageProcessor.ts    # Image processing utilities
│   ├── textProcessor.ts     # Text processing utilities
│   └── coordinateConverter.ts # Coordinate conversion
├── renderers/
│   ├── TextBlockRenderer.tsx # Text block rendering
│   ├── ImageBlockRenderer.tsx # Image block rendering
│   └── index.ts
├── internalPagesExporter.ts # Internal pages PDF generation
├── cover/
│   ├── spineCalculator.ts   # Spine width calculation
│   └── coverExporter.ts     # Cover PDF generation
└── index.ts                 # Main export functions
```

### Key Features

#### 1. Page Specifications
- **Format**: A5 Landscape (154mm x 216mm)
- **Bleed margins**: 3mm on all sides
- **Safe area**: 5mm from trim edge
- **Coordinate conversion**: Screen (720x540) to PDF (595.28x834.33 points)

#### 2. Spine Width Calculation
- **Formula**: `(# of Interior Pages / 17.48) + 1.524 mm`
- **Dynamic calculation** based on actual page count
- **Validation** for minimum and maximum spine widths

#### 3. Font Management
- **Primary font**: Inter
- **Fallback fonts**: Arial, Times New Roman
- **Automatic font registration** for PDF rendering
- **Font mapping** from screen fonts to PDF fonts

#### 4. Image Processing
- **Image optimization** for different quality levels
- **Format conversion** (JPEG/PNG)
- **Size optimization** based on quality settings
- **Caching** for performance

## Usage

### Basic Usage

```typescript
import { exportBothPDFs, exportInternalPages, exportCover } from '@/lib/pdf';

// Export both PDFs
const result = await exportBothPDFs({
  layout: bookLayout,
  quality: 'medium',
  includePageNumbers: true,
  includeSpineText: true,
});

if (result.success) {
  // Download PDFs
  downloadBothPDFs(result.internalPagesPdf!, result.coverPdf!, 'story');
}
```

### Individual Exports

```typescript
// Export internal pages only
const internalResult = await exportInternalPages({
  layout: bookLayout,
  quality: 'high',
  includePageNumbers: true,
});

// Export cover only
const coverResult = await exportCover({
  layout: bookLayout,
  interiorPageCount: 20,
  quality: 'high',
  includeSpineText: true,
  spineFontSize: 14,
});
```

### React Component

```tsx
import { PDFExportButton } from '@/components/pdf-export-button';

function MyComponent() {
  return (
    <PDFExportButton 
      variant="default" 
      size="md" 
    />
  );
}
```

## API Reference

### Export Functions

#### `exportBothPDFs(options: CombinedExportOptions)`
Exports both internal pages and cover PDFs.

**Options:**
- `layout: BookLayout` - The book layout to export
- `quality?: 'low' | 'medium' | 'high'` - PDF quality (default: 'medium')
- `includePageNumbers?: boolean` - Include page numbers (default: true)
- `includeSpineText?: boolean` - Include spine text (default: true)
- `spineTextColor?: string` - Spine text color (default: '#000000')
- `spineFontSize?: number` - Spine font size (default: 12)
- `watermark?: string` - Optional watermark text

**Returns:**
```typescript
{
  success: boolean;
  internalPagesPdf?: Blob;
  coverPdf?: Blob;
  error?: string;
  internalPageCount?: number;
  coverSpineWidth?: number;
  coverTotalWidth?: number;
}
```

#### `exportInternalPages(options: InternalPagesExportOptions)`
Exports internal pages PDF only.

#### `exportCover(options: CoverExportOptions)`
Exports cover PDF only.

### Utility Functions

#### `calculateSpineWidth(interiorPageCount: number): number`
Calculates spine width in points based on page count.

#### `downloadPDF(pdfBlob: Blob, filename: string): void`
Downloads a PDF blob with the specified filename.

#### `downloadBothPDFs(internalPdf: Blob, coverPdf: Blob, baseFilename?: string): void`
Downloads both PDFs with appropriate filenames.

## Configuration

### Quality Settings

```typescript
const QUALITY_SETTINGS = {
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
};
```

### Page Dimensions

```typescript
const PAGE_DIMENSIONS = {
  width: 595.28,    // 154mm in points
  height: 834.33,   // 216mm in points
  bleedMargin: 8.5, // 3mm in points
  safeMargin: 14.2  // 5mm in points
};
```

## Testing

A test page is available at `/pdf-test` to verify the PDF export functionality:

1. **Create Test Layout**: Generates a sample book layout
2. **Test Individual Exports**: Test internal pages and cover exports separately
3. **Test Combined Export**: Test both exports together
4. **View Results**: See detailed test results and timing

## Error Handling

The system includes comprehensive error handling:

- **Input validation**: Validates layout, page count, and options
- **Font loading errors**: Falls back to system fonts
- **Image processing errors**: Continues with original images
- **PDF generation errors**: Returns detailed error messages
- **Timeout handling**: Prevents hanging on large documents

## Performance Considerations

- **Image caching**: Processed images are cached for reuse
- **Font caching**: Font registrations are cached
- **Memory management**: Large images are processed in chunks
- **Timeout limits**: Configurable timeouts for processing
- **Quality settings**: Different quality levels for different use cases

## Dependencies

```json
{
  "@react-pdf/renderer": "^3.1.14",
  "@radix-ui/react-checkbox": "^1.0.4",
  "@radix-ui/react-select": "^2.0.0",
  "sharp": "^0.32.6"
}
```

## Future Enhancements

1. **Custom page sizes**: Support for different book formats
2. **Advanced typography**: Better text layout and hyphenation
3. **Interactive elements**: Support for hyperlinks and bookmarks
4. **Batch processing**: Export multiple books simultaneously
5. **Cloud integration**: Direct upload to printing services
6. **Preview generation**: Generate preview images before export
7. **Template system**: Pre-designed cover and page templates

## Troubleshooting

### Common Issues

1. **Font not loading**: Check font URLs and fallback to system fonts
2. **Large file sizes**: Use lower quality settings or optimize images
3. **Slow generation**: Check image sizes and use appropriate quality settings
4. **Layout issues**: Verify coordinate conversion and page dimensions

### Debug Mode

Enable debug logging by setting the environment variable:
```bash
DEBUG_PDF_EXPORT=true
```

This will log detailed information about the export process, including:
- Font registration status
- Image processing steps
- Coordinate conversions
- PDF generation progress
