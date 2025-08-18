"use client";

import { useEffect, useState } from "react";
import { chunkStory } from "@/lib/story-chunker";
import type { Spread, PageBlock, PageContent } from "@/lib/layout-types";
import { SpreadsRail } from "@/components/spreads-rail";
import { CanvasSpread } from "@/components/canvas-spread";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { colors } from "@/lib/colors";

const PAGE_W = 720; // 8x6 landscape (4:3) at 720x540
const PAGE_H = 540;

function pageFromText(text: string): PageContent {
  return {
    text,
    image: null,
    fontSize: 22,
    align: "left",
    textColor: "#1f2937",
    padding: 24,
    blocks: [
      {
        id: crypto.randomUUID(),
        type: "text",
        x: 40,
        y: 40,
        w: PAGE_W - 80,
        h: 180,
        text,
        fontSize: 22,
        align: "left",
        color: "#1f2937",
        fontFamily: "Inter, ui-sans-serif, system-ui, Arial",
        listType: "none",
        z: 1,
      },
    ],
  };
}

function makeInitialSpreads(storyText: string): Spread[] {
  const pages = chunkStory(storyText || "", 420);
  const spreads: Spread[] = [];
  for (let i = 0; i < Math.max(1, pages.length); i += 2) {
    spreads.push({
      id: crypto.randomUUID(),
      left: pageFromText(pages[i] ?? ""),
      right: pageFromText(pages[i + 1] ?? ""),
    });
  }
  if (!spreads.length) {
    spreads.push({
      id: crypto.randomUUID(),
      left: pageFromText(""),
      right: pageFromText(""),
    });
  }
  return spreads;
}

export default function LayoutBuilderPage() {
  const [spreads, setSpreads] = useState<Spread[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [selectedSide, setSelectedSide] = useState<"left" | "right">("left");
  const [railOpen, setRailOpen] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("story_builder_draft");
    let storyText = "";
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        storyText = parsed?.storyText ?? "";
      } catch {}
    }
    setSpreads(makeInitialSpreads(storyText));
  }, []);

  const currentSpread = spreads[currentIndex];

  function updatePage(partial: Partial<PageContent>, side: "left" | "right") {
    setSpreads((prev) =>
      prev.map((sp, i) =>
        i === currentIndex
          ? {
              ...sp,
              [side]: {
                ...sp[side],
                ...partial,
              },
            }
          : sp
      )
    );
  }

  function updateBlock(
    side: "left" | "right",
    blockId: string,
    blockPartial: Partial<PageBlock>
  ) {
    setSpreads((prev) =>
      prev.map((sp, i) => {
        if (i !== currentIndex) return sp;
        const page = sp[side];
        const nextBlocks = (page.blocks || []).map((b) =>
          b.id === blockId ? { ...b, ...blockPartial } : b
        );
        return { ...sp, [side]: { ...page, blocks: nextBlocks } };
      })
    );
  }

  function deleteBlock(side: "left" | "right", blockId: string) {
    setSpreads((prev) =>
      prev.map((sp, i) => {
        if (i !== currentIndex) return sp;
        const page = sp[side];
        const nextBlocks = (page.blocks || []).filter((b) => b.id !== blockId);
        return { ...sp, [side]: { ...page, blocks: nextBlocks } };
      })
    );
  }

  function addSpread(afterIndex?: number) {
    const fresh: Spread = {
      id: crypto.randomUUID(),
      left: pageFromText(""),
      right: pageFromText(""),
    };
    setSpreads((prev) => {
      if (afterIndex == null) return [...prev, fresh];
      const next = [...prev];
      next.splice(afterIndex + 1, 0, fresh);
      return next;
    });
    setCurrentIndex((i) =>
      afterIndex != null ? afterIndex + 1 : spreads.length
    );
  }

  function duplicateSpread(index: number) {
    setSpreads((prev) => {
      const src = prev[index];
      const copy: Spread = {
        id: crypto.randomUUID(),
        left: JSON.parse(JSON.stringify(src.left)),
        right: JSON.parse(JSON.stringify(src.right)),
      };
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return next;
    });
    setCurrentIndex(index + 1);
  }

  function deleteSpread(index: number) {
    setSpreads((prev) => {
      if (prev.length <= 1) return prev;
      const next = [...prev.slice(0, index), ...prev.slice(index + 1)];
      const newIdx = Math.min(index, next.length - 1);
      setCurrentIndex(newIdx);
      return next;
    });
  }

  function moveSpread(index: number, direction: "up" | "down") {
    setSpreads((prev) => {
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const next = [...prev];
      const [m] = next.splice(index, 1);
      next.splice(newIndex, 0, m);
      setCurrentIndex(newIndex);
      return next;
    });
  }

  return (
    <div className="h-[calc(100vh-64px)] w-full bg-[radial-gradient(70%_60%_at_10%_10%,#fff3f3_0%,transparent_60%),radial-gradient(80%_80%_at_90%_20%,#fff4e6_0%,transparent_50%),radial-gradient(100%_100%_at_50%_120%,#eef3ff_0%,transparent_50%)]">
      <div className="flex h-full">
        {railOpen && (
          <SpreadsRail
            spreads={spreads}
            currentIndex={currentIndex}
            onSelect={setCurrentIndex}
            onAdd={() => addSpread(currentIndex)}
            onDuplicate={duplicateSpread}
            onDelete={deleteSpread}
            onMove={moveSpread}
            onClose={() => setRailOpen(false)}
          />
        )}

        <div className="relative flex-1 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-lg font-semibold text-gray-900">
              Layout Builder
            </h1>
            <span className="text-sm text-gray-600">
              Spread {currentIndex + 1} / {spreads.length}
            </span>
          </div>

          {!railOpen && (
            <div className="fixed left-3 top-1/2 -translate-y-1/2 z-50">
              <Button
                variant="secondary"
                size="icon"
                className="h-10 w-10 rounded-full shadow-lg border bg-white"
                onClick={() => setRailOpen(true)}
                title="Open filmstrip"
                aria-label="Open filmstrip"
              >
                <BookOpen className="h-5 w-5 text-gray-700" />
              </Button>
            </div>
          )}

          <div className="relative h-[calc(100%-56px)]">
            {currentSpread && (
              <CanvasSpread
                spread={currentSpread}
                zoom={zoom}
                onZoomChange={setZoom}
                selectedSide={selectedSide}
                onSelectSide={setSelectedSide}
                onChangePage={updatePage}
                onChangeBlock={updateBlock}
                onDeleteBlock={deleteBlock}
                basePage={currentIndex * 2 + 1}
                pageSize={{ w: PAGE_W, h: PAGE_H }}
              />
            )}
            <div className="absolute bottom-3 right-3 rounded-full bg-white/90 border text-xs px-2 py-1 shadow">
              {Math.round(zoom * 100)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
