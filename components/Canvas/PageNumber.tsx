"use client";

import { memo } from "react";

interface PageNumberProps {
  pageNumber: number;
  isFixedPage?: boolean;
  fixedPageType?: "cover" | "title" | "ending";
}

export const PageNumber = memo(function PageNumber({ pageNumber, isFixedPage, fixedPageType }: PageNumberProps) {
  if (isFixedPage && fixedPageType === "cover") {
    return null;
  }

  return (
    <div
      className="absolute bottom-3 right-3"
      aria-hidden="true"
      title={`Page ${pageNumber}`}
    >
      <div className="h-5 w-5 rounded-full bg-black/25 text-white text-xs font-medium leading-none flex items-center justify-center">
        {pageNumber}
      </div>
    </div>
  );
});
