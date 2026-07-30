"use client";

import { useState, useMemo, useRef } from "react";
import { ShieldAlert, ShieldCheck, Copy, Check, FileText, AlertTriangle, Sparkles, Scale, Lock, Upload, Mail, Globe, Plus, Trash2 } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import AdSlot from "@/components/ui/AdSlot";

interface RiskFlag {
     category: string;
     severity: "High" | "Medium" | "Low";
     description: string;
     recommendation: string;
}

export default function LegalContractScanner() {
     const [activeTab, setActiveTab] = useState<"audit" | "jurisdiction" | "email">("audit");
     const [contractText, setContractText] = useState<string>(
          "The Contractor agrees to indemnify and hold harmless the Client from all claims arising out of this agreement. The Client owns all intellectual property created indefinitely. The Client may terminate this agreement at any time without notice. Contractor agrees to a 2-year non-compete clause. This agreement shall be governed by the laws of Delaware."
     );
     const [customKeywords, setCustomKeywords] = useState<string[]>(["net 90", "exclusive"]);
     const [newKeyword, setNewKeyword] = useState<string>("");

     const fileInputRef = useRef<HTMLInputElement>(null);
     const { isCopied, copy } = useCopyToClipboard(2000);

     // File Upload Handler (.txt, .md)
     const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (event) => {
               const content = event.target?.result as string;
               if (content) setContractText(content);
          };
          reader.readAsText(file);
     };

     const addCustomKeyword = () => {
          if (newKeyword.trim() && !customKeywords.includes(newKeyword.toLowerCase().trim())) {
               setCustomKeywords([...customKeywords, newKeyword.toLowerCase().trim()]);
               setNewKeyword("");
          }
     };

     const removeCustomKeyword = (kw: string) => {
          setCustomKeywords(customKeywords.filter(k => k !== kw));
     };

     // Heuristic Risk Scanner Engine
     const auditResult = useMemo(() => {
          const text = contractText.toLowerCase();
          const wordCount = contractText.trim().split(/\s+/).filter(Boolean).length;

          const flags: RiskFlag[] = [];

          if (text.includes("indemnify") || text.includes("hold harmless")) {
               flags.push({
                    category: "Indemnification Risk",
                    severity: "High",
                    description: "Broad indemnification clause detected. You may be held liable for third-party losses beyond your control.",
                    recommendation: "Limit indemnification strictly to direct damages caused by your proven gross negligence or willful misconduct."
               });
          }

          if (text.includes("intellectual property") || text.includes("owns all")) {
               flags.push({
                    category: "IP Assignment",
                    severity: "High",
                    description: "Full perpetual assignment of all background IP or future creations without final payment contingencies.",
                    recommendation: "Ensure IP ownership transfers only upon receipt of final payment in full."
               });
          }

          if (text.includes("terminate") || text.includes("without notice")) {
               flags.push({
                    category: "Unilateral Termination",
                    severity: "Medium",
                    description: "Client can terminate at any moment without notice or kill fee compensation for work completed.",
                    recommendation: "Add a 14-day written notice requirement and payment for all work rendered up to termination."
               });
          }

          if (text.includes("non-compete") || text.includes("compete")) {
               flags.push({
                    category: "Non-Compete Restriction",
                    severity: "High",
                    description: "Restrictive non-compete clause across broad jurisdictions or lengthy timeframes.",
                    recommendation: "Narrow the non-compete scope to specific direct competitor projects during active engagement only."
               });
          }

          if (text.includes("unlimited") || text.includes("liability")) {
               flags.push({
                    category: "Unlimited Liability",
                    severity: "High",
                    description: "No liability cap mentioned, exposing your business assets to disproportionate damages.",
                    recommendation: "Cap total contractor liability to the total fees paid under this agreement."
               });
          }

          // Custom keywords check
          customKeywords.forEach(kw => {
               if (text.includes(kw)) {
                    flags.push({
                         category: `Custom Rule Flag: "${kw}"`,
                         severity: "Medium",
                         description: `Your custom monitored term "${kw}" was detected in this contract text.`,
                         recommendation: `Review clause containing "${kw}" to ensure it aligns with your company terms.`
                    });
               }
          });

          let riskScore = 100 - (flags.filter(f => f.severity === "High").length * 22) - (flags.filter(f => f.severity === "Medium").length * 10);
          riskScore = Math.max(15, riskScore);

          return {
               riskScore,
               flags,
               wordCount
          };
     }, [contractText, customKeywords]);

     // Jurisdiction Analyzer
     const jurisdictionInfo = useMemo(() => {
          const text = contractText.toLowerCase();
          let location = "Not Explicitly Specified";
          let isForeignRisk = false;

          if (text.includes("delaware")) location = "State of Delaware (Standard US Corporate)";
          else if (text.includes("california")) location = "State of California";
          else if (text.includes("new york")) location = "State of New York";
          else if (text.includes("united kingdom") || text.includes("uk law")) location = "United Kingdom (UK)";
          else if (text.includes("singapore")) location = "Singapore";

          if (text.includes("governing law") || text.includes("jurisdiction") || text.includes("courts of")) {
               isForeignRisk = true;
          }

          return { location, isForeignRisk };
     }, [contractText]);

     // Negotiation Email Generator
     const negotiationEmail = useMemo(() => {
          const highRisks = auditResult.flags.filter(f => f.severity === "High").map(f => f.category).join(", ");
          return {
               subject: `Review & Proposed Adjustments: Service Agreement`,
               body: `Hi [Client Name],\n\nThank you for sharing the agreement. I'm excited to collaborate!\n\nI reviewed the contract and would like to propose a few minor adjustments regarding ${highRisks || 'liability and IP terms'} to ensure alignment for both of us:\n\n1. Limiting indemnification to direct damages from proven gross negligence.\n2. Ensuring IP ownership transfers upon receipt of final payment.\n3. Adding a 14-day notice period for termination.\n\nOnce updated, I'll sign and return right away. Let me know if these small tweaks work for you!\n\nBest regards,\n[Your Name]`
          };
     }, [auditResult.flags]);

     const auditReportText = `=== TOOOLOK LEGAL CONTRACT AUDIT REPORT ===\nSafety Score: ${auditResult.riskScore}/100\nJurisdiction: ${jurisdictionInfo.location}\nTotal Flags: ${auditResult.flags.length}\n\nRisks:\n` +
          auditResult.flags.map(f => `- [${f.severity}] ${f.category}: ${f.description}`).join('\n');

     useKeyboardShortcuts([
          { key: "c", ctrlOrCmd: true, action: () => copy(auditReportText) }
     ]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">

               {/* Header Section */}
               <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 border border-amber-500/20">
                              <Scale size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-white">Legal Contract AI Risk Scanner & Clause Auditor</h2>
                                   <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-400">Scan contracts for predatory clauses, jurisdiction risks, custom rules, and negotiation emails.</p>
                         </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-xl text-xs text-amber-400">
                         <Lock size={16} />
                         <span>Client-Side Secure Scan</span>
                    </div>
               </div>

               {/* Top Ad Banner */}
               <AdSlot adSlot="top-legalscan-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               {/* Navigation Tabs */}
               <div className="flex flex-wrap gap-2 bg-gray-900 border border-gray-800 p-2 rounded-2xl">
                    <button
                         onClick={() => setActiveTab("audit")}
                         className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "audit" ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30' : 'text-gray-400 hover:text-white'}`}
                    >
                         <ShieldCheck size={14} /> Risk & Safety Score
                    </button>
                    <button
                         onClick={() => setActiveTab("jurisdiction")}
                         className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "jurisdiction" ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30' : 'text-gray-400 hover:text-white'}`}
                    >
                         <Globe size={14} /> Jurisdiction & Venue
                    </button>
                    <button
                         onClick={() => setActiveTab("email")}
                         className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "email" ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30' : 'text-gray-400 hover:text-white'}`}
                    >
                         <Mail size={14} /> Negotiation Email Generator
                    </button>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Contract Text & Upload */}
                    <div className="lg:col-span-6 bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col gap-5">
                         <div className="flex items-center justify-between border-b border-gray-800/60 pb-3">
                              <h3 className="text-white font-bold text-base flex items-center gap-2">
                                   <FileText size={16} className="text-amber-400" /> Contract Agreement Text
                              </h3>
                              <div className="flex items-center gap-3">
                                   <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        accept=".txt,.md"
                                        className="hidden"
                                   />
                                   <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-xl transition-colors font-bold"
                                   >
                                        <Upload size={14} /> Upload (.txt)
                                   </button>
                              </div>
                         </div>

                         <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Paste Agreement ({auditResult.wordCount} words)</label>
                              <textarea
                                   rows={8}
                                   value={contractText}
                                   onChange={(e) => setContractText(e.target.value)}
                                   placeholder="Paste indemnity, IP assignment, jurisdiction, or liability clauses..."
                                   className="w-full bg-gray-950 border border-gray-700 rounded-2xl p-4 text-xs text-white outline-none resize-none leading-relaxed focus:border-amber-500 font-mono"
                              />
                         </div>

                         {/* Custom Keyword Rule Builder */}
                         <div className="flex flex-col gap-2 pt-2 border-t border-gray-800">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Custom Risk Keyword Rules</label>
                              <div className="flex gap-2">
                                   <input
                                        type="text"
                                        value={newKeyword}
                                        onChange={(e) => setNewKeyword(e.target.value)}
                                        placeholder="e.g. net 90, exclusive, arbitration"
                                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                                   />
                                   <button
                                        onClick={addCustomKeyword}
                                        className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-2 rounded-xl text-xs font-bold"
                                   >
                                        <Plus size={14} />
                                   </button>
                              </div>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                   {customKeywords.map((kw) => (
                                        <span key={kw} className="bg-gray-950 border border-gray-800 text-amber-300 px-2.5 py-1 rounded-xl text-[10px] font-mono flex items-center gap-1.5">
                                             {kw}
                                             <button onClick={() => removeCustomKeyword(kw)} className="text-gray-500 hover:text-rose-400">
                                                  <Trash2 size={12} />
                                             </button>
                                        </span>
                                   ))}
                              </div>
                         </div>
                    </div>

                    {/* Right Column: Active Tab Dynamic Dashboard */}
                    <div className="lg:col-span-6 flex flex-col gap-6">

                         {/* TAB 1: AUDIT & SCORE */}
                         {activeTab === "audit" && (
                              <div className="bg-[#0c121e] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col gap-6">
                                   <div className="flex items-center justify-between border-b border-gray-800/60 pb-3">
                                        <h3 className="text-white font-bold text-base flex items-center gap-2">
                                             <ShieldCheck size={18} className="text-emerald-400" /> Contract Safety Dashboard
                                        </h3>
                                        <button
                                             onClick={() => copy(auditReportText)}
                                             className="flex items-center gap-1.5 text-xs bg-amber-600 text-white px-3.5 py-1.5 rounded-lg font-bold shadow-lg shadow-amber-600/20"
                                        >
                                             {isCopied ? <Check size={14} className="text-emerald-200" /> : <Copy size={14} />}
                                             {isCopied ? "Copied" : "Copy Report"}
                                        </button>
                                   </div>

                                   <div className="bg-gradient-to-br from-amber-950/30 via-gray-900 to-gray-950 border border-amber-900/40 rounded-2xl p-6 flex items-center justify-between">
                                        <div>
                                             <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block mb-1">Contract Safety Score</span>
                                             <span className={`text-4xl font-extrabold font-mono ${auditResult.riskScore >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                  {auditResult.riskScore} <span className="text-lg text-gray-500">/ 100</span>
                                             </span>
                                        </div>
                                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-900 text-gray-300 border border-gray-800">
                                             {auditResult.riskScore >= 75 ? '🟢 Low Risk' : '🔴 High Risk Flags'}
                                        </span>
                                   </div>

                                   <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Detected Risks ({auditResult.flags.length})</span>
                                        {auditResult.flags.length > 0 ? (
                                             auditResult.flags.map((flag, idx) => (
                                                  <div key={idx} className="bg-gray-950 border border-gray-800 rounded-2xl p-4 flex flex-col gap-2">
                                                       <div className="flex items-center justify-between">
                                                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                                                 <AlertTriangle size={14} className="text-amber-400" /> {flag.category}
                                                            </span>
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                                 {flag.severity}
                                                            </span>
                                                       </div>
                                                       <p className="text-xs text-gray-300">{flag.description}</p>
                                                       <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-[11px] text-emerald-300 font-mono mt-1">
                                                            <strong>Suggestion:</strong> {flag.recommendation}
                                                       </div>
                                                  </div>
                                             ))
                                        ) : (
                                             <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 text-center text-emerald-400 text-xs font-semibold">
                                                  ✅ No major risk clauses detected.
                                             </div>
                                        )}
                                   </div>
                              </div>
                         )}

                         {/* TAB 2: JURISDICTION & GOVERNING LAW */}
                         {activeTab === "jurisdiction" && (
                              <div className="bg-[#0c121e] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col gap-6">
                                   <h3 className="text-white font-bold text-base flex items-center gap-2 border-b border-gray-800/60 pb-3">
                                        <Globe size={18} className="text-amber-400" /> Governing Law & Venue Analysis
                                   </h3>
                                   <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5 flex flex-col gap-3 font-mono text-xs">
                                        <div><strong className="text-gray-400">Detected Jurisdiction:</strong> <span className="text-white font-bold">{jurisdictionInfo.location}</span></div>
                                        <div><strong className="text-gray-400">Dispute Venue Risk:</strong> <span className={jurisdictionInfo.isForeignRisk ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>{jurisdictionInfo.isForeignRisk ? 'Governing law clause active. Check travel/litigation costs.' : 'Standard location'}</span></div>
                                   </div>
                              </div>
                         )}

                         {/* TAB 3: NEGOTIATION EMAIL GENERATOR */}
                         {activeTab === "email" && (
                              <div className="bg-[#0c121e] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col gap-5">
                                   <div className="flex items-center justify-between border-b border-gray-800/60 pb-3">
                                        <h3 className="text-white font-bold text-base flex items-center gap-2">
                                             <Mail size={18} className="text-amber-400" /> Counter-Proposal Email Draft
                                        </h3>
                                        <button
                                             onClick={() => copy(`${negotiationEmail.subject}\n\n${negotiationEmail.body}`)}
                                             className="flex items-center gap-1.5 text-xs bg-amber-600 text-white px-3 py-1.5 rounded-xl font-bold"
                                        >
                                             <Copy size={14} /> Copy Email
                                        </button>
                                   </div>
                                   <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4 font-mono text-xs text-gray-300 flex flex-col gap-3">
                                        <div><strong className="text-amber-400">Subject:</strong> {negotiationEmail.subject}</div>
                                        <div className="whitespace-pre-line leading-relaxed">{negotiationEmail.body}</div>
                                   </div>
                              </div>
                         )}

                    </div>
               </div>

               {/* Bottom In-Feed Ad Banner */}
               <AdSlot adSlot="bottom-legalscan-ad" format="fluid" className="mt-4" />

          </div>
     );
}