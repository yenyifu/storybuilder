"use client";

import { memo } from "react";
import type { Spread, PageContent, PageBlock } from "@/lib/layout-types";
import { PreviewCanvas } from "./PreviewCanvas";

interface PreviewSpreadCanvasProps {
  spread: Spread;
  basePage: number;
  pageSize: { w: number; h: number };
  isFixedPage?: boolean;
  fixedPageType?: "cover" | "title" | "ending";
}

export const PreviewSpreadCanvas = memo(function PreviewSpreadCanvas({
  spread,
  basePage,
  pageSize,
  isFixedPage = false,
  fixedPageType,
}: PreviewSpreadCanvasProps) {
  return (
    <div className="flex gap-4 justify-center">
      <PreviewCanvas
        pageNumber={isFixedPage ? basePage : basePage}
        side="left"
        content={spread.left}
        pageSize={pageSize}
        isFixedPage={isFixedPage}
        fixedPageType={fixedPageType}
      />
      <PreviewCanvas
        pageNumber={isFixedPage ? basePage : basePage + 1}
        side="right"
        content={spread.right}
        pageSize={pageSize}
        isFixedPage={isFixedPage}
        fixedPageType={fixedPageType}
      />
    </div>
  );
});
