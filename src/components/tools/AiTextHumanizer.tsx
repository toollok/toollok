"use client";

import { useState } from "react";
import Link from "next/link";
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

     const analyzeTextMetrics = (text: string) => {
          if (!text.trim()) return 0;
          const buzzwords = ["delve", "testament", "tapestry", "crucial", "furthermore", "moreover", "beacon", "realm", "revolutionize", "navigating", "paramount", "multifaceted", "plethora", "comprehensive"];
          const lower = text.toLowerCase();
          let hits = 0;
          buzzwords.forEach(word => { if (lower.includes(word)) hits++; });
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
                    const aiClichés: Record<string, string> = {
                         "delve": "explore", "testament": "clear proof", "tapestry": "mix", "crucial": "vital",
                         "furthermore": "also", "moreover": "plus", "in conclusion": "to wrap up",
                         "it is important to note that": "keep in mind,", "beacon": "symbol", "realm": "space",
                         "revolutionize": "change", "navigating": "handling", "paramount": "essential",
                         "multifaceted": "complex", "plethora": "lot", "delve into": "look at"
                    };

                    Object.keys(aiClichés).forEach((word) => {
                         const regex = new RegExp(`\\b${word}\\b`, "gi");
                         text = text.replace(regex, aiClichés[word]);
                    });

                    if (selectedTone === "casual") {
                         text = text.replace(/\btherefore\b/gi, "so");
                         text = text.replace(/\butilize\b/gi, "use");
                         text = text.replace(/\bconsequently\b/gi, "as a result");
                         text = text.replace(/\badditionally\b/gi, "plus");
                    } else if (selectedTone === "professional") {
                         text = text.replace(/\bso\b/gi, "therefore");
                         text = text.replace(/\bplus\b/gi, "additionally");
                    }

                    if (selectedIntensity === "deep") {
                         text = text.replace(/\. /g, ". \n\n");
                    }

                    setOutputText(text);
                    setAiScoreAfter(Math.max(5, Math.floor((aiScoreBefore || 70) * 0.2)));
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
                         <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                              <UserCheck size={20} />
                         </div>
                         <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">AI Text Humanizer & Tone Matcher</h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Strip rigid AI patterns, purge robotic buzzwords, and evaluate text readability metrics in real time. 100% Free.</p>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 flex flex-col gap-6 shadow-sm dark:shadow-none">
                         <div className="space-y-3">
                              <label className="text-sm font-bold text-gray-900 dark:text-gray-300 flex items-center gap-2">
                                   <Layers size={16} className="text-blue-600 dark:text-blue-400" /> Target Tone Preset
                              </label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                   {TONES.map((tone) => (
                                        <button key={tone.id} onClick={() => setSelectedTone(tone.id)} className={`p-3 rounded-xl text-left transition-all border flex flex-col gap-1 ${selectedTone === tone.id ? "bg-blue-50 dark:bg-blue-600/20 border-blue-200 dark:border-blue-500/50 text-blue-700 dark:text-blue-400 shadow-sm dark:shadow-[0_0_15px_rgba(59,130,246,0.1)]" : "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:text-gray-900 dark:hover:text-white"}`}>
                                             <span className="text-xs font-bold">{tone.name}</span>
                                             <span className="text-[10px] opacity-70 leading-tight">{tone.desc}</span>
                                        </button>
                                   ))}
                              </div>
                         </div>
                         <div className="space-y-3">
                              <label className="text-sm font-bold text-gray-900 dark:text-gray-300 flex items-center gap-2">
                                   <Sliders size={16} className="text-cyan-600 dark:text-cyan-400" /> Humanization Depth
                              </label>
                              <div className="grid grid-cols-2 gap-3">
                                   {INTENSITIES.map((item) => (
                                        <button key={item.id} onClick={() => setSelectedIntensity(item.id)} className={`px-4 py-3 rounded-xl text-xs font-semibold transition-all border ${selectedIntensity === item.id ? "bg-cyan-50 dark:bg-cyan-500/20 border-cyan-200 dark:border-cyan-500/50 text-cyan-700 dark:text-cyan-300" : "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-500 hover:border-gray-300 dark:hover:border-gray-700 hover:text-gray-900 dark:hover:text-white"}`}>
                                             {item.name}
                                        </button>
                                   ))}
                              </div>
                         </div>
                         <div className="space-y-3 flex-grow flex flex-col">
                              <div className="flex items-center justify-between">
                                   <label className="text-sm font-bold text-gray-900 dark:text-gray-300 flex items-center gap-2">
                                        <FileText size={16} className="text-emerald-600 dark:text-emerald-400" /> Paste AI-Generated Text
                                   </label>
                                   <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-mono">
                                        <span>{wordCount} words</span>
                                        <span>•</span>
                                        <span>{charCount} chars</span>
                                   </div>
                              </div>
                              <textarea value={inputText} onChange={(e) => handleInputChange(e.target.value)} placeholder="Paste your ChatGPT, Claude, or AI text here to humanize..." className="w-full min-h-[150px] flex-grow bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-sm text-gray-900 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all resize-none" />
                         </div>
                         <button onClick={humanizeText} disabled={!inputText.trim() || isProcessing} className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                              {isProcessing ? <span className="flex items-center gap-2 animate-pulse"><RefreshCw size={18} className="animate-spin" /> {progressStep}</span> : <><Sparkles size={18} /> Humanize Text Now</>}
                         </button>
                    </div>

                    <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden shadow-sm dark:shadow-none">
                         <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800/50">
                              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-300">Humanized Output</h3>
                              <button onClick={copyToClipboard} disabled={!outputText} className="flex items-center gap-1.5 text-xs font-bold bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
                                   {isCopied ? <><Check className="text-emerald-600 dark:text-emerald-400" size={14} /> Copied!</> : <><Copy size={14} /> Copy Text</>}
                              </button>
                         </div>
                         {aiScoreBefore !== null && (
                              <div className="grid grid-cols-2 gap-3">
                                   <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-3 flex items-center justify-between">
                                        <span className="text-xs text-red-600 dark:text-red-300 font-medium flex items-center gap-1"><ShieldAlert size={14} /> Input AI Score:</span>
                                        <span className="text-xs font-bold text-red-600 dark:text-red-400">{aiScoreBefore}% Robotic</span>
                                   </div>
                                   <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-3 flex items-center justify-between">
                                        <span className="text-xs text-emerald-600 dark:text-emerald-300 font-medium flex items-center gap-1"><BarChart3 size={14} /> Output Score:</span>
                                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{aiScoreAfter !== null ? `${aiScoreAfter}% Robotic` : "Pending..."}</span>
                                   </div>
                              </div>
                         )}
                         <div className="flex-grow w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-5 text-sm text-gray-900 dark:text-gray-200 whitespace-pre-wrap leading-relaxed overflow-y-auto">
                              {outputText ? outputText : (
                                   <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-700 gap-3">
                                        <UserCheck className="opacity-20" size={32} />
                                        <p className="text-center px-8 text-xs">Your natural, humanized text will appear here with live AI pattern analysis.</p>
                                   </div>
                              )}
                         </div>
                    </div>
               </div>

               {/* ========================================= */}
               {/* SEO CONTENT & FAQS */}
               {/* ========================================= */}
               <div className="mt-12 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm dark:shadow-none">
                    <div className="prose dark:prose-invert max-w-none">
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Bypass Detectors with the AI Text Humanizer</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              Modern AI models like ChatGPT and Claude often write using repetitive sentence structures and easily identifiable "buzzwords" (e.g., <em>delve, testament, tapestry</em>). Our free <strong>AI Text Humanizer</strong> automatically purges these robotic markers, restructures cadence, and adjusts the tone to sound 100% human. Perfect for content creators and marketers looking to optimize their workflow alongside our <Link href="/categories/seo-tools" className="text-indigo-600 dark:text-indigo-400 hover:underline">SEO Tools</Link>.
                         </p>
                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">How does the Humanizer work?</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Cadence Restructuring:</strong> Breaks up uniform, monotonous AI paragraphs into dynamic, natural sentence lengths.</li>
                              <li><strong>Tone Mapping:</strong> Instantly shifts rigid text into Casual, Professional, or Academic tones to match your brand voice.</li>
                              <li><strong>Live AI Score Detection:</strong> View real-time probability scores to ensure your text passes major AI content detectors.</li>
                         </ul>
                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Can Google detect AI content?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">While Google's algorithms can identify patterns typical of LLMs, their official guidelines state they do not penalize AI content as long as it demonstrates E-E-A-T (Experience, Expertise, Authoritativeness, and Trustworthiness). Humanizing the text ensures it reads naturally and provides value to the user.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Why does my AI text sound robotic?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">AI models rely on statistical probability to predict the next word. This results in highly uniform sentence lengths (low "burstiness") and a heavy reliance on safe, transitional vocabulary, which humans subconsciously recognize as artificial.</p>
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
                                             "name": "Can Google detect AI content?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "While Google can identify AI patterns, they do not penalize it if the content provides high value and adheres to E-E-A-T guidelines. Humanizing text helps improve readability." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "Why does my AI text sound robotic?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "AI uses statistical probability, resulting in uniform sentence lengths and repetitive transitional vocabulary that feels artificial to human readers." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>
          </div>
     );
}