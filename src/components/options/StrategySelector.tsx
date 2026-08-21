"use client";

import { TrendingUp, TrendingDown, ArrowLeftRight, Activity } from "lucide-react";

interface StrategySelectorProps {
     onSelectStrategy: (strategy: string) => void;
}

export default function StrategySelector({ onSelectStrategy }: StrategySelectorProps) {
     const categories = [
          {
               name: "Bullish",
               icon: <TrendingUp size={14} className="text-emerald-500" />,
               strategies: [
                    { id: "LongCall", label: "Long Call" },
                    { id: "BullCall", label: "Bull Call Spread" },
                    { id: "BullPut", label: "Bull Put Spread" }
               ]
          },
          {
               name: "Bearish",
               icon: <TrendingDown size={14} className="text-rose-500" />,
               strategies: [
                    { id: "LongPut", label: "Long Put" },
                    { id: "BearPut", label: "Bear Put Spread" },
                    { id: "BearCall", label: "Bear Call Spread" }
               ]
          },
          {
               name: "Neutral",
               icon: <ArrowLeftRight size={14} className="text-blue-500" />,
               strategies: [
                    { id: "IronCondor", label: "Iron Condor" },
                    { id: "ShortStraddle", label: "Short Straddle" }
               ]
          },
          {
               name: "Volatility",
               icon: <Activity size={14} className="text-purple-500" />,
               strategies: [
                    { id: "LongStraddle", label: "Long Straddle" },
                    { id: "LongStrangle", label: "Long Strangle" }
               ]
          }
     ];

     return (
          // Changed to grid-cols-2 to fit perfectly in the side column
          <div className="grid grid-cols-2 gap-3">
               {categories.map((category) => (
                    <div key={category.name} className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-3 shadow-sm">
                         <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                              {category.icon}
                              <h4 className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{category.name}</h4>
                         </div>
                         <div className="flex flex-col gap-1">
                              {category.strategies.map(strat => (
                                   <button
                                        key={strat.id}
                                        onClick={() => onSelectStrategy(strat.id)}
                                        className="text-left text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-2 py-1.5 rounded-lg transition-colors whitespace-nowrap overflow-hidden text-ellipsis"
                                   >
                                        {strat.label}
                                   </button>
                              ))}
                         </div>
                    </div>
               ))}
          </div>
     );
}