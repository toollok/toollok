"use client";

import { useState, useMemo } from "react";
import { Code, Copy, Check, Globe, ShieldCheck, Layout, Eye, Share2 } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import AdSlot from "@/components/ui/AdSlot";

export default function MetaTagsGenerator() {
     const [title, setTitle] = useState<string>("ToolLok - Free Professional Utilities & Developer Tools");
     const [description, setDescription] = useState<string>("Access 100% free financial calculators, developer utilities, and marketing tools built for modern professionals.");
     const [url, setUrl] = useState<string>("https://toollok.com");
     const [image, setImage] = useState<string>("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80");
     const [twitterHandle, setTwitterHandle] = useState<string>("@toollok");

     const [previewTab, setPreviewTab] = useState<"google" | "facebook" | "twitter" | "code">("google");

     const { isCopied, copy } = useCopyToClipboard(2000);

     // Generated HTML Code
     const generatedHtmlCode = useMemo(() => {
          return `<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title" content="${title}">
<meta name="description" content="${description}">
<link rel="canonical" href="${url}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${image}">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${url}">
<meta property="twitter:title" content="${title}">
<meta property="twitter:description" content="${description}">
<meta property="twitter:image" content="${image}">
<meta name="twitter:creator" content="${twitterHandle}">`;
     }, [title, description, url, image, twitterHandle]);

     // Shortcut: Cmd/Ctrl + C to copy generated code
     useKeyboardShortcuts([
          { key: "c", ctrlOrCmd: true, action: () => copy(generatedHtmlCode) }
     ]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">

               {/* Header Section */}
               <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                              <Code size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-white">Meta Tags & Open Graph Generator</h2>
                                   <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-400">Generate optimized SEO meta tags and social sharing cards with real-time visual previews.</p>
                         </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-xl text-xs text-emerald-400">
                         <ShieldCheck size={16} />
                         <span>SEO Optimizer</span>
                    </div>
               </div>

               {/* Top Ad Banner */}
               <AdSlot adSlot="top-metatags-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Input Form */}
                    <div className="lg:col-span-6 bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col gap-5">
                         <h3 className="text-white font-bold text-base border-b border-gray-800/60 pb-3 flex items-center gap-2">
                              <Globe size={16} className="text-cyan-400" /> Page Details & Metadata
                         </h3>

                         <div>
                              <div className="flex justify-between items-center mb-1.5">
                                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Meta Title</label>
                                   <span className={`text-[10px] font-mono ${title.length > 60 ? 'text-amber-400' : 'text-gray-500'}`}>{title.length}/60 chars</span>
                              </div>
                              <input
                                   type="text"
                                   value={title}
                                   onChange={(e) => setTitle(e.target.value)}
                                   className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-cyan-500"
                              />
                         </div>

                         <div>
                              <div className="flex justify-between items-center mb-1.5">
                                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Meta Description</label>
                                   <span className={`text-[10px] font-mono ${description.length > 160 ? 'text-amber-400' : 'text-gray-500'}`}>{description.length}/160 chars</span>
                              </div>
                              <textarea
                                   value={description}
                                   onChange={(e) => setDescription(e.target.value)}
                                   rows={3}
                                   className="w-full bg-gray-950 border border-gray-700 rounded-xl p-3 text-xs text-white font-mono outline-none resize-none focus:border-cyan-500"
                              />
                         </div>

                         <div>
                              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Canonical URL</label>
                              <input
                                   type="text"
                                   value={url}
                                   onChange={(e) => setUrl(e.target.value)}
                                   className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-xs text-white font-mono outline-none focus:border-cyan-500"
                              />
                         </div>

                         <div>
                              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Social Share Image URL (OG Image)</label>
                              <input
                                   type="text"
                                   value={image}
                                   onChange={(e) => setImage(e.target.value)}
                                   className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-xs text-white font-mono outline-none focus:border-cyan-500"
                              />
                         </div>

                         <div>
                              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Twitter Username Handle</label>
                              <input
                                   type="text"
                                   value={twitterHandle}
                                   onChange={(e) => setTwitterHandle(e.target.value)}
                                   className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-xs text-white font-mono outline-none focus:border-cyan-500"
                              />
                         </div>
                    </div>

                    {/* Right Column: Previews & Code Exporter */}
                    <div className="lg:col-span-6 flex flex-col gap-6">

                         <div className="bg-[#0c121e] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col gap-6">
                              <div className="flex items-center justify-between border-b border-gray-800/60 pb-3 flex-wrap gap-3">
                                   <div className="flex items-center gap-1.5">
                                        <button
                                             onClick={() => setPreviewTab("google")}
                                             className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${previewTab === "google" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-gray-400 hover:text-white"}`}
                                        >
                                             Google Preview
                                        </button>
                                        <button
                                             onClick={() => setPreviewTab("facebook")}
                                             className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${previewTab === "facebook" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-gray-400 hover:text-white"}`}
                                        >
                                             Facebook / LinkedIn
                                        </button>
                                        <button
                                             onClick={() => setPreviewTab("code")}
                                             className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${previewTab === "code" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-gray-400 hover:text-white"}`}
                                        >
                                             HTML Code
                                        </button>
                                   </div>

                                   {previewTab === "code" && (
                                        <button
                                             onClick={() => copy(generatedHtmlCode)}
                                             className="flex items-center gap-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-1.5 rounded-xl transition-all font-bold shadow-lg shadow-cyan-600/20"
                                        >
                                             {isCopied ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                                             {isCopied ? "Copied HTML!" : "Copy Code"}
                                        </button>
                                   )}
                              </div>

                              {/* Google Search Preview */}
                              {previewTab === "google" && (
                                   <div className="bg-white text-black p-4 rounded-2xl shadow-md flex flex-col gap-1 font-sans">
                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                             <Globe size={14} />
                                             <span className="truncate">{url}</span>
                                        </div>
                                        <h4 className="text-blue-800 font-medium text-base hover:underline cursor-pointer truncate">{title}</h4>
                                        <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">{description}</p>
                                   </div>
                              )}

                              {/* Facebook / LinkedIn OG Card Preview */}
                              {previewTab === "facebook" && (
                                   <div className="bg-[#242526] border border-gray-700 rounded-2xl overflow-hidden shadow-lg flex flex-col">
                                        <div className="w-full h-40 bg-gray-800 relative overflow-hidden">
                                             <img src={image} alt="OG Preview" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="p-4 bg-[#18191a] flex flex-col gap-1">
                                             <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">{new URL(url || "https://example.com").hostname}</span>
                                             <h4 className="text-white font-bold text-sm truncate">{title}</h4>
                                             <p className="text-xs text-gray-400 line-clamp-1">{description}</p>
                                        </div>
                                   </div>
                              )}

                              {/* HTML Code View */}
                              {previewTab === "code" && (
                                   <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4 font-mono text-xs text-cyan-300 overflow-y-auto max-h-[300px] whitespace-pre-wrap leading-relaxed">
                                        {generatedHtmlCode}
                                   </div>
                              )}
                         </div>

                    </div>
               </div>

               {/* Bottom In-Feed Ad Banner */}
               <AdSlot adSlot="bottom-metatags-ad" format="fluid" className="mt-4" />

          </div>
     );
}