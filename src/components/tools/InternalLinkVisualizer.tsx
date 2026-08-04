"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
     Network, Globe, RefreshCw, Sparkles, AlertTriangle, CheckCircle2,
     Download, Layers, FileText, Zap, ShieldAlert, Target, Link2
} from "lucide-react";
import AdSlot from "@/components/ui/AdSlot";

interface PageNode {
     id: string;
     url: string;
     title: string;
     inboundCount: number;
     outboundCount: number;
     pageRank: number; // 0 to 10 score
     isOrphan: boolean;
     x: number;
     y: number;
     color: string;
}

interface LinkEdge {
     source: string;
     target: string;
     anchorText: string;
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

     // Filtered nodes logic moved up so handleCanvasClick can use it
     const filteredNodes = useMemo(() => {
          if (filterMode === "orphans") return nodes.filter(n => n.isOrphan);
          if (filterMode === "pillars") return nodes.filter(n => n.pageRank >= 7);
          return nodes;
     }, [nodes, filterMode]);

     // --- HEURISTIC NETWORK & INSIGHTS ENGINE ---
     const runCrawlSimulation = () => {
          if (!domainInput.trim()) return;
          setIsCrawling(true);
          setSelectedNode(null);
          cancelAnimationFrame(animationRef.current!);

          setTimeout(() => {
               let cleanDomain = domainInput.trim().replace(/\/$/, "");
               if (!cleanDomain.startsWith("http")) cleanDomain = `https://${cleanDomain}`;

               // 1. Generate Mock Site Structure
               const generatedNodes: PageNode[] = [
                    { id: "1", url: `${cleanDomain}/`, title: "Home Page", inboundCount: 0, outboundCount: 0, pageRank: 0, isOrphan: false, x: 0, y: 0, color: "#38bdf8" },
                    { id: "2", url: `${cleanDomain}/blog`, title: "Blog Hub", inboundCount: 0, outboundCount: 0, pageRank: 0, isOrphan: false, x: 0, y: 0, color: "#818cf8" },
                    { id: "3", url: `${cleanDomain}/blog/seo-guide`, title: "SEO Guide", inboundCount: 0, outboundCount: 0, pageRank: 0, isOrphan: false, x: 0, y: 0, color: "#818cf8" },
                    { id: "4", url: `${cleanDomain}/blog/page-speed`, title: "Page Speed Tips", inboundCount: 0, outboundCount: 0, pageRank: 0, isOrphan: false, x: 0, y: 0, color: "#818cf8" },
                    { id: "5", url: `${cleanDomain}/features`, title: "Product Features", inboundCount: 0, outboundCount: 0, pageRank: 0, isOrphan: false, x: 0, y: 0, color: "#34d399" },
                    { id: "6", url: `${cleanDomain}/pricing`, title: "Pricing & Plans", inboundCount: 0, outboundCount: 0, pageRank: 0, isOrphan: false, x: 0, y: 0, color: "#34d399" },
                    { id: "7", url: `${cleanDomain}/about`, title: "About Us", inboundCount: 0, outboundCount: 0, pageRank: 0, isOrphan: false, x: 0, y: 0, color: "#9ca3af" },
                    { id: "8", url: `${cleanDomain}/contact`, title: "Contact Us", inboundCount: 0, outboundCount: 0, pageRank: 0, isOrphan: false, x: 0, y: 0, color: "#9ca3af" },
                    // Orphans
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

               // 2. Calculate PageRank and Link Counts
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

               // 3. Automated Link Insights Generator
               const newInsights: { title: string, desc: string, type: "warning" | "success" | "opportunity" }[] = [];
               const orphans = generatedNodes.filter(n => n.isOrphan);
               const pillars = generatedNodes.filter(n => n.pageRank >= 8);

               if (orphans.length > 0) {
                    newInsights.push({
                         type: "warning",
                         title: `${orphans.length} Orphan Pages Detected`,
                         desc: "Pages with zero incoming internal links cannot flow PageRank and risk de-indexation."
                    });
                    // Generate a specific opportunity
                    if (pillars.length > 0) {
                         newInsights.push({
                              type: "opportunity",
                              title: "High Authority Link Opportunity",
                              desc: `Add an internal link from "${pillars[0].title}" (PR: ${pillars[0].pageRank}) to "${orphans[0].title}" to instantly pass authority and indexation value.`
                         });
                    }
               }

               const highOutbound = generatedNodes.find(n => n.outboundCount > 10);
               if (highOutbound) {
                    newInsights.push({
                         type: "warning",
                         title: "Link Dilution Risk",
                         desc: `"${highOutbound.title}" has too many outbound links, diluting the PageRank it passes to target pages.`
                    });
               }

               newInsights.push({
                    type: "success",
                    title: "Healthy Hub-and-Spoke",
                    desc: "The 'Blog Hub' cluster shows excellent reciprocal linking, establishing strong semantic topical authority."
               });

               // 4. Circular Canvas Layout Coordinates
               const centerX = 320;
               const centerY = 200;
               const radius = 130;

               generatedNodes.forEach((node, index) => {
                    if (node.id === "1") {
                         node.x = centerX;
                         node.y = centerY;
                    } else if (node.isOrphan) {
                         node.x = 60 + index * 40;
                         node.y = 50 + (index % 2) * 40;
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
          return () => cancelAnimationFrame(animationRef.current!);
     }, []);

     // --- ANIMATED HTML5 CANVAS RENDERER ---
     useEffect(() => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          let offset = 0;

          const renderLoop = () => {
               ctx.clearRect(0, 0, canvas.width, canvas.height);
               offset += 0.5; // Controls the speed of the "Link Juice" flow

               // Draw Edges (Animated)
               edges.forEach(edge => {
                    const sourceNode = nodes.find(n => n.id === edge.source);
                    const targetNode = nodes.find(n => n.id === edge.target);

                    if (sourceNode && targetNode) {
                         const isFaded = filterMode === "orphans" && (!sourceNode.isOrphan && !targetNode.isOrphan);

                         ctx.beginPath();
                         ctx.moveTo(sourceNode.x, sourceNode.y);
                         ctx.lineTo(targetNode.x, targetNode.y);

                         // Animated Flow Effect
                         ctx.setLineDash([4, 8]);
                         ctx.lineDashOffset = -offset;
                         ctx.strokeStyle = isFaded ? "rgba(156, 163, 175, 0.05)" : "rgba(34, 211, 238, 0.3)";
                         ctx.lineWidth = 1.5;
                         ctx.stroke();

                         // Reset dash for nodes
                         ctx.setLineDash([]);
                    }
               });

               // Draw Nodes
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

                    // Render Label
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

          return () => cancelAnimationFrame(animationRef.current!);
     }, [nodes, edges, selectedNode, filterMode]);

     // FIX: Properly map CSS Click Coordinates to Canvas Internal Layout
     const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
          const canvas = canvasRef.current;
          if (!canvas) return;

          // Get the actual physical bounds of the canvas on the screen
          const rect = canvas.getBoundingClientRect();

          // Calculate where the user clicked relative to the top-left of the canvas
          const cssX = e.clientX - rect.left;
          const cssY = e.clientY - rect.top;

          // Scale CSS coordinates to match the internal 640x420 coordinate system
          const scaleX = canvas.width / rect.width;
          const scaleY = canvas.height / rect.height;

          const clickX = cssX * scaleX;
          const clickY = cssY * scaleY;

          // Search only visible (filtered) nodes
          const clicked = filteredNodes.find(node => {
               const dist = Math.hypot(node.x - clickX, node.y - clickY);
               // Increased Hitbox slightly for easier clicking (Max 16px radius)
               return dist <= Math.max(16, node.pageRank * 3);
          });

          setSelectedNode(clicked || null);
     };

     // Download Data as Gephi/CSV formats
     const exportGraphData = () => {
          let csv = "Type,ID,Label,Source,Target,Weight,AnchorText\n";
          // Nodes
          nodes.forEach(n => {
               csv += `Node,${n.id},"${n.title}",,,,${n.pageRank}\n`;
          });
          // Edges
          edges.forEach(e => {
               csv += `Edge,,,${e.source},${e.target},1,"${e.anchorText}"\n`;
          });

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
          <div className="w-full flex flex-col gap-6">

               {/* Header Section */}
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                              <Network size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-white">AI Internal Link Graph Visualizer (Demo)</h2>
                                   <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-400">Map internal architecture, identify missing anchor text, and watch simulated PageRank flow in real-time.</p>
                         </div>
                    </div>
               </div>

               {/* Top Ad Banner */}
               <AdSlot adSlot="top-linkgraph-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* LEFT COLUMN: Controls & AI Insights (Span 4) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                         <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl flex flex-col gap-5">

                              <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2 border-b border-gray-800/80 pb-3">
                                   <Globe size={16} className="text-cyan-400" /> Crawl Target Setup
                              </h3>

                              <div className="space-y-4">
                                   <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Domain URL</label>
                                        <input
                                             type="text"
                                             value={domainInput}
                                             onChange={(e) => setDomainInput(e.target.value)}
                                             placeholder="https://example.com"
                                             className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none focus:border-cyan-500/50"
                                        />
                                   </div>

                                   <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Crawl Depth Limit</label>
                                        <select
                                             value={depth}
                                             onChange={(e) => setDepth(Number(e.target.value))}
                                             className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-gray-200 outline-none"
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
                                   className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                   {isCrawling ? (
                                        <span className="flex items-center gap-2 animate-pulse"><RefreshCw size={18} className="animate-spin" /> Crawling & Mapping...</span>
                                   ) : (
                                        <><Sparkles size={18} /> Analyze Link Architecture</>
                                   )}
                              </button>
                         </div>

                         {/* AI Internal Link Insights Engine */}
                         <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4 min-h-[300px]">
                              <h4 className="text-xs font-bold text-gray-300 flex items-center gap-2 uppercase tracking-wider border-b border-gray-800/80 pb-3">
                                   <Zap size={14} className="text-amber-400" /> Automated Architecture Insights
                              </h4>

                              {isCrawling ? (
                                   <div className="flex-grow flex items-center justify-center text-gray-600">
                                        <RefreshCw size={24} className="animate-spin opacity-50" />
                                   </div>
                              ) : (
                                   <div className="flex flex-col gap-3 overflow-y-auto">
                                        {insights.map((insight, i) => (
                                             <div key={i} className={`p-3.5 rounded-xl border flex flex-col gap-1.5 ${insight.type === 'warning' ? 'bg-rose-500/10 border-rose-500/30' :
                                                  insight.type === 'opportunity' ? 'bg-amber-500/10 border-amber-500/30' :
                                                       'bg-emerald-500/10 border-emerald-500/30'
                                                  }`}>
                                                  <div className="flex items-center gap-2">
                                                       {insight.type === 'warning' && <AlertTriangle size={14} className="text-rose-400" />}
                                                       {insight.type === 'opportunity' && <Target size={14} className="text-amber-400" />}
                                                       {insight.type === 'success' && <CheckCircle2 size={14} className="text-emerald-400" />}
                                                       <span className={`text-[11px] font-bold uppercase tracking-wider ${insight.type === 'warning' ? 'text-rose-400' :
                                                            insight.type === 'opportunity' ? 'text-amber-400' :
                                                                 'text-emerald-400'
                                                            }`}>{insight.title}</span>
                                                  </div>
                                                  <p className="text-[11px] text-gray-300 leading-relaxed">{insight.desc}</p>
                                             </div>
                                        ))}
                                   </div>
                              )}
                         </div>
                    </div>

                    {/* RIGHT COLUMN: Canvas Visualizer & Node Details (Span 8) */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                         <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">

                              {/* Canvas Header Controls */}
                              <div className="flex flex-wrap items-center justify-between border-b border-gray-800/80 pb-3 gap-2">
                                   <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-xl border border-gray-800 text-[10px] font-bold">
                                        <button onClick={() => setFilterMode("all")} className={`px-3 py-1.5 rounded-lg transition-colors ${filterMode === "all" ? "bg-gray-800 text-white" : "text-gray-500 hover:text-white"}`}>All Nodes</button>
                                        <button onClick={() => setFilterMode("orphans")} className={`px-3 py-1.5 rounded-lg transition-colors ${filterMode === "orphans" ? "bg-rose-500/20 text-rose-400" : "text-gray-500 hover:text-white"}`}>Orphans Only</button>
                                        <button onClick={() => setFilterMode("pillars")} className={`px-3 py-1.5 rounded-lg transition-colors ${filterMode === "pillars" ? "bg-cyan-500/20 text-cyan-400" : "text-gray-500 hover:text-white"}`}>Pillar Pages (&gt;7 PR)</button>
                                   </div>

                                   <button
                                        onClick={exportGraphData}
                                        disabled={nodes.length === 0}
                                        className="flex items-center gap-1.5 text-[10px] font-bold bg-gray-950 border border-gray-700 hover:border-gray-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                   >
                                        {isExported ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Download size={14} />}
                                        {isExported ? "Data Downloaded" : "Export Node/Edge Data (CSV)"}
                                   </button>
                              </div>

                              {/* Interactive HTML5 Canvas Container */}
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

                              {/* Selected Node Drawer / Inspector */}
                              {selectedNode ? (
                                   <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4">
                                        <div className="flex items-start justify-between">
                                             <div className="flex flex-col gap-1">
                                                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                                                       <FileText size={12} /> Page Details
                                                  </span>
                                                  <h4 className="text-sm font-bold text-white">{selectedNode.title}</h4>
                                                  <a href={selectedNode.url} target="_blank" rel="noreferrer" className="text-xs font-mono text-gray-500 hover:text-cyan-400 truncate hover:underline">{selectedNode.url}</a>
                                             </div>
                                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${selectedNode.isOrphan ? "bg-rose-500/10 text-rose-400 border-rose-500/30" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"}`}>
                                                  {selectedNode.isOrphan ? "Status: Orphan Page" : "Status: Healthy"}
                                             </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3 mt-2">
                                             <div className="bg-gray-900 p-3 rounded-xl border border-gray-800/80">
                                                  <span className="text-gray-500 text-[9px] font-bold uppercase tracking-wider block mb-1">Inbound Links</span>
                                                  <span className="font-bold text-lg text-white">{selectedNode.inboundCount}</span>
                                             </div>
                                             <div className="bg-gray-900 p-3 rounded-xl border border-gray-800/80">
                                                  <span className="text-gray-500 text-[9px] font-bold uppercase tracking-wider block mb-1">Outbound Links</span>
                                                  <span className="font-bold text-lg text-white">{selectedNode.outboundCount}</span>
                                             </div>
                                             <div className="bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/20">
                                                  <span className="text-cyan-500/80 text-[9px] font-bold uppercase tracking-wider block mb-1">Simulated PageRank</span>
                                                  <span className="font-bold text-lg text-cyan-400">{selectedNode.pageRank} <span className="text-[10px] text-cyan-600">/ 10</span></span>
                                             </div>
                                        </div>

                                        {/* Anchor Text Analysis (Inbound) */}
                                        {selectedNode.inboundCount > 0 && (
                                             <div className="mt-2 space-y-2">
                                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5"><Link2 size={12} /> Top Inbound Anchor Texts</span>
                                                  <div className="flex flex-wrap gap-2">
                                                       {edges.filter(e => e.target === selectedNode.id).slice(0, 4).map((e, i) => (
                                                            <span key={i} className="bg-gray-800 text-gray-300 text-[10px] px-2 py-1 rounded-md font-mono border border-gray-700">"{e.anchorText}"</span>
                                                       ))}
                                                  </div>
                                             </div>
                                        )}
                                   </div>
                              ) : (
                                   <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800/80 text-center text-xs text-gray-500 h-[178px] flex items-center justify-center">
                                        Select a node from the canvas to inspect incoming anchor text and calculated PageRank flow.
                                   </div>
                              )}

                         </div>
                    </div>

               </div>

               {/* Bottom Ad Banner */}
               <AdSlot adSlot="bottom-linkgraph-ad" format="fluid" className="mt-4" />

          </div>
     );
}