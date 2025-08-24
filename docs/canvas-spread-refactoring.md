# CanvasSpread Component Refactoring Analysis

## Current Responsibilities Analysis

The `CanvasSpread` component currently handles multiple responsibilities:

1. **Zoom Management**: Scaling the entire canvas
2. **Spread Rendering**: Coordinating left and right pages
3. **Page Management**: Individual page rendering and interaction
4. **Block Management**: Creating, selecting, and managing blocks
5. **Drag & Drop**: Block positioning and movement
6. **Selection State**: Managing selected pages and blocks
7. **Menu Management**: Page-level block creation menus
8. **Event Handling**: Complex event coordination between pages and blocks

## Proposed Component Breakdown

### 1. **CanvasContainer** - Main Layout & Zoom
**Responsibilities:**
- Zoom controls and scaling
- Canvas layout and positioning
- Overall container management

```typescript
// components/Canvas/CanvasContainer.tsx
interface CanvasContainerProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  children: React.ReactNode;
}

export function CanvasContainer({ zoom, onZoomChange, children }: CanvasContainerProps) {
  const scaled = Math.max(0.5, Math.min(1.6, zoom));
  
  return (
    <div className="h-full overflow-auto px-6 py-6 relative flex items-center justify-center">
      <div
        className="origin-center transition-transform"
        style={{ transform: `scale(${scaled})` }}
      >
        {children}
      </div>
    </div>
  );
}
```

### 2. **SpreadCanvas** - Spread Coordination
**Responsibilities:**
- Coordinating left and right pages
- Managing spread-level state
- Handling spread-level events

```typescript
// components/Canvas/SpreadCanvas.tsx
interface SpreadCanvasProps {
  spread: Spread;
  selectedSide: "left" | "right";
  onSelectSide: (side: "left" | "right") => void;
  onChangePage: (partial: Partial<PageContent>, side: "left" | "right") => void;
  onChangeBlock: (side: "left" | "right", blockId: string, blockPartial: Partial<PageBlock>) => void;
  onDeleteBlock: (side: "left" | "right", blockId: string) => void;
  basePage: number;
  pageSize: { w: number; h: number };
  isFixedPage?: boolean;
  fixedPageType?: "cover" | "title" | "ending";
  onAddSpread?: (afterIndex?: number) => void;
  onDeleteSpread?: (index: number) => void;
  spreadIndex?: number;
}

export function SpreadCanvas({
  spread,
  selectedSide,
  onSelectSide,
  onChangePage,
  onChangeBlock,
  onDeleteBlock,
  basePage,
  pageSize,
  isFixedPage = false,
  fixedPageType,
  onAddSpread,
  onDeleteSpread,
  spreadIndex,
}: SpreadCanvasProps) {
  const [selectedBlock, setSelectedBlock] = useState<null | {
    side: "left" | "right";
    id: string;
  }>(null);

  const handleSelect = useCallback((side: "left" | "right", id?: string) => {
    onSelectSide(side);
    if (id) setSelectedBlock({ side, id });
    else setSelectedBlock(null);
  }, [onSelectSide]);

  return (
    <div className="flex gap-4 justify-center">
      <PageCanvas
        pageNumber={basePage}
        side="left"
        content={spread.left}
        selected={selectedSide === "left"}
        onSelect={() => handleSelect("left")}
        onChangePage={(p) => onChangePage(p, "left")}
        onChangeBlock={(id, p) => onChangeBlock("left", id, p)}
        onDeleteBlock={(id) => onDeleteBlock?.("left", id)}
        selectedBlockId={selectedBlock?.side === "left" ? selectedBlock.id : undefined}
        onSelectBlock={(id) => handleSelect("left", id)}
        pageSize={pageSize}
        isFixedPage={isFixedPage}
        fixedPageType={fixedPageType}
        onAddSpread={onAddSpread}
        onDeleteSpread={onDeleteSpread}
        spreadIndex={spreadIndex}
      />
      <PageCanvas
        pageNumber={basePage + 1}
        side="right"
        content={spread.right}
        selected={selectedSide === "right"}
        onSelect={() => handleSelect("right")}
        onChangePage={(p) => onChangePage(p, "right")}
        onChangeBlock={(id, p) => onChangeBlock("right", id, p)}
        onDeleteBlock={(id) => onDeleteBlock?.("right", id)}
        selectedBlockId={selectedBlock?.side === "right" ? selectedBlock.id : undefined}
        onSelectBlock={(id) => handleSelect("right", id)}
        pageSize={pageSize}
        isFixedPage={isFixedPage}
        fixedPageType={fixedPageType}
        onAddSpread={onAddSpread}
        onDeleteSpread={onDeleteSpread}
        spreadIndex={spreadIndex}
      />
    </div>
  );
}
```

