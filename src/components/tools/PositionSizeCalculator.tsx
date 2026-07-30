"use client";

import { useState, useMemo } from "react";
import { Calculator, ShieldAlert, ShieldCheck, DollarSign, Target, Copy, Check, TrendingUp } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import AdSlot from "@/components/ui/AdSlot";

export default function PositionSizeCalculator() {
     const [accountCapital, setAccountCapital] = useState<number>(500000); // e.g., ₹5,00,000
     const [riskPercentage, setRiskPercentage] = useState<number>(1.5); // 1.5% risk per trade
     const [entryPrice, setEntryPrice] = useState<number>(2400);
     const [stopLossPrice, setStopLossPrice] = useState<number>(2350);
     const [targetPrice, setTargetPrice] = useState<number>(2550);

     const { isCopied, copy } = useCopyToClipboard(2000);

     // Core Risk & Position Sizing Mathematical Engine
     const analysis = useMemo(() => {
          const riskAmount = (accountCapital * riskPercentage) / 100;
          const riskPerShare = Math.abs(entryPrice - stopLossPrice);
          const rewardPerShare = Math.abs(targetPrice - entryPrice);

          const maxShares = riskPerShare > 0 ? Math.floor(riskAmount / riskPerShare) : 0;
          const totalCapitalAtRisk = maxShares * riskPerShare;
          const totalPositionValue = maxShares * entryPrice;

          const riskRewardRatio = riskPerShare > 0 ? (rewardPerShare / riskPerShare).toFixed(2) : "0.00";
          const potentialProfit = maxShares * rewardPerShare;

          // Portfolio Exposure Percentage
          const portfolioExposure = accountCapital > 0 ? ((totalPositionValue / accountCapital) * 100).toFixed(1) : "0.0";

          return {
               riskAmount,
               riskPerShare,
               rewardPerShare,
               maxShares,
               totalCapitalAtRisk,
               totalPositionValue,
               riskRewardRatio,
               potentialProfit,
               portfolioExposure
          };
     }, [accountCapital, riskPercentage, entryPrice, stopLossPrice, targetPrice]);

     // Keyboard Shortcut: Cmd/Ctrl + C to copy results summary
     useKeyboardShortcuts([
          {
               key: "c",
               ctrlOrCmd: true,
               action: () => copy(`Position Sizing Plan:\nCapital: ₹${accountCapital}\nRisk: ₹${analysis.riskAmount} (${riskPercentage}%)\nQuantity: ${analysis.maxShares} shares\nRisk/Reward: 1:${analysis.riskRewardRatio}`)
          }
     ]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">

               {/* Header Section */}
               <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20">
                              <Calculator size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-white">Position Sizing & Risk Management Calculator</h2>
                                   <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-400">Calculate exact trade quantities, risk-reward ratios, and capital exposure limits instantly.</p>
                         </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-xl text-xs text-emerald-400">
                         <ShieldCheck size={16} />
                         <span>Institutional Risk Matrix</span>
                    </div>
               </div>

               {/* Top Ad Banner */}
               <AdSlot adSlot="top-positionsize-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Trade Inputs */}
                    <div className="lg:col-span-6 bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col gap-6">
                         <h3 className="text-white font-bold text-lg border-b border-gray-800/60 pb-3 flex items-center gap-2">
                              <Target size={18} className="text-blue-400" /> Trade & Account Parameters
                         </h3>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Account Capital (₹)</label>
                                   <input
                                        type="number"
                                        value={accountCapital}
                                        onChange={(e) => setAccountCapital(Number(e.target.value) || 0)}
                                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-blue-500"
                                   />
                              </div>

                              <div>
                                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Max Risk Per Trade (%)</label>
                                   <input
                                        type="number"
                                        step="0.1"
                                        value={riskPercentage}
                                        onChange={(e) => setRiskPercentage(Number(e.target.value) || 0)}
                                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-blue-500"
                                   />
                              </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Entry Price (₹)</label>
                                   <input
                                        type="number"
                                        value={entryPrice}
                                        onChange={(e) => setEntryPrice(Number(e.target.value) || 0)}
                                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-blue-500"
                                   />
                              </div>

                              <div>
                                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Stop Loss (₹)</label>
                                   <input
                                        type="number"
                                        value={stopLossPrice}
                                        onChange={(e) => setStopLossPrice(Number(e.target.value) || 0)}
                                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm text-rose-400 font-mono outline-none focus:border-rose-500"
                                   />
                              </div>

                              <div>
                                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Target Price (₹)</label>
                                   <input
                                        type="number"
                                        value={targetPrice}
                                        onChange={(e) => setTargetPrice(Number(e.target.value) || 0)}
                                        className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm text-emerald-400 font-mono outline-none focus:border-emerald-500"
                                   />
                              </div>
                         </div>

                         {riskPercentage > 2.0 && (
                              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 text-amber-400 text-xs">
                                   <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                                   <span>Warning: Risking more than 2% of total capital per trade significantly increases long-term portfolio drawdown risk.</span>
                              </div>
                         )}
                    </div>

                    {/* Right Column: Execution Output Dashboard */}
                    <div className="lg:col-span-6 flex flex-col gap-6">

                         <div className="bg-[#0c121e] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                              <div className="flex items-center justify-between mb-6 border-b border-gray-800/60 pb-3">
                                   <h3 className="text-white font-bold text-base flex items-center gap-2">
                                        <TrendingUp size={18} className="text-emerald-400" /> Position Sizing Plan
                                   </h3>
                                   <button
                                        onClick={() => copy(`Quantity: ${analysis.maxShares} shares | Risk: ₹${analysis.riskAmount} | R:R: 1:${analysis.riskRewardRatio}`)}
                                        className="flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 px-3.5 py-1.5 rounded-lg transition-colors font-bold"
                                   >
                                        {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                        {isCopied ? "Copied Plan" : "Copy Summary"}
                                   </button>
                              </div>

                              {/* Hero Quantity Card */}
                              <div className="bg-gradient-to-br from-emerald-950/40 via-gray-900 to-gray-950 border border-emerald-900/50 rounded-2xl p-6 mb-6 flex items-center justify-between">
                                   <div>
                                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest block mb-1">
                                             Recommended Position Size
                                        </span>
                                        <div className="flex items-baseline gap-2">
                                             <span className="text-5xl font-extrabold text-white font-mono">{analysis.maxShares}</span>
                                             <span className="text-gray-400 font-bold text-sm">Units / Shares</span>
                                        </div>
                                   </div>
                                   <div className="text-right">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Risk / Reward</span>
                                        <span className="text-2xl font-bold font-mono text-blue-400">1 : {analysis.riskRewardRatio}</span>
                                   </div>
                              </div>

                              {/* Breakdown Grid */}
                              <div className="grid grid-cols-2 gap-4 mb-6">
                                   <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Capital at Risk</span>
                                        <span className="text-xl font-bold font-mono text-rose-400">₹{analysis.riskAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                                   </div>

                                   <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Potential Profit</span>
                                        <span className="text-xl font-bold font-mono text-emerald-400">₹{analysis.potentialProfit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                                   </div>

                                   <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Total Position Value</span>
                                        <span className="text-xl font-bold font-mono text-white">₹{analysis.totalPositionValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                                   </div>

                                   <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Portfolio Exposure</span>
                                        <span className="text-xl font-bold font-mono text-blue-400">{analysis.portfolioExposure}%</span>
                                   </div>
                              </div>

                         </div>
                    </div>
               </div>

               {/* Bottom In-Feed Ad Banner */}
               <AdSlot adSlot="bottom-positionsize-ad" format="fluid" className="mt-4" />

          </div>
     );
}