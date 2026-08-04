import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { generateHomepageMetadata, generateHomepageSchema } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"] });

// MERGE the generated metadata with your Google verification code
export const metadata: Metadata = {
  ...generateHomepageMetadata(),
  title: "ToolLok",
  description: "Free Online tools for Developer, Content Creators, Business, Seo, Ai, etc.",
  verification: {
    google: "G-9HEGR0QZB3", // Paste your code here
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
    </html>
  );
}