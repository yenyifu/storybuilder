"use client";

import type React from "react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { Spread, PageContent, PageBlock } from "@/lib/layout-types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  ListIcon,
  ListOrdered,
  Type,
  ZoomIn,
  ZoomOut,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Palette,
  MoreVertical,
  ImagePlus,
  Sparkles,
  Crop,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { colors } from "@/lib/colors";
import { ImageBlock } from "./image-block";
import { TextBlock } from "./text-block";
import { BlockMenu } from "./block-menu";

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
  const scaled = Math.max(0.5, Math.min(1.6, zoom));
  const [selectedBlock, setSelectedBlock] = useState<null | {
    side: "left" | "right";
    id: string;
  }>(null);

  function select(side: "left" | "right", id?: string) {
    console.log('CanvasSpread select called:', { side, id, currentSelectedBlock: selectedBlock });
    onSelectSide(side);
    if (id) setSelectedBlock({ side, id });
    else setSelectedBlock(null);
  }



  return (
    <div className="h-full overflow-auto px-6 py-6 relative flex items-center justify-center">
      <div
        className="origin-center transition-transform"
        style={{ transform: `scale(${scaled})` }}
      >
        <div className="flex gap-4 justify-center">
          <Page
            pageNumber={basePage}
            side="left"
            content={spread.left}
            selected={selectedSide === "left"}
            onSelect={() => select("left")}
            onChangePage={(p) => onChangePage(p, "left")}
            onChangeBlock={(id, p) => onChangeBlock("left", id, p)}
            onDeleteBlock={(id) => onDeleteBlock?.("left", id)}
            selectedBlockId={
              selectedBlock?.side === "left" ? selectedBlock.id : undefined
            }
            onSelectBlock={(id) => {
              console.log('Page onSelectBlock called for left side:', id);
              select("left", id);
            }}
            pageSize={pageSize}
            isFixedPage={isFixedPage}
            fixedPageType={fixedPageType}
            onAddSpread={onAddSpread}
            onDeleteSpread={onDeleteSpread}
            spreadIndex={spreadIndex}
          />
          <Page
            pageNumber={basePage + 1}
            side="right"
            content={spread.right}
            selected={selectedSide === "right"}
            onSelect={() => select("right")}
            onChangePage={(p) => onChangePage(p, "right")}
            onChangeBlock={(id, p) => onChangeBlock("right", id, p)}
            onDeleteBlock={(id) => onDeleteBlock?.("right", id)}
            selectedBlockId={
              selectedBlock?.side === "right" ? selectedBlock.id : undefined
            }
            onSelectBlock={(id) => {
              console.log('Page onSelectBlock called for right side:', id);
              select("right", id);
            }}
            pageSize={pageSize}
            isFixedPage={isFixedPage}
            fixedPageType={fixedPageType}
            onAddSpread={onAddSpread}
            onDeleteSpread={onDeleteSpread}
            spreadIndex={spreadIndex}
          />
        </div>
      </div>


    </div>
  );
}

