"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
     Settings2, Copy, Check, Play, Sparkles, Search,
     RotateCcw, Bookmark, Share2, Layers, ShieldCheck,
     Smartphone, Monitor, Sliders, RefreshCw
} from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import AdSlot from "@/components/ui/AdSlot";

type CategoryType = "all" | "buttons" | "text" | "cards" | "loaders" | "entrance" | "ui";
type TriggerType = "infinite" | "hover" | "click" | "focus" | "page-load";
type OutputTab = "css" | "tailwind" | "scss" | "variables" | "react";

interface AnimationPreset {
     id: string;
     name: string;
     category: CategoryType;
     defaultDuration: number;
     defaultEasing: string;
     keyframes: string;
     cssRule: string;
     tailwindClass: string;
     previewContent: string | React.ReactNode;
}

const PRESETS: AnimationPreset[] = [
     {
          id: "morphing-wave",
          name: "Morphing Wave",
          category: "ui",
          defaultDuration: 3,
          defaultEasing: "ease-in-out",
          keyframes: `@keyframes morphing-wave {\n  0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }\n  50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }\n  100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }\n}`,
          cssRule: `border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;`,
          tailwindClass: "animate-[morphing-wave_3s_ease-in-out_infinite]",
          previewContent: <Sparkles size={32} />
     },
     {
          id: "geometric-pulse",
          name: "Geometric Pulse",
          category: "ui",
          defaultDuration: 2,
          defaultEasing: "cubic-bezier(0.4, 0, 0.6, 1)",
          keyframes: `@keyframes geometric-pulse {\n  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }\n  70% { transform: scale(1.04); box-shadow: 0 0 0 16px rgba(59, 130, 246, 0); }\n  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }\n}`,
          cssRule: `transform: scale(1);`,
          tailwindClass: "animate-[geometric-pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]",
          previewContent: "PULSE"
     },
     {
          id: "smooth-float",
          name: "Smooth Float",
          category: "cards",
          defaultDuration: 3,
          defaultEasing: "ease-in-out",
          keyframes: `@keyframes smooth-float {\n  0% { transform: translateY(0px); }\n  50% { transform: translateY(-12px); }\n  100% { transform: translateY(0px); }\n}`,
          cssRule: `transform: translateY(0px);`,
          tailwindClass: "animate-[smooth-float_3s_ease-in-out_infinite]",
          previewContent: <Layers size={28} />
     },
     {
          id: "button-glow",
          name: "Button Glow",
          category: "buttons",
          defaultDuration: 1.5,
          defaultEasing: "ease",
          keyframes: `@keyframes button-glow {\n  0%, 100% { filter: brightness(1); box-shadow: 0 0 5px rgba(59,130,246,0.2); }\n  50% { filter: brightness(1.2); box-shadow: 0 0 25px rgba(59, 130, 246, 0.7); }\n}`,
          cssRule: `filter: brightness(1);`,
          tailwindClass: "hover:animate-[button-glow_1.5s_ease_infinite]",
          previewContent: "Hover Me"
     },
     {
          id: "button-ripple",
          name: "Button Ripple Effect",
          category: "buttons",
          defaultDuration: 1,
          defaultEasing: "cubic-bezier(0, 0, 0.2, 1)",
          keyframes: `@keyframes button-ripple {\n  0% { transform: scale(0.95); opacity: 1; }\n  100% { transform: scale(1.15); opacity: 0; }\n}`,
          cssRule: `position: relative; overflow: hidden;`,
          tailwindClass: "active:animate-[button-ripple_1s_cubic-bezier(0,0,0.2,1)]",
          previewContent: "Click Me"
     },
     {
          id: "text-shimmer",
          name: "Text Shimmer",
          category: "text",
          defaultDuration: 2.5,
          defaultEasing: "linear",
          keyframes: `@keyframes text-shimmer {\n  0% { background-position: -200% 0; }\n  100% { background-position: 200% 0; }\n}`,
          cssRule: `background: linear-gradient(90deg, #60a5fa 0%, #ffffff 50%, #60a5fa 100%); background-size: 200% auto; color: transparent; -webkit-background-clip: text;`,
          tailwindClass: "bg-gradient-to-r from-blue-400 via-white to-blue-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-[text-shimmer_2.5s_linear_infinite]",
          previewContent: "SHIMMER"
     },
     {
          id: "text-glitch",
          name: "Subtle Text Glitch",
          category: "text",
          defaultDuration: 0.8,
          defaultEasing: "steps(2, start)",
          keyframes: `@keyframes text-glitch {\n  0% { transform: translate(0); }\n  20% { transform: translate(-2px, 2px); }\n  40% { transform: translate(-2px, -2px); }\n  60% { transform: translate(2px, 2px); }\n  80% { transform: translate(2px, -2px); }\n  100% { transform: translate(0); }\n}`,
          cssRule: `transform: translate(0);`,
          tailwindClass: "animate-[text-glitch_0.8s_steps(2,start)_infinite]",
          previewContent: "GLITCH"
     },
     {
          id: "card-tilt-glow",
          name: "Card Spotlight Glow",
          category: "cards",
          defaultDuration: 4,
          defaultEasing: "ease-in-out",
          keyframes: `@keyframes card-tilt-glow {\n  0%, 100% { border-color: rgba(59, 130, 246, 0.2); transform: rotate(0deg); }\n  50% { border-color: rgba(59, 130, 246, 0.8); transform: rotate(1deg) scale(1.02); }\n}`,
          cssRule: `border: 2px solid rgba(59, 130, 246, 0.3);`,
          tailwindClass: "animate-[card-tilt-glow_4s_ease-in-out_infinite]",
          previewContent: "SaaS Card"
     },
     {
          id: "loader-spinner",
          name: "Smooth Ring Spinner",
          category: "loaders",
          defaultDuration: 0.8,
          defaultEasing: "linear",
          keyframes: `@keyframes loader-spinner {\n  0% { transform: rotate(0deg); }\n  100% { transform: rotate(360deg); }\n}`,
          cssRule: `border: 4px solid rgba(59, 130, 246, 0.2); border-top-color: #3b82f6; border-radius: 50%;`,
          tailwindClass: "w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-[loader-spinner_0.8s_linear_infinite]",
          previewContent: ""
     },
     {
          id: "loader-bounce-dots",
          name: "Bouncing Dots Loader",
          category: "loaders",
          defaultDuration: 1.2,
          defaultEasing: "ease-in-out",
          keyframes: `@keyframes loader-bounce-dots {\n  0%, 80%, 100% { transform: scale(0); }\n  40% { transform: scale(1.0); }\n}`,
          cssRule: `display: flex; gap: 8px;`,
          tailwindClass: "animate-[loader-bounce-dots_1.2s_ease-in-out_infinite]",
          previewContent: "•••"
     },
     {
          id: "entrance-slide-up",
          name: "Entrance Slide Up",
          category: "entrance",
          defaultDuration: 0.6,
          defaultEasing: "cubic-bezier(0.16, 1, 0.3, 1)",
          keyframes: `@keyframes entrance-slide-up {\n  0% { opacity: 0; transform: translateY(20px); }\n  100% { opacity: 1; transform: translateY(0); }\n}`,
          cssRule: `opacity: 1; transform: translateY(0);`,
          tailwindClass: "animate-[entrance-slide-up_0.6s_cubic-bezier(0.16,1,0.3,1)]",
          previewContent: "Fade In Up"
     },
     {
          id: "entrance-zoom-in",
          name: "Entrance Zoom In",
          category: "entrance",
          defaultDuration: 0.5,
          defaultEasing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          keyframes: `@keyframes entrance-zoom-in {\n  0% { opacity: 0; transform: scale(0.85); }\n  100% { opacity: 1; transform: scale(1); }\n}`,
          cssRule: `opacity: 1; transform: scale(1);`,
          tailwindClass: "animate-[entrance-zoom-in_0.5s_cubic-bezier(0.34,1.56,0.64,1)]",
          previewContent: "Zoom"
     }
];