### 3. **PageCanvas** - Individual Page Management
**Responsibilities:**
- Page rendering and styling
- Page-level event handling
- Block container management
- Page number display

```typescript
// components/Canvas/PageCanvas.tsx
interface PageCanvasProps {
  pageNumber: number;
  side: "left" | "right";
  content: PageContent;
  selected: boolean;
  onSelect: () => void;
  onChangePage: (partial: Partial<PageContent>) => void;
  onChangeBlock: (id: string, partial: Partial<PageBlock>) => void;
  onDeleteBlock?: (id: string) => void;
  selectedBlockId?: string;
  onSelectBlock: (id: string) => void;
  pageSize: { w: number; h: number };
  isFixedPage?: boolean;
  fixedPageType?: "cover" | "title" | "ending";
  onAddSpread?: (afterIndex?: number) => void;
  onDeleteSpread?: (index: number) => void;
  spreadIndex?: number;
}

export function PageCanvas({
  pageNumber,
  side,
  content,
  selected,
  onSelect,
  onChangePage,
  onChangeBlock,
  onDeleteBlock,
  selectedBlockId,
  onSelectBlock,
  pageSize,
  isFixedPage = false,
  fixedPageType,
  onAddSpread,
  onDeleteSpread,
  spreadIndex,
}: PageCanvasProps) {
  const pageRef = useRef<HTMLDivElement>(null);
  const [isPageMenuOpen, setIsPageMenuOpen] = useState(false);

  const blocks = content.blocks ?? [];

  const handlePageClick = useCallback((e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    onSelect();
  }, [onSelect]);

  const nextZ = useCallback(() => {
    return (blocks.reduce((m, b) => Math.max(m, b.z ?? 0), 0) ?? 0) + 1;
  }, [blocks]);

  const addTextBlock = useCallback(() => {
    const w = Math.max(260, Math.min(pageSize.w - 80, Math.floor(pageSize.w * 0.6)));
    const h = 160;
    const newBlock: PageBlock = {
      id: crypto.randomUUID(),
      type: "text",
      x: Math.floor((pageSize.w - w) / 2),
      y: 40,
      w,
      h,
      text: "New text",
      fontSize: 22,
      align: "left",
      color: "#1f2937",
      fontFamily: "Inter, ui-sans-serif, system-ui, Arial",
      listType: "none",
      z: nextZ(),
    };
    onChangePage({ blocks: [...blocks, newBlock] });
    onSelectBlock(newBlock.id);
    setIsPageMenuOpen(false);
  }, [blocks, pageSize, nextZ, onChangePage, onSelectBlock]);

  const addImageBlock = useCallback(() => {
    const newBlock: PageBlock = {
      id: crypto.randomUUID(),
      type: "image",
      x: 0,
      y: 0,
      w: pageSize.w,
      h: pageSize.h,
      image: null,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      z: nextZ(),
    };
    onChangePage({ blocks: [...blocks, newBlock] });
    onSelectBlock(newBlock.id);
    setIsPageMenuOpen(false);
  }, [blocks, pageSize, nextZ, onChangePage, onSelectBlock]);

  return (
    <div className="relative">
      <PageMenu
        isOpen={isPageMenuOpen}
        onOpenChange={setIsPageMenuOpen}
        onAddText={addTextBlock}
        onAddImage={addImageBlock}
      />
      
      <div
        ref={pageRef}
        className={cn(
          "relative bg-white border rounded-lg shadow-sm cursor-pointer",
          selected ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-gray-300"
        )}
        style={{ width: pageSize.w, height: pageSize.h }}
        onClick={handlePageClick}
        aria-label={`${side} page`}
      >
        <BlockContainer
          blocks={blocks}
          selectedBlockId={selectedBlockId}
          onSelectBlock={onSelectBlock}
          onChangeBlock={onChangeBlock}
          onDeleteBlock={onDeleteBlock}
          pageSize={pageSize}
          pageRef={pageRef}
        />
        
        <PageNumber
          pageNumber={pageNumber}
          isFixedPage={isFixedPage}
          fixedPageType={fixedPageType}
        />
      </div>
    </div>
  );
}
```

