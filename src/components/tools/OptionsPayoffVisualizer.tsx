"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { TrendingUp, Activity, Target, Clock, BarChart3, AlertTriangle } from "lucide-react";
import { calculateBlackScholesGreeks, PayoffLeg } from "@/lib/finance-math";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import AdSlot from "@/components/ui/AdSlot";

// Import our newly created components
import StrategySelector from "@/components/options/StrategySelector";
import PayoffChart from "@/components/options/PayoffChart";
import GreeksDashboard from "@/components/options/GreeksDashboard";
import ScenarioAnalysis from "@/components/options/ScenarioAnalysis";

type ActiveTab = "strategy" | "greeks" | "scenarios";

interface DetailedOptionLeg extends PayoffLeg {
     id: string;
}

const MARKET_ASSETS = {
     NIFTY: { spot: 24000, lotSize: 50 },
     BANKNIFTY: { spot: 51000, lotSize: 15 },
     FINNIFTY: { spot: 22500, lotSize: 40 },
     MIDCPNIFTY: { spot: 12000, lotSize: 75 },
     SENSEX: { spot: 79000, lotSize: 10 }
};

export default function OptionsPayoffVisualizer() {
     const [activeAsset, setActiveAsset] = useState<keyof typeof MARKET_ASSETS>("NIFTY");
     const [underlyingPrice, setUnderlyingPrice] = useState<number>(MARKET_ASSETS.NIFTY.spot);
     const [lotSize, setLotSize] = useState<number>(MARKET_ASSETS.NIFTY.lotSize);

     // Scenario States
     const [initialDte] = useState<number>(30);
     const [initialIv] = useState<number>(15);
     const [daysToExpiry, setDaysToExpiry] = useState<number>(initialDte);
     const [impliedVolatility, setImpliedVolatility] = useState<number>(initialIv);
     const [riskFreeRate] = useState<number>(0.07);

     const [activeTab, setActiveTab] = useState<ActiveTab>("strategy");

     const [legs, setLegs] = useState<DetailedOptionLeg[]>([
          { id: "1", position: "Long", type: "Call", strike: 24000, premium: 150, quantity: 1 }
     ]);

     const applyStrategy = (strategy: string) => {
          // Dynamically calculate appropriate strike intervals based on the selected asset
          const interval = (activeAsset === "BANKNIFTY" || activeAsset === "SENSEX") ? 100 : 50;
          const atm = Math.round(underlyingPrice / interval) * interval;
          const step = interval * 4; // e.g., 200 points OTM for NIFTY
          const farStep = interval * 8; // e.g., 400 points OTM for NIFTY

          switch (strategy) {
               // --- BULLISH ---
               case "LongCall":
                    setLegs([{ id: Math.random().toString(), position: "Long", type: "Call", strike: atm, premium: 150, quantity: 1 }]);
                    break;
               case "BullCall":
                    setLegs([
                         { id: Math.random().toString(), position: "Long", type: "Call", strike: atm, premium: 150, quantity: 1 },
                         { id: Math.random().toString(), position: "Short", type: "Call", strike: atm + step, premium: 60, quantity: 1 }
                    ]);
                    break;
               case "BullPut":
                    setLegs([
                         { id: Math.random().toString(), position: "Short", type: "Put", strike: atm, premium: 150, quantity: 1 },
                         { id: Math.random().toString(), position: "Long", type: "Put", strike: atm - step, premium: 60, quantity: 1 }
                    ]);
                    break;

               // --- BEARISH ---
               case "LongPut":
                    setLegs([{ id: Math.random().toString(), position: "Long", type: "Put", strike: atm, premium: 150, quantity: 1 }]);
                    break;
               case "BearPut":
                    setLegs([
                         { id: Math.random().toString(), position: "Long", type: "Put", strike: atm, premium: 150, quantity: 1 },
                         { id: Math.random().toString(), position: "Short", type: "Put", strike: atm - step, premium: 60, quantity: 1 }
                    ]);
                    break;
               case "BearCall":
                    setLegs([
                         { id: Math.random().toString(), position: "Short", type: "Call", strike: atm, premium: 150, quantity: 1 },
                         { id: Math.random().toString(), position: "Long", type: "Call", strike: atm + step, premium: 60, quantity: 1 }
                    ]);
                    break;

               // --- NEUTRAL ---
               case "IronCondor":
                    setLegs([
                         { id: Math.random().toString(), position: "Long", type: "Put", strike: atm - farStep, premium: 30, quantity: 1 },
                         { id: Math.random().toString(), position: "Short", type: "Put", strike: atm - step, premium: 100, quantity: 1 },
                         { id: Math.random().toString(), position: "Short", type: "Call", strike: atm + step, premium: 100, quantity: 1 },
                         { id: Math.random().toString(), position: "Long", type: "Call", strike: atm + farStep, premium: 30, quantity: 1 }
                    ]);
                    break;
               case "ShortStraddle":
                    setLegs([
                         { id: Math.random().toString(), position: "Short", type: "Call", strike: atm, premium: 150, quantity: 1 },
                         { id: Math.random().toString(), position: "Short", type: "Put", strike: atm, premium: 150, quantity: 1 }
                    ]);
                    break;

               // --- VOLATILITY ---
               case "LongStraddle":
                    setLegs([
                         { id: Math.random().toString(), position: "Long", type: "Call", strike: atm, premium: 150, quantity: 1 },
                         { id: Math.random().toString(), position: "Long", type: "Put", strike: atm, premium: 150, quantity: 1 }
                    ]);
                    break;
               case "LongStrangle":
                    setLegs([
                         { id: Math.random().toString(), position: "Long", type: "Put", strike: atm - step, premium: 80, quantity: 1 },
                         { id: Math.random().toString(), position: "Long", type: "Call", strike: atm + step, premium: 80, quantity: 1 }
                    ]);
                    break;

               default:
                    break;
          }

          // Return user to the strategy tab if they are on another tab when clicking
          setActiveTab("strategy");
     };

     const addLeg = () => {
          if (legs.length >= 6) return;
          setLegs([...legs, {
               id: Math.random().toString(), position: "Long", type: "Call",
               strike: underlyingPrice, premium: 100, quantity: 1
          }]);
     };

     const removeLeg = (id: string) => setLegs(legs.filter(leg => leg.id !== id));
     const updateLeg = (id: string, field: keyof DetailedOptionLeg, value: any) => setLegs(legs.map(leg => leg.id === id ? { ...leg, [field]: value } : leg));

     const handleAssetChange = (asset: keyof typeof MARKET_ASSETS) => {
          setActiveAsset(asset);
          setUnderlyingPrice(MARKET_ASSETS[asset].spot);
          setLotSize(MARKET_ASSETS[asset].lotSize);
     };

     const analysis = useMemo(() => {
          let minPnL = 0; let maxPnL = 0;
          let totalPortfolioDelta = 0; let totalPortfolioTheta = 0;
          let totalPortfolioGamma = 0; let totalPortfolioVega = 0;

          const T = Math.max(daysToExpiry, 0.01) / 365;
          const v = impliedVolatility / 100;

          const legsWithGreeks = legs.map(leg => {
               const greeks = calculateBlackScholesGreeks(underlyingPrice, leg.strike, T, riskFreeRate, v, leg.type);
               const positionMultiplier = leg.position === "Long" ? 1 : -1;
               const multiplier = leg.quantity * lotSize * positionMultiplier;

               totalPortfolioDelta += greeks.delta * multiplier;
               totalPortfolioTheta += greeks.theta * multiplier;
               totalPortfolioGamma += greeks.gamma * multiplier;
               totalPortfolioVega += greeks.vega * multiplier;

               return {
                    ...leg,
                    theoreticalPrice: greeks.price,
                    delta: greeks.delta,
                    gamma: greeks.gamma,
                    theta: greeks.theta,
                    vega: greeks.vega,
                    probITM: greeks.probITM
               };
          });

          const strikes = legs.map(l => l.strike);
          const minStrike = Math.min(...strikes, underlyingPrice) * 0.90;
          const maxStrike = Math.max(...strikes, underlyingPrice) * 1.10;
          const range = maxStrike - minStrike;
          const step = range / 100;
          const points = [];

          for (let p = minStrike; p <= maxStrike; p += step) {
               const pnl = legs.reduce((totalPnL, leg) => {
                    let intrinsicValue = 0;
                    if (leg.type === "Call") intrinsicValue = Math.max(0, p - leg.strike);
                    else if (leg.type === "Put") intrinsicValue = Math.max(0, leg.strike - p);
                    const legPnL = leg.position === "Long" ? intrinsicValue - leg.premium : leg.premium - intrinsicValue;
                    return totalPnL + (legPnL * leg.quantity * lotSize);
               }, 0);
               if (pnl < minPnL) minPnL = pnl;
               if (pnl > maxPnL) maxPnL = pnl;
               points.push({ price: p, pnl });
          }

          return { points, minPnL, maxPnL, minStrike, maxStrike, totalPortfolioDelta, totalPortfolioTheta, totalPortfolioGamma, totalPortfolioVega, legsWithGreeks };
     }, [legs, underlyingPrice, lotSize, daysToExpiry, impliedVolatility, riskFreeRate]);

     useKeyboardShortcuts([{ key: "enter", ctrlOrCmd: true, action: addLeg }]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">

               <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                              <TrendingUp size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Options Strategy Analyzer</h1>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                        NIFTY Ready
                                   </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Map multi-leg derivatives strategies with Black-Scholes Greeks, time decay, and scenarios.</p>
                         </div>
                    </div>
               </div>

               {/* Asset Selector */}
               <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-[#0c121e] p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
                    <span className="text-xs font-bold text-gray-500 uppercase">Underlying Asset:</span>
                    <div className="flex gap-2">
                         {Object.keys(MARKET_ASSETS).map((asset) => (
                              <button key={asset} onClick={() => handleAssetChange(asset as keyof typeof MARKET_ASSETS)}
                                   className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${activeAsset === asset ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400' : 'bg-transparent border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900'}`}>
                                   {asset}
                              </button>
                         ))}
                    </div>
               </div>

               {/* Main Terminal Grid */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT COLUMN: Input & Tabs */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                         <div className="bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl transition-colors">

                              <div className="grid grid-cols-3 gap-3 mb-6 bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
                                   <div>
                                        <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Spot (₹)</label>
                                        <input type="number" value={underlyingPrice} onChange={(e) => setUnderlyingPrice(Number(e.target.value) || 0)} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-xs text-gray-900 dark:text-white font-mono outline-none text-right" />
                                   </div>
                                   <div>
                                        <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Lot Size</label>
                                        <input type="number" value={lotSize} onChange={(e) => setLotSize(Number(e.target.value) || 0)} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-xs text-gray-900 dark:text-white font-mono outline-none text-right" />
                                   </div>
                                   <div>
                                        <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">IV (%)</label>
                                        <input type="number" value={impliedVolatility} onChange={(e) => setImpliedVolatility(Number(e.target.value) || 0)} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-xs text-gray-900 dark:text-white font-mono outline-none text-right" />
                                   </div>
                              </div>

                              {/* Navigation Tabs */}
                              <div className="flex gap-6 mb-6 border-b border-gray-200 dark:border-gray-800">
                                   <button
                                        onClick={() => setActiveTab('strategy')}
                                        className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 -mb-px transition-all ${activeTab === 'strategy'
                                             ? 'border-emerald-500 text-gray-900 dark:text-white'
                                             : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                             }`}
                                   >
                                        <Target size={16} /> Builder
                                   </button>
                                   <button
                                        onClick={() => setActiveTab('greeks')}
                                        className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 -mb-px transition-all ${activeTab === 'greeks'
                                             ? 'border-emerald-500 text-gray-900 dark:text-white'
                                             : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                             }`}
                                   >
                                        <BarChart3 size={16} /> Greeks
                                   </button>
                                   <button
                                        onClick={() => setActiveTab('scenarios')}
                                        className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 -mb-px transition-all ${activeTab === 'scenarios'
                                             ? 'border-emerald-500 text-gray-900 dark:text-white'
                                             : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                             }`}
                                   >
                                        <Clock size={16} /> Scenarios
                                   </button>
                              </div>

                              {/* Tab Contents */}
                              {activeTab === 'strategy' && (
                                   <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        {/* Using the StrategySelector Component */}
                                        <div className="mb-6">
                                             <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Quick Templates</h4>
                                             <StrategySelector onSelectStrategy={applyStrategy} />
                                        </div>

                                        {analysis.legsWithGreeks.map((leg, index) => (
                                             <div key={leg.id} className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 relative group">
                                                  {/* Simple Leg Builder from your original code */}
                                                  <div className="flex justify-between mb-3">
                                                       <span className="text-xs font-bold text-gray-500">Leg {index + 1}</span>
                                                       <button onClick={() => removeLeg(leg.id)} disabled={legs.length === 1} className="text-gray-400 hover:text-rose-600 disabled:opacity-30">🗑️</button>
                                                  </div>
                                                  <div className="grid grid-cols-2 gap-3 mb-3">
                                                       <select value={leg.position} onChange={(e) => updateLeg(leg.id, "position", e.target.value)} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold">
                                                            <option value="Long">Long</option><option value="Short">Short</option>
                                                       </select>
                                                       <select value={leg.type} onChange={(e) => updateLeg(leg.id, "type", e.target.value)} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold">
                                                            <option value="Call">Call</option><option value="Put">Put</option>
                                                       </select>
                                                  </div>
                                                  <div className="grid grid-cols-3 gap-3">
                                                       <div>
                                                            <label className="text-[10px] text-gray-500 font-bold block mb-1">Strike</label>
                                                            <input type="number" value={leg.strike} onChange={(e) => updateLeg(leg.id, "strike", Number(e.target.value))} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-1 text-xs font-mono" />
                                                       </div>
                                                       <div>
                                                            <label className="text-[10px] text-gray-500 font-bold block mb-1">Premium</label>
                                                            <input type="number" value={leg.premium} onChange={(e) => updateLeg(leg.id, "premium", Number(e.target.value))} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-1 text-xs font-mono" />
                                                       </div>
                                                       <div>
                                                            <label className="text-[10px] text-gray-500 font-bold block mb-1">Lots</label>
                                                            <input type="number" value={leg.quantity} onChange={(e) => updateLeg(leg.id, "quantity", Number(e.target.value))} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-1 text-xs font-mono" />
                                                       </div>
                                                  </div>
                                             </div>
                                        ))}
                                        <button onClick={addLeg} disabled={legs.length >= 6} className="w-full mt-4 flex justify-center gap-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold py-3 rounded-xl text-xs border border-gray-200 dark:border-gray-700">
                                             + Add Leg
                                        </button>
                                   </div>
                              )}

                              {activeTab === 'greeks' && (
                                   <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <GreeksDashboard
                                             legs={analysis.legsWithGreeks}
                                             lotSize={lotSize}
                                             portfolioDelta={analysis.totalPortfolioDelta}
                                             portfolioTheta={analysis.totalPortfolioTheta}
                                             portfolioGamma={analysis.totalPortfolioGamma}
                                             portfolioVega={analysis.totalPortfolioVega}
                                        />
                                   </div>
                              )}

                              {activeTab === 'scenarios' && (
                                   <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <ScenarioAnalysis
                                             daysToExpiry={daysToExpiry}
                                             setDaysToExpiry={setDaysToExpiry}
                                             impliedVolatility={impliedVolatility}
                                             setImpliedVolatility={setImpliedVolatility}
                                             initialDte={initialDte}
                                             initialIv={initialIv}
                                        />
                                   </div>
                              )}
                         </div>
                    </div>

                    {/* RIGHT COLUMN: Charting */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                         <div className="bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-xl transition-colors">

                              <div className="flex items-center justify-between mb-6">
                                   <h3 className="text-gray-900 dark:text-white font-bold text-base flex items-center gap-2">
                                        <Activity size={18} className="text-emerald-500" /> Payoff Curve
                                   </h3>
                                   <div className="flex gap-4">
                                        <div className="text-right">
                                             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Max Profit</p>
                                             <p className="text-emerald-600 font-mono font-bold text-xs">{analysis.maxPnL > 10000000 ? "Unlimited" : `₹${analysis.maxPnL.toLocaleString('en-IN')}`}</p>
                                        </div>
                                        <div className="w-px bg-gray-200 dark:bg-gray-800 h-8"></div>
                                        <div className="text-right">
                                             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Max Risk</p>
                                             <p className="text-rose-600 font-mono font-bold text-xs">{analysis.minPnL < -10000000 ? "Unlimited" : `₹${Math.abs(analysis.minPnL).toLocaleString('en-IN')}`}</p>
                                        </div>
                                   </div>
                              </div>

                              <PayoffChart
                                   underlyingPrice={underlyingPrice}
                                   points={analysis.points}
                                   minPnL={analysis.minPnL}
                                   maxPnL={analysis.maxPnL}
                                   minStrike={analysis.minStrike}
                                   maxStrike={analysis.maxStrike}
                              />
                         </div>
                    </div>
               </div>

               {/* Disclaimer Section */}
               <div className="mt-4 flex gap-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-5 items-start">
                    <AlertTriangle size={20} className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                    <div>
                         <h4 className="text-sm font-bold text-amber-900 dark:text-amber-400 mb-1">Financial Disclaimer</h4>
                         <p className="text-xs text-amber-800 dark:text-amber-200/70 leading-relaxed">
                              This Advanced Options Strategy Analyzer is intended strictly for educational and informational purposes. All metrics, including Black-Scholes Greeks, probabilities, and theoretical payoff pricing, are derived from mathematical models and do not guarantee real-world future results. This tool does not constitute financial advice, investment recommendations, or an offer to buy or sell securities. Options trading carries a high level of risk and is not suitable for all investors. Always consult with a certified financial advisor before executing trades in live markets.
                         </p>
                    </div>
               </div>

               <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                         __html: JSON.stringify({
                              "@context": "https://schema.org",
                              "@type": "SoftwareApplication",
                              "name": "Advanced Options Strategy Analyzer",
                              "applicationCategory": "FinanceApplication",
                              "operatingSystem": "All",
                              "offers": {
                                   "@type": "Offer",
                                   "price": "0",
                                   "priceCurrency": "INR"
                              },
                              "description": "Free advanced options payoff visualizer and strategy analyzer for Indian markets (NIFTY, BANKNIFTY). Calculate Black-Scholes Greeks, time decay, and visualize max profit/loss.",
                              "mainEntity": {
                                   "@type": "FAQPage",
                                   "mainEntity": [
                                        {
                                             "@type": "Question",
                                             "name": "What is an options payoff diagram?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "An options payoff diagram is a visual representation of the potential profit or loss of an options trading strategy at various price points of the underlying asset at expiration." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "How is Maximum Risk calculated in an Iron Condor?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Maximum risk in an Iron Condor is calculated as the width of the wider spread minus the total premium collected, multiplied by the lot size." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "What is Portfolio Delta?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Portfolio Delta represents your strategy's directional exposure. A positive total Delta means the position benefits from upward market movement, while a negative Delta benefits from a downward move." }
                                        }
                                   ]
                              }
                         })
                    }}
               />
          </div>
     );
}