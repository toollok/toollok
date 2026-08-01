"use client";

import { useState } from "react";
import { Wand2, Copy, Check, Sparkles, Settings2, Bot, UserCog, Sliders, Cpu } from "lucide-react";

const FRAMEWORKS = [
     { id: "cot", name: "Chain of Thought", desc: "Forces step-by-step logical reasoning." },
     { id: "rtf", name: "R.T.F. Framework", desc: "Role, Task, Format structure." },
     { id: "xml", name: "XML Tagging", desc: "Best for Claude. Clear section boundaries." },
];

const MODELS = [
     { id: "universal", name: "Universal" },
     { id: "gpt4", name: "GPT-4 / ChatGPT" },
     { id: "claude3", name: "Claude 3" },
     { id: "gemini", name: "Google Gemini" },
];

export default function PromptOptimizer() {
     const [rawPrompt, setRawPrompt] = useState("");
     const [selectedFramework, setSelectedFramework] = useState("rtf");
     const [selectedModel, setSelectedModel] = useState("universal");

     const [optimizedPrompt, setOptimizedPrompt] = useState("");
     const [detectedDomain, setDetectedDomain] = useState("");
     const [isCopied, setIsCopied] = useState(false);
     const [isGenerating, setIsGenerating] = useState(false);
     const [analysisStep, setAnalysisStep] = useState("");

     // Smart Client-Side Intent & Domain Analyzer
     const analyzeIntent = (text: string) => {
          const lower = text.toLowerCase();
          if (lower.includes("code") || lower.includes("bug") || lower.includes("python") || lower.includes("react") || lower.includes("javascript") || lower.includes("function") || lower.includes("api") || lower.includes("sql")) {
               return { domain: "Software Engineering & Architecture", role: "Senior Full-Stack Software Engineer specializing in robust, clean, and secure code." };
          } else if (lower.includes("market") || lower.includes("sales") || lower.includes("ad") || lower.includes("copy") || lower.includes("email") || lower.includes("campaign") || lower.includes("lead")) {
               return { domain: "Direct Response Marketing & Growth", role: "Master Growth Marketer and Conversion Rate Optimization (CRO) expert." };
          } else if (lower.includes("blog") || lower.includes("article") || lower.includes("write") || lower.includes("content") || lower.includes("essay") || lower.includes("story")) {
               return { domain: "Professional Content Creation & SEO", role: "Award-winning Author and SEO Content Specialist." };
          } else if (lower.includes("data") || lower.includes("analyze") || lower.includes("chart") || lower.includes("metrics") || lower.includes("finance") || lower.includes("report")) {
               return { domain: "Data Analysis & Business Intelligence", role: "Senior Data Scientist and Financial Analyst." };
          } else {
               return { domain: "General Expert Consultation", role: "World-class Subject Matter Expert with multidisciplinary problem-solving skills." };
          }
     };

     const generatePrompt = () => {
          if (!rawPrompt.trim()) return;
          setIsGenerating(true);
          setAnalysisStep("Scanning prompt context & detecting domain...");

          setTimeout(() => {
               setAnalysisStep("Synthesizing intelligent instructions...");
               setTimeout(() => {
                    const intent = analyzeIntent(rawPrompt);
                    setDetectedDomain(intent.domain);

                    let result = "";
                    const base = rawPrompt.trim();

                    if (selectedFramework === "rtf") {
                         result = `### SYSTEM ROLE\n${intent.role}\n\n### CORE OBJECTIVE\n${base}\n\n### EXECUTION GUIDELINES\n1. Analyze the user's core intent thoroughly before drafting the response.\n2. Address edge cases, potential limitations, or hidden complexities.\n3. Structure your response with clean markdown headings (H2, H3) and scannable bullet points.\n4. Maintain an objective, professional, and authoritative tone with zero conversational fluff.`;
                    } else if (selectedFramework === "cot") {
                         result = `### SYSTEM ROLE\n${intent.role}\n\n### TASK REQUIREMENT\n${base}\n\n### REASONING PROTOCOL (CHAIN OF THOUGHT)\nBefore delivering your final output, perform a rigorous step-by-step breakdown:\n1. Deconstruct the user's objective into fundamental constraints.\n2. Outline your mental model or approach to solving the problem.\n3. Validate potential bottlenecks or edge cases.\n4. Provide the polished, comprehensive final output.`;
                    } else if (selectedFramework === "xml") {
                         result = `<role>\n${intent.role}\n</role>\n\n<objective>\n${base}\n</objective>\n\n<instructions>\n- Parse the objective carefully.\n- Provide exhaustive detail while keeping the prose concise and high-signal.\n- Wrap your final deliverable inside <output> tags.\n</instructions>`;
                    }

                    // Model specifics
                    if (selectedModel === "claude3") {
                         result += `\n\n[Model Directive: Claude -> Focus on nuance, precise logic structures, and avoid generic conversational pleasantries.]`;
                    } else if (selectedModel === "gpt4") {
                         result += `\n\n[Model Directive: GPT-4 -> Maximize execution efficiency. Skip intro text like "Sure, here is..." and provide high-density output.]`;
                    } else if (selectedModel === "gemini") {
                         result += `\n\n[Model Directive: Gemini -> Leverage broad synthesis and structured formatting.]`;
                    }

                    setOptimizedPrompt(result);
                    setIsGenerating(false);
               }, 500);
          }, 500);
     };

     const copyToClipboard = () => {
          if (!optimizedPrompt) return;
          navigator.clipboard.writeText(optimizedPrompt);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
     };

     return (
          <div className="w-full max-w-6xl mx-auto space-y-8">
               <div>
                    <div className="flex items-center gap-3 mb-2">
                         <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                              <Wand2 size={20} />
                         </div>
                         <h2 className="text-2xl md:text-3xl font-black text-white">Advanced Prompt Optimizer</h2>
                    </div>
                    <p className="text-gray-400 text-sm">Smart client-side semantic parser that turns basic inputs into high-performance AI system instructions.</p>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* LEFT COLUMN */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 flex flex-col gap-6">

                         {/* Target Model */}
                         <div className="space-y-3">
                              <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                   <Bot className="text-blue-400" size={16} /> Target AI Model
                              </label>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                   {MODELS.map((model) => (
                                        <button key={model.id} onClick={() => setSelectedModel(model.id)} className={`px-2 py-2 rounded-lg text-xs font-semibold transition-all border ${selectedModel === model.id ? "bg-blue-600/20 border-blue-500/50 text-blue-400" : "bg-gray-950 border-gray-800 text-gray-500 hover:border-gray-700"}`}>
                                             {model.name}
                                        </button>
                                   ))}
                              </div>
                         </div>

                         {/* Framework Toggle */}
                         <div className="space-y-3">
                              <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                   <Settings2 className="text-emerald-400" size={16} /> Architectural Framework
                              </label>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                   {FRAMEWORKS.map((fw) => (
                                        <button key={fw.id} onClick={() => setSelectedFramework(fw.id)} className={`p-3 rounded-xl text-left transition-all border flex flex-col gap-1 ${selectedFramework === fw.id ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : "bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700"}`}>
                                             <span className="text-sm font-bold">{fw.name}</span>
                                             <span className="text-[10px] opacity-70 leading-tight">{fw.desc}</span>
                                        </button>
                                   ))}
                              </div>
                         </div>

                         {/* Raw Prompt Input */}
                         <div className="space-y-3 flex-grow flex flex-col">
                              <label className="text-sm font-bold text-gray-300">Your Raw Input Prompt</label>
                              <textarea
                                   value={rawPrompt}
                                   onChange={(e) => setRawPrompt(e.target.value)}
                                   placeholder="e.g., Write a python script to parse logs or draft a sales email for my agency..."
                                   className="w-full min-h-[160px] flex-grow bg-gray-950 border border-gray-800 rounded-xl p-4 text-sm text-gray-200 placeholder:text-gray-700 focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
                              />
                         </div>

                         <button
                              onClick={generatePrompt}
                              disabled={!rawPrompt.trim() || isGenerating}
                              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                              {isGenerating ? (
                                   <span className="flex items-center gap-2 animate-pulse"><Sparkles size={18} /> {analysisStep}</span>
                              ) : (
                                   <><Wand2 size={18} /> Analyze & Optimize Prompt</>
                              )}
                         </button>
                    </div>

                    {/* RIGHT COLUMN: Output */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden">
                         <div className="flex items-center justify-between pb-2 border-b border-gray-800/50">
                              <div className="flex items-center gap-2">
                                   <Cpu size={16} className="text-cyan-400" />
                                   <h3 className="text-sm font-bold text-gray-300">Optimized System Instruction</h3>
                              </div>
                              <button
                                   onClick={copyToClipboard}
                                   disabled={!optimizedPrompt}
                                   className="flex items-center gap-1.5 text-xs font-bold bg-gray-950 border border-gray-800 hover:border-gray-700 hover:text-white text-gray-400 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                              >
                                   {isCopied ? <><Check className="text-emerald-400" size={14} /> Copied!</> : <><Copy size={14} /> Copy Code</>}
                              </button>
                         </div>

                         {detectedDomain && (
                              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-cyan-300 font-semibold">
                                   <span>🧠 Detected Intent Domain:</span>
                                   <span className="bg-cyan-950 px-2.5 py-1 rounded-md border border-cyan-800/50">{detectedDomain}</span>
                              </div>
                         )}

                         <div className="flex-grow w-full bg-gray-950 border border-gray-800 rounded-xl p-5 text-sm text-cyan-50 whitespace-pre-wrap font-mono leading-relaxed overflow-y-auto">
                              {optimizedPrompt ? (
                                   optimizedPrompt
                              ) : (
                                   <div className="h-full flex flex-col items-center justify-center text-gray-700 gap-3">
                                        <Sparkles className="opacity-20" size={32} />
                                        <p className="text-center px-8 text-xs">Enter your prompt on the left. The engine will automatically detect your intent, assign expert parameters, and structure a professional instruction set.</p>
                                   </div>
                              )}
                         </div>
                    </div>
               </div>
          </div>
     );
}