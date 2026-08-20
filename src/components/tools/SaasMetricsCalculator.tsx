"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Calculator, DollarSign, TrendingUp, ShieldCheck, ShieldAlert, Copy, Check, BarChart3 } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import AdSlot from "@/components/ui/AdSlot";

export default function SaaSMetricsCalculator() {
     const [subscribers, setSubscribers] = useState<number>(500);
     const [arpu, setArpu] = useState<number>(49);
     const [cac, setCac] = useState<number>(120);
     const [churnRate, setChurnRate] = useState<number>(3.5);

     const { isCopied, copy } = useCopyToClipboard(2000);

     const metrics = useMemo(() => {
          const mrr = subscribers * arpu;
          const arr = mrr * 12;

          const churnDecimal = churnRate / 100;
          const customerLifespanMonths = churnDecimal > 0 ? 1 / churnDecimal : 0;
          const ltv = arpu * customerLifespanMonths;

          const ltvCacRatio = cac > 0 ? ltv / cac : 0;
          const paybackPeriodMonths = arpu > 0 ? cac / arpu : 0;

          return {
               mrr, arr, ltv: Number(ltv.toFixed(2)), ltvCacRatio: Number(ltvCacRatio.toFixed(2)),
               paybackPeriodMonths: Number(paybackPeriodMonths.toFixed(1)),
               customerLifespanMonths: Number(customerLifespanMonths.toFixed(1))
          };
     }, [subscribers, arpu, cac, churnRate]);

     const summaryText = `SaaS Metrics Summary:\nMRR: $${metrics.mrr.toLocaleString()}\nARR: $${metrics.arr.toLocaleString()}\nLTV: $${metrics.ltv}\nLTV:CAC: ${metrics.ltvCacRatio}:1`;

     useKeyboardShortcuts([{ key: "c", ctrlOrCmd: true, action: () => copy(summaryText) }]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">

               <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                              <BarChart3 size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">SaaS Metrics & Unit Economics Calculator</h2>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Calculate MRR, ARR, LTV, CAC, and unit economics efficiency ratios instantly.</p>
                         </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 shadow-sm dark:shadow-none">
                         <ShieldCheck size={16} />
                         <span>Financial Modeler</span>
                    </div>
               </div>

               <AdSlot adSlot="top-saascalc-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-xl flex flex-col gap-6 transition-colors">
                         <h3 className="text-gray-900 dark:text-white font-bold text-lg border-b border-gray-100 dark:border-gray-800/60 pb-3 flex items-center gap-2">
                              <Calculator size={18} className="text-emerald-600 dark:text-emerald-400" /> Model Inputs
                         </h3>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Active Subscribers</label>
                                   <input
                                        type="number" value={subscribers} onChange={(e) => setSubscribers(Number(e.target.value) || 0)}
                                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white font-mono outline-none focus:border-emerald-500 transition-colors"
                                   />
                              </div>
                              <div>
                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">ARPU ($ / month)</label>
                                   <input
                                        type="number" value={arpu} onChange={(e) => setArpu(Number(e.target.value) || 0)}
                                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white font-mono outline-none focus:border-emerald-500 transition-colors"
                                   />
                              </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">CAC ($ per user)</label>
                                   <input
                                        type="number" value={cac} onChange={(e) => setCac(Number(e.target.value) || 0)}
                                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white font-mono outline-none focus:border-emerald-500 transition-colors"
                                   />
                              </div>
                              <div>
                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Monthly Churn (%)</label>
                                   <input
                                        type="number" step="0.1" value={churnRate} onChange={(e) => setChurnRate(Number(e.target.value) || 0)}
                                        className="w-full bg-gray-50 dark:bg-gray-950 border border-rose-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-rose-600 dark:text-rose-400 font-mono outline-none focus:border-rose-500 transition-colors"
                                   />
                              </div>
                         </div>

                         {metrics.ltvCacRatio < 3.0 && (
                              <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 text-amber-700 dark:text-amber-400 text-xs transition-colors">
                                   <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                                   <span>Warning: Your LTV:CAC ratio is below 3:1. Consider reducing acquisition costs or improving retention.</span>
                              </div>
                         )}
                    </div>

                    <div className="lg:col-span-6 flex flex-col gap-6">
                         <div className="bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors">
                              <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800/60 pb-3">
                                   <h3 className="text-gray-900 dark:text-white font-bold text-base flex items-center gap-2">
                                        <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400" /> Revenue & Unit Economics
                                   </h3>
                                   <button onClick={() => copy(summaryText)} className="flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-3.5 py-1.5 rounded-lg transition-colors font-bold shadow-sm dark:shadow-none">
                                        {isCopied ? <Check size={14} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={14} />} {isCopied ? "Copied" : "Copy Summary"}
                                   </button>
                              </div>

                              <div className="bg-emerald-50 dark:bg-gradient-to-br dark:from-emerald-950/40 dark:via-gray-900 dark:to-gray-950 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-6 mb-6 flex items-center justify-between transition-colors">
                                   <div>
                                        <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-widest block mb-1">Monthly Recurring Revenue (MRR)</span>
                                        <div className="flex items-baseline gap-2">
                                             <span className="text-4xl font-extrabold text-gray-900 dark:text-white font-mono">${metrics.mrr.toLocaleString()}</span>
                                        </div>
                                   </div>
                                   <div className="text-right">
                                        <span className="text-[10px] text-gray-500 dark:text-gray-500 font-bold uppercase tracking-widest block mb-1">ARR</span>
                                        <span className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400">${metrics.arr.toLocaleString()}</span>
                                   </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 mb-6">
                                   <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 transition-colors">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Customer LTV</span>
                                        <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">${metrics.ltv.toLocaleString()}</span>
                                   </div>
                                   <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 transition-colors">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">LTV : CAC Ratio</span>
                                        <span className={`text-xl font-bold font-mono ${metrics.ltvCacRatio >= 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                             {metrics.ltvCacRatio} : 1
                                        </span>
                                   </div>
                                   <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 transition-colors">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Payback Period</span>
                                        <span className="text-xl font-bold font-mono text-gray-900 dark:text-white">{metrics.paybackPeriodMonths} mos</span>
                                   </div>
                                   <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 transition-colors">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Avg Lifespan</span>
                                        <span className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">{metrics.customerLifespanMonths} mos</span>
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
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">SaaS Metrics & Unit Economics Calculator</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              Understanding your core unit economics is the difference between scaling a successful startup and burning through capital. ToolLok's <strong>SaaS Metrics Calculator</strong> allows founders and marketers to instantly calculate their Monthly Recurring Revenue (MRR), Customer Lifetime Value (LTV), and Customer Acquisition Cost (CAC) ratios. Keep your growth efficient by pairing this tool with our other <Link href="/categories/business-tools" className="text-emerald-600 dark:text-emerald-400 hover:underline">Business Tools</Link>.
                         </p>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Key Financial Metrics</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>LTV to CAC Ratio:</strong> The golden ratio of SaaS. It measures how much value a customer brings compared to the cost of acquiring them. A healthy ratio is 3:1 or higher.</li>
                              <li><strong>Payback Period:</strong> Calculates exactly how many months it takes for a customer's subscription payments to cover the initial marketing cost used to acquire them.</li>
                              <li><strong>Churn & Lifespan:</strong> Converts your monthly churn percentage into a tangible average customer lifespan, giving you clear insights into your retention limits.</li>
                         </ul>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">What does ARPU stand for?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">ARPU stands for Average Revenue Per User. It is calculated by dividing your total Monthly Recurring Revenue (MRR) by your total number of active subscribers.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Why is the LTV:CAC ratio so important?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">The LTV:CAC ratio determines the long-term sustainability of a business. If your ratio is 1:1, you are spending just as much to acquire a customer as they will ever pay you, meaning you will inevitably run out of money.</p>
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
                                             "name": "What does ARPU stand for?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "ARPU stands for Average Revenue Per User. It is calculated by dividing total MRR by the total number of active subscribers." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "Why is the LTV:CAC ratio so important?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "The LTV:CAC ratio determines long-term sustainability. A healthy ratio (like 3:1) ensures you are making significantly more profit from a customer than it costs to acquire them." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-saascalc-ad" format="fluid" className="mt-4" />
          </div>
     );
}