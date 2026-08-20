import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { generateHomepageMetadata, generateHomepageSchema } from "@/lib/seo";
import { ThemeProvider } from "@/components/ThemeProvider"; // <-- Imported ThemeProvider

// 1. Import the official Next.js Google Analytics component
import { GoogleAnalytics } from '@next/third-parties/google';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  ...generateHomepageMetadata(),
  title: "ToolLok – Free Online Tools for Developers, Creators & Businesses",
  description: "ToolLok offers free online tools for developers, creators, businesses, finance, and everyday tasks. Fast, secure, easy-to-use tools with no installation required.",
  verification: {
    google: "G-9HEGR0QZB3", // Your GSC verification code goes here
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLdSchema = generateHomepageSchema();

  return (
    // suppressHydrationWarning MUST be on the html tag for next-themes to work
    // Removed the hardcoded className="dark"
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      {/* Set base colors for both light and dark mode */}
      <body className={`${inter.className} bg-white dark:bg-[#090d16] text-gray-900 dark:text-gray-100 antialiased`}>
        {/* Wrap the core layout inside the ThemeProvider */}
        <ThemeProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </ThemeProvider>

      </body>

      {/* 2. Add the GA4 component with your exact Measurement ID */}
      <GoogleAnalytics gaId="G-9HEGR0QZB3" />
    </html>
  );
}