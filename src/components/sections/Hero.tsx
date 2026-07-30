"use client";

import { Search, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Hero({ onOpenSearch }: { onOpenSearch: () => void }) {
     return (
          <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden flex flex-col items-center text-center px-4">

               {/* Background Radial Glow Effect */}
               <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[350px] bg-blue-600/15 blur-[140px] rounded-full pointer-events-none -z-10" />

               {/* Hero Header Pill */}
               <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-8 uppercase tracking-widest">
                    <Sparkles size={14} /> 40+ Browser Utilities Live
               </div>

               {/* Main Headline */}
               <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.1] mb-6">
                    High-Performance <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400">Online Tools</span> Built for Speed.
               </h1>

               {/* Sub-description */}
               <p className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed mb-10">
                    Zero watermarks, zero installation. Process JSON, build CSS animations, model options payoffs, and optimize AI prompts directly in your browser.
               </p>

               {/* Search Input Trigger */}
               <div className="w-full max-w-2xl mb-8">
                    <button
                         onClick={onOpenSearch}
                         className="w-full bg-gray-900/90 hover:bg-gray-800/90 border border-gray-700/80 rounded-2xl p-4 md:p-5 flex items-center justify-between shadow-2xl transition-all group text-left"
                    >
                         <div className="flex items-center gap-3 text-gray-400">
                              <Search size={22} className="text-blue-400 group-hover:scale-110 transition-transform" />
                              <span className="text-base md:text-lg text-gray-500">Search 40+ tools (e.g. 'JSON', 'Options Payoff', 'EXIF')...</span>
                         </div>
                         <kbd className="hidden sm:inline-flex items-center gap-1 bg-gray-800 text-gray-400 border border-gray-700 px-2.5 py-1 rounded-lg text-xs font-mono">
                              ⌘K
                         </kbd>
                    </button>
               </div>

               {/* Popular Tags Quick Navigation */}
               <div className="flex flex-wrap items-center justify-center gap-2 text-xs md:text-sm text-gray-400">
                    <span className="text-gray-500 font-medium">Popular:</span>
                    {[
                         { name: "JSON Formatter", slug: "/tools/json-formatter-validator" },
                         { name: "Options Visualizer", slug: "/tools/options-payoff-visualizer" },
                         { name: "CSS Animator", slug: "/tools/css-animation-builder" },
                         { name: "PII Scrubber", slug: "/tools/pii-data-scrubber" }
                    ].map((tag) => (
                         <Link
                              key={tag.name}
                              href={tag.slug}
                              className="bg-gray-900/60 hover:bg-gray-800 border border-gray-800 hover:border-blue-500/30 text-gray-300 hover:text-white px-3 py-1 rounded-lg transition-colors"
                         >
                              {tag.name}
                         </Link>
                    ))}
               </div>

          </section>
     );
}