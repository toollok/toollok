"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Monitor, Smartphone, Share2, Code, Copy, Check, AlertTriangle, Globe, Image as ImageIcon, Sparkles, Terminal, Star, Gauge, CheckCircle2, XCircle, Info, Tag } from "lucide-react";
import AdSlot from "@/components/ui/AdSlot";

type ViewMode = "google" | "social" | "code";
type DeviceMode = "desktop" | "mobile";
type SocialPlatform = "twitter" | "facebook" | "discord";

const POWER_WORDS = ["free", "best", "guide", "top", "fast", "easy", "ultimate", "2026", "review", "how", "simple"];

export default function SerpPreviewOptimizer() {
     const [activeTab, setActiveTab] = useState<ViewMode>("google");
     const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
     const [socialPlatform, setSocialPlatform] = useState<SocialPlatform>("twitter");
     const [isCopied, setIsCopied] = useState(false);

     const [focusKeyword, setFocusKeyword] = useState("SERP Preview");
     const [url, setUrl] = useState("https://toollok.com/tools/serp-preview-optimizer");
     const [title, setTitle] = useState("Free SERP Preview Tool & Meta Tag Optimizer | ToolLok");
     const [description, setDescription] = useState("Optimize your Google search results and social media cards with our free real-time SERP simulator. Prevent title truncation and boost your organic CTR.");
     const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80");

     const [showRating, setShowRating] = useState(true);
     const [ratingVal, setRatingVal] = useState("4.9");
     const [reviewCount, setReviewCount] = useState("128");
     const [showDate, setShowDate] = useState(true);

     const titlePixelWidth = Math.round(title.length * 8.5);
     const descPixelWidth = Math.round(description.length * 6.5);

     const TITLE_MAX_PX = 580;
     const DESC_MAX_PX_DESKTOP = 920;
     const DESC_MAX_PX_MOBILE = 680;

     const descMaxPx = deviceMode === "desktop" ? DESC_MAX_PX_DESKTOP : DESC_MAX_PX_MOBILE;

     const titleStatus = titlePixelWidth === 0 ? "empty" : titlePixelWidth <= TITLE_MAX_PX ? "good" : "danger";
     const descStatus = descPixelWidth === 0 ? "empty" : descPixelWidth <= descMaxPx ? "good" : "danger";

     const kw = focusKeyword.trim().toLowerCase();
     const kwInTitle = kw ? title.toLowerCase().includes(kw) : false;
     const kwInDesc = kw ? description.toLowerCase().includes(kw) : false;
     const kwInUrl = kw ? url.toLowerCase().includes(kw.replace(/\s+/g, "-")) : false;

     const seoScoreData = useMemo(() => {
          let score = 0;
          const checks: { label: string; passed: boolean; pts: number }[] = [];

          const titleLenOk = titlePixelWidth >= 300 && titlePixelWidth <= TITLE_MAX_PX;
          checks.push({ label: "Title length within optimal pixel limit", passed: titleLenOk, pts: 20 });
          if (titleLenOk) score += 20;

          const descLenOk = descPixelWidth >= 400 && descPixelWidth <= descMaxPx;
          checks.push({ label: "Meta description optimal length", passed: descLenOk, pts: 20 });
          if (descLenOk) score += 20;

          checks.push({ label: "Focus keyword in SEO Title", passed: kwInTitle, pts: 20 });
          if (kwInTitle) score += 20;

          checks.push({ label: "Focus keyword in Meta Description", passed: kwInDesc, pts: 15 });
          if (kwInDesc) score += 15;

          checks.push({ label: "Focus keyword in URL slug", passed: kwInUrl, pts: 10 });
          if (kwInUrl) score += 10;

          const hasPowerWord = POWER_WORDS.some(w => title.toLowerCase().includes(w)) || /\d+/.test(title);
          checks.push({ label: "Title includes power word or number", passed: hasPowerWord, pts: 15 });
          if (hasPowerWord) score += 15;

          return { score, checks };
     }, [titlePixelWidth, descPixelWidth, descMaxPx, kwInTitle, kwInDesc, kwInUrl, title]);

     const displayTitle = titlePixelWidth > TITLE_MAX_PX
          ? title.substring(0, Math.floor(TITLE_MAX_PX / 8.5) - 3) + "..."
          : title;

     const displayDesc = descPixelWidth > descMaxPx
          ? description.substring(0, Math.floor(descMaxPx / 6.5) - 3) + "..."
          : description;

     const domain = useMemo(() => {
          try { return new URL(url).hostname; } catch { return "example.com"; }
     }, [url]);

     const metaTags = useMemo(() => {
          return `<title>${title}</title>\n<meta name="description" content="${description}">\n\n<!-- Open Graph / Facebook -->\n<meta property="og:type" content="website">\n<meta property="og:url" content="${url}">\n<meta property="og:title" content="${title}">\n<meta property="og:description" content="${description}">\n<meta property="og:image" content="${imageUrl}">\n\n<!-- Twitter -->\n<meta property="twitter:card" content="summary_large_image">\n<meta property="twitter:url" content="${url}">\n<meta property="twitter:title" content="${title}">\n<meta property="twitter:description" content="${description}">\n<meta property="twitter:image" content="${imageUrl}">`;
     }, [title, description, url, imageUrl]);

     const copyTags = () => {
          navigator.clipboard.writeText(metaTags);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
     };

     return (
          <div className="w-full flex flex-col gap-6">

               {/* Header Section */}
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                              <Search size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">SERP Preview & Meta Tag Optimizer</h2>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Simulate search engine results, audit target keywords, test rich snippet features, and boost organic CTR.</p>
                         </div>
                    </div>
               </div>

               <AdSlot adSlot="top-serp-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* LEFT COLUMN: Input Form & SEO Health Audit (Span 5) */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col gap-5 transition-colors">

                              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-300 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800/80 pb-3">
                                   <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400" /> Page Metadata Settings
                              </h3>

                              <div className="space-y-1.5">
                                   <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                        <Tag size={12} className="text-amber-600 dark:text-amber-400" /> Focus Target Keyword
                                   </label>
                                   <input
                                        type="text"
                                        value={focusKeyword}
                                        onChange={(e) => setFocusKeyword(e.target.value)}
                                        placeholder="e.g. SERP Preview"
                                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-xs text-amber-700 dark:text-amber-300 font-bold outline-none focus:border-amber-500/50 transition-colors"
                                   />
                              </div>

                              <div className="space-y-1.5">
                                   <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                        <Globe size={12} /> Target URL
                                   </label>
                                   <input
                                        type="text"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="https://yoursite.com/page"
                                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-gray-200 outline-none focus:border-indigo-500/50 transition-colors"
                                   />
                              </div>

                              <div className="space-y-1.5">
                                   <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                             SEO Title
                                        </label>
                                        <span className={`text-[10px] font-mono font-bold ${titleStatus === 'danger' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                             ~{titlePixelWidth} / {TITLE_MAX_PX} px
                                        </span>
                                   </div>
                                   <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className={`w-full bg-gray-50 dark:bg-gray-950 border rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-gray-200 outline-none transition-colors ${titleStatus === 'danger' ? 'border-rose-300 dark:border-rose-500/50 focus:border-rose-500' : 'border-gray-200 dark:border-gray-800 focus:border-indigo-500/50'}`}
                                   />
                                   <div className="w-full h-1 bg-gray-200 dark:bg-gray-950 rounded-full mt-1 overflow-hidden flex">
                                        <div
                                             className={`h-full transition-all ${titleStatus === 'danger' ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                             style={{ width: `${Math.min((titlePixelWidth / TITLE_MAX_PX) * 100, 100)}%` }}
                                        />
                                   </div>
                              </div>

                              <div className="space-y-1.5">
                                   <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                             Meta Description
                                        </label>
                                        <span className={`text-[10px] font-mono font-bold ${descStatus === 'danger' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                             ~{descPixelWidth} / {descMaxPx} px
                                        </span>
                                   </div>
                                   <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        className={`w-full bg-gray-50 dark:bg-gray-950 border rounded-xl p-3 text-xs text-gray-900 dark:text-gray-200 outline-none resize-none transition-colors ${descStatus === 'danger' ? 'border-rose-300 dark:border-rose-500/50 focus:border-rose-500' : 'border-gray-200 dark:border-gray-800 focus:border-indigo-500/50'}`}
                                   />
                                   <div className="w-full h-1 bg-gray-200 dark:bg-gray-950 rounded-full mt-1 overflow-hidden flex">
                                        <div
                                             className={`h-full transition-all ${descStatus === 'danger' ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                             style={{ width: `${Math.min((descPixelWidth / descMaxPx) * 100, 100)}%` }}
                                        />
                                   </div>
                              </div>

                              <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800/80">
                                   <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                        <ImageIcon size={12} /> Open Graph Image URL
                                   </label>
                                   <input
                                        type="text"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-gray-200 outline-none focus:border-indigo-500/50 font-mono transition-colors"
                                   />
                              </div>

                              <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800/80">
                                   <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                        <Star size={12} className="text-amber-600 dark:text-amber-400" /> Rich Snippet Simulator
                                   </label>
                                   <div className="grid grid-cols-2 gap-3 text-xs text-gray-700 dark:text-gray-300">
                                        <label className="flex items-center gap-2 cursor-pointer bg-gray-50 dark:bg-gray-950 p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors">
                                             <input type="checkbox" checked={showRating} onChange={(e) => setShowRating(e.target.checked)} className="rounded text-indigo-500 focus:ring-0 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700" />
                                             <span>Star Rating</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer bg-gray-50 dark:bg-gray-950 p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors">
                                             <input type="checkbox" checked={showDate} onChange={(e) => setShowDate(e.target.checked)} className="rounded text-indigo-500 focus:ring-0 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700" />
                                             <span>Publish Date</span>
                                        </label>
                                   </div>
                                   {showRating && (
                                        <div className="grid grid-cols-2 gap-3 pt-1">
                                             <div>
                                                  <label className="text-[9px] font-bold text-gray-500 dark:text-gray-500 uppercase block mb-1">Rating (1-5)</label>
                                                  <input type="text" value={ratingVal} onChange={(e) => setRatingVal(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg px-2.5 py-1 text-xs text-gray-900 dark:text-gray-200 outline-none transition-colors" />
                                             </div>
                                             <div>
                                                  <label className="text-[9px] font-bold text-gray-500 dark:text-gray-500 uppercase block mb-1">Reviews Count</label>
                                                  <input type="text" value={reviewCount} onChange={(e) => setReviewCount(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg px-2.5 py-1 text-xs text-gray-900 dark:text-gray-200 outline-none transition-colors" />
                                             </div>
                                        </div>
                                   )}
                              </div>

                         </div>
                    </div>

                    {/* RIGHT COLUMN: Previews & SEO Health Score Card (Span 7) */}
                    <div className="lg:col-span-7 flex flex-col gap-6">

                         {/* Real-time SEO Health Score Audit Card */}
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col gap-4 transition-colors">
                              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/80 pb-3">
                                   <div className="flex items-center gap-2">
                                        <Gauge size={18} className="text-indigo-600 dark:text-indigo-400" />
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-200">SEO Health & CTR Optimization Score</h4>
                                   </div>
                                   <div className="flex items-baseline gap-1 bg-gray-50 dark:bg-gray-950 px-3 py-1 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors">
                                        <span className={`text-xl font-black ${seoScoreData.score >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                                             seoScoreData.score >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                                             }`}>
                                             {seoScoreData.score}
                                        </span>
                                        <span className="text-[10px] text-gray-500 font-bold">/ 100</span>
                                   </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                   {seoScoreData.checks.map((chk, index) => (
                                        <div key={index} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800/80 text-xs transition-colors">
                                             <span className="text-gray-700 dark:text-gray-300 font-medium truncate pr-2">{chk.label}</span>
                                             {chk.passed ? (
                                                  <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                             ) : (
                                                  <XCircle size={16} className="text-gray-400 dark:text-gray-600 flex-shrink-0" />
                                             )}
                                        </div>
                                   ))}
                              </div>
                         </div>

                         {/* Interactive Preview Workspace */}
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col gap-4 min-h-[480px] transition-colors">

                              {/* Workspace Controls Header */}
                              <div className="flex flex-wrap items-center justify-between border-b border-gray-100 dark:border-gray-800/80 pb-3 gap-2">
                                   <div className="flex items-center gap-2">
                                        <button onClick={() => setActiveTab("google")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${activeTab === "google" ? "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 shadow-sm dark:shadow-none" : "bg-gray-50 dark:bg-gray-950 text-gray-600 dark:text-gray-500 border border-gray-200 dark:border-gray-800 hover:text-gray-900 dark:hover:text-gray-300"}`}>
                                             <Search size={14} /> Google SERP
                                        </button>
                                        <button onClick={() => setActiveTab("social")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${activeTab === "social" ? "bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30 shadow-sm dark:shadow-none" : "bg-gray-50 dark:bg-gray-950 text-gray-600 dark:text-gray-500 border border-gray-200 dark:border-gray-800 hover:text-gray-900 dark:hover:text-gray-300"}`}>
                                             <Share2 size={14} /> Social Cards
                                        </button>
                                        <button onClick={() => setActiveTab("code")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${activeTab === "code" ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 shadow-sm dark:shadow-none" : "bg-gray-50 dark:bg-gray-950 text-gray-600 dark:text-gray-500 border border-gray-200 dark:border-gray-800 hover:text-gray-900 dark:hover:text-gray-300"}`}>
                                             <Code size={14} /> HTML Tags
                                        </button>
                                   </div>

                                   {/* Sub-toggles */}
                                   {activeTab === "google" && (
                                        <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-950 p-1 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors">
                                             <button onClick={() => setDeviceMode("desktop")} className={`p-1.5 rounded-lg transition-all ${deviceMode === "desktop" ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm dark:shadow-none" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`} title="Desktop Preview">
                                                  <Monitor size={14} />
                                             </button>
                                             <button onClick={() => setDeviceMode("mobile")} className={`p-1.5 rounded-lg transition-all ${deviceMode === "mobile" ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm dark:shadow-none" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`} title="Mobile Preview">
                                                  <Smartphone size={14} />
                                             </button>
                                        </div>
                                   )}

                                   {activeTab === "social" && (
                                        <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-950 p-1 rounded-xl border border-gray-200 dark:border-gray-800 text-[10px] font-bold transition-colors">
                                             <button onClick={() => setSocialPlatform("twitter")} className={`px-2 py-1 rounded-lg transition-all ${socialPlatform === "twitter" ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm dark:shadow-none" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}>X / Twitter</button>
                                             <button onClick={() => setSocialPlatform("facebook")} className={`px-2 py-1 rounded-lg transition-all ${socialPlatform === "facebook" ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm dark:shadow-none" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}>Facebook</button>
                                             <button onClick={() => setSocialPlatform("discord")} className={`px-2 py-1 rounded-lg transition-all ${socialPlatform === "discord" ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm dark:shadow-none" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}>Discord</button>
                                        </div>
                                   )}
                              </div>

                              {/* PREVIEW DISPLAY CONTAINER */}
                              <div className="flex-grow flex items-center justify-center bg-gray-100 dark:bg-[#0f1115] rounded-xl border border-gray-200 dark:border-gray-800/80 p-6 overflow-hidden min-h-[340px] transition-colors">

                                   {/* 1. GOOGLE SERP PREVIEW */}
                                   {activeTab === "google" && (
                                        <div className={`transition-all bg-white rounded-lg p-5 font-sans ${deviceMode === "desktop" ? "w-[600px] shadow-sm border border-gray-100" : "w-[375px] shadow-lg border border-gray-200"}`}>
                                             {/* Google Breadcrumb */}
                                             <div className="flex items-center gap-2.5 mb-1">
                                                  <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 border border-gray-200 text-gray-700 font-bold text-xs">
                                                       {domain.charAt(0).toUpperCase()}
                                                  </div>
                                                  <div className="flex flex-col overflow-hidden">
                                                       <span className="text-[14px] text-[#202124] font-normal leading-tight truncate">{domain}</span>
                                                       <span className="text-[12px] text-[#4d5156] leading-tight truncate">{url}</span>
                                                  </div>
                                             </div>

                                             {/* Title */}
                                             <div className="mt-1.5 group cursor-pointer">
                                                  <h3 className="text-[20px] text-[#1a0dab] group-hover:underline leading-[1.3] font-normal break-words">
                                                       {displayTitle || "Enter an SEO Title"}
                                                  </h3>
                                             </div>

                                             {/* Rich Snippets (Rating Stars) */}
                                             {showRating && (
                                                  <div className="flex items-center gap-1 text-[12px] text-[#70757a] mt-1 font-sans">
                                                       <span className="text-[#f1c40f] font-bold">Rating: {ratingVal}</span>
                                                       <div className="flex text-[#f1c40f] text-[10px]">★★★★★</div>
                                                       <span>- {reviewCount} reviews</span>
                                                  </div>
                                             )}

                                             {/* Description with Date Prefix */}
                                             <div className="mt-1">
                                                  <p className="text-[14px] text-[#4d5156] leading-[1.58] break-words">
                                                       {showDate && <span className="text-[#70757a] mr-1">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} —</span>}
                                                       {displayDesc || "Enter a meta description to see how it will appear in search results."}
                                                  </p>
                                             </div>
                                        </div>
                                   )}

                                   {/* 2. MULTI-PLATFORM SOCIAL PREVIEWS (Hardcoded colors for exact platform simulation) */}
                                   {activeTab === "social" && (
                                        <div className="w-[480px]">
                                             {/* Twitter / X Large Summary Card */}
                                             {socialPlatform === "twitter" && (
                                                  <div className="bg-black border border-gray-800 rounded-2xl overflow-hidden font-sans text-white">
                                                       <div className="w-full h-[240px] bg-gray-900 relative border-b border-gray-800">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img src={imageUrl} alt="OG Card" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop')} />
                                                       </div>
                                                       <div className="p-3.5 bg-black flex flex-col gap-0.5">
                                                            <span className="text-[12px] text-gray-500">{domain}</span>
                                                            <h4 className="text-[15px] font-bold text-gray-100 truncate">{title || "Title goes here"}</h4>
                                                            <p className="text-[13px] text-gray-400 line-clamp-2 leading-snug">{description || "Description goes here"}</p>
                                                       </div>
                                                  </div>
                                             )}

                                             {/* Facebook Link Preview Card */}
                                             {socialPlatform === "facebook" && (
                                                  <div className="bg-[#f0f2f5] border border-gray-300 rounded-none overflow-hidden font-sans text-gray-900 shadow-sm">
                                                       <div className="w-full h-[240px] bg-gray-200 relative border-b border-gray-200">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img src={imageUrl} alt="OG Card" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop')} />
                                                       </div>
                                                       <div className="p-3 bg-[#f0f2f5] flex flex-col gap-0.5">
                                                            <span className="text-[11px] uppercase font-semibold text-gray-500 tracking-wider">{domain}</span>
                                                            <h4 className="text-[16px] font-bold text-gray-900 leading-tight line-clamp-1">{title || "Title goes here"}</h4>
                                                            <p className="text-[13px] text-gray-600 line-clamp-2 leading-snug">{description || "Description goes here"}</p>
                                                       </div>
                                                  </div>
                                             )}

                                             {/* Discord Dark Theme Embed Card */}
                                             {socialPlatform === "discord" && (
                                                  <div className="bg-[#2b2d31] border-l-4 border-indigo-500 rounded-r-lg p-4 font-sans text-gray-200 space-y-2">
                                                       <span className="text-[12px] font-bold text-gray-400 block">{domain}</span>
                                                       <h4 className="text-[15px] font-bold text-indigo-400 hover:underline cursor-pointer">{title || "Title goes here"}</h4>
                                                       <p className="text-[13px] text-gray-300 leading-snug">{description || "Description goes here"}</p>
                                                       <div className="w-full h-[180px] rounded-lg overflow-hidden mt-2">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img src={imageUrl} alt="OG Card" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop')} />
                                                       </div>
                                                  </div>
                                             )}
                                        </div>
                                   )}

                                   {/* 3. HTML CODE EXPORT */}
                                   {activeTab === "code" && (
                                        <div className="w-full h-full flex flex-col">
                                             <div className="flex items-center justify-between mb-2">
                                                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1.5"><Terminal size={12} /> Production Meta Tags</span>
                                                  <button
                                                       onClick={copyTags}
                                                       className="flex items-center gap-1.5 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors shadow-sm dark:shadow-none"
                                                  >
                                                       {isCopied ? <Check size={12} /> : <Copy size={12} />}
                                                       {isCopied ? "Copied Tags" : "Copy Head Tags"}
                                                  </button>
                                             </div>
                                             <pre className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-xs font-mono text-cyan-700 dark:text-cyan-300/90 whitespace-pre-wrap overflow-y-auto flex-grow h-full shadow-inner transition-colors">
                                                  {metaTags}
                                             </pre>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* ========================================= */}
               {/* SEO CONTENT & FAQS */}
               {/* ========================================= */}
               <div className="mt-12 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm dark:shadow-none">
                    <div className="prose dark:prose-invert max-w-none">
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Free SERP Preview Tool & Social Media Meta Tag Simulator</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              Test exactly how your website will appear in Google Search Results and across major social networks before hitting publish. ToolLok's <strong>SERP Preview Optimizer</strong> helps you craft the perfect meta titles and descriptions to avoid truncation, maximize keyword visibility, and dramatically improve your Organic Click-Through Rate (CTR). Combine this with our <Link href="/categories/seo-tools" className="text-indigo-600 dark:text-indigo-400 hover:underline">SEO Tools</Link> to dominate the search landscape.
                         </p>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Optimize Like a Pro</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Pixel-Perfect Truncation Checker:</strong> Google limits title lengths based on pixel width, not character count. Our tool measures exact pixel limits (580px for desktop) to ensure your headlines are never cut off.</li>
                              <li><strong>Multi-Platform Social Previews:</strong> Instantly simulate how your Open Graph (OG) image and metadata will render as a large summary card on X (Twitter), Facebook, and Discord.</li>
                              <li><strong>Live SEO Health Scoring:</strong> Get real-time feedback on your target keyword placement and the presence of high-converting "power words" in your title.</li>
                         </ul>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">What is a SERP preview?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">A SERP (Search Engine Results Page) preview is a simulation that demonstrates exactly how your web page's Title Tag, URL, and Meta Description will look when Google displays it to a user. It helps you optimize your copy to maximize clicks.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Why is my meta description truncated?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Google limits meta descriptions based on pixel width (roughly 920px on desktop and 680px on mobile). If your description is too long, Google will cut it off with an ellipsis (...). Keeping your descriptions concise and front-loading the value prevents this.</p>
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
                                             "name": "What is a SERP preview?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "A SERP preview is a simulation that demonstrates exactly how your web page's Title Tag, URL, and Meta Description will look when Google displays it to a user." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "Why is my meta description truncated?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Google limits meta descriptions based on pixel width. If your description exceeds these limits, Google will cut it off with an ellipsis." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-serp-ad" format="fluid" className="mt-4" />
          </div>
     );
}