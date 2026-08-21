"use client";

import { Clock, Activity, RotateCcw } from "lucide-react";

interface ScenarioAnalysisProps {
     daysToExpiry: number;
     setDaysToExpiry: (val: number) => void;
     impliedVolatility: number;
     setImpliedVolatility: (val: number) => void;
     initialDte: number;
     initialIv: number;
}

export default function ScenarioAnalysis({
     daysToExpiry, setDaysToExpiry, impliedVolatility, setImpliedVolatility, initialDte, initialIv
}: ScenarioAnalysisProps) {

     const resetScenarios = () => {
          setDaysToExpiry(initialDte);
          setImpliedVolatility(initialIv);
     };

     return (
          <div className="flex flex-col gap-6 bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
               <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Scenario Simulator</h4>
                    <button onClick={resetScenarios} className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                         <RotateCcw size={12} /> Reset
                    </button>
               </div>

               {/* Time Decay Slider */}
               <div className="space-y-4">
                    <div className="flex justify-between items-center">
                         <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                              <Clock size={14} /> Days to Expiration
                         </label>
                         <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">{daysToExpiry}d</span>
                    </div>
                    <input
                         type="range" min="0" max="90" step="1"
                         value={daysToExpiry}
                         onChange={(e) => setDaysToExpiry(Number(e.target.value))}
                         className="w-full accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                         <span>0DTE</span>
                         <span>90DTE</span>
                    </div>
               </div>

               {/* Implied Volatility Slider */}
               <div className="space-y-4">
                    <div className="flex justify-between items-center">
                         <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                              <Activity size={14} /> Implied Volatility (%)
                         </label>
                         <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">{impliedVolatility}%</span>
                    </div>
                    <input
                         type="range" min="5" max="150" step="1"
                         value={impliedVolatility}
                         onChange={(e) => setImpliedVolatility(Number(e.target.value))}
                         className="w-full accent-purple-500"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                         <span>Low IV (5%)</span>
                         <span>High IV (150%)</span>
                    </div>
               </div>
          </div>
     );
}