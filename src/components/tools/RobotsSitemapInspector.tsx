"use client";

import { useState, useMemo } from "react";
import {
     Bot, FileCode2, Play, AlertTriangle, CheckCircle2, XCircle,
     Search, ShieldAlert, Server, FileSearch, Info, FolderTree,
     List, AlertOctagon, Link2Off, Sparkles
} from "lucide-react";
import AdSlot from "@/components/ui/AdSlot";

const DEFAULT_ROBOTS = `User-agent: *
Disallow: /admin/
Disallow: /private/
Allow: /private/public-doc.html
Disallow: /*.pdf$

User-agent: Googlebot
Disallow: /no-google/
Allow: /

Sitemap: https://example.com/sitemap.xml`;

const DEFAULT_SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://example.com/</loc></url>
  <url><loc>https://example.com/blog/seo-tips</loc></url>
  <url><loc>https://example.com/blog/technical/sitemaps</loc></url>
  <url><loc>http://example.com/insecure-page</loc></url>
  <url><loc>https://example.com/admin/dashboard</loc></url>
  <url><loc>https://example.com/downloads/secret-file.pdf</loc></url>
</urlset>`;

export default function RobotsSitemapInspector() {
     const [activeTab, setActiveTab] = useState<"robots" | "sitemap">("robots");
     const [sitemapView, setSitemapView] = useState<"list" | "tree">("list");

     // Robots State
     const [robotsTxt, setRobotsTxt] = useState(DEFAULT_ROBOTS);
     const [testUrl, setTestUrl] = useState("https://example.com/downloads/secret-file.pdf");
     const [userAgent, setUserAgent] = useState("Googlebot");
     const [isTesting, setIsTesting] = useState(false);
     const [testLog, setTestLog] = useState<{ msg: string; type: "info" | "success" | "error" | "warning" | "highlight" }[]>([]);

     // Sitemap State
     const [sitemapXml, setSitemapXml] = useState(DEFAULT_SITEMAP);
     const [sitemapParsed, setSitemapParsed] = useState(false);

     // --- GOOGLEBOT REGEX PATTERN MATCHING ENGINE ---
     const checkUrlAgainstRobots = (urlPath: string, agent: string, robotsRules: string) => {
          const lines = robotsRules.split("\n").map(l => l.trim().split("#")[0]).filter(Boolean);
          let currentUserAgent = "";
          let matchedRules: { rule: string; path: string; specificity: number; type: "Allow" | "Disallow" }[] = [];
          let isRelevantAgent = false;

          lines.forEach(line => {
               const lowerLine = line.toLowerCase();
               if (lowerLine.startsWith("user-agent:")) {
                    const lineAgent = line.substring(11).trim().toLowerCase();
                    currentUserAgent = lineAgent;
                    isRelevantAgent = (lineAgent === "*" || lineAgent === agent.toLowerCase());
               }
               else if (isRelevantAgent && (lowerLine.startsWith("allow:") || lowerLine.startsWith("disallow:"))) {
                    const type = lowerLine.startsWith("allow:") ? "Allow" : "Disallow";
                    const rulePath = line.substring(type.length + 1).trim();

                    if (!rulePath) return;

                    // Convert Robots Pattern to Regex (* and $)
                    let regexStr = rulePath.replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&'); // Escape regex chars
                    regexStr = regexStr.replace(/\\\*/g, '.*'); // Convert * to .*
                    if (regexStr.endsWith('\\$')) {
                         regexStr = regexStr.slice(0, -2) + '$'; // Fix $ at end
                    }

                    const regex = new RegExp(`^${regexStr}`);

                    if (regex.test(urlPath)) {
                         matchedRules.push({
                              rule: line,
                              path: rulePath,
                              specificity: rulePath.length, // Googlebot prioritizes longest rule
                              type
                         });
                    }
               }
          });

          if (matchedRules.length === 0) return { allowed: true, rule: null, matches: 0 };

          // Sort by specificity
          matchedRules.sort((a, b) => b.specificity - a.specificity);
          return { allowed: matchedRules[0].type === "Allow", rule: matchedRules[0].rule, matches: matchedRules.length };
     };

     const runRobotsTest = () => {
          setIsTesting(true);
          const logs: { msg: string; type: "info" | "success" | "error" | "warning" | "highlight" }[] = [];

          setTimeout(() => {
               let path = "/";
               try {
                    const urlObj = new URL(testUrl);
                    path = urlObj.pathname + urlObj.search;
                    logs.push({ msg: `Target Path Extracted: ${path}`, type: "info" });
               } catch (e) {
                    logs.push({ msg: `Invalid Test URL format. Simulating as relative path: ${testUrl}`, type: "warning" });
                    path = testUrl.startsWith("/") ? testUrl : `/${testUrl}`;
               }

               logs.push({ msg: `Simulating Googlebot Wildcard Engine as: ${userAgent}`, type: "info" });

               const result = checkUrlAgainstRobots(path, userAgent, robotsTxt);

               if (!result.rule) {
                    logs.push({ msg: "No matching rules found. Default behavior applies.", type: "highlight" });
                    logs.push({ msg: `Result: ALLOWED ✅`, type: "success" });
               } else {
                    logs.push({ msg: `Found ${result.matches} matching rule(s) via Regex.`, type: "info" });
                    logs.push({ msg: `Winning Rule (Most Specific): ${result.rule}`, type: "highlight" });
                    if (result.allowed) {
                         logs.push({ msg: `Result: ALLOWED ✅`, type: "success" });
                    } else {
                         logs.push({ msg: `Result: BLOCKED 🛑`, type: "error" });
                    }
               }

               setTestLog(logs);
               setIsTesting(false);
          }, 500);
     };


     // --- SITEMAP CROSS-AUDITOR & TREE ENGINE ---
     const sitemapAudit = useMemo(() => {
          if (!sitemapParsed && sitemapXml === DEFAULT_SITEMAP) return null;

          let isSyntaxValid = true;
          let syntaxError = "";
          const urls: { loc: string; path: string; https: boolean; deep: boolean; params: boolean; isBlocked: boolean; blockedBy: string | null }[] = [];
          let tree: any = { name: "root", children: {} };

          try {
               const parser = new DOMParser();
               const xmlDoc = parser.parseFromString(sitemapXml, "text/xml");

               const parseError = xmlDoc.getElementsByTagName("parsererror");
               if (parseError.length > 0) {
                    isSyntaxValid = false;
                    syntaxError = parseError[0].textContent || "Invalid XML Structure";
               } else {
                    const urlNodes = xmlDoc.getElementsByTagName("url");
                    for (let i = 0; i < urlNodes.length; i++) {
                         const locNode = urlNodes[i].getElementsByTagName("loc")[0];
                         if (locNode && locNode.textContent) {
                              const loc = locNode.textContent.trim();
                              const https = loc.startsWith("https://");

                              let path = loc;
                              try { path = new URL(loc).pathname + new URL(loc).search; } catch (e) { }

                              const deep = (path.match(/\//g) || []).length > 4;
                              const params = path.includes("?");

                              // CROSS-AUDIT: Check against current Robots.txt rules
                              const robotsCheck = checkUrlAgainstRobots(path, "Googlebot", robotsTxt);
                              const isBlocked = !robotsCheck.allowed && robotsCheck.rule !== null;

                              urls.push({ loc, path, https, deep, params, isBlocked, blockedBy: robotsCheck.rule });

                              // Build Architecture Tree
                              const parts = path.split('/').filter(Boolean);
                              let currentNode = tree.children;
                              parts.forEach((part, index) => {
                                   if (!currentNode[part]) {
                                        currentNode[part] = { name: part, children: {}, isUrl: index === parts.length - 1, isBlocked };
                                   }
                                   currentNode = currentNode[part].children;
                              });
                         }
                    }
               }
          } catch (e) {
               isSyntaxValid = false;
               syntaxError = "Fatal XML Parsing Error";
          }

          const issuesCount = urls.filter(u => !u.https || u.deep || u.params || u.isBlocked).length;
          const blockedCount = urls.filter(u => u.isBlocked).length;

          // Helper to render tree visually
          const renderTree = (node: any, depth = 0): JSX.Element[] => {
               let elements: JSX.Element[] = [];
               Object.keys(node).forEach(key => {
                    const child = node[key];
                    elements.push(
                         <div key={key + depth} className="flex items-center gap-2 py-1 font-mono text-xs border-l border-gray-800 ml-3 pl-3" style={{ marginLeft: `${depth * 16}px` }}>
                              <span className="text-gray-500">|_</span>
                              {child.isUrl ? (
                                   <span className={`truncate ${child.isBlocked ? 'text-rose-400 line-through' : 'text-emerald-400'}`}>{child.name}</span>
                              ) : (
                                   <span className="text-indigo-300 font-bold">/{child.name}</span>
                              )}
                              {child.isBlocked && <AlertOctagon size={12} className="text-rose-500" />}
                         </div>
                    );
                    if (Object.keys(child.children).length > 0) {
                         elements = elements.concat(renderTree(child.children, depth + 1));
                    }
               });
               return elements;
          };

          const treeElements = renderTree(tree.children);

          return { isSyntaxValid, syntaxError, urls, issuesCount, blockedCount, treeElements };
     }, [sitemapXml, sitemapParsed, robotsTxt]);


     return (
          <div className="w-full flex flex-col gap-6">

               {/* Header Section */}
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400 border border-rose-500/20">
                              <ShieldAlert size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-white">Robots.txt & Sitemap Health Inspector</h2>
                                   <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-400">Advanced Googlebot wildcard simulation, XML structural audits, and cross-contamination checking.</p>
                         </div>
                    </div>
               </div>

               {/* Top Ad Banner */}
               <AdSlot adSlot="top-robots-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               {/* Main Workspace */}
               <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl flex flex-col gap-6 min-h-[600px]">

                    {/* Module Toggles */}
                    <div className="flex items-center gap-2 border-b border-gray-800/80 pb-4">
                         <button
                              onClick={() => setActiveTab("robots")}
                              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === "robots" ? "bg-rose-500/10 text-rose-400 border border-rose-500/30" : "bg-gray-950 text-gray-500 border border-gray-800 hover:text-gray-300"}`}
                         >
                              <Bot size={16} /> Robots.txt Simulator
                         </button>
                         <button
                              onClick={() => { setActiveTab("sitemap"); setSitemapParsed(true); }}
                              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === "sitemap" ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" : "bg-gray-950 text-gray-500 border border-gray-800 hover:text-gray-300"}`}
                         >
                              <FileCode2 size={16} /> Sitemap Cross-Auditor
                         </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">

                         {/* ======================= ROBOTS.TXT TAB ======================= */}
                         {activeTab === "robots" && (
                              <>
                                   {/* LEFT: Editor & Inputs */}
                                   <div className="flex flex-col gap-4">
                                        <div className="flex-grow flex flex-col gap-2">
                                             <div className="flex justify-between items-center">
                                                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                                       <FileCode2 size={12} /> Paste robots.txt content
                                                  </label>
                                                  <span className="text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded flex items-center gap-1"><Sparkles size={10} /> Wildcard & Regex Supported</span>
                                             </div>
                                             <textarea
                                                  value={robotsTxt}
                                                  onChange={(e) => setRobotsTxt(e.target.value)}
                                                  className="w-full h-full min-h-[250px] bg-gray-950 border border-gray-800 rounded-xl p-4 text-xs font-mono text-gray-300 outline-none focus:border-rose-500/50 resize-none leading-relaxed"
                                             />
                                        </div>

                                        <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-4">
                                             <div className="grid grid-cols-3 gap-3">
                                                  <div className="col-span-1">
                                                       <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">User-Agent</label>
                                                       <select
                                                            value={userAgent}
                                                            onChange={(e) => setUserAgent(e.target.value)}
                                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white outline-none"
                                                       >
                                                            <option value="Googlebot">Googlebot</option>
                                                            <option value="Bingbot">Bingbot</option>
                                                            <option value="*">Any (*)</option>
                                                       </select>
                                                  </div>
                                                  <div className="col-span-2">
                                                       <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Test URL Path</label>
                                                       <input
                                                            type="text"
                                                            value={testUrl}
                                                            onChange={(e) => setTestUrl(e.target.value)}
                                                            placeholder="https://example.com/page"
                                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white font-mono outline-none"
                                                       />
                                                  </div>
                                             </div>
                                             <button
                                                  onClick={runRobotsTest}
                                                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                                             >
                                                  <Play size={14} /> Run Simulation
                                             </button>
                                        </div>
                                   </div>

                                   {/* RIGHT: Terminal Output */}
                                   <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                             <Server size={12} /> Crawl Simulation Log
                                        </label>
                                        <div className="w-full flex-grow min-h-[300px] bg-[#0d1117] border border-gray-800 rounded-xl p-5 font-mono text-[11px] overflow-y-auto shadow-inner">
                                             {testLog.length === 0 ? (
                                                  <div className="text-gray-600 flex flex-col items-center justify-center h-full gap-2">
                                                       <Search size={24} className="opacity-50" />
                                                       <span>Ready to test URL accessibility against wildcards.</span>
                                                  </div>
                                             ) : (
                                                  <div className="flex flex-col gap-2">
                                                       {testLog.map((log, i) => (
                                                            <div key={i} className="flex items-start gap-2 leading-relaxed">
                                                                 <span className="text-gray-600">[{new Date().toLocaleTimeString()}]</span>
                                                                 <span className={`
                            ${log.type === "info" ? "text-cyan-400" : ""}
                            ${log.type === "success" ? "text-emerald-400 font-bold" : ""}
                            ${log.type === "error" ? "text-rose-400 font-bold" : ""}
                            ${log.type === "warning" ? "text-amber-400" : ""}
                            ${log.type === "highlight" ? "text-amber-300 font-bold bg-amber-500/10 px-1 rounded" : ""}
                          `}>
                                                                      {log.msg}
                                                                 </span>
                                                            </div>
                                                       ))}
                                                  </div>
                                             )}
                                        </div>
                                   </div>
                              </>
                         )}

                         {/* ======================= SITEMAP TAB ======================= */}
                         {activeTab === "sitemap" && (
                              <>
                                   {/* LEFT: XML Input */}
                                   <div className="flex flex-col gap-4">
                                        <div className="flex-grow flex flex-col gap-2">
                                             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                                  <FileCode2 size={12} /> Paste sitemap.xml content
                                             </label>
                                             <textarea
                                                  value={sitemapXml}
                                                  onChange={(e) => { setSitemapXml(e.target.value); setSitemapParsed(true); }}
                                                  className="w-full h-full min-h-[300px] bg-gray-950 border border-gray-800 rounded-xl p-4 text-xs font-mono text-gray-300 outline-none focus:border-amber-500/50 resize-none leading-relaxed whitespace-pre"
                                                  spellCheck="false"
                                             />
                                        </div>
                                   </div>

                                   {/* RIGHT: Analysis Results */}
                                   <div className="flex flex-col gap-4">
                                        <div className="flex justify-between items-center">
                                             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                                  <FileSearch size={12} /> Sitemap Dashboard
                                             </label>
                                             <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-xl border border-gray-800">
                                                  <button onClick={() => setSitemapView("list")} className={`p-1 rounded-lg ${sitemapView === "list" ? "bg-gray-800 text-white" : "text-gray-500 hover:text-white"}`} title="List View"><List size={12} /></button>
                                                  <button onClick={() => setSitemapView("tree")} className={`p-1 rounded-lg ${sitemapView === "tree" ? "bg-gray-800 text-white" : "text-gray-500 hover:text-white"}`} title="Architecture Tree View"><FolderTree size={12} /></button>
                                             </div>
                                        </div>

                                        {sitemapAudit ? (
                                             !sitemapAudit.isSyntaxValid ? (
                                                  <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex flex-col gap-2">
                                                       <div className="flex items-center gap-2 text-rose-400 text-sm font-bold">
                                                            <AlertTriangle size={16} /> XML Syntax Error
                                                       </div>
                                                       <p className="text-xs text-rose-200/80 font-mono bg-rose-950/50 p-2 rounded">{sitemapAudit.syntaxError}</p>
                                                  </div>
                                             ) : (
                                                  <div className="flex flex-col gap-4 h-full">
                                                       {/* Metric Cards */}
                                                       <div className="grid grid-cols-3 gap-3">
                                                            <div className="bg-gray-950 border border-gray-800 rounded-xl p-3 flex flex-col gap-1">
                                                                 <span className="text-[9px] font-bold text-gray-500 uppercase">Total URLs</span>
                                                                 <span className="text-xl font-black text-white">{sitemapAudit.urls.length}</span>
                                                            </div>
                                                            <div className="bg-gray-950 border border-gray-800 rounded-xl p-3 flex flex-col gap-1">
                                                                 <span className="text-[9px] font-bold text-gray-500 uppercase">SEO Warnings</span>
                                                                 <span className={`text-xl font-black ${sitemapAudit.issuesCount > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                                                                      {sitemapAudit.issuesCount}
                                                                 </span>
                                                            </div>
                                                            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex flex-col gap-1">
                                                                 <span className="text-[9px] font-bold text-rose-400/80 uppercase">Robots Blocked</span>
                                                                 <span className={`text-xl font-black ${sitemapAudit.blockedCount > 0 ? "text-rose-500" : "text-emerald-400"}`}>
                                                                      {sitemapAudit.blockedCount}
                                                                 </span>
                                                            </div>
                                                       </div>

                                                       {/* Content Area (List or Tree) */}
                                                       <div className="flex-grow bg-[#0d1117] border border-gray-800 rounded-xl p-4 overflow-y-auto max-h-[350px] shadow-inner">
                                                            {sitemapView === "list" ? (
                                                                 <div className="space-y-3">
                                                                      {sitemapAudit.urls.map((url, i) => (
                                                                           <div key={i} className={`flex flex-col gap-1.5 p-3 rounded-lg border ${url.isBlocked ? 'bg-rose-950/20 border-rose-900/50' : 'bg-gray-900 border-gray-800'}`}>
                                                                                <span className={`text-xs font-mono break-all line-clamp-2 ${url.isBlocked ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{url.loc}</span>
                                                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                                                     {url.isBlocked && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded flex items-center gap-1"><Link2Off size={10} /> Blocked by Robots.txt</span>}
                                                                                     {url.https ? (
                                                                                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded flex items-center gap-1"><CheckCircle2 size={10} /> HTTPS</span>
                                                                                     ) : (
                                                                                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded flex items-center gap-1"><AlertTriangle size={10} /> HTTP</span>
                                                                                     )}
                                                                                     {url.deep && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded">Deep URL</span>}
                                                                                </div>
                                                                           </div>
                                                                      ))}
                                                                 </div>
                                                            ) : (
                                                                 <div className="flex flex-col">
                                                                      <span className="text-xs text-gray-500 mb-2 border-b border-gray-800 pb-2">Website Architecture Map</span>
                                                                      {sitemapAudit.treeElements}
                                                                 </div>
                                                            )}
                                                       </div>
                                                  </div>
                                             )
                                        ) : (
                                             <div className="text-gray-600 flex flex-col items-center justify-center h-full min-h-[300px] gap-2 bg-[#0d1117] border border-gray-800 rounded-xl">
                                                  <Info size={24} className="opacity-50" />
                                                  <span className="text-xs">Paste your Sitemap XML to generate health audit.</span>
                                             </div>
                                        )}
                                   </div>
                              </>
                         )}

                    </div>
               </div>

               {/* Bottom Ad Banner */}
               <AdSlot adSlot="bottom-robots-ad" format="fluid" className="mt-4" />

          </div>
     );
}