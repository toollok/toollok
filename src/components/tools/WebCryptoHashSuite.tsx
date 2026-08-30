"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import Link from "next/link";
import {
     Fingerprint, Lock, History, Upload, Copy, Check,
     Download, RefreshCw, AlertTriangle, CheckCircle2, XCircle,
     Trash2, ShieldCheck, Zap, FileDigit, ListChecks
} from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import AdSlot from "@/components/ui/AdSlot";

// --- UTILS & CRYPTO ENGINES ---

type Algorithm = "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
type OutputFormat = "hex_lower" | "hex_upper" | "base64";
type InputType = "text" | "file";
type Tab = "hash" | "hmac" | "manifest" | "history";

interface HistoryEntry {
     id: string;
     date: string;
     type: "Hash" | "HMAC";
     algorithm: string;
     inputType: string;
     targetName: string; // File name or "Text Input"
     hash: string;
     size: number;
}

// Format conversions
const buf2hex = (buffer: ArrayBuffer, upper = false) => {
     const hex = Array.prototype.map.call(new Uint8Array(buffer), (x: number) => ('00' + x.toString(16)).slice(-2)).join('');
     return upper ? hex.toUpperCase() : hex;
};

const buf2base64 = (buffer: ArrayBuffer) => {
     let binary = '';
     const bytes = new Uint8Array(buffer);
     for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
     }
     return window.btoa(binary);
};

const str2buf = (str: string): Uint8Array => new TextEncoder().encode(str);

const hex2buf = (hex: string): Uint8Array => {
     const bytes = new Uint8Array(Math.ceil(hex.length / 2));
     for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
     return bytes;
};

const base642buf = (b64: string): Uint8Array => {
     const bin = window.atob(b64);
     const bytes = new Uint8Array(bin.length);
     for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
     return bytes;
};

// Compact MD5 Implementation (Web Crypto lacks MD5 natively)
function md5(bytes: Uint8Array): ArrayBuffer {
     const k = [], i = [];
     for (let i = 0; i < 64; i++) k[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000);
     const info = new Uint8Array(bytes.length + ((128 - ((bytes.length + 8) % 64)) % 64) + 8);
     info.set(bytes);
     info[bytes.length] = 0x80;
     new DataView(info.buffer).setUint32(info.length - 8, bytes.length * 8, true);
     const h = new Uint32Array([0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476]);
     const f = [
          (b: number, c: number, d: number) => (b & c) | (~b & d),
          (b: number, c: number, d: number) => (d & b) | (~d & c),
          (b: number, c: number, d: number) => b ^ c ^ d,
          (b: number, c: number, d: number) => c ^ (b | ~d)
     ];
     const s = [
          7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21
     ];
     for (let i = 0; i < info.length; i += 64) {
          const w = new Uint32Array(info.buffer, i, 16);
          let [a, b, c, d] = h;
          for (let j = 0; j < 64; j++) {
               const div16 = Math.floor(j / 16);
               const func = f[div16];
               let temp = a + func(b, c, d) + k[j];
               if (div16 === 0) temp += w[j];
               else if (div16 === 1) temp += w[(5 * j + 1) % 16];
               else if (div16 === 2) temp += w[(3 * j + 5) % 16];
               else if (div16 === 3) temp += w[(7 * j) % 16];
               temp = Math.imul(temp, 1);
               const rot = (temp << s[(div16 * 4) + (j % 4)]) | (temp >>> (32 - s[(div16 * 4) + (j % 4)]));
               a = d; d = c; c = b; b = (b + rot) | 0;
          }
          h[0] = (h[0] + a) | 0; h[1] = (h[1] + b) | 0;
          h[2] = (h[2] + c) | 0; h[3] = (h[3] + d) | 0;
     }
     return h.buffer;
}

