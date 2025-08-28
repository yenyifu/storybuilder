"use client";

import { memo } from "react";

interface PageNumberProps {
  pageNumber: number;
  isFixedPage?: boolean;
  fixedPageType?: "cover" | "title" | "ending";
  side?: "left" | "right";
}

export const PageNumber = memo(function PageNumber({ pageNumber, isFixedPage, fixedPageType, side }: PageNumberProps) {
  // For cover pages, show "Back Cover" on left and "Cover" on right
  if (isFixedPage && fixedPageType === "cover") {
    if (side === "left") {
      return (
        <div className="absolute top-full mt-2 left-0" aria-hidden="true">
          <div className="text-xs text-gray-600 font-medium">
            Back Cover
          </div>
        </div>
      );
    } else if (side === "right") {
      return (
        <div className="absolute top-full mt-2 right-0" aria-hidden="true">
          <div className="text-xs text-gray-600 font-medium">
            Cover
          </div>
        </div>
      );
    }
    return null;
  }

  // For title page, only show page number on the right side (where content is)
  if (isFixedPage && fixedPageType === "title") {
    if (side === "right" && pageNumber > 0) {
      return (
        <div
          className="absolute top-full mt-2 right-0"
          aria-hidden="true"
          title="Page 1"
        >
          <div className="text-xs text-gray-600 font-medium">
            Page 1
          </div>
        </div>
      );
    }
    // Don't show any page number on the left side of title page
    return null;
  }

  // For ending page, only show page number on the left side (where content is)
  if (isFixedPage && fixedPageType === "ending") {
    if (side === "left" && pageNumber > 0) {
      return (
        <div
          className="absolute top-full mt-2 left-0"
          aria-hidden="true"
          title={`Page ${pageNumber}`}
        >
          <div className="text-xs text-gray-600 font-medium">
            Page {pageNumber}
          </div>
        </div>
      );
    }
    // Don't show any page number on the right side of ending page
    return null;
  }

  // For regular spreads, show page number
  return (
    <div
      className={`absolute top-full mt-2 ${side === "left" ? "left-0" : "right-0"}`}
      aria-hidden="true"
      title={`Page ${pageNumber}`}
    >
      <div className="text-xs text-gray-600 font-medium">
        Page {pageNumber}
      </div>
    </div>
  );
});
