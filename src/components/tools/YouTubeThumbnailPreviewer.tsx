"use client";

import { useState, useRef } from "react";
import { Layout, UploadCloud, Monitor, Smartphone, PanelRight, Sun, Moon, Image as ImageIcon } from "lucide-react";

export default function YouTubeThumbnailPreviewer() {
     const [thumbnail, setThumbnail] = useState<string>("https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80");
     const [title, setTitle] = useState<string>("I Built a Master App in 10 Days (Full Tutorial)");
     const [channelName, setChannelName] = useState<string>("CodeMines");
     const [views, setViews] = useState<string>("125K");
     const [timeAgo, setTimeAgo] = useState<string>("2 days ago");
     const [duration, setDuration] = useState<string>("14:20");
     const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

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
                         <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-400 border border-red-500/20">
                              <Layout size={24} />
                         </div>
                         <div>
                              <h2 className="text-2xl font-bold text-white">YouTube Thumbnail Previewer</h2>
                              <p className="text-sm text-gray-400">Test how your thumbnail looks across all YouTube layouts.</p>
                         </div>
                    </div>

                    {/* Theme Toggle for Previews */}
                    <button
                         onClick={() => setIsDarkMode(!isDarkMode)}
                         className="flex items-center gap-2 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 px-4 py-2.5 rounded-xl transition-all shadow-lg"
                    >
                         {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-blue-400" />}
                         <span className="text-sm font-bold">{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
                    </button>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Control Panel (Left) */}
                    <div className="lg:col-span-4 bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl flex flex-col gap-6 sticky top-24">
                         <h3 className="text-white font-bold text-lg border-b border-gray-800/60 pb-3">Video Details</h3>

                         {/* Image Uploader */}
                         <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-400">Thumbnail Image</label>
                              <div
                                   onClick={() => fileInputRef.current?.click()}
                                   className="w-full h-32 border-2 border-dashed border-gray-700 hover:border-blue-500 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-gray-950/50 transition-colors group overflow-hidden relative"
                              >
                                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                        <span className="text-white font-bold text-sm bg-blue-600 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                             <UploadCloud size={16} /> Replace Image
                                        </span>
                                   </div>
                                   <img src={thumbnail} alt="Thumbnail preview" className="absolute inset-0 w-full h-full object-cover opacity-50 blur-[2px]" />
                                   <ImageIcon size={28} className="text-gray-500 mb-2 relative z-0" />
                                   <span className="text-sm text-gray-400 relative z-0">Click to upload 16:9 image</span>
                              </div>
                              <input
                                   type="file"
                                   ref={fileInputRef}
                                   onChange={handleImageUpload}
                                   accept="image/*"
                                   className="hidden"
                              />
                         </div>

                         {/* Text Inputs */}
                         <div className="space-y-4">
                              <div>
                                   <label className="text-sm font-medium text-gray-400 mb-1.5 block">Video Title</label>
                                   <textarea
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 resize-none h-20"
                                   />
                              </div>

                              <div>
                                   <label className="text-sm font-medium text-gray-400 mb-1.5 block">Channel Name</label>
                                   <input
                                        type="text"
                                        value={channelName}
                                        onChange={(e) => setChannelName(e.target.value)}
                                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                                   />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                   <div>
                                        <label className="text-sm font-medium text-gray-400 mb-1.5 block">Views</label>
                                        <input
                                             type="text"
                                             value={views}
                                             onChange={(e) => setViews(e.target.value)}
                                             className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                                        />
                                   </div>
                                   <div>
                                        <label className="text-sm font-medium text-gray-400 mb-1.5 block">Time Ago</label>
                                        <input
                                             type="text"
                                             value={timeAgo}
                                             onChange={(e) => setTimeAgo(e.target.value)}
                                             className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                                        />
                                   </div>
                              </div>

                              <div>
                                   <label className="text-sm font-medium text-gray-400 mb-1.5 block">Duration Tag</label>
                                   <input
                                        type="text"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                                        placeholder="e.g., 10:05"
                                   />
                              </div>
                         </div>
                    </div>

                    {/* Live Previews (Right) */}
                    <div className={`lg:col-span-8 rounded-3xl p-6 md:p-8 flex flex-col gap-10 transition-colors shadow-xl border ${isDarkMode ? "bg-gray-900 border-gray-800 text-white" : "bg-gray-100 border-gray-300 text-black"}`}>

                         {/* 1. Desktop Home Preview (Browser Frame) */}
                         <div>
                              <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-4 opacity-50">
                                   <Monitor size={16} /> Desktop Homepage
                              </h4>

                              <div className={`max-w-[420px] rounded-xl overflow-hidden border shadow-2xl transition-colors ${isDarkMode ? "border-gray-700 bg-[#0f0f0f]" : "border-gray-300 bg-[#f2f2f2]"}`}>
                                   {/* Browser Header Bar */}
                                   <div className={`h-8 px-4 flex items-center gap-2 border-b transition-colors ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-[#e5e5e5] border-gray-300"}`}>
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
                                                  <h3 className="font-semibold text-base leading-tight line-clamp-2 mb-1">
                                                       {title}
                                                  </h3>
                                                  <p className="text-[13px] opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
                                                       {channelName}
                                                  </p>
                                                  <p className="text-[13px] opacity-70">
                                                       {views} views • {timeAgo}
                                                  </p>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>

                         <div className={`h-px w-full ${isDarkMode ? "bg-gray-800" : "bg-gray-300"}`}></div>

                         {/* 2. Mobile Home Preview (Phone Frame) */}
                         <div>
                              <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-4 opacity-50">
                                   <Smartphone size={16} /> Mobile View
                              </h4>

                              <div className={`max-w-[320px] rounded-[2.5rem] border-[8px] overflow-hidden shadow-2xl relative transition-colors ${isDarkMode ? "border-gray-800 bg-[#0f0f0f]" : "border-gray-300 bg-[#f2f2f2]"}`}>
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
                                                  <h3 className="font-semibold text-[15px] leading-tight line-clamp-2 mb-0.5">
                                                       {title}
                                                  </h3>
                                                  <p className="text-xs opacity-70">
                                                       {channelName} • {views} views • {timeAgo}
                                                  </p>
                                             </div>
                                        </div>
                                   </div>

                                   {/* Phone Home Indicator */}
                                   <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-1 rounded-full transition-colors ${isDarkMode ? "bg-gray-700" : "bg-gray-400"}`}></div>
                              </div>
                         </div>

                         <div className={`h-px w-full ${isDarkMode ? "bg-gray-800" : "bg-gray-300"}`}></div>

                         {/* 3. Sidebar Suggestion Preview (Clean UI) */}
                         <div>
                              <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-4 opacity-50">
                                   <PanelRight size={16} /> Up Next / Sidebar
                              </h4>

                              <div className={`max-w-[400px] flex gap-2 p-3 rounded-xl border transition-colors ${isDarkMode ? "border-gray-800 bg-[#0f0f0f]" : "border-gray-300 bg-[#f2f2f2]"}`}>
                                   <div className="relative w-40 shrink-0 h-24 rounded-lg overflow-hidden bg-black">
                                        <img src={thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                                        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1 py-0.5 rounded">
                                             {duration}
                                        </div>
                                   </div>
                                   <div className="flex flex-col pt-0.5 pr-2">
                                        <h3 className="font-semibold text-[14px] leading-tight line-clamp-2 mb-1">
                                             {title}
                                        </h3>
                                        <p className="text-[12px] opacity-70 line-clamp-1 hover:opacity-100 cursor-pointer transition-opacity">
                                             {channelName}
                                        </p>
                                        <p className="text-[12px] opacity-70 mt-0.5">
                                             {views} views • {timeAgo}
                                        </p>
                                   </div>
                              </div>
                         </div>

                    </div>
               </div>
          </div>
     );
}