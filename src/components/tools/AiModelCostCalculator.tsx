"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Calculator, DollarSign, Zap, FileText, BarChart3, Database, Clock, Sparkles, Code2, Globe2, Type } from "lucide-react";

const MODELS = [
     { id: "gpt-4o", provider: "OpenAI", name: "GPT-4o", inCost: 5.00, outCost: 15.00, latencyMs: 380, speedCategory: "Fast", context: "128k" },
     { id: "gpt-4o-mini", provider: "OpenAI", name: "GPT-4o Mini", inCost: 0.15, outCost: 0.60, latencyMs: 190, speedCategory: "Ultra-Fast", context: "128k" },
     { id: "claude-3-5-sonnet", provider: "Anthropic", name: "Claude 3.5 Sonnet", inCost: 3.00, outCost: 15.00, latencyMs: 420, speedCategory: "Fast", context: "200k" },
     { id: "claude-3-haiku", provider: "Anthropic", name: "Claude 3 Haiku", inCost: 0.25, outCost: 1.25, speedCategory: "Ultra-Fast", context: "200k" },
     { id: "gemini-1-5-pro", provider: "Google", name: "Gemini 1.5 Pro", inCost: 3.50, outCost: 10.50, latencyMs: 450, speedCategory: "Fast", context: "2M+" },
     { id: "gemini-1-5-flash", provider: "Google", name: "Gemini 1.5 Flash", inCost: 0.35, outCost: 1.05, speedCategory: "Ultra-Fast", context: "1M" },
];

