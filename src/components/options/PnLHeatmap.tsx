"use client";

import { useMemo } from "react";
import { calculateBlackScholesGreeks, PayoffLeg } from "@/lib/finance-math";

interface PnLHeatmapProps {
     legs: PayoffLeg[];
     currentSpot: number;
     currentDte: number;
     iv: number;
     lotSize: number;
     riskFreeRate?: number;
}

export default function PnLHeatmap({
     legs,
     currentSpot,
     currentDte,
     iv,
     lotSize,
     riskFreeRate = 0.07
}: PnLHeatmapProps) {

     const analysis = useMemo(() => {
          // Generate X-Axis: Price shifts from -10% to +10%
          const spotSteps = [-0.10, -0.05, -0.02, 0, 0.02, 0.05, 0.10].map(shift => currentSpot * (1 + shift));

          // Generate Y-Axis: Time decay steps down to 0 DTE
          const dteSteps = [currentDte, Math.floor(currentDte * 0.75), Math.floor(currentDte * 0.5), Math.floor(currentDte * 0.25), 0]
               .filter((val, index, arr) => arr.indexOf(val) === index) // Remove duplicates if DTE is very low
               .sort((a, b) => b - a);

          let maxAbsPnL = 0;
          const grid = dteSteps.map(dte => {
               return spotSteps.map(spot => {
                    const T = Math.max(dte, 0.01) / 365;
                    const v = iv / 100;

                    const totalPnL = legs.reduce((acc, leg) => {
                         let legValue = 0;

                         if (dte === 0) {
                              // At expiry, it's just intrinsic value
                              if (leg.type === "Call") legValue = Math.max(0, spot - leg.strike);
                              if (leg.type === "Put") legValue = Math.max(0, leg.strike - spot);
                         } else {
                              // Before expiry, use Black-Scholes theoretical price
                              const greeks = calculateBlackScholesGreeks(spot, leg.strike, T, riskFreeRate, v, leg.type);
                              legValue = greeks.price;
                         }

                         const pnlPerUnit = leg.position === "Long" ? legValue - leg.premium : leg.premium - legValue;
                         return acc + (pnlPerUnit * leg.quantity * lotSize);
                    }, 0);

                    if (Math.abs(totalPnL) > maxAbsPnL) maxAbsPnL = Math.abs(totalPnL);

                    return { spot, dte, pnl: totalPnL };
               });
          });

          return { grid, spotSteps, dteSteps, maxAbsPnL };
     }, [legs, currentSpot, currentDte, iv, lotSize, riskFreeRate]);

     return (
          <div className="bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 overflow-x-auto">
               <div className="mb-4">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">P&L Heatmap (Spot vs. Time)</h3>
                    <p className="text-xs text-gray-500">Estimated theoretical P&L. Columns = Underlying Price, Rows = Days to Expiry.</p>
               </div>

               <div className="min-w-[600px]">
                    {/* Header Row (Spot Prices) */}
                    <div className="flex">
                         <div className="w-16 shrink-0"></div>
                         {analysis.spotSteps.map((spot, i) => (
                              <div key={i} className="flex-1 text-center pb-2 text-[10px] font-bold text-gray-500 uppercase">
                                   ₹{spot.toFixed(0)}
                                   <div className="text-[9px] font-normal opacity-70">
                                        {(((spot - currentSpot) / currentSpot) * 100).toFixed(1)}%
                                   </div>
                              </div>
                         ))}
                    </div>

                    {/* Heatmap Grid */}
                    <div className="flex flex-col gap-1">
                         {analysis.grid.map((row, rowIndex) => (
                              <div key={rowIndex} className="flex gap-1">
                                   {/* DTE Label */}
                                   <div className="w-16 shrink-0 flex items-center justify-end pr-3 text-xs font-bold text-gray-500">
                                        {row[0].dte}d
                                   </div>

                                   {/* P&L Cells */}
                                   {row.map((cell, colIndex) => {
                                        const isProfit = cell.pnl >= 0;
                                        // Calculate opacity strictly based on magnitude relative to max P&L to create the gradient effect
                                        const intensity = Math.max(0.1, Math.min(0.9, Math.abs(cell.pnl) / (analysis.maxAbsPnL || 1)));

                                        return (
                                             <div
                                                  key={colIndex}
                                                  className="flex-1 h-10 rounded flex items-center justify-center font-mono text-[11px] font-bold transition-all hover:ring-2 hover:ring-gray-400 cursor-default"
                                                  style={{
                                                       backgroundColor: isProfit
                                                            ? `rgba(16, 185, 129, ${intensity})`
                                                            : `rgba(244, 63, 94, ${intensity})`,
                                                       color: intensity > 0.5 ? '#fff' : (isProfit ? '#047857' : '#be123c') // Dark text for light backgrounds, white for dark
                                                  }}
                                             >
                                                  {isProfit ? '+' : ''}{cell.pnl.toFixed(0)}
                                             </div>
                                        );
                                   })}
                              </div>
                         ))}
                    </div>
               </div>
          </div>
     );
}