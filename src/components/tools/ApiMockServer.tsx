"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import {
     Server, Play, Copy, Check, Plus, Trash2, ShieldCheck, RefreshCw, Terminal,
     Sliders, FileCode, Layers, Download, Upload, Clock, AlertTriangle, ListFilter,
     History, Settings, Code, Key, Zap, Database, Braces, FileJson, CheckCircle2, XCircle
} from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import AdSlot from "@/components/ui/AdSlot";

// --- TYPES & INTERFACES ---
interface HeaderItem { id: string; key: string; value: string; }
interface Condition {
     id: string; target: "query" | "header" | "body" | "path"; key: string;
     operator: "equals" | "contains" | "exists" | "regex"; value: string;
     returnStatus: number; returnPayload: string;
}
interface MockEndpoint {
     id: string; method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "GRAPHQL";
     path: string; statusCode: number; latency: number; schemaType: string;
     customPayload: string; headers: HeaderItem[]; conditions: Condition[];
     authRequired: "none" | "bearer" | "apikey" | "basic";
     errorRate?: number; // percentage 0-100
}
interface RequestContext { path: Record<string, string>; query: Record<string, string>; header: Record<string, string>; body: any; }
interface RequestHistory { id: string; timestamp: number; method: string; url: string; status: number; latency: number; response: any; requestContext: RequestContext; matchedRouteId?: string; }
type Scenario = "normal" | "error_500" | "slow_network" | "unauthorized";

// --- SYNTHETIC DATA PRESETS (Personalized Context Injected Invisibly) ---
const MOCK_NAMES = ["Aarav Sharma", "Priya Patel", "Vikram Singh", "Neha Gupta", "Rohan Desai"];
const MOCK_COMPANIES = ["CodeMines Technologies", "Alpha Trading Solutions", "PharmaLife Inc", "DerivatesTech", "Global Logistics"];

const getDynamicHelper = (helper: string, context?: RequestContext): string => {
     if (helper.includes(".")) {
          const [scope, key] = helper.split(".");
          if (context && (context as any)[scope]) return (context as any)[scope][key] || `{{${helper}}}`;
     }
     const helpers: Record<string, () => string> = {
          uuid: () => crypto.randomUUID(),
          id: () => Math.floor(Math.random() * 100000).toString(),
          name: () => MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)],
          company: () => MOCK_COMPANIES[Math.floor(Math.random() * MOCK_COMPANIES.length)],
          email: () => `user${Math.floor(Math.random() * 999)}@example.com`,
          date: () => new Date().toISOString().split('T')[0],
          timestamp: () => Date.now().toString(),
          randomNumber: () => Math.floor(Math.random() * 10000).toString(),
          boolean: () => (Math.random() > 0.5).toString()
     };
     return helpers[helper] ? helpers[helper]() : `{{${helper}}}`;
};

const interpolatePayload = (payload: string, context?: RequestContext): any => {
     const processed = payload.replace(/\{\{([^}]+)\}\}/g, (_, p1) => getDynamicHelper(p1, context));
     try { return JSON.parse(processed); } catch { return processed; }
};

const PRESET_SCHEMAS: Record<string, any> = {
     users: [{ id: "{{id}}", name: "{{name}}", email: "{{email}}", role: "Developer", active: "{{boolean}}", createdAt: "{{date}}" }],
     transactions: [{ txId: "{{uuid}}", amount: 4500.00, currency: "INR", status: "SUCCESS", type: "EQUITY_DERIVATIVE", timestamp: "{{timestamp}}" }],
     pharma_inventory: [{ sku: "MED-{{id}}", productName: "Amoxicillin 500mg", batchNumber: "{{uuid}}", stockLevel: "{{randomNumber}}", supplier: "{{company}}" }],
     graphql: { data: { user: { id: "{{id}}", name: "{{name}}", channel: "CodeMines" } } },
     custom: { message: "Mock endpoint executed successfully", transactionId: "{{uuid}}", requestedId: "{{path.id}}" }
};

// --- MINIATURE YAML PARSER FOR OPENAPI ---
const simpleYamlToJson = (yamlString: string) => {
     // A very basic fallback parser for structural OpenAPI YAML imports without external dependencies.
     const lines = yamlString.split('\n');
     const result: any = {};
     const stack: { indent: number, obj: any, key: string | null }[] = [{ indent: -1, obj: result, key: null }];

     lines.forEach(line => {
          if (line.trim().startsWith('#') || !line.trim()) return;
          const match = line.match(/^(\s*)(?:-\s+)?([^:]+):\s*(.*)$/);
          if (match) {
               const indent = match[1].length;
               const key = match[2].trim();
               let value: any = match[3].trim();
               if (value === '') value = {};
               else if (value === 'true') value = true;
               else if (value === 'false') value = false;
               else if (!isNaN(Number(value))) value = Number(value);

               while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
               const parent = stack[stack.length - 1].obj;
               parent[key] = value;
               if (typeof value === 'object') stack.push({ indent, obj: value, key });
          }
     });
     return result;
};

