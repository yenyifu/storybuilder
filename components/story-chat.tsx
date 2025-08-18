"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { colors } from "@/lib/colors";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

export function StoryChat({
  onUserSend,
  initialUserMessage,
}: {
  onUserSend: (text: string) => void;
  initialUserMessage?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const seededRef = useRef(false);

  // Seed with the initial user message (from the first screen), once
  useEffect(() => {
    if (seededRef.current) return;
    const first = (initialUserMessage || "").trim();
    if (first) {
      seededRef.current = true;
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: first,
      };
      const ack: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Great start! That’s in your story. Want me to add a setting or describe the main character next?",
      };
      // Seed chat history only; do NOT append to story here to avoid duplication.
      setMessages((m) => [...m, userMsg, ack]);
      // Note: We intentionally do NOT call onUserSend(first) here.
    }
  }, [initialUserMessage]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isThinking]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    onUserSend(text);

    // Simulate assistant thinking and reply
    setIsThinking(true);
    setTimeout(() => {
      const reply: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "I updated the story with your new ideas. If you'd like, say “add more detail about the setting” or “make the ending happier.”",
      };
      setMessages((prev) => [...prev, reply]);
      setIsThinking(false);
    }, 600);
  }

  return (
    <div className="flex h-[calc(100%-0px)] flex-col">
      <ScrollArea className="flex-1" ref={scrollRef as any}>
        <div className="p-4 space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex items-start gap-3",
                m.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {m.role === "assistant" && (
                <Avatar className="h-7 w-7">
                  <AvatarFallback
                    className="text-white text-[10px]"
                    style={{ backgroundColor: colors.main }}
                  >
                    AI
                  </AvatarFallback>
                </Avatar>
              )}
              <Card
                className={cn(
                  "px-3 py-2 text-sm max-w-[80%]",
                  m.role === "assistant"
                    ? "bg-[#FFF9B9]/50 border-[#FFEDBF] text-[#403C4E]"
                    : "bg-white text-[#403C4E]"
                )}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
              </Card>
              {m.role === "user" && (
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-gray-200 text-gray-700 text-[10px]">
                    You
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isThinking && (
            <div className="flex items-center gap-2 text-sm text-[#403C4E]/80">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking...
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-3">
        <div className="relative">
          <Textarea
            aria-label="Chat input"
            placeholder="Ask the helper to add details, change tone, or continue the story..."
            className="min-h-28 h-28 max-h-[40vh] resize-y text-base p-4 pr-14 placeholder:text-gray-400"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            onClick={handleSend}
            className="absolute bottom-3 right-3"
            style={{ backgroundColor: colors.main }}
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
