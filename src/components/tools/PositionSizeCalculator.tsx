"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Calculator, ShieldAlert, ShieldCheck, DollarSign, Target, Copy, Check, TrendingUp } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import AdSlot from "@/components/ui/AdSlot";

export default function PositionSizeCalculator() {
     const [accountCapital, setAccountCapital] = useState<number>(500000);
     const [riskPercentage, setRiskPercentage] = useState<number>(1.5);
     const [entryPrice, setEntryPrice] = useState<number>(2400);
     const [stopLossPrice, setStopLossPrice] = useState<number>(2350);
     const [targetPrice, setTargetPrice] = useState<number>(2550);

     const { isCopied, copy } = useCopyToClipboard(2000);

     const analysis = useMemo(() => {
          const riskAmount = (accountCapital * riskPercentage) / 100;
          const riskPerShare = Math.abs(entryPrice - stopLossPrice);
          const rewardPerShare = Math.abs(targetPrice - entryPrice);

          const maxShares = riskPerShare > 0 ? Math.floor(riskAmount / riskPerShare) : 0;
          const totalCapitalAtRisk = maxShares * riskPerShare;
          const totalPositionValue = maxShares * entryPrice;

          const riskRewardRatio = riskPerShare > 0 ? (rewardPerShare / riskPerShare).toFixed(2) : "0.00";
          const potentialProfit = maxShares * rewardPerShare;

          const portfolioExposure = accountCapital > 0 ? ((totalPositionValue / accountCapital) * 100).toFixed(1) : "0.0";

          return {
               riskAmount, riskPerShare, rewardPerShare, maxShares, totalCapitalAtRisk, totalPositionValue, riskRewardRatio, potentialProfit, portfolioExposure
          };
     }, [accountCapital, riskPercentage, entryPrice, stopLossPrice, targetPrice]);

     useKeyboardShortcuts([
          { key: "c", ctrlOrCmd: true, action: () => copy(`Position Sizing Plan:\nCapital: ₹${accountCapital}\nRisk: ₹${analysis.riskAmount} (${riskPercentage}%)\nQuantity: ${analysis.maxShares} shares\nRisk/Reward: 1:${analysis.riskRewardRatio}`) }
     ]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
               <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                              <Calculator size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Position Sizing & Risk Management Calculator</h2>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Calculate exact trade quantities, risk-reward ratios, and capital exposure limits instantly.</p>
                         </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 shadow-sm dark:shadow-none">
                         <ShieldCheck size={16} />
                         <span>Institutional Risk Matrix</span>
                    </div>
               </div>

               <AdSlot adSlot="top-positionsize-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-xl flex flex-col gap-6 transition-colors">
                         <h3 className="text-gray-900 dark:text-white font-bold text-lg border-b border-gray-100 dark:border-gray-800/60 pb-3 flex items-center gap-2">
                              <Target size={18} className="text-blue-600 dark:text-blue-400" /> Trade & Account Parameters
                         </h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Account Capital (₹)</label>
                                   <input type="number" value={accountCapital} onChange={(e) => setAccountCapital(Number(e.target.value) || 0)} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white font-mono outline-none focus:border-blue-500 transition-colors" />
                              </div>
                              <div>
                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Max Risk Per Trade (%)</label>
                                   <input type="number" step="0.1" value={riskPercentage} onChange={(e) => setRiskPercentage(Number(e.target.value) || 0)} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white font-mono outline-none focus:border-blue-500 transition-colors" />
                              </div>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Entry Price (₹)</label>
                                   <input type="number" value={entryPrice} onChange={(e) => setEntryPrice(Number(e.target.value) || 0)} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white font-mono outline-none focus:border-blue-500 transition-colors" />
                              </div>
                              <div>
                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Stop Loss (₹)</label>
                                   <input type="number" value={stopLossPrice} onChange={(e) => setStopLossPrice(Number(e.target.value) || 0)} className="w-full bg-gray-50 dark:bg-gray-950 border border-rose-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-rose-600 dark:text-rose-400 font-mono outline-none focus:border-rose-500 transition-colors" />
                              </div>
                              <div>
                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Target Price (₹)</label>
                                   <input type="number" value={targetPrice} onChange={(e) => setTargetPrice(Number(e.target.value) || 0)} className="w-full bg-gray-50 dark:bg-gray-950 border border-emerald-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400 font-mono outline-none focus:border-emerald-500 transition-colors" />
                              </div>
                         </div>
                         {riskPercentage > 2.0 && (
                              <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 text-amber-700 dark:text-amber-400 text-xs transition-colors">
                                   <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                                   <span>Warning: Risking more than 2% of total capital per trade significantly increases long-term portfolio drawdown risk.</span>
                              </div>
                         )}
                    </div>

                    <div className="lg:col-span-6 flex flex-col gap-6">
                         <div className="bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors">
                              <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800/60 pb-3">
                                   <h3 className="text-gray-900 dark:text-white font-bold text-base flex items-center gap-2">
                                        <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400" /> Position Sizing Plan
                                   </h3>
                                   <button onClick={() => copy(`Quantity: ${analysis.maxShares} shares | Risk: ₹${analysis.riskAmount} | R:R: 1:${analysis.riskRewardRatio}`)} className="flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-3.5 py-1.5 rounded-lg transition-colors font-bold shadow-sm dark:shadow-none">
                                        {isCopied ? <Check size={14} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={14} />} {isCopied ? "Copied Plan" : "Copy Summary"}
                                   </button>
                              </div>

                              <div className="bg-emerald-50 dark:bg-gradient-to-br dark:from-emerald-950/40 dark:via-gray-900 dark:to-gray-950 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-6 mb-6 flex items-center justify-between transition-colors">
                                   <div>
                                        <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-widest block mb-1">Recommended Position Size</span>
                                        <div className="flex items-baseline gap-2">
                                             <span className="text-5xl font-extrabold text-gray-900 dark:text-white font-mono">{analysis.maxShares}</span>
                                             <span className="text-gray-500 dark:text-gray-400 font-bold text-sm">Units / Shares</span>
                                        </div>
                                   </div>
                                   <div className="text-right">
                                        <span className="text-[10px] text-gray-500 dark:text-gray-500 font-bold uppercase tracking-widest block mb-1">Risk / Reward</span>
                                        <span className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">1 : {analysis.riskRewardRatio}</span>
                                   </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 mb-6">
                                   <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 transition-colors">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Capital at Risk</span>
                                        <span className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">₹{analysis.riskAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                                   </div>
                                   <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 transition-colors">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Potential Profit</span>
                                        <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">₹{analysis.potentialProfit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                                   </div>
                                   <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 transition-colors">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Total Position Value</span>
                                        <span className="text-xl font-bold font-mono text-gray-900 dark:text-white">₹{analysis.totalPositionValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                                   </div>
                                   <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 transition-colors">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Portfolio Exposure</span>
                                        <span className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">{analysis.portfolioExposure}%</span>
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
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Position Sizing & Trade Risk Calculator</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              The secret to long-term profitability in the stock market isn't a high win rate; it's strict risk management. ToolLok's <strong>Position Size Calculator</strong> helps day traders and swing traders determine exactly how many shares or units to buy based on their account capital and maximum risk tolerance. Avoid emotional trading errors by pairing this tool with our other <Link href="/categories/finance-tools" className="text-blue-600 dark:text-blue-400 hover:underline">Finance Tools</Link>.
                         </p>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Master Your Trading Psychology</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Preserve Capital:</strong> By strictly adhering to the 1% or 2% risk rule, you guarantee that a series of consecutive losses will not blow up your entire trading account.</li>
                              <li><strong>Risk-to-Reward Ratio:</strong> The calculator instantly outputs your R:R ratio based on your entry, stop loss, and target price, ensuring you only take high-probability setups.</li>
                              <li><strong>Portfolio Exposure:</strong> Understand exactly what percentage of your total equity is tied up in a single trade to avoid over-leveraging.</li>
                         </ul>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Why is position sizing important in trading?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Position sizing ensures that you risk the exact same dollar amount on every single trade, regardless of how wide or tight your stop loss is. This consistency prevents one bad trade from destroying your account.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">What is a good risk-to-reward ratio?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">A minimum Risk-to-Reward (R:R) ratio of 1:2 is generally recommended by institutional traders. This means you stand to make twice as much money as you are risking, allowing you to be profitable even with a 40% win rate.</p>
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
                                             "name": "Why is position sizing important in trading?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Position sizing ensures you risk the same dollar amount on every trade, preventing a single loss from destroying your account." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "What is a good risk-to-reward ratio?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "A minimum Risk-to-Reward ratio of 1:2 is recommended, allowing you to be profitable even with a win rate below 50%." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-positionsize-ad" format="fluid" className="mt-4" />
          </div>
     );
}