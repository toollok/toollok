"use client";

import { useState, useEffect } from "react";
import { Link as LinkIcon, Copy, CheckCircle2, History, Trash2, Globe, ArrowRight } from "lucide-react";

interface UtmHistory {
     id: string;
     url: string;
     campaign: string;
     timestamp: string;
}

export default function UtmLinkBuilder() {
     // State for form inputs
     const [baseUrl, setBaseUrl] = useState<string>("https://youtube.com/@CodeMines");
     const [source, setSource] = useState<string>("youtube");
     const [medium, setMedium] = useState<string>("social");
     const [campaign, setCampaign] = useState<string>("channel_promo");
     const [term, setTerm] = useState<string>("");
     const [content, setContent] = useState<string>("video_description");

     // Output and history state
     const [generatedUrl, setGeneratedUrl] = useState<string>("");
     const [isCopied, setIsCopied] = useState<boolean>(false);
     const [history, setHistory] = useState<UtmHistory[]>([]);

     // Real-time URL compilation
     useEffect(() => {
          try {
               if (!baseUrl) {
                    setGeneratedUrl("");
                    return;
               }

               // Ensure the base URL has a protocol to prevent URL constructor errors
               const validBase = baseUrl.startsWith("http://") || baseUrl.startsWith("https://")
                    ? baseUrl
                    : `https://${baseUrl}`;

               const urlObj = new URL(validBase);

               if (source) urlObj.searchParams.set("utm_source", source);
               if (medium) urlObj.searchParams.set("utm_medium", medium);
               if (campaign) urlObj.searchParams.set("utm_campaign", campaign);
               if (term) urlObj.searchParams.set("utm_term", term);
               if (content) urlObj.searchParams.set("utm_content", content);

               setGeneratedUrl(urlObj.toString());
          } catch (e) {
               // Fallback for incomplete typing
               setGeneratedUrl("Invalid Base URL format...");
          }
     }, [baseUrl, source, medium, campaign, term, content]);

     const handleCopy = async (textToCopy: string) => {
          if (!textToCopy || textToCopy.includes("Invalid")) return;

          try {
               await navigator.clipboard.writeText(textToCopy);
               setIsCopied(true);
               setTimeout(() => setIsCopied(false), 2000);

               // Save to history if not already the latest
               if (history.length === 0 || history[0].url !== textToCopy) {
                    const newHistoryItem: UtmHistory = {
                         id: Math.random().toString(),
                         url: textToCopy,
                         campaign: campaign || "unnamed_campaign",
                         timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                    setHistory([newHistoryItem, ...history].slice(0, 10)); // Keep last 10
               }
          } catch (err) {
               console.error("Failed to copy text", err);
          }
     };

     const clearHistory = () => {
          setHistory([]);
     };

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">

               {/* Header Section */}
               <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                         <LinkIcon size={24} />
                    </div>
                    <div>
                         <h2 className="text-2xl font-bold text-white">UTM Campaign Link Builder</h2>
                         <p className="text-sm text-gray-400">Generate, format, and track marketing URLs effortlessly.</p>
                    </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Form Builder */}
                    <div className="lg:col-span-5 bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl flex flex-col gap-5 sticky top-24">
                         <h3 className="text-white font-bold text-lg border-b border-gray-800/60 pb-3 flex items-center gap-2">
                              <Globe size={18} className="text-indigo-400" /> Campaign Parameters
                         </h3>

                         <div className="space-y-4">
                              <div>
                                   <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5 flex items-center gap-1">
                                        Base URL <span className="text-rose-400">*</span>
                                   </label>
                                   <input
                                        type="text"
                                        value={baseUrl}
                                        onChange={(e) => setBaseUrl(e.target.value)}
                                        placeholder="https://example.com"
                                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                                   />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                   <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5 flex items-center gap-1">
                                             Source <span className="text-rose-400">*</span>
                                        </label>
                                        <input
                                             type="text"
                                             value={source}
                                             onChange={(e) => setSource(e.target.value)}
                                             placeholder="e.g. google, newsletter"
                                             className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                                        />
                                   </div>
                                   <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5 flex items-center gap-1">
                                             Medium <span className="text-rose-400">*</span>
                                        </label>
                                        <input
                                             type="text"
                                             value={medium}
                                             onChange={(e) => setMedium(e.target.value)}
                                             placeholder="e.g. cpc, email"
                                             className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                                        />
                                   </div>
                              </div>

                              <div>
                                   <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5">
                                        Campaign Name
                                   </label>
                                   <input
                                        type="text"
                                        value={campaign}
                                        onChange={(e) => setCampaign(e.target.value)}
                                        placeholder="e.g. summer_sale_2026"
                                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                                   />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                   <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5">
                                             Term (Keywords)
                                        </label>
                                        <input
                                             type="text"
                                             value={term}
                                             onChange={(e) => setTerm(e.target.value)}
                                             placeholder="e.g. coding+course"
                                             className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                                        />
                                   </div>
                                   <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5">
                                             Content (A/B Test)
                                        </label>
                                        <input
                                             type="text"
                                             value={content}
                                             onChange={(e) => setContent(e.target.value)}
                                             placeholder="e.g. blue_banner"
                                             className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                                        />
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Right Column: Output & History */}
                    <div className="lg:col-span-7 flex flex-col gap-6">

                         {/* Generated URL Card */}
                         <div className="bg-[#0c121e] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                              {/* Geometric Accent */}
                              <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                              <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                                   <ArrowRight size={18} className="text-indigo-400" /> Generated Tracking URL
                              </h3>

                              <div className="bg-gray-950 border border-gray-700 rounded-2xl p-5 mb-4 min-h-[100px] flex items-center">
                                   <p className="text-sm md:text-base font-mono break-all text-gray-300 leading-relaxed">
                                        {generatedUrl || <span className="text-gray-600 italic">Enter a Base URL to begin generating...</span>}
                                   </p>
                              </div>

                              <button
                                   onClick={() => handleCopy(generatedUrl)}
                                   disabled={!generatedUrl || generatedUrl.includes("Invalid")}
                                   className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl transition-all shadow-lg ${isCopied
                                             ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                                             : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 disabled:opacity-50 disabled:bg-gray-800 disabled:text-gray-500 disabled:shadow-none"
                                        }`}
                              >
                                   {isCopied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                                   {isCopied ? "Copied to Clipboard!" : "Copy Tracking URL"}
                              </button>
                         </div>

                         {/* Session History Ledger */}
                         <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-xl flex-grow flex flex-col">
                              <div className="px-6 py-5 border-b border-gray-800/60 bg-gray-900 flex items-center justify-between">
                                   <h3 className="text-white font-bold text-sm flex items-center gap-2">
                                        <History size={16} className="text-gray-400" /> Recent Links
                                   </h3>
                                   {history.length > 0 && (
                                        <button onClick={clearHistory} className="text-xs text-gray-500 hover:text-rose-400 font-bold uppercase transition-colors">
                                             Clear All
                                        </button>
                                   )}
                              </div>

                              <div className="flex-grow">
                                   {history.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500 text-sm">
                                             Links you copy during this session will appear here for easy access.
                                        </div>
                                   ) : (
                                        <ul className="divide-y divide-gray-800/60">
                                             {history.map((item) => (
                                                  <li key={item.id} className="p-4 hover:bg-gray-800/30 transition-colors flex items-center justify-between gap-4 group">
                                                       <div className="overflow-hidden">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                 <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                                                                      {item.timestamp}
                                                                 </span>
                                                                 <span className="text-xs font-bold text-indigo-400 truncate">
                                                                      {item.campaign}
                                                                 </span>
                                                            </div>
                                                            <p className="text-xs text-gray-400 font-mono truncate max-w-sm md:max-w-md">
                                                                 {item.url}
                                                            </p>
                                                       </div>

                                                       <button
                                                            onClick={() => handleCopy(item.url)}
                                                            className="w-8 h-8 rounded-lg bg-gray-800 text-gray-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-500/20 hover:text-indigo-400 shrink-0"
                                                            title="Copy again"
                                                       >
                                                            <Copy size={14} />
                                                       </button>
                                                  </li>
                                             ))}
                                        </ul>
                                   )}
                              </div>
                         </div>

                    </div>
               </div>
          </div>
     );
}