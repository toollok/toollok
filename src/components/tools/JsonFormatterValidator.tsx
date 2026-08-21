"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
     FileJson, Copy, Check, Trash2, Maximize2, Minimize2, AlertCircle,
     ShieldCheck, Code, Network, Activity, Settings2, FileOutput,
     Search, Wrench, ArrowRightLeft, ChevronRight, ChevronDown
} from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import AdSlot from "@/components/ui/AdSlot";

// --- Utility Components for Tree View ---
const JsonNode = ({ label, value, isLast }: { label: string | null, value: any, isLast: boolean }) => {
     const [expanded, setExpanded] = useState(false);
     const isObject = typeof value === 'object' && value !== null;
     const isArray = Array.isArray(value);

     if (isObject) {
          const keys = Object.keys(value);
          const isEmpty = keys.length === 0;
          const bracketOpen = isArray ? '[' : '{';
          const bracketClose = isArray ? ']' : '}';

          return (
               <div className="font-mono text-sm leading-relaxed ml-4 border-l border-gray-200 dark:border-gray-800 pl-2">
                    <div
                         className="flex items-center gap-1 cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded px-1 -ml-1 inline-flex transition-colors"
                         onClick={() => !isEmpty && setExpanded(!expanded)}
                    >
                         {!isEmpty ? (expanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />) : <span className="w-[14px]"></span>}
                         {label && <span className="text-blue-600 dark:text-blue-400 font-semibold">{`"${label}": `}</span>}
                         <span className="text-gray-500 dark:text-gray-400">{bracketOpen}</span>
                         {!expanded && !isEmpty && <span className="text-gray-400 italic text-xs mx-1">{isArray ? `${keys.length} items` : `${keys.length} keys`}</span>}
                         {!expanded && <span className="text-gray-500 dark:text-gray-400">{bracketClose}{!isLast ? ',' : ''}</span>}
                    </div>
                    {expanded && !isEmpty && (
                         <div>
                              {keys.map((k, i) => (
                                   <JsonNode key={k} label={isArray ? null : k} value={value[k]} isLast={i === keys.length - 1} />
                              ))}
                              <div className="text-gray-500 dark:text-gray-400 ml-1">{bracketClose}{!isLast ? ',' : ''}</div>
                         </div>
                    )}
               </div>
          );
     }

     // Primitive values
     let displayValue = String(value);
     let colorClass = "text-emerald-600 dark:text-emerald-400"; // string
     if (typeof value === 'number') colorClass = "text-orange-500 dark:text-orange-400";
     if (typeof value === 'boolean') colorClass = "text-purple-600 dark:text-purple-400";
     if (value === null) { displayValue = "null"; colorClass = "text-gray-500 dark:text-gray-500"; }
     else if (typeof value === 'string') displayValue = `"${value}"`;

     return (
          <div className="font-mono text-sm leading-relaxed ml-4 pl-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 rounded inline-block w-full">
               {label && <span className="text-blue-600 dark:text-blue-400 font-semibold">{`"${label}": `}</span>}
               <span className={colorClass}>{displayValue}</span>
               {!isLast && <span className="text-gray-500 dark:text-gray-400">,</span>}
          </div>
     );
};

