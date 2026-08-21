"use client";

interface GreekLeg {
     id: string;
     position: "Long" | "Short";
     type: "Call" | "Put";
     strike: number;
     delta: number;
     gamma: number;
     theta: number;
     vega: number;
     probITM: number;
     quantity: number;
}

interface GreeksDashboardProps {
     legs: GreekLeg[];
     lotSize: number;
     portfolioDelta: number;
     portfolioTheta: number;
     portfolioGamma: number;
     portfolioVega: number;
}

export default function GreeksDashboard({
     legs, lotSize, portfolioDelta, portfolioTheta, portfolioGamma, portfolioVega
}: GreeksDashboardProps) {

     return (
          <div className="flex flex-col gap-6 w-full">
               {/* Portfolio Summary Bar */}
               <div className="grid grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
                    <div>
                         <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Total Delta (Δ)</span>
                         <span className={`font-mono font-bold text-sm ${portfolioDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {portfolioDelta > 0 ? '+' : ''}{portfolioDelta.toFixed(2)}
                         </span>
                    </div>
                    <div>
                         <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Total Gamma (Γ)</span>
                         <span className="font-mono font-bold text-sm text-gray-900 dark:text-white">
                              {portfolioGamma.toFixed(4)}
                         </span>
                    </div>
                    <div>
                         <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Total Theta (Θ)</span>
                         <span className={`font-mono font-bold text-sm ${portfolioTheta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {portfolioTheta > 0 ? '+' : ''}₹{portfolioTheta.toFixed(2)}
                         </span>
                    </div>
                    <div>
                         <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Total Vega (V)</span>
                         <span className={`font-mono font-bold text-sm ${portfolioVega >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {portfolioVega > 0 ? '+' : ''}₹{portfolioVega.toFixed(2)}
                         </span>
                    </div>
               </div>

               {/* Individual Leg Breakdown */}
               <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                         <thead>
                              <tr className="border-b border-gray-200 dark:border-gray-800 text-[10px] uppercase text-gray-500">
                                   <th className="pb-2 font-bold">Leg</th>
                                   <th className="pb-2 font-bold">Prob. ITM</th>
                                   <th className="pb-2 font-bold">Delta</th>
                                   <th className="pb-2 font-bold">Gamma</th>
                                   <th className="pb-2 font-bold">Theta</th>
                                   <th className="pb-2 font-bold">Vega</th>
                              </tr>
                         </thead>
                         <tbody className="text-xs font-mono text-gray-700 dark:text-gray-300">
                              {legs.map((leg, i) => {
                                   const multiplier = leg.quantity * lotSize * (leg.position === "Long" ? 1 : -1);
                                   return (
                                        <tr key={leg.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                             <td className="py-3 flex items-center gap-2 font-sans">
                                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${leg.position === 'Long' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                                                       {leg.position}
                                                  </span>
                                                  {leg.strike} {leg.type}
                                             </td>
                                             <td className="py-3">{leg.probITM.toFixed(1)}%</td>
                                             <td className="py-3">{(leg.delta * multiplier).toFixed(2)}</td>
                                             <td className="py-3">{(leg.gamma * multiplier).toFixed(4)}</td>
                                             <td className="py-3">₹{(leg.theta * multiplier).toFixed(2)}</td>
                                             <td className="py-3">₹{(leg.vega * multiplier).toFixed(2)}</td>
                                        </tr>
                                   );
                              })}
                         </tbody>
                    </table>
               </div>
          </div>
     );
}