"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import { colors } from "@/lib/colors";
import { StoryPreview } from "./story-preview";
import { useLayout } from "@/contexts/LayoutContext";

export default function Header() {
  const { layout, orientation } = useLayout();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const isMobile = useMobile();

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="px-6 py-4">
        {/* Top bar */}
        <div className="flex items-center justify-between w-full">
          {/* Left: Brand */}
          <Link href="/" className="flex items-center min-w-0 gap-2">
            <img
              src="/logo/story-bug.png"
              alt="The Story Bug logo"
              className="h-8 w-8 shrink-0"
              width={32}
              height={32}
            />
            <span
              className="truncate text-2xl font-bold"
              style={{ color: colors.main }}
            >
              KidsBookCreator
            </span>
          </Link>

          {/* Right: Nav / Actions */}
          <div className="flex items-center">
            {isMobile ? (
              <button
                onClick={() => setIsMenuOpen((s) => !s)}
                className="p-2"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6 text-gray-600" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-600" />
                )}
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsPreviewOpen(true)}
                  disabled={!layout}
                >
                  Preview
                </Button>
                <Button variant="outline" size="sm">
                  Publish
                </Button>
                <Button size="sm" style={{ backgroundColor: colors.main }}>
                  Add to Cart
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile dropdown */}
        {isMobile && isMenuOpen && (
          <div className="mt-4 py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setIsPreviewOpen(true);
                  setIsMenuOpen(false);
                }}
                disabled={!layout}
              >
                Preview
              </Button>
              <Button variant="outline" className="w-full">
                Publish
              </Button>
              <Button 
                className="w-full" 
                style={{ backgroundColor: colors.main }}
              >
                Add to Cart
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Story Preview Modal */}
      {layout && (
        <StoryPreview
          layout={layout}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onBackToEdit={() => setIsPreviewOpen(false)}
          onAddToCart={() => {
            setIsPreviewOpen(false);
            // TODO: Implement add to cart functionality
            console.log('Add to cart clicked');
          }}
          orientation={orientation}
        />
      )}
    </header>
  );
}
