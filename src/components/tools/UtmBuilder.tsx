"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Link2, Copy, Check, ShieldCheck, Tag, Globe } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import AdSlot from "@/components/ui/AdSlot";

export default function UtmBuilder() {
     const [baseUrl, setBaseUrl] = useState<string>("https://example.com/landing-page");
     const [source, setSource] = useState<string>("google");
     const [medium, setMedium] = useState<string>("cpc");
     const [campaign, setCampaign] = useState<string>("summer_sale_2026");
     const [term, setTerm] = useState<string>("");
     const [content, setContent] = useState<string>("");

     const { isCopied, copy } = useCopyToClipboard(2000);

     const applyPreset = (presetSource: string, presetMedium: string, presetCampaign: string) => {
          setSource(presetSource); setMedium(presetMedium); setCampaign(presetCampaign);
     };

     const generatedUrl = useMemo(() => {
          if (!baseUrl.trim()) return "";
          try {
               const cleanBase = baseUrl.trim();
               const urlObj = new URL(cleanBase.startsWith("http") ? cleanBase : `https://${cleanBase}`);
               if (source) urlObj.searchParams.set("utm_source", source.trim());
               if (medium) urlObj.searchParams.set("utm_medium", medium.trim());
               if (campaign) urlObj.searchParams.set("utm_campaign", campaign.trim());
               if (term) urlObj.searchParams.set("utm_term", term.trim());
               if (content) urlObj.searchParams.set("utm_content", content.trim());
               return urlObj.toString();
          } catch {
               let result = baseUrl.trim();
               const params: string[] = [];
               if (source) params.push(`utm_source=${encodeURIComponent(source.trim())}`);
               if (medium) params.push(`utm_medium=${encodeURIComponent(medium.trim())}`);
               if (campaign) params.push(`utm_campaign=${encodeURIComponent(campaign.trim())}`);
               if (term) params.push(`utm_term=${encodeURIComponent(term.trim())}`);
               if (content) params.push(`utm_content=${encodeURIComponent(content.trim())}`);
               if (params.length > 0) result += (result.includes("?") ? "&" : "?") + params.join("&");
               return result;
          }
     }, [baseUrl, source, medium, campaign, term, content]);

     useKeyboardShortcuts([{ key: "c", ctrlOrCmd: true, action: () => generatedUrl && copy(generatedUrl) }]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
               <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                              <Link2 size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">UTM Campaign Builder & URL Generator</h2>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Generate clean, standardized UTM tracking links for Google Analytics and ad campaigns.</p>
                         </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 shadow-sm dark:shadow-none">
                         <ShieldCheck size={16} />
                         <span>Standardized Attribution</span>
                    </div>
               </div>

               <AdSlot adSlot="top-utm-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-xl flex flex-col gap-5 sticky top-24 transition-colors">
                         <h3 className="text-gray-900 dark:text-white font-bold text-base border-b border-gray-100 dark:border-gray-800/60 pb-3 flex items-center gap-2">
                              <Tag size={16} className="text-indigo-600 dark:text-indigo-400" /> Campaign Parameters
                         </h3>
                         <div className="flex flex-wrap gap-2 pb-2">
                              <span className="text-[10px] text-gray-500 font-bold uppercase w-full">Quick Channel Presets:</span>
                              <button onClick={() => applyPreset("google", "cpc", "search_ads")} className="text-xs bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-xl transition-colors">Google Ads</button>
                              <button onClick={() => applyPreset("newsletter", "email", "weekly_digest")} className="text-xs bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-xl transition-colors">Email Newsletter</button>
                              <button onClick={() => applyPreset("twitter", "social", "organic_post")} className="text-xs bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-xl transition-colors">Twitter / X</button>
                              <button onClick={() => applyPreset("linkedin", "social", "sponsored_lead")} className="text-xs bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-xl transition-colors">LinkedIn Ads</button>
                         </div>
                         <div>
                              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">Base URL <span className="text-rose-500">*</span></label>
                              <input type="text" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://example.com/landing" className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white font-mono outline-none focus:border-indigo-500 transition-colors" />
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">Source (<code className="text-indigo-600 dark:text-indigo-400">utm_source</code>) <span className="text-rose-500">*</span></label>
                                   <input type="text" value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. google, newsletter" className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-xs text-gray-900 dark:text-white font-mono outline-none focus:border-indigo-500 transition-colors" />
                              </div>
                              <div>
                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">Medium (<code className="text-indigo-600 dark:text-indigo-400">utm_medium</code>) <span className="text-rose-500">*</span></label>
                                   <input type="text" value={medium} onChange={(e) => setMedium(e.target.value)} placeholder="e.g. cpc, email" className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-xs text-gray-900 dark:text-white font-mono outline-none focus:border-indigo-500 transition-colors" />
                              </div>
                         </div>
                         <div>
                              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">Campaign Name (<code className="text-indigo-600 dark:text-indigo-400">utm_campaign</code>) <span className="text-rose-500">*</span></label>
                              <input type="text" value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="e.g. spring_sale" className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white font-mono outline-none focus:border-indigo-500 transition-colors" />
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">Campaign Term (<code className="text-gray-500">utm_term</code>)</label>
                                   <input type="text" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="e.g. running shoes" className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-xs text-gray-900 dark:text-white font-mono outline-none focus:border-indigo-500 transition-colors" />
                              </div>
                              <div>
                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">Campaign Content (<code className="text-gray-500">utm_content</code>)</label>
                                   <input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder="e.g. blue_banner" className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-xs text-gray-900 dark:text-white font-mono outline-none focus:border-indigo-500 transition-colors" />
                              </div>
                         </div>
                    </div>

                    <div className="lg:col-span-6 flex flex-col gap-6">
                         <div className="bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-xl relative overflow-hidden flex flex-col gap-6 transition-colors">
                              <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-100 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/60 pb-3">
                                   <h3 className="text-gray-900 dark:text-white font-bold text-base flex items-center gap-2">
                                        <Globe size={18} className="text-emerald-600 dark:text-emerald-400" /> Generated Tracking URL
                                   </h3>
                                   <button onClick={() => generatedUrl && copy(generatedUrl)} disabled={!generatedUrl} className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl transition-all font-bold shadow-md dark:shadow-lg dark:shadow-indigo-600/20">
                                        {isCopied ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />} {isCopied ? "Copied!" : "Copy URL"}
                                   </button>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 mb-4 min-h-[100px] flex items-center transition-colors">
                                   <p className="text-sm md:text-base font-mono break-all text-indigo-700 dark:text-indigo-300 leading-relaxed">
                                        {generatedUrl || <span className="text-gray-400 dark:text-gray-600 italic">Enter a base URL and parameters to generate your tracking link...</span>}
                                   </p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950/60 border border-gray-200 dark:border-gray-800/60 rounded-2xl p-4 flex flex-col gap-2 transition-colors">
                                   <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Attribution Summary</span>
                                   <div className="grid grid-cols-2 gap-2 text-xs font-mono text-gray-600 dark:text-gray-300">
                                        <div>Source: <span className="text-gray-900 dark:text-white font-bold">{source || "N/A"}</span></div>
                                        <div>Medium: <span className="text-gray-900 dark:text-white font-bold">{medium || "N/A"}</span></div>
                                        <div>Campaign: <span className="text-gray-900 dark:text-white font-bold">{campaign || "N/A"}</span></div>
                                        <div>Term/Content: <span className="text-gray-900 dark:text-white font-bold">{term || content || "N/A"}</span></div>
                                   </div>
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
                              <li><strong>Quick Presets:</strong> Quickly inject standardized values for common traffic sources like Google Ads (cpc), Email Newsletters, and Social Media campaigns with a single click.</li>
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