"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import {
     Minimize, Upload, Image as ImageIcon, Download, Settings2, ShieldCheck,
     RefreshCw, Trash2, CheckCircle2, XCircle, FileArchive, SlidersHorizontal,
     SplitSquareHorizontal, AlertCircle, Info, ChevronDown, ChevronUp, Check, Zap
} from "lucide-react";
import JSZip from "jszip";
import AdSlot from "@/components/ui/AdSlot";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

// --- TYPES & INTERFACES ---
type OptimizationMode = "smart" | "maximum" | "balanced" | "high" | "target" | "custom";
type OutputFormat = "original" | "image/jpeg" | "image/webp" | "image/png" | "image/avif";
type ResizeMode = "none" | "width" | "height" | "percentage";

interface ProcessedImage {
     id: string;
     name: string;
     originalFile: File;
     originalSize: number;
     originalUrl: string;
     originalWidth: number;
     originalHeight: number;

     compressedSize: number | null;
     compressedUrl: string | null;
     compressedWidth: number | null;
     compressedHeight: number | null;
     outputFormat: string | null;

     status: "pending" | "processing" | "done" | "error";
     errorMessage?: string;

     sliderPosition: number; // For before/after comparison
}

// --- UTILITY FUNCTIONS ---
const formatBytes = (bytes: number, decimals = 2) => {
     if (bytes === 0) return '0 Bytes';
     const k = 1024;
     const dm = decimals < 0 ? 0 : decimals;
     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
     const i = Math.floor(Math.log(bytes) / Math.log(k));
     return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
     return new Promise((resolve, reject) => {
          const img = new window.Image();
          img.onload = () => resolve({ width: img.width, height: img.height });
          img.onerror = reject;
          img.src = url;
     });
};

