"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StoryChat } from "@/components/story-chat";
import { Sparkles, Send } from "lucide-react";
import { colors } from "@/lib/colors";

export default function StoryBuilderPage() {
  const [hasStarted, setHasStarted] = useState(false);
  const [initialInput, setInitialInput] = useState("");
  const [story, setStory] = useState("");

  // load any previous draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem("story_builder_draft");
      if (raw) {
        const data = JSON.parse(raw);
        if (data?.storyText) {
          setStory(data.storyText);
          setHasStarted(true);
        }
      }
    } catch {}
  }, []);

  // persist story
  useEffect(() => {
    try {
      const raw = localStorage.getItem("story_builder_draft");
      const prior = raw ? JSON.parse(raw) : {};
      localStorage.setItem(
        "story_builder_draft",
        JSON.stringify({ ...(prior || {}), storyText: story, ts: Date.now() })
      );
    } catch {}
  }, [story]);

  function handleFirstSend() {
    const text = initialInput.trim();
    if (!text) return;
    setStory(text);
    setHasStarted(true);
  }

  // Phase 1: centered title + single textbox
  if (!hasStarted) {
    return (
      <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <Card className="w-full max-w-3xl p-6 md:p-10">
          <div className="text-center mb-6">
            <div
              className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: colors.secondary }}
            >
              <Sparkles className="h-6 w-6" style={{ color: colors.main }} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Story builder
            </h1>
            <p className="mt-2 text-gray-600">
              Just write and we will create your story together.
            </p>
          </div>

          <div className="relative">
            <Textarea
              value={initialInput}
              onChange={(e) => setInitialInput(e.target.value)}
              placeholder="Start your story here... Once upon a time..."
              className="h-64 md:h-80 text-base p-4 pr-16 focus-visible:ring-[#FFAD94] placeholder:text-gray-400"
            />
            <Button
              onClick={handleFirstSend}
              className="absolute bottom-3 right-3"
              style={{ backgroundColor: colors.main }}
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-3 text-xs text-[#403C4E]/70 text-center">
            Tip: Click the send button when you're ready to continue.
          </p>
        </Card>
      </main>
    );
  }

  // Phase 2: two-panel layout (chat left, full-story editor right)
  return (
    <main className="h-[calc(100vh-64px)]">
      <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {/* Left: Chat + input */}
        <Card className="h-full flex flex-col min-h-0 md:col-span-1">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold text-gray-900">Chat</h2>
            <p className="text-sm text-gray-600">
              Talk with the helper to edit the story together.
            </p>
          </div>
          <StoryChat
            initialUserMessage={initialInput || undefined}
            onUserSend={(text) => {
              // Simple behavior for v1: append user text to the story
              setStory((prev) => (prev ? prev + "\n\n" + text : text));
            }}
          />
        </Card>

        {/* Right: Full story editor */}
        <Card className="h-full flex flex-col min-h-0 md:col-span-2">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold text-gray-900">Your story</h2>
            <p className="text-sm text-gray-600">
              Edit the story directly. Changes are saved as you type.
            </p>
          </div>

          <div className="flex-1 p-4 min-h-0">
            <div className="relative h-full min-h-0">
              <Textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Edit your full story here..."
                className="h-full max-h-full text-base p-4 resize-none"
              />
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
