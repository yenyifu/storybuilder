# PDF Export Technical Specification - Internal Pages

## Overview
This document outlines the technical implementation for generating PDF exports of internal book pages (title page through ending page) for the StoryBuilder application. The PDF will be formatted for A5 landscape printing with proper bleed margins.

## Requirements

### Page Specifications
- **Format**: A5 Landscape
- **Dimensions with bleed**: 154mm x 216mm (595.28 x 834.33 points)
- **Dimensions without bleed**: 148mm x 210mm (559.37 x 793.70 points)
- **Bleed margin**: 3mm on all sides
- **Safe area**: 5mm margin from trim edge

### Content Requirements
- Export all internal pages from title page to ending page
- Maintain exact positioning and styling of text and image blocks
- Preserve font families, sizes, colors, and alignment
- Handle image positioning, zoom, and offset
- Support both text and image blocks
- Maintain proper page numbering

## Technical Architecture

### 1. PDF Generation Library
**Recommended**: `@react-pdf/renderer` or `jsPDF`
- **Primary choice**: `@react-pdf/renderer` for better layout control and React-like syntax
- **Alternative**: `jsPDF` if more direct PDF manipulation is needed

### 2. Core Components Structure

```
lib/pdf/
├── types.ts                 # PDF-specific type definitions
├── constants.ts             # Page dimensions, margins, etc.
├── fonts.ts                 # Font registration and management
├── renderers/
│   ├── PageRenderer.tsx     # Individual page rendering
│   ├── TextBlockRenderer.tsx # Text block rendering
│   ├── ImageBlockRenderer.tsx # Image block rendering
│   └── index.ts
├── utils/
│   ├── coordinateConverter.ts # Convert screen coordinates to PDF coordinates
│   ├── imageProcessor.ts    # Image processing and optimization
│   └── textProcessor.ts     # Text formatting and line breaking
└── internalPagesExporter.ts # Main export function
```

### 3. Data Flow

```
BookLayout → Page Flattener → PDF Document Builder → PDF Generator → File Download
```

## Implementation Details

### 1. Coordinate System Conversion

**Screen to PDF Coordinate Mapping**:
```typescript
interface CoordinateConverter {
  // Convert screen coordinates (720x540) to PDF coordinates (595.28x834.33)
  convertX(screenX: number): number;
  convertY(screenY: number): number;
  convertWidth(screenWidth: number): number;
  convertHeight(screenHeight: number): number;
  convertFontSize(screenFontSize: number): number;
}
```

**Conversion Ratios**:
- X-axis: 595.28 / 720 = 0.8268
- Y-axis: 834.33 / 540 = 1.5451
- Font size: Scale factor of 0.8 (for better PDF readability)

### 2. Page Structure

**PDF Page Layout**:
```typescript
interface PDFPageConfig {
  width: number;        // 595.28 points (154mm)
  height: number;       // 834.33 points (216mm)
  bleedMargin: number;  // 3mm = 8.5 points
  safeMargin: number;   // 5mm = 14.2 points
  contentArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
```

### 3. Block Rendering Strategy

**Text Block Rendering**:
```typescript
interface TextBlockRenderer {
  render(block: PageBlock, pageConfig: PDFPageConfig): JSX.Element;
  
  // Handle text wrapping and line breaking
  calculateTextLayout(text: string, fontSize: number, maxWidth: number): TextLayout;
  
  // Support for different text alignments
  applyTextAlignment(alignment: "left" | "center" | "right"): StyleObject;
}
```

**Image Block Rendering**:
```typescript
interface ImageBlockRenderer {
  render(block: PageBlock, pageConfig: PDFPageConfig): JSX.Element;
  
  // Process and optimize images for PDF
  processImage(imageUrl: string): Promise<ProcessedImage>;
  
  // Handle image positioning and zoom
  calculateImageTransform(block: PageBlock): TransformMatrix;
}
```

### 4. Font Management

**Font Registration**:
```typescript
interface FontManager {
  // Register fonts for PDF rendering
  registerFonts(): Promise<void>;
  
  // Map screen fonts to PDF fonts
  getPDFFont(fontFamily: string): string;
  
  // Handle font fallbacks
  getFontFallback(fontFamily: string): string[];
}
```

