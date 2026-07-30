"use client";

import { useState, useMemo } from "react";
import { Target, Activity, Zap, Percent, BarChart3, Lock, CheckCircle2, ChevronRight, IndianRupee } from "lucide-react";

type Position = "Long" | "Short";
type OptionType = "CE" | "PE";

interface Leg {
     id: string;
     position: Position;
     type: OptionType;
     strike: number;
     qty: number;
     price: number;
     iv: number;
     delta: number;
     theta: number;
}

export default function OptionStrategyBuilder() {
     const [asset, setAsset] = useState<string>("NIFTY");
     const [spot, setSpot] = useState<number>(24000);
     const [lotSize, setLotSize] = useState<number>(50);
     const [showPremiumModal, setShowPremiumModal] = useState(false);

     const [legs, setLegs] = useState<Leg[]>([]);
     const [activeTemplate, setActiveTemplate] = useState<string>("custom");

     // Pre-Built Strategy Templates
     const applyTemplate = (strategy: string) => {
          setActiveTemplate(strategy);
          const atm = Math.round(spot / 50) * 50; // Round to nearest 50 for NIFTY

          switch (strategy) {
               case "short_straddle":
                    setLegs([
                         { id: "1", position: "Short", type: "CE", strike: atm, qty: 1, price: 150, iv: 14.2, delta: -0.52, theta: -8.5 },
                         { id: "2", position: "Short", type: "PE", strike: atm, qty: 1, price: 145, iv: 14.5, delta: 0.48, theta: -8.2 }
                    ]);
                    break;
               case "iron_condor":
                    setLegs([
                         { id: "1", position: "Short", type: "CE", strike: atm + 300, qty: 1, price: 65, iv: 13.8, delta: -0.25, theta: -4.5 },
                         { id: "2", position: "Long", type: "CE", strike: atm + 500, qty: 1, price: 25, iv: 14.1, delta: 0.12, theta: 2.1 },
                         { id: "3", position: "Short", type: "PE", strike: atm - 300, qty: 1, price: 70, iv: 15.2, delta: 0.28, theta: -4.8 },
                         { id: "4", position: "Long", type: "PE", strike: atm - 500, qty: 1, price: 30, iv: 15.8, delta: -0.15, theta: 2.3 }
                    ]);
                    break;
               case "bull_call_spread":
                    setLegs([
                         { id: "1", position: "Long", type: "CE", strike: atm, qty: 1, price: 150, iv: 14.2, delta: 0.52, theta: -8.5 },
                         { id: "2", position: "Short", type: "CE", strike: atm + 300, qty: 1, price: 65, iv: 13.8, delta: -0.25, theta: 4.5 }
                    ]);
                    break;
               case "clear":
                    setLegs([]);
                    break;
          }
     };

     const removeLeg = (id: string) => {
          setLegs(legs.filter(l => l.id !== id));
          setActiveTemplate("custom");
     };

     // Complex Metrics Calculation Engine
     const metrics = useMemo(() => {
          if (legs.length === 0) return null;

          let netPremium = 0;
          let totalDelta = 0;
          let totalTheta = 0;

          legs.forEach(leg => {
               const multiplier = leg.position === "Long" ? -1 : 1;
               netPremium += (leg.price * leg.qty * lotSize * multiplier);
               totalDelta += (leg.delta * leg.qty * lotSize);
               totalTheta += (leg.theta * leg.qty * lotSize);
          });

          // Mocking Advanced Analytics for UI Demonstration (In a real app, this runs via Black-Scholes Wasm)
          const isCredit = netPremium > 0;
          const pop = activeTemplate === "short_straddle" ? 68.5 : activeTemplate === "iron_condor" ? 72.4 : 55.2;

          // Simplistic Max Profit/Loss Mock based on selected templates for visual accuracy
          let maxProfit, maxLoss;
          if (activeTemplate === "short_straddle") {
               maxProfit = netPremium;
               maxLoss = "Unlimited";
          } else if (activeTemplate === "iron_condor") {
               maxProfit = netPremium;
               maxLoss = (200 * lotSize) - netPremium; // 200 point spread assumed
          } else {
               maxProfit = Math.abs(netPremium * 1.5);
               maxLoss = Math.abs(netPremium);
          }

          return { netPremium, totalDelta, totalTheta, isCredit, pop, maxProfit, maxLoss };
     }, [legs, lotSize, activeTemplate]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">

               {/* Tool Header */}
               <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20">
                         <Target size={24} />
                    </div>
                    <div>
                         <div className="flex items-center gap-3">
                              <h2 className="text-2xl font-bold text-white">Options Strategy Builder</h2>
                              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold px-2 py-0.5 rounded-full">
                                   🟡 Freemium
                              </span>
                         </div>
                         <p className="text-sm text-gray-400">Opstra-style advanced builder with Probability of Profit (POP) and Greeks.</p>
                    </div>
               </div>

               {/* Top Global Control Bar */}
               <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-lg flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-3">
                         <span className="text-xs font-bold text-gray-500 uppercase">Asset</span>
                         <select
                              value={asset}
                              onChange={(e) => setAsset(e.target.value)}
                              className="bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-bold outline-none"
                         >
                              <option value="NIFTY">NIFTY</option>
                              <option value="BANKNIFTY">BANKNIFTY</option>
                              <option value="FINNIFTY">FINNIFTY</option>
                         </select>
                    </div>

                    <div className="flex items-center gap-3">
                         <span className="text-xs font-bold text-gray-500 uppercase">Spot Price</span>
                         <div className="flex items-center bg-gray-950 border border-gray-700 rounded-lg px-3 py-2">
                              <IndianRupee size={14} className="text-gray-400 mr-1" />
                              <input
                                   type="number"
                                   value={spot}
                                   onChange={(e) => setSpot(Number(e.target.value))}
                                   className="w-20 bg-transparent text-white font-mono text-sm outline-none"
                              />
                         </div>
                    </div>

                    <div className="flex items-center gap-3">
                         <span className="text-xs font-bold text-gray-500 uppercase">Lot Size</span>
                         <input
                              type="number"
                              value={lotSize}
                              onChange={(e) => setLotSize(Number(e.target.value))}
                              className="w-16 bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-white outline-none"
                         />
                    </div>

                    <div className="flex-grow"></div>

                    {/* Premium API Status */}
                    <div className="flex items-center gap-2 bg-gray-950 border border-gray-800 px-3 py-1.5 rounded-lg">
                         <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                         <span className="text-xs text-gray-500 font-bold">API Offline (Manual Mode)</span>
                    </div>
               </div>

               <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Builder & Legs Table */}
                    <div className="xl:col-span-8 flex flex-col gap-6">

                         {/* Strategy Templates Bar */}
                         <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl">
                              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                                   <Zap size={16} className="text-blue-400" /> Quick Build Templates
                              </h3>
                              <div className="flex flex-wrap gap-3">
                                   {[
                                        { id: "short_straddle", label: "Short Straddle" },
                                        { id: "iron_condor", label: "Iron Condor" },
                                        { id: "bull_call_spread", label: "Bull Call Spread" },
                                   ].map(template => (
                                        <button
                                             key={template.id}
                                             onClick={() => applyTemplate(template.id)}
                                             className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${activeTemplate === template.id
                                                  ? "bg-blue-600/20 border-blue-500/50 text-blue-400"
                                                  : "bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200"
                                                  }`}
                                        >
                                             {template.label}
                                        </button>
                                   ))}
                                   <button onClick={() => applyTemplate("clear")} className="px-4 py-2 rounded-xl text-sm font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all ml-auto">
                                        Clear All
                                   </button>
                              </div>
                         </div>

                         {/* Legs Table (Opstra Style) */}
                         <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
                              <div className="overflow-x-auto">
                                   <table className="w-full text-left border-collapse">
                                        <thead>
                                             <tr className="bg-gray-950/50 border-b border-gray-800">
                                                  <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Position</th>
                                                  <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                                  <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Strike</th>
                                                  <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price (₹)</th>
                                                  <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">IV %</th>
                                                  <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Delta</th>
                                                  <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                             </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800/60">
                                             {legs.length === 0 ? (
                                                  <tr>
                                                       <td colSpan={7} className="px-4 py-12 text-center text-gray-500 text-sm">
                                                            No legs added. Select a template above or connect API to build custom strategies.
                                                       </td>
                                                  </tr>
                                             ) : (
                                                  legs.map((leg) => (
                                                       <tr key={leg.id} className="hover:bg-gray-800/20 transition-colors">
                                                            <td className="px-4 py-3">
                                                                 <span className={`text-xs font-bold px-2 py-1 rounded-md ${leg.position === 'Long' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                                      {leg.position}
                                                                 </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm font-bold text-white">{leg.type}</td>
                                                            <td className="px-4 py-3 font-mono text-sm text-gray-300">{leg.strike}</td>
                                                            <td className="px-4 py-3 font-mono text-sm text-gray-300">{leg.price.toFixed(2)}</td>
                                                            <td className="px-4 py-3 font-mono text-sm text-amber-400">{leg.iv}%</td>
                                                            <td className="px-4 py-3 font-mono text-sm text-gray-400">{leg.delta}</td>
                                                            <td className="px-4 py-3">
                                                                 <button onClick={() => removeLeg(leg.id)} className="text-gray-600 hover:text-rose-400 transition-colors p-1">
                                                                      <span className="sr-only">Remove</span>✕
                                                                 </button>
                                                            </td>
                                                       </tr>
                                                  ))
                                             )}
                                        </tbody>
                                   </table>
                              </div>

                              {/* Strategy Greeks Summary Footer */}
                              {metrics && (
                                   <div className="bg-gray-950 border-t border-gray-800 p-4 flex flex-wrap items-center justify-between gap-4">
                                        <span className="text-sm font-bold text-gray-400 flex items-center gap-2">
                                             <Activity size={16} /> Strategy Greeks
                                        </span>
                                        <div className="flex gap-6">
                                             <div className="flex flex-col">
                                                  <span className="text-[10px] text-gray-500 font-bold uppercase">Total Delta</span>
                                                  <span className={`font-mono text-sm font-bold ${metrics.totalDelta > 0 ? 'text-emerald-400' : metrics.totalDelta < 0 ? 'text-rose-400' : 'text-gray-300'}`}>
                                                       {metrics.totalDelta > 0 ? '+' : ''}{metrics.totalDelta.toFixed(2)}
                                                  </span>
                                             </div>
                                             <div className="flex flex-col">
                                                  <span className="text-[10px] text-gray-500 font-bold uppercase">Total Theta</span>
                                                  <span className={`font-mono text-sm font-bold ${metrics.totalTheta > 0 ? 'text-emerald-400' : metrics.totalTheta < 0 ? 'text-rose-400' : 'text-gray-300'}`}>
                                                       {metrics.totalTheta > 0 ? '+' : ''}{metrics.totalTheta.toFixed(2)}
                                                  </span>
                                             </div>
                                        </div>
                                   </div>
                              )}
                         </div>
                    </div>

                    {/* Right Column: Opstra-Style Summary Dashboard */}
                    <div className="xl:col-span-4 flex flex-col gap-6">

                         <div className="bg-[#0c121e] border border-gray-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                              {/* Background Geometric Accent */}
                              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>

                              <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2 border-b border-gray-800/60 pb-4">
                                   <BarChart3 size={18} className="text-blue-400" /> Payoff Summary
                              </h3>

                              {!metrics ? (
                                   <div className="text-center py-10 opacity-50">
                                        <Percent size={32} className="mx-auto text-gray-600 mb-3" />
                                        <p className="text-sm text-gray-400 font-medium">Add strategy legs to view POP and payoff metrics.</p>
                                   </div>
                              ) : (
                                   <div className="grid grid-cols-2 gap-4">

                                        {/* POP Box */}
                                        <div className="col-span-2 bg-gradient-to-br from-blue-900/20 to-gray-900 border border-blue-900/30 rounded-2xl p-4 flex items-center justify-between">
                                             <div className="flex flex-col">
                                                  <span className="text-[11px] text-blue-400 font-bold uppercase tracking-wider mb-1">Probability of Profit</span>
                                                  <span className="text-3xl font-extrabold text-white">{metrics.pop}%</span>
                                             </div>
                                             <div className="w-12 h-12 rounded-full border-[4px] border-blue-500/30 flex items-center justify-center relative">
                                                  {/* Geometric Arc Representation */}
                                                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                                                       <circle cx="24" cy="24" r="20" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="125.6" strokeDashoffset={125.6 - (125.6 * metrics.pop / 100)} strokeLinecap="round" />
                                                  </svg>
                                             </div>
                                        </div>

                                        {/* Net Premium */}
                                        <div className="col-span-2 bg-gray-950 border border-gray-800 rounded-2xl p-4 flex items-center justify-between">
                                             <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Net Premium</span>
                                             <div className="flex items-center gap-2">
                                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${metrics.isCredit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                       {metrics.isCredit ? 'CREDIT' : 'DEBIT'}
                                                  </span>
                                                  <span className="font-mono font-bold text-white text-lg">₹{Math.abs(metrics.netPremium).toLocaleString('en-IN')}</span>
                                             </div>
                                        </div>

                                        {/* Max Profit */}
                                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
                                             <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider block mb-1">Max Profit</span>
                                             <span className="font-mono font-bold text-emerald-400 text-lg">
                                                  {typeof metrics.maxProfit === 'string' ? metrics.maxProfit : `₹${metrics.maxProfit.toLocaleString('en-IN')}`}
                                             </span>
                                        </div>

                                        {/* Max Loss */}
                                        <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4">
                                             <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider block mb-1">Max Loss</span>
                                             <span className="font-mono font-bold text-rose-400 text-lg">
                                                  {typeof metrics.maxLoss === 'string' ? metrics.maxLoss : `₹${metrics.maxLoss.toLocaleString('en-IN')}`}
                                             </span>
                                        </div>

                                        {/* Next Steps Prompt */}
                                        <div className="col-span-2 mt-2">
                                             <button className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-all text-sm group border border-gray-700">
                                                  Open in Visualizer Chart <ChevronRight size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                                             </button>
                                        </div>
                                   </div>
                              )}
                         </div>

                         {/* Premium Upsell for Live Chain */}
                         <div className="bg-gradient-to-br from-blue-950/40 to-gray-900 border border-blue-900/50 rounded-3xl p-6 relative overflow-hidden">
                              <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                                   <Lock size={16} className="text-blue-400" /> Live Option Chain API
                              </h4>
                              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                                   Upgrade to Premium to unlock the live option chain. Instantly build strategies by clicking bid/ask prices directly from live NSE market data.
                              </p>
                              <button
                                   onClick={() => setShowPremiumModal(true)}
                                   className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                              >
                                   Unlock Live Chain
                              </button>
                         </div>

                    </div>
               </div>

               {/* Mock Premium Upgrade Modal */}
               {showPremiumModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                         <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center relative">
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg shadow-blue-500/20">
                                   <Zap size={32} />
                              </div>
                              <h2 className="text-2xl font-bold text-white mb-2">Live NSE Market Data</h2>
                              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                                   Upgrade to Premium to replace manual entry with our low-latency Option Chain grid. Build advanced spreads with real-time bid/ask parsing and dynamic IV calculations.
                              </p>
                              <div className="flex flex-col gap-3">
                                   <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg">
                                        View Premium Plans
                                   </button>
                                   <button
                                        onClick={() => setShowPremiumModal(false)}
                                        className="text-gray-500 hover:text-white text-sm font-medium py-2 transition-colors"
                                   >
                                        Cancel
                                   </button>
                              </div>
                         </div>
                    </div>
               )}

          </div>
     );
}