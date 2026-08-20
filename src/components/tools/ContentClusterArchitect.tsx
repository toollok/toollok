"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
     Network, Search, Download, Table as TableIcon, ListTree,
     Target, Link2, Sparkles, FileText, RefreshCw, CheckCircle2,
     BarChart, TrendingUp, AlignLeft, X
} from "lucide-react";
import AdSlot from "@/components/ui/AdSlot";

type SearchIntent = "Informational" | "Commercial" | "Transactional" | "Navigational";
type FunnelStage = "ToFu (Awareness)" | "MoFu (Consideration)" | "BoFu (Decision)";

interface ClusterPage {
     id: string;
     type: "Hub" | "Spoke";
     title: string;
     slug: string;
     intent: SearchIntent;
     funnel: FunnelStage;
     linksTo: string[];
     estVolume: string;
     kd: number;
     outline: string[];
}

export default function ContentClusterArchitect() {
     const [coreKeyword, setCoreKeyword] = useState("CRM Software");
     const [audience, setAudience] = useState("Small Business");
     const [isGenerating, setIsGenerating] = useState(false);
     const [viewMode, setViewMode] = useState<"visual" | "table">("visual");
     const [cluster, setCluster] = useState<ClusterPage[] | null>(null);
     const [isExported, setIsExported] = useState(false);

     const [selectedBrief, setSelectedBrief] = useState<ClusterPage | null>(null);

     const generateCluster = () => {
          if (!coreKeyword.trim()) return;
          setIsGenerating(true);

          setTimeout(() => {
               const kw = coreKeyword.trim();
               const aud = audience.trim() || "Beginners";
               const baseSlug = kw.toLowerCase().replace(/[^a-z0-9]+/g, "-");

               const pages: ClusterPage[] = [];

               pages.push({
                    id: "hub", type: "Hub", title: `The Ultimate Guide to ${kw}`, slug: `/${baseSlug}`,
                    intent: "Informational", funnel: "ToFu (Awareness)", linksTo: ["All Spokes"],
                    estVolume: "10K - 50K", kd: Math.floor(Math.random() * 15) + 75,
                    outline: [`H2: What is ${kw}?`, `H3: Core Concepts and Definitions`, `H2: Why is ${kw} Important for ${aud}?`, `H2: Key Benefits of Using ${kw}`, `H2: Core Features to Look For`, `H2: Frequently Asked Questions (FAQ)`]
               });

               pages.push({
                    id: "spoke-1", type: "Spoke", title: `Best ${kw} for ${aud} in ${new Date().getFullYear()}`, slug: `/${baseSlug}/best-${aud.toLowerCase().replace(/\s+/g, "-")}`,
                    intent: "Commercial", funnel: "MoFu (Consideration)", linksTo: ["hub"],
                    estVolume: "1K - 5K", kd: Math.floor(Math.random() * 20) + 50,
                    outline: [`H2: How We Evaluated the Best Options`, `H2: Top Picks for ${aud} (Overview)`, `H3: #1 Overall Best Choice`, `H3: Best Budget Option`, `H3: Best Premium/Enterprise Option`, `H2: Feature Comparison Table`, `H2: Final Verdict`]
               });

               pages.push({
                    id: "spoke-2", type: "Spoke", title: `How to Choose the Right ${kw}`, slug: `/${baseSlug}/how-to-choose`,
                    intent: "Informational", funnel: "ToFu (Awareness)", linksTo: ["hub", "spoke-1"],
                    estVolume: "2K - 8K", kd: Math.floor(Math.random() * 20) + 30,
                    outline: [`H2: Introduction to Selection Criteria`, `H2: Assessing Your Specific Needs`, `H2: Step 1: Budget and ROI Calculation`, `H2: Step 2: Implementation and Onboarding`, `H2: Step 3: Scalability for the Future`, `H2: Common Pitfalls to Avoid`]
               });

               pages.push({
                    id: "spoke-3", type: "Spoke", title: `Top ${kw} Alternatives & Competitors`, slug: `/${baseSlug}/alternatives`,
                    intent: "Commercial", funnel: "MoFu (Consideration)", linksTo: ["hub"],
                    estVolume: "500 - 2K", kd: Math.floor(Math.random() * 15) + 40,
                    outline: [`H2: Why Look for Alternatives?`, `H2: Direct Competitor Analysis`, `H3: Alternative 1 (Pros & Cons)`, `H3: Alternative 2 (Pros & Cons)`, `H2: Open Source vs Commercial Options`, `H2: Which One Should You Switch To?`]
               });

               pages.push({
                    id: "spoke-4", type: "Spoke", title: `How Much Does ${kw} Cost? (Pricing Guide)`, slug: `/${baseSlug}/pricing-guide`,
                    intent: "Transactional", funnel: "BoFu (Decision)", linksTo: ["hub", "spoke-1"],
                    estVolume: "300 - 1.5K", kd: Math.floor(Math.random() * 20) + 60,
                    outline: [`H2: Demystifying the Pricing Models`, `H2: Tier 1: Free and Entry-Level Plans`, `H2: Tier 2: Professional and Business Plans`, `H2: Tier 3: Enterprise Solutions`, `H2: Hidden Costs (Setup, Maintenance, Training)`, `H2: Is the Investment Worth It?`]
               });

               pages.push({
                    id: "spoke-5", type: "Spoke", title: `5 Common Mistakes When Using ${kw}`, slug: `/${baseSlug}/common-mistakes`,
                    intent: "Informational", funnel: "ToFu (Awareness)", linksTo: ["hub"],
                    estVolume: "1K - 3K", kd: Math.floor(Math.random() * 15) + 20,
                    outline: [`H2: The Impact of Poor Implementation`, `H2: Mistake #1: Ignoring Best Practices`, `H2: Mistake #2: Skipping Proper Training`, `H2: Mistake #3: Overcomplicating the Setup`, `H2: Mistake #4: Not Tracking Metrics`, `H2: Mistake #5: Choosing the Wrong Tool`, `H2: How to Course Correct`]
               });

               setCluster(pages);
               setIsGenerating(false);
               setViewMode("visual");
          }, 800);
     };

     const exportToCSV = () => {
          if (!cluster) return;
          const headers = ["Post Type", "Title", "URL Slug", "Search Intent", "Funnel Stage", "Est. Volume", "KD", "Internal Links To"];
          const rows = cluster.map(p => [p.type, `"${p.title}"`, p.slug, p.intent, p.funnel, p.estVolume, p.kd, `"${p.linksTo.join(", ")}"`]);
          const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `${coreKeyword.replace(/\s+/g, "-")}-seo-cluster.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setIsExported(true);
          setTimeout(() => setIsExported(false), 2000);
     };

     const getIntentColor = (intent: SearchIntent) => {
          switch (intent) {
               case "Informational": return "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30";
               case "Commercial": return "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30";
               case "Transactional": return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30";
               default: return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700";
          }
     };

     const getKdColor = (kd: number) => {
          if (kd >= 70) return "text-rose-600 dark:text-rose-400";
          if (kd >= 40) return "text-amber-600 dark:text-amber-400";
          return "text-emerald-600 dark:text-emerald-400";
     };

     return (
          <div className="w-full flex flex-col gap-6 relative">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                              <Network size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Programmatic SEO Content Architect</h2>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Generate hub-and-spoke content maps with simulated volume metrics, KD scoring, and automated content briefs.</p>
                         </div>
                    </div>
               </div>

               <AdSlot adSlot="top-cluster-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-4 flex flex-col gap-6">
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col gap-5 transition-colors">
                              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-300 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800/80 pb-3">
                                   <Target size={16} className="text-purple-600 dark:text-purple-400" /> Cluster Strategy Setup
                              </h3>
                              <div className="space-y-4">
                                   <div>
                                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1.5"><Search size={12} /> Seed / Core Keyword</label>
                                        <input
                                             type="text" value={coreKeyword} onChange={(e) => setCoreKeyword(e.target.value)} placeholder="e.g. CRM Software, Keto Diet..."
                                             className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white font-bold outline-none focus:border-purple-500/50"
                                        />
                                   </div>
                                   <div>
                                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1.5"><Target size={12} /> Target Audience (Optional)</label>
                                        <input
                                             type="text" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. Small Business, Beginners..."
                                             className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-gray-700 dark:text-gray-200 outline-none focus:border-purple-500/50"
                                        />
                                   </div>
                              </div>
                              <button onClick={generateCluster} disabled={!coreKeyword.trim() || isGenerating} className="w-full py-3.5 mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-md dark:shadow-lg dark:shadow-purple-500/25 flex items-center justify-center gap-2 disabled:opacity-50">
                                   {isGenerating ? <span className="flex items-center gap-2 animate-pulse"><RefreshCw size={18} className="animate-spin" /> Architecting Map...</span> : <><Sparkles size={18} /> Generate Architecture Map</>}
                              </button>
                         </div>
                    </div>

                    <div className="lg:col-span-8 flex flex-col gap-6 relative">
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col gap-4 min-h-[500px] transition-colors">
                              <div className="flex flex-wrap items-center justify-between border-b border-gray-100 dark:border-gray-800/80 pb-3 gap-4">
                                   <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-950 p-1 rounded-xl border border-gray-200 dark:border-gray-800 text-[10px] font-bold">
                                        <button onClick={() => setViewMode("visual")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${viewMode === "visual" ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}>
                                             <ListTree size={14} /> Visual Map
                                        </button>
                                        <button onClick={() => setViewMode("table")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${viewMode === "table" ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}>
                                             <TableIcon size={14} /> Data Table
                                        </button>
                                   </div>
                                   <button onClick={exportToCSV} disabled={!cluster} className="flex items-center gap-1.5 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md dark:shadow-lg dark:shadow-emerald-600/20">
                                        {isExported ? <CheckCircle2 size={14} /> : <Download size={14} />} {isExported ? "CSV Downloaded!" : "Export CSV"}
                                   </button>
                              </div>

                              <div className="flex-grow flex flex-col bg-gray-50 dark:bg-[#0d1117] rounded-xl border border-gray-200 dark:border-gray-800/80 p-6 overflow-hidden min-h-[400px]">
                                   {!cluster ? (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600 gap-3">
                                             <Network size={48} className="opacity-20" />
                                             <p className="text-xs max-w-sm text-center">Enter a core topic on the left to programmatically generate an SEO content cluster equipped with metrics and outlines.</p>
                                        </div>
                                   ) : (
                                        <>
                                             {viewMode === "visual" && (
                                                  <div className="flex flex-col gap-6 relative w-full h-full overflow-y-auto pb-4">
                                                       {cluster.filter(p => p.type === "Hub").map(hub => (
                                                            <div key={hub.id} className="relative z-10 w-full md:w-3/4 mx-auto bg-white dark:bg-gray-900 border-2 border-purple-300 dark:border-purple-500/50 rounded-2xl p-5 shadow-lg dark:shadow-[0_0_30px_rgba(168,85,247,0.15)] flex flex-col gap-3">
                                                                 <div className="flex items-center justify-between">
                                                                      <span className="text-[10px] font-black uppercase tracking-widest bg-purple-100 dark:bg-purple-500 text-purple-700 dark:text-white px-2 py-0.5 rounded">Pillar Hub</span>
                                                                      <div className="flex gap-2">
                                                                           <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getIntentColor(hub.intent)}`}>{hub.intent}</span>
                                                                           <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">{hub.funnel}</span>
                                                                      </div>
                                                                 </div>
                                                                 <h3 className="text-lg font-bold text-gray-900 dark:text-white">{hub.title}</h3>
                                                                 <span className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate border-b border-gray-100 dark:border-gray-800 pb-3">{hub.slug}</span>
                                                                 <div className="flex items-center justify-between pt-1">
                                                                      <div className="flex items-center gap-4 text-[10px] font-bold font-mono">
                                                                           <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400" title="Estimated Search Volume"><TrendingUp size={12} /> {hub.estVolume}</span>
                                                                           <span className={`flex items-center gap-1 ${getKdColor(hub.kd)}`} title="Keyword Difficulty"><BarChart size={12} /> KD: {hub.kd}</span>
                                                                      </div>
                                                                      <button onClick={() => setSelectedBrief(hub)} className="flex items-center gap-1.5 text-[10px] font-bold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/30 px-2.5 py-1 rounded-md transition-colors">
                                                                           <AlignLeft size={12} /> Brief
                                                                      </button>
                                                                 </div>
                                                            </div>
                                                       ))}
                                                       <div className="hidden md:block absolute left-1/2 top-[130px] bottom-[50px] w-0.5 bg-gray-200 dark:bg-gray-800 -translate-x-1/2 z-0"></div>
                                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 pt-4">
                                                            {cluster.filter(p => p.type === "Spoke").map((spoke, idx) => (
                                                                 <div key={spoke.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col gap-2.5 relative hover:border-gray-300 dark:hover:border-gray-600 transition-colors shadow-sm dark:shadow-none">
                                                                      <div className={`hidden md:block absolute top-1/2 w-4 h-0.5 bg-gray-200 dark:bg-gray-800 ${idx % 2 === 0 ? '-right-4' : '-left-4'}`}></div>
                                                                      <div className="flex items-center justify-between">
                                                                           <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500"><FileText size={10} className="inline mr-1" /> Spoke</span>
                                                                           <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getIntentColor(spoke.intent)}`}>{spoke.intent}</span>
                                                                      </div>
                                                                      <h4 className="text-sm font-bold text-gray-900 dark:text-gray-200 line-clamp-2 leading-snug">{spoke.title}</h4>
                                                                      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/80 pb-2">
                                                                           <div className="flex items-center gap-3 text-[10px] font-bold font-mono">
                                                                                <span className="text-cyan-600 dark:text-cyan-400" title="Estimated Search Volume">{spoke.estVolume}</span>
                                                                                <span className={getKdColor(spoke.kd)} title="Keyword Difficulty">KD: {spoke.kd}</span>
                                                                           </div>
                                                                           <button onClick={() => setSelectedBrief(spoke)} className="flex items-center gap-1.5 text-[9px] font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded transition-colors">
                                                                                <AlignLeft size={10} /> Brief
                                                                           </button>
                                                                      </div>
                                                                      <div className="mt-auto">
                                                                           <span className="text-[9px] text-gray-500 flex items-center gap-1"><Link2 size={10} /> Links back to: <span className="text-purple-600 dark:text-purple-400 font-bold">Hub</span></span>
                                                                      </div>
                                                                 </div>
                                                            ))}
                                                       </div>
                                                  </div>
                                             )}

                                             {viewMode === "table" && (
                                                  <div className="w-full h-full overflow-x-auto">
                                                       <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300 min-w-[700px]">
                                                            <thead className="text-[10px] uppercase tracking-wider text-gray-500 bg-gray-100 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                                                                 <tr>
                                                                      <th className="p-3 font-bold w-12">Type</th><th className="p-3 font-bold">Details</th><th className="p-3 font-bold">Funnel & Intent</th><th className="p-3 font-bold">Metrics</th><th className="p-3 font-bold text-center">Action</th>
                                                                 </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800/50">
                                                                 {cluster.map((page) => (
                                                                      <tr key={page.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                                                           <td className="p-3">
                                                                                {page.type === "Hub" ? <span className="bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 px-1.5 py-0.5 text-[9px] rounded font-bold">HUB</span> : <span className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-400 px-1.5 py-0.5 text-[9px] rounded font-bold">SPOKE</span>}
                                                                           </td>
                                                                           <td className="p-3 max-w-[200px]">
                                                                                <p className="font-bold text-gray-900 dark:text-gray-200 truncate" title={page.title}>{page.title}</p>
                                                                                <p className="text-[9px] text-gray-500 font-mono truncate mt-0.5" title={page.slug}>{page.slug}</p>
                                                                           </td>
                                                                           <td className="p-3">
                                                                                <div className="flex flex-col gap-1">
                                                                                     <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border inline-block w-max ${getIntentColor(page.intent)}`}>{page.intent}</span>
                                                                                     <span className="text-[9px] text-gray-500">{page.funnel}</span>
                                                                                </div>
                                                                           </td>
                                                                           <td className="p-3 font-mono text-[10px]">
                                                                                <div className="flex flex-col gap-0.5">
                                                                                     <span className="text-cyan-600 dark:text-cyan-400">Vol: {page.estVolume}</span>
                                                                                     <span className={getKdColor(page.kd)}>KD: {page.kd}</span>
                                                                                </div>
                                                                           </td>
                                                                           <td className="p-3 text-center">
                                                                                <button onClick={() => setSelectedBrief(page)} className="bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 px-2 py-1 rounded text-[10px] font-bold transition-colors">View Brief</button>
                                                                           </td>
                                                                      </tr>
                                                                 ))}
                                                            </tbody>
                                                       </table>
                                                  </div>
                                             )}
                                        </>
                                   )}
                              </div>

                              {selectedBrief && (
                                   <div className="absolute inset-0 z-50 p-6 flex flex-col bg-gray-900/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-8">
                                        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl w-full h-full flex flex-col shadow-2xl relative">
                                             <div className="flex items-start justify-between p-5 border-b border-gray-200 dark:border-gray-800">
                                                  <div className="flex flex-col gap-1">
                                                       <div className="flex items-center gap-2 mb-1">
                                                            <span className="bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 text-[9px] uppercase font-bold px-2 py-0.5 rounded">AI Content Brief</span>
                                                            <span className="text-gray-500 text-[10px] font-mono">{selectedBrief.slug}</span>
                                                       </div>
                                                       <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{selectedBrief.title}</h3>
                                                  </div>
                                                  <button onClick={() => setSelectedBrief(null)} className="p-1.5 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg transition-colors border border-gray-200 dark:border-gray-800">
                                                       <X size={16} />
                                                  </button>
                                             </div>
                                             <div className="p-6 flex-grow overflow-y-auto">
                                                  <div className="flex flex-wrap gap-4 mb-6 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800/80 text-xs">
                                                       <div className="flex flex-col gap-0.5"><span className="text-[9px] text-gray-500 font-bold uppercase">Search Intent</span><span className="font-medium text-gray-900 dark:text-gray-200">{selectedBrief.intent}</span></div>
                                                       <div className="w-px bg-gray-300 dark:bg-gray-800"></div>
                                                       <div className="flex flex-col gap-0.5"><span className="text-[9px] text-gray-500 font-bold uppercase">Funnel Stage</span><span className="font-medium text-gray-900 dark:text-gray-200">{selectedBrief.funnel}</span></div>
                                                       <div className="w-px bg-gray-300 dark:bg-gray-800"></div>
                                                       <div className="flex flex-col gap-0.5"><span className="text-[9px] text-gray-500 font-bold uppercase">Traffic Potential</span><span className="font-medium text-cyan-600 dark:text-cyan-400">{selectedBrief.estVolume}</span></div>
                                                       <div className="w-px bg-gray-300 dark:bg-gray-800"></div>
                                                       <div className="flex flex-col gap-0.5"><span className="text-[9px] text-gray-500 font-bold uppercase">Difficulty (KD)</span><span className={`font-medium ${getKdColor(selectedBrief.kd)}`}>{selectedBrief.kd} / 100</span></div>
                                                  </div>
                                                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-300 mb-3 flex items-center gap-2"><AlignLeft size={16} className="text-purple-600 dark:text-purple-400" /> Recommended H2/H3 Structure</h4>
                                                  <div className="bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl p-5 font-mono text-sm leading-relaxed space-y-2 shadow-inner">
                                                       {selectedBrief.outline.map((heading, i) => (
                                                            <div key={i} className={`flex items-start gap-3 ${heading.startsWith('H3') ? 'ml-6 text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-200 font-bold mt-3'}`}>
                                                                 <span className={`${heading.startsWith('H3') ? 'text-gray-400 dark:text-gray-600' : 'text-purple-600 dark:text-purple-500'}`}>{heading.substring(0, 2)}</span>
                                                                 <span>{heading.substring(4)}</span>
                                                            </div>
                                                       ))}
                                                  </div>
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
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Master Programmatic SEO with Content Clusters</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              Modern SEO is no longer about isolated keywords; it's about semantic topical authority. The <strong>Content Cluster Architect</strong> takes your core keyword and instantly generates a highly optimized Hub-and-Spoke model. By structuring content this way, you naturally distribute PageRank and demonstrate deep expertise to Google. To further enhance your search visibility, generate exact schemas for these pages using our <Link href="/categories/seo-tools" className="text-purple-600 dark:text-purple-400 hover:underline">SEO Tools</Link>.
                         </p>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Why Use a Hub and Spoke Model?</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Topical Authority:</strong> Covering a subject comprehensively across a Pillar (Hub) page and specific, long-tail Spoke pages proves to search engines that your site is an authority in that niche.</li>
                              <li><strong>Optimized Internal Linking:</strong> The map ensures all Spoke pages link back to the core Hub, creating a tight semantic web that passes link equity directly to your most important commercial pages.</li>
                              <li><strong>Targeting the Full Funnel:</strong> Our AI generates intent-driven outlines covering Awareness (Informational), Consideration (Commercial), and Decision (Transactional) phases.</li>
                         </ul>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">What is a Content Cluster?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">A content cluster is an SEO strategy where a broad, overarching "Pillar" page links to several detailed "Spoke" pages covering subtopics. This helps search engines understand the semantic relationship between your pages and rank them higher.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">How should I implement the AI Content Briefs?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Click on any generated page in the map to view its AI Content Brief. Use the suggested H2 and H3 tags as the skeleton for your article, ensuring you answer the core search intent and match the specified Funnel Stage.</p>
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
                                             "name": "What is a Content Cluster?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "A content cluster is an SEO strategy where a broad Pillar page links to several detailed Spoke pages covering subtopics, helping search engines understand semantic relationships." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "How should I implement the AI Content Briefs?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Click any generated page to view its AI Content Brief. Use the suggested H2 and H3 tags as the skeleton for your article to match the specified Funnel Stage and intent." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-cluster-ad" format="fluid" className="mt-4" />
          </div>
     );
}