**Supported Fonts**:
- Inter (primary)
- Arial (fallback)
- Times New Roman (fallback)
- Custom fonts (if needed)

### 5. Image Processing

**Image Optimization**:
```typescript
interface ImageProcessor {
  // Convert image URLs to base64 or blob
  processImageForPDF(imageUrl: string): Promise<string>;
  
  // Resize images to fit PDF constraints
  resizeImage(imageData: string, maxWidth: number, maxHeight: number): Promise<string>;
  
  // Handle different image formats
  convertImageFormat(imageData: string, format: 'JPEG' | 'PNG'): Promise<string>;
}
```

## API Design

### Main Export Function

```typescript
interface InternalPagesExportOptions {
  layout: BookLayout;
  quality?: 'low' | 'medium' | 'high';
  includePageNumbers?: boolean;
  watermark?: string;
}

interface ExportResult {
  success: boolean;
  pdfBlob?: Blob;
  error?: string;
  pageCount?: number;
}

async function exportInternalPages(
  options: InternalPagesExportOptions
): Promise<ExportResult>
```

### Usage Example

```typescript
import { exportInternalPages } from '@/lib/pdf/internalPagesExporter';

const handleExport = async () => {
  const result = await exportInternalPages({
    layout: bookLayout,
    quality: 'high',
    includePageNumbers: true
  });
  
  if (result.success && result.pdfBlob) {
    // Create download link
    const url = URL.createObjectURL(result.pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'story-internal-pages.pdf';
    link.click();
    URL.revokeObjectURL(url);
  }
};
```

## Page Flattening Algorithm

### 1. Page Order Determination

```typescript
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
```

### 2. Block Processing

```typescript
function processBlocks(blocks: PageBlock[], pageConfig: PDFPageConfig): PDFBlock[] {
  return blocks
    .sort((a, b) => (a.z || 0) - (b.z || 0)) // Sort by z-index
    .map(block => ({
      ...block,
      x: convertX(block.x),
      y: convertY(block.y),
      w: convertWidth(block.w),
      h: convertHeight(block.h),
      fontSize: convertFontSize(block.fontSize || 22)
    }));
}
```

## Error Handling

### 1. Image Loading Errors
- Fallback to placeholder image
- Log error for debugging
- Continue with text-only rendering

### 2. Font Loading Errors
- Use system fallback fonts
- Maintain layout integrity
- Warn user about font substitution

### 3. Memory Management
- Process images in chunks
- Clean up temporary resources
- Implement timeout for large documents

## Performance Considerations

### 1. Image Optimization
- Compress images before PDF generation
- Use appropriate image formats (JPEG for photos, PNG for graphics)
- Implement lazy loading for large documents

### 2. Memory Usage
- Process pages sequentially rather than all at once
- Clean up image data after processing
- Implement pagination for very large documents

### 3. Caching
- Cache processed images
- Cache font registrations
- Implement result caching for repeated exports

## Testing Strategy

### 1. Unit Tests
- Coordinate conversion accuracy
- Text layout calculations
- Image processing functions
- Font mapping logic

### 2. Integration Tests
- End-to-end PDF generation
- Different book layouts
- Various content types
- Error scenarios

### 3. Visual Regression Tests
- Compare generated PDFs with expected outputs
- Test different page configurations
- Verify layout consistency

## Dependencies

### Required Packages
```json
{
  "@react-pdf/renderer": "^3.1.14",
  "react-pdf": "^7.5.1",
  "canvas": "^2.11.2",
  "jsdom": "^22.1.0"
}
```

### Optional Packages
```json
{
  "sharp": "^0.32.6",
  "jimp": "^0.22.10"
}
```

## Implementation Phases

### Phase 1: Core Infrastructure
1. Set up PDF generation library
2. Implement coordinate conversion system
3. Create basic page rendering structure
4. Add font management

### Phase 2: Content Rendering
1. Implement text block rendering
2. Implement image block rendering
3. Add text layout and wrapping
4. Handle image positioning and zoom

### Phase 3: Page Management
1. Implement page flattening algorithm
2. Add page numbering
3. Handle different page types (title, spread, ending)
4. Implement proper page ordering