### 4. **BlockContainer** - Block Management
**Responsibilities:**
- Block rendering coordination
- Block-level event handling
- Block selection management

```typescript
// components/Canvas/BlockContainer.tsx
interface BlockContainerProps {
  blocks: PageBlock[];
  selectedBlockId?: string;
  onSelectBlock: (id: string) => void;
  onChangeBlock: (id: string, partial: Partial<PageBlock>) => void;
  onDeleteBlock?: (id: string) => void;
  pageSize: { w: number; h: number };
  pageRef: RefObject<HTMLDivElement>;
}

export function BlockContainer({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onChangeBlock,
  onDeleteBlock,
  pageSize,
  pageRef,
}: BlockContainerProps) {
  const [drag, setDrag] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const startDrag = useCallback((e: React.PointerEvent, block: PageBlock) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    const rect = pageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const offsetX = e.clientX - (rect.left + block.x);
    const offsetY = e.clientY - (rect.top + block.y);
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDrag({ id: block.id, offsetX, offsetY });
    onSelectBlock(block.id);
  }, [pageRef, onSelectBlock]);

  const onDragMove = useCallback((e: React.PointerEvent) => {
    if (!drag) return;
    const rect = pageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(pageSize.w - 10, e.clientX - rect.left - drag.offsetX));
    const y = Math.max(0, Math.min(pageSize.h - 10, e.clientY - rect.top - drag.offsetY));
    onChangeBlock(drag.id, { x, y });
  }, [drag, pageRef, pageSize, onChangeBlock]);

  const endDrag = useCallback((e: React.PointerEvent) => {
    if (!drag) return;
    (e.target as Element).releasePointerCapture?.((e as any).pointerId);
    setDrag(null);
    setIsDragging(false);
  }, [drag]);

  return (
    <>
      {blocks.map((block) => (
        <BlockRenderer
          key={block.id}
          block={block}
          selected={selectedBlockId === block.id}
          onDragStart={(e) => startDrag(e, block)}
          onClick={() => onSelectBlock(block.id)}
          onChange={(partial) => onChangeBlock(block.id, partial)}
          onDelete={() => onDeleteBlock?.(block.id)}
          pageSize={pageSize}
        />
      ))}
      
      {drag && (
        <div
          className="fixed inset-0 z-50"
          onPointerMove={onDragMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
        />
      )}
    </>
  );
}
```

### 5. **BlockRenderer** - Block Type Routing
**Responsibilities:**
- Routing to appropriate block components
- Block type-specific rendering

```typescript
// components/Canvas/BlockRenderer.tsx
interface BlockRendererProps {
  block: PageBlock;
  selected: boolean;
  onDragStart: (e: React.PointerEvent) => void;
  onClick: () => void;
  onChange: (partial: Partial<PageBlock>) => void;
  onDelete?: () => void;
  pageSize: { w: number; h: number };
}

export function BlockRenderer({
  block,
  selected,
  onDragStart,
  onClick,
  onChange,
  onDelete,
  pageSize,
}: BlockRendererProps) {
  const blockComponent = useMemo(() => {
    switch (block.type) {
      case "text":
        return (
          <TextBlock
            block={block}
            selected={selected}
            pageSize={pageSize}
            onChange={onChange}
            onDelete={onDelete}
            onClick={onClick}
            onDragStart={onDragStart}
          />
        );
      case "image":
        return (
          <ImageBlock
            block={block}
            selected={selected}
            pageSize={pageSize}
            onChange={onChange}
            onDelete={onDelete}
            onClick={onClick}
            onDragStart={onDragStart}
          />
        );
      default:
        return null;
    }
  }, [block, selected, pageSize, onChange, onDelete, onClick, onDragStart]);

  return blockComponent;
}
```

