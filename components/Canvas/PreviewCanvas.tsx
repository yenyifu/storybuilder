"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { PageContent, PageBlock } from "@/lib/layout-types";
import { PreviewBlockRenderer } from "./PreviewBlockRenderer";
import { PageNumber } from "./PageNumber";

interface PreviewCanvasProps {
  pageNumber: number;
  side: "left" | "right";
  content: PageContent;
  pageSize: { w: number; h: number };
  isFixedPage?: boolean;
  fixedPageType?: "cover" | "title" | "ending";
}

export const PreviewCanvas = memo(function PreviewCanvas({
  pageNumber,
  side,
  content,
  pageSize,
  isFixedPage = false,
  fixedPageType,
}: PreviewCanvasProps) {
  const blocks = content.blocks ?? [];

  return (
    <div className="relative">
      <div
        className={cn(
          "relative bg-white border rounded-lg shadow-sm",
          "pointer-events-none" // Disable all interactions
        )}
        style={{ width: pageSize.w, height: pageSize.h }}
        aria-label={`${side} page`}
      >
        {/* Render blocks in read-only mode */}
        {blocks.map((block) => (
          <PreviewBlockRenderer
            key={block.id}
            block={block}
            pageSize={pageSize}
          />
        ))}
        
        {/* Show page number for cover pages, pages with content, or title page on right side */}
        {(isFixedPage && fixedPageType === 'cover') || 
         (content.blocks && content.blocks.length > 0) || 
         (isFixedPage && fixedPageType === 'title' && side === 'right') ||
         (isFixedPage && fixedPageType === 'ending' && side === 'left') ? (
          <PageNumber
            pageNumber={pageNumber}
            isFixedPage={isFixedPage}
            fixedPageType={fixedPageType}
            side={side}
          />
        ) : null}
      </div>
    </div>
  );
});
