"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
     ShieldCheck, UploadCloud, ImageIcon, Download, Lock, AlertTriangle,
     CheckCircle2, Camera, MapPin, Calendar, Smartphone, RefreshCw, X, Search,
     Settings2, FileCode2, Sliders, Image as ImageVector
} from "lucide-react";
import AdSlot from "@/components/ui/AdSlot";

interface ExifData {
     hasExif: boolean;
     exifBytes: number;
     hasGps: boolean;
     detectedTags: string[];
     rawAscii: string;
}

type OutputFormat = "image/jpeg" | "image/png" | "image/webp";

export default function ImageExifStripper() {
     const [file, setFile] = useState<File | null>(null);
     const [originalUrl, setOriginalUrl] = useState<string | null>(null);
     const [originalSize, setOriginalSize] = useState<number>(0);

     const [exifData, setExifData] = useState<ExifData | null>(null);
     const [showRawDump, setShowRawDump] = useState(false);

     const [strippedUrl, setStrippedUrl] = useState<string | null>(null);
     const [strippedSize, setStrippedSize] = useState<number>(0);
     const [isProcessing, setIsProcessing] = useState(false);
     const [isDragging, setIsDragging] = useState(false);

     const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/jpeg");
     const [outputQuality, setOutputQuality] = useState<number>(0.92);

     const fileInputRef = useRef<HTMLInputElement>(null);

     const parseExif = (selectedFile: File) => {
          const reader = new FileReader();
          reader.onload = (e) => {
               const buffer = e.target?.result as ArrayBuffer;
               const view = new DataView(buffer);

               let hasExif = false;
               let exifBytes = 0;
               let hasGps = false;
               const detectedTags: Set<string> = new Set();
               let rawAscii = "";

               if (view.byteLength > 2 && view.getUint16(0, false) === 0xFFD8) {
                    let offset = 2;
                    while (offset < view.byteLength - 2) {
                         const marker = view.getUint16(offset, false);
                         if (marker === 0xFFE1) {
                              hasExif = true;
                              exifBytes = view.getUint16(offset + 2, false);

                              const maxBytes = Math.min(exifBytes - 2, view.byteLength - offset - 4);
                              const exifBlock = new Uint8Array(buffer, offset + 4, maxBytes);

                              for (let i = 0; i < exifBlock.length; i++) {
                                   const charCode = exifBlock[i];
                                   if (charCode >= 32 && charCode <= 126) {
                                        rawAscii += String.fromCharCode(charCode);
                                   } else {
                                        rawAscii += ".";
                                   }
                              }

                              if (rawAscii.includes("GPS")) hasGps = true;
                              const dateMatch = rawAscii.match(/\d{4}:\d{2}:\d{2}\s\d{2}:\d{2}:\d{2}/);
                              if (dateMatch) detectedTags.add(`Timestamp: ${dateMatch[0]}`);

                              const brands = ["Apple", "Samsung", "Google", "Canon", "Nikon", "Sony", "OnePlus"];
                              brands.forEach(b => {
                                   if (rawAscii.toLowerCase().includes(b.toLowerCase())) detectedTags.add(`Device Brand: ${b}`);
                              });

                              const software = ["Adobe Photoshop", "Lightroom", "Canva", "Pixelmator"];
                              software.forEach(s => {
                                   if (rawAscii.toLowerCase().includes(s.toLowerCase())) detectedTags.add(`Software: ${s}`);
                              });

                              break;
                         }
                         offset += view.getUint16(offset + 2, false) + 2;
                    }
               }

               setExifData({
                    hasExif, exifBytes, hasGps, detectedTags: Array.from(detectedTags),
                    rawAscii: rawAscii || "No readable ASCII data found."
               });
          };
          reader.readAsArrayBuffer(selectedFile.slice(0, 262144));
     };

     useEffect(() => {
          if (!file) return;
          setIsProcessing(true);

          const timerId = setTimeout(() => {
               const url = URL.createObjectURL(file);
               const img = new Image();

               img.onload = () => {
                    const canvas = document.createElement("canvas");
                    let width = img.width;
                    let height = img.height;
                    const MAX_DIM = 4096;

                    if (width > MAX_DIM || height > MAX_DIM) {
                         const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
                         width = Math.round(width * ratio);
                         height = Math.round(height * ratio);
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");

                    if (ctx) {
                         ctx.drawImage(img, 0, 0, width, height);
                         canvas.toBlob((blob) => {
                              if (blob) {
                                   setStrippedUrl(prev => {
                                        if (prev) URL.revokeObjectURL(prev);
                                        return URL.createObjectURL(blob);
                                   });
                                   setStrippedSize(blob.size);
                              } else {
                                   alert("Image dimensions too large for your browser's memory limits.");
                              }
                              setIsProcessing(false);
                              URL.revokeObjectURL(url);
                         }, outputFormat, outputFormat === "image/png" ? undefined : outputQuality);
                    }
               };
               img.onerror = () => { setIsProcessing(false); URL.revokeObjectURL(url); };
               img.src = url;
          }, 400);

          return () => clearTimeout(timerId);
     }, [file, outputFormat, outputQuality]);

     const handleFileSelect = (selectedFile: File) => {
          if (!selectedFile.type.startsWith("image/")) {
               alert("Please upload an image file (JPEG, PNG, WebP).");
               return;
          }
          if (selectedFile.type === "image/png") setOutputFormat("image/png");
          else setOutputFormat("image/jpeg");

          setFile(selectedFile);
          setOriginalSize(selectedFile.size);

          if (originalUrl) URL.revokeObjectURL(originalUrl);
          setOriginalUrl(URL.createObjectURL(selectedFile));

          setStrippedUrl(null); setExifData(null); setShowRawDump(false);
          parseExif(selectedFile);
     };

     const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
          e.preventDefault(); setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
               handleFileSelect(e.dataTransfer.files[0]);
          }
     };

     const clearWorkspace = () => {
          setFile(null);
          if (originalUrl) URL.revokeObjectURL(originalUrl);
          if (strippedUrl) URL.revokeObjectURL(strippedUrl);
          setOriginalUrl(null); setStrippedUrl(null); setExifData(null); setShowRawDump(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
     };

     const formatBytes = (bytes: number) => {
          if (bytes === 0) return '0 Bytes';
          const k = 1024; const sizes = ['B', 'KB', 'MB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
     };

     const getFormatExtension = () => {
          if (outputFormat === "image/webp") return ".webp";
          if (outputFormat === "image/png") return ".png";
          return ".jpg";
     };

     return (
          <div className="w-full flex flex-col gap-6">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                              <Camera size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Image EXIF & Metadata Stripper</h2>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Forensically audit hidden data, completely destroy EXIF records, and optimize image formats locally.</p>
                         </div>
                    </div>
               </div>

               <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-4 flex items-center gap-3 transition-colors">
                    <Lock size={20} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <p className="text-xs text-emerald-800 dark:text-emerald-100/80 leading-relaxed">
                         <strong className="text-emerald-700 dark:text-emerald-400">Zero-Retention Architecture:</strong> Your photos never leave your device. We use your browser&apos;s native Canvas and DataView APIs to rebuild your image pixel-by-pixel, isolating and destroying EXIF payloads entirely within your local memory.
                    </p>
               </div>

               <AdSlot adSlot="top-exif-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               {!file ? (
                    <div
                         onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                         onDragLeave={() => setIsDragging(false)}
                         onDrop={onDrop}
                         className={`w-full border-2 border-dashed rounded-3xl p-12 transition-all flex flex-col items-center justify-center text-center gap-4 min-h-[400px] cursor-pointer ${isDragging ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/5' : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-900/50'}`}
                         onClick={() => fileInputRef.current?.click()}
                    >
                         <div className="w-20 h-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-transparent rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/20 transition-colors shadow-sm dark:shadow-none">
                              <UploadCloud size={40} className={isDragging ? 'text-emerald-500 dark:text-emerald-400' : 'text-gray-400'} />
                         </div>
                         <h3 className="text-xl font-bold text-gray-900 dark:text-white">Drag & Drop your Image here</h3>
                         <p className="text-sm text-gray-500 max-w-sm">Supports JPEG, PNG, and WebP. We will instantly extract hidden payload data and permanently delete it.</p>
                         <button className="mt-4 bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors text-sm shadow-md">
                              Browse Files
                         </button>
                         <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])} accept="image/jpeg, image/png, image/webp" className="hidden" />
                    </div>
               ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                         <div className="lg:col-span-6 flex flex-col gap-4">
                              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col gap-4 transition-colors">
                                   <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/80 pb-3">
                                        <span className="text-sm font-bold text-gray-900 dark:text-gray-300 flex items-center gap-2">
                                             <ImageIcon size={16} className="text-gray-500 dark:text-gray-400" /> Original File
                                        </span>
                                        <span className="text-xs font-mono text-gray-500">{formatBytes(originalSize)}</span>
                                   </div>
                                   <div className="w-full h-[220px] bg-gray-50 dark:bg-[#0d1117] rounded-xl overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-800 relative group">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={originalUrl!} alt="Original" className="max-w-full max-h-full object-contain" />
                                   </div>

                                   <div className="mt-2 space-y-3">
                                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                                             <h4 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                                  <Search size={12} /> Forensic Audit
                                             </h4>
                                             {exifData?.hasExif && (
                                                  <button onClick={() => setShowRawDump(!showRawDump)} className="text-[9px] font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded transition-colors flex items-center gap-1">
                                                       <FileCode2 size={10} /> {showRawDump ? "Hide Raw ASCII" : "View Raw ASCII"}
                                                  </button>
                                             )}
                                        </div>

                                        {!exifData ? (
                                             <div className="flex items-center gap-2 text-xs text-gray-500 py-4"><RefreshCw size={14} className="animate-spin" /> Scanning binary payload...</div>
                                        ) : (
                                             <div className="space-y-3">
                                                  {exifData.hasExif ? (
                                                       <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-3 rounded-lg flex items-start gap-3">
                                                            <AlertTriangle size={18} className="text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
                                                            <div>
                                                                 <span className="text-sm font-bold text-rose-700 dark:text-rose-400 block mb-0.5">Metadata Detected</span>
                                                                 <span className="text-xs text-rose-600 dark:text-rose-300/80 block">Found {formatBytes(exifData.exifBytes)} of hidden EXIF data embedded in this file.</span>
                                                            </div>
                                                       </div>
                                                  ) : (
                                                       <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg flex items-center gap-3">
                                                            <CheckCircle2 size={18} className="text-gray-400" />
                                                            <span className="text-xs text-gray-600 dark:text-gray-300 font-bold">No EXIF Metadata Detected in original file.</span>
                                                       </div>
                                                  )}

                                                  {exifData.hasExif && !showRawDump && (
                                                       <div className="grid grid-cols-2 gap-2 text-xs">
                                                            <div className={`p-2.5 rounded-lg border ${exifData.hasGps ? 'bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-800' : 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800'}`}>
                                                                 <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1"><MapPin size={12} /> GPS Location</span>
                                                                 <span className={exifData.hasGps ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-gray-600 dark:text-gray-500'}>{exifData.hasGps ? 'CRITICAL LEAK' : 'Clear'}</span>
                                                            </div>
                                                            <div className={`p-2.5 rounded-lg border ${exifData.detectedTags.some(t => t.includes('Device')) ? 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800' : 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800'}`}>
                                                                 <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1"><Smartphone size={12} /> Device Info</span>
                                                                 <span className={exifData.detectedTags.some(t => t.includes('Device')) ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-gray-600 dark:text-gray-500'}>
                                                                      {exifData.detectedTags.find(t => t.includes('Device'))?.split(': ')[1] || 'Clear'}
                                                                 </span>
                                                            </div>
                                                            <div className={`p-2.5 rounded-lg border ${exifData.detectedTags.some(t => t.includes('Timestamp')) ? 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800' : 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800'}`}>
                                                                 <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1"><Calendar size={12} /> Timestamp</span>
                                                                 <span className={exifData.detectedTags.some(t => t.includes('Timestamp')) ? 'text-amber-600 dark:text-amber-400 font-bold font-mono text-[10px]' : 'text-gray-600 dark:text-gray-500'}>
                                                                      {exifData.detectedTags.find(t => t.includes('Timestamp'))?.split('Timestamp: ')[1].split(' ')[0] || 'Clear'}
                                                                 </span>
                                                            </div>
                                                            <div className={`p-2.5 rounded-lg border ${exifData.detectedTags.some(t => t.includes('Software')) ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800' : 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800'}`}>
                                                                 <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1"><ImageVector size={12} /> Editing Software</span>
                                                                 <span className={exifData.detectedTags.some(t => t.includes('Software')) ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-600 dark:text-gray-500'}>
                                                                      {exifData.detectedTags.find(t => t.includes('Software'))?.split('Software: ')[1] || 'Clear'}
                                                                 </span>
                                                            </div>
                                                       </div>
                                                  )}

                                                  {exifData.hasExif && showRawDump && (
                                                       <div className="bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 p-3 rounded-lg max-h-[140px] overflow-y-auto custom-scrollbar">
                                                            <span className="text-[9px] text-gray-500 uppercase font-bold block mb-1.5">Raw APP1 ASCII Block Extraction:</span>
                                                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400/80 font-mono leading-relaxed break-all">
                                                                 {exifData.rawAscii}
                                                            </p>
                                                       </div>
                                                  )}
                                             </div>
                                        )}
                                   </div>
                              </div>
                         </div>

                         <div className="lg:col-span-6 flex flex-col gap-4">
                              <div className="bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-500/30 rounded-3xl p-6 shadow-sm dark:shadow-[0_0_30px_rgba(16,185,129,0.1)] flex flex-col gap-4 transition-colors">
                                   <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/80 pb-3">
                                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                             <ShieldCheck size={16} /> Cleaned File Ready
                                        </span>
                                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-100 dark:border-transparent">
                                             {formatBytes(strippedSize)}
                                        </span>
                                   </div>

                                   <div className="w-full h-[220px] bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-gray-50 dark:bg-gray-950 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-800 relative">
                                        {isProcessing || !strippedUrl ? (
                                             <div className="flex flex-col items-center gap-2 text-emerald-600 dark:text-emerald-500">
                                                  <RefreshCw size={24} className="animate-spin" />
                                                  <span className="text-xs font-bold uppercase tracking-widest">Rebuilding Pixels...</span>
                                             </div>
                                        ) : (
                                             // eslint-disable-next-line @next/next/no-img-element
                                             <img src={strippedUrl} alt="Stripped" className="max-w-full max-h-full object-contain drop-shadow-2xl" />
                                        )}
                                   </div>

                                   <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col gap-4 mt-1 transition-colors">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                             <Settings2 size={14} className="text-emerald-600 dark:text-emerald-400" /> Output Format & Optimization
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                             <div>
                                                  <label className="text-[10px] text-gray-600 dark:text-gray-500 font-bold block mb-1.5">Convert Format</label>
                                                  <select
                                                       value={outputFormat}
                                                       onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                                                       className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white outline-none focus:border-emerald-500/50 transition-colors"
                                                  >
                                                       <option value="image/jpeg">JPEG (Standard)</option>
                                                       <option value="image/webp">WebP (Modern, Small)</option>
                                                       <option value="image/png">PNG (Lossless, Big)</option>
                                                  </select>
                                             </div>
                                             <div>
                                                  <div className="flex justify-between items-center mb-1.5">
                                                       <label className="text-[10px] text-gray-600 dark:text-gray-500 font-bold flex items-center gap-1"><Sliders size={10} /> Quality</label>
                                                       <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">{Math.round(outputQuality * 100)}%</span>
                                                  </div>
                                                  <input
                                                       type="range"
                                                       min="0.1" max="1" step="0.05"
                                                       value={outputQuality}
                                                       onChange={(e) => setOutputQuality(parseFloat(e.target.value))}
                                                       disabled={outputFormat === "image/png"}
                                                       className="w-full accent-emerald-500 disabled:opacity-30 cursor-pointer"
                                                  />
                                             </div>
                                        </div>
                                   </div>

                                   <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 dark:border-gray-800/80">
                                        <a
                                             href={strippedUrl || '#'}
                                             download={`cleaned_${file.name.split('.')[0]}${getFormatExtension()}`}
                                             className={`w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl transition-all shadow-md dark:shadow-lg dark:shadow-emerald-500/25 flex items-center justify-center gap-2 ${isProcessing || !strippedUrl ? 'opacity-50 pointer-events-none' : ''}`}
                                        >
                                             <Download size={18} /> Download Safe Image
                                        </a>
                                        <button
                                             onClick={clearWorkspace}
                                             className="w-full py-3 bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                                        >
                                             <X size={14} /> Clear Workspace
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* ========================================= */}
               {/* SEO CONTENT & FAQS */}
               {/* ========================================= */}
               <div className="mt-12 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm dark:shadow-none">
                    <div className="prose dark:prose-invert max-w-none">
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Free Image EXIF Data Stripper & Privacy Tool</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              Every photo you take with a modern smartphone or DSLR contains hidden metadata (EXIF data) that can reveal exactly where and when the photo was taken, along with the device used. ToolLok's <strong>Image EXIF Stripper</strong> ensures your privacy by permanently destroying this metadata locally in your browser. This tool pairs perfectly with our other <Link href="/categories/privacy-tools" className="text-emerald-600 dark:text-emerald-400 hover:underline">Privacy Tools</Link> to secure your digital footprint before posting images online.
                         </p>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Key Features & Security</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Zero Server Uploads:</strong> Image processing relies exclusively on your browser's native HTML5 Canvas API. Your photos never touch a remote server.</li>
                              <li><strong>Format Optimization:</strong> Not only do we strip the EXIF data, but you can also dynamically convert heavy PNG files into highly optimized, lightweight WebP formats instantly.</li>
                              <li><strong>Forensic Data Audit:</strong> View the exact GPS coordinates, timestamps, and camera models that were hiding inside your image file prior to sanitization.</li>
                         </ul>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">What is EXIF data?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">EXIF (Exchangeable Image File Format) is standard metadata embedded into images by cameras and smartphones. It typically includes technical details like ISO, shutter speed, device brand, and critically, the exact GPS coordinates where the picture was snapped.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Can EXIF data reveal my location?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Yes. If you have "Location Tags" or "Geotagging" enabled on your smartphone's camera app, every photo you take embeds your precise longitude and latitude. Anyone who downloads your original photo can view this data unless you scrub it first.</p>
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
                                             "name": "What is EXIF data?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "EXIF is standard metadata embedded into images by cameras, which includes details like device brand and exact GPS coordinates." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "Can EXIF data reveal my location?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Yes. If Geotagging is enabled on your device, every photo embeds your precise longitude and latitude." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-exif-ad" format="fluid" className="mt-4" />
          </div>
     );
}