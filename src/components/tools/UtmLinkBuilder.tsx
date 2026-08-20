"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Link as LinkIcon, Copy, CheckCircle2, History, Trash2, Globe, ArrowRight } from "lucide-react";
import AdSlot from "@/components/ui/AdSlot";

interface UtmHistory {
     id: string;
     url: string;
     campaign: string;
     timestamp: string;
}

export default function UtmLinkBuilder() {
     const [baseUrl, setBaseUrl] = useState<string>("https://youtube.com/@CodeMines");
     const [source, setSource] = useState<string>("youtube");
     const [medium, setMedium] = useState<string>("social");
     const [campaign, setCampaign] = useState<string>("channel_promo");
     const [term, setTerm] = useState<string>("");
     const [content, setContent] = useState<string>("video_description");

     const [generatedUrl, setGeneratedUrl] = useState<string>("");
     const [isCopied, setIsCopied] = useState<boolean>(false);
     const [history, setHistory] = useState<UtmHistory[]>([]);

     useEffect(() => {
          try {
               if (!baseUrl) {
                    setGeneratedUrl("");
                    return;
               }

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
               setGeneratedUrl("Invalid Base URL format...");
          }
     }, [baseUrl, source, medium, campaign, term, content]);

     const handleCopy = async (textToCopy: string) => {
          if (!textToCopy || textToCopy.includes("Invalid")) return;

          try {
               await navigator.clipboard.writeText(textToCopy);
               setIsCopied(true);
               setTimeout(() => setIsCopied(false), 2000);

               if (history.length === 0 || history[0].url !== textToCopy) {
                    const newHistoryItem: UtmHistory = {
                         id: Math.random().toString(),
                         url: textToCopy,
                         campaign: campaign || "unnamed_campaign",
                         timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                    setHistory([newHistoryItem, ...history].slice(0, 10));
               }
          } catch (err) {
               console.error("Failed to copy text", err);
          }
     };

     const clearHistory = () => setHistory([]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
               <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                         <LinkIcon size={24} />
                    </div>
                    <div>
                         <div className="flex items-center gap-3">
                              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">UTM Campaign Link Builder</h2>
                              <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                   🟢 100% Free
                              </span>
                         </div>
                         <p className="text-sm text-gray-600 dark:text-gray-400">Generate, format, and track marketing URLs effortlessly.</p>
                    </div>
               </div>

               <AdSlot adSlot="top-utm-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col gap-5 sticky top-24 transition-colors">
                         <h3 className="text-gray-900 dark:text-white font-bold text-lg border-b border-gray-100 dark:border-gray-800/60 pb-3 flex items-center gap-2">
                              <Globe size={18} className="text-indigo-600 dark:text-indigo-400" /> Campaign Parameters
                         </h3>

                         <div className="space-y-4">
                              <div>
                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1.5 flex items-center gap-1">
                                        Base URL <span className="text-rose-500">*</span>
                                   </label>
                                   <input
                                        type="text"
                                        value={baseUrl}
                                        onChange={(e) => setBaseUrl(e.target.value)}
                                        placeholder="https://example.com"
                                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                                   />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                   <div>
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1.5 flex items-center gap-1">
                                             Source <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                             type="text"
                                             value={source}
                                             onChange={(e) => setSource(e.target.value)}
                                             placeholder="e.g. google, newsletter"
                                             className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                                        />
                                   </div>
                                   <div>
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1.5 flex items-center gap-1">
                                             Medium <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                             type="text"
                                             value={medium}
                                             onChange={(e) => setMedium(e.target.value)}
                                             placeholder="e.g. cpc, email"
                                             className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                                        />
                                   </div>
                              </div>

                              <div>
                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1.5">
                                        Campaign Name
                                   </label>
                                   <input
                                        type="text"
                                        value={campaign}
                                        onChange={(e) => setCampaign(e.target.value)}
                                        placeholder="e.g. spring_sale_2026"
                                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                                   />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   <div>
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1.5">
                                             Term (Keywords)
                                        </label>
                                        <input
                                             type="text"
                                             value={term}
                                             onChange={(e) => setTerm(e.target.value)}
                                             placeholder="e.g. running shoes"
                                             className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                                        />
                                   </div>
                                   <div>
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1.5">
                                             Content (A/B Test)
                                        </label>
                                        <input
                                             type="text"
                                             value={content}
                                             onChange={(e) => setContent(e.target.value)}
                                             placeholder="e.g. blue_banner"
                                             className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                                        />
                                   </div>
                              </div>
                         </div>
                    </div>

                    <div className="lg:col-span-7 flex flex-col gap-6">
                         <div className="bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors">
                              <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-100 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                              <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-6 flex items-center gap-2">
                                   <ArrowRight size={18} className="text-indigo-600 dark:text-indigo-400" /> Generated Tracking URL
                              </h3>

                              <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 mb-4 min-h-[100px] flex items-center transition-colors shadow-inner">
                                   <p className="text-sm md:text-base font-mono break-all text-indigo-700 dark:text-indigo-300 leading-relaxed">
                                        {generatedUrl || <span className="text-gray-400 dark:text-gray-600 italic">Enter a Base URL to begin generating...</span>}
                                   </p>
                              </div>

                              <button
                                   onClick={() => handleCopy(generatedUrl)}
                                   disabled={!generatedUrl || generatedUrl.includes("Invalid")}
                                   className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl transition-all shadow-md dark:shadow-lg ${isCopied
                                        ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/50 shadow-none"
                                        : "bg-indigo-600 hover:bg-indigo-500 text-white dark:shadow-indigo-600/20 disabled:opacity-50 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-500 disabled:shadow-none"
                                        }`}
                              >
                                   {isCopied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                                   {isCopied ? "Copied to Clipboard!" : "Copy Tracking URL"}
                              </button>
                         </div>

                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl flex-grow flex flex-col transition-colors">
                              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800/60 bg-gray-50 dark:bg-gray-900 flex items-center justify-between transition-colors">
                                   <h3 className="text-gray-900 dark:text-white font-bold text-sm flex items-center gap-2">
                                        <History size={16} className="text-gray-500 dark:text-gray-400" /> Recent Links
                                   </h3>
                                   {history.length > 0 && (
                                        <button onClick={clearHistory} className="text-xs text-gray-500 hover:text-rose-600 dark:hover:text-rose-400 font-bold uppercase transition-colors">
                                             Clear All
                                        </button>
                                   )}
                              </div>

                              <div className="flex-grow">
                                   {history.length === 0 ? (
                                        <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                                             Links you copy during this session will appear here for easy access.
                                        </div>
                                   ) : (
                                        <ul className="divide-y divide-gray-100 dark:divide-gray-800/60">
                                             {history.map((item) => (
                                                  <li key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors flex items-center justify-between gap-4 group">
                                                       <div className="overflow-hidden">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                 <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded font-bold uppercase tracking-wide transition-colors">
                                                                      {item.timestamp}
                                                                 </span>
                                                                 <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">
                                                                      {item.campaign}
                                                                 </span>
                                                            </div>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400 font-mono truncate max-w-sm md:max-w-md">
                                                                 {item.url}
                                                            </p>
                                                       </div>
                                                       <button
                                                            onClick={() => handleCopy(item.url)}
                                                            className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-100 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400 shrink-0"
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

               {/* ========================================= */}
               {/* SEO CONTENT & FAQS */}
               {/* ========================================= */}
               <div className="mt-12 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm dark:shadow-none">
                    <div className="prose dark:prose-invert max-w-none">
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">UTM Campaign Builder & Tracking Link Generator</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              Without proper tracking, your marketing spend is a guessing game. ToolLok's <strong>UTM Campaign Builder</strong> allows marketers to instantly generate standardized, error-free URL parameters that plug directly into Google Analytics 4 (GA4) and other analytics platforms. Track exactly which ads, emails, and social media posts are driving the highest ROI. Use this tracking link generator alongside our <Link href="/categories/marketing-tools" className="text-indigo-600 dark:text-indigo-400 hover:underline">Marketing Tools</Link> to attribute your traffic with precision.
                         </p>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Master Your Attribution Data</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Standardized Formatting:</strong> Ensure your UTM tags are automatically formatted correctly (removing illegal spaces and appending queries properly) to prevent analytics fragmentation.</li>
                              <li><strong>History Ledger:</strong> Maintain a local history of your recently generated URLs so you can easily reference or copy past campaign links without recreating them.</li>
                              <li><strong>A/B Testing Support:</strong> Utilize the `utm_content` field to differentiate between two identical ads (e.g., a red banner vs a blue banner) to determine which creative drives a higher conversion rate.</li>
                         </ul>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">What does UTM stand for?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">UTM stands for Urchin Tracking Module. It is a system of tracking parameters added to the end of a URL that allows Google Analytics to identify the specific source, medium, and campaign associated with an incoming click.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Are utm_term and utm_content required?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">No. Only `utm_source`, `utm_medium`, and `utm_campaign` are strictly necessary for good tracking. However, `utm_term` is highly recommended for paid search campaigns (to track specific keywords), and `utm_content` is crucial for A/B testing different creatives.</p>
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
                                             "name": "What does UTM stand for?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "UTM stands for Urchin Tracking Module. It is a set of tracking parameters added to URLs to identify traffic sources in Google Analytics." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "Are utm_term and utm_content required?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "No, only source, medium, and campaign are required. However, term and content are highly recommended for paid search and A/B testing." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-utm-ad" format="fluid" className="mt-4" />
          </div>
     );
}