"use client";

import { useMemo, memo } from "react";
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

export const BlockRenderer = memo(function BlockRenderer({
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
});