### 6. **PageMenu** - Page-Level Controls
**Responsibilities:**
- Page-level block creation menu
- Menu positioning and visibility

```typescript
// components/Canvas/PageMenu.tsx
interface PageMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddText: () => void;
  onAddImage: () => void;
}

export function PageMenu({ isOpen, onOpenChange, onAddText, onAddImage }: PageMenuProps) {
  return (
    <div className="absolute left-0 -top-6 z-20">
      <BlockMenu 
        position="right" 
        alwaysVisible={true}
        open={isOpen}
        onOpenChange={onOpenChange}
      >
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={onAddText}
        >
          Add text
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={onAddImage}
        >
          Add image
        </Button>
      </BlockMenu>
    </div>
  );
}
```

### 7. **PageNumber** - Page Number Display
**Responsibilities:**
- Page number rendering
- Conditional display logic

```typescript
// components/Canvas/PageNumber.tsx
interface PageNumberProps {
  pageNumber: number;
  isFixedPage?: boolean;
  fixedPageType?: "cover" | "title" | "ending";
}

export function PageNumber({ pageNumber, isFixedPage, fixedPageType }: PageNumberProps) {
  if (isFixedPage && fixedPageType === "cover") {
    return null;
  }

  return (
    <div
      className="absolute bottom-3 right-3"
      aria-hidden="true"
      title={`Page ${pageNumber}`}
    >
      <div className="h-5 w-5 rounded-full bg-black/25 text-white text-xs font-medium leading-none flex items-center justify-center">
        {pageNumber}
      </div>
    </div>
  );
}
```

## Refactored Component Hierarchy

```
CanvasSpread (Original - 419 lines)
├── CanvasContainer (Zoom & Layout - ~20 lines)
└── SpreadCanvas (Spread Coordination - ~80 lines)
    ├── PageCanvas (Page Management - ~120 lines)
    │   ├── PageMenu (Block Creation - ~30 lines)
    │   ├── BlockContainer (Block Management - ~100 lines)
    │   │   └── BlockRenderer (Block Routing - ~40 lines)
    │   └── PageNumber (Page Number - ~20 lines)
    └── PageCanvas (Page Management - ~120 lines)
        ├── PageMenu (Block Creation - ~30 lines)
        ├── BlockContainer (Block Management - ~100 lines)
        │   └── BlockRenderer (Block Routing - ~40 lines)
        └── PageNumber (Page Number - ~20 lines)
```

## Benefits of This Refactoring

### 1. **Single Responsibility Principle**
- Each component has a clear, focused purpose
- Easier to understand and maintain
- Reduced cognitive load when working on specific features

### 2. **Improved Testability**
- Smaller components are easier to unit test
- Clear interfaces make mocking simpler
- Isolated functionality reduces test complexity

### 3. **Better Reusability**
- `BlockRenderer` can be used in different contexts
- `PageNumber` can be reused across different page types
- `CanvasContainer` can be used for other canvas-based features

### 4. **Enhanced Performance**
- Components can be memoized individually
- Smaller re-render boundaries
- Better optimization opportunities

### 5. **Easier Debugging**
- Clear component boundaries
- Isolated state management
- Easier to trace issues to specific components

### 6. **Simplified Development**
- Multiple developers can work on different components simultaneously
- Clear ownership of functionality
- Reduced merge conflicts

## Implementation Strategy

### Phase 1: Extract Core Components
1. Create `CanvasContainer` and `PageNumber` components
2. Extract `BlockRenderer` from existing code
3. Create `PageMenu` component

### Phase 2: Refactor Page Management
1. Create `PageCanvas` component
2. Extract `BlockContainer` with drag-and-drop logic
3. Update existing `CanvasSpread` to use new components

### Phase 3: Complete Separation
1. Create `SpreadCanvas` component
2. Replace original `CanvasSpread` with new component hierarchy
3. Remove original component code

### Phase 4: Optimization
1. Add React.memo to appropriate components
2. Implement useCallback for event handlers
3. Add performance monitoring

This refactoring transforms a monolithic 419-line component into a well-structured hierarchy of focused, maintainable components while preserving all existing functionality.