export default function WebCryptoHashSuite() {
     const [activeTab, setActiveTab] = useState<Tab>("hash");

     // Input State
     const [inputType, setInputType] = useState<InputType>("text");
     const [inputText, setInputText] = useState("");
     const [inputFile, setInputFile] = useState<File | null>(null);

     // Hash & HMAC Config
     const [algorithm, setAlgorithm] = useState<Algorithm>("SHA-256");
     const [outputFormat, setOutputFormat] = useState<OutputFormat>("hex_lower");
     const [expectedHash, setExpectedHash] = useState("");
     const [hmacKey, setHmacKey] = useState("");
     const [hmacKeyFormat, setHmacKeyFormat] = useState<"utf8" | "hex" | "base64">("utf8");

     // Execution State
     const [isProcessing, setIsProcessing] = useState(false);
     const [progress, setProgress] = useState(0);
     const [resultHash, setResultHash] = useState<string | null>(null);
     const [processTime, setProcessTime] = useState<number>(0);
     const [verificationResult, setVerificationResult] = useState<boolean | null>(null);

     // Manifest State
     const [manifestFiles, setManifestFiles] = useState<File[]>([]);
     const [manifestResults, setManifestResults] = useState<{ name: string, hash: string, size: number, status: string }[]>([]);

     // History State
     const [history, setHistory] = useState<HistoryEntry[]>([]);

     const fileInputRef = useRef<HTMLInputElement>(null);
     const manifestInputRef = useRef<HTMLInputElement>(null);
     const { isCopied, copy } = useCopyToClipboard(2000);

     // Load History
     useEffect(() => {
          try {
               const saved = localStorage.getItem("toollok_hash_history");
               if (saved) setHistory(JSON.parse(saved));
          } catch (e) { }
     }, []);

     const saveToHistory = (entry: Omit<HistoryEntry, "id" | "date">) => {
          const newEntry: HistoryEntry = {
               ...entry,
               id: Math.random().toString(36).substring(2, 9),
               date: new Date().toISOString()
          };
          const newHistory = [newEntry, ...history].slice(0, 50); // Keep last 50
          setHistory(newHistory);
          localStorage.setItem("toollok_hash_history", JSON.stringify(newHistory));
     };

     const getArrayBuffer = (file: File): Promise<ArrayBuffer> => {
          return new Promise((resolve, reject) => {
               const reader = new FileReader();
               reader.onprogress = (e) => {
                    if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
               };
               reader.onload = () => resolve(reader.result as ArrayBuffer);
               reader.onerror = () => reject(new Error("File read error"));
               reader.readAsArrayBuffer(file);
          });
     };

     const formatOutput = (buffer: ArrayBuffer) => {
          if (outputFormat === "base64") return buf2base64(buffer);
          if (outputFormat === "hex_upper") return buf2hex(buffer, true);
          return buf2hex(buffer, false);
     };

     const runCalculation = async () => {
          if (inputType === "text" && !inputText) return;
          if (inputType === "file" && !inputFile) return;
          if (activeTab === "hmac" && !hmacKey) return;

          setIsProcessing(true);
          setProgress(0);
          setResultHash(null);
          setVerificationResult(null);

          const startTime = performance.now();

          try {
               let dataBuffer: ArrayBuffer | Uint8Array;
               let dataSize = 0;

               if (inputType === "file" && inputFile) {
                    if (inputFile.size > 1024 * 1024 * 500) { // Warn > 500MB
                         if (!window.confirm("This file is very large and may consume significant browser memory. Continue?")) {
                              setIsProcessing(false);
                              return;
                         }
                    }
                    dataBuffer = await getArrayBuffer(inputFile);
                    dataSize = inputFile.size;
               } else {
                    dataBuffer = str2buf(inputText);
                    dataSize = dataBuffer.byteLength;
                    setProgress(100);
               }

               let resultBuffer: ArrayBuffer;

               if (activeTab === "hash") {
                    if (algorithm === "MD5") {
                         resultBuffer = md5(dataBuffer instanceof Uint8Array ? dataBuffer : new Uint8Array(dataBuffer));
                    } else {
                         // Bypassing strict TS buffer union typing with 'as any'
                         resultBuffer = await crypto.subtle.digest(algorithm, dataBuffer as any);
                    }
               } else {
                    // HMAC
                    if (algorithm === "MD5" || algorithm === "SHA-1") {
                         throw new Error("HMAC requires SHA-256, SHA-384, or SHA-512.");
                    }

                    let keyBytes: Uint8Array;
                    if (hmacKeyFormat === "hex") keyBytes = hex2buf(hmacKey);
                    else if (hmacKeyFormat === "base64") keyBytes = base642buf(hmacKey);
                    else keyBytes = str2buf(hmacKey);

                    const cryptoKey = await crypto.subtle.importKey(
                         "raw", keyBytes as any, { name: "HMAC", hash: algorithm }, false, ["sign"]
                    );
                    resultBuffer = await crypto.subtle.sign("HMAC", cryptoKey, dataBuffer as any);
               }

               const finalHash = formatOutput(resultBuffer);
               setResultHash(finalHash);

               // Verify Expected Hash
               if (expectedHash) {
                    const isMatch = finalHash.trim().toLowerCase() === expectedHash.trim().toLowerCase();
                    setVerificationResult(isMatch);
               }

               setProcessTime(Math.round(performance.now() - startTime));

               // Save History
               saveToHistory({
                    type: activeTab === "hash" ? "Hash" : "HMAC",
                    algorithm,
                    inputType,
                    targetName: inputType === "file" && inputFile ? inputFile.name : "Text Input",
                    hash: finalHash,
                    size: dataSize
               });

          } catch (error) {
               console.error(error);
               alert("An error occurred during cryptographic processing. Check inputs and key formats.");
          } finally {
               setIsProcessing(false);
          }
     };

     // Manifest Generator Function
     const generateManifest = async () => {
          if (manifestFiles.length === 0) return;
          setIsProcessing(true);
          setProgress(0);
          const results = [];

          for (let i = 0; i < manifestFiles.length; i++) {
               const file = manifestFiles[i];
               try {
                    const buffer = await getArrayBuffer(file);
                    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer as any);
                    results.push({ name: file.name, size: file.size, hash: buf2hex(hashBuffer), status: "success" });
               } catch (e) {
                    results.push({ name: file.name, size: file.size, hash: "ERROR", status: "failed" });
               }
               setProgress(Math.round(((i + 1) / manifestFiles.length) * 100));
          }

          setManifestResults(results);
          setIsProcessing(false);
     };

     const downloadManifest = () => {
          if (manifestResults.length === 0) return;
          const content = manifestResults.map(r => `${r.hash}  ${r.name}`).join("\n");
          const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `SHA256SUMS.txt`;
          link.click();
          URL.revokeObjectURL(url);
     };

     // Safe keyboard shortcut (using action: () => void)
     useKeyboardShortcuts([
          {
               key: "enter",
               ctrlOrCmd: true,
               action: () => {
                    if (activeTab === "manifest") generateManifest();
                    else runCalculation();
               }
          }
     ]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 px-2 sm:px-4 py-4">

               {/* HEADER SECTION */}
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3.5">
                         <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 shrink-0 shadow-sm">
                              <Fingerprint size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                   <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                        Web Crypto Hash & HMAC Suite
                                   </h1>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
                                        <ShieldCheck size={13} className="text-emerald-500" /> 100% Local & Private
                                   </span>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                   Securely generate checksums, cryptographic hashes, and HMAC signatures directly in your browser.
                              </p>
                         </div>
                    </div>
               </div>

               <AdSlot adSlot="top-hash-suite-ad" format="horizontal" minHeight="90px" className="hidden md:flex" />

               {/* TOP NAVIGATION TABS */}
               <div className="flex flex-wrap gap-2 bg-gray-100 dark:bg-gray-900/50 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-800 w-full md:w-max">
                    <button onClick={() => setActiveTab("hash")} className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === "hash" ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>
                         <FileDigit size={16} /> Hash & Verify
                    </button>
                    <button onClick={() => setActiveTab("hmac")} className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === "hmac" ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>
                         <Lock size={16} /> HMAC Generator
                    </button>
                    <button onClick={() => setActiveTab("manifest")} className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === "manifest" ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>
                         <ListChecks size={16} /> Hash Manifest (Batch)
                    </button>
                    <button onClick={() => setActiveTab("history")} className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === "history" ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>
                         <History size={16} /> History
                    </button>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* LEFT COLUMN: INPUTS & CONFIG */}
                    <div className="lg:col-span-5 flex flex-col gap-5">

                         {(activeTab === "hash" || activeTab === "hmac") && (
                              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col gap-5">

                                   <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Configuration</h3>
                                   </div>

                                   {/* Algorithm Selection */}
                                   <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Algorithm</label>
                                        <select
                                             value={algorithm}
                                             onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
                                             className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 dark:text-white outline-none cursor-pointer"
                                        >
                                             <option value="SHA-256">SHA-256 (Standard)</option>
                                             <option value="SHA-384">SHA-384</option>
                                             <option value="SHA-512">SHA-512 (High Security)</option>
                                             {activeTab === "hash" && <option value="SHA-1">SHA-1 (Legacy / Insecure)</option>}
                                             {activeTab === "hash" && <option value="MD5">MD5 (Legacy / Insecure)</option>}
                                        </select>
                                        {(algorithm === "MD5" || algorithm === "SHA-1") && (
                                             <p className="text-[10px] text-orange-500 mt-1.5 flex items-center gap-1">
                                                  <AlertTriangle size={12} /> Vulnerable to collisions. Do not use for security purposes.
                                             </p>
                                        )}
                                   </div>

                                   {/* Input Type Selection */}
                                   <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Input Mode</label>
                                        <div className="flex bg-gray-100 dark:bg-gray-950 p-1 rounded-xl border border-gray-200 dark:border-gray-800">
                                             <button onClick={() => setInputType("text")} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${inputType === "text" ? "bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white" : "text-gray-500"}`}>Text</button>
                                             <button onClick={() => setInputType("file")} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${inputType === "file" ? "bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white" : "text-gray-500"}`}>File Upload</button>
                                        </div>
                                   </div>

                                   {/* Data Input */}
                                   {inputType === "text" ? (
                                        <textarea
                                             value={inputText}
                                             onChange={(e) => setInputText(e.target.value)}
                                             placeholder="Type or paste text to hash..."
                                             className="w-full h-32 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm text-gray-900 dark:text-gray-200 outline-none focus:border-blue-500 resize-none font-mono"
                                        />
                                   ) : (
                                        <div
                                             onClick={() => fileInputRef.current?.click()}
                                             className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all group"
                                        >
                                             <Upload size={24} className="text-gray-400 group-hover:text-blue-500" />
                                             <div className="text-center">
                                                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                       {inputFile ? inputFile.name : "Click or drag file to hash"}
                                                  </p>
                                                  {inputFile && <p className="text-[10px] text-gray-500 mt-0.5">{(inputFile.size / 1024 / 1024).toFixed(2)} MB</p>}
                                             </div>
                                             <input type="file" ref={fileInputRef} onChange={(e) => setInputFile(e.target.files?.[0] || null)} className="hidden" />
                                        </div>
                                   )}

                                   {/* HMAC Key Input */}
                                   {activeTab === "hmac" && (
                                        <div className="bg-gray-50 dark:bg-gray-950/50 p-4 rounded-xl border border-gray-200 dark:border-gray-800 mt-2">
                                             <div className="flex items-center justify-between mb-2">
                                                  <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Lock size={12} /> Secret Key</label>
                                                  <select value={hmacKeyFormat} onChange={(e) => setHmacKeyFormat(e.target.value as any)} className="bg-transparent text-[10px] font-bold outline-none text-gray-600 dark:text-gray-400 cursor-pointer">
                                                       <option value="utf8">UTF-8 String</option>
                                                       <option value="hex">Hexadecimal</option>
                                                       <option value="base64">Base64</option>
                                                  </select>
                                             </div>
                                             <input
                                                  type="text"
                                                  value={hmacKey}
                                                  onChange={(e) => setHmacKey(e.target.value)}
                                                  placeholder="Enter secret key..."
                                                  className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none font-mono"
                                             />
                                        </div>
                                   )}

                                   {/* Advanced: Expected Hash Verification */}
                                   <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5 flex items-center justify-between">
                                             <span>Verify Expected Checksum (Optional)</span>
                                        </label>
                                        <input
                                             type="text"
                                             value={expectedHash}
                                             onChange={(e) => setExpectedHash(e.target.value)}
                                             placeholder="Paste expected hash to verify match..."
                                             className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white outline-none font-mono"
                                        />
                                   </div>

                                   {/* Action Button */}
                                   <button
                                        onClick={runCalculation}
                                        disabled={isProcessing || (inputType === "text" && !inputText) || (inputType === "file" && !inputFile) || (activeTab === "hmac" && !hmacKey)}
                                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-md mt-2 text-sm"
                                   >
                                        {isProcessing ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
                                        {isProcessing ? `Processing... ${progress}%` : activeTab === "hash" ? "Generate Hash (Ctrl+Enter)" : "Generate HMAC (Ctrl+Enter)"}
                                   </button>

                              </div>
                         )}

                         {activeTab === "manifest" && (
                              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col gap-5">
                                   <h3 className="text-sm font-bold text-gray-900 dark:text-white">Batch Manifest Generator</h3>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Generate a SHA256SUMS file containing cryptographic hashes for multiple files simultaneously.</p>

                                   <div
                                        onClick={() => manifestInputRef.current?.click()}
                                        className="w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all group"
                                   >
                                        <Upload size={32} className="text-gray-400 group-hover:text-blue-500" />
                                        <div className="text-center">
                                             <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Click to select multiple files</p>
                                             <p className="text-[10px] text-gray-500 mt-1">{manifestFiles.length} files selected</p>
                                        </div>
                                        <input type="file" multiple ref={manifestInputRef} onChange={(e) => setManifestFiles(Array.from(e.target.files || []))} className="hidden" />
                                   </div>

                                   <button
                                        onClick={generateManifest}
                                        disabled={isProcessing || manifestFiles.length === 0}
                                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm"
                                   >
                                        {isProcessing ? <RefreshCw size={16} className="animate-spin" /> : <ListChecks size={16} />}
                                        {isProcessing ? `Hashing... ${progress}%` : "Generate SHA-256 Manifest"}
                                   </button>
                              </div>
                         )}
                    </div>

                    {/* RIGHT COLUMN: RESULTS */}
                    <div className="lg:col-span-7 flex flex-col gap-6">

                         {(activeTab === "hash" || activeTab === "hmac") && (
                              <div className="bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl text-gray-900 dark:text-white min-h-[400px] flex flex-col transition-colors">
                                   <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3 mb-6">
                                        <h3 className="font-bold text-sm text-gray-900 dark:text-gray-200">Cryptographic Output</h3>

                                        <div className="flex items-center gap-2 text-xs">
                                             <span className="text-gray-500">Format:</span>
                                             <select
                                                  value={outputFormat}
                                                  onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                                                  className="bg-transparent font-bold text-blue-600 dark:text-blue-400 outline-none cursor-pointer"
                                             >
                                                  <option value="hex_lower">Hex (Lowercase)</option>
                                                  <option value="hex_upper">Hex (Uppercase)</option>
                                                  <option value="base64">Base64</option>
                                             </select>
                                        </div>
                                   </div>

                                   {/* Progress Bar (Visible during processing) */}
                                   {isProcessing && (
                                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mb-6 overflow-hidden">
                                             <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                        </div>
                                   )}

                                   {/* Verification Badge */}
                                   {verificationResult !== null && !isProcessing && (
                                        <div className={`mb-6 p-3 rounded-xl flex items-center gap-3 border ${verificationResult ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400'}`}>
                                             {verificationResult ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                                             <div>
                                                  <h4 className="font-bold text-sm">{verificationResult ? "Checksum Validated Successfully" : "Checksum Mismatch Warning"}</h4>
                                                  <p className="text-xs opacity-80 mt-0.5">{verificationResult ? "The calculated hash exactly matches your expected input." : "The calculated hash does NOT match the expected value. The file may be corrupted or tampered with."}</p>
                                             </div>
                                        </div>
                                   )}

                                   {/* Main Hash Display */}
                                   <div className="flex-1 flex flex-col">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Calculated {algorithm} {activeTab === "hmac" ? "Signature" : "Digest"}</label>
                                        <div className="relative group">
                                             <textarea
                                                  readOnly
                                                  value={resultHash || ""}
                                                  placeholder={isProcessing ? "Processing..." : "Awaiting calculation..."}
                                                  className="w-full h-32 bg-gray-50 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 font-mono text-sm sm:text-base text-gray-800 dark:text-blue-100 break-all resize-none outline-none focus:border-blue-500/50 transition-colors"
                                             />
                                             {resultHash && (
                                                  <button
                                                       onClick={() => copy(resultHash)}
                                                       className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors shadow-sm"
                                                       title="Copy to clipboard"
                                                  >
                                                       {isCopied ? <Check size={16} className="text-emerald-500 dark:text-emerald-400" /> : <Copy size={16} />}
                                                  </button>
                                             )}
                                        </div>
                                   </div>

                                   {/* Metrics Footer */}
                                   {resultHash && !isProcessing && (
                                        <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                                             <div className="bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-center">
                                                  <span className="block text-[10px] text-gray-500 uppercase font-bold">Algorithm</span>
                                                  <span className="block text-xs font-mono font-bold text-gray-800 dark:text-gray-300 mt-0.5">{algorithm}</span>
                                             </div>
                                             <div className="bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-center">
                                                  <span className="block text-[10px] text-gray-500 uppercase font-bold">Processing Time</span>
                                                  <span className="block text-xs font-mono font-bold text-gray-800 dark:text-gray-300 mt-0.5">{processTime} ms</span>
                                             </div>
                                             <div className="bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-center">
                                                  <span className="block text-[10px] text-gray-500 uppercase font-bold">Input Type</span>
                                                  <span className="block text-xs font-mono font-bold text-gray-800 dark:text-gray-300 mt-0.5 capitalize">{inputType}</span>
                                             </div>
                                        </div>
                                   )}
                              </div>
                         )}

                         {activeTab === "manifest" && (
                              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm min-h-[400px] flex flex-col">
                                   <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3 mb-4">
                                        <h3 className="font-bold text-sm text-gray-900 dark:text-white">SHA256SUMS Manifest</h3>
                                        {manifestResults.length > 0 && (
                                             <button onClick={downloadManifest} className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm">
                                                  <Download size={14} /> Download .txt
                                             </button>
                                        )}
                                   </div>

                                   <div className="flex-1 overflow-y-auto max-h-[400px]">
                                        {manifestResults.length === 0 ? (
                                             <div className="h-full flex items-center justify-center text-xs text-gray-400 font-mono py-20">
                                                  No files processed yet.
                                             </div>
                                        ) : (
                                             <table className="w-full text-left text-xs border-collapse">
                                                  <thead>
                                                       <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500">
                                                            <th className="pb-2 font-bold uppercase tracking-wider">File Name</th>
                                                            <th className="pb-2 font-bold uppercase tracking-wider hidden sm:table-cell">Size</th>
                                                            <th className="pb-2 font-bold uppercase tracking-wider">SHA-256 Hash</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {manifestResults.map((res, i) => (
                                                            <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                                                 <td className="py-2.5 font-medium text-gray-800 dark:text-gray-300 truncate max-w-[120px]" title={res.name}>{res.name}</td>
                                                                 <td className="py-2.5 text-gray-500 hidden sm:table-cell">{(res.size / 1024).toFixed(1)} KB</td>
                                                                 <td className="py-2.5 font-mono text-[10px] text-blue-600 dark:text-blue-400 break-all">{res.hash}</td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        )}
                                   </div>
                              </div>
                         )}

                         {activeTab === "history" && (
                              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm min-h-[400px] flex flex-col">
                                   <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3 mb-4">
                                        <h3 className="font-bold text-sm text-gray-900 dark:text-white">Local Generation History</h3>
                                        {history.length > 0 && (
                                             <button onClick={() => { setHistory([]); localStorage.removeItem("toollok_hash_history"); }} className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 font-bold transition-all">
                                                  <Trash2 size={14} /> Clear History
                                             </button>
                                        )}
                                   </div>

                                   <div className="flex-1 overflow-y-auto max-h-[400px]">
                                        {history.length === 0 ? (
                                             <div className="h-full flex items-center justify-center text-xs text-gray-400 font-mono py-20">
                                                  No local history found.
                                             </div>
                                        ) : (
                                             <div className="flex flex-col gap-3">
                                                  {history.map((entry) => (
                                                       <div key={entry.id} className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl p-3 flex flex-col gap-2">
                                                            <div className="flex items-center justify-between">
                                                                 <div className="flex items-center gap-2">
                                                                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase rounded">{entry.type}</span>
                                                                      <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{entry.algorithm}</span>
                                                                 </div>
                                                                 <span className="text-[10px] text-gray-500">{new Date(entry.date).toLocaleString()}</span>
                                                            </div>
                                                            <div className="text-[11px] text-gray-500 truncate">
                                                                 Target: <strong className="text-gray-700 dark:text-gray-300">{entry.targetName}</strong>
                                                            </div>
                                                            <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-2 py-1.5 rounded-lg mt-1">
                                                                 <code className="text-[10px] font-mono text-gray-600 dark:text-gray-400 truncate flex-1">{entry.hash}</code>
                                                                 <button onClick={() => copy(entry.hash)} className="text-gray-400 hover:text-blue-500"><Copy size={12} /></button>
                                                            </div>
                                                       </div>
                                                  ))}
                                             </div>
                                        )}
                                   </div>
                              </div>
                         )}

                    </div>
               </div>

               {/* SEO CONTENT & EDUCATIONAL GUIDE */}
               <div className="mt-8 bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm flex flex-col gap-8 transition-colors">
                    <div>
                         <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-4">
                              Enterprise-Grade Cryptography, Locally in Your Browser
                         </h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                              ToolLok’s completely free <strong>Web Crypto Hash & HMAC Suite</strong> eliminates cloud security risks. Generate secure checksums, verify file integrity, create message authentication codes (HMAC), and export comprehensive SHA256SUMS manifests—all processed securely within your device without relying on external backends.
                         </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl flex flex-col gap-3">
                              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                   <Zap size={16} className="text-blue-500" /> Hardware-Accelerated Hashing
                              </h3>
                              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                   Leverage native Web Crypto APIs to compute SHA-256, SHA-384, and SHA-512 hashes at near-native speeds. Efficiently process large files without freezing your browser tab.
                              </p>
                         </div>
                         <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl flex flex-col gap-3">
                              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                   <ShieldCheck size={16} className="text-emerald-500" /> Zero-Knowledge Architecture
                              </h3>
                              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                   Process confidential keys and proprietary files strictly locally. Absolutely no data is transmitted to cloud servers, ensuring strict compliance with data privacy standards.
                              </p>
                         </div>
                    </div>

                    <div className="flex flex-col gap-4">
                         <h3 className="text-base font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h3>

                         <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Can I hash large files like ISOs or video renders?</h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Yes. The tool utilizes memory-efficient ArrayBuffers, allowing you to hash files hundreds of megabytes in size securely without crashing your browser.</p>
                         </div>

                         <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Are the generated HMAC signatures cryptographically secure?</h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Absolutely. The suite utilizes the browser's native `crypto.subtle` API, which relies on your underlying operating system's verified cryptographic libraries rather than vulnerable third-party JavaScript implementations.</p>
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
                                             "name": "Can I hash large files like ISOs or video renders?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Yes. The tool utilizes memory-efficient ArrayBuffers, allowing you to hash files hundreds of megabytes in size securely without crashing your browser." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "Are the generated HMAC signatures cryptographically secure?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Absolutely. The suite utilizes the browser's native crypto.subtle API, which relies on your underlying operating system's verified cryptographic libraries." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-hash-suite-ad" format="fluid" className="mt-4" />
          </div>
     );
}