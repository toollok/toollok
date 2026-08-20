"use client";

import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import { BookOpen, Plus, Trash2, Download, Activity, Eye, EyeOff } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import AdSlot from "@/components/ui/AdSlot";

interface Trade {
     id: string; symbol: string; type: "Long" | "Short"; entryPrice: number; exitPrice: number;
     quantity: number; pnl: number; setup: string; date: string;
}

export default function TradeJournalAnalyzer() {
     const [trades, setTrades] = useLocalStorage<Trade[]>("toollok_trade_journal", [
          { id: "1", symbol: "NIFTY 24000 CE", type: "Long", entryPrice: 150, exitPrice: 220, quantity: 50, pnl: 3500, setup: "Breakout", date: "2026-06-01" },
          { id: "2", symbol: "BANKNIFTY 51000 PE", type: "Short", entryPrice: 300, exitPrice: 180, quantity: 30, pnl: 3600, setup: "Reversal", date: "2026-06-02" },
     ]);

     const [showGraph, setShowGraph] = useState<boolean>(false);
     const [symbol, setSymbol] = useState<string>("");
     const [type, setType] = useState<"Long" | "Short">("Long");
     const [entryPrice, setEntryPrice] = useState<string>("");
     const [exitPrice, setExitPrice] = useState<string>("");
     const [quantity, setQuantity] = useState<string>("");
     const [setup, setSetup] = useState<string>("Trend Following");

     const chartRef = useRef<HTMLDivElement>(null);
     const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);
     const [tooltipLeftPercent, setTooltipLeftPercent] = useState<number>(0);
     const { copy } = useCopyToClipboard(2000);

     const addTrade = () => {
          if (!symbol || !entryPrice || !exitPrice || !quantity) return;
          const entry = parseFloat(entryPrice); const exit = parseFloat(exitPrice); const qty = parseFloat(quantity);
          const multiplier = type === "Long" ? 1 : -1;
          const pnl = (exit - entry) * qty * multiplier;
          const newTrade: Trade = { id: Math.random().toString(), symbol: symbol.toUpperCase(), type, entryPrice: entry, exitPrice: exit, quantity: qty, pnl, setup, date: new Date().toISOString().split('T')[0] };
          setTrades([newTrade, ...trades]);
          setSymbol(""); setEntryPrice(""); setExitPrice(""); setQuantity("");
     };

     const removeTrade = (id: string) => setTrades(trades.filter(t => t.id !== id));

     const { analytics, equityCurveData } = useMemo(() => {
          const totalTrades = trades.length;
          const sorted = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          let runningEquity = 0; const points = [{ index: 0, date: "Start", equity: 0, pnl: 0, symbol: "Initial Capital" }];
          sorted.forEach((t, idx) => { runningEquity += t.pnl; points.push({ index: idx + 1, date: t.date, equity: runningEquity, pnl: t.pnl, symbol: t.symbol }); });

          if (totalTrades === 0) return { analytics: { netPnL: 0, winRate: 0, profitFactor: 0, maxDrawdown: 0, winningTrades: 0, losingTrades: 0 }, equityCurveData: points };

          let netPnL = 0; let grossProfit = 0; let grossLoss = 0; let winningTrades = 0; let peak = 0; let maxDrawdown = 0; let eqTracker = 0;
          trades.forEach(t => {
               netPnL += t.pnl; eqTracker += t.pnl;
               if (eqTracker > peak) peak = eqTracker;
               const drawdown = peak - eqTracker; if (drawdown > maxDrawdown) maxDrawdown = drawdown;
               if (t.pnl > 0) { grossProfit += t.pnl; winningTrades++; } else { grossLoss += Math.abs(t.pnl); }
          });
          const winRate = (winningTrades / totalTrades) * 100;
          const profitFactor = grossLoss === 0 ? grossProfit : (grossProfit / grossLoss);
          return { analytics: { netPnL, winRate, profitFactor, maxDrawdown, winningTrades, losingTrades: totalTrades - winningTrades }, equityCurveData: points };
     }, [trades]);

     const chartWidth = 800; const chartHeight = 220;
     const minEquity = Math.min(0, ...equityCurveData.map(p => p.equity));
     const maxEquity = Math.max(100, ...equityCurveData.map(p => p.equity));
     const equityRange = maxEquity - minEquity === 0 ? 1 : maxEquity - minEquity;
     const getX = (i: number) => (i / Math.max(1, equityCurveData.length - 1)) * chartWidth;
     const getY = (eq: number) => chartHeight - ((eq - minEquity) / equityRange) * chartHeight;
     const zeroLineY = getY(0);
     const pathD = equityCurveData.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)},${getY(pt.equity)}`).join(" ");

     const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
          if (!chartRef.current || equityCurveData.length === 0) return;
          const rect = chartRef.current.getBoundingClientRect();
          const xPos = e.clientX - rect.left;
          const percentage = Math.max(0, Math.min(1, xPos / rect.width));
          const index = Math.round(percentage * (equityCurveData.length - 1));
          setHoveredPoint(equityCurveData[index]); setTooltipLeftPercent(percentage * 100);
     };

     const handleMouseLeave = () => setHoveredPoint(null);

     const exportCSV = () => {
          let csv = "ID,Symbol,Type,Entry,Exit,Quantity,PnL,Setup,Date\n";
          trades.forEach(t => { csv += `${t.id},${t.symbol},${t.type},${t.entryPrice},${t.exitPrice},${t.quantity},${t.pnl},${t.setup},${t.date}\n`; });
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" }); const url = URL.createObjectURL(blob);
          const link = document.createElement("a"); link.setAttribute("href", url); link.setAttribute("download", "toollok_trade_journal.csv");
          document.body.appendChild(link); link.click(); document.body.removeChild(link);
     };

     useKeyboardShortcuts([{ key: "enter", ctrlOrCmd: true, action: addTrade }, { key: "e", ctrlOrCmd: true, action: exportCSV }]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
               <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                              <BookOpen size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Institutional Trade Journal & Analyzer</h2>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Log derivatives and stock trades with real-time expectancy, win-rate, and drawdown metrics.</p>
                         </div>
                    </div>

                    <div className="flex items-center gap-2">
                         <button onClick={() => setShowGraph(!showGraph)} className="flex items-center gap-2 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm dark:shadow-none">
                              {showGraph ? <EyeOff size={14} className="text-amber-600 dark:text-amber-400" /> : <Eye size={14} className="text-emerald-600 dark:text-emerald-400" />}
                              {showGraph ? "Hide Graph" : "Show Graph"}
                         </button>
                         <button onClick={exportCSV} className="hidden sm:flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md dark:shadow-lg dark:shadow-emerald-600/20" title="Shortcut: Ctrl+E">
                              <Download size={14} /> Export CSV
                         </button>
                    </div>
               </div>

               <AdSlot adSlot="top-journal-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm dark:shadow-lg transition-colors">
                         <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Net P&L</span>
                         <span className={`text-2xl font-bold font-mono ${analytics.netPnL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                              {analytics.netPnL >= 0 ? '+' : ''}₹{analytics.netPnL.toLocaleString('en-IN')}
                         </span>
                    </div>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm dark:shadow-lg transition-colors">
                         <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Win Rate</span>
                         <span className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">{analytics.winRate.toFixed(1)}%</span>
                    </div>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm dark:shadow-lg transition-colors">
                         <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Profit Factor</span>
                         <span className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">{analytics.profitFactor.toFixed(2)}</span>
                    </div>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm dark:shadow-lg transition-colors">
                         <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Max Drawdown</span>
                         <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">-₹{analytics.maxDrawdown.toLocaleString('en-IN')}</span>
                    </div>
               </div>

               {showGraph && (
                    <div className="bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-xl animate-in fade-in slide-in-from-top-2 transition-colors">
                         <div className="flex items-center justify-between mb-6">
                              <h3 className="text-gray-900 dark:text-white font-bold text-base flex items-center gap-2">
                                   <Activity size={18} className="text-emerald-600 dark:text-emerald-400" /> Cumulative Equity Growth Curve
                              </h3>
                              <span className="text-xs font-mono text-gray-500 dark:text-gray-400">Hover graph to inspect values</span>
                         </div>
                         <div ref={chartRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="relative w-full aspect-[3/1] bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden cursor-crosshair select-none transition-colors">
                              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                   <line x1="0" y1="25%" x2="100%" y2="25%" className="stroke-gray-200 dark:stroke-white/5" strokeWidth="1" />
                                   <line x1="0" y1="50%" x2="100%" y2="50%" className="stroke-gray-200 dark:stroke-white/5" strokeWidth="1" />
                                   <line x1="0" y1="75%" x2="100%" y2="75%" className="stroke-gray-200 dark:stroke-white/5" strokeWidth="1" />
                                   <line x1="0" y1={zeroLineY} x2={chartWidth} y2={zeroLineY} className="stroke-gray-400 dark:stroke-white/20" strokeWidth="2" strokeDasharray="4 4" />
                                   <path d={pathD} fill="none" stroke="#10b981" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                                   {hoveredPoint && (
                                        <>
                                             <line x1={getX(hoveredPoint.index)} y1="0" x2={getX(hoveredPoint.index)} y2={chartHeight} className="stroke-gray-500 dark:stroke-white/50" strokeWidth="1.5" strokeDasharray="3 3" />
                                             <circle cx={getX(hoveredPoint.index)} cy={getY(hoveredPoint.equity)} r="6" fill={hoveredPoint.equity >= 0 ? "#10b981" : "#f43f5e"} stroke="#ffffff" strokeWidth="2" />
                                        </>
                                   )}
                              </svg>
                              {hoveredPoint && (
                                   <div className="absolute top-4 bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700 backdrop-blur-md rounded-xl px-3 py-2 text-xs shadow-lg dark:shadow-2xl pointer-events-none z-20 flex flex-col gap-1 transform -translate-x-1/2 transition-colors" style={{ left: `${tooltipLeftPercent}%` }}>
                                        <div className="flex items-center justify-between gap-4 text-[10px] text-gray-500 dark:text-gray-400 font-mono border-b border-gray-200 dark:border-gray-800 pb-1">
                                             <span>Date:</span><span className="text-gray-900 dark:text-white font-bold">{hoveredPoint.date}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-4 text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                                             <span>Symbol:</span><span className="text-emerald-600 dark:text-emerald-400 font-bold">{hoveredPoint.symbol}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-4 text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                                             <span>Trade P&L:</span>
                                             <span className={`font-bold ${hoveredPoint.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                  {hoveredPoint.pnl >= 0 ? '+' : ''}₹{hoveredPoint.pnl.toLocaleString('en-IN')}
                                             </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-4 text-[10px] text-gray-500 dark:text-gray-400 font-mono pt-1 border-t border-gray-200 dark:border-gray-800">
                                             <span>Net Equity:</span><span className="text-gray-900 dark:text-white font-bold">₹{hoveredPoint.equity.toLocaleString('en-IN')}</span>
                                        </div>
                                   </div>
                              )}
                         </div>
                    </div>
               )}

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col gap-4 transition-colors">
                         <h3 className="text-gray-900 dark:text-white font-bold text-base border-b border-gray-100 dark:border-gray-800/60 pb-3 flex items-center gap-2">
                              <Plus size={16} className="text-emerald-600 dark:text-emerald-400" /> Log New Trade
                         </h3>
                         <div>
                              <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Instrument Symbol</label>
                              <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="e.g., NIFTY 24500 CE" className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white font-mono outline-none focus:border-emerald-500 transition-colors" />
                         </div>
                         <div className="grid grid-cols-2 gap-3">
                              <div>
                                   <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Position Type</label>
                                   <select value={type} onChange={(e) => setType(e.target.value as "Long" | "Short")} className={`w-full bg-white dark:bg-gray-950 border rounded-xl px-3 py-2 text-xs font-bold outline-none transition-colors ${type === 'Long' ? 'border-emerald-200 dark:border-emerald-500/50 text-emerald-600 dark:text-emerald-400' : 'border-rose-200 dark:border-rose-500/50 text-rose-600 dark:text-rose-400'}`}>
                                        <option value="Long">Long (Buy)</option><option value="Short">Short (Sell)</option>
                                   </select>
                              </div>
                              <div>
                                   <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Quantity / Lots</label>
                                   <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="50" className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white font-mono outline-none focus:border-emerald-500 transition-colors" />
                              </div>
                         </div>
                         <div className="grid grid-cols-2 gap-3">
                              <div>
                                   <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Entry Price (₹)</label>
                                   <input type="number" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} placeholder="150" className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white font-mono outline-none focus:border-emerald-500 transition-colors" />
                              </div>
                              <div>
                                   <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Exit Price (₹)</label>
                                   <input type="number" value={exitPrice} onChange={(e) => setExitPrice(e.target.value)} placeholder="200" className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white font-mono outline-none focus:border-emerald-500 transition-colors" />
                              </div>
                         </div>
                         <div>
                              <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Setup / Strategy</label>
                              <select value={setup} onChange={(e) => setSetup(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white outline-none transition-colors">
                                   <option value="Breakout">Breakout</option><option value="Trend Following">Trend Following</option><option value="Reversal">Reversal</option><option value="Scalp">Scalp</option>
                              </select>
                         </div>
                         <button onClick={addTrade} className="w-full mt-2 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all text-xs shadow-md dark:shadow-lg dark:shadow-emerald-600/25" title="Shortcut: Ctrl+Enter">
                              <Plus size={16} /> Save Trade Record
                         </button>
                    </div>

                    <div className="lg:col-span-8 bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl overflow-hidden transition-colors">
                         <h3 className="text-gray-900 dark:text-white font-bold text-base mb-4 border-b border-gray-100 dark:border-gray-800/60 pb-3 flex items-center justify-between">
                              <span>Executed Trades History</span>
                              <span className="text-xs font-mono text-gray-500 font-normal">{trades.length} total records</span>
                         </h3>
                         {trades.length === 0 ? (
                              <div className="flex flex-col items-center justify-center h-64 text-center opacity-50">
                                   <BookOpen size={36} className="text-gray-400 dark:text-gray-600 mb-3" />
                                   <p className="text-xs text-gray-500 dark:text-gray-400">No trades logged yet. Use the form on the left to add your first trade.</p>
                              </div>
                         ) : (
                              <div className="overflow-x-auto">
                                   <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
                                        <thead className="bg-gray-50 dark:bg-gray-950 text-gray-500 font-mono uppercase text-[10px] border-b border-gray-200 dark:border-gray-800 transition-colors">
                                             <tr>
                                                  <th className="px-4 py-3">Date</th><th className="px-4 py-3">Instrument</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Setup</th><th className="px-4 py-3 text-right">Qty</th><th className="px-4 py-3 text-right">Net P&L</th><th className="px-4 py-3 text-center">Action</th>
                                             </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-mono">
                                             {trades.map((t) => (
                                                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                                       <td className="px-4 py-3 text-gray-500 text-[11px]">{t.date}</td>
                                                       <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">{t.symbol}</td>
                                                       <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold border border-transparent ${t.type === 'Long' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100'}`}>{t.type}</span></td>
                                                       <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-sans text-xs">{t.setup}</td>
                                                       <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{t.quantity}</td>
                                                       <td className={`px-4 py-3 text-right font-bold ${t.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{t.pnl >= 0 ? '+' : ''}₹{t.pnl.toLocaleString('en-IN')}</td>
                                                       <td className="px-4 py-3 text-center"><button onClick={() => removeTrade(t.id)} className="text-gray-400 dark:text-gray-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-1"><Trash2 size={14} /></button></td>
                                                  </tr>
                                             ))}
                                        </tbody>
                                   </table>
                              </div>
                         )}
                    </div>
               </div>

               {/* ========================================= */}
               {/* SEO CONTENT & FAQS */}
               {/* ========================================= */}
               <div className="mt-12 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm dark:shadow-none">
                    <div className="prose dark:prose-invert max-w-none">
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Institutional Trade Journal & Performance Analyzer</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              Trading without tracking your data is gambling. ToolLok's <strong>Trade Journal Analyzer</strong> is built for systematic stock and derivatives traders to log their execution data securely in their browser. By automatically calculating your Win Rate, Profit Factor, and Maximum Drawdown, you can objectively evaluate your edge in the market. Use this alongside our <Link href="/categories/finance-tools" className="text-emerald-600 dark:text-emerald-400 hover:underline">Finance Tools</Link> to refine your risk management strategy.
                         </p>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Key Analytics Features</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Real-Time Equity Curve:</strong> Visually map the compounding growth of your account over time. The interactive graph makes it easy to spot stagnant periods or aggressive drawdowns.</li>
                              <li><strong>Profit Factor Calculation:</strong> Instantly see your ratio of gross profits to gross losses. A Profit Factor above 1.5 indicates a highly robust trading system.</li>
                              <li><strong>Local Privacy Guarantee:</strong> Your proprietary trading data and P&L history are stored in your browser's local cache. It is never uploaded to an external database.</li>
                         </ul>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">What is Maximum Drawdown in trading?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Maximum Drawdown measures the largest historical drop in your account's equity curve from a peak to a trough. It is the most critical metric for understanding the true risk and volatility of your trading strategy.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Can I export my journal data?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Yes! At any time, you can click the "Export CSV" button to download a spreadsheet containing your entire trade history, including execution prices, setups, and P&L for backup or advanced Excel analysis.</p>
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
                                             "name": "What is Maximum Drawdown in trading?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Maximum Drawdown measures the largest historical drop in your account's equity curve from a peak to a trough, indicating strategy risk." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "Can I export my journal data?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Yes! You can click the Export CSV button to download a spreadsheet of your entire trade history for backup or advanced analysis." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-journal-ad" format="fluid" className="mt-4" />
          </div>
     );
}