export default function ImageCompressor() {
     // --- STATE ---
     const [images, setImages] = useState<ProcessedImage[]>([]);
     const [isProcessingBatch, setIsProcessingBatch] = useState(false);
     const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
     const [showAdvanced, setShowAdvanced] = useState(false);

     // Settings State
     const [optMode, setOptMode] = useState<OptimizationMode>("smart");
     const [targetFormat, setTargetFormat] = useState<OutputFormat>("image/webp");
     const [quality, setQuality] = useState<number>(0.8);
     const [targetSizeKB, setTargetSizeKB] = useState<number>(500);

     // Resize State
     const [resizeMode, setResizeMode] = useState<ResizeMode>("none");
     const [resizeValue, setResizeValue] = useState<number>(1920); // pixels or %

     const fileInputRef = useRef<HTMLInputElement>(null);

     // --- HANDLERS ---
     const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
          if (!e.target.files) return;
          const files = Array.from(e.target.files);

          const newImages: ProcessedImage[] = [];
          for (const file of files) {
               if (!file.type.startsWith("image/")) continue;

               const originalUrl = URL.createObjectURL(file);
               try {
                    const dims = await getImageDimensions(originalUrl);
                    newImages.push({
                         id: Math.random().toString(36).substring(2, 11),
                         name: file.name,
                         originalFile: file,
                         originalSize: file.size,
                         originalUrl,
                         originalWidth: dims.width,
                         originalHeight: dims.height,
                         compressedSize: null,
                         compressedUrl: null,
                         compressedWidth: null,
                         compressedHeight: null,
                         outputFormat: null,
                         status: "pending",
                         sliderPosition: 50,
                    });
               } catch (err) {
                    console.error("Failed to read image dimensions", err);
               }
          }

          setImages((prev) => [...prev, ...newImages]);
          if (fileInputRef.current) fileInputRef.current.value = "";
     };

     const removeImage = (id: string) => {
          setImages((prev) => {
               const img = prev.find(i => i.id === id);
               if (img?.originalUrl) URL.revokeObjectURL(img.originalUrl);
               if (img?.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
               return prev.filter((i) => i.id !== id);
          });
     };

     const clearAll = () => {
          images.forEach(img => {
               if (img.originalUrl) URL.revokeObjectURL(img.originalUrl);
               if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
          });
          setImages([]);
     };

     const handleSliderChange = (id: string, value: number) => {
          setImages(prev => prev.map(img => img.id === id ? { ...img, sliderPosition: value } : img));
     };

     // --- CORE COMPRESSION ENGINE ---
     const processImage = async (img: ProcessedImage): Promise<ProcessedImage> => {
          return new Promise(async (resolve) => {
               try {
                    const imageElement = new window.Image();
                    imageElement.src = img.originalUrl;
                    await new Promise((res) => (imageElement.onload = res));

                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    if (!ctx) throw new Error("Canvas rendering context not supported");

                    // 1. Calculate Resize Dimensions
                    let finalW = img.originalWidth;
                    let finalH = img.originalHeight;

                    if (resizeMode === "width") {
                         finalW = resizeValue;
                         finalH = Math.round(img.originalHeight * (resizeValue / img.originalWidth));
                    } else if (resizeMode === "height") {
                         finalH = resizeValue;
                         finalW = Math.round(img.originalWidth * (resizeValue / img.originalHeight));
                    } else if (resizeMode === "percentage") {
                         finalW = Math.round(img.originalWidth * (resizeValue / 100));
                         finalH = Math.round(img.originalHeight * (resizeValue / 100));
                    }

                    canvas.width = finalW;
                    canvas.height = finalH;

                    // Handle transparency for JPEG
                    const actualFormat = targetFormat === "original" ? img.originalFile.type : targetFormat;
                    if (actualFormat === "image/jpeg") {
                         ctx.fillStyle = "#FFFFFF";
                         ctx.fillRect(0, 0, finalW, finalH);
                    }

                    ctx.drawImage(imageElement, 0, 0, finalW, finalH);

                    // 2. Determine Compression Parameters
                    let finalQuality = quality;
                    if (optMode === "smart") finalQuality = 0.82;
                    if (optMode === "maximum") finalQuality = 0.60;
                    if (optMode === "balanced") finalQuality = 0.75;
                    if (optMode === "high") finalQuality = 0.92;

                    // 3. Iterative Compression for Target Size
                    const compressToBlob = (q: number): Promise<Blob | null> => {
                         return new Promise(r => canvas.toBlob(r, actualFormat, q));
                    };

                    let bestBlob: Blob | null = null;

                    if (optMode === "target" && actualFormat !== "image/png") { // PNG ignores quality parameter mostly
                         let minQ = 0.1, maxQ = 1.0;
                         const targetBytes = targetSizeKB * 1024;

                         for (let i = 0; i < 5; i++) { // Binary search max 5 iterations to avoid freezing
                              const currentQ = (minQ + maxQ) / 2;
                              const blob = await compressToBlob(currentQ);
                              if (!blob) break;

                              bestBlob = blob;
                              if (blob.size > targetBytes) maxQ = currentQ; // Too big, lower quality
                              else minQ = currentQ; // Too small, raise quality
                         }
                    } else {
                         bestBlob = await compressToBlob(finalQuality);
                    }

                    if (!bestBlob) throw new Error("Failed to encode image");

                    resolve({
                         ...img,
                         compressedSize: bestBlob.size,
                         compressedUrl: URL.createObjectURL(bestBlob),
                         compressedWidth: finalW,
                         compressedHeight: finalH,
                         outputFormat: actualFormat,
                         status: "done"
                    });

               } catch (err: any) {
                    resolve({ ...img, status: "error", errorMessage: err.message || "Unknown error" });
               }
          });
     };

     const processBatch = async () => {
          const pending = images.filter(i => i.status !== "done");
          if (pending.length === 0) return;

          setIsProcessingBatch(true);
          setBatchProgress({ current: 0, total: pending.length });

          for (let i = 0; i < pending.length; i++) {
               const img = pending[i];
               setImages(prev => prev.map(p => p.id === img.id ? { ...p, status: "processing" } : p));

               // Artificial short delay to allow UI to render processing state
               await new Promise(r => setTimeout(r, 50));

               const processed = await processImage(img);
               setImages(prev => prev.map(p => p.id === img.id ? processed : p));

               setBatchProgress(prev => ({ ...prev, current: prev.current + 1 }));
          }

          setIsProcessingBatch(false);
     };

     const downloadZip = async () => {
          const doneImages = images.filter(i => i.status === "done" && i.compressedUrl);
          if (doneImages.length === 0) return;

          const zip = new JSZip();

          await Promise.all(doneImages.map(async (img) => {
               const response = await fetch(img.compressedUrl!);
               const blob = await response.blob();
               const ext = img.outputFormat?.split('/')[1] || "jpeg";
               const baseName = img.name.substring(0, img.name.lastIndexOf('.')) || img.name;
               zip.file(`${baseName}-optimized.${ext}`, blob);
          }));

          const content = await zip.generateAsync({ type: "blob" });
          const url = URL.createObjectURL(content);
          const link = document.createElement("a");
          link.href = url;
          link.download = "ToolLok-Optimized-Images.zip";
          link.click();
          URL.revokeObjectURL(url);
     };

     // --- STATS ---
     const stats = useMemo(() => {
          const done = images.filter(i => i.status === "done");
          const totalOriginal = done.reduce((acc, img) => acc + img.originalSize, 0);
          const totalCompressed = done.reduce((acc, img) => acc + (img.compressedSize || 0), 0);
          const totalSaved = Math.max(0, totalOriginal - totalCompressed);
          const avgReduction = totalOriginal > 0 ? (totalSaved / totalOriginal) * 100 : 0;

          return {
               doneCount: done.length,
               totalCount: images.length,
               totalOriginal,
               totalCompressed,
               totalSaved,
               avgReduction
          };
     }, [images]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 relative px-2 sm:px-4 py-4">

               {/* HEADER SECTION */}
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3.5">
                         <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 shrink-0 shadow-sm">
                              <Minimize size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                   <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                        Image Compressor
                                   </h1>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
                                        <ShieldCheck size={13} className="text-emerald-500" /> 100% Local Processing
                                   </span>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                   Professionally compress, resize, and convert JPG, PNG, WebP, and AVIF images securely in your browser.
                              </p>
                         </div>
                    </div>
               </div>

               <AdSlot adSlot="top-image-ad" format="horizontal" minHeight="90px" className="hidden md:flex" />

               {/* MAIN WORKSPACE GRID */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">

                    {/* LEFT COLUMN: SETTINGS PANEL */}
                    <div className="lg:col-span-4 flex flex-col gap-6 sticky top-6">
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl flex flex-col gap-5 transition-colors">
                              <h3 className="text-gray-900 dark:text-white font-bold text-base border-b border-gray-100 dark:border-gray-800/60 pb-3 flex items-center gap-2">
                                   <Settings2 size={18} className="text-blue-600 dark:text-blue-400" /> Optimization Settings
                              </h3>

                              {/* Mode Selection */}
                              <div className="flex flex-col gap-2">
                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Compression Mode</label>
                                   <select value={optMode} onChange={(e) => setOptMode(e.target.value as OptimizationMode)} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-900 dark:text-white outline-none cursor-pointer">
                                        <option value="smart">Smart Optimize (Recommended)</option>
                                        <option value="maximum">Maximum Compression (Smallest)</option>
                                        <option value="balanced">Balanced (Size / Quality)</option>
                                        <option value="high">High Quality (Lossless-like)</option>
                                        <option value="target">Target File Size</option>
                                        <option value="custom">Custom Quality</option>
                                   </select>
                              </div>

                              {/* Target Size Input */}
                              {optMode === "target" && (
                                   <div className="flex flex-col gap-2 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
                                        <label className="text-xs font-bold text-blue-800 dark:text-blue-300">Target Size (KB)</label>
                                        <input type="number" min="10" step="50" value={targetSizeKB} onChange={(e) => setTargetSizeKB(Number(e.target.value) || 500)} className="w-full bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-500/30 rounded-lg px-3 py-2 text-sm font-mono text-gray-900 dark:text-white outline-none" />
                                        <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1">ToolLok will iteratively compress to get as close to {targetSizeKB}KB as mathematically possible.</p>
                                   </div>
                              )}

                              {/* Custom Quality Input */}
                              {optMode === "custom" && (
                                   <div className="flex flex-col gap-2">
                                        <div className="flex justify-between">
                                             <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Quality</label>
                                             <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{Math.round(quality * 100)}%</span>
                                        </div>
                                        <input type="range" min="0.1" max="1" step="0.05" value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} className="w-full accent-blue-600 cursor-pointer" />
                                   </div>
                              )}

                              {/* Output Format */}
                              <div className="flex flex-col gap-2 pt-1">
                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Output Format</label>
                                   <select value={targetFormat} onChange={(e) => setTargetFormat(e.target.value as OutputFormat)} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white outline-none cursor-pointer">
                                        <option value="original">Keep Original</option>
                                        <option value="image/webp">WebP (Best for Web)</option>
                                        <option value="image/avif">AVIF (Next-Gen)</option>
                                        <option value="image/jpeg">JPEG (Photographs)</option>
                                        <option value="image/png">PNG (Preserves Transparency)</option>
                                   </select>
                              </div>

                              {/* Advanced Toggle */}
                              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                                   <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center justify-between w-full text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                        <span className="flex items-center gap-1.5"><SlidersHorizontal size={14} /> Advanced Features (Resizing & Privacy)</span>
                                        {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                   </button>

                                   {showAdvanced && (
                                        <div className="flex flex-col gap-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                             {/* Resizing */}
                                             <div className="flex flex-col gap-2 bg-gray-50 dark:bg-gray-950/50 p-3 rounded-xl border border-gray-200 dark:border-gray-800">
                                                  <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Image Resizing</label>
                                                  <select value={resizeMode} onChange={(e) => setResizeMode(e.target.value as ResizeMode)} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-xs text-gray-900 dark:text-white outline-none">
                                                       <option value="none">Do not resize</option>
                                                       <option value="width">Resize Width (Keep Aspect)</option>
                                                       <option value="height">Resize Height (Keep Aspect)</option>
                                                       <option value="percentage">Scale Percentage</option>
                                                  </select>
                                                  {resizeMode !== "none" && (
                                                       <div className="flex items-center gap-2 mt-1">
                                                            <input type="number" value={resizeValue} onChange={(e) => setResizeValue(Number(e.target.value) || 0)} className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-xs font-mono text-gray-900 dark:text-white outline-none" />
                                                            <span className="text-xs text-gray-500 font-bold">{resizeMode === "percentage" ? "%" : "px"}</span>
                                                       </div>
                                                  )}
                                             </div>

                                             {/* Metadata Notice */}
                                             <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                                                  <Info size={16} className="shrink-0 mt-0.5" />
                                                  <p className="text-[10px] leading-relaxed">
                                                       <strong>Privacy Protected:</strong> Browser canvas compression natively strips EXIF metadata, GPS coordinates, and camera info automatically during the process.
                                                  </p>
                                             </div>
                                        </div>
                                   )}
                              </div>

                              {/* Action Button */}
                              <button
                                   onClick={processBatch}
                                   disabled={images.length === 0 || isProcessingBatch || images.filter(i => i.status !== "done").length === 0}
                                   className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-200 disabled:dark:bg-gray-800 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm mt-2"
                              >
                                   {isProcessingBatch ? <RefreshCw size={18} className="animate-spin" /> : <Zap size={18} />}
                                   {isProcessingBatch ? `Optimizing (${batchProgress.current}/${batchProgress.total})...` : "Optimize Images"}
                              </button>
                         </div>
                    </div>

                    {/* RIGHT COLUMN: WORKSPACE & RESULTS */}
                    <div className="lg:col-span-8 flex flex-col gap-6">

                         {/* Stats Bar */}
                         {stats.totalCount > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0c121e] border border-gray-800 rounded-3xl p-4 shadow-xl text-white">
                                   <div className="bg-gray-900/80 rounded-2xl p-3 text-center border border-gray-800/50">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Queue</span>
                                        <span className="text-xl font-black font-mono text-blue-400">{stats.doneCount}<span className="text-gray-600 text-sm">/{stats.totalCount}</span></span>
                                   </div>
                                   <div className="bg-gray-900/80 rounded-2xl p-3 text-center border border-gray-800/50">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Original</span>
                                        <span className="text-xl font-black font-mono text-gray-300">{formatBytes(stats.totalOriginal)}</span>
                                   </div>
                                   <div className="bg-gray-900/80 rounded-2xl p-3 text-center border border-gray-800/50">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Optimized</span>
                                        <span className="text-xl font-black font-mono text-emerald-400">{formatBytes(stats.totalCompressed)}</span>
                                   </div>
                                   <div className="bg-gray-900/80 rounded-2xl p-3 text-center border border-gray-800/50">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Reduced</span>
                                        <span className="text-xl font-black font-mono text-rose-400">{stats.avgReduction.toFixed(1)}%</span>
                                   </div>
                              </div>
                         )}

                         {/* Main Workspace Area */}
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl min-h-[450px] flex flex-col">

                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-200 dark:border-gray-800">
                                   <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <ImageIcon size={18} className="text-blue-500" /> Optimization Workspace
                                   </h3>
                                   <div className="flex items-center gap-2 flex-wrap">
                                        <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors">
                                             <Upload size={14} /> Add Files
                                        </button>
                                        {stats.doneCount > 0 && (
                                             <button onClick={downloadZip} className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-sm">
                                                  <FileArchive size={14} /> Download ZIP
                                             </button>
                                        )}
                                        {images.length > 0 && (
                                             <button onClick={clearAll} className="flex items-center gap-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-xs font-bold px-3 py-2 rounded-xl transition-colors">
                                                  <Trash2 size={14} /> Clear
                                             </button>
                                        )}
                                   </div>
                                   <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                              </div>

                              {images.length === 0 ? (
                                   <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-950/50 p-8 text-center min-h-[300px]">
                                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mb-4 shadow-sm">
                                             <Upload size={28} />
                                        </div>
                                        <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">Drag & Drop Images</h4>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mb-6">Supports bulk JPG, PNG, and WebP optimization right here in your browser.</p>
                                        <button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-colors text-sm">
                                             Browse Files
                                        </button>
                                   </div>
                              ) : (
                                   <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-1">
                                        {images.map((img) => (
                                             <div key={img.id} className={`border rounded-2xl p-4 flex flex-col gap-4 transition-colors ${img.status === 'done' ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/30' : 'bg-gray-50 dark:bg-gray-950/50 border-gray-200 dark:border-gray-800'}`}>

                                                  {/* Header: Name & Controls */}
                                                  <div className="flex items-start justify-between gap-3">
                                                       <div className="flex items-center gap-2 overflow-hidden">
                                                            {img.status === "done" ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> : img.status === "error" ? <XCircle size={16} className="text-rose-500 shrink-0" /> : <ImageIcon size={16} className="text-gray-400 shrink-0" />}
                                                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{img.name}</p>
                                                       </div>
                                                       <div className="flex items-center gap-2 shrink-0">
                                                            {img.status === "done" && img.compressedUrl && (
                                                                 <a href={img.compressedUrl} download={`${img.name.split('.')[0]}-optimized.${img.outputFormat?.split('/')[1]}`} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 p-1.5 rounded-lg transition-colors shadow-sm" title="Download Image">
                                                                      <Download size={14} />
                                                                 </a>
                                                            )}
                                                            <button onClick={() => removeImage(img.id)} className="text-gray-400 hover:text-rose-500 p-1.5 transition-colors bg-white dark:bg-gray-800 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 rounded-lg">
                                                                 <Trash2 size={14} />
                                                            </button>
                                                       </div>
                                                  </div>

                                                  {/* Body: Comparison & Data */}
                                                  <div className="flex flex-col sm:flex-row gap-4 items-center">

                                                       {/* Interactive Before/After Visualizer */}
                                                       {img.status === "done" && img.compressedUrl ? (
                                                            <div className="relative w-full sm:w-48 h-32 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/H6sBgwMwTIKw2PGAUDMgIARvBQAJpQofw2I/XAAAAABJRU5ErkJggg==')] rounded-xl overflow-hidden shadow-inner border border-gray-200 dark:border-gray-800 shrink-0">
                                                                 {/* Original Base Image */}
                                                                 <img src={img.originalUrl} className="absolute inset-0 w-full h-full object-contain pointer-events-none" alt="Original" />

                                                                 {/* Compressed Overlay with Clip Path */}
                                                                 <img
                                                                      src={img.compressedUrl}
                                                                      className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                                                                      style={{ clipPath: `inset(0 ${100 - img.sliderPosition}% 0 0)` }}
                                                                      alt="Compressed"
                                                                 />

                                                                 {/* Draggable Slider */}
                                                                 <div className="absolute inset-0 z-10 opacity-0 hover:opacity-100 transition-opacity">
                                                                      <input
                                                                           type="range"
                                                                           min="0" max="100"
                                                                           value={img.sliderPosition}
                                                                           onChange={(e) => handleSliderChange(img.id, Number(e.target.value))}
                                                                           className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                                                                      />
                                                                      <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_5px_rgba(0,0,0,0.5)] z-10 pointer-events-none" style={{ left: `${img.sliderPosition}%` }}>
                                                                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
                                                                                <SplitSquareHorizontal size={14} className="text-blue-500" />
                                                                           </div>
                                                                      </div>
                                                                 </div>

                                                                 {/* Labels */}
                                                                 <div className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-sm text-white text-[8px] font-bold px-1.5 py-0.5 rounded">Optimized</div>
                                                                 <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm text-white text-[8px] font-bold px-1.5 py-0.5 rounded">Original</div>
                                                            </div>
                                                       ) : (
                                                            <div className="w-full sm:w-48 h-32 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0">
                                                                 {img.status === "processing" ? <RefreshCw size={24} className="animate-spin text-blue-500" /> : <img src={img.originalUrl} className="w-full h-full object-contain opacity-50" />}
                                                            </div>
                                                       )}

                                                       {/* Technical Info Grid */}
                                                       <div className="flex-1 w-full grid grid-cols-2 gap-3 text-xs">
                                                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-2.5">
                                                                 <span className="block text-[9px] font-bold text-gray-400 uppercase mb-0.5">Original</span>
                                                                 <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{formatBytes(img.originalSize)}</span>
                                                                 <span className="block text-[10px] text-gray-500 mt-0.5">{img.originalWidth} × {img.originalHeight}</span>
                                                            </div>

                                                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-2.5">
                                                                 <span className="block text-[9px] font-bold text-gray-400 uppercase mb-0.5">Optimized {img.outputFormat && `(${img.outputFormat.split('/')[1].toUpperCase()})`}</span>
                                                                 {img.status === "done" && img.compressedSize ? (
                                                                      <>
                                                                           <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatBytes(img.compressedSize)}</span>
                                                                           <span className="block text-[10px] text-emerald-600/70 mt-0.5">-{Math.round((1 - img.compressedSize / img.originalSize) * 100)}% ({img.compressedWidth} × {img.compressedHeight})</span>
                                                                      </>
                                                                 ) : (
                                                                      <span className="font-mono text-gray-400">Waiting...</span>
                                                                 )}
                                                            </div>

                                                            {img.status === "error" && (
                                                                 <div className="col-span-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 p-2 rounded-lg text-[10px] flex items-center gap-1.5 border border-rose-200 dark:border-rose-500/20">
                                                                      <AlertCircle size={12} /> {img.errorMessage}
                                                                 </div>
                                                            )}
                                                       </div>
                                                  </div>

                                             </div>
                                        ))}
                                   </div>
                              )}
                         </div>
                    </div>
               </div>

               {/* ========================================== */}
               {/* EDUCATIONAL & SEO CONTENT */}
               {/* ========================================== */}
               <div className="mt-10 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm flex flex-col gap-8">

                    {/* Intro */}
                    <div>
                         <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-3">
                              Professional Image Compressor & Optimizer
                         </h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                              ToolLok’s completely free <strong>Image Compressor</strong> provides agency-grade photo optimization without the expensive software subscriptions. Utilizing advanced HTML5 Canvas processing, you can drastically reduce the file size of your JPG, PNG, WebP, and AVIF images directly inside your web browser.
                         </p>
                    </div>

                    {/* Feature Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl">
                              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                                   <ShieldCheck size={16} className="text-emerald-500" /> Absolute Privacy & Security
                              </h3>
                              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                   Most online image tools upload your personal photographs and corporate assets to remote servers. This tool processes every pixel locally on your device. Zero uploads. Zero data harvesting. Browser-native compression also naturally strips hidden EXIF data, including GPS coordinates.
                              </p>
                         </div>
                         <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl">
                              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                                   <Settings2 size={16} className="text-blue-500" /> Target File Size & Next-Gen Formats
                              </h3>
                              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                   Need an image to be exactly under 500KB for a government portal or website? Use the <strong>Target File Size</strong> mode, and the compressor will iteratively calculate the exact quality ratio needed. Easily convert outdated JPEGs into next-gen WebP or AVIF formats for superior Google Lighthouse scores.
                              </p>
                         </div>
                    </div>

                    {/* FAQ Section with Schema */}
                    <div>
                         <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
                         <div className="space-y-3">
                              <div className="bg-gray-50 dark:bg-gray-950/50 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5">How much can an image be compressed?</h3>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Depending on the original format and the complexity of the image, files can often be reduced by 70% to 90% with virtually no noticeable loss in visual quality, especially when converting from JPG to WebP.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950/50 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5">Are my uploaded photos safe?</h3>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Yes. Because ToolLok processes data locally using your device's memory, your photos are never transmitted over the internet or saved to external databases.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950/50 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5">Can I resize multiple images at once?</h3>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Yes! Open the "Advanced Features" dropdown in the settings panel to set a fixed width, height, or percentage scale. This will apply to all images in your current batch queue.</p>
                              </div>
                         </div>
                    </div>

                    {/* Related Tools Internal Linking 
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                         <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Related Tools</span>
                         <div className="flex flex-wrap gap-3">
                              <Link href="/tools/image-resizer" className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold px-3 py-1.5 rounded-lg transition-colors border border-gray-200 dark:border-gray-700">Image Resizer</Link>
                              <Link href="/tools/image-format-converter" className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold px-3 py-1.5 rounded-lg transition-colors border border-gray-200 dark:border-gray-700">Format Converter</Link>
                              <Link href="/tools/ai-background-remover" className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold px-3 py-1.5 rounded-lg transition-colors border border-gray-200 dark:border-gray-700">Background Remover</Link>
                         </div>
                    </div>*/}

                    <script
                         type="application/ld+json"
                         dangerouslySetInnerHTML={{
                              __html: JSON.stringify({
                                   "@context": "https://schema.org",
                                   "@type": "FAQPage",
                                   "mainEntity": [
                                        {
                                             "@type": "Question",
                                             "name": "How much can an image be compressed?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Files can often be reduced by 70% to 90% with virtually no noticeable loss in visual quality, especially when converting from JPG to WebP." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "Are my uploaded photos safe?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Yes. Because ToolLok processes data locally using your device's memory, your photos are never transmitted over the internet or saved to external databases." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "Can I resize multiple images at once?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Yes! Open the 'Advanced Features' dropdown in the settings panel to set a fixed width, height, or percentage scale. This will apply to all images in your current batch queue." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-image-ad" format="fluid" className="mt-4" />
          </div>
     );
}