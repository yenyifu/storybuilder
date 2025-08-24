# CanvasSpread Refactoring - AI Implementation Instructions

## Overview
This document provides detailed, step-by-step instructions for refactoring the monolithic `CanvasSpread` component into smaller, focused components. Each phase builds upon the previous one and includes specific code examples and file locations.

## Prerequisites
- Ensure you have access to the current `components/canvas-spread.tsx` file
- Verify that `components/ui/button.tsx`, `components/ui/card.tsx`, and other UI components exist
- Confirm that `lib/layout-types.ts` contains the necessary TypeScript interfaces

## Phase 1: Extract Core Components

### Step 1.1: Create CanvasContainer Component

**File to create**: `components/Canvas/CanvasContainer.tsx`

**Instructions**:
1. Create the `components/Canvas/` directory if it doesn't exist
2. Create a new file `CanvasContainer.tsx` with the following content:

```typescript
"use client";

import React from "react";

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

### Step 1.2: Create PageNumber Component

**File to create**: `components/Canvas/PageNumber.tsx`

**Instructions**:
1. Create a new file `PageNumber.tsx` in the `components/Canvas/` directory:

```typescript
"use client";

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

### Step 1.3: Create BlockRenderer Component

**File to create**: `components/Canvas/BlockRenderer.tsx`

**Instructions**:
1. Create a new file `BlockRenderer.tsx` in the `components/Canvas/` directory:

```typescript
"use client";

import { useMemo } from "react";
import type { PageBlock } from "@/lib/layout-types";
import { TextBlock } from "@/components/text-block";
import { ImageBlock } from "@/components/image-block";

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

### Step 1.4: Create PageMenu Component

**File to create**: `components/Canvas/PageMenu.tsx`

**Instructions**:
1. Create a new file `PageMenu.tsx` in the `components/Canvas/` directory:

```typescript
"use client";

import { Button } from "@/components/ui/button";
import { BlockMenu } from "@/components/block-menu";

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

### Step 1.5: Create index.ts for Canvas Components

**File to create**: `components/Canvas/index.ts`

**Instructions**:
1. Create an index file to export all canvas components:

```typescript
export { CanvasContainer } from "./CanvasContainer";
export { PageNumber } from "./PageNumber";
export { BlockRenderer } from "./BlockRenderer";
export { PageMenu } from "./PageMenu";
```

## Phase 2: Refactor Page Management

### Step 2.1: Create BlockContainer Component

**File to create**: `components/Canvas/BlockContainer.tsx`

**Instructions**:
1. Create a new file `BlockContainer.tsx` in the `components/Canvas/` directory:

```typescript
"use client";

import { useState, useCallback, RefObject } from "react";
import type { PageBlock } from "@/lib/layout-types";
import { BlockRenderer } from "./BlockRenderer";

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

### Step 2.2: Create PageCanvas Component

**File to create**: `components/Canvas/PageCanvas.tsx`

**Instructions**:
1. Create a new file `PageCanvas.tsx` in the `components/Canvas/` directory:

```typescript
"use client";

import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { PageContent, PageBlock } from "@/lib/layout-types";
import { BlockContainer } from "./BlockContainer";
import { PageMenu } from "./PageMenu";
import { PageNumber } from "./PageNumber";

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

### Step 2.3: Update Canvas index.ts

**File to update**: `components/Canvas/index.ts`

**Instructions**:
1. Add the new components to the exports:

```typescript
export { CanvasContainer } from "./CanvasContainer";
export { PageNumber } from "./PageNumber";
export { BlockRenderer } from "./BlockRenderer";
export { PageMenu } from "./PageMenu";
export { BlockContainer } from "./BlockContainer";
export { PageCanvas } from "./PageCanvas";
```

## Phase 3: Complete Separation

### Step 3.1: Create SpreadCanvas Component

**File to create**: `components/Canvas/SpreadCanvas.tsx`

**Instructions**:
1. Create a new file `SpreadCanvas.tsx` in the `components/Canvas/` directory:

```typescript
"use client";

import { useState, useCallback } from "react";
import type { Spread, PageContent, PageBlock } from "@/lib/layout-types";
import { PageCanvas } from "./PageCanvas";

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

### Step 3.2: Update Canvas index.ts with SpreadCanvas

**File to update**: `components/Canvas/index.ts`

**Instructions**:
1. Add SpreadCanvas to the exports:

```typescript
export { CanvasContainer } from "./CanvasContainer";
export { PageNumber } from "./PageNumber";
export { BlockRenderer } from "./BlockRenderer";
export { PageMenu } from "./PageMenu";
export { BlockContainer } from "./BlockContainer";
export { PageCanvas } from "./PageCanvas";
export { SpreadCanvas } from "./SpreadCanvas";
```

### Step 3.3: Refactor Original CanvasSpread Component

**File to update**: `components/canvas-spread.tsx`

**Instructions**:
1. Replace the entire content of `canvas-spread.tsx` with the new simplified version:

```typescript
"use client";

