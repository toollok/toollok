"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
     FilePlus, Upload, Download, RefreshCw, Trash2, ShieldCheck,
     GripVertical, ArrowUp, ArrowDown, Settings2, RotateCw, FileText,
     AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Zap
} from "lucide-react";
import { PDFDocument, degrees } from 'pdf-lib';
import AdSlot from "@/components/ui/AdSlot";

interface PdfFile {
     id: string;
     file: File;
     name: string;
     size: number;
     pageCount: number;
     pageRange: string; // e.g., "1-5, 8"
     rotation: number;  // 0, 90, 180, 270
     isExpanded: boolean;
}

interface MergeStats {
     filesMerged: number;
     totalPages: number;
     originalSize: number;
     outputSize: number;
}

// Utility: Format Bytes
const formatBytes = (bytes: number, decimals = 2) => {
     if (bytes === 0) return '0 Bytes';
     const k = 1024;
     const dm = decimals < 0 ? 0 : decimals;
     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
     const i = Math.floor(Math.log(bytes) / Math.log(k));
     return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Utility: Parse Page Range (e.g., "1-3, 5" -> [0, 1, 2, 4])
const parsePageRange = (rangeStr: string, maxPages: number): number[] => {
     if (!rangeStr || rangeStr.trim() === "") {
          return Array.from({ length: maxPages }, (_, i) => i);
     }

     const pages = new Set<number>();
     const parts = rangeStr.split(',');

     for (const part of parts) {
          const trimmed = part.trim();
          if (trimmed.includes('-')) {
               const [start, end] = trimmed.split('-').map(Number);
               if (!isNaN(start) && !isNaN(end) && start > 0 && end <= maxPages && start <= end) {
                    for (let i = start; i <= end; i++) pages.add(i - 1);
               }
          } else {
               const num = Number(trimmed);
               if (!isNaN(num) && num > 0 && num <= maxPages) {
                    pages.add(num - 1);
               }
          }
     }

     const result = Array.from(pages).sort((a, b) => a - b);
     // Fallback to all pages if range parsing yielded nothing valid
     return result.length > 0 ? result : Array.from({ length: maxPages }, (_, i) => i);
};

export default function MergePdf() {
     const [pdfs, setPdfs] = useState<PdfFile[]>([]);
     const [isProcessing, setIsProcessing] = useState(false);
     const [progressText, setProgressText] = useState("");

     const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
     const [mergeStats, setMergeStats] = useState<MergeStats | null>(null);

     const [customFileName, setCustomFileName] = useState("merged-document");

     const fileInputRef = useRef<HTMLInputElement>(null);
     const dragItem = useRef<number | null>(null);
     const dragOverItem = useRef<number | null>(null);

     // --- UPLOAD & PARSE ---
     const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
          if (!e.target.files) return;
          const files = Array.from(e.target.files);

          setIsProcessing(true);
          setProgressText("Reading PDF documents...");

          const newPdfs: PdfFile[] = [];

          for (const file of files) {
               if (file.type !== "application/pdf") continue;

               try {
                    const arrayBuffer = await file.arrayBuffer();
                    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

                    if (pdfDoc.isEncrypted) {
                         alert(`"${file.name}" is password protected. Please unlock it before merging.`);
                         continue;
                    }

                    newPdfs.push({
                         id: Math.random().toString(36).substring(2, 11),
                         file,
                         name: file.name,
                         size: file.size,
                         pageCount: pdfDoc.getPageCount(),
                         pageRange: "",
                         rotation: 0,
                         isExpanded: false
                    });
               } catch (err) {
                    console.error("Failed to parse PDF:", err);
                    alert(`Failed to read "${file.name}". It may be corrupted.`);
               }
          }

          setPdfs((prev) => [...prev, ...newPdfs]);
          setMergedPdfUrl(null);
          setIsProcessing(false);
          setProgressText("");

          if (fileInputRef.current) fileInputRef.current.value = "";
     };

     // --- DOCUMENT MANAGEMENT ---
     const removePdf = (id: string) => {
          setPdfs((prev) => prev.filter((p) => p.id !== id));
          setMergedPdfUrl(null);
     };

     const clearAll = () => {
          setPdfs([]);
          setMergedPdfUrl(null);
          setMergeStats(null);
     };

     const movePdf = (index: number, direction: 'up' | 'down') => {
          if (direction === 'up' && index === 0) return;
          if (direction === 'down' && index === pdfs.length - 1) return;

          const newPdfs = [...pdfs];
          const swapIndex = direction === 'up' ? index - 1 : index + 1;
          [newPdfs[index], newPdfs[swapIndex]] = [newPdfs[swapIndex], newPdfs[index]];
          setPdfs(newPdfs);
     };

     const updatePdfSetting = (id: string, field: keyof PdfFile, value: any) => {
          setPdfs((prev) => prev.map(pdf => pdf.id === id ? { ...pdf, [field]: value } : pdf));
     };

     const toggleExpand = (id: string) => {
          setPdfs((prev) => prev.map(pdf => pdf.id === id ? { ...pdf, isExpanded: !pdf.isExpanded } : pdf));
     };

     // --- DRAG & DROP REORDERING ---
     const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
          dragItem.current = index;
          e.currentTarget.classList.add('opacity-50');
     };

     const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
          dragOverItem.current = index;
     };

     const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
          e.currentTarget.classList.remove('opacity-50');
          if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
               const newPdfs = [...pdfs];
               const draggedItemContent = newPdfs[dragItem.current];
               newPdfs.splice(dragItem.current, 1);
               newPdfs.splice(dragOverItem.current, 0, draggedItemContent);
               setPdfs(newPdfs);
          }
          dragItem.current = null;
          dragOverItem.current = null;
     };

     // --- MERGE PROCESSING ---
     const handleMerge = async () => {
          if (pdfs.length < 1) return;

          setIsProcessing(true);
          setProgressText("Initializing merge engine...");

          // Yield to main thread to show progress
          await new Promise(r => setTimeout(r, 50));

          try {
               const mergedPdf = await PDFDocument.create();
               let totalPagesAdded = 0;
               let totalOriginalSize = 0;

               for (let i = 0; i < pdfs.length; i++) {
                    const pdfItem = pdfs[i];
                    setProgressText(`Processing document ${i + 1} of ${pdfs.length}...`);
                    await new Promise(r => setTimeout(r, 50)); // Yield

                    totalOriginalSize += pdfItem.size;

                    const arrayBuffer = await pdfItem.file.arrayBuffer();
                    const sourcePdf = await PDFDocument.load(arrayBuffer);

                    const pagesToCopy = parsePageRange(pdfItem.pageRange, pdfItem.pageCount);
                    const copiedPages = await mergedPdf.copyPages(sourcePdf, pagesToCopy);

                    copiedPages.forEach((page) => {
                         if (pdfItem.rotation !== 0) {
                              const currentRotation = page.getRotation().angle;
                              page.setRotation(degrees(currentRotation + pdfItem.rotation));
                         }
                         mergedPdf.addPage(page);
                         totalPagesAdded++;
                    });
               }

               setProgressText("Generating final PDF...");
               await new Promise(r => setTimeout(r, 50));

               const mergedPdfBytes = await mergedPdf.save();
               // Bypassing strict TS buffer union typing with 'as any'
               const blob = new Blob([mergedPdfBytes as any], { type: "application/pdf" });

               const url = URL.createObjectURL(blob);
               setMergedPdfUrl(url);

               setMergeStats({
                    filesMerged: pdfs.length,
                    totalPages: totalPagesAdded,
                    originalSize: totalOriginalSize,
                    outputSize: blob.size
               });

          } catch (error: any) {
               console.error("Error merging PDFs:", error);
               alert("The browser encountered an error while merging the documents. They might be too large, or your device may have run out of memory.");
          } finally {
               setIsProcessing(false);
               setProgressText("");
          }
     };

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 relative px-2 sm:px-4 py-4">

               {/* HEADER SECTION */}
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3.5">
                         <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 shrink-0 shadow-sm">
                              <FilePlus size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                   <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                        Merge PDF Files
                                   </h1>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
                                        <ShieldCheck size={13} className="text-emerald-500" /> 100% Local & Secure
                                   </span>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                   Combine, reorder, and extract specific pages from multiple PDFs securely in your browser.
                              </p>
                         </div>
                    </div>
               </div>

               <AdSlot adSlot="top-pdf-ad" format="horizontal" minHeight="90px" className="hidden md:flex" />

               {/* MAIN WORKSPACE OR RESULT SCREEN */}
               {mergedPdfUrl && mergeStats ? (

                    // --- RESULT SCREEN ---
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-12 shadow-sm dark:shadow-xl flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300 min-h-[400px]">
                         <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-100 dark:border-emerald-500/20">
                              <CheckCircle2 size={40} />
                         </div>

                         <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Merge Complete!</h2>
                         <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-md">Your combined PDF has been generated securely in your browser without any server uploads.</p>

                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl mb-8">
                              <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
                                   <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Files Merged</span>
                                   <span className="text-xl font-bold text-gray-900 dark:text-white">{mergeStats.filesMerged}</span>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
                                   <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Pages</span>
                                   <span className="text-xl font-bold text-gray-900 dark:text-white">{mergeStats.totalPages}</span>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
                                   <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Original Size</span>
                                   <span className="text-xl font-bold text-gray-900 dark:text-white font-mono">{formatBytes(mergeStats.originalSize)}</span>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
                                   <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Output Size</span>
                                   <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{formatBytes(mergeStats.outputSize)}</span>
                              </div>
                         </div>

                         <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
                              <a
                                   href={mergedPdfUrl}
                                   download={`${customFileName || 'merged-document'}.pdf`}
                                   className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-md text-sm"
                              >
                                   <Download size={18} /> Download PDF
                              </a>
                              <button
                                   onClick={() => { setMergedPdfUrl(null); setMergeStats(null); }}
                                   className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-bold px-6 py-3.5 rounded-xl transition-all text-sm"
                              >
                                   <FilePlus size={18} /> Merge More PDFs
                              </button>
                         </div>
                    </div>

               ) : (

                    // --- WORKSPACE SCREEN ---
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">

                         {/* LEFT: WORKSPACE */}
                         <div className="lg:col-span-8 flex flex-col gap-5">
                              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 md:p-6 shadow-sm dark:shadow-xl min-h-[500px] flex flex-col">

                                   <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                             <FileText size={18} className="text-rose-500" /> PDF Documents
                                        </h3>
                                        <div className="flex items-center gap-2">
                                             <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors">
                                                  <Upload size={14} /> Add PDFs
                                             </button>
                                             {pdfs.length > 0 && (
                                                  <button onClick={clearAll} className="flex items-center gap-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-xs font-bold px-3 py-2 rounded-xl transition-colors">
                                                       <Trash2 size={14} /> Clear All
                                                  </button>
                                             )}
                                        </div>
                                        <input type="file" multiple accept="application/pdf" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                                   </div>

                                   {/* Progress Overlay */}
                                   {isProcessing && (
                                        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-3xl">
                                             <RefreshCw size={40} className="animate-spin text-rose-500 mb-4" />
                                             <p className="text-sm font-bold text-gray-900 dark:text-white">{progressText}</p>
                                        </div>
                                   )}

                                   {pdfs.length === 0 && !isProcessing ? (
                                        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-950/50 p-8 text-center min-h-[350px]">
                                             <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mb-4 shadow-sm">
                                                  <Upload size={28} />
                                             </div>
                                             <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">Drag & Drop PDF Files</h4>
                                             <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mb-6">Select multiple documents to organize, reorder pages, and merge securely.</p>
                                             <button onClick={() => fileInputRef.current?.click()} className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-colors text-sm">
                                                  Browse Files
                                             </button>
                                        </div>
                                   ) : (
                                        <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
                                             {pdfs.map((pdf, index) => (
                                                  <div
                                                       key={pdf.id}
                                                       draggable
                                                       onDragStart={(e) => handleDragStart(e, index)}
                                                       onDragEnter={(e) => handleDragEnter(e, index)}
                                                       onDragEnd={handleDragEnd}
                                                       onDragOver={(e) => e.preventDefault()}
                                                       className="flex flex-col bg-gray-50 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-2xl transition-all"
                                                  >
                                                       {/* Document Header Bar */}
                                                       <div className="p-3 flex items-center justify-between cursor-move group">
                                                            <div className="flex items-center gap-3 overflow-hidden">
                                                                 <GripVertical size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-500 shrink-0" />
                                                                 <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                                                                      {index + 1}
                                                                 </div>
                                                                 <div className="flex flex-col overflow-hidden">
                                                                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{pdf.name}</span>
                                                                      <span className="text-[10px] text-gray-500 flex items-center gap-1.5">
                                                                           {formatBytes(pdf.size)} • <span className="text-blue-600 dark:text-blue-400 font-bold">{pdf.pageCount} pages</span>
                                                                      </span>
                                                                 </div>
                                                            </div>

                                                            {/* Controls */}
                                                            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                                                 <div className="hidden sm:flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-0.5">
                                                                      <button onClick={() => movePdf(index, 'up')} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 rounded"><ArrowUp size={14} /></button>
                                                                      <button onClick={() => movePdf(index, 'down')} disabled={index === pdfs.length - 1} className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 rounded"><ArrowDown size={14} /></button>
                                                                 </div>

                                                                 <button
                                                                      onClick={() => toggleExpand(pdf.id)}
                                                                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${pdf.isExpanded ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-500/30' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}
                                                                 >
                                                                      <Settings2 size={14} /> <span className="hidden sm:inline">Edit Pages</span>
                                                                 </button>

                                                                 <button onClick={() => removePdf(pdf.id)} className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors ml-1">
                                                                      <Trash2 size={16} />
                                                                 </button>
                                                            </div>
                                                       </div>

                                                       {/* Expanded Page Organization Area */}
                                                       {pdf.isExpanded && (
                                                            <div className="p-4 pt-2 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 rounded-b-2xl animate-in slide-in-from-top-2">
                                                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                      {/* Page Range Selection */}
                                                                      <div className="flex flex-col gap-1.5">
                                                                           <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex justify-between">
                                                                                <span>Pages to Extract / Keep</span>
                                                                                {pdf.pageRange && <span className="text-blue-500 normal-case font-medium">Custom selection applied</span>}
                                                                           </label>
                                                                           <input
                                                                                type="text"
                                                                                value={pdf.pageRange}
                                                                                onChange={(e) => updatePdfSetting(pdf.id, "pageRange", e.target.value)}
                                                                                placeholder={`e.g., 1-${Math.min(5, pdf.pageCount)}, ${pdf.pageCount}`}
                                                                                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs font-mono text-gray-900 dark:text-white outline-none focus:border-blue-500"
                                                                           />
                                                                           <p className="text-[10px] text-gray-500 leading-tight">Leave blank to keep all pages. Use commas and dashes for ranges.</p>
                                                                      </div>

                                                                      {/* Rotation */}
                                                                      <div className="flex flex-col gap-1.5">
                                                                           <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Rotate Document</label>
                                                                           <div className="flex items-center gap-2">
                                                                                <select
                                                                                     value={pdf.rotation}
                                                                                     onChange={(e) => updatePdfSetting(pdf.id, "rotation", Number(e.target.value))}
                                                                                     className="flex-1 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-gray-900 dark:text-white outline-none cursor-pointer"
                                                                                >
                                                                                     <option value={0}>No Rotation</option>
                                                                                     <option value={90}>Rotate 90° Right</option>
                                                                                     <option value={180}>Rotate 180° Upside Down</option>
                                                                                     <option value={270}>Rotate 90° Left</option>
                                                                                </select>
                                                                                <div className="w-9 h-9 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg shrink-0 text-gray-500 border border-gray-200 dark:border-gray-700" style={{ transform: `rotate(${pdf.rotation}deg)`, transition: 'transform 0.3s ease' }}>
                                                                                     <FileText size={16} />
                                                                                </div>
                                                                           </div>
                                                                      </div>
                                                                 </div>
                                                            </div>
                                                       )}

                                                  </div>
                                             ))}
                                        </div>
                                   )}
                              </div>
                         </div>

                         {/* RIGHT: CONFIGURATION & ACTIONS */}
                         <div className="lg:col-span-4 flex flex-col gap-6 sticky top-6">
                              <div className="bg-[#0c121e] border border-gray-800 rounded-3xl p-6 shadow-xl flex flex-col gap-5 text-white">

                                   <h3 className="font-bold text-base border-b border-gray-800 pb-3 flex items-center gap-2">
                                        <Settings2 size={18} className="text-rose-400" /> Export Settings
                                   </h3>

                                   <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Output Filename</label>
                                        <div className="relative">
                                             <input
                                                  type="text"
                                                  value={customFileName}
                                                  onChange={(e) => setCustomFileName(e.target.value.replace(/\.pdf$/i, ''))}
                                                  placeholder="merged-document"
                                                  className="w-full bg-gray-900 border border-gray-700 focus:border-rose-500/50 rounded-xl pl-3 pr-10 py-2.5 text-sm font-mono text-white outline-none transition-colors"
                                             />
                                             <span className="absolute right-3 top-2.5 text-xs text-gray-500 font-mono">.pdf</span>
                                        </div>
                                   </div>

                                   <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-2.5 mt-2">
                                        <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-emerald-100/70 leading-relaxed">
                                             <strong className="text-emerald-300 block mb-0.5">Zero Data Retention</strong>
                                             Your documents are merged using your browser's local memory. No files are uploaded to our servers, ensuring absolute confidentiality.
                                        </p>
                                   </div>

                                   <button
                                        onClick={handleMerge}
                                        disabled={pdfs.length < 1 || isProcessing}
                                        className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-md mt-2 text-sm"
                                   >
                                        {isProcessing ? <RefreshCw size={18} className="animate-spin" /> : <FilePlus size={18} />}
                                        {isProcessing ? "Processing Merge..." : "Merge PDFs Now"}
                                   </button>

                              </div>
                         </div>
                    </div>
               )}

               {/* ========================================== */}
               {/* EDUCATIONAL & SEO CONTENT */}
               {/* ========================================== */}
               <div className="mt-10 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm flex flex-col gap-8">

                    {/* Intro */}
                    <div>
                         <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-3">
                              Professional PDF Organizer & Merger
                         </h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                              Stop relying on untrustworthy online tools that upload your sensitive legal agreements, tax forms, and invoices to unknown cloud servers. ToolLok’s completely free <strong>PDF Merger</strong> allows you to combine, reorder, and organize your PDF documents strictly within your web browser.
                         </p>
                    </div>

                    {/* Feature Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl">
                              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                                   <Settings2 size={16} className="text-rose-500" /> Advanced Page Extraction
                              </h3>
                              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                   Don't want to merge an entire 50-page document? Click "Edit Pages" on any uploaded file to define an exact page range (e.g., <code>1-5, 8</code>). ToolLok will automatically extract only those pages and merge them into your final output file seamlessly.
                              </p>
                         </div>
                         <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl">
                              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                                   <Zap size={16} className="text-emerald-500" /> Instant Processing
                              </h3>
                              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                   Because the merge engine runs on WebAssembly directly inside your device's memory, you bypass slow upload and download times. Merge hundreds of pages from multiple large PDF files in milliseconds.
                              </p>
                         </div>
                    </div>

                    {/* FAQ Section with Schema */}
                    <div>
                         <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
                         <div className="space-y-3">
                              <div className="bg-gray-50 dark:bg-gray-950/50 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5">Is it safe to merge confidential documents here?</h3>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Yes. ToolLok uses client-side JavaScript execution. This means your PDFs are processed locally by your own computer's processor. No files are ever sent to, stored on, or accessed by our servers.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950/50 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5">Can I remove specific pages while merging?</h3>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Yes! Once you upload a PDF, click the "Edit Pages" button. In the "Pages to Extract / Keep" input, type the exact page numbers you want to include (e.g., <code>1-3, 7</code>). All other pages will be automatically discarded from the final merged file.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950/50 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5">Is there a limit to how many PDFs I can merge?</h3>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">There is no hard limit set by ToolLok. However, because the process relies on your device's RAM (memory), attempting to merge hundreds of extremely large files simultaneously may cause your browser to slow down or crash.</p>
                              </div>
                         </div>
                    </div>

                    {/* Related Tools Internal Linking 
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                         <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Related PDF Tools</span>
                         <div className="flex flex-wrap gap-3">
                              <Link href="/tools/compress-pdf" className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold px-3 py-1.5 rounded-lg transition-colors border border-gray-200 dark:border-gray-700">Compress PDF</Link>
                              <Link href="/tools/split-pdf" className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold px-3 py-1.5 rounded-lg transition-colors border border-gray-200 dark:border-gray-700">Split PDF</Link>
                              <Link href="/tools/pdf-to-word-converter" className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold px-3 py-1.5 rounded-lg transition-colors border border-gray-200 dark:border-gray-700">PDF to Word</Link>
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
                                             "name": "Is it safe to merge confidential documents here?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Yes. ToolLok uses client-side JavaScript execution. This means your PDFs are processed locally by your own computer's processor. No files are ever sent to, stored on, or accessed by our servers." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "Can I remove specific pages while merging?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Yes! Once you upload a PDF, click the 'Edit Pages' button. In the 'Pages to Extract / Keep' input, type the exact page numbers you want to include. All other pages will be automatically discarded." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "Is there a limit to how many PDFs I can merge?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "There is no hard limit set by ToolLok. However, because the process relies on your device's RAM (memory), attempting to merge hundreds of extremely large files simultaneously may cause your browser to slow down." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-pdf-ad" format="fluid" className="mt-4" />
          </div>
     );
}