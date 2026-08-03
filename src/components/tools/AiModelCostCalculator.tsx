"use client";

import { useState, useMemo } from "react";
import { Calculator, DollarSign, Zap, FileText, BarChart3, Database, Clock, Sparkles, Code2, Globe2, Type } from "lucide-react";

// LLM API pricing per 1M tokens & estimated latency benchmarks
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

     // Smart Token Estimator based on payload density
     const tokenMultiplier = payloadType === "text" ? 1.33 : payloadType === "code" ? 1.75 : 2.5;
     const inputWords = sampleText.trim() ? sampleText.trim().split(/\s+/).length : 0;
     const estimatedInputTokens = inputWords > 0 ? Math.ceil(inputWords * tokenMultiplier) : 500;
     const estimatedOutputTokens = Math.ceil(averageOutputWords * tokenMultiplier);

     // Calculate projected costs & performance
     const projections = useMemo(() => {
          return MODELS.map(model => {
               const totalInputTokensMonthly = estimatedInputTokens * monthlyRequests;
               const totalOutputTokensMonthly = estimatedOutputTokens * monthlyRequests;

               const costIn = (totalInputTokensMonthly / 1_000_000) * model.inCost;
               const costOut = (totalOutputTokensMonthly / 1_000_000) * model.outCost;
               const totalCost = costIn + costOut;
               const costPer1k = (totalCost / monthlyRequests) * 1000;

               // Calculate percentage split for the visual bar
               const inputPct = totalCost > 0 ? (costIn / totalCost) * 100 : 50;

               return {
                    ...model,
                    costIn,
                    costOut,
                    totalCost,
                    costPer1k,
                    inputPct
               };
          }).sort((a, b) => {
               if (sortBy === "cost") return (a.totalCost ?? 0) - (b.totalCost ?? 0);
               return (a.latencyMs ?? 0) - (b.latencyMs ?? 0);
          });
     }, [estimatedInputTokens, estimatedOutputTokens, monthlyRequests, sortBy]);

     return (
          <div className="w-full max-w-6xl mx-auto space-y-8">
               <div>
                    <div className="flex items-center gap-3 mb-2">
                         <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                              <Calculator size={20} />
                         </div>
                         <h2 className="text-2xl md:text-3xl font-black text-white">Universal AI Model Cost & Latency Calculator</h2>
                    </div>
                    <p className="text-gray-400 text-sm">Compare real-time pricing per token, analyze input/output cost splits, and estimate latency across top APIs.</p>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* LEFT COLUMN: Controls & Sample Input (Span 5) */}
                    <div className="lg:col-span-5 bg-gray-900/50 border border-gray-800 rounded-3xl p-6 flex flex-col gap-6">

                         {/* Payload Density Selector */}
                         <div className="space-y-3">
                              <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                   <Database size={16} className="text-purple-400" /> Data Payload Type
                              </label>
                              <div className="grid grid-cols-3 gap-2">
                                   <button onClick={() => setPayloadType("text")} className={`py-2 px-2 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1 transition-all border ${payloadType === "text" ? "bg-purple-500/20 border-purple-500/50 text-purple-300" : "bg-gray-950 border-gray-800 text-gray-500 hover:border-gray-700"}`}>
                                        <Type size={14} /> English Text
                                   </button>
                                   <button onClick={() => setPayloadType("code")} className={`py-2 px-2 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1 transition-all border ${payloadType === "code" ? "bg-purple-500/20 border-purple-500/50 text-purple-300" : "bg-gray-950 border-gray-800 text-gray-500 hover:border-gray-700"}`}>
                                        <Code2 size={14} /> Code & JSON
                                   </button>
                                   <button onClick={() => setPayloadType("multilingual")} className={`py-2 px-2 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1 transition-all border ${payloadType === "multilingual" ? "bg-purple-500/20 border-purple-500/50 text-purple-300" : "bg-gray-950 border-gray-800 text-gray-500 hover:border-gray-700"}`}>
                                        <Globe2 size={14} /> Multilingual
                                   </button>
                              </div>
                         </div>

                         {/* Text Input for Token Counting */}
                         <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                   <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                        <FileText size={16} className="text-indigo-400" /> Input Prompt Estimator
                                   </label>
                                   <span className="text-xs font-mono text-indigo-300 bg-indigo-950 px-2.5 py-1 rounded-md border border-indigo-800/50">
                                        ~{estimatedInputTokens} Tokens
                                   </span>
                              </div>
                              <textarea
                                   value={sampleText}
                                   onChange={(e) => setSampleText(e.target.value)}
                                   placeholder="Paste a sample system prompt or document here..."
                                   className="w-full min-h-[90px] bg-gray-950 border border-gray-800 rounded-xl p-4 text-sm text-gray-200 placeholder:text-gray-700 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                              />
                         </div>

                         {/* Sliders */}
                         <div className="space-y-6 pt-4 border-t border-gray-800/50">
                              <div className="space-y-3">
                                   <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                             <BarChart3 size={16} className="text-emerald-400" /> Monthly API Calls
                                        </label>
                                        <span className="text-xs font-bold text-emerald-400">{monthlyRequests.toLocaleString()} / mo</span>
                                   </div>
                                   <input type="range" min="500" max="100000" step="500" value={monthlyRequests} onChange={(e) => setMonthlyRequests(Number(e.target.value))} className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                              </div>

                              <div className="space-y-3">
                                   <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                             <Database size={16} className="text-cyan-400" /> Generated Response Length
                                        </label>
                                        <span className="text-xs font-bold text-cyan-400">~{estimatedOutputTokens} Tokens</span>
                                   </div>
                                   <input type="range" min="50" max="3000" step="50" value={averageOutputWords} onChange={(e) => setAverageOutputWords(Number(e.target.value))} className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                              </div>
                         </div>
                    </div>

                    {/* RIGHT COLUMN: Comparison Dashboard (Span 7) */}
                    <div className="lg:col-span-7 bg-gray-900/50 border border-gray-800 rounded-3xl p-6 flex flex-col gap-4 overflow-hidden">

                         <div className="flex items-center justify-between pb-3 border-b border-gray-800/50">
                              <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                   <DollarSign size={16} className="text-emerald-400" /> Live Model Rankings
                              </h3>

                              <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-xl border border-gray-800">
                                   <button onClick={() => setSortBy("cost")} className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${sortBy === "cost" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}>Cheapest</button>
                                   <button onClick={() => setSortBy("latency")} className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${sortBy === "latency" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}>Fastest</button>
                              </div>
                         </div>

                         <div className="flex-grow overflow-y-auto pr-1 space-y-3">
                              {projections.map((model, index) => (
                                   <div key={model.id} className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${index === 0 ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-gray-950 border-gray-800'}`}>

                                        <div className="flex flex-col gap-2 flex-grow w-full md:w-auto">
                                             <div className="flex items-center justify-between md:justify-start gap-2">
                                                  <div className="flex items-center gap-2">
                                                       <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">{model.provider}</span>
                                                       <span className="text-sm font-bold text-white">{model.name}</span>
                                                  </div>
                                                  {index === 0 && (
                                                       <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                                            <Sparkles size={10} /> Best Choice
                                                       </span>
                                                  )}
                                             </div>

                                             <div className="flex items-center gap-4 text-[11px] text-gray-400 font-mono">
                                                  <span className="flex items-center gap-1"><Clock size={12} className="text-amber-400" /> ~{model.latencyMs}ms TTFT</span>
                                                  <span>•</span>
                                                  <span className="flex items-center gap-1"><Zap size={12} className="text-cyan-400" /> {model.context} Ctx</span>
                                             </div>

                                             {/* Visual Split Cost Bar */}
                                             <div className="w-full max-w-[200px] flex flex-col gap-1 mt-1">
                                                  <div className="flex items-center justify-between text-[8px] uppercase font-bold text-gray-500">
                                                       <span>In</span>
                                                       <span>Out</span>
                                                  </div>
                                                  <div className="w-full bg-gray-800 rounded-full h-1.5 flex overflow-hidden">
                                                       <div className="bg-indigo-400 h-full transition-all" style={{ width: `${model.inputPct}%` }} />
                                                       <div className="bg-cyan-400 h-full transition-all" style={{ width: `${100 - model.inputPct}%` }} />
                                                  </div>
                                             </div>
                                        </div>

                                        <div className="flex flex-col items-end whitespace-nowrap mt-2 md:mt-0">
                                             <span className="text-xl font-black text-indigo-400">
                                                  ${model.totalCost < 0.01 ? "< 0.01" : model.totalCost.toFixed(2)}
                                             </span>
                                             <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">/ Month</span>
                                             <span className="text-[9px] text-emerald-500/70 font-mono mt-1">${model.costPer1k.toFixed(3)} per 1k reqs</span>
                                        </div>

                                   </div>
                              ))}
                         </div>
                    </div>
               </div>
          </div>
     );
}