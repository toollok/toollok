"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Key, Zap, Lock, RefreshCw, Copy, Check, Eye, EyeOff, AlertTriangle, ShieldAlert, Binary, CheckCircle2, Clock, Terminal, Hash, FileBadge, XCircle } from "lucide-react";
import AdSlot from "@/components/ui/AdSlot";

export default function PasswordEntropyAnalyzer() {
     const [passwordInput, setPasswordInput] = useState("");
     const [showPassword, setShowPassword] = useState(false);
     const [isCopied, setIsCopied] = useState(false);

     const [genLength, setGenLength] = useState(24);
     const [genOpts, setGenOpts] = useState({ upper: true, lower: true, num: true, sym: true });
     const [genPreset, setGenPreset] = useState<"standard" | "hex" | "base64">("standard");

     const [hashes, setHashes] = useState({ sha256: "", sha512: "" });
     const [copiedHash, setCopiedHash] = useState<"sha256" | "sha512" | null>(null);

     useEffect(() => {
          const generateHashes = async () => {
               if (!passwordInput) {
                    setHashes({ sha256: "", sha512: "" });
                    return;
               }
               try {
                    const encoder = new TextEncoder();
                    const data = encoder.encode(passwordInput);
                    const hash256Buffer = await crypto.subtle.digest('SHA-256', data);
                    const hash512Buffer = await crypto.subtle.digest('SHA-512', data);
                    const hash256Array = Array.from(new Uint8Array(hash256Buffer));
                    const hash512Array = Array.from(new Uint8Array(hash512Buffer));
                    const hash256Hex = hash256Array.map(b => b.toString(16).padStart(2, '0')).join('');
                    const hash512Hex = hash512Array.map(b => b.toString(16).padStart(2, '0')).join('');
                    setHashes({ sha256: hash256Hex, sha512: hash512Hex });
               } catch (e) {
                    console.error("Hashing failed", e);
               }
          };
          generateHashes();
     }, [passwordInput]);

     const copyHash = (type: "sha256" | "sha512") => {
          navigator.clipboard.writeText(hashes[type]);
          setCopiedHash(type);
          setTimeout(() => setCopiedHash(null), 2000);
     };

     const analysis = useMemo(() => {
          const pwd = passwordInput || "";
          const length = pwd.length;

          let poolSize = 0;
          const hasLower = /[a-z]/.test(pwd);
          const hasUpper = /[A-Z]/.test(pwd);
          const hasNum = /[0-9]/.test(pwd);
          const hasSym = /[^a-zA-Z0-9]/.test(pwd);

          let typesCount = 0;
          if (hasLower) { poolSize += 26; typesCount++; }
          if (hasUpper) { poolSize += 26; typesCount++; }
          if (hasNum) { poolSize += 10; typesCount++; }
          if (hasSym) { poolSize += 32; typesCount++; }

          const entropyBits = poolSize === 0 ? 0 : length * Math.log2(poolSize);
          const combinations = poolSize === 0 ? 0 : Math.pow(poolSize, length);
          const hashesPerSecond = 100_000_000_000;
          const secondsToCrack = combinations / hashesPerSecond;

          let crackTimeStr = "Instantly";
          let strengthScore = 0;
          let colorClass = "text-rose-600 dark:text-rose-500";
          let bgClass = "bg-rose-500";
          let borderClass = "border-rose-200 dark:border-rose-500/30";

          if (length === 0) {
               crackTimeStr = "N/A";
          } else if (secondsToCrack < 1) {
               crackTimeStr = "Instantly"; strengthScore = 10;
          } else if (secondsToCrack < 60) {
               crackTimeStr = `${Math.round(secondsToCrack)} seconds`; strengthScore = 20;
          } else if (secondsToCrack < 3600) {
               crackTimeStr = `${Math.round(secondsToCrack / 60)} minutes`; strengthScore = 30;
               colorClass = "text-amber-600 dark:text-amber-500"; bgClass = "bg-amber-500"; borderClass = "border-amber-200 dark:border-amber-500/30";
          } else if (secondsToCrack < 86400) {
               crackTimeStr = `${Math.round(secondsToCrack / 3600)} hours`; strengthScore = 40;
               colorClass = "text-amber-600 dark:text-amber-500"; bgClass = "bg-amber-500"; borderClass = "border-amber-200 dark:border-amber-500/30";
          } else if (secondsToCrack < 31536000) {
               crackTimeStr = `${Math.round(secondsToCrack / 86400)} days`; strengthScore = 60;
               colorClass = "text-yellow-600 dark:text-yellow-400"; bgClass = "bg-yellow-500 dark:bg-yellow-400"; borderClass = "border-yellow-200 dark:border-yellow-400/30";
          } else if (secondsToCrack < 3153600000) {
               crackTimeStr = `${Math.round(secondsToCrack / 31536000)} years`; strengthScore = 80;
               colorClass = "text-emerald-600 dark:text-emerald-400"; bgClass = "bg-emerald-500 dark:bg-emerald-400"; borderClass = "border-emerald-200 dark:border-emerald-500/30";
          } else if (secondsToCrack < 3153600000000) {
               crackTimeStr = `${Math.round(secondsToCrack / 3153600000)} centuries`; strengthScore = 90;
               colorClass = "text-cyan-600 dark:text-cyan-400"; bgClass = "bg-cyan-500 dark:bg-cyan-400"; borderClass = "border-cyan-200 dark:border-cyan-500/30";
          } else {
               crackTimeStr = "Millions of years (Uncrackable)"; strengthScore = 100;
               colorClass = "text-indigo-600 dark:text-indigo-400"; bgClass = "bg-indigo-500 dark:bg-indigo-400"; borderClass = "border-indigo-200 dark:border-indigo-500/30";
          }

          const threats: { msg: string; type: "critical" | "warning" | "info" }[] = [];
          const lowerPwd = pwd.toLowerCase();

          if (length > 0) {
               if (length < 12) threats.push({ msg: "Under 12 characters. Highly vulnerable to modern brute-force arrays.", type: "critical" });
               if (!hasNum && !hasSym) threats.push({ msg: "Missing numbers and symbols limits mathematical entropy.", type: "warning" });
               if (/^[a-zA-Z]+$/.test(pwd)) threats.push({ msg: "Dictionary attack vulnerability: Only letters used.", type: "critical" });
               if (/(.)\1{2,}/.test(pwd)) threats.push({ msg: "Repeated character sequences detected (e.g., 'aaa').", type: "warning" });
               if (/(qwerty|asdf|zxcv|1234|qaz|wsx|edc)/i.test(lowerPwd)) threats.push({ msg: "Spatial keyboard walk detected (e.g., 'qwerty').", type: "critical" });
               if (/(password|admin|root|login|welcome|letmein)/i.test(lowerPwd)) threats.push({ msg: "Top 100 common dictionary base word detected.", type: "critical" });
          }

          const compliance = {
               nist: length >= 8 && threats.filter(t => t.type === 'critical').length === 0,
               pci: length >= 12 && hasNum && (hasLower || hasUpper),
               apple: length >= 8 && hasLower && hasUpper && hasNum,
               ad: length >= 14 && typesCount >= 3
          };

          return { entropyBits: Math.round(entropyBits * 10) / 10, poolSize, crackTimeStr, strengthScore, colorClass, bgClass, borderClass, threats, compliance, charSets: { hasLower, hasUpper, hasNum, hasSym } };
     }, [passwordInput]);

     const generateSecureKey = () => {
          const charsetLower = "abcdefghijklmnopqrstuvwxyz";
          const charsetUpper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
          const charsetNum = "0123456789";
          const charsetSym = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
          const charsetHex = "0123456789abcdef";
          const charsetBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

          let pool = ""; let generated = "";
          const randomValues = new Uint32Array(genLength);
          window.crypto.getRandomValues(randomValues);

          if (genPreset === "hex") {
               pool = charsetHex;
          } else if (genPreset === "base64") {
               pool = charsetBase64;
          } else {
               if (genOpts.lower) pool += charsetLower;
               if (genOpts.upper) pool += charsetUpper;
               if (genOpts.num) pool += charsetNum;
               if (genOpts.sym) pool += charsetSym;
               if (pool === "") pool = charsetLower;
          }

          for (let i = 0; i < genLength; i++) {
               generated += pool[randomValues[i] % pool.length];
          }
          setPasswordInput(generated);
     };

     useEffect(() => {
          generateSecureKey();
          // eslint-disable-next-line react-hooks/exhaustive-deps
     }, []);

     const copyToClipboard = () => {
          if (!passwordInput) return;
          navigator.clipboard.writeText(passwordInput);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
     };

     return (
          <div className="w-full flex flex-col gap-6">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20">
                              <Key size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Password & API Key Analyzer</h2>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Offline
                                   </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Evaluate cryptographic entropy, test brute-force resistance, and generate cryptographically secure keys.</p>
                         </div>
                    </div>
               </div>

               <div className="bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 rounded-xl p-4 flex items-center gap-3 transition-colors">
                    <Lock size={20} className="text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                    <p className="text-xs text-cyan-800 dark:text-cyan-100/80 leading-relaxed">
                         <strong className="text-cyan-700 dark:text-cyan-400">Zero-Telemetry Guarantee:</strong> Your passwords and generated keys never leave your browser. Analysis and Hash Generation are performed entirely in local memory using JavaScript and the Web Crypto API.
                    </p>
               </div>

               <AdSlot adSlot="top-password-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full">
                    <div className="lg:col-span-5 flex flex-col gap-6 h-full">
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col gap-5 transition-colors">
                              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-300 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800/80 pb-3">
                                   <ShieldCheck size={16} className="text-cyan-600 dark:text-cyan-400" /> Target Password or Key
                              </h3>

                              <div className="relative">
                                   <input
                                        type={showPassword ? "text" : "password"}
                                        value={passwordInput}
                                        onChange={(e) => setPasswordInput(e.target.value)}
                                        placeholder="Type or paste a password..."
                                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl pl-4 pr-12 py-3.5 text-sm text-gray-900 dark:text-white font-mono outline-none focus:border-cyan-500/50 transition-colors shadow-inner"
                                   />
                                   <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 transition-colors p-1">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                   </button>
                              </div>

                              <div className="flex gap-2">
                                   <button onClick={() => setPasswordInput("")} className="flex-1 py-2.5 bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold rounded-xl transition-colors">
                                        Clear Input
                                   </button>
                                   <button onClick={copyToClipboard} className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md dark:shadow-lg dark:shadow-cyan-500/20">
                                        {isCopied ? <Check size={14} /> : <Copy size={14} />} {isCopied ? "Copied!" : "Copy Key"}
                                   </button>
                              </div>
                         </div>

                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col gap-5 transition-colors">
                              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-300 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800/80 pb-3">
                                   <Zap size={16} className="text-emerald-600 dark:text-emerald-400" /> Secure Key Generator
                              </h3>

                              <div className="space-y-4">
                                   <div>
                                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Key Architecture</label>
                                        <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-950 p-1 rounded-xl border border-gray-200 dark:border-gray-800 text-[10px] font-bold">
                                             <button onClick={() => setGenPreset("standard")} className={`flex-1 py-1.5 rounded-lg transition-colors ${genPreset === "standard" ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm dark:shadow-none" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}>Standard</button>
                                             <button onClick={() => setGenPreset("hex")} className={`flex-1 py-1.5 rounded-lg transition-colors ${genPreset === "hex" ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm dark:shadow-none" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}>Hex (256-bit)</button>
                                             <button onClick={() => setGenPreset("base64")} className={`flex-1 py-1.5 rounded-lg transition-colors ${genPreset === "base64" ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm dark:shadow-none" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}>Base64</button>
                                        </div>
                                   </div>

                                   <div>
                                        <div className="flex justify-between items-center mb-2">
                                             <label className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Length (Chars)</label>
                                             <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">{genLength}</span>
                                        </div>
                                        <input type="range" min="8" max="128" step="1" value={genLength} onChange={(e) => setGenLength(parseInt(e.target.value))} className="w-full accent-emerald-500" />
                                   </div>

                                   {genPreset === "standard" && (
                                        <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 dark:bg-gray-950 p-3 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors">
                                             <label className="flex items-center gap-2 cursor-pointer group">
                                                  <input type="checkbox" checked={genOpts.upper} onChange={(e) => setGenOpts({ ...genOpts, upper: e.target.checked })} className="rounded text-emerald-500 focus:ring-0 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700" />
                                                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Uppercase [A-Z]</span>
                                             </label>
                                             <label className="flex items-center gap-2 cursor-pointer group">
                                                  <input type="checkbox" checked={genOpts.lower} onChange={(e) => setGenOpts({ ...genOpts, lower: e.target.checked })} className="rounded text-emerald-500 focus:ring-0 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700" />
                                                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Lowercase [a-z]</span>
                                             </label>
                                             <label className="flex items-center gap-2 cursor-pointer group">
                                                  <input type="checkbox" checked={genOpts.num} onChange={(e) => setGenOpts({ ...genOpts, num: e.target.checked })} className="rounded text-emerald-500 focus:ring-0 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700" />
                                                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Numbers [0-9]</span>
                                             </label>
                                             <label className="flex items-center gap-2 cursor-pointer group">
                                                  <input type="checkbox" checked={genOpts.sym} onChange={(e) => setGenOpts({ ...genOpts, sym: e.target.checked })} className="rounded text-emerald-500 focus:ring-0 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700" />
                                                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Symbols [@#$]</span>
                                             </label>
                                        </div>
                                   )}
                              </div>

                              <button onClick={generateSecureKey} className="w-full py-3 mt-2 bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                                   <RefreshCw size={14} /> Generate Cryptographic Key
                              </button>
                         </div>

                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col gap-4 transition-colors">
                              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-300 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800/80 pb-3">
                                   <Hash size={16} className="text-indigo-600 dark:text-indigo-400" /> Developer Hash Output
                              </h3>

                              {passwordInput.length === 0 ? (
                                   <div className="text-xs text-gray-500 text-center py-4 italic">Enter a password to generate secure Web Crypto hashes.</div>
                              ) : (
                                   <div className="space-y-4">
                                        <div className="flex flex-col gap-1.5">
                                             <div className="flex items-center justify-between">
                                                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SHA-256</span>
                                                  <button onClick={() => copyHash("sha256")} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center gap-1">
                                                       {copiedHash === "sha256" ? <Check size={10} /> : <Copy size={10} />} Copy
                                                  </button>
                                             </div>
                                             <div className="bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-lg p-2.5 overflow-x-auto custom-scrollbar transition-colors">
                                                  <span className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">{hashes.sha256}</span>
                                             </div>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                             <div className="flex items-center justify-between">
                                                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SHA-512</span>
                                                  <button onClick={() => copyHash("sha512")} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center gap-1">
                                                       {copiedHash === "sha512" ? <Check size={10} /> : <Copy size={10} />} Copy
                                                  </button>
                                             </div>
                                             <div className="bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-lg p-2.5 overflow-x-auto custom-scrollbar transition-colors">
                                                  <span className="text-[10px] font-mono text-gray-600 dark:text-gray-400 break-all leading-tight">{hashes.sha512}</span>
                                             </div>
                                        </div>
                                   </div>
                              )}
                         </div>
                    </div>

                    <div className="lg:col-span-7 flex flex-col gap-6">
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col gap-6 min-h-[500px] transition-colors">
                              <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${analysis.bgClass.replace('bg-', 'bg-').replace('500', '500/10')} ${analysis.borderClass}`}>
                                   <div className="flex flex-col gap-1.5">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${analysis.colorClass}`}>
                                             <Clock size={14} /> Est. GPU Brute-Force Time
                                        </span>
                                        <span className={`text-2xl sm:text-3xl font-black ${analysis.colorClass}`}>
                                             {analysis.crackTimeStr}
                                        </span>
                                   </div>
                                   <div className="text-right sm:text-left text-[9px] text-gray-500 dark:text-gray-500 font-mono flex flex-col gap-0.5 bg-white dark:bg-gray-950/50 p-2 rounded-lg border border-gray-200 dark:border-gray-900 transition-colors">
                                        <span>Threat Model: 100B hashes/sec</span>
                                        <span>Attack Vector: Offline Hardware Array</span>
                                   </div>
                              </div>

                              <div className="space-y-2">
                                   <div className="flex justify-between items-end">
                                        <span className="text-xs font-bold text-gray-900 dark:text-gray-300">Overall Strength Score</span>
                                        <span className={`text-xs font-bold font-mono ${analysis.colorClass}`}>{analysis.strengthScore} / 100</span>
                                   </div>
                                   <div className="w-full h-2 bg-gray-100 dark:bg-gray-950 rounded-full overflow-hidden border border-gray-200 dark:border-gray-800/80 transition-colors">
                                        <div className={`h-full transition-all duration-500 ${analysis.bgClass}`} style={{ width: `${analysis.strengthScore}%` }} />
                                   </div>
                              </div>

                              <div className="grid grid-cols-3 gap-3">
                                   <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-4 rounded-xl flex flex-col gap-1 transition-colors">
                                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><Binary size={12} /> Shannon Entropy</span>
                                        <span className={`text-lg font-black font-mono ${analysis.entropyBits > 60 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-gray-200'}`}>{analysis.entropyBits} <span className="text-[10px] font-normal text-gray-500">bits</span></span>
                                   </div>
                                   <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-4 rounded-xl flex flex-col gap-1 transition-colors">
                                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><Terminal size={12} /> Character Pool</span>
                                        <span className="text-lg font-black font-mono text-gray-900 dark:text-gray-200">{analysis.poolSize} <span className="text-[10px] font-normal text-gray-500">chars</span></span>
                                   </div>
                                   <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-4 rounded-xl flex flex-col gap-1 transition-colors">
                                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><Key size={12} /> Total Length</span>
                                        <span className={`text-lg font-black font-mono ${passwordInput.length >= 16 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-gray-200'}`}>{passwordInput.length} <span className="text-[10px] font-normal text-gray-500">len</span></span>
                                   </div>
                              </div>

                              <div className="flex items-center gap-2">
                                   <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${analysis.charSets.hasLower ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30' : 'bg-gray-50 dark:bg-gray-950 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-800'}`}>Lowercase</span>
                                   <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${analysis.charSets.hasUpper ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30' : 'bg-gray-50 dark:bg-gray-950 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-800'}`}>Uppercase</span>
                                   <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${analysis.charSets.hasNum ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30' : 'bg-gray-50 dark:bg-gray-950 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-800'}`}>Numbers</span>
                                   <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${analysis.charSets.hasSym ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30' : 'bg-gray-50 dark:bg-gray-950 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-800'}`}>Symbols</span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2 pt-4 border-t border-gray-100 dark:border-gray-800/80 transition-colors">
                                   <div className="flex flex-col gap-3">
                                        <h4 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                                             <ShieldAlert size={12} /> Threat Forensics
                                        </h4>
                                        {passwordInput.length === 0 ? (
                                             <div className="flex items-center text-[10px] text-gray-500 italic">Enter password for analysis.</div>
                                        ) : analysis.threats.length === 0 ? (
                                             <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-2.5 rounded-lg flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold transition-colors">
                                                  <CheckCircle2 size={14} /> No common vulnerabilities or weak keyboard patterns detected.
                                             </div>
                                        ) : (
                                             <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                                                  {analysis.threats.map((threat, i) => (
                                                       <div key={i} className={`p-2.5 rounded-lg flex items-start gap-2 text-[10px] border transition-colors ${threat.type === 'critical' ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400' : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400'}`}>
                                                            <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                                                            <span className="leading-snug font-bold">{threat.msg}</span>
                                                       </div>
                                                  ))}
                                             </div>
                                        )}
                                   </div>

                                   <div className="flex flex-col gap-3">
                                        <h4 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                                             <FileBadge size={12} /> Policy Compliance Sandbox
                                        </h4>
                                        <div className="flex flex-col gap-2">
                                             <div className={`p-2.5 rounded-lg border flex items-center justify-between text-[10px] font-bold transition-colors ${passwordInput.length === 0 ? 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-500' : analysis.compliance.nist ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400'}`}>
                                                  <span>NIST 800-63B Guidelines</span>
                                                  {passwordInput.length === 0 ? '-' : analysis.compliance.nist ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                             </div>
                                             <div className={`p-2.5 rounded-lg border flex items-center justify-between text-[10px] font-bold transition-colors ${passwordInput.length === 0 ? 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-500' : analysis.compliance.pci ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400'}`}>
                                                  <span>PCI-DSS v4.0 Standard</span>
                                                  {passwordInput.length === 0 ? '-' : analysis.compliance.pci ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                             </div>
                                             <div className={`p-2.5 rounded-lg border flex items-center justify-between text-[10px] font-bold transition-colors ${passwordInput.length === 0 ? 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-500' : analysis.compliance.apple ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400'}`}>
                                                  <span>Apple ID Requirements</span>
                                                  {passwordInput.length === 0 ? '-' : analysis.compliance.apple ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                             </div>
                                             <div className={`p-2.5 rounded-lg border flex items-center justify-between text-[10px] font-bold transition-colors ${passwordInput.length === 0 ? 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-500' : analysis.compliance.ad ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400'}`}>
                                                  <span>Strict Active Directory</span>
                                                  {passwordInput.length === 0 ? '-' : analysis.compliance.ad ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* ========================================= */}
               {/* SEO CONTENT & FAQS */}
               {/* ========================================= */}
               <div className="mt-12 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm dark:shadow-none">
                    <div className="prose dark:prose-invert max-w-none">
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Secure Password Entropy & Cryptographic Hash Analyzer</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              Is your security key truly uncrackable? The ToolLok <strong>Password Entropy Analyzer</strong> allows developers and systems administrators to scientifically evaluate cryptographic strength. Operating 100% offline via the Web Crypto API, you can analyze passwords, detect spatial keyboard walks, and generate secure SHA-256 and SHA-512 hashes. Combine this with our <Link href="/categories/privacy-tools" className="text-cyan-600 dark:text-cyan-400 hover:underline">Privacy Tools</Link> to audit your entire digital footprint.
                         </p>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Enterprise Security Features</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Shannon Entropy Mathematics:</strong> Calculates the exact mathematical resistance of your key against modern GPU hardware arrays capable of billions of hashes per second.</li>
                              <li><strong>Compliance Sandbox:</strong> Instantly check your passwords against strict corporate standards like NIST 800-63B and PCI-DSS v4.0.</li>
                              <li><strong>CSPRNG Key Generation:</strong> Uses Cryptographically Secure Pseudorandom Number Generators to output high-entropy Base64, Hex, or standard keys safely in your browser.</li>
                         </ul>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">What is Shannon Entropy in passwords?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Shannon Entropy is a metric that measures the unpredictability of a password based on its length and the pool of characters used. A password with 60+ bits of entropy is generally considered highly resistant to offline brute-force attacks.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Are passwords generated online safe to use?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Typically, generating passwords online is risky if the server logs your input. However, ToolLok's generator uses your browser's local memory (`window.crypto.getRandomValues`) and never transmits your data to an external server, guaranteeing absolute zero-retention privacy.</p>
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
                                             "name": "What is Shannon Entropy in passwords?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Shannon Entropy measures the unpredictability of a password based on its length and character pool. 60+ bits is considered highly resistant to brute-force attacks." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "Are passwords generated online safe to use?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "ToolLok's generator is completely safe because it uses your browser's local Web Crypto API. Your passwords are never transmitted to or logged on our servers." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-password-ad" format="fluid" className="mt-4" />
          </div>
     );
}