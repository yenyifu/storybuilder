"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Copy, Trash2, ArrowUp, ArrowDown, LayoutGrid } from 'lucide-react';
import { cn } from "@/lib/utils";
import { type Spread } from "@/lib/layout-types";

export function SpreadsSidebar({
  spreads,
  currentIndex,
  onSelect,
  onAdd,
  onDuplicate,
  onDelete,
  onReorder,
}: {
  spreads: Spread[];
  currentIndex: number;
  onSelect: (i: number) => void;
  onAdd: () => void;
  onDuplicate: (i: number) => void;
  onDelete: (i: number) => void;
  onReorder: (i: number, dir: "up" | "down") => void;
}) {
  return (
    <aside className="w-64 shrink-0 h-full bg-white/70 backdrop-blur border-r border-gray-200 flex flex-col">
      <div className="flex items-center justify-between px-3 py-3">
        <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
          <LayoutGrid className="h-4 w-4 text-purple-700" />
          Spreads
        </div>
        <Button size="sm" variant="outline" onClick={onAdd}>
          <Plus className="h-4 w-4" /> <span className="ml-1">New</span>
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="space-y-3">
          {spreads.map((sp, i) => {
            const leftPreview = sp.left.image || "/open-book-left-page.png";
            const rightPreview = sp.right.image || "/open-book-right-page.png";
            return (
              <Card
                key={sp.id}
                className={cn(
                  "p-2 cursor-pointer border flex items-center gap-2",
                  i === currentIndex ? "ring-2 ring-purple-300 border-purple-300" : "hover:border-purple-200"
                )}
                onClick={() => onSelect(i)}
              >
                <div className="w-20 h-[56px] overflow-hidden rounded bg-white border">
                  <img src={leftPreview || "/placeholder.svg"} alt={`Spread ${i + 1} left`} className="w-full h-full object-cover" />
                </div>
                <div className="w-20 h-[56px] overflow-hidden rounded bg-white border">
                  <img src={rightPreview || "/placeholder.svg"} alt={`Spread ${i + 1} right`} className="w-full h-full object-cover" />
                </div>
                <div className="ml-auto flex flex-col gap-1">
                  <button
                    className="text-gray-500 hover:text-purple-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReorder(i, "up");
                    }}
                    aria-label="Move up"
                    title="Move up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    className="text-gray-500 hover:text-purple-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReorder(i, "down");
                    }}
                    aria-label="Move down"
                    title="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-col gap-1 ml-1">
                  <button
                    className="text-gray-500 hover:text-purple-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(i);
                    }}
                    aria-label="Duplicate"
                    title="Duplicate"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    className="text-gray-500 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(i);
                    }}
                    aria-label="Delete"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
