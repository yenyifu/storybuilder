"use client";

import { useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { AlignCenter, AlignLeft, AlignRight, ImageIcon, Minus, Plus, Type } from 'lucide-react';
import { cn } from "@/lib/utils";
import { type Spread, type PageContent } from "@/lib/layout-types";

export function SpreadCanvas({
  spread,
  zoom,
  onZoomChange,
  showGrid,
  onUpdatePage,
  onSelect,
  selectedSide,
  selectedElement,
}: {
  spread: Spread;
  zoom: number;
  showGrid: boolean;
  onZoomChange: (z: number) => void;
  onUpdatePage: (partial: Partial<PageContent>, side: "left" | "right") => void;
  onSelect: (side: "left" | "right", el: "text" | "image") => void;
  selectedSide: "left" | "right";
  selectedElement: "text" | "image";
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scaled = Math.max(0.6, Math.min(1.6, zoom));
  const gridClass = showGrid ? "bg-[linear-gradient(#eee_1px,transparent_1px),linear-gradient(90deg,#eee_1px,transparent_1px)] bg-[length:24px_24px]" : "";

  const left = spread.left;
  const right = spread.right;

  return (
    <div className="h-full relative">
      {/* Floating right toolbar */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20">
        <div className="flex flex-col items-center gap-2">
          <Card className="p-2 flex flex-col items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => onZoomChange(Math.min(1.6, scaled + 0.1))}>
              <Plus className="h-4 w-4" />
            </Button>
            <div className="text-xs text-gray-600 w-10 text-center">{Math.round(scaled * 100)}%</div>
            <Button variant="ghost" size="icon" onClick={() => onZoomChange(Math.max(0.6, scaled - 0.1))}>
              <Minus className="h-4 w-4" />
            </Button>
          </Card>

          <Card className="p-2 flex flex-col items-center gap-2 mt-2">
            <Button
              variant={selectedElement === "text" ? "default" : "ghost"}
              size="icon"
              className={cn(selectedElement === "text" ? "bg-purple-600 hover:bg-purple-700" : "")}
              onClick={() => onSelect(selectedSide, "text")}
              title="Text tool"
            >
              <Type className="h-4 w-4" />
            </Button>
            <Button
              variant={selectedElement === "image" ? "default" : "ghost"}
              size="icon"
              className={cn(selectedElement === "image" ? "bg-purple-600 hover:bg-purple-700" : "")}
              onClick={() => onSelect(selectedSide, "image")}
              title="Image tool"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </Card>
        </div>
      </div>

      {/* Canvas scroll area */}
      <div ref={containerRef} className="h-full overflow-auto px-6 py-6">
        <div
          className={cn(
            "mx-auto w-[1100px] max-w-[95%] min-w-[780px] transition-transform origin-top",
            gridClass
          )}
          style={{ transform: `scale(${scaled})` }}
        >
          {/* Spread (two pages) */}
          <div className="flex gap-4">
            <Page
              side="left"
              content={left}
              isSelected={selectedSide === "left"}
              onClick={() => onSelect("left", selectedElement)}
              onChange={(partial) => onUpdatePage(partial, "left")}
              selectedElement={selectedElement}
            />
            <Page
              side="right"
              content={right}
              isSelected={selectedSide === "right"}
              onClick={() => onSelect("right", selectedElement)}
              onChange={(partial) => onUpdatePage(partial, "right")}
              selectedElement={selectedElement}
            />
          </div>
        </div>
      </div>

      {/* Bottom text controls, applied to selected page */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <Card className="px-3 py-2 flex items-center gap-3">
          <span className="text-xs text-gray-600">Text size</span>
          <Slider
            className="w-40"
            value={[selectedSide === "left" ? left.fontSize : right.fontSize]}
            onValueChange={([v]) => onUpdatePage({ fontSize: v }, selectedSide)}
            min={14}
            max={36}
            step={1}
          />
          <div className="w-10 text-xs text-gray-700">
            {selectedSide === "left" ? left.fontSize : right.fontSize}px
          </div>
          <div className="h-5 w-px bg-gray-200 mx-2" />
          <Button
            variant={selectedSide === "left" ? (left.align === "left" ? "default" : "outline") : (right.align === "left" ? "default" : "outline")}
            size="icon"
            onClick={() => onUpdatePage({ align: "left" }, selectedSide)}
            title="Align left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={selectedSide === "left" ? (left.align === "center" ? "default" : "outline") : (right.align === "center" ? "default" : "outline")}
            size="icon"
            onClick={() => onUpdatePage({ align: "center" }, selectedSide)}
            title="Align center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant={selectedSide === "left" ? (left.align === "right" ? "default" : "outline") : (right.align === "right" ? "default" : "outline")}
            size="icon"
            onClick={() => onUpdatePage({ align: "right" }, selectedSide)}
            title="Align right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <div className="h-5 w-px bg-gray-200 mx-2" />
          <input
            type="color"
            value={selectedSide === "left" ? left.textColor : right.textColor}
            onChange={(e) => onUpdatePage({ textColor: e.target.value }, selectedSide)}
            aria-label="Text color"
            title="Text color"
          />
        </Card>
      </div>
    </div>
  );
}

function Page({
  side,
  content,
  isSelected,
  onClick,
  onChange,
  selectedElement,
}: {
  side: "left" | "right";
  content: PageContent;
  isSelected: boolean;
  onClick: () => void;
  onChange: (partial: Partial<PageContent>) => void;
  selectedElement: "text" | "image";
}) {
  const placeholder =
    side === "left"
      ? "/left-page-illustration.png"
      : "/right-page-illustration.png";

  return (
    <div
      className={cn(
        "relative w-[520px] h-[680px] rounded-xl bg-white shadow-lg border overflow-hidden",
        isSelected ? "ring-4 ring-purple-300" : "ring-0"
      )}
      onClick={onClick}
      role="group"
      aria-label={`${side} page`}
    >
      {/* Image area */}
      <div
        className={cn(
          "absolute inset-0",
          selectedElement === "image" && isSelected ? "outline outline-2 outline-purple-300" : ""
        )}
        onClick={() => onClick()}
      >
        <img
          src={content.image ?? placeholder}
          alt={content.image ? "Page illustration" : "Placeholder illustration"}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Text overlay panel */}
      <div
        className={cn(
          "absolute inset-6 bg-white/80 rounded-lg p-4 overflow-auto",
          selectedElement === "text" && isSelected ? "outline outline-2 outline-purple-300" : "outline-none"
        )}
        style={{
          textAlign: content.align as any,
          color: content.textColor,
          backdropFilter: "blur(2px)",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <textarea
          value={content.text}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="Type or paste this page's text..."
          className="w-full h-48 md:h-56 bg-transparent resize-vertical focus:outline-none"
          style={{ fontSize: `${content.fontSize}px`, lineHeight: 1.5 }}
        />
      </div>

      {/* Small controls inside page when image selected */}
      {selectedElement === "image" && isSelected && (
        <div className="absolute top-3 left-3 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onChange({
                image:
                  "/storybook-scene-kids.png"+(side==="left"?"left":"right"),
              });
            }}
          >
            Use placeholder
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onChange({ image: null });
            }}
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}
