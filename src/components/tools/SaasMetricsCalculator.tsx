"use client";

import { useState, useMemo } from "react";
import { Calculator, DollarSign, TrendingUp, ShieldCheck, ShieldAlert, Copy, Check, BarChart3 } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import AdSlot from "@/components/ui/AdSlot";

export default function SaaSMetricsCalculator() {
     const [subscribers, setSubscribers] = useState<number>(500);
     const [arpu, setArpu] = useState<number>(49); // Average Revenue Per User ($)
     const [cac, setCac] = useState<number>(120); // Customer Acquisition Cost ($)
     const [churnRate, setChurnRate] = useState<number>(3.5); // Monthly Churn %

     const { isCopied, copy } = useCopyToClipboard(2000);

     // Financial Calculation Engine
     const metrics = useMemo(() => {
          const mrr = subscribers * arpu;
          const arr = mrr * 12;

          // Monthly Churn decimal
          const churnDecimal = churnRate / 100;
          const customerLifespanMonths = churnDecimal > 0 ? 1 / churnDecimal : 0;
          const ltv = arpu * customerLifespanMonths;

          const ltvCacRatio = cac > 0 ? ltv / cac : 0;
          const paybackPeriodMonths = arpu > 0 ? cac / arpu : 0;

          return {
               mrr,
               arr,
               ltv: Number(ltv.toFixed(2)),
               ltvCacRatio: Number(ltvCacRatio.toFixed(2)),
               paybackPeriodMonths: Number(paybackPeriodMonths.toFixed(1)),
               customerLifespanMonths: Number(customerLifespanMonths.toFixed(1))
          };
     }, [subscribers, arpu, cac, churnRate]);

     const summaryText = `SaaS Metrics Summary:\nMRR: $${metrics.mrr.toLocaleString()}\nARR: $${metrics.arr.toLocaleString()}\nLTV: $${metrics.ltv}\nLTV:CAC: ${metrics.ltvCacRatio}:1`;

     // Shortcut: Cmd/Ctrl + C to copy
     useKeyboardShortcuts([
          { key: "c", ctrlOrCmd: true, action: () => copy(summaryText) }
     ]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">

               {/* Header Section */}
               <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                              <BarChart3 size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-white">SaaS Metrics & Unit Economics Calculator</h2>
                                   <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-400">Calculate MRR, ARR, LTV, CAC, and unit economics efficiency ratios instantly.</p>
                         </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-xl text-xs text-emerald-400">
                         <ShieldCheck size={16} />
                         <span>Financial Modeler</span>
                    </div>
               </div>

               {/* Top Ad Banner */}
               <AdSlot adSlot="top-saascalc-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Input Parameters */}
                    <div className="lg:col-span-6 bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col gap-6">
                         <h3 className="text-white font-bold text-lg border-b border-gray-800/60 pb-3 flex items-center gap-2">
                              <Calculator size={18} className="text-emerald-400" /> Model Inputs
                         </h3>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Active Subscribers</label>
                                   <input
                                        type="number"
                                        value={subscribers}
                                        onChange={(e) => setSubscribers(Number(e.target.value) || 0)}
                                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-emerald-500"
                                   />
                              </div>

                              <div>
                                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">ARPU ($ / month)</label>
                                   <input
                                        type="number"
                                        value={arpu}
                                        onChange={(e) => setArpu(Number(e.target.value) || 0)}
                                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-emerald-500"
                                   />
                              </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">CAC ($ per user)</label>
                                   <input
                                        type="number"
                                        value={cac}
                                        onChange={(e) => setCac(Number(e.target.value) || 0)}
                                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-emerald-500"
                                   />
                              </div>

                              <div>
                                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Monthly Churn (%)</label>
                                   <input
                                        type="number"
                                        step="0.1"
                                        value={churnRate}
                                        onChange={(e) => setChurnRate(Number(e.target.value) || 0)}
                                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm text-rose-400 font-mono outline-none focus:border-rose-500"
                                   />
                              </div>
                         </div>

                         {metrics.ltvCacRatio < 3.0 && (
                              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 text-amber-400 text-xs">
                                   <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                                   <span>Warning: Your LTV:CAC ratio is below 3:1. Consider reducing acquisition costs or improving retention.</span>
                              </div>
                         )}
                    </div>

                    {/* Right Column: Output Dashboard */}
                    <div className="lg:col-span-6 flex flex-col gap-6">

                         <div className="bg-[#0c121e] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                              <div className="flex items-center justify-between mb-6 border-b border-gray-800/60 pb-3">
                                   <h3 className="text-white font-bold text-base flex items-center gap-2">
                                        <TrendingUp size={18} className="text-emerald-400" /> Revenue & Unit Economics
                                   </h3>
                                   <button
                                        onClick={() => copy(summaryText)}
                                        className="flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 px-3.5 py-1.5 rounded-lg transition-colors font-bold"
                                   >
                                        {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                        {isCopied ? "Copied" : "Copy Summary"}
                                   </button>
                              </div>

                              {/* Hero MRR Card */}
                              <div className="bg-gradient-to-br from-emerald-950/40 via-gray-900 to-gray-950 border border-emerald-900/50 rounded-2xl p-6 mb-6 flex items-center justify-between">
                                   <div>
                                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest block mb-1">
                                             Monthly Recurring Revenue (MRR)
                                        </span>
                                        <div className="flex items-baseline gap-2">
                                             <span className="text-4xl font-extrabold text-white font-mono">${metrics.mrr.toLocaleString()}</span>
                                        </div>
                                   </div>
                                   <div className="text-right">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">ARR</span>
                                        <span className="text-xl font-bold font-mono text-cyan-400">${metrics.arr.toLocaleString()}</span>
                                   </div>
                              </div>

                              {/* Breakdown Grid */}
                              <div className="grid grid-cols-2 gap-4 mb-6">
                                   <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Customer LTV</span>
                                        <span className="text-xl font-bold font-mono text-emerald-400">${metrics.ltv.toLocaleString()}</span>
                                   </div>

                                   <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">LTV : CAC Ratio</span>
                                        <span className={`text-xl font-bold font-mono ${metrics.ltvCacRatio >= 3 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                             {metrics.ltvCacRatio} : 1
                                        </span>
                                   </div>

                                   <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Payback Period</span>
                                        <span className="text-xl font-bold font-mono text-white">{metrics.paybackPeriodMonths} mos</span>
                                   </div>

                                   <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Avg Lifespan</span>
                                        <span className="text-xl font-bold font-mono text-blue-400">{metrics.customerLifespanMonths} mos</span>
                                   </div>
                              </div>

                         </div>
                    </div>
               </div>

               {/* Bottom In-Feed Ad Banner */}
               <AdSlot adSlot="bottom-saascalc-ad" format="fluid" className="mt-4" />

          </div>
     );
}