"use client";

import { useState } from "react";
import Link from "next/link";
import { FileJson, Copy, Check, Trash2, Maximize2, Minimize2, AlertCircle, ShieldCheck } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import AdSlot from "@/components/ui/AdSlot";

export default function JsonFormatterValidator() {
     const [input, setInput] = useState<string>("");
     const [output, setOutput] = useState<string>("");
     const [error, setError] = useState<string | null>(null);

     const { isCopied, copy } = useCopyToClipboard(2000);

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
          setInput(""); setOutput(""); setError(null);
     };

     useKeyboardShortcuts([
          { key: "enter", ctrlOrCmd: true, action: handleFormat },
          { key: "m", ctrlOrCmd: true, shift: true, action: handleMinify }
     ]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
               <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                              <FileJson size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">JSON Formatter, Beautifier & Validator</h2>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Format, validate, and minify massive JSON payloads instantly via local client-side WebAssembly logic.</p>
                         </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 shadow-sm dark:shadow-none">
                         <ShieldCheck size={16} />
                         <span>Zero Data Retention</span>
                    </div>
               </div>

               <AdSlot adSlot="top-json-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm dark:shadow-lg transition-colors">
                    <button onClick={handleFormat} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-md dark:shadow-lg dark:shadow-blue-600/20 text-sm" title="Shortcut: Ctrl+Enter">
                         <Maximize2 size={16} /> Beautify (Format)
                    </button>
                    <button onClick={handleMinify} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 transition-all text-sm shadow-sm dark:shadow-none" title="Shortcut: Ctrl+Shift+M">
                         <Minimize2 size={16} /> Minify
                    </button>
                    <div className="flex-grow"></div>
                    <button onClick={handleClear} className="flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-medium px-4 py-2.5 rounded-xl transition-all text-sm">
                         <Trash2 size={16} /> Clear All
                    </button>
               </div>

               {error && (
                    <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl p-4 flex items-start gap-3 text-rose-700 dark:text-rose-400 animate-in fade-in slide-in-from-top-2">
                         <AlertCircle size={20} className="mt-0.5 shrink-0" />
                         <div className="font-mono text-sm leading-relaxed">{error}</div>
                    </div>
               )}

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[550px]">
                    <div className="flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl transition-colors">
                         <div className="px-5 py-3.5 bg-gray-50 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-mono font-bold uppercase tracking-widest">Input.json</span>
                         </div>
                         <textarea
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              placeholder="Paste your unformatted JSON here..."
                              className="flex-grow w-full bg-gray-50 dark:bg-[#080d16] text-gray-900 dark:text-gray-200 font-mono text-sm p-5 outline-none resize-none placeholder:text-gray-400 dark:placeholder:text-gray-700 leading-relaxed custom-scrollbar transition-colors"
                              spellCheck="false"
                         />
                    </div>

                    <div className="flex flex-col bg-gray-50 dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl relative transition-colors">
                         <div className="px-5 py-3.5 bg-white dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-mono font-bold uppercase tracking-widest">Output.json</span>
                              <button onClick={() => copy(output)} disabled={!output} className={`flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg transition-colors font-bold ${output ? "bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200" : "bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-600 cursor-not-allowed"}`}>
                                   {isCopied ? <Check size={14} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={14} />}
                                   {isCopied ? "Copied!" : "Copy Output"}
                              </button>
                         </div>
                         <textarea
                              readOnly
                              value={output}
                              placeholder="Formatted result will appear here..."
                              className="flex-grow w-full bg-transparent text-emerald-600 dark:text-emerald-400 font-mono text-sm p-5 outline-none resize-none placeholder:text-gray-400 dark:placeholder:text-gray-700 leading-relaxed custom-scrollbar"
                              spellCheck="false"
                         />
                    </div>
               </div>

               {/* ========================================= */}
               {/* SEO CONTENT & FAQS */}
               {/* ========================================= */}
               <div className="mt-12 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm dark:shadow-none">
                    <div className="prose dark:prose-invert max-w-none">
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Secure & Fast JSON Formatter & Validator</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              Working with raw JSON data from APIs or databases can be difficult to read and debug. ToolLok's free <strong>JSON Formatter and Validator</strong> instantly parses, indents, and colorizes your JSON payloads. Because our tool relies entirely on local browser execution, your sensitive configuration files and API responses are never uploaded to a server. This makes it an essential utility in any software engineer's <Link href="/categories/developer-tools" className="text-blue-600 dark:text-blue-400 hover:underline">Developer Tools</Link> stack.
                         </p>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Why Developers Choose ToolLok</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Strict Validation:</strong> Catch trailing commas, missing quotes, or syntax errors immediately with precise error line reporting.</li>
                              <li><strong>Minification Mode:</strong> Compress your JSON by removing all whitespace and line breaks, perfectly preparing it for production deployment or API transmission.</li>
                              <li><strong>Lightning Fast Performance:</strong> Capable of handling massive megabyte-sized JSON payloads without lagging your browser tab.</li>
                         </ul>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Is my JSON data sent to a server?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">No. Unlike many online formatters, the ToolLok JSON Validator operates 100% client-side. Your code is processed entirely within your local browser memory, ensuring strict data privacy and zero retention.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">What is the difference between formatting and minifying?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Formatting (Beautifying) adds indentation and line breaks to make the data readable for humans. Minifying removes all unnecessary whitespace to make the payload as small as possible for machine transmission.</p>
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
                                             "name": "Is my JSON data sent to a server?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "No. The ToolLok JSON Validator operates 100% client-side. Your code is processed entirely within your local browser memory." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "What is the difference between formatting and minifying?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Formatting adds indentation to make data human-readable. Minifying removes whitespace to reduce payload size for machine transmission." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-json-ad" format="fluid" className="mt-4" />
          </div>
     );
}