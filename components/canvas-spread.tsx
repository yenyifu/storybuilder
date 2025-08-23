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
}) {
  const scaled = Math.max(0.5, Math.min(1.6, zoom));
  const [selectedBlock, setSelectedBlock] = useState<null | {
    side: "left" | "right";
    id: string;
  }>(null);

  function select(side: "left" | "right", id?: string) {
    onSelectSide(side);
    if (id) setSelectedBlock({ side, id });
    else setSelectedBlock(null);
  }

  return (
    <div className="h-full overflow-auto px-6 py-6">
      <div
        className="mx-auto origin-top transition-transform"
        style={{ transform: `scale(${scaled})`, width: pageSize.w * 2 + 16 }}
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
            onSelectBlock={(id) => select("left", id)}
            pageSize={pageSize}
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
            onSelectBlock={(id) => select("right", id)}
            pageSize={pageSize}
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
}) {
  const pageRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const blocks = content.blocks ?? [];

  function nextZ() {
    return (blocks.reduce((m, b) => Math.max(m, b.z ?? 0), 0) ?? 0) + 1;
  }

  function startDrag(e: React.PointerEvent, b: PageBlock) {
    e.stopPropagation();
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
  }

  function addImageBlock() {
    const w = 200;
    const h = 150;
    const newBlock: PageBlock = {
      id: crypto.randomUUID(),
      type: "image",
      x: Math.floor((pageSize.w - w) / 2),
      y: 40,
      w,
      h,
      image: null,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      z: nextZ(),
    };
    onChangePage({ blocks: [...blocks, newBlock] });
    onSelectBlock(newBlock.id);
  }

  return (
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
      onClick={onSelect}
      onPointerMove={onDragMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      aria-label={`${side} page`}
    >
      {/* Render blocks */}
      {blocks.map((b) => (
        <BlockShell
          key={b.id}
          b={b}
          selected={selectedBlockId === b.id}
          onDragStart={(e) => startDrag(e, b)}
          onClick={() => onSelectBlock(b.id)}
          onChange={(p) => onChangeBlock(b.id, p)}
          onDelete={() => onDeleteBlock?.(b.id)}
          pageSize={pageSize}
        />
      ))}

      {/* Page number */}
      <div
        className="absolute bottom-2 right-2"
        aria-hidden="true"
        title={`Page ${pageNumber}`}
      >
        <div className="h-3 w-3 rounded-full bg-black/25 text-white text-[8px] leading-none flex items-center justify-center">
          {pageNumber}
        </div>
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
  return (
    <Card
      className={cn(
        "absolute cursor-grab active:cursor-grabbing",
        selected ? "ring-2 ring-primary" : ""
      )}
      style={{
        left: b.x,
        top: b.y,
        width: b.w,
        height: b.h,
        zIndex: b.z ?? 1,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerDown={onDragStart}
    >
      {b.type === "text" ? (
        <div className="h-full p-2">
          <textarea
            className="w-full h-full resize-none border-none outline-none bg-transparent"
            value={b.text || ""}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Enter text..."
            style={{
              fontSize: b.fontSize,
              textAlign: b.align,
              color: b.color,
              fontFamily: b.fontFamily,
            }}
          />
        </div>
      ) : (
        <div className="h-full flex items-center justify-center bg-gray-100">
          <span className="text-gray-500">Image placeholder</span>
        </div>
      )}
    </Card>
  );
}
