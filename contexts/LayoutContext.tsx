"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { BookLayout } from "@/lib/layout-types";

interface LayoutContextType {
  layout: BookLayout | null;
  setLayout: (layout: BookLayout | null) => void;
  orientation: "portrait" | "landscape";
  setOrientation: (orientation: "portrait" | "landscape") => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [layout, setLayout] = useState<BookLayout | null>(null);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("landscape");

  return (
    <LayoutContext.Provider value={{ layout, setLayout, orientation, setOrientation }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}
