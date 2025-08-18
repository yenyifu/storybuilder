"use client"

import type React from "react"

import { useRef, useState, useLayoutEffect } from "react"
import { cn } from "@/lib/utils"
import type { Spread, PageContent, PageBlock } from "@/lib/layout-types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  ListIcon,
  ListOrdered,
  Type,
  ZoomIn,
  ZoomOut,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Palette,
  MoreVertical,
  ImagePlus,
  Sparkles,
  Crop,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function CanvasSpread({
  spread,
  zoom,
  onZoomChange,
  selectedSide,
  onSelectSide,
  onChangePage,
  onChangeBlock,
  basePage,
  pageSize,
  onDeleteBlock,
}: {
  spread: Spread
  zoom: number
  onZoomChange: (z: number) => void
  selectedSide: "left" | "right"
  onSelectSide: (s: "left" | "right") => void
  onChangePage: (partial: Partial<PageContent>, side: "left" | "right") => void
  onChangeBlock: (side: "left" | "right", blockId: string, partial: Partial<PageBlock>) => void
  onDeleteBlock?: (side: "left" | "right", blockId: string) => void
  basePage: number
  pageSize: { w: number; h: number }
}) {
  const scaled = Math.max(0.5, Math.min(1.6, zoom))
  const [selectedBlock, setSelectedBlock] = useState<null | { side: "left" | "right"; id: string }>(null)

  function select(side: "left" | "right", id?: string) {
    onSelectSide(side)
    if (id) setSelectedBlock({ side, id })
    else setSelectedBlock(null)
  }

  return (
    <div className="h-full overflow-auto px-6 py-6">
      <div
        className="mx-auto origin-top transition-transform"
        style={{ transform: `scale(${scaled})`, width: pageSize.w * 2 + 16 }}
      >
        <div className="flex gap-4 justify-center">
          <Page
            pageNumber={basePage}
            side="left"
            content={spread.left}
            selected={selectedSide === "left"}
            onSelect={() => select("left")}
            onChangePage={(p) => onChangePage(p, "left")}
            onChangeBlock={(id, p) => onChangeBlock("left", id, p)}
            onDeleteBlock={(id) => onDeleteBlock?.("left", id)}
            selectedBlockId={selectedBlock?.side === "left" ? selectedBlock.id : undefined}
            onSelectBlock={(id) => select("left", id)}
            pageSize={pageSize}
          />
          <Page
            pageNumber={basePage + 1}
            side="right"
            content={spread.right}
            selected={selectedSide === "right"}
            onSelect={() => select("right")}
            onChangePage={(p) => onChangePage(p, "right")}
            onChangeBlock={(id, p) => onChangeBlock("right", id, p)}
            onDeleteBlock={(id) => onDeleteBlock?.("right", id)}
            selectedBlockId={selectedBlock?.side === "right" ? selectedBlock.id : undefined}
            onSelectBlock={(id) => select("right", id)}
            pageSize={pageSize}
          />
        </div>
      </div>
    </div>
  )
}

