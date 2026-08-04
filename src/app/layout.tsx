import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { generateHomepageMetadata, generateHomepageSchema } from "@/lib/seo";

// 1. Import the official Next.js Google Analytics component
import { GoogleAnalytics } from '@next/third-parties/google';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  ...generateHomepageMetadata(),
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
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body className={`${inter.className} bg-[#090d16] text-gray-100 antialiased`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>

      {/* 2. Add the GA4 component with your exact Measurement ID */}
      <GoogleAnalytics gaId="G-9HEGR0QZB3" />
    </html>
  );
}