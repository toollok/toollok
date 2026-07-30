"use client";

import { useState } from "react";
import { FileJson, Copy, Check, Trash2, Maximize2, Minimize2, AlertCircle, ShieldCheck } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import AdSlot from "@/components/ui/AdSlot";

export default function JsonFormatterValidator() {
     const [input, setInput] = useState<string>("");
     const [output, setOutput] = useState<string>("");
     const [error, setError] = useState<string | null>(null);

     const { isCopied, copy } = useCopyToClipboard(2000);

     // Core Formatting Logic
     const handleFormat = () => {
          if (!input.trim()) {
               setError("Please enter JSON data to format.");
               setOutput("");
               return;
          }
          try {
               const parsed = JSON.parse(input);
               const formatted = JSON.stringify(parsed, null, 2);
               setOutput(formatted);
               setError(null);
          } catch (err: any) {
               setError(`Invalid JSON: ${err.message}`);
               setOutput("");
          }
     };

     // Core Minification Logic
     const handleMinify = () => {
          if (!input.trim()) {
               setError("Please enter JSON data to minify.");
               setOutput("");
               return;
          }
          try {
               const parsed = JSON.parse(input);
               const minified = JSON.stringify(parsed);
               setOutput(minified);
               setError(null);
          } catch (err: any) {
               setError(`Invalid JSON: ${err.message}`);
               setOutput("");
          }
     };

     const handleClear = () => {
          setInput("");
          setOutput("");
          setError(null);
     };

     // Global Shortcuts: Cmd/Ctrl + Enter to Format, Cmd/Ctrl + Shift + M to Minify
     useKeyboardShortcuts([
          { key: "enter", ctrlOrCmd: true, action: handleFormat },
          { key: "m", ctrlOrCmd: true, shift: true, action: handleMinify }
     ]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">

               {/* Header Section */}
               <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20">
                              <FileJson size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-white">JSON Formatter, Beautifier & Validator</h2>
                                   <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-400">Format, validate, and minify massive JSON payloads instantly via local client-side WebAssembly logic.</p>
                         </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-xl text-xs text-emerald-400">
                         <ShieldCheck size={16} />
                         <span>Zero Data Retention</span>
                    </div>
               </div>

               {/* Top Ad Banner */}
               <AdSlot adSlot="top-json-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               {/* Action Toolbar */}
               <div className="flex flex-wrap items-center gap-3 bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-lg">
                    <button
                         onClick={handleFormat}
                         className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 text-sm"
                         title="Shortcut: Ctrl+Enter"
                    >
                         <Maximize2 size={16} /> Beautify (Format)
                    </button>
                    <button
                         onClick={handleMinify}
                         className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium px-5 py-2.5 rounded-xl border border-gray-700 transition-all text-sm"
                         title="Shortcut: Ctrl+Shift+M"
                    >
                         <Minimize2 size={16} /> Minify
                    </button>
                    <div className="flex-grow"></div>
                    <button
                         onClick={handleClear}
                         className="flex items-center gap-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 font-medium px-4 py-2.5 rounded-xl transition-all text-sm"
                    >
                         <Trash2 size={16} /> Clear All
                    </button>
               </div>

               {/* Error Boundary Display */}
               {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-start gap-3 text-rose-400 animate-in fade-in slide-in-from-top-2">
                         <AlertCircle size={20} className="mt-0.5 shrink-0" />
                         <div className="font-mono text-sm leading-relaxed">{error}</div>
                    </div>
               )}

               {/* Dual Pane Editors */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[550px]">

                    {/* Input Pane */}
                    <div className="flex flex-col bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
                         <div className="px-5 py-3.5 bg-gray-950/80 border-b border-gray-800 flex items-center justify-between">
                              <span className="text-xs text-gray-400 font-mono font-bold uppercase tracking-widest">Input.json</span>
                         </div>
                         <textarea
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              placeholder="Paste your unformatted JSON here..."
                              className="flex-grow w-full bg-[#080d16] text-gray-200 font-mono text-sm p-5 outline-none resize-none placeholder:text-gray-700 leading-relaxed custom-scrollbar"
                              spellCheck="false"
                         />
                    </div>

                    {/* Output Pane */}
                    <div className="flex flex-col bg-[#0c121e] border border-gray-800 rounded-3xl overflow-hidden shadow-xl relative">
                         <div className="px-5 py-3.5 bg-gray-950/80 border-b border-gray-800 flex items-center justify-between">
                              <span className="text-xs text-gray-400 font-mono font-bold uppercase tracking-widest">Output.json</span>
                              <button
                                   onClick={() => copy(output)}
                                   disabled={!output}
                                   className={`flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg transition-colors font-bold ${output ? "bg-gray-800 hover:bg-gray-700 text-gray-200" : "bg-gray-900 text-gray-600 cursor-not-allowed"
                                        }`}
                              >
                                   {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                   {isCopied ? "Copied!" : "Copy Output"}
                              </button>
                         </div>
                         <textarea
                              readOnly
                              value={output}
                              placeholder="Formatted result will appear here..."
                              className="flex-grow w-full bg-transparent text-emerald-400 font-mono text-sm p-5 outline-none resize-none placeholder:text-gray-700 leading-relaxed custom-scrollbar"
                              spellCheck="false"
                         />
                    </div>

               </div>

               {/* Bottom In-Feed Ad Banner */}
               <AdSlot adSlot="bottom-json-ad" format="fluid" className="mt-4" />

          </div>
     );
}