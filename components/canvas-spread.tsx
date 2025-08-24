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
