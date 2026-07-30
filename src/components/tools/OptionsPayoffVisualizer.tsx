"use client";

import { useState, useMemo, useRef } from "react";
import { LineChart, Plus, Trash2, TrendingUp, Activity, IndianRupee, ShieldCheck } from "lucide-react";
import { calculateBlackScholesGreeks, PayoffLeg } from "@/lib/finance-math";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import AdSlot from "@/components/ui/AdSlot";

type OptionType = "Call" | "Put";
type PositionType = "Long" | "Short";

interface DetailedOptionLeg extends PayoffLeg {
     id: string;
}

export default function OptionsPayoffVisualizer() {
     const [underlyingPrice, setUnderlyingPrice] = useState<number>(24000);
     const [lotSize, setLotSize] = useState<number>(50); // Default Nifty lot size
     const [daysToExpiry, setDaysToExpiry] = useState<number>(30);
     const [impliedVolatility, setImpliedVolatility] = useState<number>(15); // 15% IV
     const [riskFreeRate] = useState<number>(0.07); // 7% risk-free rate

     const [legs, setLegs] = useState<DetailedOptionLeg[]>([
          { id: "1", position: "Long", type: "Call", strike: 24000, premium: 150, quantity: 1 }
     ]);

     // Interactive Chart Tooltip State
     const chartContainerRef = useRef<HTMLDivElement>(null);
     const [hoveredPrice, setHoveredPrice] = useState<number | null>(null);
     const [hoveredPnL, setHoveredPnL] = useState<number | null>(null);
     const [tooltipLeftPercent, setTooltipLeftPercent] = useState<number>(0);

     const addLeg = () => {
          if (legs.length >= 4) return;
          setLegs([...legs, {
               id: Math.random().toString(),
               position: "Long",
               type: "Call",
               strike: underlyingPrice,
               premium: 100,
               quantity: 1
          }]);
     };

     const removeLeg = (id: string) => {
          setLegs(legs.filter(leg => leg.id !== id));
     };

     const updateLeg = (id: string, field: keyof DetailedOptionLeg, value: any) => {
          setLegs(legs.map(leg => leg.id === id ? { ...leg, [field]: value } : leg));
     };

     // Core Financial Math & Greeks Aggregation
     const analysis = useMemo(() => {
          let minPnL = 0;
          let maxPnL = 0;
          let totalPortfolioDelta = 0;
          let totalPortfolioTheta = 0;

          const T = daysToExpiry / 365;
          const v = impliedVolatility / 100;

          // Calculate Greeks per leg
          const legsWithGreeks = legs.map(leg => {
               const greeks = calculateBlackScholesGreeks(underlyingPrice, leg.strike, T, riskFreeRate, v, leg.type);
               const positionMultiplier = leg.position === "Long" ? 1 : -1;

               totalPortfolioDelta += greeks.delta * leg.quantity * lotSize * positionMultiplier;
               totalPortfolioTheta += greeks.theta * leg.quantity * lotSize * positionMultiplier;

               return { ...leg, theoreticalPrice: greeks.price, delta: greeks.delta };
          });

          const minStrike = Math.min(...legs.map(l => l.strike), underlyingPrice) * 0.93;
          const maxStrike = Math.max(...legs.map(l => l.strike), underlyingPrice) * 1.07;
          const range = maxStrike - minStrike;
          const step = range / 100;

          const points = [];

          for (let p = minStrike; p <= maxStrike; p += step) {
               const pnl = legs.reduce((totalPnL, leg) => {
                    let intrinsicValue = 0;
                    if (leg.type === "Call") {
                         intrinsicValue = Math.max(0, p - leg.strike);
                    } else if (leg.type === "Put") {
                         intrinsicValue = Math.max(0, leg.strike - p);
                    }

                    const legPnL = leg.position === "Long"
                         ? intrinsicValue - leg.premium
                         : leg.premium - intrinsicValue;

                    return totalPnL + (legPnL * leg.quantity * lotSize);
               }, 0);

               if (pnl < minPnL) minPnL = pnl;
               if (pnl > maxPnL) maxPnL = pnl;
               points.push({ price: p, pnl });
          }

          return { points, minPnL, maxPnL, minStrike, maxStrike, totalPortfolioDelta, totalPortfolioTheta, legsWithGreeks };
     }, [legs, underlyingPrice, lotSize, daysToExpiry, impliedVolatility, riskFreeRate]);

     // Keyboard Shortcut: Cmd/Ctrl + Enter to add a strategy leg
     useKeyboardShortcuts([
          { key: "enter", ctrlOrCmd: true, action: addLeg }
     ]);

     // Dynamic SVG Dimensions
     const chartHeight = 320;
     const chartWidth = 800;

     const getX = (price: number) => ((price - analysis.minStrike) / (analysis.maxStrike - analysis.minStrike)) * chartWidth;
     const getY = (pnl: number) => {
          const range = (analysis.maxPnL === analysis.minPnL) ? 1 : analysis.maxPnL - analysis.minPnL;
          return chartHeight - (((pnl - analysis.minPnL) / range) * chartHeight);
     };

     const zeroLineY = getY(0);

     const pathD = analysis.points.map((pt, i) =>
          `${i === 0 ? 'M' : 'L'} ${getX(pt.price)},${getY(pt.pnl)}`
     ).join(" ");

     // Mouse Move Handler for Interactive Chart Tooltip
     const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
          if (!chartContainerRef.current) return;
          const rect = chartContainerRef.current.getBoundingClientRect();
          const xPos = e.clientX - rect.left;
          const percentage = Math.max(0, Math.min(1, xPos / rect.width));

          const priceRange = analysis.maxStrike - analysis.minStrike;
          const price = analysis.minStrike + percentage * priceRange;

          // Find closest calculated data point
          let closest = analysis.points[0];
          let minDiff = Math.abs(closest.price - price);
          for (const pt of analysis.points) {
               const diff = Math.abs(pt.price - price);
               if (diff < minDiff) {
                    minDiff = diff;
                    closest = pt;
               }
          }

          setHoveredPrice(closest.price);
          setHoveredPnL(closest.pnl);
          setTooltipLeftPercent(percentage * 100);
     };

     const handleMouseLeave = () => {
          setHoveredPrice(null);
          setHoveredPnL(null);
     };

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">

               {/* Header Section */}
               <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                              <TrendingUp size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-white">Options & Derivatives Payoff Visualizer</h2>
                                   <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-400">Map multi-leg derivatives strategies with Black-Scholes Greeks and expiration simulations.</p>
                         </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-xl text-xs text-emerald-400">
                         <ShieldCheck size={16} />
                         <span>Black-Scholes Quant Engine</span>
                    </div>
               </div>

               {/* Top Ad Banner */}
               <AdSlot adSlot="top-options-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Strategy Builder & Parameters */}
                    <div className="lg:col-span-5 flex flex-col gap-6">

                         <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl">

                              {/* Global Market Parameters */}
                              <div className="grid grid-cols-3 gap-3 mb-6 bg-gray-950 p-4 rounded-2xl border border-gray-800">
                                   <div>
                                        <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Spot Price</label>
                                        <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5">
                                             <IndianRupee size={12} className="text-gray-500 shrink-0" />
                                             <input
                                                  type="number"
                                                  value={underlyingPrice}
                                                  onChange={(e) => setUnderlyingPrice(Number(e.target.value) || 0)}
                                                  className="w-full bg-transparent text-white font-mono text-xs outline-none text-right"
                                             />
                                        </div>
                                   </div>

                                   <div>
                                        <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Lot Size</label>
                                        <input
                                             type="number"
                                             value={lotSize}
                                             onChange={(e) => setLotSize(Number(e.target.value) || 0)}
                                             className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono outline-none text-right"
                                        />
                                   </div>

                                   <div>
                                        <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">IV (%)</label>
                                        <input
                                             type="number"
                                             value={impliedVolatility}
                                             onChange={(e) => setImpliedVolatility(Number(e.target.value) || 0)}
                                             className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono outline-none text-right"
                                        />
                                   </div>
                              </div>

                              <div className="flex items-center justify-between border-b border-gray-800/60 pb-3 mb-4">
                                   <h3 className="text-white font-bold text-sm flex items-center gap-2">
                                        <LineChart size={16} className="text-emerald-400" /> Strategy Legs ({legs.length}/4)
                                   </h3>
                              </div>

                              {/* Legs List */}
                              <div className="space-y-4">
                                   {analysis.legsWithGreeks.map((leg, index) => (
                                        <div key={leg.id} className="bg-gray-950 border border-gray-800 rounded-2xl p-4 relative group">
                                             <div className="flex items-center justify-between mb-3">
                                                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Leg {index + 1}</span>
                                                  <button
                                                       onClick={() => removeLeg(leg.id)}
                                                       disabled={legs.length === 1}
                                                       className="text-gray-600 hover:text-rose-400 disabled:opacity-30 transition-colors"
                                                  >
                                                       <Trash2 size={16} />
                                                  </button>
                                             </div>

                                             <div className="grid grid-cols-2 gap-3 mb-3">
                                                  <select
                                                       value={leg.position}
                                                       onChange={(e) => updateLeg(leg.id, "position", e.target.value)}
                                                       className={`bg-gray-900 border rounded-xl px-3 py-2 text-xs font-bold outline-none appearance-none ${leg.position === 'Long' ? 'border-emerald-500/50 text-emerald-400' : 'border-rose-500/50 text-rose-400'}`}
                                                  >
                                                       <option value="Long">Long (Buy)</option>
                                                       <option value="Short">Short (Sell)</option>
                                                  </select>

                                                  <select
                                                       value={leg.type}
                                                       onChange={(e) => updateLeg(leg.id, "type", e.target.value)}
                                                       className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white font-medium outline-none appearance-none"
                                                  >
                                                       <option value="Call">Call Option</option>
                                                       <option value="Put">Put Option</option>
                                                  </select>
                                             </div>

                                             <div className="grid grid-cols-3 gap-3">
                                                  <div>
                                                       <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Strike (₹)</label>
                                                       <input
                                                            type="number"
                                                            value={leg.strike}
                                                            onChange={(e) => updateLeg(leg.id, "strike", Number(e.target.value))}
                                                            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2 py-1.5 text-xs font-mono text-white outline-none focus:border-emerald-500"
                                                       />
                                                  </div>
                                                  <div>
                                                       <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Premium (₹)</label>
                                                       <input
                                                            type="number"
                                                            value={leg.premium}
                                                            onChange={(e) => updateLeg(leg.id, "premium", Number(e.target.value))}
                                                            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2 py-1.5 text-xs font-mono text-white outline-none focus:border-emerald-500"
                                                       />
                                                  </div>
                                                  <div>
                                                       <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Lots</label>
                                                       <input
                                                            type="number"
                                                            value={leg.quantity}
                                                            onChange={(e) => updateLeg(leg.id, "quantity", Number(e.target.value))}
                                                            min="1"
                                                            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2 py-1.5 text-xs font-mono text-white outline-none focus:border-emerald-500"
                                                       />
                                                  </div>
                                             </div>
                                        </div>
                                   ))}
                              </div>

                              <button
                                   onClick={addLeg}
                                   disabled={legs.length >= 4}
                                   className="w-full mt-4 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all text-xs border border-gray-700"
                                   title="Shortcut: Ctrl+Enter"
                              >
                                   <Plus size={16} /> Add Strategy Leg
                              </button>
                         </div>

                    </div>

                    {/* Right Column: Chart & Greeks Dashboard */}
                    <div className="lg:col-span-7 flex flex-col gap-6">

                         <div className="bg-[#0c121e] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl">
                              <div className="flex items-center justify-between mb-6">
                                   <h3 className="text-white font-bold text-base flex items-center gap-2">
                                        <Activity size={18} className="text-gray-400" /> P&L at Expiration & Greeks
                                   </h3>
                                   <div className="flex gap-4">
                                        <div className="text-right">
                                             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Max Profit</p>
                                             <p className="text-emerald-400 font-mono font-bold text-xs">
                                                  {analysis.maxPnL > 10000000 ? "Unlimited" : `₹${analysis.maxPnL.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                                             </p>
                                        </div>
                                        <div className="w-px bg-gray-800 h-8"></div>
                                        <div className="text-right">
                                             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Max Risk</p>
                                             <p className="text-rose-400 font-mono font-bold text-xs">
                                                  {analysis.minPnL < -10000000 ? "Unlimited" : `₹${Math.abs(analysis.minPnL).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                                             </p>
                                        </div>
                                   </div>
                              </div>

                              {/* Interactive Custom SVG Chart Container */}
                              <div
                                   ref={chartContainerRef}
                                   onMouseMove={handleMouseMove}
                                   onMouseLeave={handleMouseLeave}
                                   className="relative w-full aspect-[2/1] bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden mb-6 cursor-crosshair select-none"
                              >
                                   <svg
                                        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                                        className="w-full h-full overflow-visible"
                                        preserveAspectRatio="none"
                                   >
                                        <line x1="0" y1="25%" x2="100%" y2="25%" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                                        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                                        <line x1="0" y1="75%" x2="100%" y2="75%" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />

                                        {/* Zero Line */}
                                        <line
                                             x1="0" y1={zeroLineY}
                                             x2={chartWidth} y2={zeroLineY}
                                             stroke="rgba(255,255,255,0.2)"
                                             strokeWidth="2"
                                             strokeDasharray="4 4"
                                        />

                                        {/* Spot Price Line */}
                                        <line
                                             x1={getX(underlyingPrice)} y1="0"
                                             x2={getX(underlyingPrice)} y2={chartHeight}
                                             stroke="rgba(59, 130, 246, 0.4)"
                                             strokeWidth="2"
                                        />

                                        {/* Payoff Curve Path */}
                                        <path
                                             d={pathD}
                                             fill="none"
                                             stroke="#10b981"
                                             strokeWidth="3"
                                             vectorEffect="non-scaling-stroke"
                                        />

                                        {/* Interactive Hover Crosshair & Point */}
                                        {hoveredPrice !== null && hoveredPnL !== null && (
                                             <>
                                                  <line
                                                       x1={getX(hoveredPrice)} y1="0"
                                                       x2={getX(hoveredPrice)} y2={chartHeight}
                                                       stroke="rgba(255, 255, 255, 0.5)"
                                                       strokeWidth="1.5"
                                                       strokeDasharray="3 3"
                                                  />
                                                  <circle
                                                       cx={getX(hoveredPrice)}
                                                       cy={getY(hoveredPnL)}
                                                       r="5"
                                                       fill={hoveredPnL >= 0 ? "#10b981" : "#f43f5e"}
                                                       stroke="#ffffff"
                                                       strokeWidth="2"
                                                  />
                                             </>
                                        )}
                                   </svg>

                                   {/* Floating Interactive P&L Tooltip */}
                                   {hoveredPrice !== null && hoveredPnL !== null && (
                                        <div
                                             className="absolute top-4 bg-gray-900/95 border border-gray-700 backdrop-blur-md rounded-xl px-3 py-2 text-xs shadow-2xl pointer-events-none z-20 flex flex-col gap-0.5 transform -translate-x-1/2"
                                             style={{ left: `${tooltipLeftPercent}%` }}
                                        >
                                             <div className="flex items-center justify-between gap-3 text-[10px] text-gray-400 font-mono">
                                                  <span>Underlying:</span>
                                                  <span className="text-white font-bold">₹{hoveredPrice.toFixed(1)}</span>
                                             </div>
                                             <div className="flex items-center justify-between gap-3 text-[10px] text-gray-400 font-mono">
                                                  <span>P&L:</span>
                                                  <span className={`font-bold ${hoveredPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                       {hoveredPnL >= 0 ? '+' : ''}₹{hoveredPnL.toFixed(0)}
                                                  </span>
                                             </div>
                                        </div>
                                   )}

                                   <div className="absolute top-3 right-4 flex items-center gap-2 pointer-events-none">
                                        <span className="flex items-center gap-1 text-[10px] text-gray-500 uppercase font-bold">
                                             <span className="w-2 h-2 rounded-full bg-blue-500/50"></span> Spot: ₹{underlyingPrice}
                                        </span>
                                   </div>
                              </div>

                              {/* Portfolio Greeks Bar */}
                              <div className="grid grid-cols-2 gap-4 bg-gray-950 p-4 rounded-2xl border border-gray-800">
                                   <div>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Portfolio Delta ($\Delta$)</span>
                                        <span className={`font-mono font-bold text-sm ${analysis.totalPortfolioDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                             {analysis.totalPortfolioDelta > 0 ? '+' : ''}{analysis.totalPortfolioDelta.toFixed(2)}
                                        </span>
                                   </div>
                                   <div>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Portfolio Theta ($\Theta$)</span>
                                        <span className={`font-mono font-bold text-sm ${analysis.totalPortfolioTheta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                             {analysis.totalPortfolioTheta > 0 ? '+' : ''}₹{analysis.totalPortfolioTheta.toFixed(2)} / day
                                        </span>
                                   </div>
                              </div>
                         </div>

                    </div>
               </div>

               {/* Bottom In-Feed Ad Banner */}
               <AdSlot adSlot="bottom-options-ad" format="fluid" className="mt-4" />

          </div>
     );
}