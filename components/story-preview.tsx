"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { colors } from "@/lib/colors";
import type { BookLayout, Spread } from "@/lib/layout-types";
import { CanvasContainer, PreviewSpreadCanvas } from "./Canvas";

interface StoryPreviewProps {
  layout: BookLayout;
  isOpen: boolean;
  onClose: () => void;
  onBackToEdit: () => void;
  onAddToCart: () => void;
  orientation?: "portrait" | "landscape";
}

// Page dimensions based on orientation
function getPageDimensions(orientation: "portrait" | "landscape") {
  if (orientation === "landscape") {
    return { w: 720, h: 540 }; // 4:3 landscape
  } else {
    return { w: 540, h: 720 }; // 3:4 portrait
  }
}

// Helper function to create a spread from fixed page content
function createFixedPageSpread(content: any, type: 'cover' | 'title' | 'ending'): Spread {
  switch (type) {
    case 'cover':
      return {
        id: `fixed-${type}`,
        left: { blocks: [] }, // Back cover on left
        right: content, // Cover on right
      };
    case 'title':
      return {
        id: `fixed-${type}`,
        left: { blocks: [] }, // Blank left page
        right: content, // Title on right
      };
    case 'ending':
      return {
        id: `fixed-${type}`,
        left: content, // Ending on left
        right: { blocks: [] }, // Blank right page
      };
    default:
      return {
        id: `fixed-${type}`,
        left: content,
        right: { blocks: [] },
      };
  }
}

export function StoryPreview({ 
  layout, 
  isOpen, 
  onClose, 
  onBackToEdit, 
  onAddToCart,
  orientation = "landscape"
}: StoryPreviewProps) {
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const pageDimensions = getPageDimensions(orientation);
  
  // Create array of all spreads including fixed pages
  const allSpreads = [
    { type: 'cover', content: layout.cover, pageNumber: 0 }, // Cover doesn't have a page number
    { type: 'title', content: layout.title, pageNumber: 1 }, // Title page is page 1 (right side only)
    ...layout.spreads.map((spread, index) => ({ 
      type: 'spread', 
      content: spread, 
      pageNumber: 2 + (index * 2) // Start from page 2, each spread is 2 pages
    })),
    { type: 'ending', content: layout.ending, pageNumber: 2 + (layout.spreads.length * 2) } // Ending page (left side only)
  ];

  const currentSpread = allSpreads[currentSpreadIndex];
  const isFirstPage = currentSpreadIndex === 0;
  const isLastPage = currentSpreadIndex === allSpreads.length - 1;

  const goToPrevious = () => {
    if (!isFirstPage) {
      setCurrentSpreadIndex(currentSpreadIndex - 1);
    }
  };

  const goToNext = () => {
    if (!isLastPage) {
      setCurrentSpreadIndex(currentSpreadIndex + 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={onBackToEdit}
              size="sm"
            >
              Back to Edit
            </Button>
            <Button 
              onClick={onAddToCart}
              size="sm"
              style={{ backgroundColor: colors.main }}
            >
              Add to Cart
            </Button>
          </div>
        </div>

        {/* Zoom Controls Section */}
        <div className="flex justify-end px-4 py-3 pb-12">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.05))}
              disabled={zoom <= 0.5}
            >
              -
            </Button>
            <span className="text-sm text-gray-600 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(2, zoom + 0.05))}
              disabled={zoom >= 2}
            >
              +
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-start justify-center relative">
          {/* Navigation Arrows */}
          {!isFirstPage && (
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
          
          {!isLastPage && (
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}

          {/* Page Content */}
          <div className="flex items-start justify-center w-full h-full">
            {currentSpread.type === 'cover' && (
              <CanvasContainer zoom={zoom} onZoomChange={setZoom}>
                <PreviewSpreadCanvas
                  spread={createFixedPageSpread(currentSpread.content, 'cover')}
                  basePage={currentSpread.pageNumber}
                  pageSize={pageDimensions}
                  isFixedPage={true}
                  fixedPageType="cover"
                />
              </CanvasContainer>
            )}
            
            {currentSpread.type === 'title' && (
              <CanvasContainer zoom={zoom} onZoomChange={setZoom}>
                <PreviewSpreadCanvas
                  spread={createFixedPageSpread(currentSpread.content, 'title')}
                  basePage={currentSpread.pageNumber}
                  pageSize={pageDimensions}
                  isFixedPage={true}
                  fixedPageType="title"
                />
              </CanvasContainer>
            )}
            
            {currentSpread.type === 'spread' && (
              <CanvasContainer zoom={zoom} onZoomChange={setZoom}>
                <PreviewSpreadCanvas
                  spread={currentSpread.content as Spread}
                  basePage={currentSpread.pageNumber}
                  pageSize={pageDimensions}
                />
              </CanvasContainer>
            )}
            
            {currentSpread.type === 'ending' && (
              <CanvasContainer zoom={zoom} onZoomChange={setZoom}>
                <PreviewSpreadCanvas
                  spread={createFixedPageSpread(currentSpread.content, 'ending')}
                  basePage={currentSpread.pageNumber}
                  pageSize={pageDimensions}
                  isFixedPage={true}
                  fixedPageType="ending"
                />
              </CanvasContainer>
            )}
          </div>
        </div>


      </div>
    </div>
  );
}
