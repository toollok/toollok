"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
     Network, Globe, RefreshCw, Sparkles, AlertTriangle, CheckCircle2,
     Download, Layers, FileText, Zap, ShieldAlert, Target, Link2
} from "lucide-react";
import AdSlot from "@/components/ui/AdSlot";

interface PageNode {
     id: string; url: string; title: string; inboundCount: number; outboundCount: number;
     pageRank: number; isOrphan: boolean; x: number; y: number; color: string;
}

interface LinkEdge {
     source: string; target: string; anchorText: string;
}

export default function InternalLinkVisualizer() {
     const [domainInput, setDomainInput] = useState("https://example.com");
     const [depth, setDepth] = useState(2);
     const [isCrawling, setIsCrawling] = useState(false);
     const [nodes, setNodes] = useState<PageNode[]>([]);
     const [edges, setEdges] = useState<LinkEdge[]>([]);
     const [selectedNode, setSelectedNode] = useState<PageNode | null>(null);
     const [filterMode, setFilterMode] = useState<"all" | "orphans" | "pillars">("all");
     const [insights, setInsights] = useState<{ title: string, desc: string, type: "warning" | "success" | "opportunity" }[]>([]);
     const [isExported, setIsExported] = useState(false);

     const canvasRef = useRef<HTMLCanvasElement | null>(null);
     const animationRef = useRef<number | undefined>(undefined);

     const filteredNodes = useMemo(() => {
          if (filterMode === "orphans") return nodes.filter(n => n.isOrphan);
          if (filterMode === "pillars") return nodes.filter(n => n.pageRank >= 7);
          return nodes;
     }, [nodes, filterMode]);

     const runCrawlSimulation = () => {
          if (!domainInput.trim()) return;
          setIsCrawling(true);
          setSelectedNode(null);
          if (animationRef.current) cancelAnimationFrame(animationRef.current);

          setTimeout(() => {
               let cleanDomain = domainInput.trim().replace(/\/$/, "");
               if (!cleanDomain.startsWith("http")) cleanDomain = `https://${cleanDomain}`;

               const generatedNodes: PageNode[] = [
                    { id: "1", url: `${cleanDomain}/`, title: "Home Page", inboundCount: 0, outboundCount: 0, pageRank: 0, isOrphan: false, x: 0, y: 0, color: "#38bdf8" },
                    { id: "2", url: `${cleanDomain}/blog`, title: "Blog Hub", inboundCount: 0, outboundCount: 0, pageRank: 0, isOrphan: false, x: 0, y: 0, color: "#818cf8" },
                    { id: "3", url: `${cleanDomain}/blog/seo-guide`, title: "SEO Guide", inboundCount: 0, outboundCount: 0, pageRank: 0, isOrphan: false, x: 0, y: 0, color: "#818cf8" },
                    { id: "4", url: `${cleanDomain}/blog/page-speed`, title: "Page Speed Tips", inboundCount: 0, outboundCount: 0, pageRank: 0, isOrphan: false, x: 0, y: 0, color: "#818cf8" },
                    { id: "5", url: `${cleanDomain}/features`, title: "Product Features", inboundCount: 0, outboundCount: 0, pageRank: 0, isOrphan: false, x: 0, y: 0, color: "#34d399" },
                    { id: "6", url: `${cleanDomain}/pricing`, title: "Pricing & Plans", inboundCount: 0, outboundCount: 0, pageRank: 0, isOrphan: false, x: 0, y: 0, color: "#34d399" },
                    { id: "7", url: `${cleanDomain}/about`, title: "About Us", inboundCount: 0, outboundCount: 0, pageRank: 0, isOrphan: false, x: 0, y: 0, color: "#9ca3af" },
                    { id: "8", url: `${cleanDomain}/contact`, title: "Contact Us", inboundCount: 0, outboundCount: 0, pageRank: 0, isOrphan: false, x: 0, y: 0, color: "#9ca3af" },
                    { id: "9", url: `${cleanDomain}/landing-page-v1`, title: "Legacy Landing Page", inboundCount: 0, outboundCount: 0, pageRank: 0, isOrphan: true, x: 0, y: 0, color: "#fb7185" },
                    { id: "10", url: `${cleanDomain}/docs/archive`, title: "Old V1 Documentation", inboundCount: 0, outboundCount: 0, pageRank: 0, isOrphan: true, x: 0, y: 0, color: "#fb7185" }
               ];

               const generatedEdges: LinkEdge[] = [
                    { source: "1", target: "2", anchorText: "Read our Blog" },
                    { source: "1", target: "5", anchorText: "Features" },
                    { source: "1", target: "6", anchorText: "View Pricing" },
                    { source: "1", target: "7", anchorText: "Learn About Us" },
                    { source: "1", target: "8", anchorText: "Contact" },
                    { source: "2", target: "1", anchorText: "Back to Home" },
                    { source: "2", target: "3", anchorText: "Read SEO Guide" },
                    { source: "2", target: "4", anchorText: "Page Speed Tips" },
                    { source: "3", target: "2", anchorText: "More Articles" },
                    { source: "3", target: "4", anchorText: "Optimize Speed" },
                    { source: "4", target: "2", anchorText: "More Articles" },
                    { source: "5", target: "6", anchorText: "See Pricing Plans" },
                    { source: "6", target: "5", anchorText: "Compare Features" },
                    { source: "7", target: "1", anchorText: "Home" },
                    { source: "8", target: "1", anchorText: "Home" },
               ];

               generatedNodes.forEach(node => {
                    node.inboundCount = generatedEdges.filter(e => e.target === node.id).length;
                    node.outboundCount = generatedEdges.filter(e => e.source === node.id).length;
                    node.isOrphan = node.inboundCount === 0 && node.id !== "1";
               });

               const maxInbound = Math.max(...generatedNodes.map(n => n.inboundCount), 1);
               generatedNodes.forEach(node => {
                    if (node.isOrphan) {
                         node.pageRank = 0;
                    } else {
                         node.pageRank = Math.min(10, Math.round((node.inboundCount / maxInbound) * 9 + 1));
                    }
               });

               const newInsights: { title: string, desc: string, type: "warning" | "success" | "opportunity" }[] = [];
               const orphans = generatedNodes.filter(n => n.isOrphan);
               const pillars = generatedNodes.filter(n => n.pageRank >= 8);

               if (orphans.length > 0) {
                    newInsights.push({ type: "warning", title: `${orphans.length} Orphan Pages Detected`, desc: "Pages with zero incoming internal links cannot flow PageRank and risk de-indexation." });
                    if (pillars.length > 0) {
                         newInsights.push({ type: "opportunity", title: "High Authority Link Opportunity", desc: `Add an internal link from "${pillars[0].title}" (PR: ${pillars[0].pageRank}) to "${orphans[0].title}" to instantly pass authority and indexation value.` });
                    }
               }

               const highOutbound = generatedNodes.find(n => n.outboundCount > 10);
               if (highOutbound) {
                    newInsights.push({ type: "warning", title: "Link Dilution Risk", desc: `"${highOutbound.title}" has too many outbound links, diluting the PageRank it passes to target pages.` });
               }

               newInsights.push({ type: "success", title: "Healthy Hub-and-Spoke", desc: "The 'Blog Hub' cluster shows excellent reciprocal linking, establishing strong semantic topical authority." });

               const centerX = 320;
               const centerY = 200;
               const radius = 130;

               generatedNodes.forEach((node, index) => {
                    if (node.id === "1") {
                         node.x = centerX; node.y = centerY;
                    } else if (node.isOrphan) {
                         node.x = 60 + index * 40; node.y = 50 + (index % 2) * 40;
                    } else {
                         const angle = ((index - 1) / (generatedNodes.length - 3 - orphans.length)) * Math.PI * 2;
                         node.x = centerX + radius * Math.cos(angle);
                         node.y = centerY + radius * Math.sin(angle);
                    }
               });

               setNodes(generatedNodes);
               setEdges(generatedEdges);
               setInsights(newInsights);
               setIsCrawling(false);
          }, 1200);
     };

     useEffect(() => {
          runCrawlSimulation();
          return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); }
          // eslint-disable-next-line react-hooks/exhaustive-deps
     }, []);

     useEffect(() => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          let offset = 0;

          const renderLoop = () => {
               ctx.clearRect(0, 0, canvas.width, canvas.height);
               offset += 0.5;

               edges.forEach(edge => {
                    const sourceNode = nodes.find(n => n.id === edge.source);
                    const targetNode = nodes.find(n => n.id === edge.target);

                    if (sourceNode && targetNode) {
                         const isFaded = filterMode === "orphans" && (!sourceNode.isOrphan && !targetNode.isOrphan);
                         ctx.beginPath();
                         ctx.moveTo(sourceNode.x, sourceNode.y);
                         ctx.lineTo(targetNode.x, targetNode.y);
                         ctx.setLineDash([4, 8]);
                         ctx.lineDashOffset = -offset;
                         ctx.strokeStyle = isFaded ? "rgba(156, 163, 175, 0.05)" : "rgba(34, 211, 238, 0.3)";
                         ctx.lineWidth = 1.5;
                         ctx.stroke();
                         ctx.setLineDash([]);
                    }
               });

               nodes.forEach(node => {
                    const isSelected = selectedNode?.id === node.id;
                    const isFaded = (filterMode === "orphans" && !node.isOrphan) || (filterMode === "pillars" && node.pageRank < 7);
                    const size = Math.max(8, node.pageRank * 2.5);

                    ctx.beginPath();
                    ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
                    ctx.fillStyle = isFaded ? "rgba(75, 85, 99, 0.2)" : (node.isOrphan ? "#fb7185" : node.color);
                    if (isSelected) {
                         ctx.shadowColor = node.color;
                         ctx.shadowBlur = 15;
                    } else {
                         ctx.shadowBlur = 0;
                    }
                    ctx.fill();

                    if (isSelected) {
                         ctx.lineWidth = 2;
                         ctx.strokeStyle = "#ffffff";
                         ctx.stroke();
                    }

                    if (!isFaded) {
                         ctx.font = "10px Inter, sans-serif";
                         ctx.fillStyle = isSelected ? "#ffffff" : "rgba(209, 213, 219, 0.7)";
                         ctx.textAlign = "center";
                         ctx.fillText(node.title.substring(0, 18), node.x, node.y + size + 14);
                    }
               });
               animationRef.current = requestAnimationFrame(renderLoop);
          };

          animationRef.current = requestAnimationFrame(renderLoop);
          return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); }
     }, [nodes, edges, selectedNode, filterMode]);

     const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
          const canvas = canvasRef.current;
          if (!canvas) return;

          const rect = canvas.getBoundingClientRect();
          const cssX = e.clientX - rect.left;
          const cssY = e.clientY - rect.top;
          const scaleX = canvas.width / rect.width;
          const scaleY = canvas.height / rect.height;

          const clickX = cssX * scaleX;
          const clickY = cssY * scaleY;

          const clicked = filteredNodes.find(node => {
               const dist = Math.hypot(node.x - clickX, node.y - clickY);
               return dist <= Math.max(16, node.pageRank * 3);
          });
          setSelectedNode(clicked || null);
     };

     const exportGraphData = () => {
          let csv = "Type,ID,Label,Source,Target,Weight,AnchorText\n";
          nodes.forEach(n => { csv += `Node,${n.id},"${n.title}",,,,${n.pageRank}\n`; });
          edges.forEach(e => { csv += `Edge,,,${e.source},${e.target},1,"${e.anchorText}"\n`; });

          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", `internal-link-graph.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          setIsExported(true);
          setTimeout(() => setIsExported(false), 2000);
     };

     return (
          <div className="w-full flex flex-col gap-6 relative">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-500/20">
                              <Network size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Internal Link Graph Visualizer (Demo)</h2>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Map internal architecture, identify missing anchor text, and watch simulated PageRank flow in real-time.</p>
                         </div>
                    </div>
               </div>

               <AdSlot adSlot="top-linkgraph-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-4 flex flex-col gap-6">
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col gap-5 transition-colors">
                              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-300 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800/80 pb-3">
                                   <Globe size={16} className="text-cyan-600 dark:text-cyan-400" /> Crawl Target Setup
                              </h3>

                              <div className="space-y-4">
                                   <div>
                                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">Domain URL</label>
                                        <input
                                             type="text"
                                             value={domainInput}
                                             onChange={(e) => setDomainInput(e.target.value)}
                                             placeholder="https://example.com"
                                             className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white font-mono outline-none focus:border-cyan-500/50"
                                        />
                                   </div>
                                   <div>
                                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">Crawl Depth Limit</label>
                                        <select
                                             value={depth}
                                             onChange={(e) => setDepth(Number(e.target.value))}
                                             className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-gray-700 dark:text-gray-200 outline-none"
                                        >
                                             <option value={1}>1 Click Deep (Fast)</option>
                                             <option value={2}>2 Clicks Deep (Standard)</option>
                                             <option value={3}>3 Clicks Deep (Deep Site)</option>
                                        </select>
                                   </div>
                              </div>

                              <button
                                   onClick={runCrawlSimulation}
                                   disabled={!domainInput.trim() || isCrawling}
                                   className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-md dark:shadow-lg dark:shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                   {isCrawling ? <span className="flex items-center gap-2 animate-pulse"><RefreshCw size={18} className="animate-spin" /> Crawling & Mapping...</span> : <><Sparkles size={18} /> Analyze Link Architecture</>}
                              </button>
                         </div>

                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col gap-4 min-h-[300px] transition-colors">
                              <h4 className="text-xs font-bold text-gray-900 dark:text-gray-300 flex items-center gap-2 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800/80 pb-3">
                                   <Zap size={14} className="text-amber-500 dark:text-amber-400" /> Automated Architecture Insights
                              </h4>

                              {isCrawling ? (
                                   <div className="flex-grow flex items-center justify-center text-gray-400 dark:text-gray-600">
                                        <RefreshCw size={24} className="animate-spin opacity-50" />
                                   </div>
                              ) : (
                                   <div className="flex flex-col gap-3 overflow-y-auto">
                                        {insights.map((insight, i) => (
                                             <div key={i} className={`p-3.5 rounded-xl border flex flex-col gap-1.5 ${insight.type === 'warning' ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30' : insight.type === 'opportunity' ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30' : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'}`}>
                                                  <div className="flex items-center gap-2">
                                                       {insight.type === 'warning' && <AlertTriangle size={14} className="text-rose-600 dark:text-rose-400" />}
                                                       {insight.type === 'opportunity' && <Target size={14} className="text-amber-600 dark:text-amber-400" />}
                                                       {insight.type === 'success' && <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />}
                                                       <span className={`text-[11px] font-bold uppercase tracking-wider ${insight.type === 'warning' ? 'text-rose-700 dark:text-rose-400' : insight.type === 'opportunity' ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>{insight.title}</span>
                                                  </div>
                                                  <p className="text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed">{insight.desc}</p>
                                             </div>
                                        ))}
                                   </div>
                              )}
                         </div>
                    </div>

                    <div className="lg:col-span-8 flex flex-col gap-6">
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col gap-4 transition-colors">
                              <div className="flex flex-wrap items-center justify-between border-b border-gray-100 dark:border-gray-800/80 pb-3 gap-2">
                                   <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-950 p-1 rounded-xl border border-gray-200 dark:border-gray-800 text-[10px] font-bold">
                                        <button onClick={() => setFilterMode("all")} className={`px-3 py-1.5 rounded-lg transition-colors ${filterMode === "all" ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}>All Nodes</button>
                                        <button onClick={() => setFilterMode("orphans")} className={`px-3 py-1.5 rounded-lg transition-colors ${filterMode === "orphans" ? "bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}>Orphans Only</button>
                                        <button onClick={() => setFilterMode("pillars")} className={`px-3 py-1.5 rounded-lg transition-colors ${filterMode === "pillars" ? "bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}>Pillar Pages (&gt;7 PR)</button>
                                   </div>
                                   <button
                                        onClick={exportGraphData}
                                        disabled={nodes.length === 0}
                                        className="flex items-center gap-1.5 text-[10px] font-bold bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                   >
                                        {isExported ? <CheckCircle2 size={14} className="text-emerald-500 dark:text-emerald-400" /> : <Download size={14} />}
                                        {isExported ? "Data Downloaded" : "Export Node/Edge Data (CSV)"}
                                   </button>
                              </div>

                              {/* Canvas remains dark to preserve neon particle effects */}
                              <div className="relative bg-[#0d1117] rounded-2xl border border-gray-800/80 overflow-hidden flex items-center justify-center">
                                   <canvas
                                        ref={canvasRef}
                                        width={640}
                                        height={420}
                                        onClick={handleCanvasClick}
                                        className="w-full h-[420px] cursor-pointer"
                                   />
                                   <span className="absolute bottom-3 left-4 text-[10px] text-gray-500 font-mono bg-gray-950/80 px-2 py-1 rounded">Click any node to inspect Link Flow</span>
                              </div>

                              {selectedNode ? (
                                   <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 transition-colors">
                                        <div className="flex items-start justify-between">
                                             <div className="flex flex-col gap-1">
                                                  <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                                                       <FileText size={12} /> Page Details
                                                  </span>
                                                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">{selectedNode.title}</h4>
                                                  <a href={selectedNode.url} target="_blank" rel="noreferrer" className="text-xs font-mono text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 truncate hover:underline">{selectedNode.url}</a>
                                             </div>
                                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${selectedNode.isOrphan ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30" : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"}`}>
                                                  {selectedNode.isOrphan ? "Status: Orphan Page" : "Status: Healthy"}
                                             </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3 mt-2">
                                             <div className="bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-800/80">
                                                  <span className="text-gray-500 text-[9px] font-bold uppercase tracking-wider block mb-1">Inbound Links</span>
                                                  <span className="font-bold text-lg text-gray-900 dark:text-white">{selectedNode.inboundCount}</span>
                                             </div>
                                             <div className="bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-800/80">
                                                  <span className="text-gray-500 text-[9px] font-bold uppercase tracking-wider block mb-1">Outbound Links</span>
                                                  <span className="font-bold text-lg text-gray-900 dark:text-white">{selectedNode.outboundCount}</span>
                                             </div>
                                             <div className="bg-cyan-50 dark:bg-cyan-500/10 p-3 rounded-xl border border-cyan-200 dark:border-cyan-500/20">
                                                  <span className="text-cyan-700 dark:text-cyan-500/80 text-[9px] font-bold uppercase tracking-wider block mb-1">Simulated PageRank</span>
                                                  <span className="font-bold text-lg text-cyan-600 dark:text-cyan-400">{selectedNode.pageRank} <span className="text-[10px] text-cyan-500 dark:text-cyan-600">/ 10</span></span>
                                             </div>
                                        </div>

                                        {selectedNode.inboundCount > 0 && (
                                             <div className="mt-2 space-y-2">
                                                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5"><Link2 size={12} /> Top Inbound Anchor Texts</span>
                                                  <div className="flex flex-wrap gap-2">
                                                       {edges.filter(e => e.target === selectedNode.id).slice(0, 4).map((e, i) => (
                                                            <span key={i} className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10px] px-2 py-1 rounded-md font-mono border border-gray-200 dark:border-gray-700">"{e.anchorText}"</span>
                                                       ))}
                                                  </div>
                                             </div>
                                        )}
                                   </div>
                              ) : (
                                   <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800/80 text-center text-xs text-gray-500 h-[178px] flex items-center justify-center transition-colors">
                                        Select a node from the canvas to inspect incoming anchor text and calculated PageRank flow.
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
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">AI Internal Link Graph Visualizer & SEO Architecture Tool</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              A strong internal linking structure is the backbone of technical SEO. ToolLok's <strong>Internal Link Visualizer</strong> maps your website's architecture to reveal exactly how "Link Juice" (PageRank) flows between your pages. By identifying disconnected orphan pages and optimizing your anchor text, you can dramatically improve your Google rankings. Pair this visualizer with our <Link href="/categories/seo-tools" className="text-cyan-600 dark:text-cyan-400 hover:underline">SEO Tools</Link> to build a bulletproof content strategy.
                         </p>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Key Features & Benefits</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Orphan Page Detection:</strong> Instantly locate pages that have zero incoming internal links, ensuring no valuable content is ignored by search engine crawlers.</li>
                              <li><strong>Simulated PageRank Flow:</strong> Visually track how authority moves from your high-performing "Pillar Pages" down to your deeper articles and product pages.</li>
                              <li><strong>Anchor Text Analysis:</strong> Click on any node to review the exact anchor text being used to point to that page, helping you optimize for target keywords.</li>
                         </ul>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">What is an Orphan Page?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">An orphan page is a URL on your website that has absolutely no internal links pointing to it. Because search engines crawl the web by following links, orphan pages are often entirely missed by Google, meaning they will not rank in search results.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">How does internal linking affect SEO?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Internal links help search engines understand the structure and hierarchy of your website. When a high-authority page (like your homepage) links to a smaller article, it passes "PageRank" to that article, giving it a boost in search engine visibility.</p>
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
                                             "name": "What is an Orphan Page?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "An orphan page is a URL on your website that has absolutely no internal links pointing to it, making it difficult for search engines to discover and rank." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "How does internal linking affect SEO?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Internal links help search engines understand the hierarchy of your website and pass PageRank from high-authority pages to smaller articles, boosting their visibility." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-linkgraph-ad" format="fluid" className="mt-4" />
          </div>
     );
}