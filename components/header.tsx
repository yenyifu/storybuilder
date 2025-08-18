"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import { colors } from "@/lib/colors";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useMobile();

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="px-6 py-4">
        {/* Top bar */}
        <div className="flex items-center">
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

          {/* Right: Nav / Auth */}
          <div className="ml-auto flex items-center">
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
              <div className="flex items-center gap-8">
                <nav className="flex items-center gap-6 justify-end">
                  <Link
                    href="/how-it-works"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    How It Works
                  </Link>
                  <Link
                    href="/examples"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Examples
                  </Link>
                  <Link
                    href="/pricing"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Pricing
                  </Link>
                </nav>
                <div className="flex items-center gap-4 justify-end">
                  <Link href="/login" className="contents">
                    <Button asChild variant="outline">
                      <span>Log In</span>
                    </Button>
                  </Link>
                  <Link href="/signup" className="contents">
                    <Button asChild style={{ backgroundColor: colors.main }}>
                      <span>Sign Up</span>
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile dropdown */}
        {isMobile && isMenuOpen && (
          <div className="mt-4 py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/how-it-works"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="/examples"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Examples
              </Link>
              <Link
                href="/pricing"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <div className="flex flex-col space-y-2 pt-2">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-transparent" variant="outline">
                    Log In
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    className="w-full"
                    style={{ backgroundColor: colors.main }}
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
