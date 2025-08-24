"use client";

import { useState, useCallback, memo } from "react";
import type { Spread, PageContent, PageBlock } from "@/lib/layout-types";
import { PageCanvas } from "./PageCanvas";
import { usePerformanceMonitor } from "./usePerformanceMonitor";

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

export const SpreadCanvas = memo(function SpreadCanvas({
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
  usePerformanceMonitor("SpreadCanvas");
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
});
