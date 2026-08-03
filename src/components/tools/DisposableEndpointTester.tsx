"use client";

import { useState, useEffect } from "react";
import {
     Mail, Webhook, Clock, Copy, Check, Trash2,
     RefreshCw, ShieldCheck, Code, List, Send,
     Activity, Lock, CheckCircle2, AlertTriangle,
     ArrowRightLeft, Server, FileJson, Play, Terminal,
     Globe, Inbox
} from "lucide-react";
import AdSlot from "@/components/ui/AdSlot";

type EndpointMode = "email" | "webhook";
type MockType = "stripe" | "github" | "email_security" | "email_marketing";

interface Payload {
     id: string;
     timestamp: Date;
     source: string;
     subject: string;
     method?: "GET" | "POST" | "PUT";
     headers: Record<string, string>;
     body: string;
     isJson: boolean;
     forwardedTo?: string;
     responseSim?: number;
     security: {
          spf?: "pass" | "fail" | "none";
          dkim?: "pass" | "fail" | "none";
          signatureValid?: boolean;
     };
}

export default function DisposableEndpointTester() {
     const [mode, setMode] = useState<EndpointMode>("webhook");
     const [endpoint, setEndpoint] = useState("");
     const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
     const [inbox, setInbox] = useState<Payload[]>([]);
     const [selectedPayload, setSelectedPayload] = useState<Payload | null>(null);
     const [viewTab, setViewTab] = useState<"formatted" | "raw" | "headers">("formatted");

     const [isCopied, setIsCopied] = useState(false);
     const [isReceiving, setIsReceiving] = useState(false);
     const [mockType, setMockType] = useState<MockType>("stripe");

     // Premium Routing State
     const [isForwarding, setIsForwarding] = useState(false);
     const [forwardUrl, setForwardUrl] = useState("http://localhost:3000/api/webhooks");
     const [responseCode, setResponseCode] = useState<number>(200);

     // Generate Endpoint
     const generateEndpoint = (currentMode: EndpointMode) => {
          const randomHex = Math.random().toString(36).substring(2, 12);
          if (currentMode === "email") {
               setEndpoint(`temp_${randomHex}@secure-drop.local`);
               setMockType("email_security");
          } else {
               setEndpoint(`https://hook.secure-drop.local/rx/${randomHex}`);
               setMockType("stripe");
          }
          setInbox([]);
          setSelectedPayload(null);
          setTimeLeft(900);
     };

     // Initialize on mount
     useEffect(() => {
          generateEndpoint(mode);
          // eslint-disable-next-line react-hooks/exhaustive-deps
     }, [mode]);

     // Timer Countdown
     useEffect(() => {
          if (timeLeft <= 0) return;
          const timerId = setInterval(() => setTimeLeft(t => t - 1), 1000);
          return () => clearInterval(timerId);
     }, [timeLeft]);

     const formatTime = (seconds: number) => {
          const m = Math.floor(seconds / 60).toString().padStart(2, '0');
          const s = (seconds % 60).toString().padStart(2, '0');
          return `${m}:${s}`;
     };

     const copyToClipboard = (text: string) => {
          navigator.clipboard.writeText(text);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
     };

     // --- MOCK PAYLOAD INJECTOR ---
     const injectMockPayload = () => {
          setIsReceiving(true);

          setTimeout(() => {
               const id = Math.random().toString(36).substring(2, 11);
               const timestamp = new Date();
               let newPayload: Payload;

               if (mockType === "stripe") {
                    newPayload = {
                         id, timestamp, method: "POST", source: "Stripe API", subject: "payment_intent.succeeded", isJson: true,
                         forwardedTo: isForwarding ? forwardUrl : undefined, responseSim: responseCode,
                         headers: {
                              "Content-Type": "application/json; charset=utf-8",
                              "User-Agent": "Stripe/1.0 (+https://stripe.com/docs/webhooks)",
                              "Stripe-Signature": `t=${Math.floor(Date.now() / 1000)},v1=a1b2c3d4e5f6...`,
                              "X-Request-Id": `req_${Math.random().toString(36).substring(2, 10)}`
                         },
                         security: { signatureValid: true },
                         body: JSON.stringify({
                              id: `evt_${Math.random().toString(36).substring(2, 10)}`,
                              type: "payment_intent.succeeded",
                              data: { object: { id: "pi_3MtwBw...", amount: 2000, currency: "usd", status: "succeeded" } }
                         }, null, 2)
                    };
               } else if (mockType === "github") {
                    newPayload = {
                         id, timestamp, method: "POST", source: "GitHub Hooks", subject: "push to main", isJson: true,
                         forwardedTo: isForwarding ? forwardUrl : undefined, responseSim: responseCode,
                         headers: {
                              "Content-Type": "application/json",
                              "User-Agent": "GitHub-Hookshot/71d15b1",
                              "X-GitHub-Event": "push",
                              "X-Hub-Signature-256": "sha256=abcdef123456..."
                         },
                         security: { signatureValid: true },
                         body: JSON.stringify({
                              ref: "refs/heads/main",
                              repository: { name: "premium-app", full_name: "dev/premium-app" },
                              pusher: { name: "developer", email: "dev@example.com" }
                         }, null, 2)
                    };
               } else if (mockType === "email_security") {
                    newPayload = {
                         id, timestamp, source: "security@netflix.com", subject: "New sign-in to your account", isJson: false,
                         headers: {
                              "From": "Netflix <security@netflix.com>", "To": endpoint, "Subject": "New sign-in to your account",
                              "Date": timestamp.toUTCString(), "Received-SPF": "Pass", "DKIM-Signature": "v=1; a=rsa-sha256; d=netflix.com;"
                         },
                         security: { spf: "pass", dkim: "pass" },
                         body: `<div style="font-family: Arial, sans-serif; color: #333;"><h2 style="color: #E50914;">Netflix</h2><p>New sign-in from Mac OS X - Safari (Seattle, US).</p></div>`
                    };
               } else {
                    newPayload = {
                         id, timestamp, source: "promo@aws.amazon.com", subject: "Your AWS Credits have arrived", isJson: false,
                         headers: {
                              "From": "AWS <promo@aws.amazon.com>", "To": endpoint, "Subject": "Your AWS Credits have arrived",
                              "Date": timestamp.toUTCString(), "Received-SPF": "Pass"
                         },
                         security: { spf: "pass", dkim: "pass" },
                         body: `<div style="font-family: Arial, sans-serif; color: #333;"><h2>AWS Promotional Credits</h2><p>Here is your $5,000 AWS Activate code: AWS-1234-ABCD</p></div>`
                    };
               }

               setInbox(prev => [newPayload, ...prev]);
               if (!selectedPayload) setSelectedPayload(newPayload);
               setIsReceiving(false);
          }, 600);
     };

     const getCurlSnippet = () => {
          return `curl -X POST ${endpoint} \\\n  -H "Content-Type: application/json" \\\n  -d '{"message": "Hello from terminal"}'`;
     };

     return (
          <div className="w-full flex flex-col gap-6">

               {/* Header Section */}
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                              {mode === "email" ? <Mail size={24} /> : <Webhook size={24} />}
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-white">Disposable API & Email Tester</h2>
                                   <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 Free Pro Simulation
                                   </span>
                              </div>
                              <p className="text-sm text-gray-400">Generate temp endpoints, simulate localhost tunnels, and mock webhook response codes.</p>
                         </div>
                    </div>
               </div>

               {/* Top Ad Banner */}
               <AdSlot adSlot="top-endpoint-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full">

                    {/* LEFT COLUMN: Controls & Setup (Span 4) */}
                    <div className="lg:col-span-4 flex flex-col gap-4">

                         {/* Main Config */}
                         <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 shadow-xl flex flex-col gap-5">
                              <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-xl border border-gray-800 text-[10px] font-bold">
                                   <button
                                        onClick={() => setMode("webhook")}
                                        className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${mode === "webhook" ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "text-gray-500 hover:text-white"}`}
                                   >
                                        <Webhook size={14} /> Webhook URL
                                   </button>
                                   <button
                                        onClick={() => setMode("email")}
                                        className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${mode === "email" ? "bg-pink-500/20 text-pink-400 border border-pink-500/30" : "text-gray-500 hover:text-white"}`}
                                   >
                                        <Mail size={14} /> Temp Email
                                   </button>
                              </div>

                              {/* Current Endpoint */}
                              <div className="flex flex-col gap-2">
                                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                        Your Temporary {mode === "email" ? "Inbox Address" : "Webhook URL"}
                                   </label>
                                   <div className="relative">
                                        <input
                                             type="text"
                                             readOnly
                                             value={endpoint}
                                             className={`w-full bg-gray-950 border rounded-xl pl-3 pr-10 py-3 text-xs font-mono outline-none shadow-inner ${mode === "email" ? "text-pink-300 border-gray-800" : "text-indigo-300 border-gray-800"}`}
                                        />
                                        <button
                                             onClick={() => copyToClipboard(endpoint)}
                                             className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${mode === "email" ? "text-pink-400 hover:bg-pink-500/10" : "text-indigo-400 hover:bg-indigo-500/10"}`}
                                        >
                                             {isCopied ? <Check size={14} /> : <Copy size={14} />}
                                        </button>
                                   </div>
                              </div>

                              {/* Timer & Session */}
                              <div className="flex items-center justify-between bg-gray-950 border border-gray-800 p-4 rounded-xl">
                                   <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                                             <Clock size={12} /> Auto-Destruct
                                        </span>
                                        <span className={`text-xl font-black font-mono ${timeLeft < 60 ? 'text-rose-500 animate-pulse' : 'text-gray-200'}`}>
                                             {timeLeft <= 0 ? "EXPIRED" : formatTime(timeLeft)}
                                        </span>
                                   </div>
                                   <button onClick={() => generateEndpoint(mode)} className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-2.5 rounded-xl transition-colors" title="Regenerate">
                                        <Trash2 size={16} />
                                   </button>
                              </div>
                         </div>

                         {/* Premium Feature: Traffic Routing & Response (Webhooks Only) */}
                         {mode === "webhook" && (
                              <div className="bg-gray-900 border border-indigo-500/30 rounded-3xl p-5 shadow-[0_0_20px_rgba(99,102,241,0.1)] flex flex-col gap-4">
                                   <div className="flex items-center justify-between border-b border-gray-800/80 pb-2">
                                        <h3 className="text-[11px] font-bold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider">
                                             <ArrowRightLeft size={14} /> Traffic Routing & Response
                                        </h3>
                                        <span className="bg-indigo-500/20 text-indigo-300 text-[8px] font-bold px-1.5 py-0.5 rounded border border-indigo-500/30">PRO SIMULATION</span>
                                   </div>

                                   <div className="space-y-3">
                                        <div className="flex flex-col gap-1.5">
                                             <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-300">
                                                  <input type="checkbox" checked={isForwarding} onChange={() => setIsForwarding(!isForwarding)} className="rounded text-indigo-500 focus:ring-0 bg-gray-950 border-gray-700" />
                                                  Enable Localhost Forwarding
                                             </label>
                                             <input
                                                  type="text" value={forwardUrl} onChange={(e) => setForwardUrl(e.target.value)} disabled={!isForwarding}
                                                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-400 font-mono disabled:opacity-50 outline-none focus:border-indigo-500/50"
                                             />
                                        </div>

                                        <div className="flex items-center justify-between bg-gray-950 border border-gray-800 p-3 rounded-lg">
                                             <span className="text-[10px] font-bold text-gray-400 uppercase">Simulate Response Code</span>
                                             <select value={responseCode} onChange={(e) => setResponseCode(Number(e.target.value))} className="bg-gray-900 text-xs font-mono font-bold text-emerald-400 border border-gray-700 rounded p-1 outline-none">
                                                  <option value={200}>200 OK</option>
                                                  <option value={201}>201 Created</option>
                                                  <option value={400}>400 Bad Request</option>
                                                  <option value={401}>401 Unauthorized</option>
                                                  <option value={500}>500 Server Error</option>
                                             </select>
                                        </div>
                                   </div>
                              </div>
                         )}

                         {/* Code Generators (Webhooks) */}
                         {mode === "webhook" && (
                              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 shadow-xl flex flex-col gap-2">
                                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Terminal size={12} /> Trigger Endpoint</span>
                                   <div className="bg-[#0d1117] border border-gray-800 rounded-lg p-3 relative group">
                                        <pre className="text-[9px] font-mono text-gray-400 overflow-x-auto custom-scrollbar pb-1">{getCurlSnippet()}</pre>
                                        <button onClick={() => copyToClipboard(getCurlSnippet())} className="absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                             <Copy size={12} className="text-gray-400" />
                                        </button>
                                   </div>
                              </div>
                         )}

                         {/* Test Injector */}
                         <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800/80 pb-2 flex items-center gap-1.5"><Play size={12} /> Injection Tester</span>

                              <select
                                   value={mockType}
                                   onChange={(e) => setMockType(e.target.value as MockType)}
                                   className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500/50"
                              >
                                   {mode === "webhook" ? (
                                        <>
                                             <option value="stripe">Stripe (payment_intent.succeeded)</option>
                                             <option value="github">GitHub (Push Event)</option>
                                        </>
                                   ) : (
                                        <>
                                             <option value="email_security">Netflix (Security Alert)</option>
                                             <option value="email_marketing">AWS (Promo Credit)</option>
                                        </>
                                   )}
                              </select>

                              <button
                                   onClick={injectMockPayload}
                                   disabled={isReceiving || timeLeft <= 0}
                                   className={`w-full py-3 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 ${mode === "email" ? "bg-pink-600 hover:bg-pink-500" : "bg-indigo-600 hover:bg-indigo-500"
                                        }`}
                              >
                                   {isReceiving ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                                   Fire Payload
                              </button>
                         </div>

                    </div>

                    {/* RIGHT COLUMN: Inbox & Payload Viewer (Span 8) */}
                    <div className="lg:col-span-8 flex flex-col gap-4 h-full">
                         <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-xl flex flex-col h-full min-h-[750px]">

                              {/* Top Bar: Inbox Header */}
                              <div className="bg-gray-950/90 backdrop-blur-md border-b border-gray-800 p-4 flex items-center justify-between z-10">
                                   <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                        <Server size={16} className={mode === "email" ? "text-pink-400" : "text-indigo-400"} />
                                        Live Request Inspector
                                   </h3>
                                   <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5">
                                             <Activity size={12} className={isReceiving ? "text-emerald-400 animate-pulse" : "text-gray-500"} />
                                             Listening...
                                        </span>
                                        <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-[10px] font-bold">
                                             {inbox.length} Req
                                        </span>
                                   </div>
                              </div>

                              {/* Split Layout: List (Left) / Detail (Right) */}
                              <div className="flex flex-grow overflow-hidden">

                                   {/* Request List */}
                                   <div className="w-1/3 border-r border-gray-800 bg-[#0a0d14] overflow-y-auto custom-scrollbar flex flex-col">
                                        {inbox.length === 0 ? (
                                             <div className="flex flex-col items-center justify-center h-full p-4 text-center gap-3 text-gray-600">
                                                  {mode === "email" ? <Mail size={32} className="opacity-20" /> : <Webhook size={32} className="opacity-20" />}
                                                  <span className="text-xs leading-relaxed">Waiting for traffic...<br />Fire a payload to populate.</span>
                                             </div>
                                        ) : (
                                             inbox.map((payload) => (
                                                  <button
                                                       key={payload.id}
                                                       onClick={() => setSelectedPayload(payload)}
                                                       className={`text-left p-4 border-b border-gray-800 transition-colors ${selectedPayload?.id === payload.id ? 'bg-gray-800/50 border-l-2 ' + (mode === "email" ? "border-l-pink-500" : "border-l-indigo-500") : 'hover:bg-gray-900/50 border-l-2 border-l-transparent'}`}
                                                  >
                                                       <div className="flex items-center justify-between mb-1">
                                                            <span className={`text-[10px] font-bold uppercase truncate ${mode === "email" ? "text-pink-400" : "text-indigo-400"}`}>{payload.source}</span>
                                                            {payload.method && <span className="text-[9px] font-mono bg-indigo-500/20 text-indigo-300 px-1 rounded">{payload.method}</span>}
                                                       </div>
                                                       <h4 className="text-xs font-bold text-gray-200 truncate">{payload.subject}</h4>
                                                       <p className="text-[9px] text-gray-500 mt-1">{payload.timestamp.toLocaleTimeString()}</p>
                                                  </button>
                                             ))
                                        )}
                                   </div>

                                   {/* Request Details */}
                                   <div className="w-2/3 bg-[#0d1117] flex flex-col relative">
                                        {!selectedPayload ? (
                                             <div className="flex flex-col items-center justify-center h-full text-gray-600">
                                                  <span className="text-xs">Select a request to inspect headers and body.</span>
                                             </div>
                                        ) : (
                                             <>
                                                  {/* Security & Metadata Strip */}
                                                  <div className="p-4 bg-gray-950 border-b border-gray-800 flex flex-col gap-3">
                                                       <h3 className="text-base font-bold text-white leading-tight flex items-center gap-2">
                                                            {selectedPayload.method && <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/30">{selectedPayload.method}</span>}
                                                            {selectedPayload.subject}
                                                       </h3>

                                                       <div className="flex flex-wrap items-center gap-3 text-[10px]">
                                                            <span className="text-gray-400 font-mono flex items-center gap-1"><Server size={10} /> {selectedPayload.source}</span>
                                                            <span className="text-gray-400 font-mono flex items-center gap-1"><Clock size={10} /> {selectedPayload.timestamp.toLocaleTimeString()}</span>
                                                       </div>

                                                       {/* Premium Badges (Forwarding & Response) */}
                                                       {(selectedPayload.forwardedTo || selectedPayload.responseSim) && (
                                                            <div className="flex items-center gap-2 mt-1">
                                                                 {selectedPayload.forwardedTo && (
                                                                      <span className="text-[9px] font-bold font-mono bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/30 flex items-center gap-1">
                                                                           <ArrowRightLeft size={10} /> FWD: {selectedPayload.forwardedTo.substring(0, 20)}...
                                                                      </span>
                                                                 )}
                                                                 {selectedPayload.responseSim && (
                                                                      <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded border flex items-center gap-1 ${selectedPayload.responseSim >= 400 ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                                                           }`}>
                                                                           <ArrowRightLeft size={10} /> RES: {selectedPayload.responseSim}
                                                                      </span>
                                                                 )}
                                                            </div>
                                                       )}

                                                       {/* Security Badges */}
                                                       <div className="flex items-center gap-2">
                                                            {mode === "email" && selectedPayload.security.spf && (
                                                                 <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${selectedPayload.security.spf === 'pass' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                                                      {selectedPayload.security.spf === 'pass' ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />} SPF: {selectedPayload.security.spf.toUpperCase()}
                                                                 </span>
                                                            )}
                                                            {mode === "email" && selectedPayload.security.dkim && (
                                                                 <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${selectedPayload.security.dkim === 'pass' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                                                      {selectedPayload.security.dkim === 'pass' ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />} DKIM: {selectedPayload.security.dkim.toUpperCase()}
                                                                 </span>
                                                            )}
                                                            {mode === "webhook" && selectedPayload.security.signatureValid !== undefined && (
                                                                 <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${selectedPayload.security.signatureValid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                                                      {selectedPayload.security.signatureValid ? <ShieldCheck size={10} /> : <AlertTriangle size={10} />} SIGNATURE: VERIFIED
                                                                 </span>
                                                            )}
                                                       </div>
                                                  </div>

                                                  {/* View Tabs */}
                                                  <div className="flex items-center gap-4 px-4 pt-3 border-b border-gray-800 bg-gray-900">
                                                       <button onClick={() => setViewTab("formatted")} className={`pb-2 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${viewTab === "formatted" ? "border-white text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`}>
                                                            {selectedPayload.isJson ? <><FileJson size={12} /> Parsed JSON</> : <><Globe size={12} /> Rendered HTML</>}
                                                       </button>
                                                       <button onClick={() => setViewTab("raw")} className={`pb-2 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${viewTab === "raw" ? "border-white text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`}>
                                                            <Code size={12} /> Raw Body
                                                       </button>
                                                       <button onClick={() => setViewTab("headers")} className={`pb-2 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${viewTab === "headers" ? "border-white text-white" : "border-transparent text-gray-500 hover:text-white"}`}>
                                                            <List size={12} /> Headers
                                                       </button>
                                                  </div>

                                                  {/* Content Area */}
                                                  <div className="flex-grow p-4 overflow-y-auto custom-scrollbar">
                                                       {viewTab === "formatted" && (
                                                            selectedPayload.isJson ? (
                                                                 <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap">
                                                                      {selectedPayload.body}
                                                                 </pre>
                                                            ) : (
                                                                 <div
                                                                      className="bg-white rounded-lg p-5 text-black text-sm shadow-inner min-h-full"
                                                                      dangerouslySetInnerHTML={{ __html: selectedPayload.body }}
                                                                 />
                                                            )
                                                       )}

                                                       {viewTab === "raw" && (
                                                            <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 min-h-full">
                                                                 <pre className="text-[11px] font-mono text-gray-300 whitespace-pre-wrap break-all">
                                                                      {selectedPayload.body}
                                                                 </pre>
                                                            </div>
                                                       )}

                                                       {viewTab === "headers" && (
                                                            <div className="flex flex-col gap-2">
                                                                 {Object.entries(selectedPayload.headers).map(([key, val], idx) => (
                                                                      <div key={idx} className="flex flex-col bg-gray-950 border border-gray-800 rounded-lg p-3 gap-1 hover:border-gray-700 transition-colors">
                                                                           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{key}</span>
                                                                           <span className="text-xs font-mono text-gray-300 break-all">{val}</span>
                                                                      </div>
                                                                 ))}
                                                            </div>
                                                       )}
                                                  </div>
                                             </>
                                        )}
                                   </div>

                              </div>
                         </div>
                    </div>

               </div>

               {/* Bottom Ad Banner */}
               <AdSlot adSlot="bottom-endpoint-ad" format="fluid" className="mt-4" />

          </div>
     );
}