export default function AiModelCostCalculator() {
     const [sampleText, setSampleText] = useState("");
     const [monthlyRequests, setMonthlyRequests] = useState(5000);
     const [averageOutputWords, setAverageOutputWords] = useState(400);
     const [sortBy, setSortBy] = useState<"cost" | "latency">("cost");
     const [payloadType, setPayloadType] = useState<"text" | "code" | "multilingual">("text");

     const tokenMultiplier = payloadType === "text" ? 1.33 : payloadType === "code" ? 1.75 : 2.5;
     const inputWords = sampleText.trim() ? sampleText.trim().split(/\s+/).length : 0;
     const estimatedInputTokens = inputWords > 0 ? Math.ceil(inputWords * tokenMultiplier) : 500;
     const estimatedOutputTokens = Math.ceil(averageOutputWords * tokenMultiplier);

     const projections = useMemo(() => {
          return MODELS.map(model => {
               const totalInputTokensMonthly = estimatedInputTokens * monthlyRequests;
               const totalOutputTokensMonthly = estimatedOutputTokens * monthlyRequests;
               const costIn = (totalInputTokensMonthly / 1_000_000) * model.inCost;
               const costOut = (totalOutputTokensMonthly / 1_000_000) * model.outCost;
               const totalCost = costIn + costOut;
               const costPer1k = (totalCost / monthlyRequests) * 1000;
               const inputPct = totalCost > 0 ? (costIn / totalCost) * 100 : 50;

               return { ...model, costIn, costOut, totalCost, costPer1k, inputPct };
          }).sort((a, b) => {
               if (sortBy === "cost") return (a.totalCost ?? 0) - (b.totalCost ?? 0);
               return (a.latencyMs ?? 0) - (b.latencyMs ?? 0);
          });
     }, [estimatedInputTokens, estimatedOutputTokens, monthlyRequests, sortBy]);

     return (
          <div className="w-full max-w-6xl mx-auto space-y-8">
               <div>
                    <div className="flex items-center gap-3 mb-2">
                         <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                              <Calculator size={20} />
                         </div>
                         <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Universal AI Model Cost & Latency Calculator</h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Compare real-time pricing per token, analyze input/output cost splits, and estimate latency across top APIs.</p>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 flex flex-col gap-6 shadow-sm dark:shadow-none">
                         <div className="space-y-3">
                              <label className="text-sm font-bold text-gray-900 dark:text-gray-300 flex items-center gap-2">
                                   <Database size={16} className="text-purple-600 dark:text-purple-400" /> Data Payload Type
                              </label>
                              <div className="grid grid-cols-3 gap-2">
                                   <button onClick={() => setPayloadType("text")} className={`py-2 px-2 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1 transition-all border ${payloadType === "text" ? "bg-purple-50 dark:bg-purple-500/20 border-purple-200 dark:border-purple-500/50 text-purple-700 dark:text-purple-300" : "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-500 hover:border-gray-300 dark:hover:border-gray-700"}`}>
                                        <Type size={14} /> English Text
                                   </button>
                                   <button onClick={() => setPayloadType("code")} className={`py-2 px-2 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1 transition-all border ${payloadType === "code" ? "bg-purple-50 dark:bg-purple-500/20 border-purple-200 dark:border-purple-500/50 text-purple-700 dark:text-purple-300" : "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-500 hover:border-gray-300 dark:hover:border-gray-700"}`}>
                                        <Code2 size={14} /> Code & JSON
                                   </button>
                                   <button onClick={() => setPayloadType("multilingual")} className={`py-2 px-2 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1 transition-all border ${payloadType === "multilingual" ? "bg-purple-50 dark:bg-purple-500/20 border-purple-200 dark:border-purple-500/50 text-purple-700 dark:text-purple-300" : "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-500 hover:border-gray-300 dark:hover:border-gray-700"}`}>
                                        <Globe2 size={14} /> Multilingual
                                   </button>
                              </div>
                         </div>

                         <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                   <label className="text-sm font-bold text-gray-900 dark:text-gray-300 flex items-center gap-2">
                                        <FileText size={16} className="text-indigo-600 dark:text-indigo-400" /> Input Prompt Estimator
                                   </label>
                                   <span className="text-xs font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800/50">
                                        ~{estimatedInputTokens} Tokens
                                   </span>
                              </div>
                              <textarea
                                   value={sampleText}
                                   onChange={(e) => setSampleText(e.target.value)}
                                   placeholder="Paste a sample system prompt or document here..."
                                   className="w-full min-h-[90px] bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-sm text-gray-900 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-700 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                              />
                         </div>

                         <div className="space-y-6 pt-4 border-t border-gray-100 dark:border-gray-800/50">
                              <div className="space-y-3">
                                   <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-gray-900 dark:text-gray-300 flex items-center gap-2">
                                             <BarChart3 size={16} className="text-emerald-600 dark:text-emerald-400" /> Monthly API Calls
                                        </label>
                                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{monthlyRequests.toLocaleString()} / mo</span>
                                   </div>
                                   <input type="range" min="500" max="100000" step="500" value={monthlyRequests} onChange={(e) => setMonthlyRequests(Number(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                              </div>
                              <div className="space-y-3">
                                   <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-gray-900 dark:text-gray-300 flex items-center gap-2">
                                             <Database size={16} className="text-cyan-600 dark:text-cyan-400" /> Generated Response Length
                                        </label>
                                        <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">~{estimatedOutputTokens} Tokens</span>
                                   </div>
                                   <input type="range" min="50" max="3000" step="50" value={averageOutputWords} onChange={(e) => setAverageOutputWords(Number(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                              </div>
                         </div>
                    </div>

                    <div className="lg:col-span-7 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 flex flex-col gap-4 overflow-hidden shadow-sm dark:shadow-none">
                         <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800/50">
                              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-300 flex items-center gap-2">
                                   <DollarSign size={16} className="text-emerald-600 dark:text-emerald-400" /> Live Model Rankings
                              </h3>
                              <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-950 p-1 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <button onClick={() => setSortBy("cost")} className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${sortBy === "cost" ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>Cheapest</button>
                                   <button onClick={() => setSortBy("latency")} className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${sortBy === "latency" ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>Fastest</button>
                              </div>
                         </div>

                         <div className="flex-grow overflow-y-auto pr-1 space-y-3">
                              {projections.map((model, index) => (
                                   <div key={model.id} className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${index === 0 ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30' : 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800'}`}>
                                        <div className="flex flex-col gap-2 flex-grow w-full md:w-auto">
                                             <div className="flex items-center justify-between md:justify-start gap-2">
                                                  <div className="flex items-center gap-2">
                                                       <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">{model.provider}</span>
                                                       <span className="text-sm font-bold text-gray-900 dark:text-white">{model.name}</span>
                                                  </div>
                                                  {index === 0 && (
                                                       <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
                                                            <Sparkles size={10} /> Best Choice
                                                       </span>
                                                  )}
                                             </div>
                                             <div className="flex items-center gap-4 text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                                                  <span className="flex items-center gap-1"><Clock size={12} className="text-amber-500 dark:text-amber-400" /> ~{model.latencyMs}ms TTFT</span>
                                                  <span>•</span>
                                                  <span className="flex items-center gap-1"><Zap size={12} className="text-cyan-600 dark:text-cyan-400" /> {model.context} Ctx</span>
                                             </div>
                                             <div className="w-full max-w-[200px] flex flex-col gap-1 mt-1">
                                                  <div className="flex items-center justify-between text-[8px] uppercase font-bold text-gray-500">
                                                       <span>In</span>
                                                       <span>Out</span>
                                                  </div>
                                                  <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 flex overflow-hidden">
                                                       <div className="bg-indigo-500 dark:bg-indigo-400 h-full transition-all" style={{ width: `${model.inputPct}%` }} />
                                                       <div className="bg-cyan-500 dark:bg-cyan-400 h-full transition-all" style={{ width: `${100 - model.inputPct}%` }} />
                                                  </div>
                                             </div>
                                        </div>
                                        <div className="flex flex-col items-end whitespace-nowrap mt-2 md:mt-0">
                                             <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                                                  ${model.totalCost < 0.01 ? "< 0.01" : model.totalCost.toFixed(2)}
                                             </span>
                                             <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">/ Month</span>
                                             <span className="text-[9px] text-emerald-600 dark:text-emerald-500/70 font-mono mt-1">${model.costPer1k.toFixed(3)} per 1k reqs</span>
                                        </div>
                                   </div>
                              ))}
                         </div>
                    </div>
               </div>

               {/* ========================================= */}
               {/* SEO CONTENT & FAQS */}
               {/* ========================================= */}
               <div className="mt-12 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm dark:shadow-none">
                    <div className="prose dark:prose-invert max-w-none">
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Calculate AI Model API Costs</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              Managing API expenses is crucial for developers integrating Large Language Models (LLMs) into their applications. The <strong>AI Model Cost Calculator</strong> by <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline">ToolLok</Link> allows you to accurately estimate your monthly spend across top providers like OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet), and Google (Gemini 1.5 Pro). By inputting your payload density and expected monthly volume, you can instantly find the cheapest and fastest LLM for your specific use case.
                         </p>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Key Features & Benefits</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Smart Token Estimation:</strong> Automatically calculates token counts based on payload type (English text vs. Code vs. Multilingual) ensuring accurate cost projections.</li>
                              <li><strong>Live Latency Benchmarks:</strong> Compare Time-to-First-Token (TTFT) metrics to choose ultra-fast models for real-time applications.</li>
                              <li><strong>Input vs. Output Splits:</strong> Visualizes exactly where your budget is going, helping you optimize prompt engineering to reduce costs.</li>
                         </ul>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Why do output tokens cost more than input tokens?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Generating text (output) requires significantly more computational power and GPU memory bandwidth than reading and processing text (input). This is why providers typically charge 2x to 3x more for generated tokens.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Which AI model is the cheapest for bulk data processing?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">As of current pricing, models like GPT-4o Mini and Claude 3 Haiku are the most cost-effective for high-volume tasks, often costing less than $1.00 per million tokens while maintaining ultra-fast latency.</p>
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
                                             "name": "Why do output tokens cost more than input tokens?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Generating text requires significantly more computational power and GPU memory bandwidth than reading text. Providers typically charge 2x to 3x more for generated tokens." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "Which AI model is the cheapest for bulk data processing?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Models like GPT-4o Mini and Claude 3 Haiku are the most cost-effective for high-volume tasks, often costing less than $1.00 per million tokens." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>
          </div>
     );
}