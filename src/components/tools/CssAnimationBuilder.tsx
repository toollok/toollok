"use client";

import { useState } from "react";
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

     // Keyframe definitions mapped strictly to clean geometric transformations
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

     // Shortcuts: Cmd/Ctrl + C to copy code
     useKeyboardShortcuts([
          { key: "c", ctrlOrCmd: true, action: () => copy(generatedCSS) }
     ]);

     return (
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">

               <style>{isPlaying ? keyframesMap[animType] : ""}</style>

               {/* Header Section */}
               <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20">
                         <Settings2 size={24} />
                    </div>
                    <div>
                         <h2 className="text-2xl font-bold text-white">CSS Micro-Interaction & Animation Builder</h2>
                         <p className="text-sm text-gray-400">Design clean, geometric CSS morphing transitions and micro-interactions.</p>
                    </div>
               </div>

               {/* Top Ad Banner */}
               <AdSlot adSlot="top-css-anim-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Input Controls */}
                    <div className="lg:col-span-6 bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl flex flex-col gap-6">
                         <h3 className="text-white font-bold text-lg border-b border-gray-800/60 pb-3">Interaction Controls</h3>

                         <div className="space-y-3">
                              <label className="text-xs font-bold text-gray-400 uppercase">Geometric Effect</label>
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
                                                  ? "bg-blue-600/20 border-blue-500/50 text-blue-400 shadow-lg shadow-blue-500/10"
                                                  : "bg-gray-950 border-gray-800 text-gray-400 hover:text-white"
                                                  }`}
                                        >
                                             {type.label}
                                        </button>
                                   ))}
                              </div>
                         </div>

                         <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                   <label className="text-xs font-bold text-gray-400 uppercase">Loop Duration</label>
                                   <span className="text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded text-xs font-bold">{duration}s</span>
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
                              <label className="text-xs font-bold text-gray-400 uppercase">Easing Curve</label>
                              <select
                                   value={easing}
                                   onChange={(e) => setEasing(e.target.value as EasingType)}
                                   className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 appearance-none font-medium cursor-pointer"
                              >
                                   <option value="ease">Ease (Default Standard)</option>
                                   <option value="linear">Linear</option>
                                   <option value="ease-in-out">Ease-In-Out Smooth</option>
                                   <option value="cubic-bezier(0.68, -0.55, 0.265, 1.55)">Cubic-Bezier Bouncy</option>
                              </select>
                         </div>
                    </div>

                    {/* Visual Canvas & Code Output */}
                    <div className="lg:col-span-6 flex flex-col gap-6">

                         {/* Canvas */}
                         <div className="bg-[#0c121e] border border-gray-800 rounded-3xl p-8 flex items-center justify-center relative min-h-[300px] shadow-xl overflow-hidden">
                              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />

                              <button
                                   onClick={() => setIsPlaying(!isPlaying)}
                                   className="absolute top-4 right-4 bg-gray-900 border border-gray-800 text-gray-400 hover:text-white p-2 rounded-xl transition-colors z-10"
                                   title={isPlaying ? "Pause Preview" : "Play Preview"}
                              >
                                   <Play size={16} className={isPlaying ? "text-blue-400" : ""} />
                              </button>

                              {/* Geometric Element */}
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

                         {/* Code Container */}
                         <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 relative shadow-xl">
                              <div className="flex items-center justify-between mb-3">
                                   <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">Output.css</span>
                                   <button
                                        onClick={() => copy(generatedCSS)}
                                        className="flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors font-bold"
                                   >
                                        {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                        {isCopied ? "Copied!" : "Copy CSS"}
                                   </button>
                              </div>
                              <pre className="text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap leading-relaxed bg-gray-950 p-4 rounded-2xl border border-gray-800">
                                   <code className="text-emerald-400">.animated-element</code> {"{\n"}
                                   {"  "}animation: <span className="text-blue-400">{animType}</span> <span className="text-amber-400">{duration}s</span> <span className="text-purple-400">{easing}</span> infinite;{"\n}\n\n"}
                                   <span className="text-gray-500">{keyframesMap[animType]}</span>
                              </pre>
                         </div>

                    </div>
               </div>

               {/* Bottom Ad Banner */}
               <AdSlot adSlot="bottom-css-anim-ad" format="fluid" className="mt-4" />

          </div>
     );
}