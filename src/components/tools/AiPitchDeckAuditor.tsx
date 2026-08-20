"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { FileText, AlertTriangle, ShieldCheck, Copy, Check, Sparkles, Target, Award, Calculator, Layers, Mail, Upload } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import AdSlot from "@/components/ui/AdSlot";

export default function AiPitchDeckAuditor() {
     const [activeTab, setActiveTab] = useState<"audit" | "market" | "slides" | "emails">("audit");
     const [industry, setIndustry] = useState<string>("SaaS / B2B Software");
     const [pitchText, setPitchText] = useState<string>(
          "We are building an AI-powered B2B lead generation platform for SaaS companies. Our software automates corporate email outreach and CRM syncing. We charge $99/month subscription and currently have 50 beta customers with $5,000 MRR. Our target market is the 2M global SMB software companies."
     );

     const [arpu, setArpu] = useState<number>(99);
     const [targetCustomers, setTargetCustomers] = useState<number>(50000);
     const [marketPenetrationPct, setMarketPenetrationPct] = useState<number>(15);

     const fileInputRef = useRef<HTMLInputElement>(null);
     const { isCopied, copy } = useCopyToClipboard(2000);

     const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (event) => {
               const content = event.target?.result as string;
               if (content) setPitchText(content);
          };
          reader.readAsText(file);
     };

     const marketMetrics = useMemo(() => {
          const tamAnnual = arpu * targetCustomers * 12;
          const samAnnual = tamAnnual * (marketPenetrationPct / 100);
          const somAnnual = samAnnual * 0.10;
          return {
               tam: Math.round(tamAnnual),
               sam: Math.round(samAnnual),
               som: Math.round(somAnnual)
          };
     }, [arpu, targetCustomers, marketPenetrationPct]);

     const auditResult = useMemo(() => {
          const text = pitchText.toLowerCase();
          const wordCount = pitchText.trim().split(/\s+/).filter(Boolean).length;
          let marketScore = 60, monetizationScore = 65, defensibilityScore = 50, clarityScore = 70;

          const hasRevenue = text.includes("mrr") || text.includes("revenue") || text.includes("$") || text.includes("arr");
          const hasMarketSize = text.includes("market") || text.includes("tam") || text.includes("billion") || text.includes("million");
          const hasCompetitors = text.includes("competitor") || text.includes("unlike") || text.includes("defensible") || text.includes("moat");
          const hasTeam = text.includes("team") || text.includes("founder") || text.includes("experience") || text.includes("ex-");

          if (hasRevenue) monetizationScore += 25;
          if (hasMarketSize || marketMetrics.tam > 0) marketScore += 30;
          if (hasCompetitors) defensibilityScore += 30;
          if (hasTeam) clarityScore += 15;
          if (wordCount > 40) clarityScore += 10;
          if (wordCount > 100) clarityScore += 10;

          marketScore = Math.min(100, Math.max(30, marketScore));
          monetizationScore = Math.min(100, Math.max(30, monetizationScore));
          defensibilityScore = Math.min(100, Math.max(30, defensibilityScore));
          clarityScore = Math.min(100, Math.max(30, clarityScore));

          const overallScore = Math.round((marketScore + monetizationScore + defensibilityScore + clarityScore) / 4);
          const redFlags: string[] = [];

          if (!hasMarketSize && marketMetrics.tam === 0) redFlags.push("Missing explicit Total Addressable Market (TAM) calculation.");
          if (!hasRevenue && !text.includes("traction")) redFlags.push("Low traction indicators; investors expect early user growth or revenue proof points.");
          if (!hasCompetitors) redFlags.push("No clear competitive advantage or proprietary moat mentioned.");
          if (!hasTeam) redFlags.push("Founder background and team domain expertise section is absent.");

          const recommendations: string[] = [
               "Quantify your Customer Acquisition Cost (CAC) vs. Lifetime Value (LTV) for stronger VC appeal.",
               "Highlight your proprietary tech moat or distribution advantage.",
               "Format your presentation into a classic 10-slide investor deck structure."
          ];

          return { overallScore, marketScore, monetizationScore, defensibilityScore, clarityScore, redFlags, recommendations, wordCount };
     }, [pitchText, marketMetrics]);

     const slideOutline = [
          { slide: "1. Hook / Title", content: `One-sentence value proposition for ${industry}.` },
          { slide: "2. The Problem", content: `Pain points currently faced by target customers in ${industry}.` },
          { slide: "3. The Solution", content: `Your product offering: ${pitchText.slice(0, 80)}...` },
          { slide: "4. Market Size (TAM/SAM/SOM)", content: `TAM: $${(marketMetrics.tam / 1e9).toFixed(2)}B bottom-up calculation.` },
          { slide: "5. Business & Pricing Model", content: `Subscription pricing model with sustainable unit economics.` },
          { slide: "6. Traction & Validation", content: `Current beta customers, MRR, and user growth velocity.` },
          { slide: "7. Competition & Moat", content: `Differentiation matrix against incumbent alternatives.` },
          { slide: "8. Marketing & Go-To-Market", content: `Customer acquisition channels and viral loops.` },
          { slide: "9. The Team", content: `Founder domain expertise and operational background.` },
          { slide: "10. The Ask", content: `Capital raise target, use of funds, and 18-month milestone runway.` }
     ];

     const coldEmail = {
          subject: `Intro: ${industry} Startup Disrupting Workflow (Seed Round)`,
          body: `Hi [Investor Name],\n\nI’ve been following your investments in ${industry} and wanted to share what we are building.\n\nWe provide an automated workflow platform tailored for modern businesses. Key highlights:\n- $5K+ MRR with 50+ active beta accounts.\n- $${(marketMetrics.tam / 1e9).toFixed(1)}B bottom-up TAM.\n- Growing at 25% MoM organically.\n\nWould love 10 minutes next week to share our deck if this aligns with your thesis.\n\nBest,\n[Your Name]`
     };

     const fullReportText = `=== TOOOLOK PITCH DECK AUDIT REPORT ===\nIndustry: ${industry}\nOverall Score: ${auditResult.overallScore}/100\nTAM: $${(marketMetrics.tam / 1e9).toFixed(2)}B\n\nRed Flags:\n` + auditResult.redFlags.map(f => `- ${f}`).join('\n');

     useKeyboardShortcuts([{ key: "c", ctrlOrCmd: true, action: () => copy(fullReportText) }]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
               <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                              <Sparkles size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Pitch Deck & Business Plan Auditor</h2>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Evaluate pitch decks against VC rubrics, calculate TAM/SAM, generate slide outlines & cold emails.</p>
                         </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-xl text-xs text-indigo-600 dark:text-indigo-400 shadow-sm dark:shadow-none">
                         <ShieldCheck size={16} />
                         <span>Investor Readiness AI</span>
                    </div>
               </div>

               <AdSlot adSlot="top-pitchauditor-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="flex flex-wrap gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-2 rounded-2xl">
                    <button onClick={() => setActiveTab("audit")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "audit" ? 'bg-indigo-600 text-white shadow-md dark:shadow-lg dark:shadow-indigo-600/30' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
                         <Award size={14} /> Audit Score & Red Flags
                    </button>
                    <button onClick={() => setActiveTab("market")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "market" ? 'bg-indigo-600 text-white shadow-md dark:shadow-lg dark:shadow-indigo-600/30' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
                         <Calculator size={14} /> TAM / SAM / SOM Calculator
                    </button>
                    <button onClick={() => setActiveTab("slides")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "slides" ? 'bg-indigo-600 text-white shadow-md dark:shadow-lg dark:shadow-indigo-600/30' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
                         <Layers size={14} /> 10-Slide Deck Outline
                    </button>
                    <button onClick={() => setActiveTab("emails")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "emails" ? 'bg-indigo-600 text-white shadow-md dark:shadow-lg dark:shadow-indigo-600/30' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
                         <Mail size={14} /> VC Cold Email Generator
                    </button>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-xl flex flex-col gap-5">
                         <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/60 pb-3">
                              <h3 className="text-gray-900 dark:text-white font-bold text-base flex items-center gap-2">
                                   <FileText size={16} className="text-indigo-600 dark:text-indigo-400" /> Pitch Deck / Business Summary
                              </h3>
                              <div className="flex items-center gap-3">
                                   <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt,.md" className="hidden" />
                                   <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-xl transition-colors font-bold">
                                        <Upload size={14} /> Upload File (.txt)
                                   </button>
                              </div>
                         </div>
                         <div>
                              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">Target Industry</label>
                              <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 dark:text-white outline-none">
                                   <option value="SaaS / B2B Software">SaaS / B2B Software</option>
                                   <option value="FinTech / Web3">FinTech / Web3</option>
                                   <option value="HealthTech / Biotech">HealthTech / Biotech</option>
                                   <option value="E-Commerce / D2C">E-Commerce / D2C</option>
                                   <option value="AI / DeepTech">AI / DeepTech</option>
                              </select>
                         </div>
                         <div>
                              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">Elevator Pitch / Summary Text ({auditResult.wordCount} words)</label>
                              <textarea rows={10} value={pitchText} onChange={(e) => setPitchText(e.target.value)} placeholder="Describe your problem, solution, market size, business model, and traction..." className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-xs text-gray-900 dark:text-white outline-none resize-none leading-relaxed focus:border-indigo-500 font-mono" />
                         </div>
                         <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-4 text-xs text-indigo-700 dark:text-indigo-300 flex items-start gap-3">
                              <Target size={16} className="shrink-0 mt-0.5 text-indigo-600 dark:text-indigo-400" />
                              <span>Tip: Include pricing, market size, and customer traction for optimal investor evaluation.</span>
                         </div>
                    </div>

                    <div className="lg:col-span-6 flex flex-col gap-6">
                         {activeTab === "audit" && (
                              <div className="bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-xl flex flex-col gap-6">
                                   <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/60 pb-3">
                                        <h3 className="text-gray-900 dark:text-white font-bold text-base flex items-center gap-2">
                                             <Award size={18} className="text-emerald-600 dark:text-emerald-400" /> VC Evaluation Dashboard
                                        </h3>
                                        <button onClick={() => copy(fullReportText)} className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg transition-colors font-bold shadow-md dark:shadow-lg dark:shadow-indigo-600/20">
                                             {isCopied ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                                             {isCopied ? "Report Copied" : "Copy Report"}
                                        </button>
                                   </div>
                                   <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-indigo-950/40 dark:via-gray-900 dark:to-gray-950 border border-gray-200 dark:border-indigo-900/50 rounded-2xl p-6 flex items-center justify-between">
                                        <div>
                                             <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest block mb-1">Overall Readiness Score</span>
                                             <span className={`text-4xl font-extrabold font-mono ${auditResult.overallScore >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-cyan-600 dark:text-cyan-400'}`}>
                                                  {auditResult.overallScore} <span className="text-lg text-gray-400 dark:text-gray-500">/ 100</span>
                                             </span>
                                        </div>
                                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none">
                                             {auditResult.overallScore >= 75 ? '🟢 VC Ready' : '🟡 Needs Refinement'}
                                        </span>
                                   </div>
                                   <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
                                             <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Market Opportunity</span>
                                             <span className="text-xl font-bold font-mono text-gray-900 dark:text-white">{auditResult.marketScore}%</span>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
                                             <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Monetization Strategy</span>
                                             <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{auditResult.monetizationScore}%</span>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
                                             <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Defensibility & Moat</span>
                                             <span className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400">{auditResult.defensibilityScore}%</span>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
                                             <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Clarity & Structure</span>
                                             <span className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400">{auditResult.clarityScore}%</span>
                                        </div>
                                   </div>
                                   {auditResult.redFlags.length > 0 && (
                                        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex flex-col gap-2">
                                             <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase">
                                                  <AlertTriangle size={14} /> Investor Red Flags
                                             </div>
                                             <ul className="flex flex-col gap-1.5 text-xs text-amber-800 dark:text-amber-300/90 pl-5 list-disc font-mono">
                                                  {auditResult.redFlags.map((flag, idx) => <li key={idx}>{flag}</li>)}
                                             </ul>
                                        </div>
                                   )}
                              </div>
                         )}

                         {activeTab === "market" && (
                              <div className="bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-xl flex flex-col gap-6">
                                   <h3 className="text-gray-900 dark:text-white font-bold text-base flex items-center gap-2 border-b border-gray-100 dark:border-gray-800/60 pb-3">
                                        <Calculator size={18} className="text-indigo-600 dark:text-indigo-400" /> Bottom-Up Market Sizing
                                   </h3>
                                   <div className="grid grid-cols-2 gap-4">
                                        <div>
                                             <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Avg Revenue / User ($/mo)</label>
                                             <input type="number" value={arpu} onChange={(e) => setArpu(Number(e.target.value) || 0)} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-xs text-gray-900 dark:text-white font-mono outline-none" />
                                        </div>
                                        <div>
                                             <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Total Target Customers</label>
                                             <input type="number" value={targetCustomers} onChange={(e) => setTargetCustomers(Number(e.target.value) || 0)} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-xs text-gray-900 dark:text-white font-mono outline-none" />
                                        </div>
                                   </div>
                                   <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
                                             <span className="text-[9px] text-gray-500 font-bold uppercase block mb-1">TAM (Total)</span>
                                             <span className="text-lg font-bold font-mono text-gray-900 dark:text-white">${(marketMetrics.tam / 1e6).toFixed(1)}M</span>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
                                             <span className="text-[9px] text-gray-500 font-bold uppercase block mb-1">SAM (Serviceable)</span>
                                             <span className="text-lg font-bold font-mono text-cyan-600 dark:text-cyan-400">${(marketMetrics.sam / 1e6).toFixed(1)}M</span>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
                                             <span className="text-[9px] text-gray-500 font-bold uppercase block mb-1">SOM (Obtainable)</span>
                                             <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">${(marketMetrics.som / 1e6).toFixed(1)}M</span>
                                        </div>
                                   </div>
                              </div>
                         )}

                         {activeTab === "slides" && (
                              <div className="bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-xl flex flex-col gap-4 max-h-[500px] overflow-y-auto">
                                   <h3 className="text-gray-900 dark:text-white font-bold text-base flex items-center gap-2 border-b border-gray-100 dark:border-gray-800/60 pb-3">
                                        <Layers size={18} className="text-indigo-600 dark:text-indigo-400" /> Standard 10-Slide Deck Blueprint
                                   </h3>
                                   <div className="flex flex-col gap-3">
                                        {slideOutline.map((slide, idx) => (
                                             <div key={idx} className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800/80 rounded-2xl p-3.5 flex flex-col gap-1">
                                                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{slide.slide}</span>
                                                  <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">{slide.content}</span>
                                             </div>
                                        ))}
                                   </div>
                              </div>
                         )}

                         {activeTab === "emails" && (
                              <div className="bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-xl flex flex-col gap-5">
                                   <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/60 pb-3">
                                        <h3 className="text-gray-900 dark:text-white font-bold text-base flex items-center gap-2">
                                             <Mail size={18} className="text-indigo-600 dark:text-indigo-400" /> VC Cold Email Template
                                        </h3>
                                        <button onClick={() => copy(`${coldEmail.subject}\n\n${coldEmail.body}`)} className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 transition-colors text-white px-3 py-1.5 rounded-xl font-bold">
                                             <Copy size={14} /> Copy Email
                                        </button>
                                   </div>
                                   <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 font-mono text-xs text-gray-700 dark:text-gray-300 flex flex-col gap-3">
                                        <div><strong className="text-indigo-600 dark:text-indigo-400">Subject:</strong> {coldEmail.subject}</div>
                                        <div className="whitespace-pre-line leading-relaxed">{coldEmail.body}</div>
                                   </div>
                              </div>
                         )}
                    </div>
               </div>

               {/* ========================================= */}
               {/* SEO CONTENT & FAQS */}
               {/* ========================================= */}
               <div className="mt-12 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm dark:shadow-none">
                    <div className="prose dark:prose-invert max-w-none">
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Validate Your Startup Pitch Deck with AI</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              Securing venture capital requires a flawless narrative. The <strong>AI Pitch Deck Auditor</strong> analyzes your business summary to identify critical missing elements—like defensibility, monetization strategies, and market sizing. Pair this evaluation with our <Link href="/categories/business-tools" className="text-indigo-600 dark:text-indigo-400 hover:underline">Business Tools</Link> to ensure your startup is fully prepared for Seed or Series A fundraising.
                         </p>
                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Key Tools for Founders</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>TAM / SAM / SOM Calculator:</strong> Generate accurate, bottom-up market sizing numbers to prove venture-scale potential to investors.</li>
                              <li><strong>Red Flag Detector:</strong> Instantly spot missing metrics (like ARPU or CAC) before sending your deck to partners.</li>
                              <li><strong>Cold Email Generator:</strong> Automatically draft high-converting outreach emails tailored to your industry.</li>
                         </ul>
                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">What is a good TAM (Total Addressable Market) for a startup?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Venture capitalists typically look for a TAM of at least $1 Billion. This ensures that even if you capture a small percentage of the market (SOM), the business can still reach $100M+ in annual revenue, providing a 10x return on their investment.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">How many slides should a pitch deck have?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">The industry standard is 10 to 12 slides. Key slides must include the Problem, Solution, Market Size, Business Model, Traction, Competition, Go-to-Market strategy, Team, and The Ask.</p>
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
                                             "name": "What is a good TAM (Total Addressable Market) for a startup?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Venture capitalists typically look for a TAM of at least $1 Billion to ensure venture-scale returns." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "How many slides should a pitch deck have?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "The industry standard is 10 to 12 slides covering the Problem, Solution, Market, Model, Traction, Competition, and Team." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>
          </div>
     );
}