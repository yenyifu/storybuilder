"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Palette,
  Trash2,
  Square,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PageBlock } from "@/lib/layout-types";

interface TextEditorMenuProps {
  block: PageBlock;
  onChange: (partial: Partial<PageBlock>) => void;
  onDelete?: () => void;
}

export function TextEditorMenu({ block, onChange, onDelete }: TextEditorMenuProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const fontSizes = [
    { label: "Small", size: 14 },
    { label: "Normal", size: 16 },
    { label: "Medium", size: 18 },
    { label: "Large", size: 22 },
    { label: "Extra Large", size: 28 },
  ];

  // Get current text size label
  const getCurrentTextSizeLabel = () => {
    const currentSize = block.fontSize || 16;
    const sizeOption = fontSizes.find(option => option.size === currentSize);
    return sizeOption ? `${sizeOption.label} text` : "Normal text";
  };



  const colors = [
    "#000000", "#374151", "#6B7280", "#9CA3AF", "#D1D5DB",
    "#EF4444", "#F97316", "#EAB308", "#22C55E", "#3B82F6",
    "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#06B6D4",
  ];

  const backgroundColors = [
    "#FFFFFF", "#F3F4F6", "#E5E7EB", "#D1D5DB", "#9CA3AF",
    "#FEF2F2", "#FEF3C7", "#F0FDF4", "#EFF6FF", "#F3E8FF",
    "#FDF2F8", "#FFFBEB", "#ECFDF5", "#F0F9FF", "#FEF7FF",
  ];

  const opacityOptions = [
    { label: "0%", value: 0 },
    { label: "25%", value: 0.25 },
    { label: "50%", value: 0.5 },
    { label: "75%", value: 0.75 },
    { label: "100%", value: 1 },
  ];

  return (
    <div className="absolute -top-12 left-0 bg-white border shadow-lg rounded-lg p-1 flex items-center gap-2 z-50">
      {/* Group 1: Text Size */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-sm font-medium hover:bg-gray-100"
          >
            {getCurrentTextSizeLabel()}
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={() => onChange({ fontSize: 14 })}>
            Small text
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChange({ fontSize: 16 })}>
            Normal text
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChange({ fontSize: 18 })}>
            Medium text
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChange({ fontSize: 22 })}>
            Large text
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChange({ fontSize: 28 })}>
            Extra large text
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Group 2: Text Color */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2 hover:bg-gray-100">
            <div className="flex items-center gap-1">
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold">A</span>
                <div 
                  className="w-4 h-0.5 bg-gray-600 rounded"
                  style={{ backgroundColor: block.color || "#374151" }}
                />
              </div>
              <ChevronDown className="h-3 w-3" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <div className="grid grid-cols-5 gap-1 p-2">
            {colors.map((color) => (
              <button
                key={color}
                className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => onChange({ color })}
                title={color}
              />
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Group 3: Style - Bold, Italic, Underline */}
      <div className="flex items-center gap-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 font-bold hover:bg-gray-100 flex items-center justify-center"
          onClick={() => {/* TODO: Add fontWeight support */}}
        >
          B
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 italic hover:bg-gray-100 flex items-center justify-center"
          onClick={() => {/* TODO: Add fontStyle support */}}
        >
          I
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 underline hover:bg-gray-100 flex items-center justify-center"
          onClick={() => {/* TODO: Add textDecoration support */}}
        >
          U
        </Button>
      </div>

      {/* Group 4: Background Color */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2 hover:bg-gray-100">
            <div className="flex items-center gap-1">
              <Square className="h-3 w-3" />
              <div 
                className="w-4 h-4 rounded border border-gray-300"
                style={{ 
                  backgroundColor: block.backgroundColor || "#FFFFFF",
                  opacity: block.backgroundOpacity ?? 1
                }}
              />
              <ChevronDown className="h-3 w-3" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <div className="grid grid-cols-5 gap-1 p-2">
            {backgroundColors.map((color) => (
              <button
                key={color}
                className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => onChange({ backgroundColor: color })}
                title={color}
              />
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Group 5: Background Opacity */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2 hover:bg-gray-100">
            <div className="flex items-center gap-1">
              <span className="text-sm">{(block.backgroundOpacity ?? 1) * 100}%</span>
              <ChevronDown className="h-3 w-3" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {opacityOptions.map((option) => (
            <DropdownMenuItem 
              key={option.value}
              onClick={() => onChange({ backgroundOpacity: option.value })}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Group 6: Lists - Numbered and Bulleted */}
      <div className="flex items-center gap-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-gray-100 flex items-center justify-center"
          onClick={() => onChange({ listType: block.listType === "numbered" ? "none" : "numbered" })}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-gray-100 flex items-center justify-center"
          onClick={() => onChange({ listType: block.listType === "bullet" ? "none" : "bullet" })}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      {/* Group 7: Alignment */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 flex items-center justify-center">
            <AlignLeft className="h-2.5 w-2.5" />
            <ChevronDown className="h-2 w-2 ml-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => onChange({ align: "left" })}>
            <AlignLeft className="mr-2 h-4 w-4" />
            Align left
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChange({ align: "center" })}>
            <AlignCenter className="mr-2 h-4 w-4" />
            Align center
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChange({ align: "right" })}>
            <AlignRight className="mr-2 h-4 w-4" />
            Align right
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Group 8: Delete */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 flex items-center justify-center"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
