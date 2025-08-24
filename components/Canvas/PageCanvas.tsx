"use client";

import { useRef, useState, useCallback, memo } from "react";
import { cn } from "@/lib/utils";
import type { PageContent, PageBlock } from "@/lib/layout-types";
import { useBlockContainer } from "./BlockContainer";
import { PageMenu } from "./PageMenu";
import { PageNumber } from "./PageNumber";
import { usePerformanceMonitor } from "./usePerformanceMonitor";

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

export const PageCanvas = memo(function PageCanvas({
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
  usePerformanceMonitor("PageCanvas");
  const pageRef = useRef<HTMLDivElement>(null);
  const [isPageMenuOpen, setIsPageMenuOpen] = useState(false);

  const blocks = content.blocks ?? [];

  const { blocksJSX, dragHandlers, isDragging } = useBlockContainer({
    blocks,
    selectedBlockId,
    onSelectBlock,
    onChangeBlock,
    onDeleteBlock,
    pageSize,
    pageRef,
  });

  const handlePageClick = useCallback((e: React.MouseEvent) => {
    // Don't select page if clicking on a block or if dragging
    if (e.target !== e.currentTarget || isDragging) {
      return;
    }
    onSelect();
  }, [onSelect, isDragging]);

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
        onPointerMove={isDragging ? dragHandlers.onPointerMove : undefined}
        onPointerUp={isDragging ? dragHandlers.onPointerUp : undefined}
        onPointerLeave={isDragging ? dragHandlers.onPointerLeave : undefined}
        aria-label={`${side} page`}
      >
        {blocksJSX}
        
        <PageNumber
          pageNumber={pageNumber}
          isFixedPage={isFixedPage}
          fixedPageType={fixedPageType}
        />
      </div>
    </div>
  );
});
