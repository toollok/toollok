import { Metadata } from "next";
import { Tool } from "@/types";

export const SITE_CONFIG = {
     name: "ToolLok",
     domain: "toollok.com",
     url: "https://toollok.com",
     description: "Free, high-performance browser tools for developers, content creators, traders, and founders.",
     keywords: [
          "developer tools",
          "JSON validator Wasm",
          "CSS animation builder",
          "options payoff calculator",
          "YouTube thumbnail previewer",
          "AI prompt optimizer",
          "PII data scrubber"
     ]
};

export function generateHomepageMetadata(): Metadata {
     return {
          title: "ToolLok | Free Online Developer, AI & Creator Utilities",
          description: SITE_CONFIG.description,
          keywords: SITE_CONFIG.keywords,
          alternates: {
               canonical: SITE_CONFIG.url,
          },
          openGraph: {
               title: "ToolLok | Free Online Developer & AI Utilities",
               description: SITE_CONFIG.description,
               url: SITE_CONFIG.url,
               siteName: SITE_CONFIG.name,
               images: [
                    {
                         url: `${SITE_CONFIG.url}/og-homepage.png`,
                         width: 1200,
                         height: 630,
                         alt: "ToolLok Online Tools Platform"
                    }
               ],
               type: "website"
          },
          twitter: {
               card: "summary_large_image",
               title: "ToolLok | All-in-One Online Platform",
               description: SITE_CONFIG.description,
               images: [`${SITE_CONFIG.url}/og-homepage.png`]
          }
     };
}

export function generateHomepageSchema() {
     return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": SITE_CONFIG.name,
          "url": SITE_CONFIG.url,
          "description": SITE_CONFIG.description,
          "potentialAction": {
               "@type": "SearchAction",
               "target": `${SITE_CONFIG.url}/search?q={search_term_string}`,
               "query-input": "required name=search_term_string"
          }
     };
}

export function generateToolMetadata(tool: Tool): Metadata {
     return {
          title: `${tool.name} | ToolLok`,
          description: tool.description,
          alternates: {
               canonical: `${SITE_CONFIG.url}${tool.slug}`,
          },
          openGraph: {
               title: `${tool.name} | ToolLok`,
               description: tool.description,
               url: `${SITE_CONFIG.url}${tool.slug}`,
               type: "website",
               images: [{
                    url: `${SITE_CONFIG.url}/og-tools.png`,
                    width: 1200,
                    height: 630,
                    alt: tool.name
               }]
          },
          twitter: {
               card: "summary_large_image",
               title: `${tool.name} | ToolLok`,
               description: tool.description,
          }
     };
}

export function generateToolSchema(tool: Tool) {
     return {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": tool.name,
          "description": tool.description,
          "applicationCategory": "BrowserApplication",
          "operatingSystem": "Any",
          "offers": {
               "@type": "Offer",
               "price": tool.tier === "premium" ? "9.99" : "0.00",
               "priceCurrency": "USD"
          }
     };
}