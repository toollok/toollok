"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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

     useKeyboardShortcuts([
          { key: "c", ctrlOrCmd: true, action: () => copy(generatedHtmlCode) }
     ]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">

               {/* Header Section */}
               <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20">
                              <Code size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Meta Tags & Open Graph Generator</h2>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Generate optimized SEO meta tags and social sharing cards with real-time visual previews.</p>
                         </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 shadow-sm dark:shadow-none">
                         <ShieldCheck size={16} />
                         <span>SEO Optimizer</span>
                    </div>
               </div>

               <AdSlot adSlot="top-metatags-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Input Form */}
                    <div className="lg:col-span-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-xl flex flex-col gap-5 transition-colors">
                         <h3 className="text-gray-900 dark:text-white font-bold text-base border-b border-gray-100 dark:border-gray-800/60 pb-3 flex items-center gap-2">
                              <Globe size={16} className="text-cyan-600 dark:text-cyan-400" /> Page Details & Metadata
                         </h3>

                         <div>
                              <div className="flex justify-between items-center mb-1.5">
                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Meta Title</label>
                                   <span className={`text-[10px] font-mono ${title.length > 60 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'}`}>{title.length}/60 chars</span>
                              </div>
                              <input
                                   type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                                   className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white font-mono outline-none focus:border-cyan-500 transition-colors"
                              />
                         </div>

                         <div>
                              <div className="flex justify-between items-center mb-1.5">
                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Meta Description</label>
                                   <span className={`text-[10px] font-mono ${description.length > 160 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'}`}>{description.length}/160 chars</span>
                              </div>
                              <textarea
                                   value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                                   className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs text-gray-900 dark:text-white font-mono outline-none resize-none focus:border-cyan-500 transition-colors"
                              />
                         </div>

                         <div>
                              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">Canonical URL</label>
                              <input
                                   type="text" value={url} onChange={(e) => setUrl(e.target.value)}
                                   className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white font-mono outline-none focus:border-cyan-500 transition-colors"
                              />
                         </div>

                         <div>
                              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">Social Share Image URL (OG Image)</label>
                              <input
                                   type="text" value={image} onChange={(e) => setImage(e.target.value)}
                                   className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white font-mono outline-none focus:border-cyan-500 transition-colors"
                              />
                         </div>

                         <div>
                              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">Twitter Username Handle</label>
                              <input
                                   type="text" value={twitterHandle} onChange={(e) => setTwitterHandle(e.target.value)}
                                   className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white font-mono outline-none focus:border-cyan-500 transition-colors"
                              />
                         </div>
                    </div>

                    {/* Right Column: Dynamic Previews */}
                    <div className="lg:col-span-6 flex flex-col gap-6">
                         <div className="bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-xl relative overflow-hidden flex flex-col gap-6 transition-colors">
                              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/60 pb-3 flex-wrap gap-3">
                                   <div className="flex items-center gap-1.5">
                                        <button onClick={() => setPreviewTab("google")} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${previewTab === "google" ? "bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30 shadow-sm dark:shadow-none" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>Google Preview</button>
                                        <button onClick={() => setPreviewTab("facebook")} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${previewTab === "facebook" ? "bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30 shadow-sm dark:shadow-none" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>Facebook / LinkedIn</button>
                                        <button onClick={() => setPreviewTab("code")} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${previewTab === "code" ? "bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30 shadow-sm dark:shadow-none" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>HTML Code</button>
                                   </div>
                                   {previewTab === "code" && (
                                        <button onClick={() => copy(generatedHtmlCode)} className="flex items-center gap-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-1.5 rounded-xl transition-all font-bold shadow-md dark:shadow-lg dark:shadow-cyan-600/20">
                                             {isCopied ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />} {isCopied ? "Copied HTML!" : "Copy Code"}
                                        </button>
                                   )}
                              </div>

                              {/* Google Preview Tab */}
                              {previewTab === "google" && (
                                   <div className="bg-white text-black p-4 rounded-2xl shadow-md border border-gray-100 flex flex-col gap-1 font-sans transition-colors">
                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                             <Globe size={14} />
                                             <span className="truncate">{url}</span>
                                        </div>
                                        <h4 className="text-blue-800 font-medium text-base hover:underline cursor-pointer truncate">{title}</h4>
                                        <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">{description}</p>
                                   </div>
                              )}

                              {/* Facebook Preview Tab */}
                              {previewTab === "facebook" && (
                                   <div className="bg-gray-100 dark:bg-[#242526] border border-gray-300 dark:border-gray-700 rounded-2xl overflow-hidden shadow-lg flex flex-col transition-colors">
                                        <div className="w-full h-40 bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
                                             {/* eslint-disable-next-line @next/next/no-img-element */}
                                             <img src={image} alt="OG Preview" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="p-4 bg-white dark:bg-[#18191a] flex flex-col gap-1 transition-colors">
                                             <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-mono tracking-wider">{new URL(url || "https://example.com").hostname}</span>
                                             <h4 className="text-gray-900 dark:text-white font-bold text-sm truncate">{title}</h4>
                                             <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">{description}</p>
                                        </div>
                                   </div>
                              )}

                              {/* Code Preview Tab */}
                              {previewTab === "code" && (
                                   <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 font-mono text-xs text-cyan-700 dark:text-cyan-300 overflow-y-auto max-h-[300px] whitespace-pre-wrap leading-relaxed transition-colors">
                                        {generatedHtmlCode}
                                   </div>
                              )}
                         </div>
                    </div>
               </div>

               {/* ========================================= */}
               {/* SEO CONTENT & FAQS */}
               {/* ========================================= */}
               <div className="mt-12 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm dark:shadow-none">
                    <div className="prose dark:prose-invert max-w-none">
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Master SEO with the Meta Tags & Open Graph Generator</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              First impressions matter in search engine results and social media feeds. The ToolLok <strong>Meta Tags Generator</strong> allows marketers and developers to craft perfectly optimized &lt;title&gt; and &lt;meta&gt; tags, ensuring your content looks professional when shared on Google, Facebook, Twitter, and LinkedIn. Pair this utility with our <Link href="/categories/seo-tools" className="text-cyan-600 dark:text-cyan-400 hover:underline">SEO Tools</Link> to maximize your click-through rates (CTR).
                         </p>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Optimize for Clicks</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Character Limits:</strong> Built-in counters ensure your titles stay under 60 characters and descriptions under 160 characters so they never get truncated in Google search results.</li>
                              <li><strong>Live Visual Previews:</strong> Instantly see exactly how your page will look as a rich Open Graph (OG) card when shared on Facebook or Twitter.</li>
                              <li><strong>Instant HTML Export:</strong> Generate standard, compliant HTML code that you can copy and paste directly into your website&apos;s &lt;head&gt; section.</li>
                         </ul>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Why are Meta Tags important for SEO?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Meta tags provide search engines with context about your page. The Title Tag directly impacts your rankings, while a compelling Meta Description encourages users to click your link instead of a competitor&apos;s, boosting your Organic CTR.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">What is Open Graph (OG)?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Open Graph is an internet protocol originally created by Facebook. It allows you to define the exact image, title, and description that should appear when your link is shared on social media platforms, transforming a boring URL into an engaging visual card.</p>
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
                                             "name": "Why are Meta Tags important for SEO?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Meta tags provide search engines with context about your page. The Title Tag impacts rankings, while the Description boosts Organic CTR." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "What is Open Graph (OG)?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Open Graph is an internet protocol that allows you to define the exact image, title, and description that appear when your link is shared on social media." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-metatags-ad" format="fluid" className="mt-4" />
          </div>
     );
}