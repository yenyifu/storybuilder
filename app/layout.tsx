import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import { Toaster } from "@/components/ui/toaster";
import { LayoutProvider } from "@/contexts/LayoutContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KidsBookCreator - Create and Publish Children's Books",
  description:
    "A platform for kids to create, illustrate, and publish their own storybooks with AI assistance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <LayoutProvider>
            <Header />
            {children}
            <Toaster />
          </LayoutProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
