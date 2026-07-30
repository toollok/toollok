"use client";

import { useState, useMemo } from "react";
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

     // Presets loader
     const applyPreset = (presetSource: string, presetMedium: string, presetCampaign: string) => {
          setSource(presetSource);
          setMedium(presetMedium);
          setCampaign(presetCampaign);
     };

     // Generate Final UTM URL
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

               if (params.length > 0) {
                    result += (result.includes("?") ? "&" : "?") + params.join("&");
               }
               return result;
          }
     }, [baseUrl, source, medium, campaign, term, content]);

     useKeyboardShortcuts([
          { key: "c", ctrlOrCmd: true, action: () => generatedUrl && copy(generatedUrl) }
     ]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">

               {/* Header Section */}
               <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                              <Link2 size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-white">UTM Campaign Builder & URL Generator</h2>
                                   <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-400">Generate clean, standardized UTM tracking links for Google Analytics and ad campaigns.</p>
                         </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-xl text-xs text-emerald-400">
                         <ShieldCheck size={16} />
                         <span>Standardized Attribution</span>
                    </div>
               </div>

               {/* Top Ad Banner */}
               <AdSlot adSlot="top-utm-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Parameter Inputs */}
                    <div className="lg:col-span-6 bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col gap-5">
                         <h3 className="text-white font-bold text-base border-b border-gray-800/60 pb-3 flex items-center gap-2">
                              <Tag size={16} className="text-indigo-400" /> Campaign Parameters
                         </h3>

                         {/* Quick Presets */}
                         <div className="flex flex-wrap gap-2 pb-2">
                              <span className="text-[10px] text-gray-500 font-bold uppercase w-full">Quick Channel Presets:</span>
                              <button onClick={() => applyPreset("google", "cpc", "search_ads")} className="text-xs bg-gray-950 hover:bg-gray-800 text-gray-300 border border-gray-800 px-3 py-1.5 rounded-xl transition-colors">
                                   Google Ads
                              </button>
                              <button onClick={() => applyPreset("newsletter", "email", "weekly_digest")} className="text-xs bg-gray-950 hover:bg-gray-800 text-gray-300 border border-gray-800 px-3 py-1.5 rounded-xl transition-colors">
                                   Email Newsletter
                              </button>
                              <button onClick={() => applyPreset("twitter", "social", "organic_post")} className="text-xs bg-gray-950 hover:bg-gray-800 text-gray-300 border border-gray-800 px-3 py-1.5 rounded-xl transition-colors">
                                   Twitter / X
                              </button>
                              <button onClick={() => applyPreset("linkedin", "social", "sponsored_lead")} className="text-xs bg-gray-950 hover:bg-gray-800 text-gray-300 border border-gray-800 px-3 py-1.5 rounded-xl transition-colors">
                                   LinkedIn Ads
                              </button>
                         </div>

                         <div>
                              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Website URL (Base URL) <span className="text-rose-400">*</span></label>
                              <input
                                   type="text"
                                   value={baseUrl}
                                   onChange={(e) => setBaseUrl(e.target.value)}
                                   placeholder="https://example.com/landing"
                                   className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-indigo-500"
                              />
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Campaign Source (<code className="text-indigo-400">utm_source</code>) <span className="text-rose-400">*</span></label>
                                   <input
                                        type="text"
                                        value={source}
                                        onChange={(e) => setSource(e.target.value)}
                                        placeholder="google, newsletter, facebook"
                                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono outline-none focus:border-indigo-500"
                                   />
                              </div>

                              <div>
                                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Campaign Medium (<code className="text-indigo-400">utm_medium</code>) <span className="text-rose-400">*</span></label>
                                   <input
                                        type="text"
                                        value={medium}
                                        onChange={(e) => setMedium(e.target.value)}
                                        placeholder="cpc, banner, email, social"
                                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono outline-none focus:border-indigo-500"
                                   />
                              </div>
                         </div>

                         <div>
                              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Campaign Name (<code className="text-indigo-400">utm_campaign</code>) <span className="text-rose-400">*</span></label>
                              <input
                                   type="text"
                                   value={campaign}
                                   onChange={(e) => setCampaign(e.target.value)}
                                   placeholder="spring_sale, product_launch"
                                   className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono outline-none focus:border-indigo-500"
                              />
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Campaign Term (<code className="text-gray-500">utm_term</code>)</label>
                                   <input
                                        type="text"
                                        value={term}
                                        onChange={(e) => setTerm(e.target.value)}
                                        placeholder="running shoes, saas tool"
                                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono outline-none focus:border-indigo-500"
                                   />
                              </div>

                              <div>
                                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Campaign Content (<code className="text-gray-500">utm_content</code>)</label>
                                   <input
                                        type="text"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="logolink, textlink, banner_a"
                                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono outline-none focus:border-indigo-500"
                                   />
                              </div>
                         </div>
                    </div>

                    {/* Right Column: Generated URL Output */}
                    <div className="lg:col-span-6 flex flex-col gap-6">

                         <div className="bg-[#0c121e] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col gap-6">
                              <div className="flex items-center justify-between border-b border-gray-800/60 pb-3">
                                   <h3 className="text-white font-bold text-base flex items-center gap-2">
                                        <Globe size={18} className="text-emerald-400" /> Generated Tracking URL
                                   </h3>
                                   <button
                                        onClick={() => generatedUrl && copy(generatedUrl)}
                                        disabled={!generatedUrl}
                                        className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl transition-all font-bold shadow-lg shadow-indigo-600/20"
                                   >
                                        {isCopied ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                                        {isCopied ? "Copied to Clipboard!" : "Copy URL"}
                                   </button>
                              </div>

                              <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5 font-mono text-xs text-indigo-300 break-all leading-relaxed min-h-[140px] flex items-center">
                                   {generatedUrl || <span className="text-gray-600 italic">Enter a base URL and parameters to generate your tracking link...</span>}
                              </div>

                              <div className="bg-gray-950/60 border border-gray-800/60 rounded-2xl p-4 flex flex-col gap-2">
                                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Attribution Summary</span>
                                   <div className="grid grid-cols-2 gap-2 text-xs font-mono text-gray-300">
                                        <div>Source: <span className="text-white font-bold">{source || "N/A"}</span></div>
                                        <div>Medium: <span className="text-white font-bold">{medium || "N/A"}</span></div>
                                        <div>Campaign: <span className="text-white font-bold">{campaign || "N/A"}</span></div>
                                        <div>Term/Content: <span className="text-white font-bold">{term || content || "N/A"}</span></div>
                                   </div>
                              </div>
                         </div>

                    </div>
               </div>

               {/* Bottom In-Feed Ad Banner */}
               <AdSlot adSlot="bottom-utm-ad" format="fluid" className="mt-4" />

          </div>
     );
}