function Page({
  pageNumber,
  side,
  content,
  selected,
  onSelect,
  onChangePage,
  onChangeBlock,
  onDeleteBlock,
  selectedBlockId,
  onSelectBlock,
  pageSize,
}: {
  pageNumber: number
  side: "left" | "right"
  content: PageContent
  selected: boolean
  onSelect: () => void
  onChangePage: (partial: Partial<PageContent>) => void
  onChangeBlock: (id: string, partial: Partial<PageBlock>) => void
  onDeleteBlock?: (id: string) => void
  selectedBlockId?: string
  onSelectBlock: (id: string) => void
  pageSize: { w: number; h: number }
}) {
  const pageRef = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null)

  const blocks = content.blocks ?? []

  function nextZ() {
    return (blocks.reduce((m, b) => Math.max(m, b.z ?? 0), 0) ?? 0) + 1
  }

  function startDrag(e: React.PointerEvent, b: PageBlock) {
    e.stopPropagation()
    const rect = pageRef.current?.getBoundingClientRect()
    if (!rect) return
    const offsetX = e.clientX - (rect.left + b.x)
    const offsetY = e.clientY - (rect.top + b.y)
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    setDrag({ id: b.id, offsetX, offsetY })
    onSelectBlock(b.id)
  }

  function onDragMove(e: React.PointerEvent) {
    if (!drag) return
    const rect = pageRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = Math.max(0, Math.min(pageSize.w - 10, e.clientX - rect.left - drag.offsetX))
    const y = Math.max(0, Math.min(pageSize.h - 10, e.clientY - rect.top - drag.offsetY))
    onChangeBlock(drag.id, { x, y })
  }

  function endDrag(e: React.PointerEvent) {
    if (!drag) return
    ;(e.target as Element).releasePointerCapture?.((e as any).pointerId)
    setDrag(null)
  }

  function addTextBlock() {
    const w = Math.max(260, Math.min(pageSize.w - 80, Math.floor(pageSize.w * 0.6)))
    const h = 160
    const newBlock: PageBlock = {
      id: crypto.randomUUID(),
      type: "text",
      x: Math.floor((pageSize.w - w) / 2),
      y: 40,
      w,
      h,
      text: "New text",
      fontSize: 22,
      align: "left",
      color: "#1f2937",
      fontFamily: "Inter, ui-sans-serif, system-ui, Arial",
      listType: "none",
      z: nextZ(),
    }
    onChangePage({ blocks: [...blocks, newBlock] })
    onSelectBlock(newBlock.id)
  }

  function addImageBlock() {
    const w = Math.floor(pageSize.w * 0.6)
    const h = Math.floor(pageSize.h * 0.6)
    const newBlock: PageBlock = {
      id: crypto.randomUUID(),
      type: "image",
      x: Math.floor((pageSize.w - w) / 2),
      y: Math.floor((pageSize.h - h) / 2),
      w,
      h,
      image: null,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      z: nextZ(),
    }
    onChangePage({ blocks: [...blocks, newBlock] })
    onSelectBlock(newBlock.id)
  }

  return (
    <div
      ref={pageRef}
      className={cn(
        "relative rounded-xl bg-white shadow-xl border overflow-hidden",
        selected ? "outline outline-4 outline-purple-300" : "outline-none",
      )}
      style={{ width: pageSize.w, height: pageSize.h }}
      onClick={onSelect}
      onPointerMove={onDragMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      role="button"
      aria-label={`${side} page`}
    >
      {/* Discreet overflow menu for adding content */}
      <div className="absolute top-2 left-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/85 hover:bg-white shadow-sm border"
              onClick={(e) => e.stopPropagation()}
              aria-label="Page menu"
              title="Page menu"
            >
              <MoreVertical className="h-4 w-4 text-gray-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="bottom" className="w-44">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                addTextBlock()
              }}
            >
              <Type className="mr-2 h-4 w-4" />
              Add Text
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                addImageBlock()
              }}
            >
              <ImagePlus className="mr-2 h-4 w-4" />
              Add Image
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Render blocks */}
      {blocks.map((b) => (
        <BlockShell
          key={b.id}
          b={b}
          selected={selectedBlockId === b.id}
          onDragStart={(e) => startDrag(e, b)}
          onClick={() => onSelectBlock(b.id)}
          onChange={(p) => onChangeBlock(b.id, p)}
          onDelete={() => onDeleteBlock?.(b.id)}
          pageSize={pageSize}
        />
      ))}

      {/* Page number */}
      <div className={cn("absolute bottom-2 right-2")} aria-hidden="true" title={`Page ${pageNumber}`}>
        <div className="h-3 w-3 rounded-full bg-black/25 text-white text-[8px] leading-none flex items-center justify-center">
          {pageNumber}
        </div>
      </div>
    </div>
  )
}

function BlockShell({
  b,
  selected,
  onDragStart,
  onClick,
  onChange,
  onDelete,
  pageSize,
}: {
  b: PageBlock
  selected: boolean
  onDragStart: (e: React.PointerEvent) => void
  onClick: () => void
  onChange: (partial: Partial<PageBlock>) => void
  onDelete: () => void
  pageSize: { w: number; h: number }
}) {
  const isText = b.type === "text"
  const isImage = b.type === "image"

  return (
    <div
      className="absolute group"
      style={{
        left: b.x,
        top: b.y,
        width: b.w,
        height: b.h,
        zIndex: b.z ?? 1,
      }}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      {/* Drag handle */}
      <div
        data-handle="drag"
        className="absolute -top-3 -left-3 h-6 w-6 rounded-full bg-white/95 border shadow-sm text-[10px] text-gray-700 flex items-center justify-center cursor-grab active:cursor-grabbing"
        onPointerDown={onDragStart}
        title="Drag block"
      >
        ::
      </div>

      {/* Content */}
      <div
        className={cn(
          "w-full h-full rounded-md border bg-transparent",
          selected ? "border-purple-300" : "border-transparent group-hover:border-gray-200",
        )}
      >
        {isImage ? (
          <div className="w-full h-full overflow-hidden">
            <img
              src={b.image || "/placeholder.svg?height=540&width=720&query=storybook%20image%20block"}
              alt="Image block"
              className="w-full h-full object-cover select-none"
              style={{
                transform: `translate(${b.offsetX ?? 0}px, ${b.offsetY ?? 0}px) scale(${b.zoom ?? 1})`,
                transformOrigin: "center",
              }}
              draggable={false}
            />
          </div>
        ) : (
          <div
            className="w-full h-full outline-none"
            contentEditable
            suppressContentEditableWarning
            style={{
              fontSize: b.fontSize ?? 22,
              lineHeight: 1.45,
              textAlign: (b.align || "left") as any,
              color: b.color || "#1f2937",
              fontFamily: b.fontFamily || "Inter, ui-sans-serif, system-ui, Arial",
              padding: 8,
              whiteSpace: "pre-wrap",
            }}
            onInput={(e) => {
              const text = (e.target as HTMLDivElement).innerText
              onChange({ text })
            }}
          >
            {b.text || ""}
          </div>
        )}
      </div>

      {/* Floating block toolbar (clamped inside the page) */}
      {selected && <BlockToolbar b={b} onChange={onChange} onDelete={onDelete} pageSize={pageSize} />}
    </div>
  )
}

