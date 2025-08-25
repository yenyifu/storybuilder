"use client";

import { useMemo, memo } from "react";
import type { PageBlock } from "@/lib/layout-types";
import { TextBlock } from "@/components/text-block";
import { ImageBlock } from "@/components/image-block";

interface PreviewBlockRendererProps {
  block: PageBlock;
  pageSize: { w: number; h: number };
}

export const PreviewBlockRenderer = memo(function PreviewBlockRenderer({
  block,
  pageSize,
}: PreviewBlockRendererProps) {
  const blockComponent = useMemo(() => {
    switch (block.type) {
      case "text":
        return (
          <div
            className="absolute pointer-events-none"
            style={{
              left: block.x,
              top: block.y,
              width: block.w,
              height: block.h,
              zIndex: block.z ?? 1,
            }}
          >
            <div
              className="w-full h-full bg-transparent px-2 m-0"
              style={{
                fontSize: block.fontSize,
                textAlign: block.align,
                color: block.color,
                fontFamily: block.fontFamily,
                lineHeight: '1.2',
                backgroundColor: block.backgroundColor || "transparent",
                opacity: block.backgroundOpacity ?? 1,
              }}
            >
              {block.text || ""}
            </div>
          </div>
        );
      case "image":
        return (
          <div
            className="absolute pointer-events-none"
            style={{
              left: block.x,
              top: block.y,
              width: block.w,
              height: block.h,
              zIndex: block.z ?? 1,
            }}
          >
            {block.image && (
              <img
                src={block.image}
                alt="Story illustration"
                className="w-full h-full object-cover"
                style={{
                  transform: `scale(${block.zoom || 1}) translate(${block.offsetX || 0}px, ${block.offsetY || 0}px)`,
                }}
              />
            )}
          </div>
        );
      default:
        return null;
    }
  }, [block, pageSize]);

  return blockComponent;
});
