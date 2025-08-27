"use client";

import type { PageContent, PageBlock } from "@/lib/layout-types";

interface PageThumbnailProps {
  content: PageContent;
  width: number;
  height: number;
}

export function PageThumbnail({ content, width, height }: PageThumbnailProps) {
  const blocks = content.blocks || [];
  
  // Calculate scale factor to fit content in thumbnail
  const pageWidth = 720; // Standard page width
  const pageHeight = 540; // Standard page height
  const scaleX = width / pageWidth;
  const scaleY = height / pageHeight;
  const scale = Math.min(scaleX, scaleY);

  return (
    <div 
      className="relative bg-white rounded overflow-hidden"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {/* Render blocks */}
      {blocks.map((block) => {
        const scaledX = block.x * scale;
        const scaledY = block.y * scale;
        const scaledW = block.w * scale;
        const scaledH = block.h * scale;

        if (block.type === "text") {
          return (
            <div
              key={block.id}
              className="absolute"
              style={{
                left: `${scaledX}px`,
                top: `${scaledY}px`,
                width: `${scaledW}px`,
                height: `${scaledH}px`,
                backgroundColor: block.backgroundColor || "transparent",
                opacity: block.backgroundOpacity ?? 1,
              }}
            >
              <div
                className="w-full h-full overflow-hidden"
                style={{
                  fontSize: Math.max(6, (block.fontSize || 16) * scale),
                  textAlign: block.align || "left",
                  color: block.color || "#1f2937",
                  fontFamily: block.fontFamily || "Inter, ui-sans-serif, system-ui, Arial",
                  lineHeight: '1.2',
                  padding: `${2 * scale}px`,
                }}
              >
                {block.text || ""}
              </div>
            </div>
          );
        } else if (block.type === "image" && block.image) {
          return (
            <div
              key={block.id}
              className="absolute"
              style={{
                left: `${scaledX}px`,
                top: `${scaledY}px`,
                width: `${scaledW}px`,
                height: `${scaledH}px`,
                overflow: "hidden",
              }}
            >
              <img
                src={block.image}
                alt=""
                className="w-full h-full object-cover"
                style={{
                  transform: `scale(${block.zoom || 1}) translate(${(block.offsetX || 0) * scale}px, ${(block.offsetY || 0) * scale}px)`,
                }}
              />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
