"use client";

import { useState } from "react";
import { Globe, Search, Sparkles, BookOpen, Database, Target, Copy, Check, FileText, ExternalLink, Activity, Layers } from "lucide-react";

export default function AutonomousResearchAgent() {
     const [topic, setTopic] = useState("");
     const [isGenerating, setIsGenerating] = useState(false);
     const [progressStep, setProgressStep] = useState("");
     const [isCopied, setIsCopied] = useState(false);

     const [researchPlan, setResearchPlan] = useState<{
          domain: string;
          complexity: number;
          keywords: string[];
          dorks: { query: string; purpose: string }[];
          databases: { name: string; url: string; desc: string }[];
          methodology: string;
     } | null>(null);

     // Smart Client-Side Research Architect
     const architectResearch = (inputText: string) => {
          const lower = inputText.toLowerCase();

          // 1. Keyword Extraction (Simple stop-word removal for heuristic)
          const stopWords = ["the", "of", "and", "a", "to", "in", "is", "you", "that", "it", "he", "was", "for", "on", "are", "as", "with", "his", "they", "i", "at", "be", "this", "have", "from", "or", "one", "had", "by", "word", "but", "not", "what", "all", "were", "we", "when", "your", "can", "said", "there", "use", "an", "each", "which", "she", "do", "how", "their", "if", "will", "up", "other", "about", "out", "many", "then", "them", "these", "so", "some", "her", "would", "make", "like", "him", "into", "time", "has", "look", "two", "more", "write", "go", "see", "number", "no", "way", "could", "people", "my", "than", "first", "water", "been", "call", "who", "oil", "its", "now", "find", "long", "down", "day", "did", "get", "come", "made", "may", "part", "over"];
          const rawWords = lower.replace(/[^a-z0-9\s]/g, "").split(/\s+/);
          const keywords = rawWords.filter(w => !stopWords.includes(w) && w.length > 3).slice(0, 4);
          const primaryKw = keywords[0] || "topic";
          const secondaryKw = keywords[1] || "analysis";

          // 2. Domain Detection & DB Routing
          let domain = "General Academic & Social Sciences";
          let databases = [
               { name: "Google Scholar", url: "https://scholar.google.com", desc: "Broad academic literature" },
               { name: "JSTOR", url: "https://www.jstor.org", desc: "Journals, primary sources, and books" },
               { name: "Directory of Open Access Journals", url: "https://doaj.org", desc: "High-quality, open access, peer-reviewed journals" }
          ];

          if (lower.includes("code") || lower.includes("compute") || lower.includes("crypto") || lower.includes("tech") || lower.includes("ai") || lower.includes("software")) {
               domain = "Computer Science & Engineering";
               databases = [
                    { name: "arXiv (CS)", url: "https://arxiv.org/archive/cs", desc: "Cornell's open-access tech preprint archive" },
                    { name: "IEEE Xplore", url: "https://ieeexplore.ieee.org", desc: "Electrical engineering and computer science" },
                    { name: "ACM Digital Library", url: "https://dl.acm.org", desc: "Computing literature and proceedings" }
               ];
          } else if (lower.includes("health") || lower.includes("medicine") || lower.includes("bio") || lower.includes("brain") || lower.includes("disease")) {
               domain = "Medical & Biological Sciences";
               databases = [
                    { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov", desc: "Biomedical literature from MEDLINE" },
                    { name: "Cochrane Library", url: "https://www.cochranelibrary.com", desc: "High-quality medical systematic reviews" },
                    { name: "BioRxiv", url: "https://www.biorxiv.org", desc: "The preprint server for biology" }
               ];
          } else if (lower.includes("market") || lower.includes("finance") || lower.includes("trade") || lower.includes("economy") || lower.includes("stock")) {
               domain = "Finance, Economics & Business";
               databases = [
                    { name: "SSRN", url: "https://www.ssrn.com", desc: "Social Science Research Network (Finance/Econ)" },
                    { name: "NBER", url: "https://www.nber.org", desc: "National Bureau of Economic Research" },
                    { name: "SEC EDGAR", url: "https://www.sec.gov/edgar/searchedgar/companysearch.html", desc: "Public company filings and financial data" }
               ];
          }

          // 3. Complexity Score Heuristic
          const complexity = Math.min(98, Math.max(45, (rawWords.length * 5) + (keywords.length * 10)));

          // 4. Generate Dorks
          const dorks = [
               { query: `site:edu OR site:gov "${primaryKw}" AND "${secondaryKw}" filetype:pdf`, purpose: "Isolate institutional research papers" },
               { query: `intitle:"${primaryKw}" ("study" OR "meta-analysis" OR "review") -inurl:blog`, purpose: "Find high-level literature reviews" },
               { query: `"${primaryKw}" AND ("dataset" OR "statistics" OR "methodology") ext:xls OR ext:csv OR ext:pdf`, purpose: "Extract raw datasets and metrics" },
               { query: `site:ycombinator.com/item?id= OR site:reddit.com/r/science "${primaryKw}"`, purpose: "Discover expert forum discussions" }
          ];

          return {
               domain,
               complexity,
               keywords,
               dorks,
               databases,
               methodology: `PHASE 1: LITERATURE REVIEW\nExecute the PDF-specific queries to gather 3-5 foundational institutional papers.\n\nPHASE 2: DATA ACQUISITION\nRun the dataset operators to find raw statistics or CSVs backing up the claims found in Phase 1.\n\nPHASE 3: CONSENSUS CHECK\nCross-reference the primary keywords through [${databases[0].name}] to identify contradicting studies or recent paradigm shifts.\n\nPHASE 4: SYNTHESIS\nCompile extracted claims, ensure all citations are from peer-reviewed or .gov/.edu sources, and discard any SEO blog results.`
          };
     };

     const generateResearchPlan = () => {
          if (!topic.trim()) return;
          setIsGenerating(true);
          setProgressStep("Analyzing topic taxonomy & extracting entities...");

          setTimeout(() => {
               setProgressStep("Routing to specialized academic databases...");
               setTimeout(() => {
                    setProgressStep("Synthesizing actionable search operators...");
                    setTimeout(() => {
                         setResearchPlan(architectResearch(topic));
                         setIsGenerating(false);
                    }, 500);
               }, 500);
          }, 600);
     };

     const copyPlan = () => {
          if (!researchPlan) return;
          const textToCopy = `RESEARCH DOSSIER: ${topic}\nDOMAIN: ${researchPlan.domain}\n\nADVANCED SEARCH QUERIES (DORKS):\n${researchPlan.dorks.map(d => `- ${d.query} (${d.purpose})`).join('\n')}\n\nTARGET DATABASES:\n${researchPlan.databases.map(db => `- ${db.name}: ${db.url}`).join('\n')}\n\nMETHODOLOGY:\n${researchPlan.methodology}`;
          navigator.clipboard.writeText(textToCopy);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
     };

     return (
          <div className="w-full max-w-6xl mx-auto space-y-8">
               <div>
                    <div className="flex items-center gap-3 mb-2">
                         <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400 border border-rose-500/20">
                              <Globe size={20} />
                         </div>
                         <h2 className="text-2xl md:text-3xl font-black text-white">Autonomous Research Agent Sandbox</h2>
                    </div>
                    <p className="text-gray-400 text-sm">Architect comprehensive methodologies, extract semantic entities, and generate executable search operators. 100% Free.</p>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* LEFT COLUMN: Input & Metrics (Span 4) */}
                    <div className="lg:col-span-4 bg-gray-900/50 border border-gray-800 rounded-3xl p-6 flex flex-col gap-6">
                         <div className="space-y-3 flex-grow">
                              <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                   <Target size={16} className="text-rose-400" /> Core Research Topic
                              </label>
                              <textarea
                                   value={topic}
                                   onChange={(e) => setTopic(e.target.value)}
                                   placeholder="e.g., The impact of quantum computing on modern cryptography..."
                                   className="w-full min-h-[160px] bg-gray-950 border border-gray-800 rounded-xl p-4 text-sm text-gray-200 placeholder:text-gray-700 focus:outline-none focus:border-rose-500/50 transition-all resize-none"
                              />
                         </div>

                         <button
                              onClick={generateResearchPlan}
                              disabled={!topic.trim() || isGenerating}
                              className="w-full py-4 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                              {isGenerating ? (
                                   <span className="flex items-center gap-2 animate-pulse"><Sparkles size={18} /> {progressStep}</span>
                              ) : (
                                   <><Search size={18} /> Architect Research Plan</>
                              )}
                         </button>

                         {/* Real-time Metrics Panel */}
                         {researchPlan && (
                              <div className="pt-6 border-t border-gray-800/50 space-y-4">
                                   <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                             <span className="text-gray-400 flex items-center gap-1.5"><Activity size={14} className="text-emerald-400" /> Topic Complexity</span>
                                             <span className="font-bold text-gray-200">{researchPlan.complexity}/100</span>
                                        </div>
                                        <div className="w-full bg-gray-800 rounded-full h-1.5">
                                             <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-1.5 rounded-full" style={{ width: `${researchPlan.complexity}%` }}></div>
                                        </div>
                                   </div>

                                   <div className="space-y-2">
                                        <span className="text-xs text-gray-400 flex items-center gap-1.5"><Layers size={14} className="text-cyan-400" /> Extracted Entities</span>
                                        <div className="flex flex-wrap gap-2">
                                             {researchPlan.keywords.map((kw, i) => (
                                                  <span key={i} className="px-2 py-1 bg-gray-950 border border-gray-800 rounded-md text-[10px] text-gray-300 font-mono uppercase tracking-wider">{kw}</span>
                                             ))}
                                        </div>
                                   </div>
                              </div>
                         )}
                    </div>

                    {/* RIGHT COLUMN: Output Dashboard (Span 8) */}
                    <div className="lg:col-span-8 bg-gray-900/50 border border-gray-800 rounded-3xl p-6 flex flex-col gap-6 relative overflow-hidden">

                         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-800/50">
                              <div>
                                   <h3 className="text-sm font-bold text-gray-300">Generated Research Dossier</h3>
                                   {researchPlan && <p className="text-xs text-rose-400 mt-1 font-semibold">{researchPlan.domain}</p>}
                              </div>
                              <button
                                   onClick={copyPlan}
                                   disabled={!researchPlan}
                                   className="flex items-center gap-1.5 text-xs font-bold bg-gray-950 border border-gray-800 hover:border-gray-700 hover:text-white text-gray-400 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 whitespace-nowrap"
                              >
                                   {isCopied ? <><Check className="text-emerald-400" size={14} /> Copied!</> : <><Copy size={14} /> Export Dossier</>}
                              </button>
                         </div>

                         {researchPlan ? (
                              <div className="space-y-6 overflow-y-auto pr-2">
                                   {/* Advanced Search Queries - NOW CLICKABLE */}
                                   <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-rose-400 flex items-center gap-2 uppercase tracking-wider">
                                             <Search size={14} /> Executable Search Operators (Dorks)
                                        </h4>
                                        <div className="space-y-2">
                                             {researchPlan.dorks.map((dork, i) => (
                                                  <div key={i} className="bg-gray-950 border border-gray-800 hover:border-rose-500/30 transition-colors rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 group">
                                                       <div className="flex flex-col gap-1">
                                                            <code className="text-gray-300 text-xs font-mono select-all">{dork.query}</code>
                                                            <span className="text-[10px] text-gray-500">{dork.purpose}</span>
                                                       </div>
                                                       <a
                                                            href={`https://www.google.com/search?q=${encodeURIComponent(dork.query)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1.5 text-[10px] font-bold bg-rose-500/10 text-rose-400 px-2.5 py-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/20 transition-colors whitespace-nowrap"
                                                       >
                                                            Execute <ExternalLink size={12} />
                                                       </a>
                                                  </div>
                                             ))}
                                        </div>
                                   </div>

                                   {/* Target Databases */}
                                   <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
                                             <Database size={14} /> Target Academic Databases
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                             {researchPlan.databases.map((db, i) => (
                                                  <a
                                                       key={i}
                                                       href={db.url}
                                                       target="_blank"
                                                       rel="noopener noreferrer"
                                                       className="bg-gray-950 border border-gray-800 rounded-xl p-3 flex flex-col gap-1 hover:border-emerald-500/30 transition-colors group"
                                                  >
                                                       <span className="text-sm font-bold text-gray-200 group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                                                            {db.name} <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                       </span>
                                                       <span className="text-[10px] text-gray-500 leading-tight">{db.desc}</span>
                                                  </a>
                                             ))}
                                        </div>
                                   </div>

                                   {/* Methodology */}
                                   <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-blue-400 flex items-center gap-2 uppercase tracking-wider">
                                             <FileText size={14} /> Execution Methodology
                                        </h4>
                                        <div className="bg-gray-950 border border-gray-800 rounded-xl p-5 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-mono">
                                             {researchPlan.methodology}
                                        </div>
                                   </div>
                              </div>
                         ) : (
                              <div className="h-full flex flex-col items-center justify-center text-gray-700 gap-3 min-h-[300px]">
                                   <BookOpen className="opacity-20" size={32} />
                                   <p className="text-center px-8 text-xs max-w-sm">Enter a broad research topic. The agent will detect your academic domain, extract entities, and construct executable search queries.</p>
                              </div>
                         )}
                    </div>
               </div>
          </div>
     );
}