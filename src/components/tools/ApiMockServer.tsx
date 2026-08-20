"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Server, Play, Copy, Check, Plus, Trash2, ShieldCheck, RefreshCw, Terminal, Sliders, FileCode, Layers } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import AdSlot from "@/components/ui/AdSlot";

interface HeaderItem { id: string; key: string; value: string; }
interface MockEndpoint {
     id: string; method: "GET" | "POST"; path: string; statusCode: number;
     latency: number; schemaType: "users" | "transactions" | "custom"; customPayload: string; headers: HeaderItem[];
}

const PRESET_SCHEMAS = {
     users: JSON.stringify([{ id: 1, name: "Aarav Sharma", email: "aarav@example.com", role: "Admin", active: true }, { id: 2, name: "Priya Patel", email: "priya@example.com", role: "Developer", active: true }], null, 2),
     transactions: JSON.stringify([{ txId: "TXN-98421", amount: 4500.00, currency: "INR", status: "SUCCESS", timestamp: "2026-06-01T10:30:00Z" }], null, 2),
     custom: JSON.stringify({ message: "Mock endpoint executed successfully", timestamp: new Date().toISOString() }, null, 2)
};

export default function ApiMockServer() {
     const [endpoints, setEndpoints] = useState<MockEndpoint[]>([
          { id: "1", method: "GET", path: "/api/v1/users/:id", statusCode: 200, latency: 200, schemaType: "users", customPayload: PRESET_SCHEMAS.users, headers: [{ id: "h1", key: "Access-Control-Allow-Origin", value: "*" }] },
          { id: "2", method: "POST", path: "/api/v1/orders", statusCode: 201, latency: 350, schemaType: "transactions", customPayload: PRESET_SCHEMAS.transactions, headers: [{ id: "h2", key: "Content-Type", value: "application/json" }] }
     ]);

     const [selectedEndpointId, setSelectedEndpointId] = useState<string>("1");
     const [activeTab, setActiveTab] = useState<"sandbox" | "express" | "msw">("sandbox");
     const [testRequestPath, setTestRequestPath] = useState<string>("/api/v1/users/42");
     const [testResult, setTestResult] = useState<string>("");
     const [isTesting, setIsTesting] = useState<boolean>(false);

     const { isCopied, copy } = useCopyToClipboard(2000);
     const activeEndpoint = endpoints.find(e => e.id === selectedEndpointId) || endpoints[0];

     const addEndpoint = () => {
          const newEp: MockEndpoint = {
               id: Math.random().toString(), method: "GET", path: `/api/v1/resource-${endpoints.length + 1}`, statusCode: 200, latency: 150, schemaType: "custom", customPayload: PRESET_SCHEMAS.custom, headers: [{ id: Math.random().toString(), key: "X-Powered-By", value: "ToolLok-MockEngine" }]
          };
          setEndpoints([...endpoints, newEp]);
          setSelectedEndpointId(newEp.id);
     };

     const removeEndpoint = (id: string) => {
          if (endpoints.length <= 1) return;
          const remaining = endpoints.filter(e => e.id !== id);
          setEndpoints(remaining);
          setSelectedEndpointId(remaining[0].id);
     };

     const updateEndpoint = (field: keyof MockEndpoint, value: any) => { setEndpoints(endpoints.map(e => e.id === activeEndpoint.id ? { ...e, [field]: value } : e)); };
     const handleSchemaChange = (schemaType: "users" | "transactions" | "custom") => { setEndpoints(endpoints.map(e => e.id === activeEndpoint.id ? { ...e, schemaType, customPayload: PRESET_SCHEMAS[schemaType] } : e)); };
     const addHeader = () => { updateEndpoint("headers", [...activeEndpoint.headers, { id: Math.random().toString(), key: "X-Custom-Header", value: "value" }]); };
     const removeHeader = (headerId: string) => { updateEndpoint("headers", activeEndpoint.headers.filter(h => h.id !== headerId)); };
     const updateHeader = (headerId: string, field: "key" | "value", val: string) => { updateEndpoint("headers", activeEndpoint.headers.map(h => h.id === headerId ? { ...h, [field]: val } : h)); };

     const runSandboxTest = () => {
          setIsTesting(true);
          setTestResult("Executing request through mock pipeline...");
          setTimeout(() => {
               try {
                    const routeSegments = activeEndpoint.path.split("/");
                    const testSegments = testRequestPath.split("/");
                    const extractedParams: Record<string, string> = {};
                    routeSegments.forEach((seg, idx) => { if (seg.startsWith(":")) extractedParams[seg.slice(1)] = testSegments[idx] || "unknown"; });
                    let parsedData;
                    try { parsedData = JSON.parse(activeEndpoint.customPayload); } catch { parsedData = { raw: activeEndpoint.customPayload }; }
                    setTestResult(JSON.stringify({
                         status: activeEndpoint.statusCode, success: activeEndpoint.statusCode < 400, simulatedLatencyMs: activeEndpoint.latency,
                         extractedParams: Object.keys(extractedParams).length > 0 ? extractedParams : undefined,
                         headers: activeEndpoint.headers.reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {}), data: parsedData
                    }, null, 2));
               } catch (err: any) { setTestResult(JSON.stringify({ error: err.message }, null, 2)); }
               setIsTesting(false);
          }, Math.min(activeEndpoint.latency, 800));
     };

     const expressCode = useMemo(() => {
          let code = `const express = require('express');\nconst app = express();\napp.use(express.json());\n\n`;
          endpoints.forEach(ep => {
               code += `// Mock Endpoint: ${ep.method} ${ep.path}\napp.${ep.method.toLowerCase()}('${ep.path}', (req, res) => {\n`;
               ep.headers.forEach(h => { code += `  res.setHeader('${h.key}', '${h.value}');\n`; });
               code += `  setTimeout(() => {\n    res.status(${ep.statusCode}).json(${ep.customPayload});\n  }, ${ep.latency});\n});\n\n`;
          });
          code += `const PORT = process.env.PORT || 3000;\napp.listen(PORT, () => {\n  console.log(\`ToolLok Mock Server running on port \${PORT}\`);\n});`;
          return code;
     }, [endpoints]);

     const mswCode = useMemo(() => {
          let code = `import { http, HttpResponse } from 'msw';\n\nexport const handlers = [\n`;
          endpoints.forEach(ep => {
               code += `  // ${ep.method} ${ep.path}\n  http.${ep.method.toLowerCase()}('${ep.path}', async () => {\n    await new Promise(resolve => setTimeout(resolve, ${ep.latency}));\n    return HttpResponse.json(${ep.customPayload}, {\n      status: ${ep.statusCode},\n`;
               if (ep.headers.length > 0) {
                    code += `      headers: {\n`;
                    ep.headers.forEach(h => { code += `        '${h.key}': '${h.value}',\n`; });
                    code += `      }\n`;
               }
               code += `    });\n  },\n\n`;
          });
          return code += `];`;
     }, [endpoints]);

     useKeyboardShortcuts([{ key: "enter", ctrlOrCmd: true, action: runSandboxTest }]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
               <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-500/20">
                              <Server size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">API Mock Server & Synthetic Data Generator</h2>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Design mock REST endpoints, dynamic parameters, headers, and export Express/MSW servers.</p>
                         </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 shadow-sm dark:shadow-none">
                         <ShieldCheck size={16} />
                         <span>Advanced Developer Sandbox</span>
                    </div>
               </div>

               <AdSlot adSlot="top-mockserver-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-6 flex flex-col gap-6">
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl">
                              <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-800/60 pb-3">
                                   <h3 className="text-gray-900 dark:text-white font-bold text-base flex items-center gap-2">
                                        <Terminal size={16} className="text-cyan-600 dark:text-cyan-400" /> Mock Endpoints ({endpoints.length})
                                   </h3>
                                   <button onClick={addEndpoint} className="flex items-center gap-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-3 py-1.5 rounded-lg transition-all shadow-md shadow-cyan-600/20">
                                        <Plus size={14} /> Add Route
                                   </button>
                              </div>
                              <div className="space-y-2 mb-6 max-h-44 overflow-y-auto custom-scrollbar pr-1">
                                   {endpoints.map((ep) => (
                                        <div key={ep.id} onClick={() => setSelectedEndpointId(ep.id)} className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${selectedEndpointId === ep.id ? "bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-500/50 text-gray-900 dark:text-white shadow-sm" : "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700"}`}>
                                             <div className="flex items-center gap-3 overflow-hidden">
                                                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${ep.method === 'GET' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'}`}>
                                                       {ep.method}
                                                  </span>
                                                  <span className="text-xs font-mono truncate">{ep.path}</span>
                                             </div>
                                             {endpoints.length > 1 && (
                                                  <button onClick={(e) => { e.stopPropagation(); removeEndpoint(ep.id); }} className="text-gray-400 dark:text-gray-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-1"><Trash2 size={14} /></button>
                                             )}
                                        </div>
                                   ))}
                              </div>

                              {activeEndpoint && (
                                   <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col gap-4">
                                        <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">Route Configuration</span>
                                        <div className="grid grid-cols-2 gap-3">
                                             <div>
                                                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Method</label>
                                                  <select value={activeEndpoint.method} onChange={(e) => updateEndpoint("method", e.target.value)} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-cyan-500">
                                                       <option value="GET">GET</option>
                                                       <option value="POST">POST</option>
                                                  </select>
                                             </div>
                                             <div>
                                                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Status Code</label>
                                                  <select value={activeEndpoint.statusCode} onChange={(e) => updateEndpoint("statusCode", Number(e.target.value))} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 outline-none focus:border-cyan-500">
                                                       <option value={200}>200 OK</option>
                                                       <option value={201}>201 Created</option>
                                                       <option value={400}>400 Bad Request</option>
                                                       <option value={401}>401 Unauthorized</option>
                                                       <option value={500}>500 Server Error</option>
                                                  </select>
                                             </div>
                                        </div>
                                        <div>
                                             <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Route Path (Supports Dynamic Params e.g. <span className="text-cyan-600 dark:text-cyan-400">:id</span>)</label>
                                             <input type="text" value={activeEndpoint.path} onChange={(e) => updateEndpoint("path", e.target.value)} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white font-mono outline-none focus:border-cyan-500" />
                                        </div>
                                        <div>
                                             <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase mb-1">
                                                  <span>Simulated Latency</span>
                                                  <span className="text-cyan-600 dark:text-cyan-400">{activeEndpoint.latency}ms</span>
                                             </div>
                                             <input type="range" min="0" max="2000" step="50" value={activeEndpoint.latency} onChange={(e) => updateEndpoint("latency", Number(e.target.value))} className="w-full accent-cyan-500 cursor-pointer" />
                                        </div>

                                        <div className="flex flex-col gap-2 pt-2 border-t border-gray-200 dark:border-gray-900">
                                             <div className="flex items-center justify-between">
                                                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Response Headers & CORS</span>
                                                  <button onClick={addHeader} className="text-[10px] text-cyan-600 dark:text-cyan-400 hover:underline font-bold">+ Add Header</button>
                                             </div>
                                             {activeEndpoint.headers.map((h) => (
                                                  <div key={h.id} className="flex items-center gap-2">
                                                       <input type="text" value={h.key} onChange={(e) => updateHeader(h.id, "key", e.target.value)} placeholder="Header key" className="w-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-1 text-[11px] font-mono text-gray-700 dark:text-gray-300 outline-none focus:border-cyan-500" />
                                                       <input type="text" value={h.value} onChange={(e) => updateHeader(h.id, "value", e.target.value)} placeholder="Header value" className="w-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-1 text-[11px] font-mono text-gray-700 dark:text-gray-300 outline-none focus:border-cyan-500" />
                                                       <button onClick={() => removeHeader(h.id)} className="text-gray-400 dark:text-gray-600 hover:text-rose-500 dark:hover:text-rose-400"><Trash2 size={12} /></button>
                                                  </div>
                                             ))}
                                        </div>
                                        <div className="flex flex-col gap-2 pt-2 border-t border-gray-200 dark:border-gray-900">
                                             <div className="flex items-center justify-between">
                                                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Synthetic JSON Payload</span>
                                                  <div className="flex gap-2 text-[10px]">
                                                       <button onClick={() => handleSchemaChange("users")} className={`hover:text-gray-900 dark:hover:text-white ${activeEndpoint.schemaType === 'users' ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-gray-500'}`}>Users</button>
                                                       <button onClick={() => handleSchemaChange("transactions")} className={`hover:text-gray-900 dark:hover:text-white ${activeEndpoint.schemaType === 'transactions' ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-gray-500'}`}>Txns</button>
                                                       <button onClick={() => handleSchemaChange("custom")} className={`hover:text-gray-900 dark:hover:text-white ${activeEndpoint.schemaType === 'custom' ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-gray-500'}`}>Custom</button>
                                                  </div>
                                             </div>
                                             <textarea value={activeEndpoint.customPayload} onChange={(e) => updateEndpoint("customPayload", e.target.value)} rows={5} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 font-mono text-xs text-emerald-600 dark:text-emerald-400 outline-none resize-none focus:border-cyan-500" spellCheck="false" />
                                        </div>
                                   </div>
                              )}
                         </div>
                    </div>

                    <div className="lg:col-span-6 flex flex-col gap-6">
                         <div className="bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl min-h-[550px] flex flex-col">
                              <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800/60 pb-3">
                                   <div className="flex items-center gap-1.5 overflow-x-auto">
                                        <button onClick={() => setActiveTab("sandbox")} className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "sandbox" ? "bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30 shadow-sm dark:shadow-none" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>Live Sandbox</button>
                                        <button onClick={() => setActiveTab("express")} className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "express" ? "bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30 shadow-sm dark:shadow-none" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>Express.js</button>
                                        <button onClick={() => setActiveTab("msw")} className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "msw" ? "bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30 shadow-sm dark:shadow-none" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>MSW Handlers</button>
                                   </div>
                                   <button onClick={() => copy(activeTab === "sandbox" ? testResult : activeTab === "express" ? expressCode : mswCode)} className="flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-3.5 py-1.5 rounded-lg transition-colors font-bold shrink-0">
                                        {isCopied ? <Check size={14} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={14} />} {isCopied ? "Copied!" : "Copy"}
                                   </button>
                              </div>

                              {activeTab === "sandbox" ? (
                                   <div className="flex flex-col flex-grow gap-4">
                                        <div className="flex flex-col gap-2 bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
                                             <label className="text-[10px] text-gray-500 font-bold uppercase">Test Request URL (Simulating Dynamic Parameters)</label>
                                             <div className="flex items-center gap-2">
                                                  <span className={`px-2 py-1 rounded text-[10px] font-mono font-bold ${activeEndpoint.method === 'GET' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'}`}>
                                                       {activeEndpoint.method}
                                                  </span>
                                                  <input type="text" value={testRequestPath} onChange={(e) => setTestRequestPath(e.target.value)} className="flex-grow bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-mono text-gray-900 dark:text-white outline-none focus:border-cyan-500" />
                                                  <button onClick={runSandboxTest} disabled={isTesting} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md dark:shadow-lg dark:shadow-cyan-600/20 shrink-0">
                                                       {isTesting ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />} {isTesting ? "Running..." : "Send"}
                                                  </button>
                                             </div>
                                        </div>
                                        <div className="flex-grow bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-y-auto max-h-[360px]">
                                             {testResult ? <pre className="whitespace-pre-wrap">{testResult}</pre> : (
                                                  <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-600">
                                                       <Play size={32} className="mb-2 opacity-40" />
                                                       <span className="text-center">Click "Send" to test the mock response with extracted route params and custom headers.</span>
                                                  </div>
                                             )}
                                        </div>
                                   </div>
                              ) : activeTab === "express" ? (
                                   <div className="flex flex-col flex-grow">
                                        <pre className="flex-grow bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 font-mono text-xs text-cyan-700 dark:text-cyan-300 overflow-y-auto max-h-[440px] whitespace-pre-wrap leading-relaxed">{expressCode}</pre>
                                   </div>
                              ) : (
                                   <div className="flex flex-col flex-grow">
                                        <pre className="flex-grow bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 font-mono text-xs text-purple-700 dark:text-purple-300 overflow-y-auto max-h-[440px] whitespace-pre-wrap leading-relaxed">{mswCode}</pre>
                                   </div>
                              )}
                         </div>
                    </div>
               </div>

               <AdSlot adSlot="bottom-mockserver-ad" format="fluid" className="mt-4" />

               {/* ========================================= */}
               {/* SEO CONTENT & FAQS */}
               {/* ========================================= */}
               <div className="mt-12 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm dark:shadow-none">
                    <div className="prose dark:prose-invert max-w-none">
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Accelerate Development with a Free API Mock Server</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              Frontend developers shouldn't have to wait for backend teams to finish building APIs. ToolLok's <strong>API Mock Server & Synthetic Data Generator</strong> lets you design custom REST endpoints directly in your browser. Configure HTTP status codes, inject simulated network latency, and test dynamic payloads instantly. Pair this with our <Link href="/categories/developer-tools" className="text-cyan-600 dark:text-cyan-400 hover:underline">Developer Tools</Link> like the JSON Validator for a complete frontend workflow.
                         </p>
                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Why Use a Mock Server?</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Unblock UI Development:</strong> Build interfaces against stable, predictable JSON payloads before the real API exists.</li>
                              <li><strong>Simulate Edge Cases:</strong> Force 500 Server Errors, 401 Unauthorized codes, or high latency (TTFB) to test your app's error-handling UI.</li>
                              <li><strong>One-Click Export:</strong> Export your mocked routes directly to production-ready Express.js or MSW (Mock Service Worker) code.</li>
                         </ul>
                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">What is MSW (Mock Service Worker)?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">MSW is an API mocking library that intercepts network requests at the Service Worker level. It allows you to mock REST and GraphQL APIs seamlessly without altering your application code.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">How do I test CORS errors?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Using our Response Headers simulator, you can intentionally remove or misconfigure the 'Access-Control-Allow-Origin' header to trigger a CORS error in your frontend application for testing.</p>
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
                                             "name": "What is MSW (Mock Service Worker)?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "MSW is an API mocking library that intercepts network requests at the Service Worker level, allowing seamless REST mocking without altering application code." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "How do I test CORS errors?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Using our Response Headers simulator, you can intentionally misconfigure the Access-Control-Allow-Origin header to trigger a CORS error for testing." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>
          </div>
     );
}