### Phase 4: Optimization & Polish
1. Add image optimization
2. Implement error handling
3. Add performance optimizations
4. Create comprehensive tests

## Success Criteria

1. **Accuracy**: Generated PDF matches screen layout within 1mm tolerance
2. **Performance**: PDF generation completes within 30 seconds for 20-page books
3. **Quality**: Text is crisp and readable, images are properly positioned
4. **Compatibility**: PDF opens correctly in major PDF viewers
5. **Print Ready**: PDF meets commercial printing requirements

## Future Enhancements

1. **Custom Page Sizes**: Support for different book formats
2. **Advanced Typography**: Better text layout and hyphenation
3. **Interactive Elements**: Support for hyperlinks and bookmarks
4. **Batch Processing**: Export multiple books simultaneously
5. **Cloud Integration**: Direct upload to printing services

---

# PDF Export Technical Specification - Cover Page

## Overview
This document outlines the technical implementation for generating PDF exports of book covers for the StoryBuilder application. The cover PDF includes front cover, spine, and back cover in a single spread, with spine width calculated based on the number of internal pages.

## Requirements

### Cover Specifications
- **Format**: A5 Landscape with spine
- **Front/Back dimensions**: 154mm x 216mm (595.28 x 834.33 points) - same as internal pages
- **Spine width**: Calculated dynamically based on page count
- **Total width**: Front + Spine + Back + bleed margins
- **Height**: 216mm (834.33 points) with bleed
- **Bleed margin**: 3mm on all sides
- **Safe area**: 5mm margin from trim edge

### Spine Width Calculation
```typescript
function calculateSpineWidth(interiorPageCount: number): number {
  // Formula: (# of Interior Pages / 17.48) + 1.524 mm
  const spineWidthMm = (interiorPageCount / 17.48) + 1.524;
  return spineWidthMm * 2.83465; // Convert mm to points (1mm = 2.83465 points)
}
```

### Content Requirements
- Export cover page content (front, spine, back)
- Maintain exact positioning and styling of text and image blocks
- Preserve font families, sizes, colors, and alignment
- Handle image positioning, zoom, and offset
- Support both text and image blocks
- Include spine text (book title and author)
- Ensure proper alignment across the three sections

## Technical Architecture

### 1. Reused Components from Internal Pages
- **Font Management**: Same font registration and mapping system
- **Image Processing**: Same image optimization and conversion utilities
- **Coordinate Conversion**: Extended for cover-specific dimensions
- **Block Renderers**: Reused with cover-specific adaptations

### 2. Cover-Specific Components Structure

```
lib/pdf/cover/
├── types.ts                    # Cover-specific type definitions
├── constants.ts                # Cover dimensions and calculations
├── spineCalculator.ts          # Spine width calculation utilities
├── renderers/
│   ├── CoverRenderer.tsx       # Main cover spread rendering
│   ├── FrontCoverRenderer.tsx  # Front cover section
│   ├── SpineRenderer.tsx       # Spine section with text
│   ├── BackCoverRenderer.tsx   # Back cover section
│   └── index.ts
├── utils/
│   ├── coverCoordinateConverter.ts # Cover-specific coordinate conversion
│   └── spineTextLayout.ts      # Spine text positioning and layout
└── coverExporter.ts            # Main cover export function
```

### 3. Data Flow

```
BookLayout + Page Count → Spine Calculation → Cover Layout → PDF Generator → File Download
```

## Implementation Details

### 1. Cover Layout Structure

**Cover Dimensions**:
```typescript
interface CoverDimensions {
  frontWidth: number;     // 595.28 points (154mm)
  spineWidth: number;     // Calculated dynamically
  backWidth: number;      // 595.28 points (154mm)
  height: number;         // 834.33 points (216mm)
  totalWidth: number;     // Front + Spine + Back + bleed
  bleedMargin: number;    // 8.5 points (3mm)
  safeMargin: number;     // 14.2 points (5mm)
}
```

**Cover Sections**:
```typescript
interface CoverSection {
  type: 'front' | 'spine' | 'back';
  x: number;              // X position within the cover spread
  y: number;              // Y position (always 0)
  width: number;          // Section width
  height: number;         // Section height
  content: PageContent;   // Content for this section
}
```

