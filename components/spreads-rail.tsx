"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Copy, Trash2, ArrowUp, ArrowDown, LayoutGrid, X, Check } from "lucide-react"
import type { Spread, PageBlock } from "@/lib/layout-types"

export function SpreadsRail({
  spreads,
  currentIndex,
  onSelect,
  onAdd,
  onDuplicate,
  onDelete,
  onMove,
  onClose,
}: {
  spreads: Spread[]
  currentIndex: number
  onSelect: (i: number) => void
  onAdd: () => void
  onDuplicate: (i: number) => void
  onDelete: (i: number) => void
  onMove: (i: number, dir: "up" | "down") => void
  onClose?: () => void
}) {
  return (
    <aside className="h-full w-[200px] lg:w-[220px] shrink-0 px-2 py-2">
      <div className="h-full rounded-2xl bg-white/85 backdrop-blur border border-gray-200 shadow-sm flex flex-col">
        {/* Top controls row */}
        <div className="flex items-center justify-between px-3 pt-3">
          <div className="flex items-center gap-2">
            <button
              className="h-8 w-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center"
              title="Grid view"
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4 text-gray-700" />
            </button>
          </div>
          <button
            className="h-8 w-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation()
              onClose?.()
            }}
            title="Close filmstrip"
            aria-label="Close filmstrip"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Segmented "+ New" control */}
        <div className="px-3 pt-3">
          <div className="w-full flex items-center rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <button
              className="flex-1 h-10 px-3 text-sm font-medium text-gray-800 flex items-center gap-2"
              onClick={onAdd}
            >
              <Plus className="h-4 w-4 text-gray-800" />
              New
            </button>
            <div className="h-10 w-px bg-gray-200" />
            <button className="h-10 w-10 flex items-center justify-center" aria-label="Done" title="Done">
              <Check className="h-4 w-4 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Spreads list */}
        <div className="mt-3 flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="px-3 pb-4 space-y-3">
              {spreads.map((sp, i) => (
                <SpreadCard
                  key={sp.id}
                  index={i}
                  leftBlocks={sp.left.blocks}
                  rightBlocks={sp.right.blocks}
                  legacyLeftText={sp.left.text}
                  legacyRightText={sp.right.text}
                  legacyLeftImage={sp.left.image}
                  legacyRightImage={sp.right.image}
                  selected={i === currentIndex}
                  onClick={() => onSelect(i)}
                  onDuplicate={() => onDuplicate(i)}
                  onDelete={() => onDelete(i)}
                  onMoveUp={() => onMove(i, "up")}
                  onMoveDown={() => onMove(i, "down")}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </aside>
  )
}

function firstOfType(blocks: PageBlock[] | undefined, type: "text" | "image") {
  return (blocks || []).find((b) => b.type === type)
}

function SpreadCard({
  index,
  leftBlocks,
  rightBlocks,
  legacyLeftText,
  legacyRightText,
  legacyLeftImage,
  legacyRightImage,
  selected,
  onClick,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  index: number
  leftBlocks?: PageBlock[]
  rightBlocks?: PageBlock[]
  legacyLeftText: string
  legacyRightText: string
  legacyLeftImage: string | null
  legacyRightImage: string | null
  selected: boolean
  onClick: () => void
  onDuplicate: () => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const leftText = firstOfType(leftBlocks, "text")?.text || legacyLeftText
  const rightText = firstOfType(rightBlocks, "text")?.text || legacyRightText
  const leftImage = firstOfType(leftBlocks, "image")?.image || legacyLeftImage
  const rightImage = firstOfType(rightBlocks, "image")?.image || legacyRightImage

  const leftNum = index * 2 + 1
  const rightNum = leftNum + 1

  return (
    <div className="relative group" onClick={onClick}>
      <Card
        className={cn(
          "overflow-hidden border bg-white shadow-sm hover:shadow transition-shadow cursor-pointer",
          selected ? "ring-2 ring-sky-300 border-sky-300 shadow-md" : "hover:border-purple-200",
        )}
      >
        {/* Combined spread thumbnail — landscape pages */}
        <div className="h-[84px] w-full">
          <div className="flex h-full">
            {/* Left page (landscape) */}
            <div className="w-1/2 h-full p-2">
              <div className="relative w-full h-full rounded-md border border-gray-200 overflow-hidden bg-white">
                {leftImage ? (
                  <img
                    src={leftImage || "/placeholder.svg?height=84&width=150&query=left-page-thumbnail"}
                    alt="Left page"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 p-2 text-[9px] leading-[11px] text-gray-700 line-clamp-4 whitespace-pre-wrap">
                    {leftText || "Add text"}
                  </div>
                )}
                <div
                  className="absolute bottom-1 left-1 h-3 w-3 rounded-full bg-black/25 text-white text-[8px] flex items-center justify-center"
                  title={`Page ${leftNum}`}
                  aria-hidden="true"
                >
                  {leftNum}
                </div>
              </div>
            </div>
            {/* Right page (landscape) */}
            <div className="w-1/2 h-full p-2">
              <div className="relative w-full h-full rounded-md border border-gray-200 overflow-hidden bg-gray-50">
                {rightImage ? (
                  <img
                    src={rightImage || "/placeholder.svg?height=84&width=150&query=right-page-thumbnail"}
                    alt="Right page"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 p-2 text-[9px] leading-[11px] text-gray-700 line-clamp-4 whitespace-pre-wrap">
                    {rightText || "Add text"}
                  </div>
                )}
                <div
                  className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-black/25 text-white text-[8px] flex items-center justify-center"
                  title={`Page ${rightNum}`}
                  aria-hidden="true"
                >
                  {rightNum}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Hover actions (top-right) */}
      <div className="absolute top-2 right-2 hidden gap-1 group-hover:flex" onClick={(e) => e.stopPropagation()}>
        <ActionIcon title="Move up" onClick={onMoveUp}>
          <ArrowUp className="h-3.5 w-3.5" />
        </ActionIcon>
        <ActionIcon title="Move down" onClick={onMoveDown}>
          <ArrowDown className="h-3.5 w-3.5" />
        </ActionIcon>
        <ActionIcon title="Duplicate" onClick={onDuplicate}>
          <Copy className="h-3.5 w-3.5" />
        </ActionIcon>
        <ActionIcon title="Delete" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5" />
        </ActionIcon>
      </div>
    </div>
  )
}

function ActionIcon({
  title,
  onClick,
  children,
}: {
  title: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      className="h-7 w-7 rounded-md bg-white/90 border border-gray-200 shadow-sm flex items-center justify-center text-gray-700"
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  )
}
