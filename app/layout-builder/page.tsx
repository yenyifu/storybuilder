"use client";

import { useEffect, useState } from "react";
import { chunkStory } from "@/lib/story-chunker";
import type { Spread, PageBlock, PageContent, FixedPage } from "@/lib/layout-types";
import { SpreadsRail } from "@/components/spreads-rail";
import { CanvasSpread } from "@/components/canvas-spread";
import { Button } from "@/components/ui/button";
import { BookOpen, ZoomIn, ZoomOut } from "lucide-react";
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

function makeInitialFixedPages(): { cover: FixedPage; title: FixedPage; ending: FixedPage } {
  return {
    cover: {
      id: crypto.randomUUID(),
      type: "cover",
      content: {
        text: "My Amazing Story",
        image: null,
        fontSize: 28,
        align: "center",
        textColor: "#1f2937",
        padding: 24,
        blocks: [
          {
            id: crypto.randomUUID(),
            type: "text",
            x: 40,
            y: 200,
            w: PAGE_W - 80,
            h: 100,
            text: "My Amazing Story",
            fontSize: 28,
            align: "center",
            color: "#1f2937",
            fontFamily: "Inter, ui-sans-serif, system-ui, Arial",
            listType: "none",
            z: 1,
          },
        ],
      },
    },
    title: {
      id: crypto.randomUUID(),
      type: "title",
      content: {
        text: "My Amazing Story\n\nBy [Author Name]",
        image: null,
        fontSize: 24,
        align: "center",
        textColor: "#1f2937",
        padding: 24,
        blocks: [
          {
            id: crypto.randomUUID(),
            type: "text",
            x: 40,
            y: 150,
            w: PAGE_W - 80,
            h: 200,
            text: "My Amazing Story\n\nBy [Author Name]",
            fontSize: 24,
            align: "center",
            color: "#1f2937",
            fontFamily: "Inter, ui-sans-serif, system-ui, Arial",
            listType: "none",
            z: 1,
          },
        ],
      },
    },
    ending: {
      id: crypto.randomUUID(),
      type: "ending",
      content: {
        text: "The End",
        image: null,
        fontSize: 24,
        align: "center",
        textColor: "#1f2937",
        padding: 24,
        blocks: [
          {
            id: crypto.randomUUID(),
            type: "text",
            x: 40,
            y: 200,
            w: PAGE_W - 80,
            h: 100,
            text: "The End",
            fontSize: 24,
            align: "center",
            color: "#1f2937",
            fontFamily: "Inter, ui-sans-serif, system-ui, Arial",
            listType: "none",
            z: 1,
          },
        ],
      },
    },
  };
}

// Create a blank page content
function createBlankPage(): PageContent {
  return {
    text: "",
    image: null,
    fontSize: 22,
    align: "left",
    textColor: "#1f2937",
    padding: 24,
    blocks: [],
  };
}

