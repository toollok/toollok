"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings2, Copy, Check, Play, Sparkles } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import AdSlot from "@/components/ui/AdSlot";

type AnimationType = "morphing-wave" | "geometric-pulse" | "smooth-float" | "clean-expand";
type EasingType = "ease" | "linear" | "ease-in-out" | "cubic-bezier(0.68, -0.55, 0.265, 1.55)";

export default function CssAnimationBuilder() {
     const [animType, setAnimType] = useState<AnimationType>("morphing-wave");
     const [duration, setDuration] = useState<number>(3);
     const [easing, setEasing] = useState<EasingType>("ease-in-out");
     const [isPlaying, setIsPlaying] = useState<boolean>(true);

     const { isCopied, copy } = useCopyToClipboard(2000);

     const keyframesMap: Record<AnimationType, string> = {
          "morphing-wave": `
@keyframes morphing-wave {
  0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
  100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
}`,
          "geometric-pulse": `
@keyframes geometric-pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  70% { transform: scale(1.04); box-shadow: 0 0 0 16px rgba(59, 130, 246, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}`,
          "smooth-float": `
@keyframes smooth-float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
  100% { transform: translateY(0px); }
}`,
          "clean-expand": `
@keyframes clean-expand {
  0% { letter-spacing: normal; opacity: 1; }
  50% { letter-spacing: 4px; opacity: 0.85; }
  100% { letter-spacing: normal; opacity: 1; }
}`
     };

     const generatedCSS = `.animated-element {\n  animation: ${animType} ${duration}s ${easing} infinite;\n}\n${keyframesMap[animType]}`.trim();

     useKeyboardShortcuts([
          { key: "c", ctrlOrCmd: true, action: () => copy(generatedCSS) }
     ]);

     return (
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
               <style>{isPlaying ? keyframesMap[animType] : ""}</style>

               <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                         <Settings2 size={24} />
                    </div>
                    <div>
                         <h2 className="text-2xl font-bold text-gray-900 dark:text-white">CSS Micro-Interaction & Animation Builder</h2>
                         <p className="text-sm text-gray-500 dark:text-gray-400">Design clean, geometric CSS morphing transitions and micro-interactions.</p>
                    </div>
               </div>

               <AdSlot adSlot="top-css-anim-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-md dark:shadow-xl flex flex-col gap-6 transition-colors">
                         <h3 className="text-gray-900 dark:text-white font-bold text-lg border-b border-gray-200 dark:border-gray-800/60 pb-3">Interaction Controls</h3>

                         <div className="space-y-3">
                              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Geometric Effect</label>
                              <div className="grid grid-cols-2 gap-3">
                                   {[
                                        { id: "morphing-wave", label: "Morphing Wave" },
                                        { id: "geometric-pulse", label: "Geometric Pulse" },
                                        { id: "smooth-float", label: "Smooth Float" },
                                        { id: "clean-expand", label: "Clean Expand" }
                                   ].map((type) => (
                                        <button
                                             key={type.id}
                                             onClick={() => setAnimType(type.id as AnimationType)}
                                             className={`py-3 px-4 rounded-xl text-sm font-bold transition-all border ${animType === type.id
                                                  ? "bg-blue-50 dark:bg-blue-600/20 border-blue-200 dark:border-blue-500/50 text-blue-600 dark:text-blue-400 shadow-none dark:shadow-lg dark:shadow-blue-500/10"
                                                  : "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                                  }`}
                                        >
                                             {type.label}
                                        </button>
                                   ))}
                              </div>
                         </div>

                         <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Loop Duration</label>
                                   <span className="text-blue-600 dark:text-blue-400 font-mono bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded text-xs font-bold">{duration}s</span>
                              </div>
                              <input
                                   type="range"
                                   min="0.5" max="8" step="0.5"
                                   value={duration}
                                   onChange={(e) => setDuration(Number(e.target.value))}
                                   className="w-full accent-blue-500 cursor-pointer"
                              />
                         </div>

                         <div className="space-y-3">
                              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Easing Curve</label>
                              <select
                                   value={easing}
                                   onChange={(e) => setEasing(e.target.value as EasingType)}
                                   className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-500 appearance-none font-medium cursor-pointer transition-colors"
                              >
                                   <option value="ease">Ease (Default Standard)</option>
                                   <option value="linear">Linear</option>
                                   <option value="ease-in-out">Ease-In-Out Smooth</option>
                                   <option value="cubic-bezier(0.68, -0.55, 0.265, 1.55)">Cubic-Bezier Bouncy</option>
                              </select>
                         </div>
                    </div>

                    <div className="lg:col-span-6 flex flex-col gap-6">
                         <div className="bg-gray-50 dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 flex items-center justify-center relative min-h-[300px] shadow-sm dark:shadow-xl overflow-hidden transition-colors">
                              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
                              <button
                                   onClick={() => setIsPlaying(!isPlaying)}
                                   className="absolute top-4 right-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-xl transition-colors z-10"
                              >
                                   <Play size={16} className={isPlaying ? "text-blue-600 dark:text-blue-400" : ""} />
                              </button>
                              <div
                                   className="bg-gradient-to-tr from-blue-600 to-cyan-400 shadow-2xl flex items-center justify-center text-white font-bold tracking-widest z-0 transition-shadow"
                                   style={{
                                        width: "140px",
                                        height: "140px",
                                        animation: isPlaying ? `${animType} ${duration}s ${easing} infinite` : "none",
                                   }}
                              >
                                   {animType === "clean-expand" ? "SaaS" : <Sparkles size={36} />}
                              </div>
                         </div>

                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 relative shadow-sm dark:shadow-xl transition-colors">
                              <div className="flex items-center justify-between mb-3">
                                   <span className="text-xs text-gray-500 dark:text-gray-500 font-mono uppercase tracking-widest">Output.css</span>
                                   <button
                                        onClick={() => copy(generatedCSS)}
                                        className="flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg transition-colors font-bold"
                                   >
                                        {isCopied ? <Check size={14} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={14} />}
                                        {isCopied ? "Copied!" : "Copy CSS"}
                                   </button>
                              </div>
                              <pre className="text-xs font-mono text-gray-600 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap leading-relaxed bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 transition-colors">
                                   <code className="text-emerald-600 dark:text-emerald-400">.animated-element</code> {"{\n"}
                                   {"  "}animation: <span className="text-blue-600 dark:text-blue-400">{animType}</span> <span className="text-amber-600 dark:text-amber-400">{duration}s</span> <span className="text-purple-600 dark:text-purple-400">{easing}</span> infinite;{"\n}\n\n"}
                                   <span className="text-gray-500 dark:text-gray-500">{keyframesMap[animType]}</span>
                              </pre>
                         </div>
                    </div>
               </div>

               <AdSlot adSlot="bottom-css-anim-ad" format="fluid" className="mt-4" />

               {/* ========================================= */}
               {/* SEO CONTENT & FAQS */}
               {/* ========================================= */}
               <div className="mt-12 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm dark:shadow-none">
                    <div className="prose dark:prose-invert max-w-none">
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Free CSS Micro-Interaction & Animation Builder</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              Modern frontend development requires professional, high-performance UI components. The ToolLok <strong>CSS Animation Builder</strong> allows you to instantly generate strictly geometric, clean morphing wave effects without relying on messy rotational or distorted animations. By avoiding chaotic visual effects, you ensure your UI remains premium and distraction-free. Combine this with our <Link href="/categories/developer-tools" className="text-indigo-600 dark:text-indigo-400 hover:underline">Developer Tools</Link> to build superior digital experiences.
                         </p>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Why Choose Geometric CSS Animations?</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Zero-Distortion Guarantee:</strong> Keep interfaces professional with strict mathematical morphing, avoiding erratic rotational bugs that break container boundaries.</li>
                              <li><strong>Pure CSS Performance:</strong> Everything runs natively in the browser's render engine. No heavy JavaScript libraries or external dependencies are required.</li>
                              <li><strong>Instant Integration:</strong> Simply tweak the easing curves and duration, copy the raw CSS output, and drop it directly into your stylesheet.</li>
                         </ul>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Why should I avoid rotational or distorted CSS animations?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Strictly geometric, smooth animations (like morphing waves or clean expands) provide a much more professional and modern user experience compared to chaotic rotational effects, which can distract users, trigger motion sensitivity, or cause layout shifts.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Do these animations work on mobile devices?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Yes. Because the code utilizes native CSS `transform` and `border-radius` keyframes, the animations are hardware-accelerated by the GPU, ensuring a silky smooth 60fps framerate on all mobile and desktop browsers.</p>
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
                                             "name": "Why should I avoid rotational or distorted CSS animations?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Strictly geometric, smooth animations provide a professional and modern user experience compared to chaotic rotational effects, which can distract users or cause layout shifts." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "Do these animations work on mobile devices?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Yes. Because the code utilizes native CSS transform and border-radius keyframes, the animations are hardware-accelerated by the GPU, ensuring a smooth 60fps framerate." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>
          </div>
     );
}