function Page({
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
}: {
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
}) {
  const pageRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPageMenuOpen, setIsPageMenuOpen] = useState(false);

  const blocks = content.blocks ?? [];

  function nextZ() {
    return (blocks.reduce((m, b) => Math.max(m, b.z ?? 0), 0) ?? 0) + 1;
  }

  function startDrag(e: React.PointerEvent, b: PageBlock) {
    console.log('startDrag called for block:', b.id);
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    const rect = pageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const offsetX = e.clientX - (rect.left + b.x);
    const offsetY = e.clientY - (rect.top + b.y);
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDrag({ id: b.id, offsetX, offsetY });
    onSelectBlock(b.id);
  }

  function onDragMove(e: React.PointerEvent) {
    if (!drag) return;
    const rect = pageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(
      0,
      Math.min(pageSize.w - 10, e.clientX - rect.left - drag.offsetX)
    );
    const y = Math.max(
      0,
      Math.min(pageSize.h - 10, e.clientY - rect.top - drag.offsetY)
    );
    onChangeBlock(drag.id, { x, y });
  }

  function endDrag(e: React.PointerEvent) {
    if (!drag) return;
    (e.target as Element).releasePointerCapture?.((e as any).pointerId);
    setDrag(null);
    setIsDragging(false);
  }

  function addTextBlock() {
    const w = Math.max(
      260,
      Math.min(pageSize.w - 80, Math.floor(pageSize.w * 0.6))
    );
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
    setIsPageMenuOpen(false); // Auto-close menu after adding text block
  }

  function addImageBlock() {
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
    setIsPageMenuOpen(false); // Auto-close menu after adding image block
  }

  return (
    <div className="relative">
      {/* Add Block Button - floating above page */}
      <div className="absolute left-0 -top-6 z-20">
        <BlockMenu 
          position="right" 
          alwaysVisible={true}
          open={isPageMenuOpen}
          onOpenChange={setIsPageMenuOpen}
        >
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={addTextBlock}
          >
            Add text
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={addImageBlock}
          >
            Add image
          </Button>
        </BlockMenu>
      </div>

      <div
        ref={pageRef}
        className={cn(
          "relative bg-white border rounded-lg shadow-sm cursor-pointer",
          selected ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-gray-300"
        )}
        style={{
          width: pageSize.w,
          height: pageSize.h,
        }}
        onClick={(e) => {
          // Don't select page if clicking on a block
          if (e.target !== e.currentTarget) {
            return;
          }
          if (!isDragging) {
            onSelect();
          }
        }}
        onPointerMove={drag ? onDragMove : undefined}
        onPointerUp={drag ? endDrag : undefined}
        onPointerLeave={drag ? endDrag : undefined}
        aria-label={`${side} page`}
      >
      {/* Render blocks */}
      {blocks.map((b) => {
        console.log('Page rendering block:', b.id, 'type:', b.type, 'selected:', selectedBlockId === b.id);
        return (
          <BlockShell
            key={b.id}
            b={b}
            selected={selectedBlockId === b.id}
            onDragStart={(e) => startDrag(e, b)}
            onClick={() => {
              console.log('BlockShell onClick called for block:', b.id);
              onSelectBlock(b.id);
            }}
            onChange={(p) => onChangeBlock(b.id, p)}
            onDelete={() => onDeleteBlock?.(b.id)}
            pageSize={pageSize}
          />
        );
      })}



      {/* Page number - only show for non-cover pages */}
      {!(isFixedPage && fixedPageType === "cover") && (
        <div
          className="absolute bottom-3 right-3"
          aria-hidden="true"
          title={`Page ${pageNumber}`}
        >
          <div className="h-5 w-5 rounded-full bg-black/25 text-white text-xs font-medium leading-none flex items-center justify-center">
            {pageNumber}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

function BlockShell({
  b,
  selected,
  onDragStart,
  onClick,
  onChange,
  onDelete,
  pageSize,
}: {
  b: PageBlock;
  selected: boolean;
  onDragStart: (e: React.PointerEvent) => void;
  onClick: () => void;
  onChange: (partial: Partial<PageBlock>) => void;
  onDelete?: () => void;
  pageSize: { w: number; h: number };
}) {
  if (b.type === "text") {
    console.log('BlockShell rendering TextBlock for:', b.id, 'selected:', selected);
    return (
      <TextBlock
        block={b}
        selected={selected}
        pageSize={pageSize}
        onChange={onChange}
        onDelete={onDelete}
        onClick={onClick}
        onDragStart={onDragStart}
      />
    );
  } else if (b.type === "image") {
    return (
      <ImageBlock
        block={b}
        selected={selected}
        pageSize={pageSize}
        onChange={onChange}
        onDelete={onDelete}
        onClick={onClick}
        onDragStart={onDragStart}
      />
    );
  }

  return null;
}
