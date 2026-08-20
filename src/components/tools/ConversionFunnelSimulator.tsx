"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Filter, Users, DollarSign, Plus, Trash2, TrendingDown, ArrowRight, Activity, Download, Check, Target, Layers } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import AdSlot from "@/components/ui/AdSlot";

interface FunnelStage {
     id: string;
     name: string;
     conversionRate: number;
}

export default function ConversionFunnelSimulator() {
     const [initialTraffic, setInitialTraffic] = useState<number>(10000);
     const [customerValue, setCustomerValue] = useState<number>(50);
     const [optimizationBoost, setOptimizationBoost] = useState<number>(5);
     const [isComparisonMode, setIsComparisonMode] = useState<boolean>(false);

     const [stages, setStages] = useState<FunnelStage[]>([
          { id: "1", name: "Landing Page Visitors", conversionRate: 100 },
          { id: "2", name: "Added to Cart / Signed Up", conversionRate: 25 },
          { id: "3", name: "Initiated Checkout", conversionRate: 40 },
          { id: "4", name: "Completed Purchase", conversionRate: 60 },
     ]);

     const { isCopied, copy } = useCopyToClipboard(2000);

     const addStage = () => {
          if (stages.length >= 8) return;
          setStages([...stages, { id: Math.random().toString(), name: `New Stage ${stages.length + 1}`, conversionRate: 50 }]);
     };

     const removeStage = (id: string) => {
          if (stages.length <= 2) return;
          setStages(stages.filter(s => s.id !== id));
     };

     const updateStage = (id: string, field: keyof FunnelStage, value: any) => {
          setStages(stages.map(s => s.id === id ? { ...s, [field]: value } : s));
     };

     const funnelMetrics = useMemo(() => {
          let currentUsers = initialTraffic;
          let worstDropoff = { name: "", loss: 0, fromStage: "" };

          const calculatedStages = stages.map((stage, index) => {
               const rate = index === 0 ? 100 : stage.conversionRate;
               const usersSurviving = Math.round(currentUsers * (rate / 100));
               const usersLost = currentUsers - usersSurviving;

               if (index > 0 && usersLost > worstDropoff.loss) {
                    worstDropoff = { name: stage.name, loss: usersLost, fromStage: stages[index - 1].name };
               }
               currentUsers = usersSurviving;

               return { ...stage, usersSurviving, usersLost, percentOfOriginal: (usersSurviving / initialTraffic) * 100 };
          });

          const finalUsers = calculatedStages[calculatedStages.length - 1].usersSurviving;
          const finalRevenue = finalUsers * customerValue;
          const totalConversionRate = (finalUsers / initialTraffic) * 100;

          return { calculatedStages, finalUsers, finalRevenue, totalConversionRate, worstDropoff };
     }, [stages, initialTraffic, customerValue]);

     const optimizedMetrics = useMemo(() => {
          let currentUsers = initialTraffic;

          const calculatedStages = stages.map((stage, index) => {
               const baseRate = index === 0 ? 100 : stage.conversionRate;
               const rate = index === 0 ? 100 : Math.min(100, baseRate + optimizationBoost);
               const usersSurviving = Math.round(currentUsers * (rate / 100));
               currentUsers = usersSurviving;

               return { ...stage, optimizedRate: rate, usersSurviving, percentOfOriginal: (usersSurviving / initialTraffic) * 100 };
          });

          const finalUsers = calculatedStages[calculatedStages.length - 1].usersSurviving;
          const finalRevenue = finalUsers * customerValue;
          const totalConversionRate = (finalUsers / initialTraffic) * 100;

          return { calculatedStages, finalUsers, finalRevenue, totalConversionRate };
     }, [stages, initialTraffic, customerValue, optimizationBoost]);

     const exportCSV = () => {
          let csvContent = "data:text/csv;charset=utf-8,Stage Name,Conversion Rate (%),Surviving Users,Users Lost\n";
          funnelMetrics.calculatedStages.forEach((s, idx) => {
               csvContent += `"${s.name}",${idx === 0 ? 100 : s.conversionRate},${s.usersSurviving},${s.usersLost}\n`;
          });
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          link.setAttribute("download", "toollok_funnel_analysis.csv");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
     };

     useKeyboardShortcuts([
          { key: "enter", ctrlOrCmd: true, action: addStage },
          { key: "e", ctrlOrCmd: true, action: exportCSV }
     ]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
               <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                              <Filter size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Conversion Funnel Drop-off Simulator</h2>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Map out multi-step journeys to visualize bottlenecks and project revenue leakage.</p>
                         </div>
                    </div>

                    <button
                         onClick={exportCSV}
                         className="hidden sm:flex items-center gap-2 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm dark:shadow-none"
                         title="Shortcut: Ctrl+E"
                    >
                         <Download size={14} className="text-blue-600 dark:text-blue-400" /> Export CSV
                    </button>
               </div>

               <AdSlot adSlot="top-funnel-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-5 flex flex-col gap-6 sticky top-24">
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl transition-colors">
                              <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800/60 pb-3">
                                   <Target size={18} className="text-blue-600 dark:text-blue-400" /> Funnel Parameters
                              </h3>

                              <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 transition-colors">
                                   <div>
                                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                                             <Users size={12} /> Initial Traffic
                                        </label>
                                        <input
                                             type="number"
                                             value={initialTraffic}
                                             onChange={(e) => setInitialTraffic(Number(e.target.value) || 0)}
                                             className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white font-mono outline-none focus:border-blue-500"
                                        />
                                   </div>
                                   <div>
                                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                                             <DollarSign size={12} /> Customer LTV ($)
                                        </label>
                                        <input
                                             type="number"
                                             value={customerValue}
                                             onChange={(e) => setCustomerValue(Number(e.target.value) || 0)}
                                             className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white font-mono outline-none focus:border-blue-500"
                                        />
                                   </div>
                              </div>

                              <div className="mb-6 bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col gap-3 transition-colors">
                                   <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-900 dark:text-gray-300 flex items-center gap-1.5">
                                             <Layers size={14} className="text-purple-600 dark:text-purple-400" /> Scenario Comparison Mode
                                        </span>
                                        <button
                                             onClick={() => setIsComparisonMode(!isComparisonMode)}
                                             className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${isComparisonMode ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-800'}`}
                                        >
                                             <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isComparisonMode ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </button>
                                   </div>

                                   {isComparisonMode && (
                                        <div className="pt-3 border-t border-gray-200 dark:border-gray-900">
                                             <div className="flex justify-between text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                                                  <span>Optimization Boost per Step</span>
                                                  <span className="text-purple-600 dark:text-purple-400">+{optimizationBoost}%</span>
                                             </div>
                                             <input
                                                  type="range"
                                                  min="1" max="15"
                                                  value={optimizationBoost}
                                                  onChange={(e) => setOptimizationBoost(Number(e.target.value))}
                                                  className="w-full accent-purple-500 cursor-pointer"
                                             />
                                        </div>
                                   )}
                              </div>

                              <div className="space-y-4 relative">
                                   <div className="absolute left-4 top-4 bottom-8 w-px bg-gray-200 dark:bg-gray-800 z-0"></div>
                                   {stages.map((stage, index) => (
                                        <div key={stage.id} className="relative z-10 flex items-start gap-4">
                                             <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400 shrink-0 mt-1 shadow-sm dark:shadow-lg">
                                                  {index + 1}
                                             </div>
                                             <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex-grow group transition-colors">
                                                  <div className="flex items-center justify-between mb-3">
                                                       <input
                                                            type="text"
                                                            value={stage.name}
                                                            onChange={(e) => updateStage(stage.id, "name", e.target.value)}
                                                            className="bg-transparent text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-b focus:border-blue-500 w-full mr-2"
                                                       />
                                                       {index !== 0 && (
                                                            <button
                                                                 onClick={() => removeStage(stage.id)}
                                                                 className="text-gray-400 hover:text-rose-500 dark:text-gray-600 dark:hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                                                            >
                                                                 <Trash2 size={14} />
                                                            </button>
                                                       )}
                                                  </div>
                                                  {index === 0 ? (
                                                       <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded">100% of Top Traffic</span>
                                                  ) : (
                                                       <div className="flex flex-col gap-2">
                                                            <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                                                                 <span>Step Conversion Rate</span>
                                                                 <span className="text-blue-600 dark:text-blue-400">{stage.conversionRate}%</span>
                                                            </div>
                                                            <input
                                                                 type="range"
                                                                 min="1" max="100"
                                                                 value={stage.conversionRate}
                                                                 onChange={(e) => updateStage(stage.id, "conversionRate", Number(e.target.value))}
                                                                 className="w-full accent-blue-500 cursor-pointer"
                                                            />
                                                       </div>
                                                  )}
                                             </div>
                                        </div>
                                   ))}
                              </div>

                              <button
                                   onClick={addStage}
                                   disabled={stages.length >= 8}
                                   className="w-full mt-6 flex items-center justify-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-900 dark:text-white font-bold py-3 rounded-xl transition-all text-sm border border-gray-200 dark:border-gray-700 shadow-sm"
                                   title="Shortcut: Ctrl+Enter"
                              >
                                   <Plus size={16} /> Add Funnel Step
                              </button>
                         </div>
                    </div>

                    <div className="lg:col-span-7 flex flex-col gap-6">
                         <div className="bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors">
                              <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800/60 pb-3">
                                   <Activity size={18} className="text-emerald-600 dark:text-emerald-400" /> Funnel Performance Dashboard
                              </h3>

                              <div className="grid grid-cols-2 gap-4 mb-8">
                                   <div className="bg-emerald-50 dark:bg-gradient-to-br dark:from-emerald-950/40 dark:to-gray-900 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-5">
                                        <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-wider block mb-1">Total Conversion</span>
                                        <div className="flex items-baseline gap-2">
                                             <span className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                                                  {funnelMetrics.totalConversionRate.toFixed(2)}%
                                             </span>
                                             {isComparisonMode && (
                                                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 font-mono">
                                                       ➔ {optimizedMetrics.totalConversionRate.toFixed(2)}%
                                                  </span>
                                             )}
                                        </div>
                                   </div>

                                   <div className="bg-blue-50 dark:bg-gradient-to-br dark:from-blue-950/40 dark:to-gray-900 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-5">
                                        <span className="text-[10px] text-blue-600 dark:text-blue-500 font-bold uppercase tracking-wider block mb-1">Projected Revenue</span>
                                        <div className="flex items-baseline gap-2">
                                             <span className="text-3xl font-bold font-mono text-blue-600 dark:text-blue-400">
                                                  ${funnelMetrics.finalRevenue.toLocaleString('en-US')}
                                             </span>
                                             {isComparisonMode && (
                                                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 font-mono">
                                                       ➔ ${optimizedMetrics.finalRevenue.toLocaleString('en-US')}
                                                  </span>
                                             )}
                                        </div>
                                   </div>
                              </div>

                              <div className="space-y-3 mb-8">
                                   <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Traffic Waterfall</h4>
                                   {funnelMetrics.calculatedStages.map((stage, i) => (
                                        <div key={stage.id} className="relative w-full h-12 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 flex items-center group">
                                             <div
                                                  className="absolute left-0 top-0 bottom-0 bg-blue-100 dark:bg-blue-600/20 border-r-2 border-blue-500 transition-all duration-500 ease-out"
                                                  style={{ width: `${Math.max(stage.percentOfOriginal, 1)}%` }}
                                             />
                                             <div className="relative z-10 flex items-center justify-between w-full px-4">
                                                  <div className="flex items-center gap-3">
                                                       <span className="text-xs font-bold text-gray-500 dark:text-gray-400 w-4">{i + 1}.</span>
                                                       <span className="text-sm font-bold text-gray-900 dark:text-white">{stage.name}</span>
                                                  </div>
                                                  <div className="flex items-center gap-3">
                                                       <span className="text-sm font-mono text-gray-800 dark:text-gray-300 bg-white dark:bg-gray-950 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none">
                                                            {stage.usersSurviving.toLocaleString('en-US')} users
                                                       </span>
                                                  </div>
                                             </div>
                                        </div>
                                   ))}
                              </div>

                              {funnelMetrics.worstDropoff.loss > 0 && (
                                   <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl p-5 flex items-start gap-4">
                                        <div className="w-10 h-10 bg-rose-100 dark:bg-rose-500/20 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                                             <TrendingDown size={20} />
                                        </div>
                                        <div>
                                             <h4 className="text-rose-600 dark:text-rose-400 font-bold mb-1 flex items-center gap-2">
                                                  Critical Revenue Leakage Detected
                                             </h4>
                                             <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                                                  Your largest drop-off occurs between <strong className="text-gray-900 dark:text-white">{funnelMetrics.worstDropoff.fromStage}</strong> and <strong className="text-gray-900 dark:text-white">{funnelMetrics.worstDropoff.name}</strong>.
                                             </p>
                                             <div className="flex flex-wrap gap-3">
                                                  <span className="text-xs font-bold bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 px-3 py-1.5 rounded-lg">
                                                       {funnelMetrics.worstDropoff.loss.toLocaleString('en-US')} Users Lost
                                                  </span>
                                                  <span className="text-xs font-bold bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 px-3 py-1.5 rounded-lg">
                                                       ${(funnelMetrics.worstDropoff.loss * customerValue).toLocaleString('en-US')} Lost Revenue
                                                  </span>
                                             </div>
                                        </div>
                                   </div>
                              )}
                         </div>
                    </div>
               </div>

               {/* ========================================= */}
               {/* SEO CONTENT & FAQS */}
               {/* ========================================= */}
               <div className="mt-12 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm dark:shadow-none">
                    <div className="prose dark:prose-invert max-w-none">
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Analyze E-Commerce & SaaS Drop-offs with the Funnel Simulator</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              A tiny drop in conversion rate at the top of your funnel translates into massive revenue losses at the bottom. ToolLok's <strong>Conversion Funnel Drop-off Simulator</strong> helps marketers, product managers, and founders visualize exactly where their traffic is leaking. By identifying the critical drop-off points, you can prioritize A/B testing and CRO efforts. Combine this simulator with our <Link href="/categories/analytics-tools" className="text-blue-600 dark:text-blue-400 hover:underline">Analytics Tools</Link> to build highly profitable user journeys.
                         </p>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Optimize Your Sales Pipeline</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Traffic Waterfall Visualization:</strong> See exactly how many users survive from step to step using an intuitive, visual cascade chart.</li>
                              <li><strong>Scenario Comparison Mode:</strong> Toggle "Optimization Boost" to simulate how a small 5% increase in conversion rates dramatically multiplies your final revenue.</li>
                              <li><strong>Automated Leakage Detection:</strong> The AI engine automatically flags your worst-performing step, calculating exactly how much cash is being left on the table.</li>
                         </ul>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">What is a good conversion rate for a funnel?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Average conversion rates vary wildly by industry. For e-commerce, a 2% to 3% final purchase rate is standard. For SaaS landing pages to free trials, 10% to 15% is common. The goal isn't to hit a specific number, but to continuously optimize your own worst-performing step.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">How do I find my biggest drop-off?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Input your Google Analytics or Mixpanel data into the stages on the left. The simulator will automatically calculate the absolute volume of users lost between each step and highlight the "Critical Revenue Leakage" point at the bottom of the dashboard.</p>
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
                                             "name": "What is a good conversion rate for a funnel?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "For e-commerce, a 2% to 3% final purchase rate is standard. For SaaS landing pages to free trials, 10% to 15% is common." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "How do I find my biggest drop-off?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Input your analytics data into the stages. The simulator automatically calculates users lost between steps and highlights the critical revenue leakage point." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-funnel-ad" format="fluid" className="mt-4" />
          </div>
     );
}