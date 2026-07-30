"use client";

import { useState, useRef, useEffect } from "react";
import { Music, UploadCloud, Play, Pause, Download, Volume2, VolumeX, Lock, FileAudio, CheckCircle2, SlidersHorizontal } from "lucide-react";

type Stem = {
     id: string;
     name: string;
     color: string;
     volume: number;
     isMuted: boolean;
};

export default function AudioStemSeparator() {
     const [file, setFile] = useState<File | null>(null);
     const [isProcessing, setIsProcessing] = useState(false);
     const [progress, setProgress] = useState(0);
     const [isComplete, setIsComplete] = useState(false);
     const [isPlaying, setIsPlaying] = useState(false);

     const [showPremiumModal, setShowPremiumModal] = useState(false);
     const fileInputRef = useRef<HTMLInputElement>(null);

     const [stems, setStems] = useState<Stem[]>([
          { id: "vocals", name: "Vocals", color: "bg-purple-500", volume: 80, isMuted: false },
          { id: "drums", name: "Drums & Percussion", color: "bg-blue-500", volume: 80, isMuted: false },
          { id: "bass", name: "Bass", color: "bg-emerald-500", volume: 80, isMuted: false },
          { id: "other", name: "Melody & Other", color: "bg-amber-500", volume: 80, isMuted: false },
     ]);

     const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
          const uploaded = e.target.files?.[0];
          if (uploaded) {
               setFile(uploaded);
               setIsComplete(false);
               setProgress(0);
          }
     };

     const startProcessing = () => {
          if (!file) return;
          setIsProcessing(true);
          setProgress(0);

          // Simulate WebAssembly Neural Network Processing Time
          const interval = setInterval(() => {
               setProgress((prev) => {
                    if (prev >= 100) {
                         clearInterval(interval);
                         setIsProcessing(false);
                         setIsComplete(true);
                         return 100;
                    }
                    return prev + 2; // Increments of 2%
               });
          }, 100);
     };

     const toggleMute = (id: string) => {
          setStems(stems.map(s => s.id === id ? { ...s, isMuted: !s.isMuted } : s));
     };

     const handleVolumeChange = (id: string, newVolume: number) => {
          setStems(stems.map(s => s.id === id ? { ...s, volume: newVolume, isMuted: newVolume === 0 } : s));
     };

     const resetTool = () => {
          setFile(null);
          setIsComplete(false);
          setProgress(0);
          setIsPlaying(false);
     };

     // Mock linear waveform visualization component (Clean, geometric)
     const WaveformVisualizer = ({ color, isActive }: { color: string, isActive: boolean }) => (
          <div className="flex items-center gap-1 h-8 opacity-80">
               {[...Array(24)].map((_, i) => {
                    // Geometric height calculation for visual effect
                    const height = isActive ? Math.max(20, Math.random() * 100) : 10;
                    return (
                         <div
                              key={i}
                              className={`w-1.5 rounded-sm transition-all duration-300 ${color.replace('bg-', 'bg-')}`}
                              style={{ height: `${height}%`, opacity: isActive ? 1 : 0.3 }}
                         />
                    );
               })}
          </div>
     );

     return (
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">

               {/* Header Section */}
               <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20">
                         <Music size={24} />
                    </div>
                    <div>
                         <div className="flex items-center gap-3">
                              <h2 className="text-2xl font-bold text-white">Audio Stem Separator</h2>
                              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold px-2 py-0.5 rounded-full">
                                   🟡 Freemium
                              </span>
                         </div>
                         <p className="text-sm text-gray-400">Isolate vocals and instruments using local AI processing.</p>
                    </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Upload & Status Pane (Left) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                         <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl">
                              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                                   <FileAudio size={18} className="text-blue-400" /> Input Source
                              </h3>

                              {!file ? (
                                   <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full h-48 border-2 border-dashed border-gray-700 hover:border-blue-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-gray-950/50 transition-all hover:bg-gray-900 group"
                                   >
                                        <div className="w-12 h-12 bg-gray-800 group-hover:bg-blue-500/20 rounded-full flex items-center justify-center mb-3 transition-colors">
                                             <UploadCloud size={24} className="text-gray-400 group-hover:text-blue-400" />
                                        </div>
                                        <span className="text-sm font-bold text-white mb-1">Upload Audio File</span>
                                        <span className="text-xs text-gray-500">MP3, WAV, or AAC (Max 10MB)</span>
                                        <input
                                             type="file"
                                             ref={fileInputRef}
                                             onChange={handleFileUpload}
                                             accept="audio/*"
                                             className="hidden"
                                        />
                                   </div>
                              ) : (
                                   <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4">
                                        <div className="flex items-center gap-3 mb-4">
                                             <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center shrink-0">
                                                  <Music size={20} />
                                             </div>
                                             <div className="overflow-hidden">
                                                  <p className="text-sm font-bold text-white truncate">{file.name}</p>
                                                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                             </div>
                                        </div>

                                        {!isComplete ? (
                                             <button
                                                  onClick={startProcessing}
                                                  disabled={isProcessing}
                                                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                             >
                                                  {isProcessing ? (
                                                       <>
                                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            Extracting Stems ({progress}%)
                                                       </>
                                                  ) : (
                                                       <>Separate Audio</>
                                                  )}
                                             </button>
                                        ) : (
                                             <button
                                                  onClick={resetTool}
                                                  className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-3 rounded-xl transition-all text-sm"
                                             >
                                                  Upload New File
                                             </button>
                                        )}

                                        {/* Clean, geometric progress bar */}
                                        {isProcessing && (
                                             <div className="mt-4 h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                                                  <div
                                                       className="h-full bg-blue-500 transition-all duration-100 ease-linear"
                                                       style={{ width: `${progress}%` }}
                                                  />
                                             </div>
                                        )}
                                   </div>
                              )}
                         </div>

                         {/* Upgrade Banner */}
                         <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-3xl p-6 relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
                              <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                                   <Lock size={16} className="text-purple-400" /> Premium Export
                              </h4>
                              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                                   Free users can preview separated tracks in the browser. Upgrade to download uncompressed 48kHz WAV files.
                              </p>
                              <button
                                   onClick={() => setShowPremiumModal(true)}
                                   className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 hover:border-purple-500/50 py-2.5 rounded-xl text-sm font-bold transition-all"
                              >
                                   View Plans
                              </button>
                         </div>
                    </div>

                    {/* Stem Mixer Dashboard (Right) */}
                    <div className="lg:col-span-8 bg-[#0c121e] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col min-h-[500px]">

                         <div className="flex items-center justify-between mb-8 border-b border-gray-800/60 pb-4">
                              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                   <SlidersHorizontal size={18} className="text-gray-400" /> Studio Mixer
                              </h3>
                              {isComplete && (
                                   <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${isPlaying ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                             }`}
                                   >
                                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                                        {isPlaying ? "Pause All" : "Play Master"}
                                   </button>
                              )}
                         </div>

                         {!isComplete ? (
                              <div className="flex-grow flex flex-col items-center justify-center text-center opacity-50">
                                   <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4 border border-gray-700">
                                        <Music size={32} className="text-gray-500" />
                                   </div>
                                   <h4 className="text-white font-bold mb-1">Awaiting Audio</h4>
                                   <p className="text-sm text-gray-400 max-w-sm">
                                        Upload a track and click Separate Audio to generate the multitrack mixer interface.
                                   </p>
                              </div>
                         ) : (
                              <div className="flex flex-col gap-4 flex-grow">
                                   {stems.map((stem) => (
                                        <div key={stem.id} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 transition-all hover:bg-gray-900">

                                             {/* Stem Info */}
                                             <div className="w-full sm:w-48 flex items-center justify-between sm:justify-start gap-3 shrink-0">
                                                  <button
                                                       onClick={() => toggleMute(stem.id)}
                                                       className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${stem.isMuted ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-gray-800 text-white hover:bg-gray-700"
                                                            }`}
                                                       title={stem.isMuted ? "Unmute" : "Mute"}
                                                  >
                                                       {stem.isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                                  </button>
                                                  <div className="flex flex-col text-left">
                                                       <span className="text-sm font-bold text-white">{stem.name}</span>
                                                       <span className={`text-[10px] uppercase tracking-wider ${stem.isMuted ? 'text-rose-400' : 'text-gray-500'}`}>
                                                            {stem.isMuted ? "Muted" : "Active"}
                                                       </span>
                                                  </div>
                                             </div>

                                             {/* Visualizer & Volume */}
                                             <div className="flex-grow w-full flex items-center gap-6">
                                                  <div className="hidden md:block">
                                                       <WaveformVisualizer color={stem.color} isActive={isPlaying && !stem.isMuted} />
                                                  </div>

                                                  <input
                                                       type="range"
                                                       min="0" max="100"
                                                       value={stem.volume}
                                                       onChange={(e) => handleVolumeChange(stem.id, Number(e.target.value))}
                                                       className={`w-full accent-${stem.color.replace('bg-', '')} cursor-pointer`}
                                                       style={{ opacity: stem.isMuted ? 0.3 : 1 }}
                                                  />
                                             </div>

                                             {/* Download Action */}
                                             <button
                                                  onClick={() => setShowPremiumModal(true)}
                                                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-950 hover:bg-gray-800 text-gray-400 border border-gray-800 px-4 py-2 rounded-xl transition-colors shrink-0"
                                                  title="Download High-Res Stem"
                                             >
                                                  <Download size={16} />
                                             </button>
                                        </div>
                                   ))}

                                   <div className="mt-auto pt-6 flex items-center justify-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 py-2 rounded-xl border border-emerald-500/20">
                                        <CheckCircle2 size={14} /> Extraction complete. All tracks processed successfully via local Wasm engine.
                                   </div>
                              </div>
                         )}

                    </div>
               </div>

               {/* Mock Premium Download Modal */}
               {showPremiumModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                         <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center relative">
                              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg shadow-purple-500/20">
                                   <Download size={32} />
                              </div>
                              <h2 className="text-2xl font-bold text-white mb-2">Download Studio Stems</h2>
                              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                                   Upgrade to Premium to export these isolated tracks as uncompressed, studio-ready 48kHz WAV files without any artificial limiting.
                              </p>
                              <div className="flex flex-col gap-3">
                                   <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg">
                                        View Premium Plans
                                   </button>
                                   <button
                                        onClick={() => setShowPremiumModal(false)}
                                        className="text-gray-500 hover:text-white text-sm font-medium py-2 transition-colors"
                                   >
                                        Cancel
                                   </button>
                              </div>
                         </div>
                    </div>
               )}

          </div>
     );
}