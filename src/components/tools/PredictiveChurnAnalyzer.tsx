"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { UserMinus, AlertTriangle, ShieldCheck, Activity, Copy, Check, Sliders, RefreshCw, UploadCloud, FileText, Table, ArrowRight, Zap, Download } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import AdSlot from "@/components/ui/AdSlot";

interface BatchCustomer {
     name: string; daysInactive: number; supportTickets: number; featureUsage: number;
     paymentFailures: number; nps: number; churnProbability?: number; riskLevel?: "Low" | "Medium" | "High";
}

export default function PredictiveChurnAnalyzer() {
     const [mode, setMode] = useState<"single" | "batch">("single");

     const [daysInactive, setDaysInactive] = useState<number>(14);
     const [supportTickets, setSupportTickets] = useState<number>(4);
     const [featureUsageScore, setFeatureUsageScore] = useState<number>(35);
     const [paymentFailures, setPaymentFailures] = useState<number>(1);
     const [npsScore, setNpsScore] = useState<number>(5);
     const [contractType, setContractType] = useState<"monthly" | "annual">("monthly");

     const [batchData, setBatchData] = useState<BatchCustomer[]>([
          { name: "Acme Corp", daysInactive: 22, supportTickets: 6, featureUsage: 20, paymentFailures: 2, nps: 3 },
          { name: "TechNova Inc", daysInactive: 3, supportTickets: 1, featureUsage: 85, paymentFailures: 0, nps: 9 },
          { name: "Stellar SaaS", daysInactive: 15, supportTickets: 4, featureUsage: 45, paymentFailures: 1, nps: 6 },
     ]);
     const fileInputRef = useRef<HTMLInputElement | null>(null);

     const { isCopied, copy } = useCopyToClipboard(2000);

     const calculateRisk = (inactive: number, tickets: number, usage: number, failures: number, nps: number) => {
          const inactivityScore = Math.min(100, (inactive / 30) * 100) * 0.30;
          const ticketScore = Math.min(100, (tickets / 5) * 100) * 0.20;
          const usageDisengagementScore = (100 - usage) * 0.25;
          const paymentRiskScore = Math.min(100, failures * 40) * 0.15;
          const npsRiskScore = Math.max(0, (10 - nps) * 10) * 0.10;

          const raw = inactivityScore + ticketScore + usageDisengagementScore + paymentRiskScore + npsRiskScore;
          const prob = Math.min(99, Math.max(1, Math.round(raw)));
          let risk: "Low" | "Medium" | "High" = "Low";
          if (prob >= 65) risk = "High";
          else if (prob >= 35) risk = "Medium";
          return { prob, risk };
     };

     const analysis = useMemo(() => {
          let rawChurnScore = (
               (Math.min(100, (daysInactive / 30) * 100) * 0.30) +
               (Math.min(100, (supportTickets / 5) * 100) * 0.20) +
               ((100 - featureUsageScore) * 0.25) +
               (Math.min(100, paymentFailures * 40) * 0.15) +
               (Math.max(0, (10 - npsScore) * 10) * 0.10)
          );

          if (contractType === "annual") rawChurnScore *= 0.75;
          const churnProbability = Math.min(99, Math.max(1, Math.round(rawChurnScore)));

          let riskLevel: "Low" | "Medium" | "High" = "Low";
          let statusColor = "text-emerald-600 dark:text-emerald-400";
          let badgeBg = "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20";
          const playbook: string[] = [];

          if (churnProbability >= 65) {
               riskLevel = "High"; statusColor = "text-rose-600 dark:text-rose-400"; badgeBg = "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20";
               playbook.push("Trigger immediate high-priority Customer Success Manager (CSM) outreach.");
               playbook.push("Offer a temporary 20% retention discount or complimentary onboarding audit.");
               if (paymentFailures > 0) playbook.push("Send automated dunning email sequence to update expired billing details.");
          } else if (churnProbability >= 35) {
               riskLevel = "Medium"; statusColor = "text-amber-600 dark:text-amber-400"; badgeBg = "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20";
               playbook.push("Schedule an automated in-app walkthrough highlighting unused core features.");
               playbook.push("Review open support tickets and escalate unresolved issues.");
          } else {
               riskLevel = "Low"; statusColor = "text-emerald-600 dark:text-emerald-400"; badgeBg = "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20";
               playbook.push("Account is healthy. Prompt user for an upgrade review or case study request.");
          }

          return { churnProbability, riskLevel, statusColor, badgeBg, playbook };
     }, [daysInactive, supportTickets, featureUsageScore, paymentFailures, npsScore, contractType]);

     const processedBatch = useMemo(() => {
          return batchData.map(cust => {
               const { prob, risk } = calculateRisk(cust.daysInactive, cust.supportTickets, cust.featureUsage, cust.paymentFailures, cust.nps);
               return { ...cust, churnProbability: prob, riskLevel: risk };
          });
     }, [batchData]);

     const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (event) => {
               const text = event.target?.result as string;
               if (!text) return;
               const lines = text.split("\n");
               const parsed: BatchCustomer[] = [];
               for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;
                    const cols = line.split(",");
                    if (cols.length >= 6) {
                         parsed.push({
                              name: cols[0].replace(/['"]+/g, ''), daysInactive: Number(cols[1]) || 0, supportTickets: Number(cols[2]) || 0,
                              featureUsage: Number(cols[3]) || 50, paymentFailures: Number(cols[4]) || 0, nps: Number(cols[5]) || 7
                         });
                    }
               }
               if (parsed.length > 0) setBatchData(parsed);
          };
          reader.readAsText(file);
     };

     const downloadSampleCsv = () => {
          const csv = "CustomerName,DaysInactive,SupportTickets,FeatureUsage,PaymentFailures,NPS\nAlpha Corp,18,5,25,1,4\nBeta LLC,2,0,90,0,10\nGamma Inc,30,8,10,2,2";
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url); link.setAttribute("download", "toollok_sample_cohort.csv");
          document.body.appendChild(link); link.click(); document.body.removeChild(link);
     };

     const summaryText = `Predictive Churn Analysis:\nRisk Level: ${analysis.riskLevel} (${analysis.churnProbability}% Probability)`;

     useKeyboardShortcuts([{ key: "c", ctrlOrCmd: true, action: () => copy(summaryText) }]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
               <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
                              <UserMinus size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Predictive AI Churn Risk Analyzer</h2>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Evaluate customer disengagement metrics to calculate predicted churn risk and cohort playbooks.</p>
                         </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <button onClick={() => setMode("single")} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${mode === "single" ? "bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30" : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>
                              Single Customer
                         </button>
                         <button onClick={() => setMode("batch")} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${mode === "batch" ? "bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30" : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>
                              Batch Cohort (CSV)
                         </button>
                    </div>
               </div>

               <AdSlot adSlot="top-churn-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               {mode === "single" ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                         <div className="lg:col-span-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-xl flex flex-col gap-6 transition-colors">
                              <h3 className="text-gray-900 dark:text-white font-bold text-lg border-b border-gray-100 dark:border-gray-800/60 pb-3 flex items-center gap-2">
                                   <Sliders size={18} className="text-rose-600 dark:text-rose-400" /> Behavioral Risk Signals
                              </h3>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                   <div>
                                        <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">
                                             <span>Days Since Last Login</span>
                                             <span className="text-rose-600 dark:text-rose-400 font-mono">{daysInactive} days</span>
                                        </div>
                                        <input type="range" min="0" max="60" value={daysInactive} onChange={(e) => setDaysInactive(Number(e.target.value))} className="w-full accent-rose-500 cursor-pointer" />
                                   </div>
                                   <div>
                                        <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">
                                             <span>Feature Engagement Depth</span>
                                             <span className="text-emerald-600 dark:text-emerald-400 font-mono">{featureUsageScore}%</span>
                                        </div>
                                        <input type="range" min="0" max="100" value={featureUsageScore} onChange={(e) => setFeatureUsageScore(Number(e.target.value))} className="w-full accent-emerald-500 cursor-pointer" />
                                   </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                   <div>
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Support Tickets (Last 30 Days)</label>
                                        <input type="number" value={supportTickets} onChange={(e) => setSupportTickets(Number(e.target.value) || 0)} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white font-mono outline-none focus:border-rose-500 transition-colors" />
                                   </div>
                                   <div>
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Recent Failed Payments</label>
                                        <input type="number" value={paymentFailures} onChange={(e) => setPaymentFailures(Number(e.target.value) || 0)} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-amber-600 dark:text-amber-400 font-mono outline-none focus:border-amber-500 transition-colors" />
                                   </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                   <div>
                                        <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">
                                             <span>NPS / CSAT Rating</span>
                                             <span className="text-blue-600 dark:text-blue-400 font-mono">{npsScore} / 10</span>
                                        </div>
                                        <input type="range" min="0" max="10" value={npsScore} onChange={(e) => setNpsScore(Number(e.target.value))} className="w-full accent-blue-500 cursor-pointer" />
                                   </div>
                                   <div>
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Contract Billing Type</label>
                                        <select value={contractType} onChange={(e) => setContractType(e.target.value as "monthly" | "annual")} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-rose-500 transition-colors">
                                             <option value="monthly">Monthly Subscription</option>
                                             <option value="annual">Annual Commitment</option>
                                        </select>
                                   </div>
                              </div>
                         </div>

                         <div className="lg:col-span-6 flex flex-col gap-6">
                              <div className="bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors">
                                   <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800/60 pb-3">
                                        <h3 className="text-gray-900 dark:text-white font-bold text-base flex items-center gap-2">
                                             <Activity size={18} className="text-rose-600 dark:text-rose-400" /> Churn Risk Assessment
                                        </h3>
                                        <button onClick={() => copy(summaryText)} className="flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-3.5 py-1.5 rounded-lg transition-colors font-bold shadow-sm dark:shadow-none">
                                             {isCopied ? <Check size={14} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={14} />} {isCopied ? "Copied" : "Copy Analysis"}
                                        </button>
                                   </div>

                                   <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-rose-950/30 dark:via-gray-900 dark:to-gray-950 border border-gray-200 dark:border-rose-900/40 rounded-2xl p-6 mb-6 flex items-center justify-between transition-colors">
                                        <div>
                                             <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest block mb-1">Predicted Churn Probability</span>
                                             <div className="flex items-baseline gap-2">
                                                  <span className={`text-5xl font-extrabold font-mono ${analysis.statusColor}`}>{analysis.churnProbability}%</span>
                                             </div>
                                        </div>
                                        <div className={`px-4 py-2 rounded-2xl border ${analysis.badgeBg} flex items-center gap-2`}>
                                             <AlertTriangle size={18} className={analysis.statusColor} />
                                             <span className={`text-xs font-extrabold uppercase tracking-wider ${analysis.statusColor}`}>{analysis.riskLevel} Risk</span>
                                        </div>
                                   </div>

                                   <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                             <Zap size={14} className="text-amber-500 dark:text-amber-400" /> Automated Retention Playbook
                                        </h4>
                                        <div className="space-y-2">
                                             {analysis.playbook.map((step, idx) => (
                                                  <div key={idx} className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2.5 shadow-sm dark:shadow-none transition-colors">
                                                       <ArrowRight size={14} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                                                       <span>{step}</span>
                                                  </div>
                                             ))}
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               ) : (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-xl flex flex-col gap-6 transition-colors">
                         <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800/60 pb-4">
                              <div>
                                   <h3 className="text-gray-900 dark:text-white font-bold text-lg">Cohort Batch Analyzer</h3>
                                   <p className="text-xs text-gray-500 dark:text-gray-400">Upload a CSV containing customer engagement metrics to score your entire subscriber base.</p>
                              </div>
                              <div className="flex items-center gap-3">
                                   <button onClick={downloadSampleCsv} className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-gray-200 dark:border-transparent shadow-sm dark:shadow-none">
                                        <Download size={14} className="text-cyan-600 dark:text-cyan-400" /> Sample CSV
                                   </button>
                                   <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md dark:shadow-lg dark:shadow-rose-600/20">
                                        <UploadCloud size={14} /> Upload CSV
                                   </button>
                                   <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
                              </div>
                         </div>

                         <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300 font-mono">
                                   <thead className="bg-gray-50 dark:bg-gray-950 text-gray-500 dark:text-gray-500 uppercase text-[10px] border-b border-gray-200 dark:border-gray-800">
                                        <tr>
                                             <th className="px-4 py-3">Customer Name</th><th className="px-4 py-3 text-right">Days Inactive</th><th className="px-4 py-3 text-right">Support Tickets</th><th className="px-4 py-3 text-right">Feature Usage</th><th className="px-4 py-3 text-right">Failed Payments</th><th className="px-4 py-3 text-right">NPS</th><th className="px-4 py-3 text-center">Churn Risk</th>
                                        </tr>
                                   </thead>
                                   <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                                        {processedBatch.map((cust, idx) => (
                                             <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-950/50 transition-colors">
                                                  <td className="px-4 py-3 font-bold text-gray-900 dark:text-white font-sans">{cust.name}</td>
                                                  <td className="px-4 py-3 text-right">{cust.daysInactive}d</td>
                                                  <td className="px-4 py-3 text-right">{cust.supportTickets}</td>
                                                  <td className="px-4 py-3 text-right">{cust.featureUsage}%</td>
                                                  <td className="px-4 py-3 text-right">{cust.paymentFailures}</td>
                                                  <td className="px-4 py-3 text-right">{cust.nps}/10</td>
                                                  <td className="px-4 py-3 text-center">
                                                       <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${cust.riskLevel === 'High' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20' : cust.riskLevel === 'Medium' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'}`}>
                                                            {cust.churnProbability}% ({cust.riskLevel})
                                                       </span>
                                                  </td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </table>
                         </div>
                    </div>
               )}

               {/* ========================================= */}
               {/* SEO CONTENT & FAQS */}
               {/* ========================================= */}
               <div className="mt-12 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm dark:shadow-none">
                    <div className="prose dark:prose-invert max-w-none">
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Predictive Churn Risk Analyzer for SaaS</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              Retaining an existing customer is mathematically cheaper than acquiring a new one. The ToolLok <strong>Predictive Churn Analyzer</strong> enables SaaS founders and Customer Success Managers (CSMs) to proactively identify at-risk accounts before they cancel their subscriptions. By weighing behavioral indicators like feature usage drops, support ticket spikes, and NPS scores, the AI generates a customized retention playbook. Combine this analysis with our <Link href="/categories/business-tools" className="text-rose-600 dark:text-rose-400 hover:underline">Business Tools</Link> to secure your Monthly Recurring Revenue (MRR).
                         </p>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Identify Silent Churn Early</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Behavioral Scoring:</strong> Evaluate how many days a user has been inactive combined with their depth of feature usage to determine disengagement risk.</li>
                              <li><strong>Batch Cohort CSV Processing:</strong> Don't analyze accounts one by one. Upload your CRM or Mixpanel CSV data to instantly score hundreds of accounts at once.</li>
                              <li><strong>Automated Playbooks:</strong> For every risk tier (Low, Medium, High), the analyzer provides an immediate, actionable intervention strategy, such as triggering dunning emails or offering proactive audits.</li>
                         </ul>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">What is customer churn in SaaS?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Customer churn refers to the percentage of customers or subscribers who stop using a company's product or service during a given timeframe. High churn rates cripple compounding SaaS revenue growth.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">How does NPS impact churn probability?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Net Promoter Score (NPS) is a key indicator of customer satisfaction. A low score (Detractor) strongly correlates with an impending cancellation, while high scores (Promoters) indicate account health and potential for upsells.</p>
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
                                             "name": "What is customer churn in SaaS?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Customer churn refers to the percentage of customers who stop using a product or service during a given timeframe, severely impacting recurring revenue growth." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "How does NPS impact churn probability?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "NPS indicates customer satisfaction. Low scores (Detractors) strongly correlate with impending cancellation, while high scores indicate account health." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-churn-ad" format="fluid" className="mt-4" />
          </div>
     );
}