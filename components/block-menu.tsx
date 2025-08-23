"use client";

import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BlockMenuProps {
  children: React.ReactNode;
  position?: "left" | "right";
  icon?: React.ReactNode;
  iconClassName?: string;
  alwaysVisible?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BlockMenu({ 
  children, 
  position = "right", 
  icon = <MoreVertical className="h-3 w-3" />,
  iconClassName = "",
  alwaysVisible = false,
  open,
  onOpenChange
}: BlockMenuProps) {
  return (
    <div className={`absolute ${position === "left" ? "-left-8" : "-right-8"} -top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 ${alwaysVisible ? "opacity-100" : ""}`}>
      <DropdownMenu open={open} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`h-6 w-6 rounded-lg bg-white/90 hover:bg-gray-100 shadow-sm border text-xs p-0 ${iconClassName}`}
          >
            {icon}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {children}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
