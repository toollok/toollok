"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Layout, UploadCloud, Monitor, Smartphone, PanelRight, Sun, Moon, Image as ImageIcon } from "lucide-react";
import AdSlot from "@/components/ui/AdSlot";

export default function YouTubeThumbnailPreviewer() {
     const [thumbnail, setThumbnail] = useState<string>("https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80");
     const [title, setTitle] = useState<string>("I Built a Master App in 10 Days (Full Tutorial)");
     const [channelName, setChannelName] = useState<string>("CodeMines");
     const [views, setViews] = useState<string>("125K");
     const [timeAgo, setTimeAgo] = useState<string>("2 days ago");
     const [duration, setDuration] = useState<string>("14:20");
     const [isDarkMode, setIsDarkMode] = useState<boolean>(true); // For preview windows specifically

     const fileInputRef = useRef<HTMLInputElement>(null);

     const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (file) {
               const url = URL.createObjectURL(file);
               setThumbnail(url);
          }
     };

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">

               {/* Header Section */}
               <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                              <Layout size={24} />
                         </div>
                         <div>
                              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">YouTube Thumbnail Previewer</h2>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Test how your thumbnail looks across all YouTube layouts.</p>
                         </div>
                    </div>

                    {/* Theme Toggle for Previews */}
                    <button
                         onClick={() => setIsDarkMode(!isDarkMode)}
                         className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:border-gray-700 text-gray-900 dark:text-gray-300 px-4 py-2.5 rounded-xl transition-all shadow-sm dark:shadow-lg"
                    >
                         {isDarkMode ? <Sun size={18} className="text-amber-500 dark:text-amber-400" /> : <Moon size={18} className="text-blue-500 dark:text-blue-400" />}
                         <span className="text-sm font-bold">{isDarkMode ? "Light UI Preview" : "Dark UI Preview"}</span>
                    </button>
               </div>

               <AdSlot adSlot="top-yt-preview-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Control Panel (Left) */}
                    <div className="lg:col-span-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col gap-6 sticky top-24 transition-colors">
                         <h3 className="text-gray-900 dark:text-white font-bold text-lg border-b border-gray-100 dark:border-gray-800/60 pb-3">Video Details</h3>

                         {/* Image Uploader */}
                         <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Thumbnail Image</label>
                              <div
                                   onClick={() => fileInputRef.current?.click()}
                                   className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-gray-50 dark:bg-gray-950/50 transition-colors group overflow-hidden relative"
                              >
                                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                        <span className="text-white font-bold text-sm bg-blue-600 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                             <UploadCloud size={16} /> Replace Image
                                        </span>
                                   </div>
                                   <img src={thumbnail} alt="Thumbnail preview" className="absolute inset-0 w-full h-full object-cover opacity-50 blur-[2px]" />
                                   <ImageIcon size={28} className="text-gray-600 dark:text-gray-500 mb-2 relative z-0" />
                                   <span className="text-sm text-gray-700 dark:text-gray-400 relative z-0">Click to upload 16:9 image</span>
                              </div>
                              <input
                                   type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden"
                              />
                         </div>

                         {/* Text Inputs */}
                         <div className="space-y-4">
                              <div>
                                   <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">Video Title</label>
                                   <textarea
                                        value={title} onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 resize-none h-20 transition-colors"
                                   />
                              </div>

                              <div>
                                   <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">Channel Name</label>
                                   <input
                                        type="text" value={channelName} onChange={(e) => setChannelName(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
                                   />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                   <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">Views</label>
                                        <input
                                             type="text" value={views} onChange={(e) => setViews(e.target.value)}
                                             className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
                                        />
                                   </div>
                                   <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">Time Ago</label>
                                        <input
                                             type="text" value={timeAgo} onChange={(e) => setTimeAgo(e.target.value)}
                                             className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
                                        />
                                   </div>
                              </div>

                              <div>
                                   <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">Duration Tag</label>
                                   <input
                                        type="text" value={duration} onChange={(e) => setDuration(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
                                        placeholder="e.g., 10:05"
                                   />
                              </div>
                         </div>
                    </div>

                    {/* Live Previews (Right) */}
                    <div className={`lg:col-span-8 rounded-3xl p-6 md:p-8 flex flex-col gap-10 transition-colors shadow-sm dark:shadow-xl border ${isDarkMode ? "bg-[#0f0f0f] border-gray-800 text-white" : "bg-white border-gray-200 text-black"}`}>

                         {/* 1. Desktop Home Preview (Browser Frame) */}
                         <div>
                              <h4 className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-4 opacity-50 ${isDarkMode ? "text-white" : "text-black"}`}>
                                   <Monitor size={16} /> Desktop Homepage
                              </h4>

                              <div className={`max-w-[420px] rounded-xl overflow-hidden border shadow-2xl transition-colors ${isDarkMode ? "border-gray-800 bg-[#0f0f0f]" : "border-gray-200 bg-[#f8f8f8]"}`}>
                                   {/* Browser Header Bar */}
                                   <div className={`h-8 px-4 flex items-center gap-2 border-b transition-colors ${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-[#e5e5e5] border-gray-300"}`}>
                                        <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                                        <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                                   </div>

                                   {/* Video Component */}
                                   <div className="p-4">
                                        <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                                             <img src={thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                                             <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
                                                  {duration}
                                             </div>
                                        </div>
                                        <div className="flex gap-3 pr-2">
                                             <div className="w-9 h-9 rounded-full shrink-0 mt-0.5 flex items-center justify-center font-bold text-sm bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                                  {channelName.charAt(0).toUpperCase()}
                                             </div>
                                             <div className="flex flex-col">
                                                  <h3 className={`font-semibold text-base leading-tight line-clamp-2 mb-1 ${isDarkMode ? "text-white" : "text-black"}`}>
                                                       {title}
                                                  </h3>
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

                         <div className={`h-px w-full ${isDarkMode ? "bg-gray-800" : "bg-gray-200"}`}></div>

                         {/* 2. Mobile Home Preview (Phone Frame) */}
                         <div>
                              <h4 className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-4 opacity-50 ${isDarkMode ? "text-white" : "text-black"}`}>
                                   <Smartphone size={16} /> Mobile View
                              </h4>

                              <div className={`max-w-[320px] rounded-[2.5rem] border-[8px] overflow-hidden shadow-2xl relative transition-colors ${isDarkMode ? "border-gray-800 bg-[#0f0f0f]" : "border-gray-300 bg-[#f8f8f8]"}`}>
                                   {/* Phone Camera Notch */}
                                   <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 rounded-b-2xl z-10 transition-colors ${isDarkMode ? "bg-gray-800" : "bg-gray-300"}`}></div>

                                   {/* Video Component */}
                                   <div className="p-3 pt-8 pb-8">
                                        <div className="relative aspect-video mb-3 bg-black">
                                             <img src={thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                                             <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
                                                  {duration}
                                             </div>
                                        </div>
                                        <div className="flex gap-3 px-1">
                                             <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                                  {channelName.charAt(0).toUpperCase()}
                                             </div>
                                             <div className="flex flex-col pr-2">
                                                  <h3 className={`font-semibold text-[15px] leading-tight line-clamp-2 mb-0.5 ${isDarkMode ? "text-white" : "text-black"}`}>
                                                       {title}
                                                  </h3>
                                                  <p className={`text-xs opacity-70 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                                       {channelName} • {views} views • {timeAgo}
                                                  </p>
                                             </div>
                                        </div>
                                   </div>

                                   {/* Phone Home Indicator */}
                                   <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-1 rounded-full transition-colors ${isDarkMode ? "bg-gray-700" : "bg-gray-400"}`}></div>
                              </div>
                         </div>

                         <div className={`h-px w-full ${isDarkMode ? "bg-gray-800" : "bg-gray-200"}`}></div>

                         {/* 3. Sidebar Suggestion Preview (Clean UI) */}
                         <div>
                              <h4 className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-4 opacity-50 ${isDarkMode ? "text-white" : "text-black"}`}>
                                   <PanelRight size={16} /> Up Next / Sidebar
                              </h4>

                              <div className={`max-w-[400px] flex gap-2 p-3 rounded-xl border transition-colors ${isDarkMode ? "border-gray-800 bg-[#0f0f0f]" : "border-gray-200 bg-[#f8f8f8]"}`}>
                                   <div className="relative w-40 shrink-0 h-24 rounded-lg overflow-hidden bg-black">
                                        <img src={thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                                        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1 py-0.5 rounded">
                                             {duration}
                                        </div>
                                   </div>
                                   <div className="flex flex-col pt-0.5 pr-2">
                                        <h3 className={`font-semibold text-[14px] leading-tight line-clamp-2 mb-1 ${isDarkMode ? "text-white" : "text-black"}`}>
                                             {title}
                                        </h3>
                                        <p className={`text-[12px] opacity-70 line-clamp-1 hover:opacity-100 cursor-pointer transition-opacity ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                             {channelName}
                                        </p>
                                        <p className={`text-[12px] opacity-70 mt-0.5 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                             {views} views • {timeAgo}
                                        </p>
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
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">YouTube Thumbnail Previewer & CTR Tester</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              A great video with a bad thumbnail will get zero views. ToolLok's <strong>YouTube Thumbnail Previewer</strong> allows creators to upload their artwork and instantly see exactly how it will look natively across the YouTube ecosystem. Avoid crucial mistakes like text being blocked by the duration timestamp, and use this alongside our <Link href="/categories/content-creator-tools" className="text-red-600 dark:text-red-400 hover:underline">Content Creator Tools</Link> to skyrocket your Click-Through Rate (CTR).
                         </p>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Why You Need to Preview Thumbnails</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Avoid Timestamp Cutoffs:</strong> YouTube always overlays a duration badge in the bottom-right corner. Our previewer helps you ensure you haven't placed important text or faces underneath that badge.</li>
                              <li><strong>Test Across Devices:</strong> A thumbnail that looks great on a 27-inch desktop monitor might be unreadable on a smartphone screen. Preview both layouts side-by-side.</li>
                              <li><strong>Light Mode vs. Dark Mode:</strong> Colors contrast differently depending on the user's system theme. Use our Light/Dark toggle to ensure your text pops in both environments.</li>
                         </ul>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">What is the ideal YouTube thumbnail size?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">The recommended size for YouTube thumbnails is 1280x720 pixels (with a minimum width of 640 pixels). You should always upload thumbnails in a 16:9 aspect ratio and keep the file size under 2MB.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Do you save the images I upload?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">No. Your thumbnail images are rendered locally in your browser using standard JavaScript objects. We do not upload, save, or store your unreleased video assets on our servers.</p>
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
                                             "name": "What is the ideal YouTube thumbnail size?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "The recommended size is 1280x720 pixels (16:9 ratio) with a file size under 2MB." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "Do you save the images I upload?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "No. Thumbnail images are rendered locally in your browser and are never uploaded or saved on our servers." }
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