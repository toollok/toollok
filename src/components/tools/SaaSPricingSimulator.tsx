"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { DollarSign, Sliders, TrendingUp, ShieldCheck, ShieldAlert, Copy, Check, BarChart3, Layers, Download, Users } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import AdSlot from "@/components/ui/AdSlot";

interface PricingTier { name: string; price: number; userShare: number; serverCost: number; apiCost: number; supportCost: number; }

export default function SaaSPricingSimulator() {
     const [totalUsers, setTotalUsers] = useLocalStorage<number>("toollok_saas_total_users", 1200);
     const [monthlyChurn, setMonthlyChurn] = useLocalStorage<number>("toollok_saas_churn", 3.0);
     const [annualDiscount, setAnnualDiscount] = useLocalStorage<number>("toollok_saas_discount", 20);
     const [isAnnualBilling, setIsAnnualBilling] = useLocalStorage<boolean>("toollok_saas_is_annual", false);
     const [gatewayFeePct, setGatewayFeePct] = useLocalStorage<number>("toollok_saas_gateway", 2.9);

     const [tiers, setTiers] = useLocalStorage<PricingTier[]>("toollok_saas_tiers", [
          { name: "Starter", price: 29, userShare: 60, serverCost: 2.0, apiCost: 3.0, supportCost: 1.0 },
          { name: "Pro", price: 99, userShare: 30, serverCost: 5.0, apiCost: 12.0, supportCost: 4.0 },
          { name: "Enterprise", price: 299, userShare: 10, serverCost: 18.0, apiCost: 45.0, supportCost: 15.0 }
     ]);

     const { isCopied, copy } = useCopyToClipboard(2000);

     const updateTier = (index: number, field: keyof PricingTier, value: number) => {
          const updated = [...tiers]; updated[index] = { ...updated[index], [field]: value }; setTiers(updated);
     };

     const metrics = useMemo(() => {
          let blendedMRR = 0; let blendedCOGS = 0; let blendedGrossProfit = 0;
          const tierResults = tiers.map(tier => {
               const tierUserCount = Math.round((totalUsers * tier.userShare) / 100);
               const effectivePrice = isAnnualBilling ? tier.price * (1 - annualDiscount / 100) : tier.price;
               const gatewayFee = (effectivePrice * gatewayFeePct) / 100;
               const totalTierCogsPerUser = tier.serverCost + tier.apiCost + tier.supportCost + gatewayFee;
               const grossProfitPerUser = effectivePrice - totalTierCogsPerUser;
               const grossMarginPct = effectivePrice > 0 ? (grossProfitPerUser / effectivePrice) * 100 : 0;
               const tierMonthlyRevenue = effectivePrice * tierUserCount;
               const tierMonthlyCogs = totalTierCogsPerUser * tierUserCount;
               const tierMonthlyProfit = grossProfitPerUser * tierUserCount;

               const churnDecimal = monthlyChurn / 100;
               const avgLifespanMonths = churnDecimal > 0 ? 1 / churnDecimal : 12;
               const ltv = grossProfitPerUser * avgLifespanMonths;

               blendedMRR += tierMonthlyRevenue; blendedCOGS += tierMonthlyCogs; blendedGrossProfit += tierMonthlyProfit;

               return { ...tier, tierUserCount, effectivePrice: Number(effectivePrice.toFixed(2)), totalTierCogsPerUser: Number(totalTierCogsPerUser.toFixed(2)), grossProfitPerUser: Number(grossProfitPerUser.toFixed(2)), grossMarginPct: Number(grossMarginPct.toFixed(1)), tierMonthlyRevenue: Math.round(tierMonthlyRevenue), tierMonthlyProfit: Math.round(tierMonthlyProfit), ltv: Math.round(ltv) };
          });

          const blendedMarginPct = blendedMRR > 0 ? (blendedGrossProfit / blendedMRR) * 100 : 0;
          const annualARR = blendedMRR * 12; const annualNetProfit = blendedGrossProfit * 12;
          return { tierResults, blendedMRR: Math.round(blendedMRR), blendedCOGS: Math.round(blendedCOGS), blendedGrossProfit: Math.round(blendedGrossProfit), blendedMarginPct: Number(blendedMarginPct.toFixed(1)), annualARR: Math.round(annualARR), annualNetProfit: Math.round(annualNetProfit) };
     }, [tiers, totalUsers, monthlyChurn, annualDiscount, isAnnualBilling, gatewayFeePct]);

     const executiveSummaryText = `=== TOOOLOK SaaS FINANCIAL SUMMARY ===\nTotal Users: ${totalUsers}\nBilling Mode: ${isAnnualBilling ? `Annual (${annualDiscount}% off)` : 'Monthly'}\nBlended MRR: $${metrics.blendedMRR.toLocaleString()}\nARR: $${metrics.annualARR.toLocaleString()}\nBlended Gross Margin: ${metrics.blendedMarginPct}%\nProjected Annual Net Profit: $${metrics.annualNetProfit.toLocaleString()}\n------------------------------------\nTiers:\n` + metrics.tierResults.map(t => `- ${t.name}: $${t.effectivePrice}/mo (${t.tierUserCount} users), LTV: $${t.ltv}, Margin: ${t.grossMarginPct}%`).join('\n');

     const downloadReport = () => {
          const blob = new Blob([executiveSummaryText], { type: "text/plain;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url); link.setAttribute("download", "toollok_saas_financial_report.txt");
          document.body.appendChild(link); link.click(); document.body.removeChild(link);
     };

     useKeyboardShortcuts([{ key: "c", ctrlOrCmd: true, action: () => copy(executiveSummaryText) }]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
               <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                              <BarChart3 size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">SaaS Tier Pricing & Margin Simulator</h2>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Multi-tier pricing modeler with COGS, LTV, churn integration, and financial reporting.</p>
                         </div>
                    </div>
                    <div className="flex items-center gap-3">
                         <button onClick={downloadReport} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md dark:shadow-lg dark:shadow-emerald-600/25">
                              <Download size={16} /> Export Report
                         </button>
                    </div>
               </div>

               <AdSlot adSlot="top-pricingcalc-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl grid grid-cols-1 md:grid-cols-4 gap-4 transition-colors">
                    <div>
                         <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">Total Active Subscribers</label>
                         <input type="number" value={totalUsers} onChange={(e) => setTotalUsers(Number(e.target.value) || 0)} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-xs text-gray-900 dark:text-white font-mono outline-none focus:border-emerald-500 transition-colors" />
                    </div>
                    <div>
                         <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">Monthly Churn Rate (%)</label>
                         <input type="number" step="0.1" value={monthlyChurn} onChange={(e) => setMonthlyChurn(Number(e.target.value) || 0)} className="w-full bg-gray-50 dark:bg-gray-950 border border-rose-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-xs text-rose-600 dark:text-rose-400 font-mono outline-none focus:border-rose-500 transition-colors" />
                    </div>
                    <div>
                         <div className="flex justify-between text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5">
                              <span>Annual Billing Discount</span><span className="text-emerald-600 dark:text-emerald-400">{annualDiscount}%</span>
                         </div>
                         <div className="flex items-center gap-2">
                              <input type="range" min="0" max="40" step="5" value={annualDiscount} onChange={(e) => setAnnualDiscount(Number(e.target.value))} className="w-full accent-emerald-500 cursor-pointer" />
                         </div>
                    </div>
                    <div className="flex flex-col justify-end">
                         <button onClick={() => setIsAnnualBilling(!isAnnualBilling)} className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${isAnnualBilling ? 'bg-emerald-50 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/40 shadow-sm dark:shadow-none' : 'bg-white dark:bg-gray-950 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none'}`}>
                              Billing Mode: {isAnnualBilling ? 'Annual (20% off)' : 'Monthly Standard'}
                         </button>
                    </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {tiers.map((tier, idx) => {
                         const result = metrics.tierResults[idx];
                         return (
                              <div key={tier.name} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col gap-5 transition-colors">
                                   <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/60 pb-3">
                                        <h3 className="text-gray-900 dark:text-white font-bold text-base flex items-center gap-2">
                                             <Layers size={16} className="text-emerald-600 dark:text-emerald-400" /> {tier.name} Tier
                                        </h3>
                                        <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">{result.tierUserCount} users ({tier.userShare}%)</span>
                                   </div>
                                   <div className="grid grid-cols-2 gap-3">
                                        <div>
                                             <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Price ($/mo)</label>
                                             <input type="number" value={tier.price} onChange={(e) => updateTier(idx, "price", Number(e.target.value) || 0)} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white font-mono outline-none focus:border-emerald-500 transition-colors" />
                                        </div>
                                        <div>
                                             <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">User Share (%)</label>
                                             <input type="number" value={tier.userShare} onChange={(e) => updateTier(idx, "userShare", Number(e.target.value) || 0)} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white font-mono outline-none focus:border-emerald-500 transition-colors" />
                                        </div>
                                   </div>
                                   <div className="grid grid-cols-3 gap-2">
                                        <div>
                                             <label className="text-[9px] font-bold text-gray-500 dark:text-gray-500 uppercase block mb-1">Server ($)</label>
                                             <input type="number" step="0.5" value={tier.serverCost} onChange={(e) => updateTier(idx, "serverCost", Number(e.target.value) || 0)} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-xs text-gray-900 dark:text-white font-mono outline-none transition-colors" />
                                        </div>
                                        <div>
                                             <label className="text-[9px] font-bold text-gray-500 dark:text-gray-500 uppercase block mb-1">API ($)</label>
                                             <input type="number" step="0.5" value={tier.apiCost} onChange={(e) => updateTier(idx, "apiCost", Number(e.target.value) || 0)} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-xs text-gray-900 dark:text-white font-mono outline-none transition-colors" />
                                        </div>
                                        <div>
                                             <label className="text-[9px] font-bold text-gray-500 dark:text-gray-500 uppercase block mb-1">Support ($)</label>
                                             <input type="number" step="0.5" value={tier.supportCost} onChange={(e) => updateTier(idx, "supportCost", Number(e.target.value) || 0)} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-xs text-gray-900 dark:text-white font-mono outline-none transition-colors" />
                                        </div>
                                   </div>
                                   <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col gap-2 font-mono text-xs transition-colors">
                                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                             <span>Gross Margin:</span><span className={result.grossMarginPct >= 75 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-amber-600 dark:text-amber-400 font-bold'}>{result.grossMarginPct}%</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                             <span>Customer LTV:</span><span className="text-cyan-600 dark:text-cyan-400 font-bold">${result.ltv.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                             <span>Tier MRR:</span><span className="text-gray-900 dark:text-white font-bold">${result.tierMonthlyRevenue.toLocaleString()}</span>
                                        </div>
                                   </div>
                              </div>
                         );
                    })}
               </div>

               <div className="bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-xl relative overflow-hidden flex flex-col gap-6 transition-colors">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/60 pb-3">
                         <h3 className="text-gray-900 dark:text-white font-bold text-base flex items-center gap-2">
                              <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400" /> Blended Portfolio Financial Dashboard
                         </h3>
                         <button onClick={() => copy(executiveSummaryText)} className="flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-3.5 py-1.5 rounded-lg transition-colors font-bold shadow-sm dark:shadow-none">
                              {isCopied ? <Check size={14} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={14} />} {isCopied ? "Copied" : "Copy Summary"}
                         </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                         <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 transition-colors">
                              <span className="text-[10px] text-gray-500 dark:text-gray-500 font-bold uppercase block mb-1">Blended MRR</span>
                              <span className="text-2xl font-bold font-mono text-gray-900 dark:text-white">${metrics.blendedMRR.toLocaleString()}</span>
                         </div>
                         <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 transition-colors">
                              <span className="text-[10px] text-gray-500 dark:text-gray-500 font-bold uppercase block mb-1">Annual ARR</span>
                              <span className="text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-400">${metrics.annualARR.toLocaleString()}</span>
                         </div>
                         <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 transition-colors">
                              <span className="text-[10px] text-gray-500 dark:text-gray-500 font-bold uppercase block mb-1">Blended Gross Margin</span>
                              <span className={`text-2xl font-bold font-mono ${metrics.blendedMarginPct >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                   {metrics.blendedMarginPct}%
                              </span>
                         </div>
                         <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 transition-colors">
                              <span className="text-[10px] text-gray-500 dark:text-gray-500 font-bold uppercase block mb-1">Annual Net Profit</span>
                              <span className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">${metrics.annualNetProfit.toLocaleString()}</span>
                         </div>
                    </div>
               </div>

               {/* ========================================= */}
               {/* SEO CONTENT & FAQS */}
               {/* ========================================= */}
               <div className="mt-12 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm dark:shadow-none">
                    <div className="prose dark:prose-invert max-w-none">
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">SaaS Tier Pricing & Gross Margin Simulator</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              Pricing your software correctly is the most important decision a founder will make. ToolLok's <strong>SaaS Tier Pricing Simulator</strong> empowers product managers to model complex, multi-tier pricing structures (like Starter, Pro, and Enterprise) alongside individual Cost of Goods Sold (COGS). See exactly how shifts in your user distribution or server costs impact your overall Blended Gross Margin and Annual Recurring Revenue (ARR).
                         </p>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Model Complex Revenue Architectures</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Tiered Cost Modeling:</strong> Input specific infrastructure, API, and support costs for each individual pricing tier to ensure your "Enterprise" users are actually profitable despite higher server loads.</li>
                              <li><strong>Annual Discount Simulation:</strong> Instantly calculate how offering a 20% annual billing discount impacts your net profit and customer LTV across your entire active subscriber base.</li>
                              <li><strong>Blended Portfolio Metrics:</strong> Aggregate the revenue and COGS from all tiers to get a unified view of your company's overarching gross margin and net profit potential.</li>
                         </ul>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">What is a good Gross Margin for a SaaS company?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Top-performing SaaS companies typically aim for a Gross Margin between 75% and 85%. This ensures there is enough profit left over after paying for servers and support to aggressively fund marketing, sales, and engineering.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">What does COGS mean in software?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">COGS (Cost of Goods Sold) in a SaaS context refers to the direct costs required to deliver the software to the user. This usually includes AWS/cloud hosting fees, third-party API costs (like OpenAI or Stripe), and direct customer support staffing.</p>
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
                                             "name": "What is a good Gross Margin for a SaaS company?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Top-performing SaaS companies typically aim for a Gross Margin between 75% and 85%." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "What does COGS mean in software?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "COGS in SaaS refers to the direct costs required to deliver the software, including cloud hosting fees, third-party API costs, and direct customer support." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-pricingcalc-ad" format="fluid" className="mt-4" />
          </div>
     );
}