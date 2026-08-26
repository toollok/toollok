"use client";

import { useState, useRef, ChangeEvent } from "react";
import Link from "next/link";
import {
     Layout, UploadCloud, Monitor, Smartphone, PanelRight, Sun, Moon,
     ImageIcon, Activity, SplitSquareHorizontal, Beaker, CheckCircle2,
     AlertCircle, Layers, EyeOff, Contrast, Wand2, Download, Maximize
} from "lucide-react";
import AdSlot from "@/components/ui/AdSlot";

// Define structures for our multi-thumbnail architecture
interface ThumbnailVariant {
     id: string;
     url: string;
     file: File | null;
     width: number;
     height: number;
     score: number;
     aspectRatio: string;
     sizeBytes: number;
}

export default function YouTubeThumbnailOptimizationStudio() {
     // --- STATE MANAGEMENT ---
     // Video Metadata
     const [title, setTitle] = useState<string>("I Built a Master App in 10 Days (Full Tutorial)");
     const [channelName, setChannelName] = useState<string>("CodeMines");
     const [views, setViews] = useState<string>("125K");
     const [timeAgo, setTimeAgo] = useState<string>("2 days ago");
     const [duration, setDuration] = useState<string>("14:20");

     // Workspace State
     const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
     const [activeTab, setActiveTab] = useState<"preview" | "analyze" | "compare">("preview");

     // Visual Test Toggles
     const [isBlurred, setIsBlurred] = useState<boolean>(false);
     const [isGrayscale, setIsGrayscale] = useState<boolean>(false);
     const [showSafeZones, setShowSafeZones] = useState<boolean>(false);

     // Variants State (A/B/C Testing)
     const [variants, setVariants] = useState<ThumbnailVariant[]>([
          {
               id: "A",
               url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1280&q=80",
               file: null,
               width: 1280,
               height: 720,
               score: 85,
               aspectRatio: "16:9",
               sizeBytes: 0,
          }
     ]);
     const [activeVariantId, setActiveVariantId] = useState<string>("A");
     const fileInputRef = useRef<HTMLInputElement>(null);

     // Derived active variant
     const activeVariant = variants.find(v => v.id === activeVariantId) || variants[0];

     // --- LOGIC & HANDLERS ---

     // Analyze image dimensions and calculate a heuristic visual score locally
     const analyzeImageLocally = (url: string, file: File | null, id: string) => {
          const img = new Image();
          img.crossOrigin = "Anonymous";
          img.onload = () => {
               const w = img.width;
               const h = img.height;
               const ratio = (w / h).toFixed(2);
               let score = 100;
               let arString = "16:9";

               // Penalize non 16:9
               if (ratio !== "1.78" && ratio !== "1.77") {
                    score -= 30;
                    arString = `${w}:${h}`;
               }
               // Penalize low resolution
               if (w < 1280) score -= 15;
               if (w < 640) score -= 25;
               // File size penalty (if too large for YT, > 2MB)
               if (file && file.size > 2 * 1024 * 1024) score -= 20;

               setVariants(prev => prev.map(v =>
                    v.id === id ? { ...v, width: w, height: h, aspectRatio: arString, score: Math.max(0, score), sizeBytes: file ? file.size : 0 } : v
               ));
          };
          img.src = url;
     };

     const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (file) {
               const url = URL.createObjectURL(file);

               // If less than 3 variants, we can add a new one, else replace active
               setVariants(prev => {
                    const updated = [...prev];
                    const activeIndex = updated.findIndex(v => v.id === activeVariantId);

                    if (updated[activeIndex].file === null && prev.length === 1) {
                         // Replace default Unsplash image
                         updated[activeIndex] = { ...updated[activeIndex], url, file };
                    } else if (prev.length < 3 && !prev.some(v => v.file === null)) {
                         // Add new variant (B or C)
                         const newId = prev.length === 1 ? "B" : "C";
                         updated.push({
                              id: newId, url, file, width: 0, height: 0, score: 0, aspectRatio: "", sizeBytes: file.size
                         });
                         setActiveVariantId(newId);
                    } else {
                         // Replace active variant
                         updated[activeIndex] = { ...updated[activeIndex], url, file };
                    }
                    return updated;
               });

               // Run analysis on the newly added/replaced image
               analyzeImageLocally(url, file, activeVariantId === "A" && variants.length === 1 && variants[0].file === null ? "A" : (variants.length < 3 && !variants.some(v => v.file === null) ? (variants.length === 1 ? "B" : "C") : activeVariantId));
          }
     };

     const addVariant = () => {
          if (variants.length < 3) {
               fileInputRef.current?.click();
          }
     };

     // Client-side report generation and download
     const handleDownloadReport = () => {
          const reportContent = `=========================================
YOUTUBE THUMBNAIL OPTIMIZATION REPORT
Generated by ToolLok
=========================================

VIDEO METADATA
-----------------------------------------
Video Title: ${title}
Channel Name: ${channelName}
Views: ${views}
Time Ago: ${timeAgo}
Duration: ${duration}

THUMBNAIL DIAGNOSTICS (Variant ${activeVariant.id})
-----------------------------------------
Overall Quality Score: ${activeVariant.score}/100

TECHNICAL CONSTRAINTS
- Resolution: ${activeVariant.width}x${activeVariant.height}px (${activeVariant.width >= 1280 ? "Pass" : (activeVariant.width === 0 ? "No Image" : "Fail - Recommend 1280x720")})
- Aspect Ratio: ${activeVariant.aspectRatio} (${activeVariant.aspectRatio === "16:9" || activeVariant.aspectRatio === "1.78" ? "Pass" : "Fail - Non-standard ratio detected"})
- File Size: ${(activeVariant.sizeBytes / 1024 / 1024).toFixed(2)} MB (${activeVariant.sizeBytes <= 2 * 1024 * 1024 ? "Pass" : "Fail - File too large, max 2MB"})

RECOMMENDATIONS
-----------------------------------------
${activeVariant.width >= 1280 ? "[✓] Resolution is optimal." : (activeVariant.width === 0 ? "[!] Please upload an image first." : "[!] Increase resolution to at least 1280x720 for crisp display on larger screens (TVs).")}
${activeVariant.aspectRatio === "16:9" || activeVariant.aspectRatio === "1.78" ? "[✓] Aspect ratio is perfectly matched to YouTube's player." : "[!] Crop your image to exactly 16:9 to avoid black bars."}
${activeVariant.sizeBytes <= 2 * 1024 * 1024 ? "[✓] File size is within YouTube limits." : "[!] Compress your image file to under 2MB before uploading."}
[i] Always test readability on small mobile screens. Ensure key text is large enough and faces are expressive.
[i] Keep the bottom-right corner clear of important text/graphics to avoid overlap with the duration timestamp.

=========================================
Disclaimer: This is a technical heuristic score based on measurable design signals like resolution, aspect ratio, and file constraints. It does not predict actual audience CTR.
`;

          // Create Blob and trigger download
          const blob = new Blob([reportContent], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `YouTube_Thumbnail_Report_Variant_${activeVariant.id}.txt`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url); // Clean up memory
     };

     // --- HELPER STYLES ---
     const filterStyles = `${isBlurred ? 'blur-md scale-105' : ''} ${isGrayscale ? 'grayscale' : ''} transition-all duration-300`;

     // --- COMPONENTS ---
     const SafeZoneOverlay = () => {
          if (!showSafeZones) return null;
          return (
               <div className="absolute inset-0 z-20 pointer-events-none">
                    {/* Duration Badge Zone */}
                    <div className="absolute bottom-1 right-1 w-1/4 h-1/6 bg-red-500/30 border border-red-500 flex items-center justify-center text-white text-[8px] md:text-xs font-bold">Avoid (Duration)</div>
                    {/* Watch Later / Add to Queue Zone */}
                    <div className="absolute top-1 right-1 w-1/6 h-1/4 bg-red-500/30 border border-red-500 flex flex-col items-center justify-center text-white text-[8px] md:text-xs font-bold text-center">Avoid<br />(UI Overlays)</div>
                    {/* Safe Core */}
                    <div className="absolute inset-[10%] border-2 border-dashed border-green-500 bg-green-500/10 flex items-center justify-center text-green-400 font-bold opacity-70">Primary Subject Safe Zone</div>
               </div>
          );
     };

     return (
          <div className="w-full max-w-screen-2xl mx-auto flex flex-col gap-6 overflow-x-hidden">
               {/* * NOTE: Metadata (title, description, canonical, OpenGraph) should ideally be exported 
                 * from your Next.js layout.tsx or page.tsx file as `export const metadata = { ... }`.
                 * For this client component, we handle the on-page H1 and JSON-LD structured data.
               */}

               {/* Header Section */}
               <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-4">
                    <div className="flex items-center gap-4">
                         <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-500/20 shrink-0">
                              <Activity size={28} />
                         </div>
                         <div>
                              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">YouTube Thumbnail Analyzer & Previewer</h1>
                              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">Free YouTube thumbnail tester for CTR analysis, A/B testing, and realistic mobile previews.</p>
                         </div>
                    </div>

                    <div className="flex items-center gap-3">
                         <button
                              onClick={() => setIsDarkMode(!isDarkMode)}
                              className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:border-gray-700 text-gray-900 dark:text-gray-300 px-4 py-2.5 rounded-xl transition-all shadow-sm shrink-0"
                         >
                              {isDarkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-blue-500" />}
                              <span className="text-sm font-bold hidden sm:block">{isDarkMode ? "Light UI" : "Dark UI"}</span>
                         </button>
                    </div>
               </div>

               <AdSlot adSlot="top-yt-preview-ad" format="horizontal" minHeight="90px" className="hidden xl:flex mb-2" />

               {/* Main Layout Grid */}
               <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start">

                    {/* LEFT PANEL: Metadata & Controls */}
                    <div className="xl:col-span-3 flex flex-col gap-6 xl:sticky xl:top-24">

                         {/* Variant Selector */}
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm">
                              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                   <Layers size={16} /> Thumbnail Variants
                              </h2>
                              <div className="flex gap-2 mb-3">
                                   {variants.map((v) => (
                                        <button
                                             key={v.id}
                                             onClick={() => setActiveVariantId(v.id)}
                                             className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${activeVariantId === v.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                        >
                                             Var {v.id}
                                        </button>
                                   ))}
                                   {variants.length < 3 && (
                                        <button onClick={addVariant} className="flex-1 py-2 rounded-lg font-bold text-sm bg-gray-50 dark:bg-gray-950 border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-all flex items-center justify-center">
                                             + Add
                                        </button>
                                   )}
                              </div>

                              {/* Image Uploader */}
                              <div
                                   onClick={() => fileInputRef.current?.click()}
                                   className="w-full aspect-video border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-gray-50 dark:bg-gray-950/50 transition-colors group overflow-hidden relative"
                              >
                                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                        <span className="text-white font-bold text-sm bg-blue-600 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                             <UploadCloud size={16} /> Replace Variant {activeVariant.id}
                                        </span>
                                   </div>
                                   <img src={activeVariant.url} alt={`YouTube thumbnail preview variant ${activeVariant.id}`} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                              </div>
                              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                         </div>

                         {/* Text Inputs */}
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
                              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                                   <Monitor size={16} /> Video Metadata
                              </h2>
                              <div>
                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block uppercase tracking-wide">Video Title</label>
                                   <textarea
                                        value={title} onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none h-20 transition-all font-medium"
                                   />
                              </div>

                              <div>
                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block uppercase tracking-wide">Channel Name</label>
                                   <input
                                        type="text" value={channelName} onChange={(e) => setChannelName(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-all font-medium"
                                   />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                   <div>
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block uppercase tracking-wide">Views</label>
                                        <input
                                             type="text" value={views} onChange={(e) => setViews(e.target.value)}
                                             className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-all"
                                        />
                                   </div>
                                   <div>
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block uppercase tracking-wide">Time Ago</label>
                                        <input
                                             type="text" value={timeAgo} onChange={(e) => setTimeAgo(e.target.value)}
                                             className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-all"
                                        />
                                   </div>
                              </div>

                              <div>
                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block uppercase tracking-wide">Duration Tag</label>
                                   <input
                                        type="text" value={duration} onChange={(e) => setDuration(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-all"
                                        placeholder="e.g., 10:05"
                                   />
                              </div>
                         </div>
                    </div>

                    {/* RIGHT PANEL: Workspace */}
                    <div className="xl:col-span-9 flex flex-col gap-6">

                         {/* Tab Navigation - Scrollable on mobile */}
                         <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm w-full md:w-fit overflow-x-auto [&::-webkit-scrollbar]:hidden">
                              <button onClick={() => setActiveTab("preview")} className={`whitespace-nowrap flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "preview" ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                                   <Monitor size={16} /> Live Previews
                              </button>
                              <button onClick={() => setActiveTab("analyze")} className={`whitespace-nowrap flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "analyze" ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                                   <Beaker size={16} /> Diagnostics & Score
                              </button>
                              <button onClick={() => setActiveTab("compare")} className={`whitespace-nowrap flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "compare" ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                                   <SplitSquareHorizontal size={16} /> A/B Compare
                              </button>
                         </div>

                         {/* --- TAB: LIVE PREVIEWS --- */}
                         {activeTab === "preview" && (
                              <div className="flex flex-col gap-6">
                                   {/* Visual Testing Toolbar */}
                                   <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-3 shadow-sm">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-2 pr-2">Visual Tests:</span>
                                        <button onClick={() => setIsBlurred(!isBlurred)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${isBlurred ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700/50 dark:text-indigo-300' : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                             <EyeOff size={14} /> Blur Test
                                        </button>
                                        <button onClick={() => setIsGrayscale(!isGrayscale)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${isGrayscale ? 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-800 dark:border-gray-600 dark:text-white' : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                             <Contrast size={14} /> Grayscale Test
                                        </button>
                                        <button onClick={() => setShowSafeZones(!showSafeZones)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${showSafeZones ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-700/50 dark:text-emerald-300' : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                             <Maximize size={14} /> Safe Zones
                                        </button>
                                   </div>

                                   <div className={`rounded-3xl p-4 sm:p-6 md:p-8 flex flex-col gap-12 transition-colors shadow-sm border ${isDarkMode ? "bg-[#0f0f0f] border-gray-800 text-white" : "bg-white border-gray-200 text-black"}`}>

                                        {/* 1. Desktop Home Preview */}
                                        <div>
                                             <h3 className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-5 opacity-60 ${isDarkMode ? "text-white" : "text-black"}`}>
                                                  <Monitor size={16} /> Desktop Homepage Layout
                                             </h3>
                                             <div className={`w-full max-w-[420px] rounded-xl overflow-hidden border shadow-xl transition-colors ${isDarkMode ? "border-gray-800 bg-[#0f0f0f]" : "border-gray-200 bg-[#f8f8f8]"}`}>
                                                  <div className="p-3 sm:p-4">
                                                       <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-black">
                                                            <img src={activeVariant.url} alt={`YouTube Desktop Thumbnail view for Variant ${activeVariant.id}`} className={`w-full h-full object-cover ${filterStyles}`} />
                                                            <SafeZoneOverlay />
                                                            <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded z-30">
                                                                 {duration}
                                                            </div>
                                                       </div>
                                                       <div className="flex gap-3 pr-2">
                                                            <div className="w-9 h-9 rounded-full shrink-0 mt-0.5 flex items-center justify-center font-bold text-sm bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                                                                 {channelName.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                 <h4 className={`font-semibold text-base leading-tight line-clamp-2 mb-1 ${isDarkMode ? "text-white" : "text-black"}`}>
                                                                      {title}
                                                                 </h4>
                                                                 <p className={`text-[13px] opacity-70 hover:opacity-100 transition-opacity cursor-pointer ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                                                      {channelName}
                                                                 </p>
                                                                 <p className={`text-[13px] opacity-70 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                                                      {views} views • {timeAgo}
                                                                 </p>
                                                            </div>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>

                                        <div className={`h-px w-full ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}></div>

                                        {/* 2. Mobile Home Preview */}
                                        <div>
                                             <h3 className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-5 opacity-60 ${isDarkMode ? "text-white" : "text-black"}`}>
                                                  <Smartphone size={16} /> Mobile View Layout
                                             </h3>
                                             <div className={`w-full max-w-[340px] rounded-[2rem] sm:rounded-[2.5rem] border-[8px] sm:border-[10px] overflow-hidden shadow-2xl relative transition-colors mx-auto sm:mx-0 ${isDarkMode ? "border-gray-800 bg-[#0f0f0f]" : "border-gray-300 bg-[#f8f8f8]"}`}>
                                                  <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-5 sm:h-6 rounded-b-3xl z-40 transition-colors ${isDarkMode ? "bg-gray-800" : "bg-gray-300"}`}></div>
                                                  <div className="p-0 pb-6 pt-8 sm:pt-10">
                                                       <div className="relative aspect-video mb-3 bg-black">
                                                            <img src={activeVariant.url} alt={`YouTube Mobile Thumbnail View for Variant ${activeVariant.id}`} className={`w-full h-full object-cover ${filterStyles}`} />
                                                            <SafeZoneOverlay />
                                                            <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded z-30">
                                                                 {duration}
                                                            </div>
                                                       </div>
                                                       <div className="flex gap-3 px-3">
                                                            <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-bold bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                                                                 {channelName.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex flex-col pr-2">
                                                                 <h4 className={`font-semibold text-[15px] leading-tight line-clamp-2 mb-1 ${isDarkMode ? "text-white" : "text-black"}`}>
                                                                      {title}
                                                                 </h4>
                                                                 <p className={`text-[12px] opacity-70 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                                                      {channelName} • {views} views • {timeAgo}
                                                                 </p>
                                                            </div>
                                                       </div>
                                                  </div>
                                                  <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-1 rounded-full transition-colors ${isDarkMode ? "bg-gray-700" : "bg-gray-400"}`}></div>
                                             </div>
                                        </div>

                                        <div className={`h-px w-full ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}></div>

                                        {/* 3. Sidebar / Search Preview */}
                                        <div>
                                             <h3 className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-5 opacity-60 ${isDarkMode ? "text-white" : "text-black"}`}>
                                                  <PanelRight size={16} /> Sidebar / Up Next
                                             </h3>
                                             <div className={`w-full max-w-[450px] flex gap-3 p-3 rounded-xl border transition-colors ${isDarkMode ? "border-gray-800 bg-[#0f0f0f]" : "border-gray-200 bg-[#f8f8f8]"}`}>
                                                  <div className="relative w-32 sm:w-44 shrink-0 aspect-video rounded-lg overflow-hidden bg-black">
                                                       <img src={activeVariant.url} alt={`YouTube Sidebar Thumbnail view for Variant ${activeVariant.id}`} className={`w-full h-full object-cover ${filterStyles}`} />
                                                       <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1 py-0.5 rounded z-30">
                                                            {duration}
                                                       </div>
                                                  </div>
                                                  <div className="flex flex-col pt-0.5 pr-2">
                                                       <h4 className={`font-semibold text-[13px] sm:text-[14px] leading-tight line-clamp-2 mb-1 ${isDarkMode ? "text-white" : "text-black"}`}>
                                                            {title}
                                                       </h4>
                                                       <p className={`text-[11px] sm:text-[12px] opacity-70 line-clamp-1 hover:opacity-100 cursor-pointer transition-opacity ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                                            {channelName}
                                                       </p>
                                                       <p className={`text-[11px] sm:text-[12px] opacity-70 mt-0.5 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                                            {views} views • {timeAgo}
                                                       </p>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         )}

                         {/* --- TAB: ANALYZE & SCORE --- */}
                         {activeTab === "analyze" && (
                              <div className="flex flex-col gap-6">
                                   {/* Score Card */}
                                   <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 sm:gap-8 shadow-sm relative overflow-hidden">
                                        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                                        <div className="flex-shrink-0 relative flex items-center justify-center w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-50 dark:bg-gray-950 border-8 border-gray-100 dark:border-gray-800 shadow-inner">
                                             <div className="text-center">
                                                  <span className={`text-4xl md:text-5xl font-black ${activeVariant.score >= 80 ? 'text-green-500' : activeVariant.score >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                                                       {activeVariant.score}
                                                  </span>
                                                  <span className="block text-xs font-bold text-gray-400 uppercase mt-1">/ 100</span>
                                             </div>
                                             <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                                                  <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-gray-800" />
                                                  <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="289.026" strokeDashoffset={289.026 - (289.026 * activeVariant.score) / 100} className={`transition-all duration-1000 ${activeVariant.score >= 80 ? 'text-green-500' : activeVariant.score >= 60 ? 'text-yellow-500' : 'text-red-500'}`} strokeLinecap="round" />
                                             </svg>
                                        </div>

                                        <div className="flex-1 text-center md:text-left z-10">
                                             <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Thumbnail Quality Score</h3>
                                             <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                                                  This YouTube thumbnail quality checker utilizes a technical heuristic score based on measurable design signals like resolution, aspect ratio, and file constraints. <span className="font-semibold text-gray-900 dark:text-gray-200">It does not predict actual audience CTR.</span>
                                             </p>
                                             {/* FIX IMPLEMENTED HERE: Added onClick handler to the button shown in image_2d3d02.png */}
                                             <button
                                                  onClick={handleDownloadReport}
                                                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-600/20"
                                             >
                                                  <Download size={16} /> Download Full Report
                                             </button>
                                        </div>
                                   </div>

                                   {/* Diagnostics Grid */}
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Technical Constraints */}
                                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
                                             <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                                                  <Activity size={18} className="text-blue-500" /> Technical Diagnostics
                                             </h3>
                                             <ul className="space-y-4">
                                                  <li className="flex items-start gap-3">
                                                       {activeVariant.width >= 1280 ? <CheckCircle2 className="text-green-500 shrink-0" size={20} /> : <AlertCircle className="text-red-500 shrink-0" size={20} />}
                                                       <div>
                                                            <p className="text-sm font-bold text-gray-900 dark:text-white">Resolution: {activeVariant.width}x{activeVariant.height}px</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{activeVariant.width >= 1280 ? "Optimal resolution detected." : "Warning: Resolution is below the recommended 1280x720. May look blurry on TVs."}</p>
                                                       </div>
                                                  </li>
                                                  <li className="flex items-start gap-3">
                                                       {activeVariant.aspectRatio === "16:9" || activeVariant.aspectRatio === "1.78" ? <CheckCircle2 className="text-green-500 shrink-0" size={20} /> : <AlertCircle className="text-yellow-500 shrink-0" size={20} />}
                                                       <div>
                                                            <p className="text-sm font-bold text-gray-900 dark:text-white">Aspect Ratio: {activeVariant.aspectRatio}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{activeVariant.aspectRatio === "16:9" ? "Perfect 16:9 ratio." : "YouTube will add black bars to non-16:9 thumbnails."}</p>
                                                       </div>
                                                  </li>
                                                  <li className="flex items-start gap-3">
                                                       {activeVariant.sizeBytes <= 2097152 ? <CheckCircle2 className="text-green-500 shrink-0" size={20} /> : <AlertCircle className="text-red-500 shrink-0" size={20} />}
                                                       <div>
                                                            <p className="text-sm font-bold text-gray-900 dark:text-white">File Size: {(activeVariant.sizeBytes / 1024 / 1024).toFixed(2)} MB</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{activeVariant.sizeBytes <= 2097152 ? "Under the 2MB YouTube limit." : "Critical: File exceeds YouTube's 2MB limit. Must compress."}</p>
                                                       </div>
                                                  </li>
                                             </ul>
                                        </div>

                                        {/* Extreme Mobile Readability */}
                                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center">
                                             <h3 className="text-sm w-full text-left font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                                                  <Smartphone size={18} className="text-blue-500" /> Extreme Mobile Test
                                             </h3>
                                             <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 px-4">Can you still read the text and identify the subject at 160px width?</p>

                                             <div className="w-[160px] max-w-full aspect-video bg-black rounded-md overflow-hidden relative shadow-md">
                                                  <img src={activeVariant.url} alt="Extreme mobile thumbnail readability test" className="w-full h-full object-cover" />
                                                  <div className="absolute bottom-0.5 right-0.5 bg-black text-white text-[6px] px-1 rounded-sm">{duration}</div>
                                             </div>
                                             <div className="mt-6 w-full flex items-center justify-between text-xs font-semibold px-2 sm:px-4">
                                                  <span className="text-gray-400 line-through decoration-red-500">Unreadable</span>
                                                  <div className="flex gap-1">
                                                       <div className="w-6 sm:w-8 h-2 rounded-l-full bg-red-500"></div>
                                                       <div className="w-6 sm:w-8 h-2 bg-yellow-500"></div>
                                                       <div className="w-6 sm:w-8 h-2 rounded-r-full bg-green-500"></div>
                                                  </div>
                                                  <span className="text-green-500">Clear</span>
                                             </div>
                                        </div>

                                        {/* AI Future Integration Placeholder */}
                                        <div className="md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/50 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                             <div>
                                                  <h3 className="text-base font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2 mb-1">
                                                       <Wand2 size={18} /> AI Concept & Match Analyzer (Coming Soon)
                                                  </h3>
                                                  <p className="text-sm text-blue-700/80 dark:text-blue-400/80">Future integration will analyze Title + Thumbnail semantic match and detect text/faces.</p>
                                             </div>
                                             <button disabled className="whitespace-nowrap px-5 py-2 bg-white/50 dark:bg-gray-900/50 text-blue-400 dark:text-blue-600 font-bold text-sm rounded-xl border border-blue-200 dark:border-blue-800/50 cursor-not-allowed">
                                                  API Offline
                                             </button>
                                        </div>
                                   </div>
                              </div>
                         )}

                         {/* --- TAB: A/B COMPARE --- */}
                         {activeTab === "compare" && (
                              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm">
                                   <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">YouTube Thumbnail A/B Test Comparison</h2>
                                   <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">Compare up to 3 design variants side-by-side using our free YouTube thumbnail comparison tool to visually identify the strongest concept.</p>

                                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {variants.map((variant) => (
                                             <div key={variant.id} className={`flex flex-col rounded-2xl border-2 transition-all ${activeVariantId === variant.id ? 'border-blue-500 shadow-lg shadow-blue-500/10' : 'border-gray-100 dark:border-gray-800'}`}>
                                                  <div className="bg-gray-50 dark:bg-gray-950 px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center rounded-t-2xl">
                                                       <span className="font-bold text-gray-900 dark:text-white">Variant {variant.id}</span>
                                                       {activeVariantId === variant.id && <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full">Active</span>}
                                                  </div>
                                                  <div className="p-3">
                                                       <div className="relative aspect-video rounded-lg overflow-hidden bg-black mb-4">
                                                            <img src={variant.url} alt={`YouTube Thumbnail comparison view for Variant ${variant.id}`} className="w-full h-full object-cover" />
                                                       </div>
                                                       <div className="flex justify-between items-center text-sm mb-2">
                                                            <span className="text-gray-500 dark:text-gray-400 font-medium">Quality Score</span>
                                                            <span className={`font-bold ${variant.score >= 80 ? 'text-green-500' : variant.score >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>{variant.score}/100</span>
                                                       </div>
                                                       <div className="flex justify-between items-center text-sm mb-4">
                                                            <span className="text-gray-500 dark:text-gray-400 font-medium">Resolution</span>
                                                            <span className="font-bold text-gray-900 dark:text-white">{variant.width || "-"}x{variant.height || "-"}</span>
                                                       </div>
                                                       <button
                                                            onClick={() => setActiveVariantId(variant.id)}
                                                            className={`w-full py-2 rounded-xl text-sm font-bold transition-all ${activeVariantId === variant.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                                       >
                                                            {activeVariantId === variant.id ? "Currently Editing" : "Select & Edit"}
                                                       </button>
                                                  </div>
                                             </div>
                                        ))}

                                        {variants.length < 3 && (
                                             <div
                                                  onClick={addVariant}
                                                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all cursor-pointer min-h-[300px]"
                                             >
                                                  <UploadCloud size={32} className="text-gray-400 mb-3" />
                                                  <span className="font-bold text-gray-600 dark:text-gray-300">Add Variant {variants.length === 1 ? "B" : "C"}</span>
                                                  <span className="text-xs text-gray-500 mt-1">Upload another image to compare</span>
                                             </div>
                                        )}
                                   </div>
                              </div>
                         )}
                    </div>
               </div>

               {/* ========================================= */}
               {/* SEO CONTENT AREA & FAQS                   */}
               {/* ========================================= */}
               <div className="mt-8 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm">
                    <div className="prose dark:prose-invert max-w-none">
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Optimize with our Free YouTube Thumbnail Tester</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              A great video with a poorly optimized thumbnail will struggle to get views. ToolLok's free <strong>YouTube Thumbnail Analyzer</strong> allows creators to upload artwork, test A/B variants side-by-side, and instantly check how concepts look natively across the YouTube ecosystem. Use our YouTube thumbnail optimization tool to preview your designs on mobile grids, check text readability, and maximize your Click-Through Rate (CTR) before you even hit publish.
                         </p>

                         <div className="grid md:grid-cols-2 gap-8 mb-8">
                              <div>
                                   <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Why Use a YouTube Thumbnail Checker?</h3>
                                   <ul className="list-none space-y-2 text-sm text-gray-600 dark:text-gray-400 p-0">
                                        <li className="flex gap-2 items-start"><CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" /> <strong>YouTube Thumbnail Readability Checker:</strong> Use our Blur and Grayscale testing tools to ensure your primary subject and text remain highly legible at a glance.</li>
                                        <li className="flex gap-2 items-start"><CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" /> <strong>YouTube Thumbnail Size Checker:</strong> Easily verify that your resolution and aspect ratios meet platform standards, and ensure your text isn't blocked by duration overlays.</li>
                                        <li className="flex gap-2 items-start"><CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" /> <strong>YouTube Thumbnail Comparison Tool:</strong> Upload up to 3 variations to our YouTube thumbnail CTR tester to evaluate which concept communicates your premise fastest.</li>
                                   </ul>
                              </div>
                              <div>
                                   <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Privacy & Technical Architecture</h3>
                                   <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                        We respect your unreleased content. All rendering, YouTube thumbnail previews, and technical score calculations are performed <strong>locally in your browser</strong> using client-side JavaScript. We do not upload or store your unreleased image assets on our servers. Pair this free YouTube thumbnail previewer with our other <Link href="/categories/content-creator-tools" className="text-blue-600 dark:text-blue-400 hover:underline">Content Creator Tools</Link> to fully optimize your next video upload.
                                   </p>
                              </div>
                         </div>

                         {/* FAQ Section */}
                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                              <div className="bg-gray-50 dark:bg-gray-950/80 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">What is the ideal YouTube thumbnail size?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">The recommended resolution is 1280x720 pixels (with a minimum width of 640 pixels). Thumbnails must maintain a 16:9 aspect ratio and the file size cannot exceed 2MB. JPG, PNG, and WebP are supported.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950/80 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">How is the Thumbnail Quality Score calculated?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">The score is a heuristic technical metric. It checks for optimal resolution, strict 16:9 aspect ratios, and valid file sizes. It is designed to flag technical errors, not predict actual human CTR behavior.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950/80 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">How can I test a thumbnail on mobile?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Our studio features an "Extreme Mobile Test" in the Diagnostics tab, rendering your thumbnail at 160px width. If you cannot read your text at this size, it is too small for mobile users.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950/80 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Can I compare multiple thumbnails?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Yes. Switch to the "A/B Compare" tab in the workspace to upload and evaluate up to 3 different thumbnail concepts side-by-side.</p>
                              </div>
                         </div>
                    </div>

                    {/* SEO Structured Data for the Tool itself */}
                    <script
                         type="application/ld+json"
                         dangerouslySetInnerHTML={{
                              __html: JSON.stringify({
                                   "@context": "https://schema.org",
                                   "@type": "WebApplication",
                                   "name": "YouTube Thumbnail Analyzer & Previewer",
                                   "alternateName": ["YouTube Thumbnail Tester", "YouTube Thumbnail Checker", "YouTube Thumbnail Optimization Tool"],
                                   "applicationCategory": "UtilitiesApplication",
                                   "operatingSystem": "All",
                                   "description": "Free YouTube thumbnail analyzer and previewer tool. Test YouTube thumbnail size, check CTR readability, run contrast tests, and compare A/B variants on simulated desktop and mobile YouTube previews.",
                                   "offers": {
                                        "@type": "Offer",
                                        "price": "0",
                                        "priceCurrency": "USD"
                                   },
                                   "featureList": [
                                        "YouTube Thumbnail Size Checker",
                                        "YouTube Thumbnail Readability Checker",
                                        "YouTube Thumbnail Comparison Tool",
                                        "Mobile Thumbnail Previewer"
                                   ]
                              })
                         }}
                    />

                    {/* SEO Structured Data for the FAQPage */}
                    <script
                         type="application/ld+json"
                         dangerouslySetInnerHTML={{
                              __html: JSON.stringify({
                                   "@context": "https://schema.org",
                                   "@type": "FAQPage",
                                   "mainEntity": [
                                        {
                                             "@type": "Question",
                                             "name": "What is the ideal YouTube thumbnail size?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "The recommended size is 1280x720 pixels (16:9 ratio) with a file size under 2MB." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "How is the Thumbnail Quality Score calculated?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "The score is a technical heuristic checking resolution, aspect ratio, and file size constraints." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "How can I test a thumbnail on mobile?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "The tool includes an extreme mobile test rendering the image at 160px to verify small-screen readability." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "Can I compare multiple thumbnails?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Yes. Switch to the A/B Compare tab to upload and evaluate up to 3 different thumbnail concepts side-by-side." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-yt-preview-ad" format="fluid" className="mt-4" />
          </div>
     );
}