export default function JsonToolkit() {
     const [input, setInput] = useState<string>("");
     const [output, setOutput] = useState<string>("");
     const [error, setError] = useState<string | null>(null);
     const [activeTab, setActiveTab] = useState<"editor" | "tree" | "analyze" | "transform" | "generate">("editor");

     // Config states
     const [indentSize, setIndentSize] = useState<number>(2);
     const [searchQuery, setSearchQuery] = useState<string>("");

     const { isCopied, copy } = useCopyToClipboard(2000);

     // Derived parsing state (memoized to prevent re-parsing on every render)
     const parsedData = useMemo(() => {
          if (!input.trim()) return null;
          try {
               return JSON.parse(input);
          } catch {
               return null;
          }
     }, [input]);

     // --- Core Actions ---
     const processOutput = (data: any, indent: number = indentSize) => {
          try {
               const result = JSON.stringify(data, null, indent);
               setOutput(result);
               setError(null);
          } catch (err: any) {
               setError(`Processing Error: ${err.message}`);
          }
     };

     const handleFormat = () => {
          if (!input.trim()) return setError("Please enter JSON data.");
          try {
               const parsed = JSON.parse(input);
               processOutput(parsed, indentSize);
               setActiveTab("editor");
          } catch (err: any) {
               parseAndReportError(err.message, input);
          }
     };

     const handleMinify = () => {
          if (!input.trim()) return setError("Please enter JSON data.");
          try {
               const parsed = JSON.parse(input);
               const minified = JSON.stringify(parsed);
               setOutput(minified);
               setError(null);
               setActiveTab("editor");
          } catch (err: any) {
               parseAndReportError(err.message, input);
          }
     };

     const handleRepair = () => {
          if (!input.trim()) return setError("Please enter JSON data to repair.");
          try {
               let repaired = input
                    .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ')
                    .replace(/'/g, '"')
                    .replace(/,\s*([\]}])/g, '$1');

               const parsed = JSON.parse(repaired);
               setInput(JSON.stringify(parsed, null, indentSize));
               processOutput(parsed, indentSize);
               setError(null);
          } catch (err: any) {
               setError(`Could not automatically repair JSON. Manual fix required.`);
          }
     };

     const handleClear = () => {
          setInput(""); setOutput(""); setError(null); setSearchQuery("");
     };

     const parseAndReportError = (errorMessage: string, rawInput: string) => {
          const positionMatch = errorMessage.match(/position (\d+)/);
          if (positionMatch) {
               const pos = parseInt(positionMatch[1], 10);
               const lines = rawInput.substring(0, pos).split('\n');
               const line = lines.length;
               const col = lines[line - 1].length + 1;
               setError(`Syntax Error at Line ${line}, Column ${col}: ${errorMessage}`);
          } else {
               setError(`Invalid JSON: ${errorMessage}`);
          }
          setOutput("");
     };

     // --- Transform & Generate Logic ---
     const handleSortKeys = () => {
          if (!parsedData) return setError("Valid JSON required to sort keys.");
          const deepSort = (obj: any): any => {
               if (Array.isArray(obj)) return obj.map(deepSort);
               if (obj !== null && typeof obj === 'object') {
                    return Object.keys(obj).sort().reduce((acc: any, key) => {
                         acc[key] = deepSort(obj[key]);
                         return acc;
                    }, {});
               }
               return obj;
          };
          processOutput(deepSort(parsedData));
     };

     const handleFlatten = () => {
          if (!parsedData) return setError("Valid JSON required.");
          const flatten = (obj: any, prefix = '', res: any = {}) => {
               for (let [key, val] of Object.entries(obj)) {
                    const pre = prefix.length ? `${prefix}.` : '';
                    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
                         flatten(val, pre + key, res);
                    } else {
                         res[pre + key] = val;
                    }
               }
               return res;
          };
          processOutput(flatten(parsedData));
     };

     const generateTypeScript = () => {
          if (!parsedData) return setError("Valid JSON required.");
          let interfaceStr = `export interface RootObject {\n`;
          const getType = (val: any): string => {
               if (Array.isArray(val)) return val.length ? `${getType(val[0])}[]` : 'any[]';
               if (val === null) return 'any';
               return typeof val;
          };
          if (typeof parsedData === 'object' && !Array.isArray(parsedData)) {
               for (const [key, val] of Object.entries(parsedData)) {
                    interfaceStr += `  ${key}: ${getType(val)};\n`;
               }
          } else {
               interfaceStr += ` // Root is an array or primitive \n`;
          }
          interfaceStr += `}`;
          setOutput(interfaceStr);
          setError(null);
     };

     const generateCSV = () => {
          if (!parsedData) return setError("Valid JSON required.");
          if (!Array.isArray(parsedData) || typeof parsedData[0] !== 'object') {
               return setError("CSV conversion requires an array of objects.");
          }
          const keys = Object.keys(parsedData[0]);
          const csvRows = [keys.join(',')];
          for (const row of parsedData) {
               const values = keys.map(k => {
                    const val = row[k] === null || row[k] === undefined ? '' : String(row[k]);
                    return val.includes(',') ? `"${val}"` : val;
               });
               csvRows.push(values.join(','));
          }
          setOutput(csvRows.join('\n'));
          setError(null);
     };

     const stats = useMemo(() => {
          if (!parsedData) return null;
          let keys = 0, strings = 0, numbers = 0, booleans = 0, nulls = 0, arrays = 0, objects = 0;
          let maxDepth = 0;

          const traverse = (obj: any, depth: number) => {
               maxDepth = Math.max(maxDepth, depth);
               if (obj === null) { nulls++; return; }
               if (typeof obj === 'string') { strings++; return; }
               if (typeof obj === 'number') { numbers++; return; }
               if (typeof obj === 'boolean') { booleans++; return; }
               if (Array.isArray(obj)) {
                    arrays++;
                    obj.forEach(item => traverse(item, depth + 1));
                    return;
               }
               if (typeof obj === 'object') {
                    objects++;
                    const objKeys = Object.keys(obj);
                    keys += objKeys.length;
                    objKeys.forEach(key => traverse(obj[key], depth + 1));
               }
          };
          traverse(parsedData, 0);
          return { keys, strings, numbers, booleans, nulls, arrays, objects, maxDepth };
     }, [parsedData]);


     useKeyboardShortcuts([
          { key: "enter", ctrlOrCmd: true, action: handleFormat },
          { key: "m", ctrlOrCmd: true, shift: true, action: handleMinify }
     ]);

     const navItems = [
          { id: "editor", label: "Editor", icon: Code },
          { id: "tree", label: "Tree View", icon: Network },
          { id: "analyze", label: "Analyze", icon: Activity },
          { id: "transform", label: "Transform", icon: Settings2 },
          { id: "generate", label: "Generate", icon: FileOutput }
     ] as const;

     return (
          <div className="w-full max-w-[90rem] mx-auto flex flex-col gap-6">
               {/* Header Area */}
               <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-4">
                         <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 shadow-sm shrink-0">
                              <FileJson size={28} />
                         </div>
                         <div>
                              <div className="flex items-center flex-wrap gap-2 md:gap-3">
                                   <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">JSON Developer Toolkit</h1>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                                        🟢 Local & Secure
                                   </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Format, validate, query, transform, and analyze JSON instantly in your browser.</p>
                         </div>
                    </div>
                    <div className="hidden lg:flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-400 shadow-sm">
                         <ShieldCheck size={18} className="text-emerald-500" />
                         <span>Zero Server Uploads</span>
                    </div>
               </div>

               <AdSlot adSlot="top-json-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               {/* Navigation Tabs - Scrollable on mobile */}
               <div className="flex overflow-x-auto custom-scrollbar gap-2 bg-gray-50/50 dark:bg-gray-900/50 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-800">
                    {navItems.map(item => {
                         const Icon = item.icon;
                         const isActive = activeTab === item.id;
                         return (
                              <button
                                   key={item.id}
                                   onClick={() => setActiveTab(item.id)}
                                   className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${isActive
                                             ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200 dark:border-gray-700"
                                             : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50 border border-transparent"
                                        }`}
                              >
                                   <Icon size={16} /> {item.label}
                              </button>
                         )
                    })}
               </div>

               {/* Sub-Toolbar based on Active Tab - Flex Wrap for mobile */}
               {activeTab === 'editor' && (
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-3 shadow-sm transition-colors">
                         <button onClick={handleFormat} className="flex-1 md:flex-none justify-center flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-xl transition-all shadow-md dark:shadow-blue-600/20 text-sm whitespace-nowrap">
                              <Maximize2 size={16} /> Beautify
                         </button>
                         <button onClick={handleMinify} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 transition-all text-sm whitespace-nowrap">
                              <Minimize2 size={16} /> Minify
                         </button>
                         <button onClick={handleRepair} className="flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 font-medium px-4 py-2 rounded-xl border border-amber-200 dark:border-amber-500/20 transition-all text-sm whitespace-nowrap">
                              <Wrench size={16} /> Auto-Repair
                         </button>

                         <div className="hidden md:block w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                         <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 px-1">
                              <span>Indent:</span>
                              <select
                                   value={indentSize}
                                   onChange={(e) => setIndentSize(Number(e.target.value))}
                                   className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 outline-none text-gray-900 dark:text-white"
                              >
                                   <option value={2}>2 Spaces</option>
                                   <option value={4}>4 Spaces</option>
                              </select>
                         </div>

                         <div className="hidden md:block flex-grow"></div>
                         <button onClick={handleClear} className="w-full md:w-auto mt-1 md:mt-0 justify-center flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-medium px-4 py-2 rounded-xl transition-all text-sm">
                              <Trash2 size={16} /> Clear All
                         </button>
                    </div>
               )}

               {activeTab === 'transform' && (
                    <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-3 shadow-sm transition-colors">
                         <button onClick={handleSortKeys} className="flex-1 md:flex-none justify-center flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 transition-all text-sm">
                              <ArrowRightLeft size={16} className="rotate-90" /> Sort Keys
                         </button>
                         <button onClick={handleFlatten} className="flex-1 md:flex-none justify-center flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 transition-all text-sm">
                              <Minimize2 size={16} /> Flatten JSON
                         </button>
                    </div>
               )}

               {activeTab === 'generate' && (
                    <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-3 shadow-sm transition-colors">
                         <button onClick={generateTypeScript} className="w-full md:w-auto justify-center flex items-center gap-2 bg-[#3178c6]/10 text-[#3178c6] hover:bg-[#3178c6]/20 font-bold px-4 py-2 rounded-xl border border-[#3178c6]/20 transition-all text-sm">
                              <Code size={16} /> Generate TypeScript
                         </button>
                         <button onClick={generateCSV} className="w-full md:w-auto justify-center flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 font-bold px-4 py-2 rounded-xl border border-emerald-200 dark:border-emerald-500/20 transition-all text-sm">
                              <FileOutput size={16} /> Convert to CSV
                         </button>
                    </div>
               )}

               {/* Error Banner */}
               {error && (
                    <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl p-4 flex items-start gap-3 text-rose-700 dark:text-rose-400 animate-in fade-in slide-in-from-top-2">
                         <AlertCircle size={20} className="mt-0.5 shrink-0" />
                         <div className="font-mono text-sm leading-relaxed">{error}</div>
                    </div>
               )}

               {/* Main Workspace Layout - Responsive Heights applied here */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-[600px]">

                    {/* Left Panel: Always Input */}
                    <div className="flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm transition-colors min-h-[400px] lg:min-h-0">
                         <div className="px-4 md:px-5 py-3.5 bg-gray-50 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-mono font-bold uppercase tracking-widest">Input.json</span>
                              {parsedData && <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold"><Check size={14} /> Valid</span>}
                         </div>
                         <textarea
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              placeholder="Paste your unformatted JSON here..."
                              className="flex-grow w-full bg-transparent text-gray-900 dark:text-gray-200 font-mono text-sm p-4 md:p-5 outline-none resize-none placeholder:text-gray-400 dark:placeholder:text-gray-600 leading-relaxed custom-scrollbar"
                              spellCheck="false"
                         />
                    </div>

                    {/* Right Panel: Contextual based on tab */}
                    <div className="flex flex-col bg-gray-50 dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm relative transition-colors min-h-[400px] lg:min-h-0">
                         <div className="px-4 md:px-5 py-3.5 bg-white dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-mono font-bold uppercase tracking-widest">
                                   {activeTab === 'tree' ? 'Interactive Tree' : activeTab === 'analyze' ? 'Analysis' : 'Output Data'}
                              </span>
                              {activeTab !== 'analyze' && activeTab !== 'tree' && (
                                   <button onClick={() => copy(output)} disabled={!output} className={`flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg transition-colors font-bold ${output ? "bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200" : "bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-600 cursor-not-allowed"}`}>
                                        {isCopied ? <Check size={14} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={14} />}
                                        {isCopied ? "Copied!" : "Copy"}
                                   </button>
                              )}
                         </div>

                         <div className="flex-grow w-full p-4 md:p-5 overflow-auto custom-scrollbar text-sm font-mono leading-relaxed">

                              {(activeTab === 'editor' || activeTab === 'transform' || activeTab === 'generate') && (
                                   <textarea
                                        readOnly
                                        value={output}
                                        placeholder="Result will appear here..."
                                        className="w-full h-full bg-transparent text-emerald-600 dark:text-emerald-400 outline-none resize-none placeholder:text-gray-400 dark:placeholder:text-gray-700"
                                        spellCheck="false"
                                   />
                              )}

                              {activeTab === 'tree' && (
                                   <div className="w-full h-full">
                                        {!parsedData ? (
                                             <p className="text-gray-400 dark:text-gray-600 text-center mt-10">Valid JSON required for tree view.</p>
                                        ) : (
                                             <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-inner overflow-auto h-full">
                                                  <JsonNode label={null} value={parsedData} isLast={true} />
                                             </div>
                                        )}
                                   </div>
                              )}

                              {activeTab === 'analyze' && (
                                   <div className="w-full h-full flex flex-col gap-6">
                                        {!parsedData ? (
                                             <p className="text-gray-400 dark:text-gray-600 text-center mt-10">Valid JSON required for analysis.</p>
                                        ) : (
                                             <>
                                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                       <StatCard label="Total Keys" value={stats?.keys} />
                                                       <StatCard label="Max Depth" value={stats?.maxDepth} />
                                                       <StatCard label="Arrays" value={stats?.arrays} />
                                                       <StatCard label="Objects" value={stats?.objects} />
                                                       <StatCard label="Strings" value={stats?.strings} />
                                                       <StatCard label="Numbers" value={stats?.numbers} />
                                                       <StatCard label="Booleans" value={stats?.booleans} />
                                                       <StatCard label="Null Values" value={stats?.nulls} />
                                                  </div>

                                                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 mt-2">
                                                       <h3 className="text-gray-900 dark:text-white font-bold mb-3 font-sans flex items-center gap-2"><Search size={16} /> Path Query</h3>
                                                       <input
                                                            type="text"
                                                            placeholder="e.g. users[0].name"
                                                            value={searchQuery}
                                                            onChange={(e) => setSearchQuery(e.target.value)}
                                                            className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-200 outline-none focus:border-blue-500 mb-3"
                                                       />
                                                       <div className="bg-gray-100 dark:bg-[#080d16] p-3 rounded-lg min-h-[100px] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-emerald-400">
                                                            {searchQuery ? executePathQuery(parsedData, searchQuery) : <span className="text-gray-400 italic">Enter a path to query data...</span>}
                                                       </div>
                                                  </div>
                                             </>
                                        )}
                                   </div>
                              )}
                         </div>
                    </div>
               </div>

               {/* ========================================= */}
               {/* HOW TO USE SECTION */}
               {/* ========================================= */}
               <div className="mt-8 bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-8">How to use this tool</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
                         {/* Step 1 */}
                         <div className="relative">
                              <div className="text-5xl font-black text-blue-500/10 dark:text-blue-500/10 absolute -top-5 -left-3 z-0 select-none">1</div>
                              <div className="relative z-10">
                                   <h3 className="text-md font-bold text-gray-900 dark:text-white mb-2">Paste Your Raw JSON</h3>
                                   <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Drop your unformatted API response or raw string into the left Input panel. Errors are instantly highlighted locally.</p>
                              </div>
                         </div>
                         {/* Step 2 */}
                         <div className="relative">
                              <div className="text-5xl font-black text-blue-500/10 dark:text-blue-500/10 absolute -top-5 -left-3 z-0 select-none">2</div>
                              <div className="relative z-10">
                                   <h3 className="text-md font-bold text-gray-900 dark:text-white mb-2">Select a Workspace</h3>
                                   <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Navigate the top menu based on your task: choose <strong>Editor</strong> to beautify, <strong>Tree View</strong> to explore visually, or <strong>Analyze</strong> for stats.</p>
                              </div>
                         </div>
                         {/* Step 3 */}
                         <div className="relative">
                              <div className="text-5xl font-black text-blue-500/10 dark:text-blue-500/10 absolute -top-5 -left-3 z-0 select-none">3</div>
                              <div className="relative z-10">
                                   <h3 className="text-md font-bold text-gray-900 dark:text-white mb-2">Apply Transformations</h3>
                                   <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Switch to the <strong>Transform</strong> tab to flatten and sort keys, or the <strong>Generate</strong> tab to convert payloads to TypeScript or CSV.</p>
                              </div>
                         </div>
                         {/* Step 4 */}
                         <div className="relative">
                              <div className="text-5xl font-black text-blue-500/10 dark:text-blue-500/10 absolute -top-5 -left-3 z-0 select-none">4</div>
                              <div className="relative z-10">
                                   <h3 className="text-md font-bold text-gray-900 dark:text-white mb-2">Copy the Output</h3>
                                   <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Once your data is successfully formatted, repaired, or converted, click the <strong>Copy</strong> button at the top right of the output panel.</p>
                              </div>
                         </div>
                    </div>
               </div>

               {/* ========================================= */}
               {/* SEO CONTENT & FAQS */}
               {/* ========================================= */}
               <div className="bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm">
                    <div className="prose dark:prose-invert max-w-none font-sans">
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Complete JSON Developer Toolkit</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              Working with raw JSON data from APIs or databases can be tedious. ToolLok's free <strong>JSON Developer Toolkit</strong> provides a comprehensive suite of utilities designed to parse, indent, analyze, and convert your data seamlessly. Operating entirely within your local browser memory, our tool ensures your sensitive configuration files and API responses are never uploaded to external servers, making it an essential utility in any software engineer's <Link href="/categories/developer-tools" className="text-blue-600 dark:text-blue-400 hover:underline">Developer Tools</Link> stack.
                         </p>

                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                              <div className="bg-gray-50 dark:bg-gray-950 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
                                   <h3 className="text-md font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2"><Maximize2 size={16} className="text-blue-500" /> Format & Repair</h3>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Instantly beautify, minify, and catch syntax errors. Automatically repair missing quotes or trailing commas in malformed JSON arrays.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
                                   <h3 className="text-md font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2"><Settings2 size={16} className="text-amber-500" /> Transform Data</h3>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Sort complex payloads alphabetically by key, or flatten deeply nested JSON object graphs into single-level dot-notation structures.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
                                   <h3 className="text-md font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2"><FileOutput size={16} className="text-emerald-500" /> Export & Convert</h3>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Instantly generate TypeScript interfaces from your API responses, or convert flat JSON arrays into standardized CSV formats.</p>
                              </div>
                         </div>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Is my JSON data sent to a server?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">No. Unlike many online formatters, the ToolLok JSON toolkit operates 100% client-side via JavaScript. Your code is processed entirely within your local browser instance, guaranteeing strict data privacy.</p>
                              </div>
                              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">How does the "Auto-Repair" function work?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">The repair utility uses regular expressions to catch and fix common syntax errors made by humans, such as trailing commas at the end of objects, unquoted keys, or single-quoted strings that violate the strict JSON standard.</p>
                              </div>
                         </div>
                    </div>

                    <script
                         type="application/ld+json"
                         dangerouslySetInnerHTML={{
                              __html: JSON.stringify({
                                   "@context": "https://schema.org",
                                   "@type": "SoftwareApplication",
                                   "name": "JSON Developer Toolkit",
                                   "operatingSystem": "Any",
                                   "applicationCategory": "DeveloperApplication",
                                   "description": "A comprehensive, client-side JSON toolkit for formatting, minifying, analyzing, tree-viewing, and converting JSON to TypeScript and CSV.",
                                   "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-json-ad" format="fluid" className="mt-4" />
          </div>
     );
}

// Sub-component for Analysis Cards
function StatCard({ label, value }: { label: string, value: number | string | undefined }) {
     return (
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
               <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{label}</span>
               <span className="text-xl font-bold text-gray-900 dark:text-white">{value ?? 0}</span>
          </div>
     );
}

// Basic Path Query Executor
function executePathQuery(data: any, path: string) {
     try {
          const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
          let current = data;
          for (const part of parts) {
               if (current === undefined || current === null) return "undefined";
               current = current[part];
          }
          return JSON.stringify(current, null, 2);
     } catch {
          return "Invalid Path";
     }
}