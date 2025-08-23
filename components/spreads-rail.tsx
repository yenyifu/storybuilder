"use client";

import type React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  X,
  Check,
  BookOpen,
  FileText,
  BookMarked,
} from "lucide-react";
import type { Spread, PageBlock, FixedPage } from "@/lib/layout-types";
import { colors } from "@/lib/colors";

export function SpreadsRail({
  spreads,
  fixedPages,
  currentIndex,
  onSelect,
  onAdd,
  onDuplicate,
  onDelete,
  onMove,
  onClose,
}: {
  spreads: Spread[];
  fixedPages: {
    cover: FixedPage;
    title: FixedPage;
    ending: FixedPage;
  };
  currentIndex: number;
  onSelect: (i: number) => void;
  onAdd: () => void;
  onDuplicate: (i: number) => void;
  onDelete: (i: number) => void;
  onMove: (i: number, dir: "up" | "down") => void;
  onClose?: () => void;
}) {
  return (
    <div className="h-full rounded-2xl bg-white border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium text-gray-700">
          Spreads
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <ScrollArea className="h-[calc(100%-3rem)] pr-2">
        <div className="space-y-3">
          {/* Add Spread Button */}
          <button
            onClick={onAdd}
            className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">New page</span>
          </button>

          {/* Cover Page - Both pages editable */}
          <div
            className={cn(
              "cursor-pointer rounded-lg p-2 transition-all",
              currentIndex === 0 
                ? "border-2 border-[#FFAD94] bg-[#FFAD94]/5" 
                : "border border-transparent hover:border-[#FFAD94]/30"
            )}
            onClick={() => onSelect(0)}
          >
            <div className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              Cover
            </div>
            <div className="flex gap-1">
              {/* Left page - back cover (editable) */}
              <div className="w-16 h-20 bg-white border border-gray-200 rounded flex items-center justify-center relative">
                <div className="text-xs text-gray-600 text-center">Back</div>
              </div>
              {/* Right page - front cover (editable) */}
              <div className="w-16 h-20 bg-white border border-gray-200 rounded flex items-center justify-center relative">
                <div className="text-xs text-gray-600 text-center">Front</div>
              </div>
            </div>
          </div>

          {/* Title Page - Single page on right */}
          <div
            className={cn(
              "cursor-pointer rounded-lg p-2 transition-all",
              currentIndex === 1 
                ? "border-2 border-[#FFAD94] bg-[#FFAD94]/5" 
                : "border border-transparent hover:border-[#FFAD94]/30"
            )}
            onClick={() => onSelect(1)}
          >
            <div className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Title Page
            </div>
            <div className="flex gap-1">
              {/* Left page - blank */}
              <div className="w-16 h-20 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                <span className="text-xs text-gray-400">Blank</span>
              </div>
              {/* Right page - title content */}
              <div className="w-16 h-20 bg-white border border-gray-200 rounded flex items-center justify-center relative">
                <div className="text-xs text-gray-600 text-center">Title</div>
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xs text-gray-400">1</span>
                </div>
              </div>
            </div>
          </div>

          {/* Story Spreads - Two pages side by side */}
          {spreads.map((spread, i) => {
            const spreadIndex = i + 2; // Account for cover (2 pages) and title (1 page), but page numbers start from title
            return (
              <div
                key={spread.id}
                className={cn(
                  "cursor-pointer rounded-lg p-2 transition-all",
                  currentIndex === spreadIndex 
                    ? "border-2 border-[#FFAD94] bg-[#FFAD94]/5" 
                    : "border border-transparent hover:border-[#FFAD94]/30"
                )}
                onClick={() => onSelect(spreadIndex)}
              >
                <div className="text-xs font-medium text-gray-600 mb-2">
                  Spread {i + 1}
                </div>
                <div className="flex gap-1">
                  {/* Left page */}
                  <div className="w-16 h-20 bg-white border border-gray-200 rounded flex items-center justify-center relative">
                    <div className="text-xs text-gray-600 text-center">Page {spreadIndex}</div>
                    <div className="absolute bottom-1 left-1 w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs text-gray-400">{spreadIndex}</span>
                    </div>
                  </div>
                  {/* Right page */}
                  <div className="w-16 h-20 bg-white border border-gray-200 rounded flex items-center justify-center relative">
                    <div className="text-xs text-gray-600 text-center">Page {spreadIndex + 1}</div>
                    <div className="absolute bottom-1 right-1 w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs text-gray-400">{spreadIndex + 1}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Ending Page - Single page on left */}
          <div
            className={cn(
              "cursor-pointer rounded-lg p-2 transition-all",
              currentIndex === spreads.length + 3 
                ? "border-2 border-[#FFAD94] bg-[#FFAD94]/5" 
                : "border border-transparent hover:border-[#FFAD94]/30"
            )}
            onClick={() => onSelect(spreads.length + 3)}
          >
            <div className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
              <BookMarked className="h-3 w-3" />
              Ending Page
            </div>
            <div className="flex gap-1">
              {/* Left page - ending content */}
              <div className="w-16 h-20 bg-white border border-gray-200 rounded flex items-center justify-center relative">
                <div className="text-xs text-gray-600 text-center">Ending</div>
                <div className="absolute bottom-1 left-1 w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xs text-gray-400">{spreads.length + 4}</span>
                </div>
              </div>
              {/* Right page - blank */}
              <div className="w-16 h-20 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                <span className="text-xs text-gray-400">Blank</span>
              </div>
            </div>
          </div>


        </div>
      </ScrollArea>
    </div>
  );
}
