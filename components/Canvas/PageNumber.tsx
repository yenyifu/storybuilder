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

  // For other fixed pages, show page number (but not for cover which has pageNumber 0)
  if (isFixedPage && pageNumber > 0) {
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
