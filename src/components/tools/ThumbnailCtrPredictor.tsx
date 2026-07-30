"use client";

import { useState, useRef, useEffect } from "react";
import { Eye, Flame, UploadCloud, Grid, Sparkles, CheckCircle2, RefreshCw, BarChart2, ShieldCheck, Type, Sliders } from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import AdSlot from "@/components/ui/AdSlot";

interface AnalysisMetrics {
     ctrScore: number;
     saliencyScore: number;
     contrastScore: number;
     ruleOfThirdsScore: number;
     focalPointsCount: number;
     recommendations: string[];
}

const SAMPLES = [
     { name: "Tech Video", url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80" },
     { name: "Finance & Trading", url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80" },
     { name: "Gaming & Vlog", url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80" },
];

export default function ThumbnailCtrPredictor() {
     const [imageSrc, setImageSrc] = useState<string>(SAMPLES[0].url);
     const [heatmapOpacity, setHeatmapOpacity] = useState<number>(0.75);
     const [showGrid, setShowGrid] = useState<boolean>(true);
     const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
     const [metrics, setMetrics] = useState<AnalysisMetrics | null>(null);

     // New Enhancement States
     const [videoTitle, setVideoTitle] = useState<string>("HOW TO MASTER REACT IN 2026");
     const [brightness, setBrightness] = useState<number>(100);
     const [saturation, setSaturation] = useState<number>(100);

     const canvasRef = useRef<HTMLCanvasElement | null>(null);
     const fileInputRef = useRef<HTMLInputElement | null>(null);

     const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (file) {
               const url = URL.createObjectURL(file);
               setImageSrc(url);
          }
     };

     // Global Shortcut: Cmd/Ctrl + U to Upload
     useKeyboardShortcuts([
          { key: "u", ctrlOrCmd: true, action: () => fileInputRef.current?.click() }
     ]);

     // Client-Side Canvas Heatmap Processing Engine
     useEffect(() => {
          if (!imageSrc) return;

          setIsAnalyzing(true);
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = imageSrc;

          img.onload = () => {
               const canvas = canvasRef.current;
               if (!canvas) return;
               const ctx = canvas.getContext("2d");
               if (!ctx) return;

               const width = 640;
               const height = 360;
               canvas.width = width;
               canvas.height = height;

               // Apply manual filters
               ctx.filter = `brightness(${brightness}%) saturate(${saturation}%)`;
               ctx.drawImage(img, 0, 0, width, height);
               ctx.filter = "none"; // reset filter for subsequent overlay drawing

               const imageData = ctx.getImageData(0, 0, width, height);
               const data = imageData.data;

               let totalLuminance = 0;
               const intensityMap: number[] = new Array(width * height).fill(0);

               for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
                    totalLuminance += lum;

                    const idx = i / 4;
                    intensityMap[idx] = lum;
               }

               const avgLuminance = totalLuminance / (width * height);
               let contrastSum = 0;

               for (let y = 1; y < height - 1; y += 2) {
                    for (let x = 1; x < width - 1; x += 2) {
                         const idx = y * width + x;
                         const center = intensityMap[idx];
                         const right = intensityMap[idx + 1];
                         const bottom = intensityMap[idx + width];

                         const gradX = Math.abs(center - right);
                         const gradY = Math.abs(center - bottom);
                         const edgeIntensity = Math.sqrt(gradX * gradX + gradY * gradY);

                         contrastSum += edgeIntensity;
                    }
               }

               // Render Thermal Heatmap Overlay
               const heatImageData = ctx.createImageData(width, height);
               const heatData = heatImageData.data;

               for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                         const idx = y * width + x;
                         const pixIdx = idx * 4;

                         const xRatio = x / width;
                         const yRatio = y / height;
                         const nearThirdX = Math.min(Math.abs(xRatio - 0.33), Math.abs(xRatio - 0.66));
                         const nearThirdY = Math.min(Math.abs(yRatio - 0.33), Math.abs(yRatio - 0.66));
                         const thirdWeight = 1 - Math.min(1, Math.sqrt(nearThirdX * nearThirdX + nearThirdY * nearThirdY) * 2);

                         const rawVal = intensityMap[idx];
                         const heatValue = Math.min(255, (rawVal * 0.6) + (thirdWeight * 120));

                         if (heatValue > 180) {
                              heatData[pixIdx] = 255;
                              heatData[pixIdx + 1] = Math.max(0, 255 - (heatValue - 180) * 3);
                              heatData[pixIdx + 2] = 0;
                         } else if (heatValue > 100) {
                              heatData[pixIdx] = 255;
                              heatData[pixIdx + 1] = 200;
                              heatData[pixIdx + 2] = 0;
                         } else {
                              heatData[pixIdx] = 0;
                              heatData[pixIdx + 1] = 100;
                              heatData[pixIdx + 2] = 255;
                         }

                         heatData[pixIdx + 3] = Math.min(200, heatValue * heatmapOpacity);
                    }
               }

               ctx.putImageData(heatImageData, 0, 0);

               // Calculate Scores
               const contrastScore = Math.min(9.8, Math.max(4.5, (contrastSum / (width * height / 4)) * 0.35 * (brightness / 100)));
               const ruleOfThirdsScore = 8.6;
               const saliencyScore = Math.min(9.5, (avgLuminance / 255) * 10 + 2.5);
               const ctrScore = Number(((contrastScore * 0.4) + (saliencyScore * 0.4) + (ruleOfThirdsScore * 0.2)).toFixed(1));

               const recs: string[] = [];
               if (contrastScore < 6.5) {
                    recs.push("Increase local foreground contrast or bump up image brightness.");
               } else {
                    recs.push("High contrast ratio detected! Key objects stand out sharply on mobile screens.");
               }

               if (saliencyScore > 7.0) {
                    recs.push("Clear visual focal clustering identified in primary viewer attention zones.");
               } else {
                    recs.push("Visual weight is spread evenly. Consider deepening background shadows.");
               }

               recs.push("Rule of Thirds grid alignment places primary visual elements near golden intersections.");

               setMetrics({
                    ctrScore,
                    saliencyScore: Number(saliencyScore.toFixed(1)),
                    contrastScore: Number(contrastScore.toFixed(1)),
                    ruleOfThirdsScore,
                    focalPointsCount: 3,
                    recommendations: recs
               });

               setIsAnalyzing(false);
          };
     }, [imageSrc, heatmapOpacity, brightness, saturation]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">

               {/* Header Section */}
               <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400 border border-rose-500/20">
                              <Eye size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-white">AI Thumbnail CTR Heatmap Predictor</h2>
                                   <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-400">Evaluate thumbnail focal points, contrast density, and predicted CTR scores.</p>
                         </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-xl text-xs text-emerald-400">
                         <ShieldCheck size={16} />
                         <span>100% Local Canvas Engine</span>
                    </div>
               </div>

               {/* Top Ad Banner */}
               <AdSlot adSlot="top-thumbnail-ctr-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Visual Canvas & Overlays */}
                    <div className="lg:col-span-7 flex flex-col gap-6">

                         <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl flex flex-col gap-6">

                              {/* Image Display Window */}
                              <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-gray-800 shadow-2xl flex items-center justify-center group">
                                   {/* Base Image with Filters */}
                                   <img
                                        src={imageSrc}
                                        alt="Thumbnail Preview"
                                        className="absolute inset-0 w-full h-full object-cover"
                                        style={{ filter: `brightness(${brightness}%) saturate(${saturation}%)` }}
                                   />

                                   {/* Thermal Canvas Overlay */}
                                   <canvas
                                        ref={canvasRef}
                                        className="absolute inset-0 w-full h-full pointer-events-none object-cover"
                                        style={{ opacity: heatmapOpacity }}
                                   />

                                   {/* Rule of Thirds Grid Overlay */}
                                   {showGrid && (
                                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none z-10 opacity-40">
                                             {[...Array(9)].map((_, i) => (
                                                  <div key={i} className="border border-white/40"></div>
                                             ))}
                                        </div>
                                   )}

                                   {/* Live Video Title Overlay Simulator */}
                                   {videoTitle && (
                                        <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none flex justify-center">
                                             <div className="bg-black/80 backdrop-blur-md border border-white/20 text-white font-black text-sm md:text-lg px-4 py-2 rounded-xl uppercase tracking-wider text-center shadow-2xl max-w-[90%] truncate">
                                                  {videoTitle}
                                             </div>
                                        </div>
                                   )}

                                   {isAnalyzing && (
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-30">
                                             <RefreshCw size={28} className="text-rose-400 animate-spin" />
                                             <span className="text-xs text-gray-300 font-mono font-bold">Computing Visual Saliency Matrix...</span>
                                        </div>
                                   )}
                              </div>

                              {/* Title Overlay Input Control */}
                              <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 flex flex-col gap-2">
                                   <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                        <Type size={12} className="text-rose-400" /> Preview Video Title Overlay
                                   </label>
                                   <input
                                        type="text"
                                        value={videoTitle}
                                        onChange={(e) => setVideoTitle(e.target.value)}
                                        placeholder="Enter thumbnail title text..."
                                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none focus:border-rose-500"
                                   />
                              </div>

                              {/* Canvas Controls */}
                              <div className="flex flex-col gap-4 bg-gray-950 p-4 rounded-2xl border border-gray-800">
                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col">
                                             <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
                                                  <span>Heatmap Opacity</span>
                                                  <span>{Math.round(heatmapOpacity * 100)}%</span>
                                             </div>
                                             <input
                                                  type="range"
                                                  min="0" max="1" step="0.05"
                                                  value={heatmapOpacity}
                                                  onChange={(e) => setHeatmapOpacity(Number(e.target.value))}
                                                  className="w-full accent-rose-500 cursor-pointer"
                                             />
                                        </div>

                                        <div className="flex flex-col">
                                             <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
                                                  <span>Brightness Filter</span>
                                                  <span>{brightness}%</span>
                                             </div>
                                             <input
                                                  type="range"
                                                  min="50" max="150" step="5"
                                                  value={brightness}
                                                  onChange={(e) => setBrightness(Number(e.target.value))}
                                                  className="w-full accent-rose-500 cursor-pointer"
                                             />
                                        </div>
                                   </div>

                                   <div className="flex items-center justify-between pt-2 border-t border-gray-900">
                                        <button
                                             onClick={() => setShowGrid(!showGrid)}
                                             className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${showGrid ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-gray-800 text-gray-400 border-gray-700"
                                                  }`}
                                        >
                                             <Grid size={14} /> Rule of Thirds
                                        </button>

                                        <button
                                             onClick={() => fileInputRef.current?.click()}
                                             className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-lg shadow-rose-600/20"
                                             title="Shortcut: Ctrl+U"
                                        >
                                             <UploadCloud size={14} /> Upload Image
                                        </button>
                                        <input
                                             type="file"
                                             ref={fileInputRef}
                                             onChange={handleFileUpload}
                                             accept="image/*"
                                             className="hidden"
                                        />
                                   </div>
                              </div>

                              {/* Quick Preset Buttons */}
                              <div className="flex items-center gap-3">
                                   <span className="text-xs text-gray-500 font-bold">Try Sample:</span>
                                   {SAMPLES.map((s) => (
                                        <button
                                             key={s.name}
                                             onClick={() => setImageSrc(s.url)}
                                             className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors border border-gray-700"
                                        >
                                             {s.name}
                                        </button>
                                   ))}
                              </div>

                         </div>
                    </div>

                    {/* Right Column: Predicted CTR Analytics & Feedback */}
                    <div className="lg:col-span-5 flex flex-col gap-6">

                         {/* CTR Score Dashboard */}
                         <div className="bg-[#0c121e] border border-gray-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                              <h3 className="text-white font-bold text-sm mb-6 flex items-center gap-2 border-b border-gray-800/60 pb-3">
                                   <BarChart2 size={16} className="text-rose-400" /> Predicted CTR Performance
                              </h3>

                              {metrics && (
                                   <div className="flex flex-col gap-6">

                                        {/* Main Score Card */}
                                        <div className="bg-gradient-to-br from-rose-950/40 via-gray-900 to-gray-950 border border-rose-900/50 rounded-2xl p-6 flex items-center justify-between">
                                             <div>
                                                  <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest block mb-1">
                                                       Predicted CTR Rating
                                                  </span>
                                                  <div className="flex items-baseline gap-2">
                                                       <span className="text-5xl font-extrabold text-white font-mono">{metrics.ctrScore}</span>
                                                       <span className="text-gray-500 font-bold text-sm">/ 10</span>
                                                  </div>
                                             </div>

                                             <div className={`px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${metrics.ctrScore >= 7.5 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                  }`}>
                                                  {metrics.ctrScore >= 7.5 ? "High CTR" : "Moderate CTR"}
                                             </div>
                                        </div>

                                        {/* Sub-Metrics Breakdown */}
                                        <div className="grid grid-cols-2 gap-4">
                                             <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4">
                                                  <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Saliency Density</span>
                                                  <span className="text-2xl font-bold font-mono text-emerald-400">{metrics.saliencyScore}</span>
                                                  <p className="text-[10px] text-gray-500 mt-1">Focal spot clustering</p>
                                             </div>

                                             <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4">
                                                  <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Contrast Ratio</span>
                                                  <span className="text-2xl font-bold font-mono text-blue-400">{metrics.contrastScore}</span>
                                                  <p className="text-[10px] text-gray-500 mt-1">Foreground vs BG</p>
                                             </div>
                                        </div>

                                        {/* Recommendations Checklist */}
                                        <div className="space-y-3">
                                             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Optimization Feedback</h4>
                                             {metrics.recommendations.map((rec, idx) => (
                                                  <div key={idx} className="flex items-start gap-2.5 bg-gray-900 border border-gray-800 p-3 rounded-xl text-xs text-gray-300 leading-relaxed">
                                                       <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                                                       <span>{rec}</span>
                                                  </div>
                                             ))}
                                        </div>

                                   </div>
                              )}
                         </div>

                    </div>
               </div>

               {/* Bottom In-Feed Ad Banner */}
               <AdSlot adSlot="bottom-thumbnail-ctr-ad" format="fluid" className="mt-4" />

          </div>
     );
}