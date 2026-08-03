"use client";

import { useState, useMemo } from "react";
import {
     ShieldCheck, EyeOff, Copy, Check, Lock, Mail,
     Phone, CreditCard, Key, Globe, FileText, AlertTriangle,
     Settings2, Activity, Bitcoin, FileCode2, Fingerprint,
     ToggleLeft, ToggleRight, Scale
} from "lucide-react";
import AdSlot from "@/components/ui/AdSlot";

type PiiCategory = "email" | "phone" | "creditCard" | "ssn" | "apiKey" | "ipAddress" | "jwt" | "crypto" | "uuid";
type RedactionMode = "strict" | "mock";

export default function BrowserPiiScrubber() {
     const [rawText, setRawText] = useState("");
     const [redactionMode, setRedactionMode] = useState<RedactionMode>("strict");
     const [replacementToken, setReplacementToken] = useState("[REDACTED]");
     const [isCopied, setIsCopied] = useState(false);

     // Toggle states for different PII categories
     const [activeScrubbers, setActiveScrubbers] = useState<Record<PiiCategory, boolean>>({
          email: true,
          phone: true,
          creditCard: true,
          ssn: true,
          apiKey: true,
          ipAddress: true,
          jwt: true,
          crypto: true,
          uuid: false // Off by default as UUIDs are often safe system identifiers
     });

     const toggleScrubber = (category: PiiCategory) => {
          setActiveScrubbers(prev => ({ ...prev, [category]: !prev[category] }));
     };

     // 100% Client-Side Regex Redaction & Mock Engine
     const { redactedText, highlightedHtml, matchCount, complianceRisks } = useMemo(() => {
          if (!rawText.trim()) return { redactedText: "", highlightedHtml: "", matchCount: 0, complianceRisks: [] };

          let count = 0;
          let processedText = rawText;
          let htmlText = rawText.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // Escape HTML first
          const detectedCompliance = new Set<string>();

          // Regex Dictionaries with Fake Data Generators
          const patterns: { category: PiiCategory; regex: RegExp; label: string; mock: string; compliance: string }[] = [
               { category: "jwt", regex: /\beyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\b/g, label: "JWT TOKEN", mock: "eyJmYWtl.dG9rZW4.c2lnbmF0dXJl", compliance: "Session Hijacking Risk" },
               { category: "apiKey", regex: /\b(?:sk_live_|pk_live_|sk_test_|pk_test_|gh[pousr]_[a-zA-Z0-9]{36}|xox[bpa]-[a-zA-Z0-9]{10,})\b/g, label: "API KEY", mock: "sk_fake_xxxxxxxxxxxxxxxx", compliance: "Credential Leak" },
               { category: "creditCard", regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b|\b(?:\d{4}[-\s]?){3}\d{3}\b/g, label: "CREDIT CARD", mock: "4000-0000-0000-0000", compliance: "PCI-DSS Violation" },
               { category: "ssn", regex: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g, label: "SSN", mock: "XXX-XX-0000", compliance: "HIPAA / Identity Risk" },
               { category: "crypto", regex: /\b(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{39,59}|0x[a-fA-F0-9]{40})\b/g, label: "CRYPTO WALLET", mock: "0x00000000000000000000", compliance: "Financial Traceability" },
               { category: "email", regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, label: "EMAIL", mock: "anon_user@secure.net", compliance: "GDPR / CCPA" },
               { category: "phone", regex: /\b(?:\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g, label: "PHONE", mock: "555-0199-0000", compliance: "GDPR / CCPA" },
               { category: "ipAddress", regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, label: "IP ADDRESS", mock: "127.0.0.1", compliance: "GDPR / CCPA" },
               { category: "uuid", regex: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, label: "UUID", mock: "00000000-0000-0000-0000-000000000000", compliance: "Internal Architecture Leak" }
          ];

          patterns.forEach(({ category, regex, label, mock, compliance }) => {
               if (activeScrubbers[category]) {
                    let categoryMatchCount = 0;

                    // Redact Plain Text (For Copying)
                    processedText = processedText.replace(regex, () => {
                         count++;
                         categoryMatchCount++;
                         return redactionMode === "strict" ? replacementToken : mock;
                    });

                    // Highlight HTML (For Visual Preview)
                    htmlText = htmlText.replace(regex, () => {
                         const displayToken = redactionMode === "strict" ? replacementToken : mock;
                         return `<span class="bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded border border-emerald-500/30 font-bold text-[10px]" title="Scrubbed ${label}">${displayToken}</span>`;
                    });

                    if (categoryMatchCount > 0) {
                         detectedCompliance.add(compliance);
                    }
               }
          });

          return {
               redactedText: processedText,
               highlightedHtml: htmlText,
               matchCount: count,
               complianceRisks: Array.from(detectedCompliance)
          };
     }, [rawText, activeScrubbers, replacementToken, redactionMode]);

     const copyRedacted = () => {
          if (!redactedText) return;
          navigator.clipboard.writeText(redactedText);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
     };

     return (
          <div className="w-full flex flex-col gap-6">

               {/* Header Section */}
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                              <ShieldCheck size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-white">Browser-Side PII Data Scrubber</h2>
                                   <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-400">Strip sensitive data and auto-generate structural mock values locally before pasting into ChatGPT/Claude.</p>
                         </div>
                    </div>
               </div>

               {/* Zero-Retention Guarantee Banner */}
               <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
                    <Lock size={20} className="text-emerald-400 flex-shrink-0" />
                    <p className="text-xs text-emerald-100/80 leading-relaxed">
                         <strong className="text-emerald-400">Zero-Retention Guarantee:</strong> This tool operates entirely within your browser&apos;s local memory using JavaScript. No data is transmitted to our servers, no APIs are called, and nothing is logged.
                    </p>
               </div>

               {/* Top Ad Banner */}
               <AdSlot adSlot="top-pii-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* LEFT COLUMN: Input & Settings (Span 5) */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                         <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl flex flex-col gap-5">

                              <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2 border-b border-gray-800/80 pb-3">
                                   <FileText size={16} className="text-emerald-400" /> Input Payload
                              </h3>

                              {/* Input Textarea */}
                              <div className="flex-grow flex flex-col gap-2">
                                   <textarea
                                        value={rawText}
                                        onChange={(e) => setRawText(e.target.value)}
                                        placeholder="Paste your raw code, logs, or document here...&#10;&#10;e.g. 'User john.doe@email.com with IP 192.168.1.1 made a purchase using card 4444-5555-6666-7777...'"
                                        className="w-full min-h-[220px] bg-gray-950 border border-gray-800 rounded-xl p-4 text-xs font-mono text-gray-300 outline-none focus:border-emerald-500/50 resize-y leading-relaxed"
                                        spellCheck="false"
                                   />
                              </div>

                              {/* Scrubber Settings */}
                              <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-4">

                                   <div className="flex items-center justify-between pb-3 border-b border-gray-800/80">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5"><Settings2 size={12} /> Redaction Mode</span>
                                        <button
                                             onClick={() => setRedactionMode(prev => prev === "strict" ? "mock" : "strict")}
                                             className="flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-white transition-colors"
                                        >
                                             {redactionMode === "strict" ? (
                                                  <><ToggleLeft size={20} className="text-emerald-500" /> Strict Replace</>
                                             ) : (
                                                  <><ToggleRight size={20} className="text-cyan-400" /> Smart Mock Data</>
                                             )}
                                        </button>
                                   </div>

                                   {redactionMode === "strict" && (
                                        <div className="flex items-center justify-between">
                                             <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Custom Token</span>
                                             <input
                                                  type="text"
                                                  value={replacementToken}
                                                  onChange={(e) => setReplacementToken(e.target.value)}
                                                  placeholder="[REDACTED]"
                                                  className="w-28 bg-gray-900 border border-gray-700 rounded-md px-2 py-1 text-[10px] text-center text-emerald-400 font-bold outline-none focus:border-emerald-500/50"
                                             />
                                        </div>
                                   )}

                                   <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                                        {/* Standard PII */}
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                             <input type="checkbox" checked={activeScrubbers.email} onChange={() => toggleScrubber("email")} className="rounded text-emerald-500 focus:ring-0 bg-gray-900 border-gray-700" />
                                             <span className="flex items-center gap-1.5 text-gray-300 group-hover:text-white transition-colors"><Mail size={12} className="text-gray-500" /> Emails</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                             <input type="checkbox" checked={activeScrubbers.phone} onChange={() => toggleScrubber("phone")} className="rounded text-emerald-500 focus:ring-0 bg-gray-900 border-gray-700" />
                                             <span className="flex items-center gap-1.5 text-gray-300 group-hover:text-white transition-colors"><Phone size={12} className="text-gray-500" /> Phones</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                             <input type="checkbox" checked={activeScrubbers.creditCard} onChange={() => toggleScrubber("creditCard")} className="rounded text-emerald-500 focus:ring-0 bg-gray-900 border-gray-700" />
                                             <span className="flex items-center gap-1.5 text-gray-300 group-hover:text-white transition-colors"><CreditCard size={12} className="text-gray-500" /> Credit Cards</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                             <input type="checkbox" checked={activeScrubbers.ssn} onChange={() => toggleScrubber("ssn")} className="rounded text-emerald-500 focus:ring-0 bg-gray-900 border-gray-700" />
                                             <span className="flex items-center gap-1.5 text-gray-300 group-hover:text-white transition-colors"><Lock size={12} className="text-gray-500" /> SSNs</span>
                                        </label>

                                        {/* Technical / Developer PII */}
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                             <input type="checkbox" checked={activeScrubbers.ipAddress} onChange={() => toggleScrubber("ipAddress")} className="rounded text-emerald-500 focus:ring-0 bg-gray-900 border-gray-700" />
                                             <span className="flex items-center gap-1.5 text-gray-300 group-hover:text-white transition-colors"><Globe size={12} className="text-gray-500" /> IPs</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                             <input type="checkbox" checked={activeScrubbers.apiKey} onChange={() => toggleScrubber("apiKey")} className="rounded text-emerald-500 focus:ring-0 bg-gray-900 border-gray-700" />
                                             <span className="flex items-center gap-1.5 text-gray-300 group-hover:text-white transition-colors"><Key size={12} className="text-gray-500" /> API Keys</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                             <input type="checkbox" checked={activeScrubbers.jwt} onChange={() => toggleScrubber("jwt")} className="rounded text-emerald-500 focus:ring-0 bg-gray-900 border-gray-700" />
                                             <span className="flex items-center gap-1.5 text-gray-300 group-hover:text-white transition-colors"><FileCode2 size={12} className="text-gray-500" /> JWT Tokens</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                             <input type="checkbox" checked={activeScrubbers.crypto} onChange={() => toggleScrubber("crypto")} className="rounded text-emerald-500 focus:ring-0 bg-gray-900 border-gray-700" />
                                             <span className="flex items-center gap-1.5 text-gray-300 group-hover:text-white transition-colors"><Bitcoin size={12} className="text-gray-500" /> Crypto Wallets</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group col-span-2 mt-1 pt-2 border-t border-gray-800/80">
                                             <input type="checkbox" checked={activeScrubbers.uuid} onChange={() => toggleScrubber("uuid")} className="rounded text-emerald-500 focus:ring-0 bg-gray-900 border-gray-700" />
                                             <span className="flex items-center gap-1.5 text-gray-400 group-hover:text-white transition-colors"><Fingerprint size={12} className="text-gray-500" /> Scrub Internal UUIDs & GUIDs (Optional)</span>
                                        </label>
                                   </div>
                              </div>

                         </div>
                    </div>

                    {/* RIGHT COLUMN: Output Dashboard & Compliance Audit (Span 7) */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                         <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4 min-h-[450px]">

                              {/* Header & Stats */}
                              <div className="flex flex-wrap items-center justify-between border-b border-gray-800/80 pb-3 gap-4">
                                   <div className="flex items-center gap-2">
                                        <EyeOff size={16} className="text-emerald-400" />
                                        <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Sanitized Output</span>
                                   </div>

                                   <div className="flex items-center gap-2">
                                        {matchCount > 0 && (
                                             <span className="flex items-center gap-1.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                                                  <Activity size={12} /> {matchCount} Entities Redacted
                                             </span>
                                        )}
                                   </div>
                              </div>

                              {/* Visual Preview Box */}
                              <div className="flex-grow relative min-h-[250px]">
                                   {!rawText.trim() ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 gap-3 bg-[#0d1117] border border-gray-800/80 rounded-xl">
                                             <ShieldCheck size={48} className="opacity-20 text-emerald-500" />
                                             <p className="text-xs max-w-[250px] text-center">Awaiting payload. Output will appear here with detected PII visually highlighted and replaced.</p>
                                        </div>
                                   ) : (
                                        <div
                                             className="absolute inset-0 bg-[#0d1117] border border-gray-800/80 rounded-xl p-5 text-xs font-mono text-gray-300 leading-relaxed overflow-y-auto whitespace-pre-wrap shadow-inner custom-scrollbar"
                                             dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                                        />
                                   )}
                              </div>

                              {/* Compliance Risk Report */}
                              {complianceRisks.length > 0 && (
                                   <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2">
                                        <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                                             <Scale size={12} /> Compliance Hazards Prevented
                                        </h4>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                             {complianceRisks.map((risk, idx) => (
                                                  <span key={idx} className="bg-rose-950 border border-rose-800 text-rose-300 text-[10px] px-2 py-1 rounded-md font-bold">
                                                       {risk}
                                                  </span>
                                             ))}
                                        </div>
                                   </div>
                              )}

                              {/* Action Footer */}
                              <div className="pt-2 border-t border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                   <span className="text-[10px] text-gray-500 flex items-center gap-1.5">
                                        <Check size={12} className="text-emerald-500" /> Safe to copy to ChatGPT / Claude
                                   </span>
                                   <button
                                        onClick={copyRedacted}
                                        disabled={!rawText.trim()}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                   >
                                        {isCopied ? <Check size={14} /> : <Copy size={14} />}
                                        {isCopied ? "Copied Safe Data!" : "Copy Safe Output"}
                                   </button>
                              </div>

                         </div>
                    </div>

               </div>

               {/* Bottom Ad Banner */}
               <AdSlot adSlot="bottom-pii-ad" format="fluid" className="mt-4" />

          </div>
     );
}