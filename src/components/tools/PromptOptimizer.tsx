"use client";

import { useState } from "react";
import Link from "next/link";
import { Wand2, Copy, Check, Sparkles, Settings2, Bot, UserCog, Sliders, Cpu } from "lucide-react";
import AdSlot from "@/components/ui/AdSlot";

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
                         <div className="w-10 h-10 bg-cyan-50 dark:bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20">
                              <Wand2 size={20} />
                         </div>
                         <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Advanced Prompt Optimizer</h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Smart client-side semantic parser that turns basic inputs into high-performance AI system instructions.</p>
               </div>

               <AdSlot adSlot="top-prompt-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 flex flex-col gap-6 shadow-sm dark:shadow-none transition-colors">
                         <div className="space-y-3">
                              <label className="text-sm font-bold text-gray-900 dark:text-gray-300 flex items-center gap-2">
                                   <Bot className="text-blue-600 dark:text-blue-400" size={16} /> Target AI Model
                              </label>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                   {MODELS.map((model) => (
                                        <button key={model.id} onClick={() => setSelectedModel(model.id)} className={`px-2 py-2 rounded-lg text-xs font-semibold transition-all border ${selectedModel === model.id ? "bg-blue-50 dark:bg-blue-600/20 border-blue-200 dark:border-blue-500/50 text-blue-700 dark:text-blue-400 shadow-sm dark:shadow-none" : "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-500 hover:border-gray-300 dark:hover:border-gray-700"}`}>
                                             {model.name}
                                        </button>
                                   ))}
                              </div>
                         </div>

                         <div className="space-y-3">
                              <label className="text-sm font-bold text-gray-900 dark:text-gray-300 flex items-center gap-2">
                                   <Settings2 className="text-emerald-600 dark:text-emerald-400" size={16} /> Architectural Framework
                              </label>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                   {FRAMEWORKS.map((fw) => (
                                        <button key={fw.id} onClick={() => setSelectedFramework(fw.id)} className={`p-3 rounded-xl text-left transition-all border flex flex-col gap-1 ${selectedFramework === fw.id ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/50 text-emerald-700 dark:text-emerald-400 shadow-sm dark:shadow-none" : "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700"}`}>
                                             <span className="text-sm font-bold">{fw.name}</span>
                                             <span className="text-[10px] opacity-70 leading-tight">{fw.desc}</span>
                                        </button>
                                   ))}
                              </div>
                         </div>

                         <div className="space-y-3 flex-grow flex flex-col">
                              <label className="text-sm font-bold text-gray-900 dark:text-gray-300">Your Raw Input Prompt</label>
                              <textarea
                                   value={rawPrompt}
                                   onChange={(e) => setRawPrompt(e.target.value)}
                                   placeholder="e.g., Write a python script to parse logs or draft a sales email for my agency..."
                                   className="w-full min-h-[160px] flex-grow bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-sm text-gray-900 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-700 focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
                              />
                         </div>

                         <button
                              onClick={generatePrompt}
                              disabled={!rawPrompt.trim() || isGenerating}
                              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-md dark:shadow-lg dark:shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                              {isGenerating ? (
                                   <span className="flex items-center gap-2 animate-pulse"><Sparkles size={18} /> {analysisStep}</span>
                              ) : (
                                   <><Wand2 size={18} /> Analyze & Optimize Prompt</>
                              )}
                         </button>
                    </div>

                    <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden shadow-sm dark:shadow-none transition-colors">
                         <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800/50">
                              <div className="flex items-center gap-2">
                                   <Cpu size={16} className="text-cyan-600 dark:text-cyan-400" />
                                   <h3 className="text-sm font-bold text-gray-900 dark:text-gray-300">Optimized System Instruction</h3>
                              </div>
                              <button
                                   onClick={copyToClipboard}
                                   disabled={!optimizedPrompt}
                                   className="flex items-center gap-1.5 text-xs font-bold bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:bg-gray-200 dark:hover:border-gray-700 hover:text-gray-900 dark:hover:text-white text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                              >
                                   {isCopied ? <><Check className="text-emerald-600 dark:text-emerald-400" size={14} /> Copied!</> : <><Copy size={14} /> Copy Code</>}
                              </button>
                         </div>

                         {detectedDomain && (
                              <div className="bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-cyan-700 dark:text-cyan-300 font-semibold transition-colors">
                                   <span>🧠 Detected Intent Domain:</span>
                                   <span className="bg-white dark:bg-cyan-950 px-2.5 py-1 rounded-md border border-cyan-200 dark:border-cyan-800/50">{detectedDomain}</span>
                              </div>
                         )}

                         <div className="flex-grow w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-5 text-sm text-gray-900 dark:text-cyan-50 whitespace-pre-wrap font-mono leading-relaxed overflow-y-auto transition-colors">
                              {optimizedPrompt ? (
                                   optimizedPrompt
                              ) : (
                                   <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-700 gap-3">
                                        <Sparkles className="opacity-20" size={32} />
                                        <p className="text-center px-8 text-xs">Enter your prompt on the left. The engine will automatically detect your intent, assign expert parameters, and structure a professional instruction set.</p>
                                   </div>
                              )}
                         </div>
                    </div>
               </div>

               {/* ========================================= */}
               {/* SEO CONTENT & FAQS */}
               {/* ========================================= */}
               <div className="mt-12 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm dark:shadow-none">
                    <div className="prose dark:prose-invert max-w-none">
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">AI Prompt Optimizer & Framework Generator</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              The quality of an AI's output is heavily dependent on the precision of your input. ToolLok's <strong>Prompt Optimizer</strong> takes your simple, unstructured instructions and transforms them into elite, system-level directives using proven AI frameworks. Whether you are using OpenAI's ChatGPT, Anthropic's Claude, or Google Gemini, this tool assigns expert personas and reasoning structures to ensure high-fidelity outputs. Pair this generator with our <Link href="/categories/ai-tools" className="text-cyan-600 dark:text-cyan-400 hover:underline">AI Tools</Link> to revolutionize your AI workflow.
                         </p>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Supported Prompt Engineering Frameworks</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Chain of Thought (CoT):</strong> Forces the LLM to outline its mental model and break down complex problems step-by-step before delivering the final answer, severely reducing hallucinations.</li>
                              <li><strong>R.T.F. (Role, Task, Format):</strong> Assigns a strict domain expert persona, defines the core objective, and enforces clean structural boundaries (like markdown or tables) on the output.</li>
                              <li><strong>XML Tagging:</strong> Claude 3's preferred framework. It uses `&lt;objective&gt;` and `&lt;instructions&gt;` tags to prevent the model from ignoring secondary instructions.</li>
                         </ul>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">What is the Chain of Thought prompting framework?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Chain of Thought (CoT) prompting is a technique that instructs the AI to think aloud and perform step-by-step reasoning. By breaking down the logic linearly, the AI is far less likely to make math or reasoning errors.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">How do I write a good system prompt for Claude or GPT-4?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">A good system prompt must define a clear persona (e.g., "Senior Software Engineer"), provide specific context, eliminate conversational fluff, and dictate the exact output formatting. Our Prompt Optimizer automates this entire process.</p>
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
                                             "name": "What is the Chain of Thought prompting framework?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Chain of Thought prompting instructs the AI to think aloud and perform step-by-step reasoning, severely reducing hallucinations and math errors." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "How do I write a good system prompt for Claude or GPT-4?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "A good prompt defines a clear persona, provides context, eliminates conversational fluff, and dictates the exact output formatting." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-prompt-ad" format="fluid" className="mt-4" />
          </div>
     );
}