### 2. Spine Width Calculation

**Calculation Implementation**:
```typescript
interface SpineCalculator {
  // Calculate spine width based on interior page count
  calculateSpineWidth(interiorPageCount: number): number;
  
  // Get total cover width including spine
  getTotalCoverWidth(interiorPageCount: number): number;
  
  // Validate spine width constraints
  validateSpineWidth(spineWidth: number): boolean;
}

class SpineCalculator {
  private static readonly PAGES_PER_MM = 17.48;
  private static readonly BASE_SPINE_MM = 1.524;
  private static readonly MM_TO_POINTS = 2.83465;
  
  calculateSpineWidth(interiorPageCount: number): number {
    const spineWidthMm = (interiorPageCount / this.PAGES_PER_MM) + this.BASE_SPINE_MM;
    return spineWidthMm * this.MM_TO_POINTS;
  }
  
  getTotalCoverWidth(interiorPageCount: number): number {
    const spineWidth = this.calculateSpineWidth(interiorPageCount);
    const frontBackWidth = 595.28 * 2; // Front + Back
    const bleedWidth = 8.5 * 2; // Left + Right bleed
    return frontBackWidth + spineWidth + bleedWidth;
  }
}
```

### 3. Cover Coordinate System

**Cover-Specific Coordinate Conversion**:
```typescript
interface CoverCoordinateConverter extends CoordinateConverter {
  // Convert screen coordinates to cover-specific PDF coordinates
  convertCoverX(screenX: number, section: 'front' | 'spine' | 'back'): number;
  convertCoverY(screenY: number): number;
  
  // Get section boundaries
  getSectionBounds(section: 'front' | 'spine' | 'back'): Bounds;
  
  // Check if coordinates are within section
  isWithinSection(x: number, y: number, section: 'front' | 'spine' | 'back'): boolean;
}
```

### 4. Spine Text Rendering

**Spine Text Layout**:
```typescript
interface SpineTextRenderer {
  // Render spine text (book title and author)
  renderSpineText(title: string, author: string, spineWidth: number): JSX.Element;
  
  // Calculate optimal font size for spine text
  calculateSpineFontSize(text: string, spineWidth: number): number;
  
  // Handle text rotation for spine
  applySpineTextRotation(text: string, spineWidth: number): TransformMatrix;
  
  // Position text within spine area
  positionSpineText(text: string, spineWidth: number): Position;
}
```

### 5. Cover Section Rendering

**Front Cover Renderer**:
```typescript
interface FrontCoverRenderer {
  render(content: PageContent, dimensions: CoverDimensions): JSX.Element;
  
  // Handle cover-specific layout adjustments
  adjustLayoutForCover(blocks: PageBlock[]): PageBlock[];
  
  // Ensure content fits within cover boundaries
  validateCoverContent(content: PageContent): boolean;
}
```

**Back Cover Renderer**:
```typescript
interface BackCoverRenderer {
  render(content: PageContent, dimensions: CoverDimensions): JSX.Element;
  
  // Handle back cover specific elements (ISBN, barcode, etc.)
  renderBackCoverElements(): JSX.Element;
}
```

## API Design

### Main Cover Export Function

```typescript
interface CoverExportOptions {
  layout: BookLayout;
  interiorPageCount: number;
  quality?: 'low' | 'medium' | 'high';
  includeSpineText?: boolean;
  spineTextColor?: string;
  spineFontSize?: number;
}

interface CoverExportResult {
  success: boolean;
  pdfBlob?: Blob;
  error?: string;
  spineWidth?: number;
  totalWidth?: number;
}

async function exportCover(
  options: CoverExportOptions
): Promise<CoverExportResult>
```

### Usage Example

```typescript
import { exportCover } from '@/lib/pdf/cover/coverExporter';

const handleCoverExport = async () => {
  const interiorPageCount = calculateInteriorPageCount(layout);
  
  const result = await exportCover({
    layout: bookLayout,
    interiorPageCount,
    quality: 'high',
    includeSpineText: true,
    spineTextColor: '#000000',
    spineFontSize: 12
  });
  
  if (result.success && result.pdfBlob) {
    const url = URL.createObjectURL(result.pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'story-cover.pdf';
    link.click();
    URL.revokeObjectURL(url);
  }
};
```

