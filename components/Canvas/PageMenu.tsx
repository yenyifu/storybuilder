"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { BlockMenu } from "@/components/block-menu";

interface PageMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddText: () => void;
  onAddImage: () => void;
}

export const PageMenu = memo(function PageMenu({ isOpen, onOpenChange, onAddText, onAddImage }: PageMenuProps) {
  return (
    <div className="absolute left-0 -top-6 z-20">
      <BlockMenu 
        position="right" 
        alwaysVisible={true}
        open={isOpen}
        onOpenChange={onOpenChange}
      >
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={onAddText}
        >
          Add text
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={onAddImage}
        >
          Add image
        </Button>
      </BlockMenu>
    </div>
  );
});
