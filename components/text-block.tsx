"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { TextEditorMenu } from "./text-editor-menu";
import type { PageBlock } from "@/lib/layout-types";

interface TextBlockProps {
  block: PageBlock;
  selected: boolean;
  pageSize: { w: number; h: number };
  onChange: (partial: Partial<PageBlock>) => void;
  onDelete?: () => void;
  onClick?: () => void;
  onDragStart?: (e: React.PointerEvent) => void;
}

export function TextBlock({ block, selected, pageSize, onChange, onDelete, onClick, onDragStart }: TextBlockProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<"n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw" | null>(null);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const textBlockRef = useRef<HTMLDivElement>(null);

  // Handle click outside to dismiss text editor menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (textBlockRef.current && !textBlockRef.current.contains(event.target as Node)) {
        // Check if the click is on a dropdown menu (which is rendered outside the text block)
        const target = event.target as Element;
        const isDropdownMenu = target.closest('[data-radix-popper-content-wrapper]') || 
                              target.closest('[role="menu"]') ||
                              target.closest('[data-radix-dropdown-menu-content]');
        
        if (!isDropdownMenu) {
          setShowTextEditor(false);
        }
      }
    }

    if (showTextEditor) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showTextEditor]);

  function startResize(e: React.PointerEvent, direction: "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw") {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
  }

  function handleResize(e: React.PointerEvent) {
    if (!isResizing || !resizeDirection) return;

    // Get the page container to calculate relative positions
    const pageContainer = textBlockRef.current?.closest('.relative') as HTMLElement;
    if (!pageContainer) return;
    
    const pageRect = pageContainer.getBoundingClientRect();
    const mouseX = e.clientX - pageRect.left;
    const mouseY = e.clientY - pageRect.top;

    const minSize = 20;
    let newX = block.x;
    let newY = block.y;
    let newW = block.w;
    let newH = block.h;

    if (resizeDirection.includes("e")) {
      // Right edge - expand/shrink to the right
      newW = Math.max(minSize, mouseX - block.x);
    }
    if (resizeDirection.includes("w")) {
      // Left edge - expand/shrink to the left
      const rightEdge = block.x + block.w;
      const newWidth = Math.max(minSize, rightEdge - mouseX);
      newX = rightEdge - newWidth;
      newW = newWidth;
    }
    if (resizeDirection.includes("s")) {
      // Bottom edge - expand/shrink downward
      newH = Math.max(minSize, mouseY - block.y);
    }
    if (resizeDirection.includes("n")) {
      // Top edge - expand/shrink upward
      const bottomEdge = block.y + block.h;
      const newHeight = Math.max(minSize, bottomEdge - mouseY);
      newY = bottomEdge - newHeight;
      newH = newHeight;
    }

    onChange({ x: newX, y: newY, w: newW, h: newH });
  }

  function endResize() {
    setIsResizing(false);
    setResizeDirection(null);
  }

  function handlePointerDown(e: React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(false);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    
    // Always select the block when clicked
    console.log('TextBlock clicked, calling onClick, selected:', selected, 'block.id:', block.id);
    onClick?.();
    
    // Call the original onDragStart if provided
    if (onDragStart) {
      onDragStart(e);
    }
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragStartPos) return;
    
    const deltaX = Math.abs(e.clientX - dragStartPos.x);
    const deltaY = Math.abs(e.clientY - dragStartPos.y);
    
    // If we've moved more than 5px, consider it a drag
    if (deltaX > 5 || deltaY > 5) {
      setIsDragging(true);
    }
  }

  function handlePointerUp(e: React.PointerEvent) {
    setIsDragging(false);
    setDragStartPos({ x: 0, y: 0 });
  }

  return (
    <Card
      ref={textBlockRef}
      className={`absolute cursor-grab active:cursor-grabbing group p-0 ${
        selected ? "ring-2 ring-primary" : ""
      }`}
      style={{
        left: block.x,
        top: block.y,
        width: block.w,
        height: block.h,
        zIndex: block.z ?? 1,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={() => console.log('Card clicked directly!')}
    >
      {/* Background with opacity */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: block.backgroundColor || "transparent",
          opacity: block.backgroundOpacity ?? 1,
        }}
        onClick={(e) => {
          e.stopPropagation();
          console.log('Background clicked!', {
            backgroundColor: block.backgroundColor,
            backgroundOpacity: block.backgroundOpacity,
            opacity: block.backgroundOpacity ?? 1
          });
        }}
      />

      {/* Three dots menu - appears on hover */}
      <div className="absolute -top-2 -left-8 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-lg bg-white/90 hover:bg-gray-100 shadow-sm border text-xs p-0"
          onClick={() => setShowTextEditor(!showTextEditor)}
        >
          <MoreVertical className="h-3 w-3" />
        </Button>
      </div>

      {/* Text Editor Menu */}
      {showTextEditor && (
        <TextEditorMenu
          block={block}
          onChange={onChange}
          onDelete={onDelete}
        />
      )}

      {/* Textarea */}
      <textarea
        className="w-full h-full resize-none border-none outline-none bg-transparent px-2 m-0 border border-gray-200 relative z-10"
        value={block.text || ""}
        onChange={(e) => onChange({ text: e.target.value })}
        placeholder="Enter text..."
        style={{
          fontSize: block.fontSize,
          textAlign: block.align,
          color: block.color,
          fontFamily: block.fontFamily,
          lineHeight: '1.2',
        }}
        onClick={(e) => {
          e.stopPropagation();
          console.log('Textarea clicked!');
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          console.log('Textarea pointer down!');
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          console.log('Textarea pointer up!');
        }}
      />

      {/* Resize handles - only show when selected */}
      {selected && (
        <>
          {/* Corner handles */}
          <div
            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize border-2 border-white"
            onPointerDown={(e) => startResize(e, "nw")}
          />
          <div
            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize border-2 border-white"
            onPointerDown={(e) => startResize(e, "ne")}
          />
          <div
            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize border-2 border-white"
            onPointerDown={(e) => startResize(e, "sw")}
          />
          <div
            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize border-2 border-white"
            onPointerDown={(e) => startResize(e, "se")}
          />
          {/* Edge handles */}
          <div
            className="absolute top-1/2 -left-1.5 w-3 h-3 bg-blue-500 rounded-full cursor-w-resize -translate-y-1/2 border-2 border-white"
            onPointerDown={(e) => startResize(e, "w")}
          />
          <div
            className="absolute top-1/2 -right-1.5 w-3 h-3 bg-blue-500 rounded-full cursor-e-resize -translate-y-1/2 border-2 border-white"
            onPointerDown={(e) => startResize(e, "e")}
          />
          <div
            className="absolute -top-1.5 left-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-n-resize -translate-x-1/2 border-2 border-white"
            onPointerDown={(e) => startResize(e, "n")}
          />
          <div
            className="absolute -bottom-1.5 left-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-s-resize -translate-x-1/2 border-2 border-white"
            onPointerDown={(e) => startResize(e, "s")}
          />
        </>
      )}

      {/* Resize overlay */}
      {isResizing && (
        <div
          className="fixed inset-0 z-50"
          onPointerMove={handleResize}
          onPointerUp={endResize}
          onPointerLeave={endResize}
        />
      )}
    </Card>
  );
}
