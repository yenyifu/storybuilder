"use client";

import { useEffect, useState } from "react";
import { chunkStory } from "@/lib/story-chunker";
import type { Spread, PageBlock, PageContent, FixedPage, BookLayout } from "@/lib/layout-types";
import { SpreadsRail } from "@/components/spreads-rail";
import { CanvasSpread } from "@/components/canvas-spread";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { colors } from "@/lib/colors";
import { useLayout } from "@/contexts/LayoutContext";

// Page dimensions based on orientation
function getPageDimensions(orientation: "portrait" | "landscape") {
  if (orientation === "landscape") {
    return { w: 720, h: 540 }; // 4:3 landscape
  } else {
    return { w: 540, h: 720 }; // 3:4 portrait
  }
}

// Get thumbnail dimensions based on orientation
function getThumbnailDimensions(orientation: "portrait" | "landscape") {
  if (orientation === "landscape") {
    return { w: 20, h: 15 }; // w-20 h-15 for landscape
  } else {
    return { w: 15, h: 20 }; // w-15 h-20 for portrait
  }
}

function pageFromText(text: string, pageDimensions: { w: number; h: number }): PageContent {
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
        w: pageDimensions.w - 80,
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

function makeInitialSpreads(storyText: string, pageDimensions: { w: number; h: number }): Spread[] {
  const pages = chunkStory(storyText || "", 420);
  const spreads: Spread[] = [];
  for (let i = 0; i < Math.max(1, pages.length); i += 2) {
    spreads.push({
      id: crypto.randomUUID(),
      left: pageFromText(pages[i] ?? "", pageDimensions),
      right: pageFromText(pages[i + 1] ?? "", pageDimensions),
    });
  }
  if (!spreads.length) {
    spreads.push({
      id: crypto.randomUUID(),
      left: pageFromText("", pageDimensions),
      right: pageFromText("", pageDimensions),
    });
  }
  return spreads;
}

function makeInitialFixedPages(pageDimensions: { w: number; h: number }): { cover: FixedPage; title: FixedPage; ending: FixedPage } {
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
            w: pageDimensions.w - 80,
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
            y: 200,
            w: pageDimensions.w - 80,
            h: 120,
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
            w: pageDimensions.w - 80,
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

interface LayoutBuilderProps {
  orientation?: "portrait" | "landscape";
  storyText?: string;
}

function LayoutBuilder({ orientation = "landscape", storyText = "" }: LayoutBuilderProps) {
  const pageDimensions = getPageDimensions(orientation);
  const thumbnailDimensions = getThumbnailDimensions(orientation);
  const { setLayout, setOrientation } = useLayout();

  const [spreads, setSpreads] = useState<Spread[]>([]);
  const [fixedPages, setFixedPages] = useState(() => makeInitialFixedPages(pageDimensions));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(0.9);
  const [selectedSide, setSelectedSide] = useState<"left" | "right">("left");
  const [railOpen, setRailOpen] = useState(true);

  // Update layout context whenever layout data changes
  useEffect(() => {
    const bookLayout: BookLayout = {
      cover: fixedPages.cover,
      title: fixedPages.title,
      spreads: spreads,
      ending: fixedPages.ending,
    };
    setLayout(bookLayout);
    setOrientation(orientation);
  }, [fixedPages, spreads, setLayout, setOrientation, orientation]);

  useEffect(() => {
    setSpreads(makeInitialSpreads(storyText, pageDimensions));
  }, [storyText, orientation]);

  function getCurrentPage() {
    if (currentIndex === 0) {
      // Cover page - show as spread with blank left, content right
      return { 
        type: "fixed", 
        content: fixedPages.cover.content,
        isFullSpread: false,
        pageSide: "right"
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
  }

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
    const newSpread: Spread = {
      id: crypto.randomUUID(),
      left: createBlankPage(),
      right: createBlankPage(),
    };
    setSpreads((prev) => {
      if (afterIndex === undefined) {
        return [...prev, newSpread];
      }
      const newSpreads = [...prev];
      newSpreads.splice(afterIndex + 1, 0, newSpread);
      return newSpreads;
    });
  }

  function duplicateSpread(index: number) {
    const spreadIndex = index - 2;
    const spread = spreads[spreadIndex];
    if (!spread) return;
    const newSpread: Spread = {
      id: crypto.randomUUID(),
      left: { ...spread.left },
      right: { ...spread.right },
    };
    setSpreads((prev) => {
      const newSpreads = [...prev];
      newSpreads.splice(spreadIndex + 1, 0, newSpread);
      return newSpreads;
    });
  }

  function deleteSpread(index: number) {
    const spreadIndex = index - 2;
    setSpreads((prev) => prev.filter((_, i) => i !== spreadIndex));
    if (currentIndex === index) {
      setCurrentIndex(Math.max(0, index - 1));
    }
  }

  function moveSpread(index: number, direction: "up" | "down") {
    const spreadIndex = index - 2;
    setSpreads((prev) => {
      const newSpreads = [...prev];
      const targetIndex = direction === "up" ? spreadIndex - 1 : spreadIndex + 1;
      if (targetIndex < 0 || targetIndex >= newSpreads.length) return prev;
      [newSpreads[spreadIndex], newSpreads[targetIndex]] = [newSpreads[targetIndex], newSpreads[spreadIndex]];
      return newSpreads;
    });
  }

  const createFixedPageSpread = (fixedPage: FixedPage, pageNumber: number): Spread => {
    const blankContent: PageContent = {
      text: "",
      image: null,
      fontSize: 16,
      align: "left",
      textColor: "#000000",
      padding: 20,
      blocks: []
    };

    if (pageNumber === 1) {
      // Title page - blank left, content right
      return {
        id: `fixed-${pageNumber}`,
        left: blankContent,
        right: fixedPage.content,
      };
    } else if (pageNumber === 3) {
      // Ending page - content left, blank right
      return {
        id: `fixed-${pageNumber}`,
        left: fixedPage.content,
        right: blankContent,
      };
    } else {
      // Cover page - both pages have content
      return {
        id: `fixed-${pageNumber}`,
        left: fixedPage.content,
        right: fixedPage.content,
      };
    }
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
            thumbnailDimensions={thumbnailDimensions}
          />
        )}
        

        <div className="relative flex-1 overflow-hidden">
          <div className="flex items-center justify-end px-4 py-3">
            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.05))}
                  disabled={zoom <= 0.5}
                >
                  -
                </Button>
                <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.min(2, zoom + 0.05))}
                  disabled={zoom >= 2}
                >
                  +
                </Button>
              </div>
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
                spread={createFixedPageSpread(fixedPages.cover, 1)}
                zoom={zoom}
                onZoomChange={setZoom}
                selectedSide={selectedSide}
                onSelectSide={setSelectedSide}
                onChangePage={updatePage}
                onChangeBlock={updateBlock}
                onDeleteBlock={deleteBlock}

                basePage={currentIndex + 1}
                pageSize={pageDimensions}
                isFixedPage={true}
                fixedPageType={currentIndex === 0 ? "cover" : currentIndex === 1 ? "title" : "ending"}
                onAddSpread={addSpread}
                onDeleteSpread={deleteSpread}
                spreadIndex={currentIndex}
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
                pageSize={pageDimensions}
                onAddSpread={addSpread}
                onDeleteSpread={deleteSpread}
                spreadIndex={currentIndex}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Default export for the page
export default function LayoutBuilderPage() {
  return <LayoutBuilder orientation="landscape" storyText="" />;
}