## Cover Layout Algorithm

### 1. Cover Structure Generation

```typescript
function generateCoverLayout(
  layout: BookLayout, 
  interiorPageCount: number
): CoverLayout {
  const spineCalculator = new SpineCalculator();
  const spineWidth = spineCalculator.calculateSpineWidth(interiorPageCount);
  const totalWidth = spineCalculator.getTotalCoverWidth(interiorPageCount);
  
  return {
    dimensions: {
      frontWidth: 595.28,
      spineWidth,
      backWidth: 595.28,
      height: 834.33,
      totalWidth,
      bleedMargin: 8.5,
      safeMargin: 14.2
    },
    sections: [
      {
        type: 'front',
        x: 8.5, // Bleed margin
        y: 8.5,
        width: 595.28,
        height: 834.33,
        content: layout.cover.content
      },
      {
        type: 'spine',
        x: 8.5 + 595.28,
        y: 8.5,
        width: spineWidth,
        height: 834.33,
        content: generateSpineContent(layout)
      },
      {
        type: 'back',
        x: 8.5 + 595.28 + spineWidth,
        y: 8.5,
        width: 595.28,
        height: 834.33,
        content: layout.cover.content // Or separate back cover content
      }
    ]
  };
}
```

### 2. Spine Content Generation

```typescript
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
```

## Error Handling

### 1. Spine Width Validation
- Minimum spine width validation (prevent too narrow spines)
- Maximum spine width validation (prevent impractical widths)
- Fallback to standard spine width if calculation fails

### 2. Content Overflow
- Check if cover content fits within boundaries
- Scale content if necessary
- Warn user about content adjustments

### 3. Image Processing
- Handle large cover images
- Optimize images for cover printing
- Maintain aspect ratios for cover images

## Performance Considerations

### 1. Large Cover Images
- Compress cover images appropriately
- Use high-quality settings for cover printing
- Cache processed cover images

### 2. Dynamic Spine Calculation
- Cache spine width calculations
- Pre-calculate for common page counts
- Optimize calculation performance

### 3. Memory Management
- Process cover sections sequentially
- Clean up large image data
- Implement timeout for complex covers

## Testing Strategy

### 1. Spine Width Tests
- Test spine calculation accuracy
- Validate edge cases (very few/many pages)
- Compare with industry standards

### 2. Layout Tests
- Test different cover content types
- Validate content positioning
- Test spine text rendering

### 3. Print Tests
- Verify cover dimensions for printing
- Test with actual printing services
- Validate bleed and safe areas

## Dependencies

### Shared Dependencies (with Internal Pages)
```json
{
  "@react-pdf/renderer": "^3.1.14",
  "canvas": "^2.11.2"
}
```

### Cover-Specific Dependencies
```json
{
  "sharp": "^0.32.6"  // For high-quality image processing
}
```

## Implementation Phases

### Phase 1: Core Cover Infrastructure
1. Implement spine width calculation
2. Create cover layout structure
3. Set up cover coordinate system
4. Add spine text rendering

### Phase 2: Cover Section Rendering
1. Implement front cover renderer
2. Implement spine renderer
3. Implement back cover renderer
4. Handle cover-specific content adjustments

### Phase 3: Integration & Testing
1. Integrate with existing PDF infrastructure
2. Test with various page counts
3. Validate print requirements
4. Performance optimization

### Phase 4: Polish & Validation
1. Add cover-specific error handling
2. Implement quality settings
3. Create comprehensive tests
4. Print service validation

## Success Criteria

1. **Accuracy**: Spine width calculation within 0.5mm tolerance
2. **Layout**: Cover content properly positioned across all sections
3. **Quality**: High-quality output suitable for professional printing
4. **Performance**: Cover generation completes within 15 seconds
5. **Compatibility**: PDF meets commercial printing service requirements

## Future Enhancements

1. **Custom Spine Text**: Allow user-defined spine text
2. **Back Cover Content**: Separate back cover design
3. **Cover Templates**: Pre-designed cover templates
4. **Spine Variations**: Different spine text layouts
5. **Print Service Integration**: Direct upload to printing services