import type { Spread, PageContent, PageBlock } from "@/lib/layout-types";
import { CanvasContainer, SpreadCanvas } from "./Canvas";

export function CanvasSpread({
  spread,
  zoom,
  onZoomChange,
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
}: {
  spread: Spread;
  zoom: number;
  onZoomChange: (zoom: number) => void;
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
}) {
  return (
    <CanvasContainer zoom={zoom} onZoomChange={onZoomChange}>
      <SpreadCanvas
        spread={spread}
        selectedSide={selectedSide}
        onSelectSide={onSelectSide}
        onChangePage={onChangePage}
        onChangeBlock={onChangeBlock}
        onDeleteBlock={onDeleteBlock}
        basePage={basePage}
        pageSize={pageSize}
        isFixedPage={isFixedPage}
        fixedPageType={fixedPageType}
        onAddSpread={onAddSpread}
        onDeleteSpread={onDeleteSpread}
        spreadIndex={spreadIndex}
      />
    </CanvasContainer>
  );
}
```

### Step 3.4: Update Layout Builder to Use New Components

**File to update**: `app/layout-builder/page.tsx`

**Instructions**:
1. Find the import statement for CanvasSpread and update it if needed
2. The existing usage should work without changes since we maintained the same interface

## Phase 4: Optimization

### Step 4.1: Add React.memo to Components

**Files to update**: All Canvas components

**Instructions**:
1. For each Canvas component, wrap the export with `React.memo`:

```typescript
// Example for BlockRenderer.tsx
import { useMemo, memo } from "react";

export const BlockRenderer = memo(function BlockRenderer({ ... }) {
  // component implementation
});
```

2. Apply this pattern to:
   - `BlockRenderer.tsx`
   - `PageNumber.tsx`
   - `PageMenu.tsx`
   - `BlockContainer.tsx`
   - `PageCanvas.tsx`
   - `SpreadCanvas.tsx`

### Step 4.2: Optimize Event Handlers with useCallback

**Files to update**: `BlockContainer.tsx`, `PageCanvas.tsx`, `SpreadCanvas.tsx`

**Instructions**:
1. Ensure all event handlers are wrapped with `useCallback`
2. Add proper dependency arrays
3. Example for `BlockContainer.tsx`:

```typescript
const startDrag = useCallback((e: React.PointerEvent, block: PageBlock) => {
  // implementation
}, [pageRef, onSelectBlock]);

const onDragMove = useCallback((e: React.PointerEvent) => {
  // implementation
}, [drag, pageRef, pageSize, onChangeBlock]);

const endDrag = useCallback((e: React.PointerEvent) => {
  // implementation
}, [drag]);
```

### Step 4.3: Add Performance Monitoring

**File to create**: `components/Canvas/usePerformanceMonitor.ts`

**Instructions**:
1. Create a custom hook for performance monitoring:

```typescript
import { useEffect, useRef } from "react";

export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    if (process.env.NODE_ENV === "development") {
      console.log(`${componentName} rendered ${renderCount.current} times`);
    }
  });
}
```

2. Add this hook to key components for development monitoring

### Step 4.4: Update Final Canvas index.ts

**File to update**: `components/Canvas/index.ts`

**Instructions**:
1. Ensure all components are properly exported:

```typescript
export { CanvasContainer } from "./CanvasContainer";
export { PageNumber } from "./PageNumber";
export { BlockRenderer } from "./BlockRenderer";
export { PageMenu } from "./PageMenu";
export { BlockContainer } from "./BlockContainer";
export { PageCanvas } from "./PageCanvas";
export { SpreadCanvas } from "./SpreadCanvas";
export { usePerformanceMonitor } from "./usePerformanceMonitor";
```

## Verification Steps

After completing each phase, verify:

1. **Phase 1**: All new components compile without errors
2. **Phase 2**: PageCanvas and BlockContainer work correctly with drag-and-drop
3. **Phase 3**: The refactored CanvasSpread maintains all original functionality
4. **Phase 4**: Performance optimizations don't break existing functionality

## Testing Checklist

- [ ] Zoom functionality works correctly
- [ ] Page selection works for both left and right pages
- [ ] Block creation (text and image) works
- [ ] Block selection and editing works
- [ ] Drag and drop functionality works
- [ ] Block deletion works
- [ ] Page numbers display correctly
- [ ] Fixed pages (cover, title, ending) work correctly
- [ ] Spread navigation works
- [ ] All existing features from the original component are preserved

## Rollback Plan

If issues arise during refactoring:

1. Keep the original `canvas-spread.tsx` as a backup
2. Revert to the original component by updating imports
3. Test thoroughly before proceeding to the next phase
4. Document any issues encountered for future reference

This step-by-step approach ensures a safe, incremental refactoring that maintains functionality while improving code organization and maintainability.
