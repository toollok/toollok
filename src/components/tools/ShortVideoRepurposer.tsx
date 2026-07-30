"use client";

import { useState, useRef, useEffect } from "react";
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

          // Simulate AI scanning the video timeline
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
          // Generate 3 mock clips based on standard viral templates
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

     // Cleanup Object URL to prevent memory leaks
     useEffect(() => {
          return () => {
               if (videoSrc) URL.revokeObjectURL(videoSrc);
          };
     }, [videoSrc]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">

               {/* Header Section */}
               <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 border border-purple-500/20">
                              <Film size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-white">Multi-Platform Video Repurposer</h2>
                                   <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-400">Extract viral 60-second Shorts and Reels from your long-form videos entirely in-browser.</p>
                         </div>
                    </div>
               </div>

               {/* Top Ad Banner */}
               <AdSlot adSlot="top-repurposer-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Master Source & Controls */}
                    <div className="lg:col-span-5 flex flex-col gap-6 sticky top-24">

                         <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl">
                              <h3 className="text-white font-bold text-lg mb-4 border-b border-gray-800/60 pb-3 flex items-center gap-2">
                                   <UploadCloud size={18} className="text-purple-400" /> Source Media
                              </h3>

                              {!videoSrc ? (
                                   <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full aspect-video border-2 border-dashed border-gray-700 hover:border-purple-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-gray-950/50 transition-all hover:bg-gray-900 group"
                                   >
                                        <div className="w-14 h-14 bg-gray-800 group-hover:bg-purple-500/20 rounded-full flex items-center justify-center mb-4 transition-colors">
                                             <Film size={28} className="text-gray-400 group-hover:text-purple-400" />
                                        </div>
                                        <span className="text-sm font-bold text-white mb-1">Upload Long-Form Video</span>
                                        <span className="text-xs text-gray-500">MP4 or WebM (Runs 100% locally)</span>
                                        <input
                                             type="file"
                                             ref={fileInputRef}
                                             onChange={handleFileUpload}
                                             accept="video/mp4,video/webm"
                                             className="hidden"
                                        />
                                   </div>
                              ) : (
                                   <div className="flex flex-col gap-4">
                                        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-gray-800 shadow-lg">
                                             <video
                                                  ref={videoRef}
                                                  src={videoSrc}
                                                  controls
                                                  className="w-full h-full object-contain"
                                             />
                                        </div>

                                        <div className="flex items-center justify-between bg-gray-950 border border-gray-800 p-3 rounded-xl">
                                             <div className="flex flex-col overflow-hidden pr-4">
                                                  <span className="text-sm font-bold text-gray-300 truncate">{videoFile?.name}</span>
                                                  <span className="text-xs text-gray-500">{(videoFile?.size ? videoFile.size / (1024 * 1024) : 0).toFixed(2)} MB • Ready for Analysis</span>
                                             </div>
                                             <button
                                                  onClick={() => setVideoSrc("")}
                                                  className="text-xs text-rose-400 hover:text-rose-300 font-bold shrink-0"
                                             >
                                                  Remove
                                             </button>
                                        </div>

                                        {!clips.length && !isAnalyzing && (
                                             <button
                                                  onClick={analyzeVideo}
                                                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-600/20"
                                             >
                                                  <Wand2 size={18} /> Find Viral Clips
                                             </button>
                                        )}

                                        {isAnalyzing && (
                                             <div className="bg-gray-950 border border-gray-800 rounded-xl p-5">
                                                  <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                                                       <span className="animate-pulse text-purple-400">Scanning audio spikes & visual hooks...</span>
                                                       <span>{progress}%</span>
                                                  </div>
                                                  <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                                                       <div
                                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-150 ease-out"
                                                            style={{ width: `${progress}%` }}
                                                       />
                                                  </div>
                                             </div>
                                        )}
                                   </div>
                              )}
                         </div>

                    </div>

                    {/* Right Column: Generated Shorts Feed */}
                    <div className="lg:col-span-7 flex flex-col gap-6">

                         <div className="bg-[#0c121e] border border-gray-800 rounded-3xl p-6 shadow-xl min-h-[400px]">
                              <div className="flex items-center justify-between mb-6 border-b border-gray-800/60 pb-3">
                                   <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                        <Smartphone size={18} className="text-pink-400" /> Extracted Shorts
                                   </h3>
                                   <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        {clips.length} {clips.length === 1 ? 'Clip' : 'Clips'} Found
                                   </span>
                              </div>

                              {!clips.length ? (
                                   <div className="flex flex-col items-center justify-center h-64 text-center opacity-50">
                                        <Scissors size={48} className="text-gray-600 mb-4" />
                                        <p className="text-sm text-gray-400 font-medium max-w-sm">
                                             Upload a video and click "Find Viral Clips". The AI will scan the timeline and extract the highest-retention 60-second hooks.
                                        </p>
                                   </div>
                              ) : (
                                   <div className="space-y-4">
                                        {clips.map((clip, index) => (
                                             <div
                                                  key={clip.id}
                                                  className={`flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border transition-all ${activeClipId === clip.id ? "bg-purple-900/10 border-purple-500/50" : "bg-gray-900 border-gray-800 hover:border-gray-700"
                                                       }`}
                                             >
                                                  {/* 9:16 Preview Placeholder */}
                                                  <div className="relative w-full sm:w-28 aspect-[9/16] bg-black rounded-lg border border-gray-800 overflow-hidden shrink-0 flex items-center justify-center group cursor-pointer" onClick={() => handlePlayClip(clip.start, clip.id)}>
                                                       {/* Fake video thumbnail mapping */}
                                                       <div className="absolute inset-0 opacity-40 bg-gradient-to-t from-black via-transparent to-black pointer-events-none z-10" />
                                                       <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=400&q=80" className="absolute inset-0 w-full h-full object-cover blur-sm group-hover:blur-none transition-all" alt="Preview" />
                                                       <Play size={24} className="text-white relative z-20 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all drop-shadow-md" />

                                                       <div className="absolute bottom-2 left-0 right-0 flex justify-center z-20">
                                                            <div className="bg-yellow-400 text-black text-[8px] font-black uppercase px-2 py-0.5 rounded-sm w-[80%] text-center truncate">
                                                                 {clip.transcriptPreview.split(' ')[0]} {clip.transcriptPreview.split(' ')[1]}
                                                            </div>
                                                       </div>
                                                  </div>

                                                  {/* Clip Metadata */}
                                                  <div className="flex flex-col flex-grow py-1">
                                                       <div className="flex items-start justify-between mb-2">
                                                            <div>
                                                                 <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block mb-0.5">Clip #{index + 1}</span>
                                                                 <h4 className="text-white font-bold text-base leading-tight">{clip.title}</h4>
                                                            </div>
                                                            <div className="flex flex-col items-end">
                                                                 <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Hook Score</span>
                                                                 <div className={`px-2 py-0.5 rounded text-xs font-black ${clip.hookScore > 90 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                                      {clip.hookScore}/100
                                                                 </div>
                                                            </div>
                                                       </div>

                                                       <div className="flex items-center gap-4 text-xs font-mono text-gray-400 mb-4 bg-gray-950 border border-gray-800 w-fit px-3 py-1.5 rounded-lg">
                                                            <span className="flex items-center gap-1.5"><Clock size={12} className="text-gray-500" /> {clip.duration}s</span>
                                                            <span className="text-gray-700">|</span>
                                                            <span>{clip.start} - {clip.end}</span>
                                                       </div>

                                                       <div className="flex items-start gap-2 text-xs text-gray-400 italic bg-gray-950/50 p-2.5 rounded-lg border-l-2 border-purple-500 mb-4">
                                                            <MessageSquare size={14} className="text-purple-400 shrink-0 mt-0.5" />
                                                            "{clip.transcriptPreview}..."
                                                       </div>

                                                       <div className="mt-auto flex items-center justify-between">
                                                            <button
                                                                 onClick={() => handlePlayClip(clip.start, clip.id)}
                                                                 className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
                                                            >
                                                                 Preview & Seek
                                                            </button>

                                                            <button
                                                                 onClick={() => copy(`Clip: ${clip.title}\nStart: ${clip.start}\nEnd: ${clip.end}`)}
                                                                 className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
                                                            >
                                                                 {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
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

               {/* Bottom Ad Banner */}
               <AdSlot adSlot="bottom-repurposer-ad" format="fluid" className="mt-4" />

          </div>
     );
}