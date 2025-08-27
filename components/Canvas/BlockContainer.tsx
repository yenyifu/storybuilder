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
  pageRef: RefObject<HTMLDivElement | null>;
}

interface BlockContainerReturn {
  blocksJSX: React.ReactNode;
  dragHandlers: {
    onPointerMove?: (e: React.PointerEvent) => void;
    onPointerUp?: (e: React.PointerEvent) => void;
    onPointerLeave?: (e: React.PointerEvent) => void;
  };
  isDragging: boolean;
}

export function useBlockContainer({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onChangeBlock,
  onDeleteBlock,
  pageSize,
  pageRef,
}: BlockContainerProps): BlockContainerReturn {
  const [drag, setDrag] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const startDrag = useCallback((e: React.PointerEvent, block: PageBlock) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = pageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const offsetX = e.clientX - (rect.left + block.x);
    const offsetY = e.clientY - (rect.top + block.y);
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDrag({ id: block.id, offsetX, offsetY });
    setIsDragging(true);
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

  // Sort blocks by z-index to ensure proper layering
  const sortedBlocks = [...blocks].sort((a, b) => (a.z ?? 0) - (b.z ?? 0));

  const blocksJSX = (
    <>
      {sortedBlocks.map((block) => (
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
    </>
  );

  const dragHandlers = {
    onPointerMove: onDragMove,
    onPointerUp: endDrag,
    onPointerLeave: endDrag,
  };

  return {
    blocksJSX,
    dragHandlers,
    isDragging,
  };
}
