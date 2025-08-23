"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Maximize } from 'lucide-react';
import { Card } from "@/components/ui/card";

export function StoryPreview({
  title,
  pages,
  fontSize = 18,
  onTitleChange,
  onFontSizeChange,
  maxCharsPerPage,
  onMaxCharsPerPageChange,
}: {
  title: string;
  pages: string[];
  fontSize?: number;
  onTitleChange?: (t: string) => void;
  onFontSizeChange?: (n: number) => void;
  maxCharsPerPage: number;
  onMaxCharsPerPageChange: (n: number) => void;
}) {
  const [pageIndex, setPageIndex] = useState(0);

  const pageCount = pages.length || 1;
  const currentText = useMemo(() => (pages[pageIndex] ?? "").trim(), [pages, pageIndex]);

  return (
    <div className="flex h-[70vh] flex-col md:h-[78vh]">
      <div className="flex items-center justify-between gap-3 border-b pb-3">
        <div>
          <h3 className="text-base md:text-lg font-semibold text-primary">Live preview</h3>
          <p className="text-xs text-gray-600">Adjust title, font size, and page length.</p>
        </div>
        <Button variant="outline" size="sm">
          <Maximize className="h-4 w-4 mr-1" />
          Full preview
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 mt-4">
        <div className="xl:col-span-3">
          <div className="aspect-[4/3] w-full bg-white border rounded-lg p-4 flex flex-col">
            <div className="text-center mb-2">
              <h4 className="font-bold text-lg text-primary truncate">{title || "My Story"}</h4>
            </div>
            <div className="flex-1 overflow-auto">
              <p
                className="leading-relaxed whitespace-pre-wrap"
                style={{ fontSize: `${fontSize}px` }}
              >
                {currentText || "Your story text will appear here as you type in chat."}
              </p>
            </div>
            <div className="mt-2 text-center text-xs text-gray-500">
              Page {pageIndex + 1} of {pageCount}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
              disabled={pageIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((i) => Math.min(pageCount - 1, i + 1))}
              disabled={pageIndex >= pageCount - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="xl:col-span-2">
          <Tabs defaultValue="book">
            <TabsList className="w-full grid grid-cols-2 mb-3">
              <TabsTrigger value="book">Book</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
            </TabsList>

            <TabsContent value="book" className="space-y-3">
              <div>
                <Label htmlFor="title">Story title</Label>
                <Input
                  id="title"
                  placeholder="My Amazing Adventure"
                  value={title}
                  onChange={(e) => onTitleChange?.(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="font">Text size</Label>
                <div className="flex items-center gap-3">
                  <Slider
                    id="font"
                    value={[fontSize]}
                    onValueChange={([v]) => onFontSizeChange?.(v)}
                    min={14}
                    max={28}
                    step={1}
                    className="flex-1"
                  />
                  <div className="w-12 text-sm text-right">{fontSize}px</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="layout" className="space-y-3">
              <div>
                <Label htmlFor="chars">Approx. characters per page</Label>
                <div className="flex items-center gap-3">
                  <Slider
                    id="chars"
                    value={[maxCharsPerPage]}
                    onValueChange={([v]) => onMaxCharsPerPageChange(v)}
                    min={250}
                    max={800}
                    step={50}
                    className="flex-1"
                  />
                  <div className="w-16 text-sm text-right">{maxCharsPerPage}</div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This helps split your story into pages. You can fine-tune later.
                </p>
              </div>

              <Card className="p-3">
                <p className="text-sm text-gray-700">
                  Next steps will let you add illustrations and tweak text placement per page.
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
