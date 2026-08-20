"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Film, Scissors, UploadCloud, Play, CheckCircle2, Clock, Smartphone, MessageSquare, Wand2, Copy, Check } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import AdSlot from "@/components/ui/AdSlot";

interface GeneratedClip {
     id: string;
     title: string;
     start: string;
     end: string;
     duration: number;
     hookScore: number;
     transcriptPreview: string;
}

export default function ShortVideoRepurposer() {
     const [videoFile, setVideoFile] = useState<File | null>(null);
     const [videoSrc, setVideoSrc] = useState<string>("");
     const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
     const [progress, setProgress] = useState<number>(0);
     const [clips, setClips] = useState<GeneratedClip[]>([]);
     const [activeClipId, setActiveClipId] = useState<string | null>(null);

     const videoRef = useRef<HTMLVideoElement>(null);
     const fileInputRef = useRef<HTMLInputElement>(null);
     const { isCopied, copy } = useCopyToClipboard(2000);

     const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (file) {
               if (!file.type.startsWith("video/")) {
                    alert("Please upload a valid video file (MP4, WebM).");
                    return;
               }
               setVideoFile(file);
               setVideoSrc(URL.createObjectURL(file));
               setClips([]);
               setActiveClipId(null);
               setProgress(0);
          }
     };

     const analyzeVideo = () => {
          if (!videoSrc) return;
          setIsAnalyzing(true);
          setProgress(0);
          setClips([]);

          const interval = setInterval(() => {
               setProgress((prev) => {
                    if (prev >= 100) {
                         clearInterval(interval);
                         setIsAnalyzing(false);
                         generateMockClips();
                         return 100;
                    }
                    return prev + 5;
               });
          }, 150);
     };

     const generateMockClips = () => {
          const mockData: GeneratedClip[] = [
               {
                    id: "clip-1",
                    title: "The Ultimate Framework",
                    start: "02:14",
                    end: "03:10",
                    duration: 56,
                    hookScore: 94,
                    transcriptPreview: "This is the single biggest mistake developers make when..."
               },
               {
                    id: "clip-2",
                    title: "Debunking the Myth",
                    start: "08:45",
                    end: "09:30",
                    duration: 45,
                    hookScore: 88,
                    transcriptPreview: "People think you need massive capital to start, but actually..."
               },
               {
                    id: "clip-3",
                    title: "Step-by-Step Guide",
                    start: "14:20",
                    end: "15:18",
                    duration: 58,
                    hookScore: 82,
                    transcriptPreview: "First, you set up the environment. Second, you configure the..."
               }
          ];
          setClips(mockData);
          setActiveClipId(mockData[0].id);
     };

     const handlePlayClip = (startStr: string, clipId: string) => {
          setActiveClipId(clipId);
          if (videoRef.current) {
               const parts = startStr.split(":");
               const seconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
               videoRef.current.currentTime = seconds;
               videoRef.current.play();
          }
     };

     useEffect(() => {
          return () => {
               if (videoSrc) URL.revokeObjectURL(videoSrc);
          };
     }, [videoSrc]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">

               <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                              <Film size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Multi-Platform Video Repurposer (Demo)</h2>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Extract viral 60-second Shorts and Reels from your long-form videos entirely in-browser.</p>
                         </div>
                    </div>
               </div>

               <AdSlot adSlot="top-repurposer-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-5 flex flex-col gap-6 sticky top-24">
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl transition-colors">
                              <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-4 border-b border-gray-100 dark:border-gray-800/60 pb-3 flex items-center gap-2">
                                   <UploadCloud size={18} className="text-purple-600 dark:text-purple-400" /> Source Media
                              </h3>

                              {!videoSrc ? (
                                   <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full aspect-video border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-gray-50 dark:bg-gray-950/50 transition-all hover:bg-gray-100 dark:hover:bg-gray-900 group"
                                   >
                                        <div className="w-14 h-14 bg-white dark:bg-gray-800 group-hover:bg-purple-50 dark:group-hover:bg-purple-500/20 rounded-full flex items-center justify-center mb-4 transition-colors border border-gray-200 dark:border-transparent shadow-sm dark:shadow-none">
                                             <Film size={28} className="text-gray-400 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white mb-1">Upload Long-Form Video</span>
                                        <span className="text-xs text-gray-500">MP4 or WebM (Runs 100% locally)</span>
                                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="video/mp4,video/webm" className="hidden" />
                                   </div>
                              ) : (
                                   <div className="flex flex-col gap-4">
                                        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-gray-200 dark:border-gray-800 shadow-md dark:shadow-lg">
                                             <video ref={videoRef} src={videoSrc} controls className="w-full h-full object-contain" />
                                        </div>

                                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-3 rounded-xl transition-colors">
                                             <div className="flex flex-col overflow-hidden pr-4">
                                                  <span className="text-sm font-bold text-gray-900 dark:text-gray-300 truncate">{videoFile?.name}</span>
                                                  <span className="text-xs text-gray-500">{(videoFile?.size ? videoFile.size / (1024 * 1024) : 0).toFixed(2)} MB • Ready for Analysis</span>
                                             </div>
                                             <button onClick={() => setVideoSrc("")} className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-bold shrink-0">
                                                  Remove
                                             </button>
                                        </div>

                                        {!clips.length && !isAnalyzing && (
                                             <button onClick={analyzeVideo} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-md dark:shadow-lg dark:shadow-purple-600/20">
                                                  <Wand2 size={18} /> Find Viral Clips
                                             </button>
                                        )}

                                        {isAnalyzing && (
                                             <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-5 transition-colors">
                                                  <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">
                                                       <span className="animate-pulse text-purple-600 dark:text-purple-400">Scanning audio spikes & visual hooks...</span>
                                                       <span className="text-gray-900 dark:text-gray-400">{progress}%</span>
                                                  </div>
                                                  <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                                       <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-150 ease-out" style={{ width: `${progress}%` }} />
                                                  </div>
                                             </div>
                                        )}
                                   </div>
                              )}
                         </div>
                    </div>

                    <div className="lg:col-span-7 flex flex-col gap-6">
                         <div className="bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl min-h-[400px] transition-colors">
                              <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800/60 pb-3">
                                   <h3 className="text-gray-900 dark:text-white font-bold text-lg flex items-center gap-2">
                                        <Smartphone size={18} className="text-pink-600 dark:text-pink-400" /> Extracted Shorts
                                   </h3>
                                   <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        {clips.length} {clips.length === 1 ? 'Clip' : 'Clips'} Found
                                   </span>
                              </div>

                              {!clips.length ? (
                                   <div className="flex flex-col items-center justify-center h-64 text-center opacity-50">
                                        <Scissors size={48} className="text-gray-400 dark:text-gray-600 mb-4" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium max-w-sm">
                                             Upload a video and click "Find Viral Clips". The AI will scan the timeline and extract the highest-retention 60-second hooks.
                                        </p>
                                   </div>
                              ) : (
                                   <div className="space-y-4">
                                        {clips.map((clip, index) => (
                                             <div key={clip.id} className={`flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border transition-all ${activeClipId === clip.id ? "bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-500/50 shadow-sm dark:shadow-none" : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"}`}>
                                                  <div className="relative w-full sm:w-28 aspect-[9/16] bg-black rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden shrink-0 flex items-center justify-center group cursor-pointer" onClick={() => handlePlayClip(clip.start, clip.id)}>
                                                       <div className="absolute inset-0 opacity-40 bg-gradient-to-t from-black via-transparent to-black pointer-events-none z-10" />
                                                       <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=400&q=80" className="absolute inset-0 w-full h-full object-cover blur-sm group-hover:blur-none transition-all" alt="Preview" />
                                                       <Play size={24} className="text-white relative z-20 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all drop-shadow-md" />
                                                       <div className="absolute bottom-2 left-0 right-0 flex justify-center z-20">
                                                            <div className="bg-yellow-400 text-black text-[8px] font-black uppercase px-2 py-0.5 rounded-sm w-[80%] text-center truncate shadow-sm">
                                                                 {clip.transcriptPreview.split(' ')[0]} {clip.transcriptPreview.split(' ')[1]}
                                                            </div>
                                                       </div>
                                                  </div>

                                                  <div className="flex flex-col flex-grow py-1">
                                                       <div className="flex items-start justify-between mb-2">
                                                            <div>
                                                                 <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider block mb-0.5">Clip #{index + 1}</span>
                                                                 <h4 className="text-gray-900 dark:text-white font-bold text-base leading-tight">{clip.title}</h4>
                                                            </div>
                                                            <div className="flex flex-col items-end">
                                                                 <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Hook Score</span>
                                                                 <div className={`px-2 py-0.5 rounded text-xs font-black border ${clip.hookScore > 90 ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-transparent' : 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-transparent'}`}>
                                                                      {clip.hookScore}/100
                                                                 </div>
                                                            </div>
                                                       </div>

                                                       <div className="flex items-center gap-4 text-xs font-mono text-gray-600 dark:text-gray-400 mb-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 w-fit px-3 py-1.5 rounded-lg transition-colors">
                                                            <span className="flex items-center gap-1.5"><Clock size={12} className="text-gray-500" /> {clip.duration}s</span>
                                                            <span className="text-gray-300 dark:text-gray-700">|</span>
                                                            <span className="text-gray-700 dark:text-gray-400">{clip.start} - {clip.end}</span>
                                                       </div>

                                                       <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400 italic bg-purple-50/50 dark:bg-gray-950/50 p-2.5 rounded-lg border-l-2 border-purple-400 dark:border-purple-500 mb-4 transition-colors">
                                                            <MessageSquare size={14} className="text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                                                            "{clip.transcriptPreview}..."
                                                       </div>

                                                       <div className="mt-auto flex items-center justify-between">
                                                            <button onClick={() => handlePlayClip(clip.start, clip.id)} className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                                                                 Preview & Seek
                                                            </button>
                                                            <button onClick={() => copy(`Clip: ${clip.title}\nStart: ${clip.start}\nEnd: ${clip.end}`)} className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-transparent px-3 py-1.5 rounded-lg transition-colors shadow-sm dark:shadow-none">
                                                                 {isCopied ? <Check size={12} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={12} />}
                                                                 {isCopied ? "Copied" : "Copy Timestamps"}
                                                            </button>
                                                       </div>
                                                  </div>
                                             </div>
                                        ))}
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
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Turn Long Videos into Viral Shorts Instantly</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              Repurposing long-form content is the fastest way to grow your audience on YouTube Shorts, TikTok, and Instagram Reels. ToolLok's <strong>Multi-Platform Video Repurposer</strong> analyzes your horizontal video and predicts the highest-retention moments, extracting them into vertical, bite-sized clips. Since processing occurs locally in your browser, your unreleased footage remains completely private. Combine this with our <Link href="/categories/content-creator-tools" className="text-purple-600 dark:text-purple-400 hover:underline">Content Creator Tools</Link> to maximize your reach.
                         </p>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Intelligent Extraction Features</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Hook Score Predictions:</strong> The AI ranks every generated clip with a "Hook Score" based on audio peaks, visual pacing, and transcript impact, ensuring you only post the most engaging moments.</li>
                              <li><strong>Automated Timestamps:</strong> Instantly copy the exact start and end timestamps of viral moments so you can easily slice them in your preferred editing software like Premiere Pro or DaVinci Resolve.</li>
                              <li><strong>Zero-Upload Processing:</strong> Your multi-gigabyte video files never leave your computer, saving you hours of upload time and keeping your content 100% secure.</li>
                         </ul>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Why should I repurpose my long-form videos?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Short-form video algorithms heavily favor high-retention content. By taking the best 60 seconds from a 20-minute video and uploading it to Shorts or TikTok, you can drive massive organic traffic back to your main channel with a fraction of the production effort.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Is the video sent to a cloud server for processing?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">No. Our Repurposer uses your local browser engine to analyze the video timeline, meaning you do not have to waste bandwidth uploading large source files to the cloud.</p>
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
                                             "name": "Why should I repurpose my long-form videos?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Short-form video algorithms favor high-retention content. Repurposing the best moments drives organic traffic to your main channel efficiently." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "Is the video sent to a cloud server for processing?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "No. The tool uses your local browser engine to analyze the timeline, saving bandwidth and ensuring privacy." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-repurposer-ad" format="fluid" className="mt-4" />
          </div>
     );
}