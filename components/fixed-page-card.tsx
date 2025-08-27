"use client";

import type React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { BookOpen, FileText, BookMarked } from "lucide-react";
import type { FixedPage } from "@/lib/layout-types";

export function FixedPageCard({
  page,
  selected,
  onClick,
  pageNumber,
}: {
  page: FixedPage;
  selected: boolean;
  onClick: () => void;
  pageNumber: number;
}) {
  const getIcon = () => {
    switch (page.type) {
      case "cover":
        return <BookOpen className="h-4 w-4" />;
      case "title":
        return <FileText className="h-4 w-4" />;
      case "ending":
        return <BookMarked className="h-4 w-4" />;
    }
  };

  const getTitle = () => {
    switch (page.type) {
      case "cover":
        return "Cover";
      case "title":
        return "Title Page";
      case "ending":
        return "Ending";
    }
  };

  const getPreviewText = () => {
    // Get text from blocks first, fallback to legacy text property
    const blocks = page.content.blocks || [];
    const textBlocks = blocks.filter(block => block.type === "text" && block.text);
    
    if (textBlocks.length > 0) {
      // Use the first text block's content
      const text = textBlocks[0].text || "";
      return text.length > 50 ? text.substring(0, 50) + "..." : text;
    }
    
    // Fallback to legacy text property
    const text = page.content.text || "";
    return text.length > 50 ? text.substring(0, 50) + "..." : text;
  };

  return (
    <div className="relative group" onClick={onClick}>
      <Card
        className={cn(
          "overflow-hidden border bg-white shadow-sm hover:shadow transition-shadow cursor-pointer",
          selected
            ? "ring-2 ring-sky-300 border-sky-300 shadow-md"
            : "hover:border-orange-200"
        )}
      >
        {/* Fixed page thumbnail */}
        <div className="h-[84px] w-full">
          <div className="h-full p-2">
            <div className="relative w-full h-full rounded-md border border-gray-200 overflow-hidden bg-white">
              {page.content.image ? (
                <img
                  src={page.content.image}
                  alt={`${page.type} page`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 p-2 text-[9px] leading-[11px] text-gray-700 line-clamp-4 whitespace-pre-wrap">
                  {getPreviewText() || `Add ${page.type} content`}
                </div>
              )}
              <div
                className="absolute bottom-1 left-1 h-3 w-3 rounded-full bg-black/25 text-white text-[8px] flex items-center justify-center"
                title={`Page ${pageNumber}`}
                aria-hidden="true"
              >
                {pageNumber}
              </div>
            </div>
          </div>
        </div>

        {/* Page type indicator */}
        <div className="px-2 py-1 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            {getIcon()}
            <span className="font-medium">{getTitle()}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
