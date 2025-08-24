"use client";

import React, { memo } from "react";

interface CanvasContainerProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  children: React.ReactNode;
}

export const CanvasContainer = memo(function CanvasContainer({ zoom, onZoomChange, children }: CanvasContainerProps) {
  const scaled = Math.max(0.5, Math.min(1.6, zoom));
  
  return (
    <div className="h-full overflow-auto px-6 py-6 relative flex items-center justify-center">
      <div
        className="origin-center transition-transform"
        style={{ transform: `scale(${scaled})` }}
      >
        {children}
      </div>
    </div>
  );
});
