"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
     ListChecks, FileText, Settings, Printer, Copy, Check,
     Sparkles, FileCode2, RefreshCw, AlertCircle, Info, ShieldCheck, Variable
} from "lucide-react";
import AdSlot from "@/components/ui/AdSlot";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

type SopSection = {
     prerequisites: string[];
     steps: string[];
     troubleshooting: string[];
};

export default function AutomatedSopBuilder() {
     const [title, setTitle] = useState("Server Deployment Process");
     const [department, setDepartment] = useState("Engineering");
     const [author, setAuthor] = useState("Admin");
     const [rawText, setRawText] = useState("");
     const [isProcessing, setIsProcessing] = useState(false);
     const [isCopied, setIsCopied] = useState(false);
     const [documentId] = useState(`SOP-${Math.floor(1000 + Math.random() * 9000)}`);
     const [currentDate] = useState(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));

     const [sopData, setSopData] = useState<SopSection | null>(null);
     const [variableValues, setVariableValues] = useState<Record<string, string>>({});

     const extractedVariables = useMemo(() => {
          const regex = /\[([^\]]+)\]/g;
          const matches = Array.from(rawText.matchAll(regex)).map(m => m[1]);
          return Array.from(new Set(matches));
     }, [rawText]);

     const handleVariableChange = (variable: string, value: string) => {
          setVariableValues(prev => ({ ...prev, [variable]: value }));
     };

     const generateSop = () => {
          if (!rawText.trim()) return;
          setIsProcessing(true);

          setTimeout(() => {
               const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
               const prerequisites: string[] = [];
               const troubleshooting: string[] = [];
               const steps: string[] = [];

               lines.forEach(line => {
                    const lower = line.toLowerCase();
                    if (lower.startsWith('prerequisite') || lower.includes('you need') || lower.includes('require') || lower.includes('credentials') || lower.includes('must have')) {
                         prerequisites.push(line.replace(/^(prerequisites?:|you need to|require|must have)\s*/i, ''));
                    }
                    else if (lower.includes('if it fails') || lower.includes('error') || lower.includes('troubleshoot') || lower.includes('issue') || lower.includes('fails')) {
                         troubleshooting.push(line);
                    }
                    else {
                         let cleanStep = line.replace(/^(step \d+:?|first,?|then,?|next,?|finally,?|after that,?)\s*/i, '');
                         cleanStep = cleanStep.charAt(0).toUpperCase() + cleanStep.slice(1);
                         steps.push(cleanStep);
                    }
               });

               setSopData({ prerequisites, steps, troubleshooting });
               setIsProcessing(false);
          }, 600);
     };

     const handlePrint = () => window.print();
     useKeyboardShortcuts([{ key: "p", ctrlOrCmd: true, action: handlePrint }]);

     const injectVariablesToString = (text: string) => {
          let injected = text;
          extractedVariables.forEach(v => {
               const val = variableValues[v];
               if (val) injected = injected.replace(new RegExp(`\\[${v}\\]`, 'g'), `**${val}**`);
          });
          return injected;
     };

     const copyMarkdown = () => {
          if (!sopData) return;
          const preReqs = sopData.prerequisites.map(p => `- [ ] ${injectVariablesToString(p)}`).join('\n');
          const standardSteps = sopData.steps.map((s, i) => `${i + 1}. [ ] ${injectVariablesToString(s)}`).join('\n');
          const issues = sopData.troubleshooting.map(t => `- ${injectVariablesToString(t)}`).join('\n');

          const md = `# ${title}\n**Document ID:** ${documentId} | **Department:** ${department} | **Author:** ${author} | **Date:** ${currentDate}\n\n## Prerequisites\n${preReqs}\n\n## Standard Operating Procedure\n${standardSteps}\n\n## Troubleshooting & Exceptions\n${issues}`;

          navigator.clipboard.writeText(md);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
     };

     const formatVariablesJSX = (text: string) => {
          const parts = text.split(/(\[[^\]]+\])/g);
          return parts.map((part, i) => {
               const match = part.match(/^\[([^\]]+)\]$/);
               if (match) {
                    const varName = match[1];
                    const val = variableValues[varName];
                    if (val) {
                         return <span key={i} className="font-black text-indigo-600 bg-indigo-50 px-1 rounded print-text print-bg border border-indigo-200">{val}</span>;
                    }
                    return <span key={i} className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-600 px-1 rounded border border-amber-200 dark:border-amber-500/30 font-mono text-[11px] print-muted">{part}</span>;
               }
               return part;
          });
     };

     return (
          <div className="w-full flex flex-col gap-6">
               <style jsx global>{`
                    @media print {
                         @page { size: A4 portrait; margin: 15mm; }
                         body * { visibility: hidden; }
                         #printable-sop, #printable-sop * { visibility: visible; }
                         #printable-sop {
                              position: absolute; left: 0; top: 0; width: 100% !important;
                              background: white !important; color: black !important;
                              margin: 0 !important; padding: 0 !important;
                         }
                         #printable-sop .print-border { border-color: #ddd !important; }
                         #printable-sop .print-bg { background-color: transparent !important; }
                         #printable-sop .print-text { color: #111 !important; }
                         #printable-sop .print-muted { color: #555 !important; }
                         #printable-sop .print-checkbox { border: 2px solid #999 !important; border-radius: 4px; width: 14px; height: 14px; display: inline-block; }
                    }
               `}</style>

               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                              <ListChecks size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Automated SOP & Process Builder</h2>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Generate formatting SOPs, extract template variables dynamically, and export to PDF.</p>
                         </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <button onClick={handlePrint} disabled={!sopData} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md dark:shadow-lg dark:shadow-emerald-600/25 disabled:opacity-50 disabled:cursor-not-allowed" title="Shortcut: Ctrl+P">
                              <Printer size={16} /> Export PDF
                         </button>
                    </div>
               </div>

               <AdSlot adSlot="top-sop-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2 print:hidden" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-5 flex flex-col gap-6 print:hidden">
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 flex flex-col gap-5 shadow-sm dark:shadow-xl transition-colors">
                              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-300 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800/60 pb-3">
                                   <Settings size={16} className="text-emerald-600 dark:text-emerald-400" /> Document Metadata
                              </h3>
                              <div className="space-y-3">
                                   <div>
                                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Process Title</label>
                                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white outline-none focus:border-emerald-500/50 transition-colors" />
                                   </div>
                                   <div className="grid grid-cols-2 gap-3">
                                        <div>
                                             <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Department</label>
                                             <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white outline-none focus:border-emerald-500/50 transition-colors" />
                                        </div>
                                        <div>
                                             <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Author / Owner</label>
                                             <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white outline-none focus:border-emerald-500/50 transition-colors" />
                                        </div>
                                   </div>
                              </div>

                              <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800/60">
                                   <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-gray-900 dark:text-gray-300 flex items-center gap-2">
                                             <FileText size={16} className="text-blue-600 dark:text-blue-400" /> Raw Process Description
                                        </label>
                                   </div>
                                   <textarea
                                        value={rawText}
                                        onChange={(e) => setRawText(e.target.value)}
                                        placeholder="Type your process here in plain english...&#10;&#10;E.g.,&#10;You need admin access to the AWS console.&#10;First, log into the dashboard.&#10;Then, navigate to EC2 instances.&#10;Restart the server instance labeled [Instance_ID].&#10;If it fails to reboot, contact DevOps immediately."
                                        className="w-full min-h-[160px] bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-xs font-mono text-gray-700 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all resize-none leading-relaxed"
                                   />
                                   <p className="text-[10px] text-gray-500 flex items-center gap-1.5"><Info size={12} /> Wrap text in [Brackets] to generate dynamic fillable fields.</p>
                              </div>

                              <button onClick={generateSop} disabled={!rawText.trim() || isProcessing} className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl transition-all shadow-md dark:shadow-lg dark:shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                   {isProcessing ? <span className="flex items-center gap-2 animate-pulse"><RefreshCw size={18} className="animate-spin" /> Structuring Document...</span> : <><Sparkles size={18} /> Generate SOP Document</>}
                              </button>

                              {extractedVariables.length > 0 && sopData && (
                                   <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800/60 animate-in fade-in slide-in-from-bottom-4">
                                        <label className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                                             <Variable size={16} /> Dynamic Template Variables
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                             {extractedVariables.map((variable, i) => (
                                                  <div key={i}>
                                                       <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">{variable}</label>
                                                       <input
                                                            type="text"
                                                            value={variableValues[variable] || ""}
                                                            onChange={(e) => handleVariableChange(variable, e.target.value)}
                                                            placeholder={`Enter ${variable}...`}
                                                            className="w-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-amber-200 outline-none focus:border-amber-500/60 transition-colors"
                                                       />
                                                  </div>
                                             ))}
                                        </div>
                                   </div>
                              )}
                         </div>
                    </div>

                    <div className="lg:col-span-7 flex flex-col gap-6">
                         <div className="flex justify-end print:hidden">
                              <button onClick={copyMarkdown} disabled={!sopData} className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-900 dark:text-white font-bold px-4 py-2 rounded-lg text-xs transition-all disabled:opacity-50 shadow-sm dark:shadow-none">
                                   {isCopied ? <Check size={14} className="text-emerald-600 dark:text-emerald-400" /> : <FileCode2 size={14} />} {isCopied ? "Markdown Copied!" : "Copy to Notion / Markdown"}
                              </button>
                         </div>

                         <div id="printable-sop" className={`bg-white dark:bg-gray-50 rounded-3xl p-8 md:p-12 shadow-sm dark:shadow-2xl border border-gray-200 transition-all min-h-[600px] ${!sopData ? "opacity-50 blur-sm pointer-events-none" : ""}`}>
                              <div className="border-b-2 border-gray-900 pb-6 mb-6 print-border">
                                   <div className="flex justify-between items-start mb-4">
                                        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight print-text">{title || "Standard Operating Procedure"}</h1>
                                        <ShieldCheck size={36} className="text-emerald-600 print-muted" />
                                   </div>
                                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-100 p-4 rounded-xl border border-gray-200 print-bg print-border">
                                        <div><span className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider print-muted">Document ID</span><span className="font-mono text-xs font-bold text-gray-900 print-text">{documentId}</span></div>
                                        <div><span className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider print-muted">Department</span><span className="text-xs font-bold text-gray-900 print-text">{department || "N/A"}</span></div>
                                        <div><span className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider print-muted">Owner</span><span className="text-xs font-bold text-gray-900 print-text">{author || "N/A"}</span></div>
                                        <div><span className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider print-muted">Last Updated</span><span className="text-xs font-bold text-gray-900 print-text">{currentDate}</span></div>
                                   </div>
                              </div>

                              {sopData && (
                                   <div className="space-y-8">
                                        {sopData.prerequisites.length > 0 && (
                                             <div className="space-y-3">
                                                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-1 print-text print-border">1.0 Prerequisites & Requirements</h3>
                                                  <ul className="space-y-2">
                                                       {sopData.prerequisites.map((req, i) => (
                                                            <li key={i} className="flex items-start gap-3 text-sm text-gray-700 print-text">
                                                                 <div className="mt-1 w-3.5 h-3.5 rounded border-2 border-gray-300 print-checkbox flex-shrink-0"></div>
                                                                 <span>{formatVariablesJSX(req)}</span>
                                                            </li>
                                                       ))}
                                                  </ul>
                                             </div>
                                        )}

                                        <div className="space-y-3">
                                             <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-1 print-text print-border">2.0 Step-by-Step Procedure</h3>
                                             {sopData.steps.length === 0 ? (
                                                  <p className="text-sm text-gray-500 italic print-muted">No procedural steps identified in the text.</p>
                                             ) : (
                                                  <div className="space-y-4">
                                                       {sopData.steps.map((step, i) => (
                                                            <div key={i} className="flex items-start gap-4 p-3 bg-white border border-gray-200 rounded-lg shadow-sm print-border">
                                                                 <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 font-bold text-xs print-bg print-text">{i + 1}</div>
                                                                 <div className="flex-grow pt-0.5"><p className="text-sm text-gray-800 font-medium leading-relaxed print-text">{formatVariablesJSX(step)}</p></div>
                                                                 <div className="flex-shrink-0 pt-0.5"><div className="w-5 h-5 rounded border-2 border-gray-300 print-checkbox"></div></div>
                                                            </div>
                                                       ))}
                                                  </div>
                                             )}
                                        </div>

                                        {sopData.troubleshooting.length > 0 && (
                                             <div className="space-y-3">
                                                  <h3 className="text-sm font-black text-rose-600 uppercase tracking-widest border-b border-rose-200 pb-1 flex items-center gap-2 print-text print-border">
                                                       <AlertCircle size={16} /> 3.0 Troubleshooting & Exceptions
                                                  </h3>
                                                  <ul className="space-y-2 bg-rose-50 p-4 rounded-xl border border-rose-200 print-bg print-border">
                                                       {sopData.troubleshooting.map((issue, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-sm text-rose-900 print-text">
                                                                 <span className="text-rose-500 font-bold mt-0.5">•</span>
                                                                 <span>{formatVariablesJSX(issue)}</span>
                                                            </li>
                                                       ))}
                                                  </ul>
                                             </div>
                                        )}
                                   </div>
                              )}
                         </div>
                    </div>
               </div>

               {/* ========================================= */}
               {/* SEO CONTENT & FAQS */}
               {/* ========================================= */}
               <div className="mt-12 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm dark:shadow-none print:hidden">
                    <div className="prose dark:prose-invert max-w-none">
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Free Automated SOP Generator & Process Builder</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              Writing Standard Operating Procedures (SOPs) is critical for scaling teams, maintaining quality, and passing compliance audits. ToolLok's <strong>Automated SOP Builder</strong> uses a smart heuristic engine to instantly transform your messy, plain-text notes into beautifully formatted, printable checklists. Easily define templates with dynamic bracket variables `[Like_This]` and export the results to Markdown or PDF. Explore more <Link href="/categories/productivity-tools" className="text-emerald-600 dark:text-emerald-400 hover:underline">Productivity Tools</Link> to optimize your workflow.
                         </p>
                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Key Benefits of SOP Standardization</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Consistency:</strong> Ensures every team member executes complex processes (like server deployments or QA testing) exactly the same way.</li>
                              <li><strong>Faster Onboarding:</strong> Accelerate new hire training by providing clear, step-by-step checklists with built-in troubleshooting guides.</li>
                              <li><strong>Dynamic Templates:</strong> Re-use standard processes across different clients or projects using our intelligent variable extraction engine.</li>
                         </ul>
                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">How do dynamic variables work?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">By placing text inside square brackets (e.g., `[Client_Name]`), the tool automatically extracts it and provides an input field. Once filled, it instantly updates all instances across the entire SOP document.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Can I export the SOP to Notion or Obsidian?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Yes! Use the "Copy to Notion / Markdown" button to instantly copy the generated SOP. You can then paste it directly into any markdown-supported platform like Notion, Obsidian, or GitHub.</p>
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
                                             "name": "How do dynamic variables work?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "By placing text inside square brackets (e.g., [Client_Name]), the tool extracts it and provides an input field to update all instances across the document instantly." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "Can I export the SOP to Notion or Obsidian?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Yes! Use the Copy to Notion / Markdown button to copy the generated SOP and paste it into any markdown-supported platform." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-sop-ad" format="fluid" className="mt-4 print:hidden" />

          </div>
     );
}