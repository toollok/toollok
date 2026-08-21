"use client";

import { useRef, useState } from "react";

interface Point {
     price: number;
     pnl: number;
}

interface PayoffChartProps {
     underlyingPrice: number;
     points: Point[];
     minPnL: number;
     maxPnL: number;
     minStrike: number;
     maxStrike: number;
}

export default function PayoffChart({
     underlyingPrice, points, minPnL, maxPnL, minStrike, maxStrike
}: PayoffChartProps) {
     const chartContainerRef = useRef<HTMLDivElement>(null);
     const [hoveredPrice, setHoveredPrice] = useState<number | null>(null);
     const [hoveredPnL, setHoveredPnL] = useState<number | null>(null);
     const [tooltipLeftPercent, setTooltipLeftPercent] = useState<number>(0);

     const chartHeight = 320;
     const chartWidth = 800;

     const getX = (price: number) => ((price - minStrike) / (maxStrike - minStrike)) * chartWidth;
     const getY = (pnl: number) => {
          const range = (maxPnL === minPnL) ? 1 : maxPnL - minPnL;
          return chartHeight - (((pnl - minPnL) / range) * chartHeight);
     };

     const zeroLineY = getY(0);
     const pathD = points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(pt.price)},${getY(pt.pnl)}`).join(" ");

     const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
          if (!chartContainerRef.current || points.length === 0) return;
          const rect = chartContainerRef.current.getBoundingClientRect();
          const xPos = e.clientX - rect.left;
          const percentage = Math.max(0, Math.min(1, xPos / rect.width));
          const priceRange = maxStrike - minStrike;
          const price = minStrike + percentage * priceRange;

          let closest = points[0];
          let minDiff = Math.abs(closest.price - price);
          for (const pt of points) {
               const diff = Math.abs(pt.price - price);
               if (diff < minDiff) { minDiff = diff; closest = pt; }
          }
          setHoveredPrice(closest.price); setHoveredPnL(closest.pnl); setTooltipLeftPercent(percentage * 100);
     };

     return (
          <div
               ref={chartContainerRef}
               onMouseMove={handleMouseMove}
               onMouseLeave={() => { setHoveredPrice(null); setHoveredPnL(null); }}
               className="relative w-full aspect-[2/1] bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden cursor-crosshair select-none transition-colors"
          >
               <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    {/* Grid Lines */}
                    <line x1="0" y1="25%" x2="100%" y2="25%" stroke="currentColor" strokeWidth="1" className="text-gray-200 dark:text-gray-800 opacity-50" />
                    <line x1="0" y1="50%" x2="100%" y2="50%" stroke="currentColor" strokeWidth="1" className="text-gray-200 dark:text-gray-800 opacity-50" />
                    <line x1="0" y1="75%" x2="100%" y2="75%" stroke="currentColor" strokeWidth="1" className="text-gray-200 dark:text-gray-800 opacity-50" />

                    {/* Zero Line & Spot Line */}
                    <line x1="0" y1={zeroLineY} x2={chartWidth} y2={zeroLineY} stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-gray-400 dark:text-gray-600 opacity-50" />
                    <line x1={getX(underlyingPrice)} y1="0" x2={getX(underlyingPrice)} y2={chartHeight} stroke="rgba(59, 130, 246, 0.4)" strokeWidth="2" />

                    {/* Payoff Curve */}
                    <path d={pathD} fill="none" stroke="#10b981" strokeWidth="3" vectorEffect="non-scaling-stroke" />

                    {/* Hover Interaction */}
                    {hoveredPrice !== null && hoveredPnL !== null && (
                         <>
                              <line x1={getX(hoveredPrice)} y1="0" x2={getX(hoveredPrice)} y2={chartHeight} stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" className="text-gray-400 dark:text-gray-500 opacity-80" />
                              <circle cx={getX(hoveredPrice)} cy={getY(hoveredPnL)} r="5" fill={hoveredPnL >= 0 ? "#10b981" : "#f43f5e"} stroke="#ffffff" strokeWidth="2" />
                         </>
                    )}
               </svg>

               {/* Hover Tooltip */}
               {hoveredPrice !== null && hoveredPnL !== null && (
                    <div
                         className="absolute top-4 bg-white/90 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700 backdrop-blur-md rounded-xl px-3 py-2 text-xs shadow-xl pointer-events-none z-20 flex flex-col gap-0.5 transform -translate-x-1/2"
                         style={{ left: `${tooltipLeftPercent}%` }}
                    >
                         <div className="flex justify-between gap-3 text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                              <span>Spot:</span><span className="text-gray-900 dark:text-white font-bold">₹{hoveredPrice.toFixed(0)}</span>
                         </div>
                         <div className="flex justify-between gap-3 text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                              <span>P&L:</span><span className={`font-bold ${hoveredPnL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{hoveredPnL >= 0 ? '+' : ''}₹{hoveredPnL.toFixed(0)}</span>
                         </div>
                    </div>
               )}
          </div>
     );
}