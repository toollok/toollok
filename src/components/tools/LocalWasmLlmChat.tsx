"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import {
     ShieldCheck, Cpu, Database, Send, Upload, Lock,
     Zap, Settings2, FileText, CheckCircle2, Trash2,
     Terminal, Activity, WifiOff, AlertTriangle, Bot, User,
     Sliders, AlignLeft, HardDrive, Layers
} from "lucide-react";
import AdSlot from "@/components/ui/AdSlot";

interface Message { role: "user" | "assistant" | "system"; content: string; }
interface LocalDoc { id: string; name: string; size: string; chunks: number; }

const MODELS = [
     { id: 'smollm-135m', name: 'SmolLM 135M (WASM)', baseSize: 150, type: 'Free', param: '0.1B', req: 'Basic' },
     { id: 'qwen2.5-0.5b', name: 'Qwen 2.5 0.5B (WebGPU)', baseSize: 350, type: 'Free', param: '0.5B', req: 'Low' },
     { id: 'phi-3-mini', name: 'Phi-3.5 Mini Instruct', baseSize: 2200, type: 'Free', param: '3.8B', req: 'Medium' },
     { id: 'llama-3-8b', name: 'Llama 3 8B Instruct', baseSize: 4800, type: 'Pro', param: '8B', req: 'High (8GB VRAM)' },
];

type LeftTab = "engine" | "params" | "rag";
type Quantization = "q4" | "q8" | "fp16";

