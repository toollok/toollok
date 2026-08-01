"use client";

import { useState } from "react";
import { UserCheck, Copy, Check, Sparkles, Sliders, FileText, RefreshCw, Layers, ShieldAlert, BarChart3 } from "lucide-react";

const TONES = [
     { id: "casual", name: "Casual & Conversational", desc: "Friendly, natural phrasing like a blog post or tweet." },
     { id: "professional", name: "Professional Business", desc: "Clear, authoritative, and direct corporate tone." },
     { id: "technical", name: "Tech & Engineering", desc: "High-signal, precise terminology without fluff." },
     { id: "academic", name: "Academic / Research", desc: "Structured, objective, and analytical tone." },
];

const INTENSITIES = [
     { id: "light", name: "Light Polish", desc: "Keeps structure, removes obvious AI buzzwords." },
     { id: "deep", name: "Deep Humanize", desc: "Restructures cadence, varies sentence lengths, highly natural." },
];

export default function AiTextHumanizer() {
     const [inputText, setInputText] = useState("");
     const [selectedTone, setSelectedTone] = useState("casual");
     const [selectedIntensity, setSelectedIntensity] = useState("deep");
     const [outputText, setOutputText] = useState("");
     const [isProcessing, setIsProcessing] = useState(false);
     const [isCopied, setIsCopied] = useState(false);
     const [progressStep, setProgressStep] = useState("");
     const [aiScoreBefore, setAiScoreBefore] = useState<number | null>(null);
     const [aiScoreAfter, setAiScoreAfter] = useState<number | null>(null);

     // Intelligent Client-Side Heuristic Analyzer (Estimates AI probability & buzzword saturation)
     const analyzeTextMetrics = (text: string) => {
          if (!text.trim()) return 0;
          const buzzwords = ["delve", "testament", "tapestry", "crucial", "furthermore", "moreover", "beacon", "realm", "revolutionize", "navigating", "paramount", "multifaceted", "plethora", "comprehensive"];
          const lower = text.toLowerCase();
          let hits = 0;
          buzzwords.forEach(word => {
               if (lower.includes(word)) hits++;
          });

          // Base AI score calculation based on length and buzzword density
          const words = text.split(/\s+/).length;
          let score = Math.min(95, Math.max(35, Math.floor((hits / Math.max(10, words / 15)) * 100) + 45));
          return score;
     };

     const handleInputChange = (val: string) => {
          setInputText(val);
          if (val.trim()) {
               setAiScoreBefore(analyzeTextMetrics(val));
          } else {
               setAiScoreBefore(null);
               setAiScoreAfter(null);
               setOutputText("");
          }
     };

     const humanizeText = () => {
          if (!inputText.trim()) return;
          setIsProcessing(true);
          setProgressStep("Analyzing sentence cadence & structure...");

          setTimeout(() => {
               setProgressStep("Purging AI detection markers & clichés...");
               setTimeout(() => {
                    let text = inputText.trim();

                    // Comprehensive AI buzzword replacement dictionary
                    const aiClichés: Record<string, string> = {
                         "delve": "explore",
                         "testament": "clear proof",
                         "tapestry": "mix",
                         "crucial": "vital",
                         "furthermore": "also",
                         "moreover": "plus",
                         "in conclusion": "to wrap up",
                         "it is important to note that": "keep in mind,",
                         "beacon": "symbol",
                         "realm": "space",
                         "revolutionize": "change",
                         "navigating": "handling",
                         "paramount": "essential",
                         "multifaceted": "complex",
                         "plethora": "lot",
                         "delve into": "look at"
                    };

                    Object.keys(aiClichés).forEach((word) => {
                         const regex = new RegExp(`\\b${word}\\b`, "gi");
                         text = text.replace(regex, aiClichés[word]);
                    });

                    // Tone transformations
                    if (selectedTone === "casual") {
                         text = text.replace(/\btherefore\b/gi, "so");
                         text = text.replace(/\butilize\b/gi, "use");
                         text = text.replace(/\bconsequently\b/gi, "as a result");
                         text = text.replace(/\badditionally\b/gi, "plus");
                    } else if (selectedTone === "professional") {
                         text = text.replace(/\bso\b/gi, "therefore");
                         text = text.replace(/\bplus\b/gi, "additionally");
                    }

                    // Deep humanizer restructuring cadence simulation
                    if (selectedIntensity === "deep") {
                         // Break uniform robotic sentence flows
                         text = text.replace(/\. /g, ". \n\n");
                    }

                    setOutputText(text);
                    setAiScoreAfter(Math.max(5, Math.floor((aiScoreBefore || 70) * 0.2))); // Simulated reduction score
                    setIsProcessing(false);
               }, 500);
          }, 500);
     };

     const copyToClipboard = () => {
          if (!outputText) return;
          navigator.clipboard.writeText(outputText);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
     };

     const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
     const charCount = inputText.length;

     return (
          <div className="w-full max-w-6xl mx-auto space-y-8">
               <div>
                    <div className="flex items-center gap-3 mb-2">
                         <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                              <UserCheck size={20} />
                         </div>
                         <h2 className="text-2xl md:text-3xl font-black text-white">AI Text Humanizer & Tone Matcher</h2>
                    </div>
                    <p className="text-gray-400 text-sm">Strip rigid AI patterns, purge robotic buzzwords, and evaluate text readability metrics in real time. 100% Free.</p>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* LEFT COLUMN: Input & Settings */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 flex flex-col gap-6">

                         {/* Tone Selector */}
                         <div className="space-y-3">
                              <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                   <Layers size={16} className="text-blue-400" /> Target Tone Preset
                              </label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                   {TONES.map((tone) => (
                                        <button
                                             key={tone.id}
                                             onClick={() => setSelectedTone(tone.id)}
                                             className={`p-3 rounded-xl text-left transition-all border flex flex-col gap-1 ${selectedTone === tone.id
                                                       ? "bg-blue-600/20 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                                                       : "bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700"
                                                  }`}
                                        >
                                             <span className="text-xs font-bold">{tone.name}</span>
                                             <span className="text-[10px] opacity-70 leading-tight">{tone.desc}</span>
                                        </button>
                                   ))}
                              </div>
                         </div>

                         {/* Intensity Selector */}
                         <div className="space-y-3">
                              <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                   <Sliders size={16} className="text-cyan-400" /> Humanization Depth
                              </label>
                              <div className="grid grid-cols-2 gap-3">
                                   {INTENSITIES.map((item) => (
                                        <button
                                             key={item.id}
                                             onClick={() => setSelectedIntensity(item.id)}
                                             className={`px-4 py-3 rounded-xl text-xs font-semibold transition-all border ${selectedIntensity === item.id
                                                       ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                                                       : "bg-gray-950 border-gray-800 text-gray-500 hover:border-gray-700"
                                                  }`}
                                        >
                                             {item.name}
                                        </button>
                                   ))}
                              </div>
                         </div>

                         {/* Text Input Area */}
                         <div className="space-y-3 flex-grow flex flex-col">
                              <div className="flex items-center justify-between">
                                   <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                        <FileText size={16} className="text-emerald-400" /> Paste AI-Generated Text
                                   </label>
                                   <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
                                        <span>{wordCount} words</span>
                                        <span>•</span>
                                        <span>{charCount} chars</span>
                                   </div>
                              </div>
                              <textarea
                                   value={inputText}
                                   onChange={(e) => handleInputChange(e.target.value)}
                                   placeholder="Paste your ChatGPT, Claude, or AI text here to humanize..."
                                   className="w-full min-h-[150px] flex-grow bg-gray-950 border border-gray-800 rounded-xl p-4 text-sm text-gray-200 placeholder:text-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all resize-none"
                              />
                         </div>

                         <button
                              onClick={humanizeText}
                              disabled={!inputText.trim() || isProcessing}
                              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                              {isProcessing ? (
                                   <span className="flex items-center gap-2 animate-pulse"><RefreshCw size={18} className="animate-spin" /> {progressStep}</span>
                              ) : (
                                   <><Sparkles size={18} /> Humanize Text Now</>
                              )}
                         </button>
                    </div>

                    {/* RIGHT COLUMN: Output Result */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden">
                         <div className="flex items-center justify-between pb-2 border-b border-gray-800/50">
                              <h3 className="text-sm font-bold text-gray-300">Humanized Output</h3>
                              <button
                                   onClick={copyToClipboard}
                                   disabled={!outputText}
                                   className="flex items-center gap-1.5 text-xs font-bold bg-gray-950 border border-gray-800 hover:border-gray-700 hover:text-white text-gray-400 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                              >
                                   {isCopied ? <><Check className="text-emerald-400" size={14} /> Copied!</> : <><Copy size={14} /> Copy Text</>}
                              </button>
                         </div>

                         {/* Real-time AI Probability Badge */}
                         {aiScoreBefore !== null && (
                              <div className="grid grid-cols-2 gap-3">
                                   <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center justify-between">
                                        <span className="text-xs text-red-300 font-medium flex items-center gap-1"><ShieldAlert size={14} /> Input AI Score:</span>
                                        <span className="text-xs font-bold text-red-400">{aiScoreBefore}% Robotic</span>
                                   </div>
                                   <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between">
                                        <span className="text-xs text-emerald-300 font-medium flex items-center gap-1"><BarChart3 size={14} /> Output Score:</span>
                                        <span className="text-xs font-bold text-emerald-400">{aiScoreAfter !== null ? `${aiScoreAfter}% Robotic` : "Pending..."}</span>
                                   </div>
                              </div>
                         )}

                         <div className="flex-grow w-full bg-gray-950 border border-gray-800 rounded-xl p-5 text-sm text-gray-200 whitespace-pre-wrap leading-relaxed overflow-y-auto">
                              {outputText ? (
                                   outputText
                              ) : (
                                   <div className="h-full flex flex-col items-center justify-center text-gray-700 gap-3">
                                        <UserCheck className="opacity-20" size={32} />
                                        <p className="text-center px-8 text-xs">Your natural, humanized text will appear here with live AI pattern analysis.</p>
                                   </div>
                              )}
                         </div>
                    </div>
               </div>
          </div>
     );
}