export default function LayoutBuilderPage() {
  const [spreads, setSpreads] = useState<Spread[]>([]);
  const [fixedPages, setFixedPages] = useState(makeInitialFixedPages());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(0.9);
  const [showZoomControls, setShowZoomControls] = useState(false);
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

  // Get current page content based on index
  const getCurrentPage = () => {
    if (currentIndex === 0) {
      // Cover page - show as spread with both pages editable
      return { 
        type: "fixed", 
        content: fixedPages.cover.content,
        isFullSpread: true,
        pageSide: "both" // Both left and right pages are editable
      };
    } else if (currentIndex === 1) {
      // Title page - show as spread with blank left, content right
      return { 
        type: "fixed", 
        content: fixedPages.title.content,
        isFullSpread: false,
        pageSide: "right"
      };
    } else if (currentIndex === spreads.length + 3) {
      // Ending page - show as spread with content left, blank right
      return { 
        type: "fixed", 
        content: fixedPages.ending.content,
        isFullSpread: false,
        pageSide: "left"
      };
    } else {
      // Story spread
      const spreadIndex = currentIndex - 2;
      const spread = spreads[spreadIndex];
      return { type: "spread", spread };
    }
  };

  const currentPage = getCurrentPage();

  function updatePage(partial: Partial<PageContent>, side: "left" | "right") {
    if (currentPage.type === "fixed") {
      // Update fixed page
      setFixedPages((prev) => {
        const pageType = currentIndex === 0 ? "cover" : currentIndex === 1 ? "title" : "ending";
        return {
          ...prev,
          [pageType]: {
            ...prev[pageType],
            content: {
              ...prev[pageType].content,
              ...partial,
            },
          },
        };
      });
    } else {
      // Update spread page
      const spreadIndex = currentIndex - 2;
      setSpreads((prev) =>
        prev.map((sp, i) =>
          i === spreadIndex
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
  }

  function updateBlock(
    side: "left" | "right",
    blockId: string,
    blockPartial: Partial<PageBlock>
  ) {
    if (currentPage.type === "fixed") {
      // Update fixed page blocks
      setFixedPages((prev) => {
        const pageType = currentIndex === 0 ? "cover" : currentIndex === 1 ? "title" : "ending";
        const page = prev[pageType];
        const nextBlocks = (page.content.blocks || []).map((b) =>
          b.id === blockId ? { ...b, ...blockPartial } : b
        );
        return {
          ...prev,
          [pageType]: {
            ...page,
            content: { ...page.content, blocks: nextBlocks },
          },
        };
      });
    } else {
      // Update spread page blocks
      const spreadIndex = currentIndex - 2;
      setSpreads((prev) =>
        prev.map((sp, i) => {
          if (i !== spreadIndex) return sp;
          const page = sp[side];
          const nextBlocks = (page.blocks || []).map((b) =>
            b.id === blockId ? { ...b, ...blockPartial } : b
          );
          return { ...sp, [side]: { ...page, blocks: nextBlocks } };
        })
      );
    }
  }

  function deleteBlock(side: "left" | "right", blockId: string) {
    if (currentPage.type === "fixed") {
      // Delete fixed page block
      setFixedPages((prev) => {
        const pageType = currentIndex === 0 ? "cover" : currentIndex === 1 ? "title" : "ending";
        const page = prev[pageType];
        const nextBlocks = (page.content.blocks || []).filter((b) => b.id !== blockId);
        return {
          ...prev,
          [pageType]: {
            ...page,
            content: { ...page.content, blocks: nextBlocks },
          },
        };
      });
    } else {
      // Delete spread page block
      const spreadIndex = currentIndex - 2;
      setSpreads((prev) =>
        prev.map((sp, i) => {
          if (i !== spreadIndex) return sp;
          const page = sp[side];
          const nextBlocks = (page.blocks || []).filter((b) => b.id !== blockId);
          return { ...sp, [side]: { ...page, blocks: nextBlocks } };
        })
      );
    }
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
      afterIndex != null ? afterIndex + 3 : spreads.length + 2
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
    setCurrentIndex(index + 3);
  }

  function deleteSpread(index: number) {
    setSpreads((prev) => {
      if (prev.length <= 1) return prev;
      const next = [...prev.slice(0, index), ...prev.slice(index + 1)];
      const newIdx = Math.min(index + 2, next.length + 1);
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
      setCurrentIndex(newIndex + 2);
      return next;
    });
  }

  // Create spread for fixed pages
  const createFixedPageSpread = (): Spread => {
    if (currentPage.type === "fixed" && currentPage.content) {
      if (currentPage.isFullSpread) {
        // Cover page - duplicate content on both sides
        return {
          id: "cover",
          left: currentPage.content,
          right: currentPage.content,
        };
      } else if (currentPage.pageSide === "right") {
        // Title page - blank left, content right
        return {
          id: "title",
          left: createBlankPage(),
          right: currentPage.content,
        };
      } else {
        // Ending page - content left, blank right
        return {
          id: "ending",
          left: currentPage.content,
          right: createBlankPage(),
        };
      }
    }
    // Fallback - return a blank spread
    return {
      id: "fallback",
      left: createBlankPage(),
      right: createBlankPage(),
    };
  };

  return (
    <div className="h-[calc(100vh-64px)] w-full bg-[radial-gradient(70%_60%_at_10%_10%,#fff3f3_0%,transparent_60%),radial-gradient(80%_80%_at_90%_20%,#fff4e6_0%,transparent_50%),radial-gradient(100%_100%_at_50%_120%,#eef3ff_0%,transparent_50%)]">
      <div className="flex h-full">

        {railOpen && (
          <SpreadsRail
            spreads={spreads}
            fixedPages={fixedPages}
            currentIndex={currentIndex}
            onSelect={setCurrentIndex}
            onAdd={() => addSpread(currentIndex > 1 ? currentIndex - 2 : undefined)}
            onDuplicate={duplicateSpread}
            onDelete={deleteSpread}
            onMove={moveSpread}
            onClose={() => setRailOpen(false)}
          />
        )}
        

        <div className="relative flex-1 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-lg font-semibold text-gray-900">
              Layout Builder Test
            </h1>
            <div className="flex items-center gap-2">
              {showZoomControls ? (
                <div className="bg-white/90 border rounded-lg shadow p-2 flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                    title="Zoom out"
                  >
                    <ZoomOut className="h-3 w-3" />
                  </Button>
                  <span className="text-xs text-gray-600 min-w-[2.5rem] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                    title="Zoom in"
                  >
                    <ZoomIn className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => setShowZoomControls(false)}
                    title="Close zoom controls"
                  >
                    <span className="text-xs">×</span>
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setShowZoomControls(true)}
                  className="bg-white/90 border rounded-full text-xs px-2 py-1 shadow hover:bg-white transition-colors"
                >
                  {Math.round(zoom * 100)}%
                </button>
              )}
            </div>
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
            {currentPage.type === "fixed" ? (
              <CanvasSpread
                spread={createFixedPageSpread()}
                zoom={zoom}
                onZoomChange={setZoom}
                selectedSide={selectedSide}
                onSelectSide={setSelectedSide}
                onChangePage={updatePage}
                onChangeBlock={updateBlock}
                onDeleteBlock={deleteBlock}
                basePage={currentIndex + 1}
                pageSize={{ w: PAGE_W, h: PAGE_H }}
                isFixedPage={true}
                fixedPageType={currentIndex === 0 ? "cover" : currentIndex === 1 ? "title" : "ending"}
              />
            ) : (
              <CanvasSpread
                spread={currentPage.spread || { id: "fallback", left: createBlankPage(), right: createBlankPage() }}
                zoom={zoom}
                onZoomChange={setZoom}
                selectedSide={selectedSide}
                onSelectSide={setSelectedSide}
                onChangePage={updatePage}
                onChangeBlock={updateBlock}
                onDeleteBlock={deleteBlock}
                basePage={currentIndex}
                pageSize={{ w: PAGE_W, h: PAGE_H }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