function BlockToolbar({
  b,
  onChange,
  onDelete,
  pageSize,
}: {
  b: PageBlock
  onChange: (p: Partial<PageBlock>) => void
  onDelete: () => void
  pageSize: { w: number; h: number }
}) {
  const [showCrop, setShowCrop] = useState(false)
  const isText = b.type === "text"
  const isImage = b.type === "image"
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 260, h: 36 })
  const fileRef = useRef<HTMLInputElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const r = el.getBoundingClientRect()
      setSize({ w: r.width, h: r.height })
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const pad = 8
  const canPlaceAbove = b.y >= size.h + pad
  let top = canPlaceAbove ? -size.h - pad : b.h + pad
  const maxTop = pageSize.h - b.y - size.h - pad
  top = Math.min(top, maxTop)
  const minTop = -b.y + pad
  top = Math.max(top, minTop)

  let left = b.w / 2 - size.w / 2
  const minLeft = -b.x + pad
  const maxLeft = pageSize.w - (b.x + b.w) - size.w - pad
  left = Math.max(minLeft, Math.min(left, maxLeft))

  function handleUploadClick(e: React.MouseEvent) {
    e.stopPropagation()
    fileRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result)
      onChange({ image: dataUrl, zoom: 1, offsetX: 0, offsetY: 0 })
    }
    reader.readAsDataURL(file)
    // reset input
    e.currentTarget.value = ""
  }

  function handleGenerate() {
    const prompt = window.prompt("Describe the image to generate:", "cute watercolor forest scene for kids")
    if (!prompt) return
    const w = Math.max(100, Math.floor(b.w))
    const h = Math.max(100, Math.floor(b.h))
    const url = `/placeholder.svg?height=${h}&width=${w}&query=${encodeURIComponent(prompt)}`
    onChange({ image: url, zoom: 1, offsetX: 0, offsetY: 0 })
  }

  return (
    <Card
      ref={ref}
      className="absolute z-20 px-2 py-1 shadow-md border text-xs flex items-center gap-1 bg-white"
      style={{ top, left }}
      onClick={(e) => e.stopPropagation()}
    >
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* Delete for all */}
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7"
        title="Delete"
        aria-label="Delete"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {isText && (
        <>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          {/* Alignment */}
          <Button
            size="icon"
            variant={b.align === "left" || !b.align ? "default" : "ghost"}
            className="h-7 w-7"
            title="Align left"
            onClick={(e) => {
              e.stopPropagation()
              onChange({ align: "left" })
            }}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={b.align === "center" ? "default" : "ghost"}
            className="h-7 w-7"
            title="Align center"
            onClick={(e) => {
              e.stopPropagation()
              onChange({ align: "center" })
            }}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={b.align === "right" ? "default" : "ghost"}
            className="h-7 w-7"
            title="Align right"
            onClick={(e) => {
              e.stopPropagation()
              onChange({ align: "right" })
            }}
          >
            <AlignRight className="h-4 w-4" />
          </Button>

          {/* Font size */}
          <div className="flex items-center gap-1 ml-1">
            <span className="text-[10px] text-gray-500">A</span>
            <Slider
              className="w-20"
              value={[b.fontSize ?? 22]}
              min={14}
              max={40}
              step={1}
              onValueChange={([v]) => onChange({ fontSize: v })}
            />
          </div>

          {/* Font family */}
          <select
            className="ml-1 h-7 rounded border border-gray-200 text-xs px-1 bg-white"
            value={b.fontFamily || "Inter, ui-sans-serif, system-ui, Arial"}
            onChange={(e) => onChange({ fontFamily: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            title="Font"
          >
            <option value="Inter, ui-sans-serif, system-ui, Arial">Inter</option>
            <option value="'Comic Sans MS', 'Comic Sans', cursive">Comic Sans</option>
            <option value="Georgia, 'Times New Roman', serif">Georgia</option>
            <option value="'Trebuchet MS', Arial, sans-serif">Trebuchet</option>
          </select>

          {/* Color */}
          <label className="ml-1 inline-flex items-center gap-1 px-1">
            <Palette className="h-3.5 w-3.5 text-gray-600" />
            <input
              type="color"
              value={b.color || "#1f2937"}
              onChange={(e) => onChange({ color: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              className="h-6 w-6 p-0 border rounded"
              title="Text color"
              aria-label="Text color"
            />
          </label>

          {/* Bullets */}
          <Button
            size="icon"
            variant={b.listType === "bullet" ? "default" : "ghost"}
            className="h-7 w-7 ml-1"
            title="Bulleted list"
            onClick={(e) => {
              e.stopPropagation()
              onChange({ listType: b.listType === "bullet" ? "none" : "bullet" })
            }}
          >
            <ListIcon className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={b.listType === "numbered" ? "default" : "ghost"}
            className="h-7 w-7"
            title="Numbered list"
            onClick={(e) => {
              e.stopPropagation()
              onChange({ listType: b.listType === "numbered" ? "none" : "numbered" })
            }}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </>
      )}

      {isImage && (
        <>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          {/* Upload and AI generate */}
          <Button
            size="sm"
            variant="outline"
            className="h-7 bg-transparent"
            onClick={handleUploadClick}
            title="Upload image"
          >
            Upload
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 bg-transparent"
            onClick={(e) => {
              e.stopPropagation()
              handleGenerate()
            }}
            title="AI"
          >
            <Sparkles className="mr-1 h-4 w-4" />
            AI
          </Button>

          {/* Crop toggle */}
          <Button
            size="sm"
            variant={showCrop ? "default" : "outline"}
            className="h-7 bg-transparent"
            onClick={(e) => {
              e.stopPropagation()
              setShowCrop((s) => !s)
            }}
            title="Crop"
          >
            <Crop className="mr-1 h-4 w-4" />
            Crop
          </Button>

          {/* Crop controls (simple width/height adjust) */}
          {showCrop && (
            <div className="ml-1 inline-flex items-center gap-1">
              <div className="text-[10px] text-gray-500 mr-1">W</div>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                title="Narrower"
                onClick={(e) => {
                  e.stopPropagation()
                  const minW = 60
                  const newW = Math.max(minW, (b.w ?? 0) - 10)
                  onChange({ w: newW })
                }}
              >
                -
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                title="Wider"
                onClick={(e) => {
                  e.stopPropagation()
                  const maxW = Math.max(60, pageSize.w - b.x)
                  const newW = Math.min(maxW, (b.w ?? 0) + 10)
                  onChange({ w: newW })
                }}
              >
                +
              </Button>

              <div className="text-[10px] text-gray-500 ml-2 mr-1">H</div>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                title="Shorter"
                onClick={(e) => {
                  e.stopPropagation()
                  const minH = 60
                  const newH = Math.max(minH, (b.h ?? 0) - 10)
                  onChange({ h: newH })
                }}
              >
                -
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                title="Taller"
                onClick={(e) => {
                  e.stopPropagation()
                  const maxH = Math.max(60, pageSize.h - b.y)
                  const newH = Math.min(maxH, (b.h ?? 0) + 10)
                  onChange({ h: newH })
                }}
              >
                +
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7"
                title="Reset pan/zoom"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange({ zoom: 1, offsetX: 0, offsetY: 0 })
                }}
              >
                Reset
              </Button>
            </div>
          )}

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Zoom controls */}
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            title="Zoom out"
            onClick={(e) => {
              e.stopPropagation()
              const z = Math.max(1, Math.round(((b.zoom ?? 1) - 0.1) * 10) / 10)
              onChange({ zoom: z })
            }}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            <Slider
              className="w-20"
              value={[b.zoom ?? 1]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={([v]) => onChange({ zoom: Math.round(v * 10) / 10 })}
            />
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            title="Zoom in"
            onClick={(e) => {
              e.stopPropagation()
              const z = Math.min(3, Math.round(((b.zoom ?? 1) + 0.1) * 10) / 10)
              onChange({ zoom: z })
            }}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          {/* Pan controls */}
          <div className="flex items-center gap-0.5 ml-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              title="Pan up"
              onClick={(e) => {
                e.stopPropagation()
                onChange({ offsetY: (b.offsetY ?? 0) - 10 })
              }}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              title="Pan left"
              onClick={(e) => {
                e.stopPropagation()
                onChange({ offsetX: (b.offsetX ?? 0) - 10 })
              }}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              title="Pan right"
              onClick={(e) => {
                e.stopPropagation()
                onChange({ offsetX: (b.offsetX ?? 0) + 10 })
              }}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              title="Pan down"
              onClick={(e) => {
                e.stopPropagation()
                onChange({ offsetY: (b.offsetY ?? 0) + 10 })
              }}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </Card>
  )
}