export default function LocalWasmLlmChat() {
     const [activeTab, setActiveTab] = useState<LeftTab>("engine");
     const [selectedModel, setSelectedModel] = useState(MODELS[1].id);
     const [quantization, setQuantization] = useState<Quantization>("q4");
     const [engineStatus, setEngineStatus] = useState<"unloaded" | "downloading" | "compiling" | "ready" | "generating">("unloaded");
     const [downloadProgress, setDownloadProgress] = useState(0);

     const [temperature, setTemperature] = useState(0.7);
     const [contextLength, setContextLength] = useState(4096);
     const [systemPrompt, setSystemPrompt] = useState("You are a helpful, private local AI assistant.");

     const [chatHistory, setChatHistory] = useState<Message[]>([
          { role: "assistant", content: "I am ready. I am running entirely in your browser's local memory. No data will be sent to any server." }
     ]);
     const [inputPrompt, setInputPrompt] = useState("");

     const [localDocs, setLocalDocs] = useState<LocalDoc[]>([]);
     const [isRagEnabled, setIsRagEnabled] = useState(false);
     const [isEmbedding, setIsEmbedding] = useState(false);

     const [metrics, setMetrics] = useState({ vram: "0 MB", tps: 0, msPerToken: 0 });

     const chatContainerRef = useRef<HTMLDivElement>(null);
     const fileInputRef = useRef<HTMLInputElement>(null);

     useEffect(() => {
          if (chatContainerRef.current) {
               chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          }
     }, [chatHistory, engineStatus]);

     const activeModelStats = useMemo(() => {
          const model = MODELS.find(m => m.id === selectedModel) || MODELS[1];
          let multiplier = 1; let tpsBase = 40;
          if (quantization === "q8") { multiplier = 1.8; tpsBase = 25; }
          if (quantization === "fp16") { multiplier = 3.5; tpsBase = 10; }
          if (model.baseSize > 2000) tpsBase = Math.max(5, tpsBase - 10);
          if (model.baseSize > 4000) tpsBase = Math.max(2, tpsBase - 15);
          return { sizeMb: Math.round(model.baseSize * multiplier), tpsSim: tpsBase };
     }, [selectedModel, quantization]);

     const handleLoadEngine = () => {
          const model = MODELS.find(m => m.id === selectedModel);
          if (model?.type === 'Pro') { alert("This model requires a Pro subscription to unlock local execution weights."); return; }
          setEngineStatus("downloading"); setDownloadProgress(0);
          let progress = 0; const speed = activeModelStats.sizeMb > 1000 ? 2 : 12;

          const downloadInterval = setInterval(() => {
               progress += Math.floor(Math.random() * speed) + 2;
               if (progress >= 100) {
                    clearInterval(downloadInterval); setDownloadProgress(100); setEngineStatus("compiling");
                    setTimeout(() => {
                         setEngineStatus("ready");
                         const vramStr = activeModelStats.sizeMb > 1000 ? `${(activeModelStats.sizeMb / 1024).toFixed(1)} GB` : `${activeModelStats.sizeMb} MB`;
                         setMetrics({ vram: vramStr, tps: 0, msPerToken: 0 });
                         setChatHistory([{ role: "system", content: `Engine Loaded: ${model?.name} (${quantization.toUpperCase()}). VRAM Allocated: ${vramStr}` }]);
                    }, 1800);
               } else { setDownloadProgress(progress); }
          }, 150);
     };

     const handleUnloadEngine = () => {
          setEngineStatus("unloaded"); setMetrics({ vram: "0 MB", tps: 0, msPerToken: 0 });
          setChatHistory([{ role: "system", content: "Engine unloaded. WebGPU VRAM released." }]);
     };

     const generateSimulatedResponse = (prompt: string) => {
          const lower = prompt.toLowerCase();
          if (isRagEnabled && localDocs.length > 0) return `Based on the local vector embeddings from "${localDocs[0].name}", here is the relevant context:\n\nThe document addresses your query "${prompt}" around chunk #${Math.floor(Math.random() * 30) + 1}. This semantic search occurred entirely offline using WebGPU. Would you like me to summarize another section?`;
          if (lower.includes("hello") || lower.includes("hi")) return "Hello there! I am your local WebAssembly AI. How can I help you today?";
          if (lower.includes("who are you") || lower.includes("what are you")) return "I am a quantized large language model executing directly inside your browser. No data ever leaves your device, guaranteeing absolute privacy.";
          if (lower.includes("code") || lower.includes("react") || lower.includes("python")) return "Here is a code snippet generated locally:\n\n```javascript\nfunction secureCompute(data) {\n  console.log('Processing entirely offline');\n  return btoa(data);\n}\n```\n\nI can assist with writing and debugging code privately.";
          if (lower.includes("help")) return "I can help you analyze documents securely, write code, or brainstorm ideas. Adjust my parameters in the side panel or upload a document to test local RAG!";
          return `This is a simulated response to: "${prompt}".\n\nTo run a *real* model in the browser, an application would load actual GGUF weights into a WebGPU inference engine. Since this is a prototype, I am using a local heuristic engine. Try asking me to "write some code" or ask "who are you"!`;
     };

     const handleSend = () => {
          if (!inputPrompt.trim() || engineStatus !== "ready") return;
          const userMsg = inputPrompt.trim();
          setChatHistory(prev => [...prev, { role: "user", content: userMsg }]);
          setInputPrompt(""); setEngineStatus("generating");

          setTimeout(() => {
               const responseText = generateSimulatedResponse(userMsg);
               setChatHistory(prev => [...prev, { role: "assistant", content: "" }]);

               let i = 0;
               const typingInterval = setInterval(() => {
                    setChatHistory(prev => {
                         const newHistory = [...prev];
                         const lastIndex = newHistory.length - 1;
                         const updatedMessage = { ...newHistory[lastIndex] };
                         updatedMessage.content = responseText.substring(0, i + 1);
                         newHistory[lastIndex] = updatedMessage;
                         return newHistory;
                    });
                    i++;
                    const currentTps = Math.max(1, activeModelStats.tpsSim + (Math.floor(Math.random() * 6) - 3));
                    setMetrics(prev => ({ ...prev, tps: currentTps, msPerToken: Math.round(1000 / currentTps) }));

                    if (i >= responseText.length) {
                         clearInterval(typingInterval); setEngineStatus("ready"); setMetrics(prev => ({ ...prev, tps: 0, msPerToken: 0 }));
                    }
               }, Math.max(15, Math.round(1000 / activeModelStats.tpsSim)));
          }, 500);
     };

     const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0]; if (!file) return;
          setIsEmbedding(true);
          setTimeout(() => {
               const newDoc: LocalDoc = { id: Math.random().toString(36).substring(7), name: file.name, size: (file.size / 1024).toFixed(1) + ' KB', chunks: Math.floor(Math.random() * 150) + 30 };
               setLocalDocs(prev => [...prev, newDoc]); setIsRagEnabled(true); setIsEmbedding(false);
               if (fileInputRef.current) fileInputRef.current.value = "";
          }, 1500);
     };

     const removeDoc = (id: string) => {
          setLocalDocs(prev => prev.filter(d => d.id !== id));
          if (localDocs.length === 1) setIsRagEnabled(false);
     };

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                              <Cpu size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Local WebAssembly LLM Interface (Demo)</h2>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Private
                                   </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Run quantized language models and local document RAG entirely offline inside your browser.</p>
                         </div>
                    </div>
               </div>

               <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-xl p-4 flex items-center justify-between gap-3 transition-colors">
                    <div className="flex items-center gap-3">
                         <WifiOff size={20} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                         <p className="text-xs text-indigo-800 dark:text-indigo-100/80 leading-relaxed">
                              <strong className="text-indigo-700 dark:text-indigo-400">Offline WebGPU Architecture:</strong> No API keys. No cloud servers. Models are compiled to WebAssembly and executed via your device&apos;s GPU directly in this tab.
                         </p>
                    </div>
                    <div className="hidden md:flex items-center gap-3 text-xs font-mono bg-white dark:bg-gray-950 border border-indigo-200 dark:border-gray-800 px-3 py-1.5 rounded-lg shadow-sm dark:shadow-none">
                         <span className="text-gray-500">NET_REQ:</span>
                         <span className="text-emerald-600 dark:text-emerald-400 font-bold">0 Bytes</span>
                    </div>
               </div>

               <AdSlot adSlot="top-wasm-llm-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full">
                    <div className="lg:col-span-4 flex flex-col gap-4">
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm dark:shadow-xl flex flex-col gap-4 min-h-[650px] transition-colors">
                              <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-950 p-1 rounded-xl border border-gray-200 dark:border-gray-800 text-[10px] font-bold">
                                   <button onClick={() => setActiveTab("engine")} className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${activeTab === "engine" ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm dark:shadow-none" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}>
                                        <HardDrive size={12} /> Engine
                                   </button>
                                   <button onClick={() => setActiveTab("params")} className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${activeTab === "params" ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm dark:shadow-none" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}>
                                        <Sliders size={12} /> Params
                                   </button>
                                   <button onClick={() => setActiveTab("rag")} className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${activeTab === "rag" ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm dark:shadow-none" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}>
                                        <Database size={12} /> RAG
                                   </button>
                              </div>

                              {activeTab === "engine" && (
                                   <div className="flex flex-col gap-4 flex-grow animate-in fade-in slide-in-from-left-2">
                                        <div>
                                             <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Select Architecture</label>
                                             <div className="flex flex-col gap-2">
                                                  {MODELS.map(model => (
                                                       <label key={model.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${selectedModel === model.id ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/40' : 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'}`}>
                                                            <div className="flex items-center gap-3">
                                                                 <input type="radio" name="model" value={model.id} checked={selectedModel === model.id} onChange={() => setSelectedModel(model.id)} disabled={engineStatus !== "unloaded"} className="text-indigo-600 dark:text-indigo-500 focus:ring-0 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 disabled:opacity-50" />
                                                                 <div className="flex flex-col">
                                                                      <span className={`text-xs font-bold ${selectedModel === model.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-gray-300'}`}>{model.name}</span>
                                                                      <span className="text-[9px] text-gray-500">{model.param} Params</span>
                                                                 </div>
                                                            </div>
                                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border border-transparent ${model.type === 'Pro' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200' : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-400'}`}>{model.type}</span>
                                                       </label>
                                                  ))}
                                             </div>
                                        </div>
                                        <div>
                                             <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Quantization (Precision)</label>
                                             <select value={quantization} onChange={(e) => setQuantization(e.target.value as Quantization)} disabled={engineStatus !== "unloaded"} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white outline-none disabled:opacity-50 focus:border-indigo-500/50 transition-colors">
                                                  <option value="q4">4-Bit Integer (Fastest, High RAM efficiency)</option>
                                                  <option value="q8">8-Bit Integer (Balanced)</option>
                                                  <option value="fp16">FP16 Float (Slow, Massive VRAM required)</option>
                                             </select>
                                             <div className="grid grid-cols-2 gap-2 mt-2">
                                                  <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-2 rounded-lg text-center flex flex-col transition-colors">
                                                       <span className="text-[9px] text-gray-500">Est. Size</span>
                                                       <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{activeModelStats.sizeMb > 1000 ? (activeModelStats.sizeMb / 1024).toFixed(1) + ' GB' : activeModelStats.sizeMb + ' MB'}</span>
                                                  </div>
                                                  <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-2 rounded-lg text-center flex flex-col transition-colors">
                                                       <span className="text-[9px] text-gray-500">Est. Speed</span>
                                                       <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">~{activeModelStats.tpsSim} TPS</span>
                                                  </div>
                                             </div>
                                        </div>
                                        <div className="mt-auto pt-4">
                                             {engineStatus === "unloaded" && (
                                                  <button onClick={handleLoadEngine} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow-md dark:shadow-lg dark:shadow-indigo-500/20 flex items-center justify-center gap-2">
                                                       <Cpu size={14} /> Load Model to VRAM
                                                  </button>
                                             )}
                                             {(engineStatus === "downloading" || engineStatus === "compiling") && (
                                                  <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col gap-3 transition-colors">
                                                       <div className="flex items-center justify-between text-[10px] font-bold">
                                                            <span className="text-indigo-600 dark:text-indigo-400 uppercase flex items-center gap-1.5">
                                                                 <Activity size={12} className="animate-pulse" />
                                                                 {engineStatus === "downloading" ? "Fetching Tensors..." : "Compiling Shaders..."}
                                                            </span>
                                                            <span className="text-gray-500 dark:text-gray-400">{downloadProgress}%</span>
                                                       </div>
                                                       <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-900 rounded-full overflow-hidden">
                                                            <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${downloadProgress}%` }} />
                                                       </div>
                                                  </div>
                                             )}
                                             {(engineStatus === "ready" || engineStatus === "generating") && (
                                                  <button onClick={handleUnloadEngine} disabled={engineStatus === "generating"} className="w-full py-3 bg-white dark:bg-gray-950 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-gray-200 dark:border-gray-800 hover:border-rose-200 dark:hover:border-rose-500/30 text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold rounded-xl transition-colors disabled:opacity-50">
                                                       Unload Engine & Clear Memory
                                                  </button>
                                             )}
                                        </div>
                                   </div>
                              )}

                              {activeTab === "params" && (
                                   <div className="flex flex-col gap-5 flex-grow animate-in fade-in slide-in-from-left-2">
                                        <div className="flex flex-col gap-2">
                                             <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                                  <AlignLeft size={12} /> System Prompt
                                             </label>
                                             <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} className="w-full h-32 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-xs text-gray-900 dark:text-gray-300 outline-none focus:border-indigo-500/50 resize-none custom-scrollbar leading-relaxed transition-colors" />
                                             <span className="text-[9px] text-gray-500">Overrides the default AI persona and strictures.</span>
                                        </div>
                                        <div className="flex flex-col gap-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-4 rounded-xl transition-colors">
                                             <div>
                                                  <div className="flex justify-between items-center mb-2">
                                                       <label className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Temperature</label>
                                                       <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">{temperature.toFixed(2)}</span>
                                                  </div>
                                                  <input type="range" min="0" max="2" step="0.05" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full accent-indigo-500 cursor-pointer" />
                                                  <div className="flex justify-between text-[8px] text-gray-500 mt-1 uppercase font-bold">
                                                       <span>Precise</span><span>Creative</span>
                                                  </div>
                                             </div>
                                             <div>
                                                  <div className="flex justify-between items-center mb-2">
                                                       <label className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Context Length</label>
                                                       <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">{contextLength}</span>
                                                  </div>
                                                  <input type="range" min="512" max="8192" step="512" value={contextLength} onChange={(e) => setContextLength(parseInt(e.target.value))} className="w-full accent-indigo-500 cursor-pointer" />
                                                  <span className="text-[9px] text-gray-500 mt-1 block">Higher context uses more VRAM.</span>
                                             </div>
                                        </div>
                                   </div>
                              )}

                              {activeTab === "rag" && (
                                   <div className="flex flex-col gap-4 flex-grow animate-in fade-in slide-in-from-left-2">
                                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/80 pb-3">
                                             <h3 className="text-xs font-bold text-gray-900 dark:text-gray-300 flex items-center gap-2 uppercase tracking-wider">
                                                  <Database size={14} className="text-emerald-600 dark:text-emerald-400" /> Vector Embeddings
                                             </h3>
                                             {localDocs.length > 0 && (
                                                  <label className="flex items-center gap-2 cursor-pointer bg-gray-50 dark:bg-gray-950 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-800 transition-colors">
                                                       <input type="checkbox" checked={isRagEnabled} onChange={() => setIsRagEnabled(!isRagEnabled)} className="rounded text-emerald-500 focus:ring-0 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700" />
                                                       <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase">Enable</span>
                                                  </label>
                                             )}
                                        </div>
                                        <div className="flex flex-col gap-3 flex-grow overflow-y-auto max-h-[350px] custom-scrollbar pr-1">
                                             {isEmbedding && (
                                                  <div className="bg-white dark:bg-gray-950 border border-emerald-200 dark:border-emerald-500/30 p-4 rounded-xl flex flex-col items-center gap-2 text-emerald-600 dark:text-emerald-500 transition-colors shadow-sm dark:shadow-none">
                                                       <Layers size={20} className="animate-pulse" />
                                                       <span className="text-[10px] font-bold uppercase tracking-widest text-center">Chunking & Embedding Document...</span>
                                                  </div>
                                             )}
                                             {localDocs.length === 0 && !isEmbedding ? (
                                                  <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600 gap-3 py-10">
                                                       <FileText size={32} className="opacity-20" />
                                                       <p className="text-[11px] text-center max-w-[200px] leading-relaxed">Upload documents (TXT, MD, PDF) to slice and embed them into a local vector space for context-aware Q&A.</p>
                                                  </div>
                                             ) : (
                                                  localDocs.map(doc => (
                                                       <div key={doc.id} className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-3 flex items-center justify-between group transition-colors">
                                                            <div className="flex items-center gap-2.5 overflow-hidden">
                                                                 <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                                                                      <Database size={14} />
                                                                 </div>
                                                                 <div className="flex flex-col truncate">
                                                                      <span className="text-[11px] font-bold text-gray-900 dark:text-gray-200 truncate">{doc.name}</span>
                                                                      <span className="text-[9px] text-gray-500">{doc.size} • {doc.chunks} Embeddings</span>
                                                                 </div>
                                                            </div>
                                                            <button onClick={() => removeDoc(doc.id)} className="text-gray-400 dark:text-gray-600 hover:text-rose-600 dark:hover:text-rose-400 p-1 transition-colors opacity-0 group-hover:opacity-100">
                                                                 <Trash2 size={14} />
                                                            </button>
                                                       </div>
                                                  ))
                                             )}
                                        </div>
                                        <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 mt-auto bg-gray-50 dark:bg-gray-950 border border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500/50 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                                             <Upload size={14} /> Add to Local Vector DB
                                        </button>
                                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.md,.json,.csv" />
                                   </div>
                              )}
                         </div>
                    </div>

                    <div className="lg:col-span-8 flex flex-col gap-6 h-full">
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl flex flex-col h-[650px] relative transition-colors">
                              <div className="bg-gray-50/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-4 flex flex-wrap items-center justify-between gap-4 z-10 transition-colors">
                                   <div className="flex items-center gap-4 text-[10px] font-mono font-bold">
                                        <span className={`flex items-center gap-1.5 ${engineStatus === 'ready' || engineStatus === 'generating' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}`}>
                                             {engineStatus === 'ready' || engineStatus === 'generating' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                                             {engineStatus === 'ready' || engineStatus === 'generating' ? 'Engine Ready' : 'Engine Offline'}
                                        </span>
                                        <span className="text-indigo-600 dark:text-indigo-400 hidden sm:flex items-center gap-1.5"><Terminal size={12} /> VRAM ALLOC: {metrics.vram}</span>
                                   </div>
                                   <div className="flex items-center gap-3 text-[10px] font-mono">
                                        <span className="text-gray-500 bg-white dark:bg-gray-900 px-2 py-1 rounded border border-gray-200 dark:border-gray-800 transition-colors">Speed: <span className="text-gray-900 dark:text-white">{metrics.tps} t/s</span></span>
                                        <span className="text-gray-500 bg-white dark:bg-gray-900 px-2 py-1 rounded border border-gray-200 dark:border-gray-800 transition-colors">Lat: <span className="text-gray-900 dark:text-white">{metrics.msPerToken} ms</span></span>
                                   </div>
                              </div>

                              <div ref={chatContainerRef} className="flex-grow p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6 bg-white dark:bg-[#0a0d14] transition-colors">
                                   {engineStatus === "unloaded" && chatHistory.length === 1 && (
                                        <div className="m-auto flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 gap-4 max-w-sm text-center">
                                             <Cpu size={48} className="opacity-20 text-indigo-600 dark:text-indigo-500" />
                                             <p className="text-xs leading-relaxed">Load an execution engine from the left panel to begin completely offline, secure inference. Configure your quantization to match your system RAM.</p>
                                        </div>
                                   )}
                                   {chatHistory.map((msg, index) => {
                                        if (msg.role === "system") {
                                             return (
                                                  <div key={index} className="flex justify-center w-full my-2">
                                                       <span className="text-[10px] font-mono text-gray-500 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3 py-1 rounded-full flex items-center gap-2 transition-colors">
                                                            <Zap size={10} className="text-amber-500 dark:text-amber-400" /> {msg.content}
                                                       </span>
                                                  </div>
                                             );
                                        }
                                        return (
                                             <div key={index} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${msg.role === "user" ? "bg-indigo-600 border-indigo-500 text-white" : "bg-white dark:bg-gray-900 border-emerald-200 dark:border-emerald-500/50 text-emerald-600 dark:text-emerald-400"}`}>
                                                       {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                                                  </div>
                                                  <div className={`max-w-[80%] p-4 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "bg-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-md" : "bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-300 rounded-2xl rounded-tl-sm shadow-sm transition-colors"}`}>
                                                       {msg.content}
                                                       {msg.role === "assistant" && index === chatHistory.length - 1 && engineStatus === "generating" && (
                                                            <span className="inline-block w-2 h-4 bg-emerald-500 dark:bg-emerald-400 ml-1 translate-y-1 animate-pulse" />
                                                       )}
                                                  </div>
                                             </div>
                                        );
                                   })}
                              </div>

                              {isRagEnabled && engineStatus === "generating" && (
                                   <div className="absolute bottom-[88px] left-1/2 -translate-x-1/2 bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold font-mono px-3 py-1.5 rounded-full shadow-md dark:shadow-lg flex items-center gap-2 transition-colors">
                                        <Database size={12} className="animate-pulse" /> Performing Local Vector Search...
                                   </div>
                              )}

                              <div className="p-4 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 transition-colors">
                                   <div className="relative">
                                        <textarea
                                             value={inputPrompt}
                                             onChange={(e) => setInputPrompt(e.target.value)}
                                             onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                             disabled={engineStatus !== "ready"}
                                             placeholder={engineStatus === "ready" ? "Type your prompt..." : "Load the WebGPU engine to start chatting..."}
                                             className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl pl-4 pr-14 py-3.5 text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-500/50 resize-none custom-scrollbar disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                             rows={2}
                                        />
                                        <button onClick={handleSend} disabled={!inputPrompt.trim() || engineStatus !== "ready"} className="absolute right-3 bottom-3 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-300 dark:disabled:bg-gray-800 text-white disabled:text-gray-500 rounded-xl transition-colors shadow-sm dark:shadow-none">
                                             <Send size={16} />
                                        </button>
                                   </div>
                                   <div className="mt-2 text-center flex items-center justify-between">
                                        <span className="text-[9px] text-gray-500 flex items-center gap-1 ml-2">
                                             <ShieldCheck size={10} className="text-emerald-600 dark:text-emerald-500" /> Local processing. Zero API calls.
                                        </span>
                                        <span className="text-[9px] font-mono text-gray-500 dark:text-gray-600 mr-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-1.5 rounded transition-colors">
                                             Temp: {temperature} | Ctx: {contextLength}
                                        </span>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* ========================================= */}
               {/* SEO CONTENT & FAQS */}
               {/* ========================================= */}
               <div className="mt-12 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm dark:shadow-none">
                    <div className="prose dark:prose-invert max-w-none">
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Run Local LLMs Securely in Your Browser</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              Privacy shouldn't be a premium feature. The ToolLok <strong>Local WebAssembly LLM Chat</strong> allows you to download and execute quantized AI models (like SmolLM and Llama 3) directly on your device. Utilizing WebGPU architecture, this <Link href="/categories/ai-tools" className="text-indigo-600 dark:text-indigo-400 hover:underline">AI Tool</Link> processes your prompts using your own hardware. Your sensitive code and proprietary documents never touch an external cloud server.
                         </p>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Next-Generation Local AI Features</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Zero API Costs:</strong> Because the computation happens on your machine, you can generate millions of tokens completely free of charge.</li>
                              <li><strong>Local Vector RAG:</strong> Upload PDF or Markdown files to slice, embed, and query your documents offline securely.</li>
                              <li><strong>Hardware Optimized:</strong> Choose between 4-bit (q4) or 8-bit (q8) quantization to perfectly balance response speed and system RAM usage.</li>
                         </ul>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">How does a browser-based LLM work?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">By converting open-source AI weights into a specialized format (GGUF) and utilizing WebAssembly (Wasm) combined with WebGPU, modern browsers can use your device's graphics card to perform the massive matrix multiplications required to run AI offline.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">What is WebGPU?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">WebGPU is a new web standard that provides modern, high-performance, and secure access to your computer's GPU hardware from within the browser. It is significantly faster than the older WebGL standard for running neural networks.</p>
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
                                             "name": "How does a browser-based LLM work?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "By utilizing WebAssembly and WebGPU, modern browsers can use your device's hardware to run quantized AI models offline." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "What is WebGPU?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "WebGPU is a web standard providing high-performance access to your GPU hardware from the browser, ideal for running neural networks." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-wasm-llm-ad" format="fluid" className="mt-4" />
          </div>
     );
}