export default function CssAnimationBuilder() {
     const [selectedPresetId, setSelectedPresetId] = useState<string>("morphing-wave");
     const [category, setCategory] = useState<CategoryType>("all");
     const [searchQuery, setSearchQuery] = useState<string>("");
     const [trigger, setTrigger] = useState<TriggerType>("infinite");
     const [duration, setDuration] = useState<number>(3);
     const [delay, setDelay] = useState<number>(0);
     const [easing, setEasing] = useState<string>("ease-in-out");
     const [isPlaying, setIsPlaying] = useState<boolean>(true);
     const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
     const [outputTab, setOutputTab] = useState<OutputTab>("css");
     const [favorites, setFavorites] = useState<string[]>([]);
     const [shareNotice, setShareNotice] = useState<boolean>(false);
     const [previewKey, setPreviewKey] = useState<number>(0);

     // Preview Interaction States for Triggers
     const [isHovered, setIsHovered] = useState<boolean>(false);
     const [isActive, setIsActive] = useState<boolean>(false);
     const [isFocused, setIsFocused] = useState<boolean>(false);

     // Advanced Tweaker Controls
     const [borderRadius, setBorderRadius] = useState<number>(24);
     const [shadowBlur, setShadowBlur] = useState<number>(20);

     const { isCopied, copy } = useCopyToClipboard(2000);

     const currentPreset = useMemo(() => {
          return PRESETS.find(p => p.id === selectedPresetId) || PRESETS[0];
     }, [selectedPresetId]);

     useEffect(() => {
          if (currentPreset) {
               setDuration(currentPreset.defaultDuration);
               setEasing(currentPreset.defaultEasing);
          }
     }, [currentPreset]);

     useEffect(() => {
          const saved = localStorage.getItem("toollok_anim_favorites");
          if (saved) {
               try { setFavorites(JSON.parse(saved)); } catch (e) { }
          }

          const params = new URLSearchParams(window.location.search);
          const effect = params.get("effect");
          if (effect && PRESETS.some(p => p.id === effect)) {
               setSelectedPresetId(effect);
               const dur = params.get("duration");
               if (dur) setDuration(Number(dur));
          }
     }, []);

     const filteredPresets = useMemo(() => {
          const query = searchQuery.trim().toLowerCase();
          return PRESETS.filter(p => {
               const matchesCategory = category === "all" || p.category === category;
               const matchesSearch = query === "" ||
                    p.name.toLowerCase().includes(query) ||
                    p.category.toLowerCase().includes(query) ||
                    p.id.toLowerCase().includes(query);
               return matchesCategory && matchesSearch;
          });
     }, [category, searchQuery]);

     // CSS Generation based on Trigger Mode
     const generatedCSS = useMemo(() => {
          let selector = ".animated-element";
          let animRule = `animation: ${currentPreset.id} ${duration}s ${easing} ${delay}s infinite;`;

          if (trigger === "hover") {
               selector = ".animated-element:hover";
          } else if (trigger === "click") {
               selector = ".animated-element:active";
          } else if (trigger === "focus") {
               selector = ".animated-element:focus";
          }

          const baseRules = `border-radius: ${borderRadius}px;\n  box-shadow: 0 10px ${shadowBlur}px rgba(0,0,0,0.15);\n  ${currentPreset.cssRule}`;

          if (trigger === "infinite" || trigger === "page-load") {
               return `.animated-element {\n  ${animRule}\n  ${baseRules}\n}\n\n${currentPreset.keyframes}`;
          } else {
               return `.animated-element {\n  ${baseRules}\n  transition: all 0.2s ease;\n}\n\n${selector} {\n  ${animRule}\n}\n\n${currentPreset.keyframes}`;
          }
     }, [currentPreset, duration, easing, delay, trigger, borderRadius, shadowBlur]);

     const generatedTailwind = useMemo(() => {
          let prefix = "";
          if (trigger === "hover") prefix = "hover:";
          if (trigger === "click") prefix = "active:";
          if (trigger === "focus") prefix = "focus:";

          const baseTailwind = currentPreset.tailwindClass;
          const finalClass = prefix ? `${prefix}${baseTailwind.replace(/^(hover:|active:|focus:)/, "")}` : baseTailwind;

          return `<div className="${finalClass} rounded-[${borderRadius}px] shadow-[0_10px_${shadowBlur}px_rgba(0,0,0,0.15)]">\n  {/* Component Content */}\n</div>`;
     }, [currentPreset, borderRadius, shadowBlur, trigger]);

     const generatedSCSS = useMemo(() => {
          let triggerSelector = "&";
          if (trigger === "hover") triggerSelector = "&:hover";
          if (trigger === "click") triggerSelector = "&:active";
          if (trigger === "focus") triggerSelector = "&:focus";

          return `$anim-duration: ${duration}s;\n$anim-easing: ${easing};\n$border-radius: ${borderRadius}px;\n\n.animated-element {\n  border-radius: $border-radius;\n  \n  ${triggerSelector} {\n    animation: ${currentPreset.id} $anim-duration $anim-easing infinite;\n  }\n}\n\n${currentPreset.keyframes}`;
     }, [currentPreset, duration, easing, borderRadius, trigger]);

     const generatedVariables = useMemo(() => {
          return `:root {\n  --anim-duration: ${duration}s;\n  --anim-easing: ${easing};\n  --anim-radius: ${borderRadius}px;\n}\n\n.animated-element {\n  animation: ${currentPreset.id} var(--anim-duration) var(--anim-easing) infinite;\n  border-radius: var(--anim-radius);\n}\n\n${currentPreset.keyframes}`;
     }, [currentPreset, duration, easing, borderRadius]);

     const generatedReact = useMemo(() => {
          return `export default function CustomAnimation() {\n  return (\n    <div className="${currentPreset.tailwindClass}" style={{ borderRadius: '${borderRadius}px' }}>\n      Interactive Element\n    </div>\n  );\n}`;
     }, [currentPreset, borderRadius]);

     const getActiveCodeOutput = () => {
          switch (outputTab) {
               case "tailwind": return generatedTailwind;
               case "scss": return generatedSCSS;
               case "variables": return generatedVariables;
               case "react": return generatedReact;
               case "css":
               default: return generatedCSS;
          }
     };

     const toggleFavorite = (id: string) => {
          let updated = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
          setFavorites(updated);
          localStorage.setItem("toollok_anim_favorites", JSON.stringify(updated));
     };

     const handleShare = () => {
          const url = `${window.location.origin}${window.location.pathname}?effect=${selectedPresetId}&duration=${duration}`;
          navigator.clipboard.writeText(url);
          setShareNotice(true);
          setTimeout(() => setShareNotice(false), 2000);
     };

     const randomizeConfig = () => {
          const randomPreset = PRESETS[Math.floor(Math.random() * PRESETS.length)];
          setSelectedPresetId(randomPreset.id);
          setDuration(Number((Math.random() * 4 + 0.5).toFixed(1)));
     };

     const restartPreview = () => {
          setPreviewKey(prev => prev + 1);
          setIsPlaying(true);
     };

     // Determine if preview animation should be active based on trigger mode and interaction state
     const shouldAnimatePreview = useMemo(() => {
          if (!isPlaying) return false;
          if (trigger === "infinite" || trigger === "page-load") return true;
          if (trigger === "hover" && isHovered) return true;
          if (trigger === "click" && isActive) return true;
          if (trigger === "focus" && isFocused) return true;
          return false;
     }, [isPlaying, trigger, isHovered, isActive, isFocused]);

     useKeyboardShortcuts([
          { key: "c", ctrlOrCmd: true, action: () => copy(getActiveCodeOutput()) }
     ]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 px-4 py-6 overflow-x-hidden">
               <style>{isPlaying || shouldAnimatePreview ? currentPreset.keyframes : ""}</style>

               {/* Header */}
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 shrink-0">
                              <Settings2 size={24} />
                         </div>
                         <div>
                              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">CSS Animation & Micro-Interaction Generator</h1>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Design GPU-accelerated keyframe transitions, smooth micro-interactions, and modern UI effects.</p>
                         </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                         <button
                              onClick={randomizeConfig}
                              className="flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-3.5 py-2 rounded-xl font-bold transition-colors"
                         >
                              <RotateCcw size={14} /> Randomize
                         </button>
                         <button
                              onClick={handleShare}
                              className="flex items-center gap-1.5 text-xs bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 px-3.5 py-2 rounded-xl font-bold transition-colors"
                         >
                              <Share2 size={14} /> {shareNotice ? "Link Copied!" : "Share URL"}
                         </button>
                    </div>
               </div>

               <AdSlot adSlot="top-css-anim-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               {/* Main Grid */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Preset Selector, Triggers, Tweaker */}
                    <div className="lg:col-span-5 flex flex-col gap-6">

                         {/* Preset Library Box */}
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-md dark:shadow-xl flex flex-col gap-4">
                              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800/60 pb-3">
                                   <h3 className="text-gray-900 dark:text-white font-bold text-base flex items-center gap-2">
                                        <Sparkles size={18} className="text-blue-500" /> Animation Library
                                   </h3>
                                   <span className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                        {filteredPresets.length} loaded
                                   </span>
                              </div>

                              {/* Working Search Bar */}
                              <div className="relative">
                                   <Search size={16} className="absolute left-3.5 top-3 text-gray-400 pointer-events-none" />
                                   <input
                                        type="text"
                                        placeholder="Search presets (e.g., glow, bounce, shimmer)..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
                                   />
                              </div>

                              {/* Category Filter Pills */}
                              <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
                                   {(["all", "buttons", "text", "cards", "loaders", "entrance", "ui"] as CategoryType[]).map((cat) => (
                                        <button
                                             key={cat}
                                             onClick={() => setCategory(cat)}
                                             className={`px-3 py-1.5 rounded-lg font-bold capitalize whitespace-nowrap transition-colors shrink-0 ${category === cat
                                                       ? "bg-blue-600 text-white shadow-sm"
                                                       : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                                  }`}
                                        >
                                             {cat}
                                        </button>
                                   ))}
                              </div>

                              {/* Preset Cards Grid */}
                              <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                                   {filteredPresets.length > 0 ? (
                                        filteredPresets.map((preset) => {
                                             const isSelected = selectedPresetId === preset.id;
                                             const isFav = favorites.includes(preset.id);
                                             return (
                                                  <div
                                                       key={preset.id}
                                                       onClick={() => setSelectedPresetId(preset.id)}
                                                       className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${isSelected
                                                                 ? "bg-blue-50 dark:bg-blue-600/15 border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm"
                                                                 : "bg-gray-50 dark:bg-gray-950/50 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700"
                                                            }`}
                                                  >
                                                       <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs font-bold truncate">{preset.name}</span>
                                                            <button
                                                                 onClick={(e) => { e.stopPropagation(); toggleFavorite(preset.id); }}
                                                                 className={`text-gray-400 hover:text-amber-500 transition-colors ${isFav ? "text-amber-500" : ""}`}
                                                                 aria-label="Bookmark preset"
                                                            >
                                                                 <Bookmark size={12} fill={isFav ? "currentColor" : "none"} />
                                                            </button>
                                                       </div>
                                                       <span className="text-[10px] text-gray-400 capitalize">{preset.category}</span>
                                                  </div>
                                             );
                                        })
                                   ) : (
                                        <div className="col-span-2 py-8 text-center text-xs text-gray-400">
                                             No matching animations found for "{searchQuery}".
                                        </div>
                                   )}
                              </div>
                         </div>

                         {/* Trigger & Timing Panel */}
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-md dark:shadow-xl flex flex-col gap-6">
                              <h3 className="text-gray-900 dark:text-white font-bold text-base border-b border-gray-200 dark:border-gray-800/60 pb-3">Timing & Triggers</h3>

                              <div className="space-y-2">
                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Trigger Mode {trigger !== "infinite" && trigger !== "page-load" && <span className="text-blue-500 lowercase font-normal">(try interacting with preview element)</span>}
                                   </label>
                                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {(["infinite", "hover", "click", "focus", "page-load"] as TriggerType[]).map((t) => (
                                             <button
                                                  key={t}
                                                  onClick={() => setTrigger(t)}
                                                  className={`py-2 px-2 rounded-xl text-xs font-bold capitalize transition-all border ${trigger === t
                                                            ? "bg-blue-50 dark:bg-blue-600/20 border-blue-500 text-blue-600 dark:text-blue-400"
                                                            : "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400"
                                                       }`}
                                             >
                                                  {t.replace("-", " ")}
                                             </button>
                                        ))}
                                   </div>
                              </div>

                              <div className="space-y-2">
                                   <div className="flex justify-between items-center">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</label>
                                        <span className="text-blue-600 dark:text-blue-400 font-mono bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded text-xs font-bold">{duration}s</span>
                                   </div>
                                   <input
                                        type="range" min="0.2" max="6" step="0.2" value={duration}
                                        onChange={(e) => setDuration(Number(e.target.value))}
                                        className="w-full accent-blue-500 cursor-pointer"
                                   />
                              </div>

                              <div className="space-y-2">
                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Easing Curve</label>
                                   <select
                                        value={easing}
                                        onChange={(e) => setEasing(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 font-medium cursor-pointer"
                                   >
                                        <option value="ease">Ease (Standard)</option>
                                        <option value="linear">Linear</option>
                                        <option value="ease-in-out">Ease-In-Out Smooth</option>
                                        <option value="cubic-bezier(0.68, -0.55, 0.265, 1.55)">Cubic-Bezier Bouncy</option>
                                        <option value="cubic-bezier(0.16, 1, 0.3, 1)">Cubic-Bezier Smooth Out</option>
                                   </select>
                              </div>
                         </div>

                         {/* Advanced Property Tweaker */}
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-md dark:shadow-xl flex flex-col gap-4">
                              <h3 className="text-gray-900 dark:text-white font-bold text-base border-b border-gray-200 dark:border-gray-800/60 pb-3 flex items-center gap-2">
                                   <Sliders size={16} className="text-blue-500" /> Advanced Tweaker
                              </h3>
                              <div className="space-y-3">
                                   <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500 dark:text-gray-400 font-bold uppercase">Border Radius</span>
                                        <span className="font-mono text-blue-500">{borderRadius}px</span>
                                   </div>
                                   <input type="range" min="0" max="50" value={borderRadius} onChange={(e) => setBorderRadius(Number(e.target.value))} className="w-full accent-blue-500" />
                              </div>
                              <div className="space-y-3">
                                   <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500 dark:text-gray-400 font-bold uppercase">Shadow Blur</span>
                                        <span className="font-mono text-blue-500">{shadowBlur}px</span>
                                   </div>
                                   <input type="range" min="0" max="50" value={shadowBlur} onChange={(e) => setShadowBlur(Number(e.target.value))} className="w-full accent-blue-500" />
                              </div>
                         </div>

                    </div>

                    {/* Right Column: Professional Studio Live Preview & Code Output */}
                    <div className="lg:col-span-7 flex flex-col gap-6">

                         {/* Professional Studio Live Preview Box */}
                         <div className="bg-gray-50 dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-3xl p-4 sm:p-8 flex flex-col items-center justify-center relative min-h-[380px] shadow-sm dark:shadow-2xl overflow-hidden transition-colors">
                              {/* Background Studio Grid Pattern */}
                              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />

                              {/* Top Toolbar: Device & Action Controls */}
                              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-25 pointer-events-none">
                                   <div className="flex items-center gap-1.5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200/80 dark:border-gray-800/80 p-1 rounded-xl pointer-events-auto shadow-sm">
                                        <button
                                             onClick={() => setPreviewDevice("desktop")}
                                             className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${previewDevice === "desktop" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
                                             aria-label="Desktop view"
                                        >
                                             <Monitor size={14} /> <span className="hidden sm:inline text-[11px]">Desktop</span>
                                        </button>
                                        <button
                                             onClick={() => setPreviewDevice("mobile")}
                                             className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${previewDevice === "mobile" ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
                                             aria-label="Mobile view"
                                        >
                                             <Smartphone size={14} /> <span className="hidden sm:inline text-[11px]">Mobile</span>
                                        </button>
                                   </div>

                                   <div className="flex items-center gap-2 pointer-events-auto">
                                        <button
                                             onClick={restartPreview}
                                             className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200/80 dark:border-gray-800/80 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 text-xs font-bold"
                                             title="Replay Animation"
                                        >
                                             <RefreshCw size={14} /> <span className="hidden sm:inline">Replay</span>
                                        </button>

                                        <button
                                             onClick={() => setIsPlaying(!isPlaying)}
                                             className={`backdrop-blur-md border px-3 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 text-xs font-bold ${isPlaying
                                                       ? "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400"
                                                       : "bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400"
                                                  }`}
                                        >
                                             <Play size={14} className={isPlaying ? "fill-current" : ""} />
                                             <span className="hidden sm:inline">{isPlaying ? "Playing" : "Paused"}</span>
                                        </button>
                                   </div>
                              </div>

                              {/* Central Stage Area */}
                              <div className={`transition-all duration-300 flex items-center justify-center p-6 mt-10 w-full ${previewDevice === "mobile" ? "max-w-[300px] border-[6px] border-gray-300 dark:border-gray-700 rounded-[40px] bg-white/80 dark:bg-gray-950/80 shadow-2xl relative" : ""}`}>
                                   {previewDevice === "mobile" && (
                                        <div className="absolute top-2 w-24 h-4 bg-gray-300 dark:bg-gray-800 rounded-full left-1/2 -translate-x-1/2" />
                                   )}

                                   {/* Interactive Preview Element with Event Handlers for Trigger simulation */}
                                   <div
                                        key={previewKey}
                                        tabIndex={0}
                                        onMouseEnter={() => setIsHovered(true)}
                                        onMouseLeave={() => { setIsHovered(false); setIsActive(false); }}
                                        onMouseDown={() => setIsActive(true)}
                                        onMouseUp={() => setIsActive(false)}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setIsFocused(false)}
                                        className="animated-element bg-gradient-to-tr from-blue-600 to-cyan-400 shadow-2xl flex items-center justify-center text-white font-bold z-0 cursor-pointer select-none my-4 outline-none focus:ring-4 focus:ring-blue-400/50"
                                        style={{
                                             width: "150px",
                                             height: "150px",
                                             borderRadius: `${borderRadius}px`,
                                             boxShadow: `0 10px ${shadowBlur}px rgba(0,0,0,0.25)`,
                                             animation: shouldAnimatePreview ? `${currentPreset.id} ${duration}s ${easing} ${delay}s infinite` : "none",
                                             transition: "transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease"
                                        }}
                                        title={trigger !== "infinite" && trigger !== "page-load" ? `Interact here to test trigger (${trigger})` : undefined}
                                   >
                                        {currentPreset.previewContent}
                                   </div>
                              </div>

                              {/* Bottom Status Info */}
                              <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-mono text-gray-400 mt-6 z-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-gray-200/50 dark:border-gray-800/50">
                                   <span>Preset: <strong className="text-gray-700 dark:text-gray-200">{currentPreset.name}</strong></span>
                                   <span className="hidden sm:inline">•</span>
                                   <span>Trigger: <strong className="text-blue-500 uppercase">{trigger}</strong></span>
                                   {trigger !== "infinite" && trigger !== "page-load" && (
                                        <span className="text-amber-500 font-bold hidden md:inline">(Hover/Click element to test)</span>
                                   )}
                              </div>
                         </div>

                         {/* Code Output Box */}
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 relative shadow-sm dark:shadow-xl transition-colors">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 border-b border-gray-200 dark:border-gray-800/60 pb-3">
                                   <div className="flex gap-1 overflow-x-auto pb-1 text-xs scrollbar-thin w-full sm:w-auto">
                                        {(["css", "tailwind", "scss", "variables", "react"] as OutputTab[]).map((tab) => (
                                             <button
                                                  key={tab}
                                                  onClick={() => setOutputTab(tab)}
                                                  className={`px-3 py-1.5 rounded-lg font-mono font-bold uppercase transition-colors shrink-0 ${outputTab === tab
                                                            ? "bg-blue-600 text-white"
                                                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                                       }`}
                                             >
                                                  {tab}
                                             </button>
                                        ))}
                                   </div>

                                   <button
                                        onClick={() => copy(getActiveCodeOutput())}
                                        className="flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-3.5 py-1.5 rounded-lg transition-colors font-bold shrink-0"
                                   >
                                        {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                        {isCopied ? "Copied!" : "Copy Code"}
                                   </button>
                              </div>

                              <pre className="text-xs font-mono text-gray-600 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap leading-relaxed bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
                                   <code>{getActiveCodeOutput()}</code>
                              </pre>
                         </div>

                         {/* Inspector Badge */}
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col gap-3">
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                   <ShieldCheck size={16} className="text-emerald-500" /> Performance & Accessibility Inspector
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                                   <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-950 p-2.5 rounded-xl border border-gray-200 dark:border-gray-800">
                                        <span className="text-emerald-500 font-bold">✓</span> GPU-Accelerated Compositing
                                   </div>
                                   <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-950 p-2.5 rounded-xl border border-gray-200 dark:border-gray-800">
                                        <span className="text-emerald-500 font-bold">✓</span> Zero Layout-Thrashing Properties
                                   </div>
                              </div>
                         </div>

                    </div>
               </div>

               <AdSlot adSlot="bottom-css-anim-ad" format="fluid" className="mt-4" />

               {/* SEO & Educational Content with FAQ Schema */}
               <div className="mt-12 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm">
                    <div className="prose dark:prose-invert max-w-none">
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">High-Performance CSS Animation & Keyframe Generator</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              Building smooth micro-interactions is critical for exceptional modern web experiences. The ToolLok <strong>CSS Animation Generator</strong> empowers frontend developers and UI/UX designers to configure production-ready keyframes, custom cubic-bezier timing curves, and trigger rules instantly. Explore our full suite of <Link href="/categories/developer-tools" className="text-blue-600 dark:text-blue-400 hover:underline">Developer Tools</Link> to accelerate your workflow.
                         </p>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4 mb-8">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">How do I test different trigger modes?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Simply select a trigger like Hover, Click, or Focus in the timing panel, then hover your mouse over, click, or tab into the live preview element to see the animation fire!</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Are these CSS animations optimized for mobile devices?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Yes! Because all keyframes leverage hardware-accelerated properties like `transform` and `opacity`, mobile browsers render them smoothly at 60fps without causing layout shifts.</p>
                              </div>
                         </div>
                    </div>

                    <script
                         type="application/ld+json"
                         dangerouslySetInnerHTML={{
                              __html: JSON.stringify({
                                   "@context": "https://schema.org",
                                   "@type": "FAQPage",
                                   "mainEntity": [
                                        {
                                             "@type": "Question",
                                             "name": "How do I test different trigger modes?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Select a trigger like Hover, Click, or Focus in the timing panel, then hover your mouse over, click, or tab into the live preview element." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "Are these CSS animations optimized for mobile devices?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Yes! Because all keyframes leverage hardware-accelerated properties like transform and opacity, mobile browsers render them smoothly at 60fps." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

          </div>
     );
}