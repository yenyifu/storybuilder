"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { BlockMenu } from "./block-menu";
import { Loader2, Upload, Crop, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PageBlock } from "@/lib/layout-types";

interface ImageBlockProps {
  block: PageBlock;
  selected: boolean;
  pageSize: { w: number; h: number };
  onChange: (partial: Partial<PageBlock>) => void;
  onDelete?: () => void;
  onClick?: () => void;
  onDragStart?: (e: React.PointerEvent) => void;
}

export function ImageBlock({ block, selected, pageSize, onChange, onDelete, onClick, onDragStart }: ImageBlockProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<"n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw" | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        duration: 5000,
      });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      
      // Validate the image
      const testImg = new Image();
      testImg.onload = () => {
        setIsUploading(false);
        onChange({ image: dataUrl });
        setIsMenuOpen(false); // Auto-close menu after successful upload
      };
      testImg.onerror = () => {
        setIsUploading(false);
        toast({
          title: "Invalid image format",
          description: "The selected file is not a valid image.",
          duration: 5000,
        });
      };
      testImg.src = dataUrl;
    };

    reader.onerror = () => {
      setIsUploading(false);
      toast({
        title: "Upload error",
        description: "Failed to read the image file.",
        duration: 5000,
      });
    };

    reader.readAsDataURL(file);
  }

  function handleImageUpload() {
    fileInputRef.current?.click();
  }

  function handleGenerateImage() {
    // TODO: Implement AI image generation
    toast({
      title: "Coming soon",
      description: "AI image generation will be available soon.",
    });
  }

  function startResize(e: React.PointerEvent, direction: "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw") {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
  }

  function handleResize(e: React.PointerEvent) {
    if (!isResizing || !resizeDirection) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const deltaX = e.clientX - rect.left;
    const deltaY = e.clientY - rect.top;

    const minSize = 20;
    let newX = block.x;
    let newY = block.y;
    let newW = block.w;
    let newH = block.h;

    if (resizeDirection.includes("e")) {
      newW = Math.max(minSize, deltaX);
    }
    if (resizeDirection.includes("w")) {
      const newWidth = Math.max(minSize, block.w - deltaX);
      newX = block.x + block.w - newWidth;
      newW = newWidth;
    }
    if (resizeDirection.includes("s")) {
      newH = Math.max(minSize, deltaY);
    }
    if (resizeDirection.includes("n")) {
      const newHeight = Math.max(minSize, block.h - deltaY);
      newY = block.y + block.h - newHeight;
      newH = newHeight;
    }

    onChange({ x: newX, y: newY, w: newW, h: newH });
  }

  function endResize() {
    setIsResizing(false);
    setResizeDirection(null);
  }

  function startCrop(e: React.PointerEvent) {
    e.stopPropagation();
    setIsCropping(true);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCropStart({ x, y });
    setCropArea({ x, y, w: 0, h: 0 });
  }

  function handleCropMove(e: React.PointerEvent) {
    if (!isCropping) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCropArea({
      x: Math.min(cropStart.x, x),
      y: Math.min(cropStart.y, y),
      w: Math.abs(x - cropStart.x),
      h: Math.abs(y - cropStart.y),
    });
  }

  function applyCrop() {
    // TODO: Implement actual cropping logic
    setIsCropping(false);
    toast({
      title: "Crop applied",
      description: "Image cropping will be implemented soon.",
    });
  }

  function cancelCrop() {
    setIsCropping(false);
    setCropArea({ x: 0, y: 0, w: 0, h: 0 });
  }

  return (
    <div
      className={`absolute cursor-grab active:cursor-grabbing group border-0 p-0 ${
        selected ? "ring-2 ring-primary" : ""
      }`}
      style={{
        left: block.x,
        top: block.y,
        width: block.w,
        height: block.h,
        zIndex: block.z ?? 1,
      }}
      onClick={(e) => {
        e.stopPropagation();
        console.log('ImageBlock clicked, selected:', selected);
        onClick?.();
      }}
      onPointerDown={onDragStart}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Block Menu */}
      <BlockMenu 
        position="left"
        open={isMenuOpen}
        onOpenChange={setIsMenuOpen}
      >
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={handleImageUpload}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Image
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => setIsCropping(true)}
        >
          <Crop className="mr-2 h-4 w-4" />
          Crop
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={handleGenerateImage}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Generate AI Image
        </Button>
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-red-600"
            onClick={onDelete}
          >
            Delete
          </Button>
        )}
      </BlockMenu>

      {/* Image Content */}
      <div className="h-full w-full relative">
        {isUploading ? (
          <div className="h-full w-full bg-gray-100 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : block.image ? (
          <img
            src={block.image}
            alt=""
            className="h-full w-full object-cover"
            style={{
              transform: `scale(${block.zoom || 1}) translate(${block.offsetX || 0}px, ${block.offsetY || 0}px)`,
            }}
          />
        ) : (
          <div className="h-full w-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-500">Click to upload image</span>
          </div>
        )}

        {/* Crop Overlay */}
        {isCropping && (
          <div
            className="absolute inset-0 bg-black/50 cursor-crosshair"
            onPointerDown={startCrop}
            onPointerMove={handleCropMove}
          >
            {cropArea.w > 0 && cropArea.h > 0 && (
              <div
                className="absolute border-2 border-white border-dashed"
                style={{
                  left: cropArea.x,
                  top: cropArea.y,
                  width: cropArea.w,
                  height: cropArea.h,
                }}
              >
                <div className="absolute -top-8 left-0 flex gap-2">
                  <Button size="sm" onClick={applyCrop}>
                    Apply
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelCrop}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

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
    </div>
  );
}