export default function ApiMockServer() {
     // --- STATE ---
     const [endpoints, setEndpoints] = useState<MockEndpoint[]>([
          { id: "1", method: "GET", path: "/api/v1/users/:id", statusCode: 200, latency: 150, schemaType: "users", customPayload: JSON.stringify(PRESET_SCHEMAS.users, null, 2), headers: [{ id: "h1", key: "Access-Control-Allow-Origin", value: "*" }], conditions: [], authRequired: "none", errorRate: 0 },
          { id: "2", method: "POST", path: "/api/v1/trades/derivatives", statusCode: 201, latency: 300, schemaType: "transactions", customPayload: JSON.stringify(PRESET_SCHEMAS.transactions, null, 2), headers: [{ id: "h2", key: "Content-Type", value: "application/json" }], conditions: [{ id: "c1", target: "body", key: "amount", operator: "exists", value: "", returnStatus: 200, returnPayload: '{"status":"ACCEPTED"}' }], authRequired: "bearer", errorRate: 0 }
     ]);
     const [selectedEndpointId, setSelectedEndpointId] = useState<string>("1");
     const [activeTab, setActiveTab] = useState<"config" | "rules" | "sandbox" | "history" | "datagen" | "codegen" | "schema">("config");
     const [globalScenario, setGlobalScenario] = useState<Scenario>("normal");

     // Sandbox State
     const [testMethod, setTestMethod] = useState<string>("GET");
     const [testRequestPath, setTestRequestPath] = useState<string>("/api/v1/users/42");
     const [testHeaders, setTestHeaders] = useState<string>('{\n  "Authorization": "Bearer test-token"\n}');
     const [testBody, setTestBody] = useState<string>("");
     const [testResult, setTestResult] = useState<any>(null);
     const [isTesting, setIsTesting] = useState<boolean>(false);
     const [history, setHistory] = useState<RequestHistory[]>([]);

     // Data Gen & Utilities
     const [genCount, setGenCount] = useState<number>(10);
     const [genSchema, setGenSchema] = useState<string>("users");
     const [genResult, setGenResult] = useState<string>("");
     const [jsonValidationResult, setJsonValidationResult] = useState<{ valid: boolean, message: string } | null>(null);

     const { isCopied, copy } = useCopyToClipboard(2000);
     const fileInputRef = useRef<HTMLInputElement>(null);
     const activeEndpoint = endpoints.find(e => e.id === selectedEndpointId) || endpoints[0];

     // --- CRUD ENDPOINTS ---
     const addEndpoint = () => {
          const newEp: MockEndpoint = {
               id: crypto.randomUUID(), method: "GET", path: `/api/v1/resource-${endpoints.length + 1}`, statusCode: 200, latency: 150, schemaType: "custom", customPayload: JSON.stringify(PRESET_SCHEMAS.custom, null, 2), headers: [{ id: crypto.randomUUID(), key: "Content-Type", value: "application/json" }], conditions: [], authRequired: "none", errorRate: 0
          };
          setEndpoints([...endpoints, newEp]);
          setSelectedEndpointId(newEp.id);
          setActiveTab("config");
     };

     const removeEndpoint = (id: string) => {
          if (endpoints.length <= 1) return;
          const remaining = endpoints.filter(e => e.id !== id);
          setEndpoints(remaining);
          setSelectedEndpointId(remaining[0].id);
     };

     const updateEndpoint = (field: keyof MockEndpoint, value: any) => { setEndpoints(endpoints.map(e => e.id === activeEndpoint.id ? { ...e, [field]: value } : e)); };

     const handleSchemaChange = (schemaType: string) => {
          updateEndpoint("schemaType", schemaType);
          updateEndpoint("customPayload", JSON.stringify(PRESET_SCHEMAS[schemaType] || PRESET_SCHEMAS.custom, null, 2));
     };

     const formatJsonPayload = () => {
          try {
               const formatted = JSON.stringify(JSON.parse(activeEndpoint.customPayload), null, 2);
               updateEndpoint("customPayload", formatted);
               setJsonValidationResult({ valid: true, message: "Valid JSON formatted successfully." });
          } catch (e: any) {
               setJsonValidationResult({ valid: false, message: `Invalid JSON: ${e.message}` });
          }
     };

     // --- OPENAPI IMPORT/EXPORT ---
     const exportOpenAPI = () => {
          const spec = {
               openapi: "3.0.0", info: { title: "ToolLok Mock API Sandbox", version: "1.0.0" },
               paths: endpoints.reduce((acc, ep) => {
                    const pathParts = ep.path.split("?")[0].replace(/:([a-zA-Z0-9_]+)/g, "{$1}");
                    if (!acc[pathParts]) acc[pathParts] = {};
                    acc[pathParts][ep.method.toLowerCase()] = {
                         summary: `Mock ${ep.method} ${pathParts}`,
                         responses: { [ep.statusCode]: { description: "Mocked Response", content: { "application/json": { example: (() => { try { return JSON.parse(ep.customPayload); } catch { return { raw: ep.customPayload }; } })() } } } }
                    };
                    return acc;
               }, {} as any)
          };
          const blob = new Blob([JSON.stringify(spec, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = "toollok-openapi.json"; a.click(); URL.revokeObjectURL(url);
     };

     const importOpenAPI = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (event) => {
               try {
                    const raw = event.target?.result as string;
                    let parsed: any;
                    if (file.name.endsWith('.yaml') || file.name.endsWith('.yml')) parsed = simpleYamlToJson(raw);
                    else parsed = JSON.parse(raw);

                    if (!parsed.paths) throw new Error("Invalid OpenAPI: Missing paths object.");

                    const importedEps: MockEndpoint[] = [];
                    Object.keys(parsed.paths).forEach(path => {
                         Object.keys(parsed.paths[path]).forEach(method => {
                              const route = parsed.paths[path][method];
                              const convertedPath = path.replace(/\{([^}]+)\}/g, ':$1');
                              const status = Object.keys(route.responses || {})[0] || "200";
                              const example = route.responses?.[status]?.content?.["application/json"]?.example || { message: "Generated Mock" };
                              importedEps.push({
                                   id: crypto.randomUUID(), method: method.toUpperCase() as any, path: convertedPath, statusCode: parseInt(status), latency: 200, schemaType: "custom", customPayload: JSON.stringify(example, null, 2), headers: [], conditions: [], authRequired: "none", errorRate: 0
                              });
                         });
                    });
                    if (importedEps.length > 0) {
                         setEndpoints(importedEps);
                         setSelectedEndpointId(importedEps[0].id);
                    } else {
                         alert("No usable endpoints found in file.");
                    }
               } catch (err: any) { alert(`Failed to import file: ${err.message}`); }
          };
          reader.readAsText(file);
     };

     // --- ADVANCED SANDBOX ENGINE ---
     const matchRoute = (reqPath: string, reqMethod: string) => {
          const parsedUrl = new URL(reqPath, "http://mock.local");
          const reqSegments = parsedUrl.pathname.split("/").filter(Boolean);

          // Exact match first, then parameter match
          let bestMatch = null;
          let highestScore = -1;
          let extractedParams: Record<string, string> = {};

          for (const ep of endpoints) {
               if (ep.method !== reqMethod) continue;
               const epSegments = ep.path.split("?")[0].split("/").filter(Boolean);
               if (epSegments.length !== reqSegments.length) continue;

               let isMatch = true;
               let score = 0;
               const params: Record<string, string> = {};

               for (let i = 0; i < epSegments.length; i++) {
                    if (epSegments[i].startsWith(":")) {
                         params[epSegments[i].slice(1)] = reqSegments[i];
                    } else if (epSegments[i] === reqSegments[i]) {
                         score += 1;
                    } else {
                         isMatch = false; break;
                    }
               }

               if (isMatch && score > highestScore) {
                    highestScore = score;
                    bestMatch = ep;
                    extractedParams = params;
               }
          }
          return { match: bestMatch, params: extractedParams, parsedUrl };
     };

     const evaluateConditions = (conditions: Condition[], context: RequestContext) => {
          for (const cond of conditions) {
               let subjectValue = "";
               if (cond.target === "query") subjectValue = context.query[cond.key];
               else if (cond.target === "header") subjectValue = context.header[cond.key.toLowerCase()];
               else if (cond.target === "path") subjectValue = context.path[cond.key];
               else if (cond.target === "body") subjectValue = context.body?.[cond.key];

               let isTriggered = false;
               if (cond.operator === "exists" && subjectValue !== undefined) isTriggered = true;
               else if (cond.operator === "equals" && String(subjectValue) === cond.value) isTriggered = true;
               else if (cond.operator === "contains" && String(subjectValue).includes(cond.value)) isTriggered = true;
               else if (cond.operator === "regex" && new RegExp(cond.value).test(String(subjectValue))) isTriggered = true;

               if (isTriggered) return cond;
          }
          return null;
     };

     const runSandboxTest = () => {
          setIsTesting(true);
          setTestResult({ loading: true, message: "Executing request through pipeline..." });

          const { match, params, parsedUrl } = matchRoute(testRequestPath, testMethod);

          // Parse test contexts
          const requestContext: RequestContext = { path: params, query: Object.fromEntries(parsedUrl.searchParams), header: {}, body: null };
          try { requestContext.header = Object.fromEntries(Object.entries(JSON.parse(testHeaders || "{}")).map(([k, v]) => [k.toLowerCase(), String(v)])); } catch { /* Ignore */ }
          try { requestContext.body = JSON.parse(testBody || "{}"); } catch { /* Ignore */ }

          // Latency calc
          let finalLatency = match ? match.latency : 50;
          if (globalScenario === "slow_network") finalLatency += 2000;

          setTimeout(() => {
               const logItem: RequestHistory = { id: crypto.randomUUID(), timestamp: Date.now(), method: testMethod, url: testRequestPath, status: 404, latency: finalLatency, response: null, requestContext, matchedRouteId: match?.id };

               if (!match) {
                    logItem.response = { error: "Route not found. Ensure path and method match configuration." };
                    setTestResult({ ...logItem, response: { data: logItem.response, status: 404 } });
                    setHistory(prev => [logItem, ...prev].slice(0, 50));
                    setIsTesting(false);
                    return;
               }

               // Global Env Overrides
               if (globalScenario === "error_500" || (match.errorRate && Math.random() * 100 < match.errorRate)) {
                    logItem.status = 500;
                    logItem.response = { error: "Internal Server Error (Simulated)" };
                    setTestResult({ ...logItem, response: { data: logItem.response, status: 500 } });
                    setHistory(prev => [logItem, ...prev].slice(0, 50));
                    setIsTesting(false);
                    return;
               }

               // Auth Checks
               let isAuthValid = true;
               const authHeader = requestContext.header['authorization'] || '';
               if (globalScenario === "unauthorized") isAuthValid = false;
               else if (match.authRequired === "bearer" && !authHeader.startsWith("Bearer ")) isAuthValid = false;
               else if (match.authRequired === "apikey" && !requestContext.header['x-api-key']) isAuthValid = false;
               else if (match.authRequired === "basic" && !authHeader.startsWith("Basic ")) isAuthValid = false;

               if (!isAuthValid) {
                    logItem.status = 401;
                    logItem.response = { error: "Unauthorized. Missing or invalid authentication token/key." };
                    setTestResult({ ...logItem, response: { data: logItem.response, status: 401 } });
                    setHistory(prev => [logItem, ...prev].slice(0, 50));
                    setIsTesting(false);
                    return;
               }

               // Conditions & Route Match Logic
               const triggeredCondition = evaluateConditions(match.conditions, requestContext);

               let finalStatus = match.statusCode;
               let finalData = null;

               if (triggeredCondition) {
                    finalStatus = triggeredCondition.returnStatus;
                    finalData = interpolatePayload(triggeredCondition.returnPayload, requestContext);
               } else {
                    finalData = interpolatePayload(match.customPayload, requestContext);
               }

               logItem.status = finalStatus;
               logItem.response = finalData;

               setTestResult({ ...logItem, response: { data: finalData, status: finalStatus, headers: match.headers.reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {}) } });
               setHistory(prev => [logItem, ...prev].slice(0, 50));
               setIsTesting(false);
          }, Math.min(finalLatency, 3000));
     };

     // --- DATA GENERATOR ---
     const generateSyntheticData = () => {
          const templateStr = typeof PRESET_SCHEMAS[genSchema] === 'string' ? PRESET_SCHEMAS[genSchema] : JSON.stringify(PRESET_SCHEMAS[genSchema]);
          let baseObj = {};
          try {
               const parsed = JSON.parse(templateStr);
               baseObj = Array.isArray(parsed) ? parsed[0] : parsed;
          } catch { return; }
          const generated = Array.from({ length: genCount }).map(() => interpolatePayload(JSON.stringify(baseObj)));
          setGenResult(JSON.stringify(generated, null, 2));
     };

     // --- CODE GENERATION ---
     const codeSnippets = useMemo(() => {
          if (!activeEndpoint) return { curl: '', fetch: '', express: '', msw: '' };
          const url = `https://mock.toollok.com${activeEndpoint.path.replace(/:[a-zA-Z0-9_]+/g, '123')}`;
          const headersStr = activeEndpoint.headers.map(h => `\n  -H "${h.key}: ${h.value}"`).join('');
          const authHeader = activeEndpoint.authRequired === 'bearer' ? `\n  -H "Authorization: Bearer YOUR_TOKEN"` : '';

          const curl = `curl -X ${activeEndpoint.method} "${url}"${headersStr}${authHeader}`;
          const fetchCode = `fetch("${url}", {
  method: "${activeEndpoint.method}",
  headers: {
    "Content-Type": "application/json"${activeEndpoint.authRequired !== 'none' ? `,\n    "Authorization": "Bearer YOUR_TOKEN"` : ''}
  }
})\n.then(res => res.json())\n.then(console.log);`;

          let express = `const express = require('express');\nconst app = express();\napp.use(express.json());\n\n`;
          endpoints.forEach(ep => {
               express += `app.${ep.method.toLowerCase()}('${ep.path}', (req, res) => {\n`;
               if (ep.authRequired !== 'none') express += `  if (!req.headers.authorization) return res.status(401).json({error: 'Unauthorized'});\n`;
               ep.headers.forEach(h => { express += `  res.setHeader('${h.key}', '${h.value}');\n`; });
               express += `  setTimeout(() => {\n    res.status(${ep.statusCode}).json(${ep.customPayload});\n  }, ${ep.latency});\n});\n\n`;
          });
          express += `app.listen(3000, () => console.log('Mock Server running on port 3000'));`;

          let msw = `import { http, HttpResponse } from 'msw';\n\nexport const handlers = [\n`;
          endpoints.forEach(ep => {
               msw += `  http.${ep.method.toLowerCase()}('${ep.path}', async () => {\n    await new Promise(r => setTimeout(r, ${ep.latency}));\n    return HttpResponse.json(${ep.customPayload}, { status: ${ep.statusCode} });\n  }),\n`;
          });
          msw += `];`;

          return { curl, fetch: fetchCode, express, msw };
     }, [activeEndpoint, endpoints]);

     useKeyboardShortcuts([{ key: "enter", ctrlOrCmd: true, action: runSandboxTest }]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 font-sans">

               {/* HEADER & GLOBAL CONTROLS */}
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-500/20 shrink-0">
                              <Server size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">API Mock Server & Data Generator</h2>
                                   <span className="hidden sm:flex bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider">
                                        🟢 Free Sandbox
                                   </span>
                              </div>
                              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Design robust REST/GraphQL mocks, dynamic payloads, and test complex edge cases.</p>
                         </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
                         <select
                              value={globalScenario}
                              onChange={(e) => setGlobalScenario(e.target.value as Scenario)}
                              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2 outline-none focus:border-cyan-500 shrink-0 flex items-center gap-2"
                         >
                              <option value="normal">🟢 Global Env: Normal</option>
                              <option value="error_500">🔴 Force 500 Errors</option>
                              <option value="slow_network">🐢 Slow Network (+2s)</option>
                              <option value="unauthorized">🔒 Force Unauthorized</option>
                         </select>
                         <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg text-xs font-bold transition-colors shrink-0">
                              <Upload size={14} /> Import OpenAPI
                         </button>
                         <button onClick={exportOpenAPI} className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg text-xs font-bold transition-colors shrink-0">
                              <Download size={14} /> Export OpenAPI
                         </button>
                         <input type="file" ref={fileInputRef} onChange={importOpenAPI} accept=".json,.yaml,.yml" className="hidden" />
                    </div>
               </div>

               <AdSlot adSlot="top-mockserver-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               {/* MAIN GRID */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* LEFT PANEL: ROUTES */}
                    <div className="lg:col-span-4 flex flex-col gap-4">
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm min-h-[600px] flex flex-col">
                              <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-800/60 pb-3">
                                   <h3 className="text-gray-900 dark:text-white font-bold text-sm flex items-center gap-2">
                                        <Layers size={16} className="text-cyan-600 dark:text-cyan-400" /> Endpoints ({endpoints.length})
                                   </h3>
                                   <button onClick={addEndpoint} className="flex items-center gap-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-2.5 py-1.5 rounded-lg transition-all shadow-md shadow-cyan-600/20">
                                        <Plus size={14} /> Add Route
                                   </button>
                              </div>
                              <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                                   {endpoints.map((ep) => (
                                        <div
                                             key={ep.id}
                                             onClick={() => setSelectedEndpointId(ep.id)}
                                             className={`group flex flex-col gap-2 p-3 rounded-2xl border cursor-pointer transition-all ${selectedEndpointId === ep.id ? "bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-500/50 shadow-sm" : "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"}`}
                                        >
                                             <div className="flex items-center justify-between overflow-hidden gap-2">
                                                  <div className="flex items-center gap-2 overflow-hidden">
                                                       <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${ep.method === 'GET' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                                                            ep.method === 'POST' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' :
                                                                 ep.method === 'GRAPHQL' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400' :
                                                                      'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                                                            }`}>
                                                            {ep.method}
                                                       </span>
                                                       <span className={`text-xs font-mono truncate ${selectedEndpointId === ep.id ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-600 dark:text-gray-400'}`}>{ep.path}</span>
                                                  </div>
                                                  {endpoints.length > 1 && (
                                                       <button onClick={(e) => { e.stopPropagation(); removeEndpoint(ep.id); }} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-rose-500 transition-colors shrink-0">
                                                            <Trash2 size={14} />
                                                       </button>
                                                  )}
                                             </div>
                                             <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase">
                                                  <span className={ep.statusCode >= 400 ? 'text-rose-500' : 'text-emerald-600'}>{ep.statusCode}</span>
                                                  <span>•</span>
                                                  <span>{ep.latency}ms</span>
                                                  {ep.conditions.length > 0 && <span>• {ep.conditions.length} Rules</span>}
                                             </div>
                                        </div>
                                   ))}
                              </div>
                         </div>
                    </div>

                    {/* RIGHT PANEL: WORKSPACE */}
                    <div className="lg:col-span-8 flex flex-col gap-4">
                         <div className="bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm min-h-[600px] flex flex-col">

                              {/* WORKSPACE TABS */}
                              <div className="flex items-center overflow-x-auto hide-scrollbar gap-2 mb-6 border-b border-gray-100 dark:border-gray-800/60 pb-3">
                                   {[
                                        { id: "config", icon: Settings, label: "Config & Response" },
                                        { id: "rules", icon: Braces, label: `Rules (${activeEndpoint?.conditions.length || 0})` },
                                        { id: "sandbox", icon: Play, label: "Live Sandbox" },
                                        { id: "history", icon: History, label: "Logs" },
                                        { id: "datagen", icon: Database, label: "Data Gen" },
                                        { id: "codegen", icon: Code, label: "Code Export" }
                                   ].map(tab => (
                                        <button
                                             key={tab.id}
                                             onClick={() => setActiveTab(tab.id as any)}
                                             className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${activeTab === tab.id ? "bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
                                        >
                                             <tab.icon size={14} /> {tab.label}
                                        </button>
                                   ))}
                              </div>

                              {/* CONTENT - CONFIGURATION */}
                              {activeTab === "config" && activeEndpoint && (
                                   <div className="flex flex-col gap-6 animate-in fade-in duration-200 h-full overflow-y-auto pr-1">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                             <div className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800">
                                                  <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><Sliders size={12} /> Route Core</span>
                                                  <div className="flex gap-2">
                                                       <select value={activeEndpoint.method} onChange={(e) => updateEndpoint("method", e.target.value)} className="w-1/3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-900 dark:text-white outline-none">
                                                            <option value="GET">GET</option><option value="POST">POST</option><option value="PUT">PUT</option><option value="PATCH">PATCH</option><option value="DELETE">DELETE</option><option value="GRAPHQL">GRAPHQL</option>
                                                       </select>
                                                       <input type="text" value={activeEndpoint.path} onChange={(e) => updateEndpoint("path", e.target.value)} className="w-2/3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-xs text-gray-900 dark:text-white font-mono outline-none focus:border-cyan-500" placeholder="/api/users/:id" />
                                                  </div>
                                                  <div className="flex gap-2 mt-1">
                                                       <div className="w-1/2">
                                                            <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Status Code</label>
                                                            <select value={activeEndpoint.statusCode} onChange={(e) => updateEndpoint("statusCode", Number(e.target.value))} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-900 dark:text-white outline-none">
                                                                 <option value={200}>200 OK</option><option value={201}>201 Created</option><option value={204}>204 No Content</option><option value={400}>400 Bad Req</option><option value={401}>401 Unauth</option><option value={404}>404 Not Found</option><option value={422}>422 Unprocessable</option><option value={500}>500 Error</option>
                                                            </select>
                                                       </div>
                                                       <div className="w-1/2">
                                                            <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Latency: {activeEndpoint.latency}ms</label>
                                                            <input type="range" min="0" max="3000" step="50" value={activeEndpoint.latency} onChange={(e) => updateEndpoint("latency", Number(e.target.value))} className="w-full accent-cyan-500 cursor-pointer mt-1" />
                                                       </div>
                                                  </div>
                                             </div>

                                             <div className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800">
                                                  <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><Key size={12} /> Security & Reliability</span>
                                                  <div className="flex gap-2">
                                                       <div className="w-1/2">
                                                            <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Auth Requirement</label>
                                                            <select value={activeEndpoint.authRequired} onChange={(e) => updateEndpoint("authRequired", e.target.value)} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-900 dark:text-white outline-none">
                                                                 <option value="none">None (Public)</option>
                                                                 <option value="bearer">Bearer Token</option>
                                                                 <option value="apikey">API Key</option>
                                                                 <option value="basic">Basic Auth</option>
                                                            </select>
                                                       </div>
                                                       <div className="w-1/2">
                                                            <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1 text-rose-500">Error Rate: {activeEndpoint.errorRate}%</label>
                                                            <input type="range" min="0" max="100" step="5" value={activeEndpoint.errorRate || 0} onChange={(e) => updateEndpoint("errorRate", Number(e.target.value))} className="w-full accent-rose-500 cursor-pointer mt-1" />
                                                       </div>
                                                  </div>
                                                  <div>
                                                       <div className="flex items-center justify-between mb-1 mt-2">
                                                            <label className="text-[10px] text-gray-500 font-bold uppercase block">Response Headers</label>
                                                            <button onClick={() => updateEndpoint("headers", [...activeEndpoint.headers, { id: crypto.randomUUID(), key: "", value: "" }])} className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400">+ Add</button>
                                                       </div>
                                                       <div className="flex flex-col gap-1 max-h-[80px] overflow-y-auto custom-scrollbar">
                                                            {activeEndpoint.headers.length === 0 && <span className="text-[10px] text-gray-400 italic">No custom headers.</span>}
                                                            {activeEndpoint.headers.map((h, i) => (
                                                                 <div key={h.id} className="flex gap-1">
                                                                      <input type="text" value={h.key} onChange={(e) => { const newH = [...activeEndpoint.headers]; newH[i].key = e.target.value; updateEndpoint("headers", newH); }} placeholder="Key" className="w-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-[10px] px-1 py-1 font-mono outline-none" />
                                                                      <input type="text" value={h.value} onChange={(e) => { const newH = [...activeEndpoint.headers]; newH[i].value = e.target.value; updateEndpoint("headers", newH); }} placeholder="Value" className="w-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-[10px] px-1 py-1 font-mono outline-none" />
                                                                      <button onClick={() => updateEndpoint("headers", activeEndpoint.headers.filter(x => x.id !== h.id))} className="text-gray-400 hover:text-rose-500"><Trash2 size={12} /></button>
                                                                 </div>
                                                            ))}
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>

                                        {/* Payload Editor */}
                                        <div className="flex flex-col gap-2 flex-grow min-h-[300px]">
                                             <div className="flex flex-wrap items-center justify-between gap-2">
                                                  <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><FileCode size={12} /> Default JSON Payload</span>
                                                  <div className="flex flex-wrap gap-2">
                                                       {["custom", "users", "transactions", "pharma_inventory"].map(t => (
                                                            <button key={t} onClick={() => handleSchemaChange(t)} className={`text-[10px] font-bold px-2 py-1 rounded border ${activeEndpoint.schemaType === t ? 'border-cyan-500 text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>{t.replace('_', ' ').toUpperCase()}</button>
                                                       ))}
                                                  </div>
                                             </div>
                                             <div className="relative flex-grow flex flex-col">
                                                  <textarea
                                                       value={activeEndpoint.customPayload}
                                                       onChange={(e) => updateEndpoint("customPayload", e.target.value)}
                                                       className="w-full flex-grow bg-gray-50 dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-t-xl p-3 font-mono text-xs text-emerald-600 dark:text-emerald-400 outline-none resize-none focus:border-cyan-500 shadow-inner custom-scrollbar"
                                                       spellCheck="false"
                                                  />
                                                  <div className="bg-gray-100 dark:bg-gray-900 border border-t-0 border-gray-200 dark:border-gray-800 rounded-b-xl px-3 py-2 flex items-center justify-between">
                                                       <div className="text-[10px] text-gray-500 font-mono">
                                                            Dyn: <code className="text-cyan-600 dark:text-cyan-400">{"{{uuid}}"}</code>, <code className="text-cyan-600 dark:text-cyan-400">{"{{path.id}}"}</code>, <code className="text-cyan-600 dark:text-cyan-400">{"{{query.q}}"}</code>
                                                       </div>
                                                       <div className="flex items-center gap-3">
                                                            {jsonValidationResult && (
                                                                 <span className={`text-[10px] font-bold flex items-center gap-1 ${jsonValidationResult.valid ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                                      {jsonValidationResult.valid ? <CheckCircle2 size={12} /> : <XCircle size={12} />} {jsonValidationResult.message}
                                                                 </span>
                                                            )}
                                                            <button onClick={formatJsonPayload} className="flex items-center gap-1 text-[10px] font-bold text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                                                                 <FileJson size={12} /> Format JSON
                                                            </button>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              )}

                              {/* CONTENT - CONDITIONAL RULES */}
                              {activeTab === "rules" && activeEndpoint && (
                                   <div className="flex flex-col gap-4 animate-in fade-in duration-200 h-full overflow-y-auto pr-1">
                                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
                                             <div>
                                                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">Conditional Routing Engine</h3>
                                                  <p className="text-xs text-gray-500 mt-1">Intercept requests and override the default response if criteria are met. Rules execute top-to-bottom.</p>
                                             </div>
                                             <button onClick={() => updateEndpoint("conditions", [...activeEndpoint.conditions, { id: crypto.randomUUID(), target: "query", key: "error", operator: "equals", value: "true", returnStatus: 500, returnPayload: '{\n  "error": "Conditional 500 Triggered"\n}' }])} className="flex items-center gap-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-3 py-2 rounded-xl transition-all shadow-md shrink-0">
                                                  <Plus size={14} /> Add Rule
                                             </button>
                                        </div>

                                        {activeEndpoint.conditions.length === 0 ? (
                                             <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                                  <AlertTriangle size={32} className="mb-2 opacity-30" />
                                                  <span className="text-sm">No conditional rules defined for this endpoint.</span>
                                             </div>
                                        ) : (
                                             <div className="flex flex-col gap-4">
                                                  {activeEndpoint.conditions.map((cond, i) => (
                                                       <div key={cond.id} className="bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
                                                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                                                                 <span className="text-[10px] font-bold text-gray-500 uppercase bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">Rule #{i + 1}</span>
                                                                 <button onClick={() => updateEndpoint("conditions", activeEndpoint.conditions.filter(c => c.id !== cond.id))} className="text-gray-400 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                                                                 <span className="font-sans font-bold text-gray-700 dark:text-gray-300">IF</span>
                                                                 <select value={cond.target} onChange={(e) => { const nc = [...activeEndpoint.conditions]; nc[i].target = e.target.value as any; updateEndpoint("conditions", nc); }} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 outline-none font-bold">
                                                                      <option value="query">Query Param</option><option value="header">Header</option><option value="path">Path Param</option><option value="body">JSON Body Key</option>
                                                                 </select>
                                                                 <input type="text" value={cond.key} onChange={(e) => { const nc = [...activeEndpoint.conditions]; nc[i].key = e.target.value; updateEndpoint("conditions", nc); }} className="w-24 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 outline-none focus:border-cyan-500" placeholder="e.g. status" />
                                                                 <select value={cond.operator} onChange={(e) => { const nc = [...activeEndpoint.conditions]; nc[i].operator = e.target.value as any; updateEndpoint("conditions", nc); }} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 outline-none font-bold">
                                                                      <option value="equals">Equals (==)</option><option value="contains">Contains</option><option value="exists">Exists</option><option value="regex">Matches Regex</option>
                                                                 </select>
                                                                 {cond.operator !== "exists" && (
                                                                      <input type="text" value={cond.value} onChange={(e) => { const nc = [...activeEndpoint.conditions]; nc[i].value = e.target.value; updateEndpoint("conditions", nc); }} className="flex-grow min-w-[100px] bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 outline-none focus:border-cyan-500" placeholder="value" />
                                                                 )}
                                                            </div>
                                                            <div className="flex flex-col gap-2 mt-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl p-3">
                                                                 <div className="flex items-center gap-2">
                                                                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-500 uppercase">Then Return Status:</span>
                                                                      <input type="number" value={cond.returnStatus} onChange={(e) => { const nc = [...activeEndpoint.conditions]; nc[i].returnStatus = Number(e.target.value); updateEndpoint("conditions", nc); }} className="w-20 bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-700/50 rounded-lg px-2 py-1 outline-none text-xs font-bold text-amber-700 dark:text-amber-500" />
                                                                 </div>
                                                                 <textarea value={cond.returnPayload} onChange={(e) => { const nc = [...activeEndpoint.conditions]; nc[i].returnPayload = e.target.value; updateEndpoint("conditions", nc); }} rows={3} className="w-full bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-700/50 rounded-lg p-2 font-mono text-xs text-amber-700 dark:text-amber-400 outline-none resize-none custom-scrollbar" placeholder='{"error": "Custom Response"}' spellCheck="false" />
                                                            </div>
                                                       </div>
                                                  ))}
                                             </div>
                                        )}
                                   </div>
                              )}

                              {/* CONTENT - SANDBOX */}
                              {activeTab === "sandbox" && (
                                   <div className="flex flex-col gap-4 h-full animate-in fade-in duration-200">
                                        <div className="flex flex-col gap-3 bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                                             <div className="flex flex-col md:flex-row gap-2">
                                                  <select value={testMethod} onChange={e => setTestMethod(e.target.value)} className="bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 dark:text-white outline-none w-full md:w-32 focus:border-cyan-500">
                                                       <option>GET</option><option>POST</option><option>PUT</option><option>PATCH</option><option>DELETE</option>
                                                  </select>
                                                  <input type="text" value={testRequestPath} onChange={(e) => setTestRequestPath(e.target.value)} className="flex-grow bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-mono text-gray-900 dark:text-white outline-none focus:border-cyan-500" placeholder="/api/v1/users/42?status=active" />
                                                  <button onClick={runSandboxTest} disabled={isTesting} className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md shrink-0 w-full md:w-auto">
                                                       {isTesting ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />} {isTesting ? "Executing..." : "Send Request"}
                                                  </button>
                                             </div>
                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                  <div>
                                                       <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Request Headers (JSON)</label>
                                                       <textarea value={testHeaders} onChange={e => setTestHeaders(e.target.value)} className="w-full h-16 bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-700 rounded-xl p-3 font-mono text-[10px] text-gray-700 dark:text-gray-300 outline-none resize-none focus:border-cyan-500" spellCheck="false" />
                                                  </div>
                                                  <div>
                                                       <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 block">Request Body (JSON)</label>
                                                       <textarea value={testBody} onChange={e => setTestBody(e.target.value)} className="w-full h-16 bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-700 rounded-xl p-3 font-mono text-[10px] text-gray-700 dark:text-gray-300 outline-none resize-none focus:border-cyan-500" spellCheck="false" placeholder='{"key": "value"}' />
                                                  </div>
                                             </div>
                                        </div>

                                        <div className="flex-grow bg-white dark:bg-[#06090e] border border-gray-200 dark:border-gray-800 rounded-2xl relative overflow-hidden flex flex-col shadow-inner">
                                             <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                                  <span className="text-[10px] font-bold text-gray-500 uppercase ml-1 flex items-center gap-1.5"><Terminal size={12} /> Response Pipeline</span>
                                                  {testResult && !testResult.loading && (
                                                       <div className="flex gap-2">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${testResult.status >= 400 ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/30 dark:bg-rose-900/20 dark:text-rose-400' : 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/30 dark:bg-emerald-900/20 dark:text-emerald-400'}`}>Status: {testResult.status}</span>
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-cyan-200 bg-cyan-50 text-cyan-600 dark:border-cyan-900/30 dark:bg-cyan-900/20 dark:text-cyan-400">Time: {testResult.latency}ms</span>
                                                       </div>
                                                  )}
                                             </div>
                                             <div className="p-4 overflow-y-auto flex-grow font-mono text-xs custom-scrollbar">
                                                  {testResult ? (
                                                       testResult.loading ? (
                                                            <div className="h-full flex flex-col items-center justify-center text-cyan-600 dark:text-cyan-500/50">
                                                                 <RefreshCw size={24} className="animate-spin mb-3" />
                                                                 <span className="font-sans font-bold">Simulating Network Pipeline...</span>
                                                            </div>
                                                       ) : (
                                                            <pre className={testResult.response.status >= 400 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}>
                                                                 {JSON.stringify(testResult.response.data, null, 2)}
                                                            </pre>
                                                       )
                                                  ) : (
                                                       <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-600">
                                                            <Zap size={32} className="mb-3 opacity-30" />
                                                            <span className="font-sans font-bold text-sm">Enter URL and click Send Request</span>
                                                            <span className="font-sans text-[10px] mt-1 opacity-70">Dynamic variables, conditionals, and latency will be processed locally.</span>
                                                       </div>
                                                  )}
                                             </div>
                                        </div>
                                   </div>
                              )}

                              {/* CONTENT - HISTORY LOGS */}
                              {activeTab === "history" && (
                                   <div className="flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar animate-in fade-in duration-200 pr-1">
                                        {history.length === 0 ? (
                                             <div className="h-full flex flex-col items-center justify-center text-gray-400 py-10">
                                                  <History size={32} className="mb-3 opacity-30" />
                                                  <span className="text-sm font-bold">No requests executed yet.</span>
                                                  <span className="text-xs mt-1">Use the Sandbox to test endpoints.</span>
                                             </div>
                                        ) : (
                                             <>
                                                  <div className="flex justify-end">
                                                       <button onClick={() => setHistory([])} className="text-[10px] font-bold text-gray-500 hover:text-rose-500 bg-gray-100 dark:bg-gray-900 px-3 py-1.5 rounded-lg transition-colors">Clear Logs</button>
                                                  </div>
                                                  {history.map((h) => (
                                                       <div key={h.id} className="bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
                                                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800/60 pb-2">
                                                                 <div className="flex items-center gap-2">
                                                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${h.status >= 400 ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400' : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'}`}>{h.method} {h.status}</span>
                                                                      <span className="text-xs font-mono text-gray-800 dark:text-gray-200">{h.url}</span>
                                                                 </div>
                                                                 <div className="flex items-center gap-3 text-[10px] font-bold">
                                                                      <span className="text-gray-500">{h.latency}ms</span>
                                                                      <span className="text-gray-400 hidden sm:inline">{new Date(h.timestamp).toLocaleTimeString()}</span>
                                                                 </div>
                                                            </div>
                                                            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                                                                 <pre className="text-[10px] font-mono text-gray-600 dark:text-gray-400 overflow-x-auto custom-scrollbar">{JSON.stringify(h.response?.data || h.response, null, 2)}</pre>
                                                            </div>
                                                       </div>
                                                  ))}
                                             </>
                                        )}
                                   </div>
                              )}

                              {/* CONTENT - DATA GENERATOR */}
                              {activeTab === "datagen" && (
                                   <div className="flex flex-col gap-4 h-full animate-in fade-in duration-200">
                                        <div className="flex flex-wrap items-end gap-4 bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                                             <div className="flex-grow min-w-[200px]">
                                                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Entity Schema Template</label>
                                                  <select value={genSchema} onChange={e => setGenSchema(e.target.value)} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-cyan-500">
                                                       <option value="users">Users / Customers Array</option>
                                                       <option value="transactions">Transactions / Finance Array</option>
                                                       <option value="pharma_inventory">Pharma / Inventory Array</option>
                                                  </select>
                                             </div>
                                             <div>
                                                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Record Count</label>
                                                  <input type="number" min="1" max="1000" value={genCount} onChange={e => setGenCount(Number(e.target.value))} className="w-24 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-mono text-gray-900 dark:text-white outline-none focus:border-cyan-500" />
                                             </div>
                                             <div className="flex gap-2 w-full md:w-auto">
                                                  <button onClick={generateSyntheticData} className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md">
                                                       <Database size={14} /> Generate
                                                  </button>
                                                  {genResult && (
                                                       <button onClick={() => copy(genResult)} className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-bold px-4 py-2 rounded-xl text-xs transition-all">
                                                            {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />} Copy JSON
                                                       </button>
                                                  )}
                                             </div>
                                        </div>
                                        <div className="flex-grow bg-white dark:bg-[#06090e] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 overflow-y-auto custom-scrollbar shadow-inner">
                                             {genResult ? (
                                                  <pre className="font-mono text-[11px] text-purple-600 dark:text-purple-400 whitespace-pre-wrap">{genResult}</pre>
                                             ) : (
                                                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                                       <ListFilter size={32} className="mb-2 opacity-30" />
                                                       <span className="text-sm font-bold">No synthetic data generated yet.</span>
                                                       <span className="text-xs text-center mt-1 max-w-xs">Select a schema, set record count, and generate complex nested JSON strictly in-browser.</span>
                                                  </div>
                                             )}
                                        </div>
                                   </div>
                              )}

                              {/* CONTENT - CODE GENERATOR */}
                              {activeTab === "codegen" && (
                                   <div className="flex flex-col gap-4 h-full animate-in fade-in duration-200 overflow-y-auto pr-1 custom-scrollbar">
                                        <div className="bg-cyan-50 dark:bg-cyan-900/10 border border-cyan-100 dark:border-cyan-900/30 rounded-xl p-4 mb-2">
                                             <p className="text-xs text-cyan-800 dark:text-cyan-300 font-bold flex items-center gap-2"><Code size={14} /> Instant Code Integration</p>
                                             <p className="text-[10px] text-cyan-600 dark:text-cyan-400 mt-1">Export the active mock route configuration instantly to popular backend and frontend frameworks.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                             {/* EXPRESS */}
                                             <div className="flex flex-col bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                                                  <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                                                       <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Express.js Mock Server</span>
                                                       <button onClick={() => copy(codeSnippets.express)} className="text-cyan-600 hover:text-cyan-700 dark:hover:text-cyan-400"><Copy size={14} /></button>
                                                  </div>
                                                  <pre className="p-4 font-mono text-[10px] text-blue-700 dark:text-blue-400 overflow-x-auto custom-scrollbar">{codeSnippets.express}</pre>
                                             </div>

                                             {/* MSW */}
                                             <div className="flex flex-col bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                                                  <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                                                       <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">MSW (Frontend Testing)</span>
                                                       <button onClick={() => copy(codeSnippets.msw)} className="text-cyan-600 hover:text-cyan-700 dark:hover:text-cyan-400"><Copy size={14} /></button>
                                                  </div>
                                                  <pre className="p-4 font-mono text-[10px] text-purple-700 dark:text-purple-400 overflow-x-auto custom-scrollbar">{codeSnippets.msw}</pre>
                                             </div>

                                             {/* FETCH */}
                                             <div className="flex flex-col bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                                                  <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                                                       <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">JS Fetch API</span>
                                                       <button onClick={() => copy(codeSnippets.fetch)} className="text-cyan-600 hover:text-cyan-700 dark:hover:text-cyan-400"><Copy size={14} /></button>
                                                  </div>
                                                  <pre className="p-4 font-mono text-[10px] text-amber-600 dark:text-amber-400 overflow-x-auto custom-scrollbar">{codeSnippets.fetch}</pre>
                                             </div>

                                             {/* CURL */}
                                             <div className="flex flex-col bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                                                  <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                                                       <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">cURL</span>
                                                       <button onClick={() => copy(codeSnippets.curl)} className="text-cyan-600 hover:text-cyan-700 dark:hover:text-cyan-400"><Copy size={14} /></button>
                                                  </div>
                                                  <pre className="p-4 font-mono text-[10px] text-emerald-700 dark:text-emerald-400 overflow-x-auto custom-scrollbar whitespace-pre-wrap">{codeSnippets.curl}</pre>
                                             </div>
                                        </div>
                                   </div>
                              )}

                         </div>
                    </div>
               </div>

               <AdSlot adSlot="bottom-mockserver-ad" format="fluid" className="mt-4" />

               {/* SEO & EDUCATIONAL SECTION */}
               <div className="mt-8 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm">
                    <div className="prose dark:prose-invert max-w-none">
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Enterprise-Grade API Mocking, Locally in Your Browser</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              ToolLok’s completely free <strong>API Sandbox & Synthetic Data Generator</strong> eliminates frontend blockages. Establish robust data models for business platforms, test dynamic REST edge cases, enforce strict authorization policies, and export comprehensive OpenAPI specs—all processed securely within your device without relying on external backends.
                         </p>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                              <div className="bg-gray-50 dark:bg-gray-950 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                                   <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2"><Braces size={16} className="text-cyan-500" /> Intelligent Conditional Routing</h3>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Establish complex logical rules (e.g., <code>?status=error</code>) to instantly override default mocked responses. Perfect for validating your application's error-handling flows.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                                   <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2"><Database size={16} className="text-cyan-500" /> Dynamic Response Interpolation</h3>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Inject intelligent tokens like <code>{`{{path.id}}`}</code>, <code>{`{{uuid}}`}</code>, or <code>{`{{company}}`}</code> into your JSON templates to produce deterministic, hyper-realistic synthetic mock data.</p>
                              </div>
                         </div>

                         <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Frequently Asked Questions</h3>
                         <div className="space-y-3">
                              <div className="bg-white dark:bg-[#0c121e] p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-1">Does this support OpenAPI (Swagger) imports?</h4>
                                   <p className="text-[11px] text-gray-600 dark:text-gray-400">Yes. Simply click "Import OpenAPI" and select an OpenAPI 3.x JSON or YAML specification file. The engine will intelligently parse paths, parameters, schemas, and examples to instantly stand up your mock environment.</p>
                              </div>
                              <div className="bg-white dark:bg-[#0c121e] p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-1">Is my proprietary data sent to external servers?</h4>
                                   <p className="text-[11px] text-gray-600 dark:text-gray-400">Absolutely not. This is a secure, client-side sandbox. All routing rules, synthetic generation algorithms, and payload interpolations execute precisely within your local browser runtime.</p>
                              </div>
                         </div>
                    </div>
                    {/* Related Tools Internal Linking */}
                    <div className="pt-8 mt-4 border-t border-gray-200 dark:border-gray-800">
                         <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 block">
                              Related Tools
                         </span>
                         <div className="flex flex-wrap gap-3">
                              <Link href="/tools/css-animation-builder" className="text-sm font-bold px-5 py-3 rounded-xl transition-all duration-200 bg-gray-100 dark:bg-[#1c2333] text-gray-700 dark:text-gray-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white shadow-sm">CSS Animation & Micro-Interaction Generator</Link>
                              <Link href="/tools/json-formatter-validator" className="text-sm font-bold px-5 py-3 rounded-xl transition-all duration-200 bg-gray-100 dark:bg-[#1c2333] text-gray-700 dark:text-gray-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white shadow-sm">JSON Developer Toolkit</Link>
                              <Link href="/tools/regex-tester-visualizer" className="text-sm font-bold px-5 py-3 rounded-xl transition-all duration-200 bg-gray-100 dark:bg-[#1c2333] text-gray-700 dark:text-gray-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white shadow-sm">Interactive Regex Tester</Link>
                              <Link href="/tools/legacy-code-refactorer" className="text-sm font-bold px-5 py-3 rounded-xl transition-all duration-200 bg-gray-100 dark:bg-[#1c2333] text-gray-700 dark:text-gray-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white shadow-sm">Legacy Codebase Refactorer</Link>
                         </div>
                    </div>
               </div>
          </div>
     );
}