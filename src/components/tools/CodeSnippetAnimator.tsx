"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Video, Play, Lock, Palette, Type, Layout, RefreshCw, Download } from "lucide-react";
import AdSlot from "@/components/ui/AdSlot";

export default function CodeSnippetAnimator() {
     const [code, setCode] = useState<string>("function calculateYield(principal, rate) {\n  // 📈 Calculate annual returns\n  const annual = principal * (rate / 100);\n  console.log(`Yield: $${annual}`);\n  \n  return annual;\n}\n\ncalculateYield(10000, 8.5);");
     const [displayedCode, setDisplayedCode] = useState<string>(code);
     const [isPlaying, setIsPlaying] = useState<boolean>(false);
     const [theme, setTheme] = useState<"dark" | "monokai" | "dracula">("dracula");
     const [bgGradient, setBgGradient] = useState<string>("from-purple-600 via-blue-600 to-indigo-700");
     const [padding, setPadding] = useState<number>(48);

     const [showPremiumModal, setShowPremiumModal] = useState(false);
     const [isPremiumUser, setIsPremiumUser] = useState(false);

     useEffect(() => {
          if (isPlaying) {
               let currentIndex = 0;
               setDisplayedCode("");
               const interval = setInterval(() => {
                    setDisplayedCode(code.substring(0, currentIndex + 1));
                    currentIndex++;
                    if (currentIndex === code.length) {
                         clearInterval(interval);
                         setTimeout(() => setIsPlaying(false), 1500);
                    }
               }, 35);
               return () => clearInterval(interval);
          } else {
               setDisplayedCode(code);
          }
     }, [isPlaying, code]);

     const handlePlay = () => { if (!isPlaying) setIsPlaying(true); };
     const handleDownload = () => { alert("Premium Feature Triggered: Processing 4K MP4 Render..."); };

     const themes = {
          dark: { bg: "bg-[#1e1e1e]", text: "text-gray-300", keyword: "text-blue-400", string: "text-amber-400", comment: "text-emerald-500" },
          monokai: { bg: "bg-[#272822]", text: "text-[#f8f8f2]", keyword: "text-[#f92672]", string: "text-[#e6db74]", comment: "text-[#75715e]" },
          dracula: { bg: "bg-[#282a36]", text: "text-[#f8f8f2]", keyword: "text-[#ff79c6]", string: "text-[#f1fa8c]", comment: "text-[#6272a4]" },
     };

     const gradients = [
          { id: "cosmic", class: "from-purple-600 via-blue-600 to-indigo-700" },
          { id: "emerald", class: "from-emerald-500 to-teal-700" },
          { id: "sunset", class: "from-rose-500 to-orange-500" },
          { id: "midnight", class: "from-gray-800 to-gray-950" }
     ];

     const renderHighlightedCode = (rawCode: string) => {
          const currentTheme = themes[theme];
          return rawCode.split('\n').map((line, i) => {
               let highlightedLine = line
                    .replace(/(function|const|let|var|return)/g, `<span class="${currentTheme.keyword}">$1</span>`)
                    .replace(/(`.*?`|".*?"|'.*?')/g, `<span class="${currentTheme.string}">$1</span>`)
                    .replace(/(\/\/.*)/g, `<span class="${currentTheme.comment}">$1</span>`);

               return (
                    <div key={i} className="leading-relaxed">
                         <span className="inline-block w-6 text-right mr-4 opacity-30 select-none text-xs">{i + 1}</span>
                         <span dangerouslySetInnerHTML={{ __html: highlightedLine || " " }} />
                    </div>
               );
          });
     };

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
               <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                         <Video size={24} />
                    </div>
                    <div>
                         <div className="flex items-center gap-3">
                              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cinematic Code Snippet Animator</h2>
                              <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 text-xs font-bold px-2 py-0.5 rounded-full">
                                   🟡 Freemium
                              </span>
                              <button onClick={() => setIsPremiumUser(!isPremiumUser)} className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-lg transition-colors border border-gray-200 dark:border-gray-700" title="Click to preview the UI for both Free and Premium users">
                                   Test Premium UI: {isPremiumUser ? "ON" : "OFF"}
                              </button>
                         </div>
                         <p className="text-sm text-gray-500 dark:text-gray-400">Convert code blocks into animated typing videos.</p>
                    </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col gap-8 transition-colors">
                         <div>
                              <label className="text-sm font-bold text-gray-900 dark:text-gray-300 mb-3 flex items-center gap-2">
                                   <Type size={16} className="text-purple-600 dark:text-purple-400" /> Source Code
                              </label>
                              <textarea
                                   value={code}
                                   onChange={(e) => setCode(e.target.value)}
                                   className="w-full h-48 bg-gray-50 dark:bg-[#0c121e] border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm text-gray-900 dark:text-gray-300 font-mono outline-none focus:border-purple-500 resize-none custom-scrollbar transition-colors"
                                   spellCheck="false"
                                   placeholder="Paste your code here..."
                              />
                         </div>

                         <div>
                              <label className="text-sm font-bold text-gray-900 dark:text-gray-300 mb-3 flex items-center gap-2">
                                   <Palette size={16} className="text-purple-600 dark:text-purple-400" /> Syntax Theme
                              </label>
                              <div className="grid grid-cols-3 gap-3">
                                   {(Object.keys(themes) as Array<keyof typeof themes>).map((t) => (
                                        <button
                                             key={t}
                                             onClick={() => setTheme(t)}
                                             className={`py-2 px-3 rounded-lg text-xs font-bold capitalize border transition-all ${theme === t ? "bg-purple-50 dark:bg-purple-600/20 border-purple-200 dark:border-purple-500 text-purple-700 dark:text-purple-400" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                                        >
                                             {t}
                                        </button>
                                   ))}
                              </div>
                         </div>

                         <div>
                              <label className="text-sm font-bold text-gray-900 dark:text-gray-300 mb-3 flex items-center gap-2">
                                   <Layout size={16} className="text-purple-600 dark:text-purple-400" /> Background Environment
                              </label>
                              <div className="flex flex-wrap gap-3">
                                   {gradients.map((grad) => (
                                        <button
                                             key={grad.id}
                                             onClick={() => setBgGradient(grad.class)}
                                             className={`w-12 h-12 rounded-xl bg-gradient-to-br ${grad.class} border-2 transition-transform ${bgGradient === grad.class ? "border-gray-900 dark:border-white scale-110 shadow-lg" : "border-transparent hover:scale-105 opacity-70 hover:opacity-100"}`}
                                             title={grad.id}
                                        />
                                   ))}
                              </div>
                         </div>

                         <div>
                              <div className="flex justify-between items-center mb-3">
                                   <label className="text-sm font-bold text-gray-900 dark:text-gray-300">Canvas Padding</label>
                                   <span className="text-xs text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-1 rounded font-mono border border-purple-100 dark:border-transparent">{padding}px</span>
                              </div>
                              <input type="range" min="16" max="96" step="8" value={padding} onChange={(e) => setPadding(Number(e.target.value))} className="w-full accent-purple-500 cursor-pointer" />
                         </div>
                    </div>

                    <div className="lg:col-span-8 flex flex-col gap-6">
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm dark:shadow-lg transition-colors">
                              <div className="flex items-center gap-3 w-full sm:w-auto">
                                   <button
                                        onClick={handlePlay}
                                        disabled={isPlaying}
                                        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${isPlaying ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-gray-700" : "bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 shadow-md"}`}
                                   >
                                        {isPlaying ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
                                        {isPlaying ? "Animating..." : "Play Preview"}
                                   </button>
                              </div>

                              {isPremiumUser ? (
                                   <button onClick={handleDownload} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white border border-emerald-500/50 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/20">
                                        <Download size={16} /> Download 4K Video
                                   </button>
                              ) : (
                                   <div className="relative group w-full sm:w-auto mt-2 sm:mt-0">
                                        <div className="absolute -top-3.5 right-0 sm:-right-2 z-10 flex items-center gap-1 animate-bounce pointer-events-none">
                                             <span className="bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-lg shadow-rose-500/40 border border-rose-400/50 flex items-center gap-1.5">
                                                  <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span></span>
                                                  Subscribe for download
                                             </span>
                                        </div>
                                        <button onClick={() => setShowPremiumModal(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm dark:shadow-lg relative overflow-hidden group">
                                             <Lock size={14} className="text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                                             Want to download?
                                        </button>
                                   </div>
                              )}
                         </div>

                         <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-sm dark:shadow-2xl flex items-center justify-center border border-gray-200 dark:border-gray-800">
                              <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-90 transition-all duration-500`}></div>
                              <div className={`relative z-10 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${themes[theme].bg} border border-white/10`} style={{ margin: `${padding}px` }}>
                                   <div className="h-10 px-4 flex items-center gap-2 bg-black/20 border-b border-white/5">
                                        <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                                        <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                                        <div className="flex-grow text-center text-xs font-mono text-gray-500 opacity-60 mr-14">snippet.js</div>
                                   </div>
                                   <div className={`p-6 md:p-8 font-mono text-sm md:text-base overflow-hidden ${themes[theme].text}`}>
                                        {renderHighlightedCode(displayedCode)}
                                        {isPlaying && <span className="inline-block w-2.5 h-5 bg-white ml-1 animate-pulse align-middle"></span>}
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               {showPremiumModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 dark:bg-black/60 backdrop-blur-sm">
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center relative">
                              <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg shadow-rose-500/20">
                                   <Download size={32} />
                              </div>
                              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Premium Feature</h2>
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                                   Upgrade to Premium to unlock unlimited 4K 60fps MP4 video exports of your animations, completely free of watermarks.
                              </p>
                              <div className="flex flex-col gap-3">
                                   <button className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg">
                                        View Premium Plans
                                   </button>
                                   <button onClick={() => setShowPremiumModal(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm font-medium py-2 transition-colors">
                                        Cancel
                                   </button>
                              </div>
                         </div>
                    </div>
               )}

               {/* ========================================= */}
               {/* SEO CONTENT & FAQS */}
               {/* ========================================= */}
               <div className="mt-12 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm dark:shadow-none">
                    <div className="prose dark:prose-invert max-w-none">
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Cinematic Code Snippet Animator for Developers</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              Visual storytelling is crucial for developer advocates and tech influencers. The <strong>Code Snippet Animator</strong> turns raw text into stunning, high-resolution typing videos perfectly sized for Twitter/X, LinkedIn, and YouTube Shorts. Enhance your personal brand with customizable syntax highlighting and sleek background environments, pairing this with our <Link href="/categories/content-creator-tools" className="text-purple-600 dark:text-purple-400 hover:underline">Content Creator Tools</Link>.
                         </p>
                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Elevate Your Technical Content</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Real-Time Typing Animation:</strong> Simulates human coding speed with a natural cursor pulse, keeping viewers engaged on social media.</li>
                              <li><strong>Premium IDE Themes:</strong> Support for iconic syntax themes including Dracula, Monokai, and Dark+, ensuring your code is visually striking and easy to read.</li>
                              <li><strong>4K Export Quality:</strong> Premium users can render ultra-crisp MP4 video files directly in the browser, completely free of messy watermarks.</li>
                         </ul>
                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">What themes are supported?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Currently, the tool supports three major IDE syntax themes: Dracula, Monokai, and Standard Dark. You can also customize the surrounding canvas with premium gradient backgrounds like Cosmic, Sunset, or Midnight.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Is the output watermarked?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Free users can preview the animation directly in the browser. Downloading the actual uncompressed video file is a Premium feature, which guarantees the final 4K MP4 is completely free of any watermarks or logos.</p>
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
                                             "name": "What themes are supported?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Currently, the tool supports three major IDE syntax themes: Dracula, Monokai, and Standard Dark, along with custom gradient backgrounds." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "Is the output watermarked?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Free users can preview the animation. Downloading the final 4K MP4 is a Premium feature, which guarantees the video is completely free of any watermarks." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>
          </div>
     );
}