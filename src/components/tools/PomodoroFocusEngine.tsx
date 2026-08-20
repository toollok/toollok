"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { Play, Pause, RotateCcw, Headphones, CheckCircle2, Zap, Volume2, VolumeX, Plus, Trash2, Activity, Target } from "lucide-react";
import AdSlot from "@/components/ui/AdSlot";

const MODES = {
     focus: { label: "Deep Focus", minutes: 25, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-600 dark:bg-rose-500", stroke: "#fb7185" },
     short: { label: "Short Break", minutes: 5, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-600 dark:bg-emerald-500", stroke: "#34d399" },
     long: { label: "Long Break", minutes: 15, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-600 dark:bg-indigo-500", stroke: "#818cf8" }
};

type NoiseColor = "brown" | "pink" | "white";

export default function PomodoroFocusEngine() {
     const [mode, setMode] = useState<keyof typeof MODES>("focus");
     const [timeLeft, setTimeLeft] = useState(MODES["focus"].minutes * 60);
     const [isActive, setIsActive] = useState(false);
     const [tasks, setTasks] = useState<{ id: string, text: string, done: boolean }[]>([]);
     const [newTask, setNewTask] = useState("");
     const [completedCycles, setCompletedCycles] = useState(0);

     // Web Audio API State
     const audioCtxRef = useRef<AudioContext | null>(null);
     const noiseNodeRef = useRef<ScriptProcessorNode | null>(null);
     const gainNodeRef = useRef<GainNode | null>(null);
     const [isPlayingNoise, setIsPlayingNoise] = useState(false);
     const [noiseType, setNoiseType] = useState<NoiseColor>("brown");
     const [volume, setVolume] = useState(0.5);

     // Timer Logic
     useEffect(() => {
          let interval: NodeJS.Timeout;
          if (isActive && timeLeft > 0) {
               interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
          } else if (timeLeft === 0 && isActive) {
               setIsActive(false);
               playAlarm();
               if (mode === "focus") {
                    setCompletedCycles(c => c + 1);
               }
          }
          return () => clearInterval(interval);
     }, [isActive, timeLeft, mode]);

     const switchMode = (newMode: keyof typeof MODES) => {
          setMode(newMode);
          setTimeLeft(MODES[newMode].minutes * 60);
          setIsActive(false);
     };

     const toggleTimer = () => setIsActive(!isActive);

     const resetTimer = () => {
          setIsActive(false);
          setTimeLeft(MODES[mode].minutes * 60);
     };

     const formatTime = (seconds: number) => {
          const m = Math.floor(seconds / 60);
          const s = seconds % 60;
          return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
     };

     // Simple Alarm Beep using Web Audio API
     const playAlarm = () => {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
     };

     // Synthetic Neural Noise Generator (Zero Bandwidth)
     const toggleNoise = () => {
          if (isPlayingNoise) {
               audioCtxRef.current?.suspend();
               setIsPlayingNoise(false);
          } else {
               if (!audioCtxRef.current) {
                    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                    audioCtxRef.current = new AudioContext();
                    const bufferSize = 4096;

                    // State for Pink/Brown noise algorithms
                    let lastOut = 0;
                    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

                    const node = audioCtxRef.current.createScriptProcessor(bufferSize, 1, 1);
                    let currentType = noiseType;

                    node.onaudioprocess = function (e) {
                         const output = e.outputBuffer.getChannelData(0);
                         for (let i = 0; i < bufferSize; i++) {
                              const white = Math.random() * 2 - 1;

                              if (currentType === "brown") {
                                   output[i] = (lastOut + (0.02 * white)) / 1.02;
                                   lastOut = output[i];
                                   output[i] *= 3.5;
                              } else if (currentType === "pink") {
                                   b0 = 0.99886 * b0 + white * 0.0555179;
                                   b1 = 0.99332 * b1 + white * 0.0750759;
                                   b2 = 0.96900 * b2 + white * 0.1538520;
                                   b3 = 0.86650 * b3 + white * 0.3104856;
                                   b4 = 0.55000 * b4 + white * 0.5329522;
                                   b5 = -0.7616 * b5 - white * 0.0168980;
                                   output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                                   output[i] *= 0.11;
                                   b6 = white * 0.115926;
                              } else {
                                   output[i] = white * 0.2; // White noise
                              }
                         }
                    };

                    const gainNode = audioCtxRef.current.createGain();
                    gainNode.gain.value = volume;

                    node.connect(gainNode);
                    gainNode.connect(audioCtxRef.current.destination);

                    noiseNodeRef.current = node;
                    gainNodeRef.current = gainNode;
               }
               audioCtxRef.current.resume();
               setIsPlayingNoise(true);
          }
     };

     const changeNoiseType = (type: NoiseColor) => {
          setNoiseType(type);
          if (isPlayingNoise && audioCtxRef.current) {
               audioCtxRef.current.close();
               audioCtxRef.current = null;
               setIsPlayingNoise(false);
               setTimeout(() => toggleNoise(), 50); // Restart with new type
          }
     };

     const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const val = parseFloat(e.target.value);
          setVolume(val);
          if (gainNodeRef.current) {
               gainNodeRef.current.gain.value = val;
          }
     };

     const addTask = (e: React.FormEvent) => {
          e.preventDefault();
          if (!newTask.trim()) return;
          setTasks([...tasks, { id: Math.random().toString(), text: newTask, done: false }]);
          setNewTask("");
     };

     const toggleTask = (id: string) => setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
     const removeTask = (id: string) => setTasks(tasks.filter(t => t.id !== id));

     const totalTime = MODES[mode].minutes * 60;
     const percentage = useMemo(() => (timeLeft / totalTime) * 100, [timeLeft, totalTime]);
     const radius = 120;
     const circumference = 2 * Math.PI * radius;
     const strokeDashoffset = circumference - (percentage / 100) * circumference;

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">

               {/* Header Section */}
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
                              <Zap size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pomodoro Focus Engine & Ambient Studio</h2>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Maximize deep work with timed cycles, built-in task tracking, and multi-spectrum neural noise.</p>
                         </div>
                    </div>
               </div>

               {/* Top Ad Banner */}
               <AdSlot adSlot="top-pomodoro-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* LEFT COLUMN: The Timer Engine (Span 7) */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 flex flex-col items-center justify-center gap-8 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors">

                              {/* Top Indicators */}
                              <div className="w-full flex items-center justify-between z-10">
                                   <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-950 p-1.5 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors">
                                        {(Object.keys(MODES) as Array<keyof typeof MODES>).map((m) => (
                                             <button
                                                  key={m}
                                                  onClick={() => switchMode(m)}
                                                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${mode === m ? `bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm` : `text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300`}`}
                                             >
                                                  {MODES[m].label}
                                             </button>
                                        ))}
                                   </div>

                                   <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-950/50 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800/50 text-xs font-bold text-gray-500 dark:text-gray-400 transition-colors">
                                        <Target size={14} className="text-rose-600 dark:text-rose-400" />
                                        <span>Cycles: <span className="text-gray-900 dark:text-white">{completedCycles}</span></span>
                                   </div>
                              </div>

                              {/* Massive SVG Circular Timer */}
                              <div className="relative flex items-center justify-center z-10 my-2">
                                   <svg width="280" height="280" className="transform -rotate-90 drop-shadow-md dark:drop-shadow-2xl">
                                        <circle cx="140" cy="140" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100 dark:text-gray-800 transition-colors" />
                                        <circle
                                             cx="140" cy="140" r={radius}
                                             stroke={MODES[mode].stroke}
                                             strokeWidth="6"
                                             fill="transparent"
                                             strokeDasharray={circumference}
                                             strokeDashoffset={strokeDashoffset}
                                             strokeLinecap="round"
                                             className="transition-all duration-1000 ease-linear dark:drop-shadow-[0_0_15px_rgba(251,113,133,0.2)]"
                                        />
                                   </svg>
                                   <div className="absolute flex flex-col items-center justify-center">
                                        <span className="text-6xl font-black text-gray-900 dark:text-white font-mono tracking-tighter">
                                             {formatTime(timeLeft)}
                                        </span>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${MODES[mode].color}`}>
                                             {isActive ? "Engine Running" : "Paused"}
                                        </span>
                                   </div>
                              </div>

                              {/* Controls */}
                              <div className="flex items-center gap-4 z-10 w-full justify-center">
                                   <button
                                        onClick={resetTimer}
                                        className="p-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm dark:shadow-none"
                                        title="Reset Timer"
                                   >
                                        <RotateCcw size={18} />
                                   </button>
                                   <button
                                        onClick={toggleTimer}
                                        className={`flex items-center justify-center gap-2 px-10 py-4 rounded-2xl font-black text-sm transition-all shadow-md w-48 ${isActive ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700" : `${MODES[mode].bg} text-white hover:opacity-90`}`}
                                   >
                                        {isActive ? <><Pause size={18} /> PAUSE</> : <><Play size={18} /> START</>}
                                   </button>
                              </div>
                         </div>
                    </div>

                    {/* RIGHT COLUMN: Studio Tools (Span 5) */}
                    <div className="lg:col-span-5 flex flex-col gap-6">

                         {/* Ambient Sound Studio */}
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-5 transition-colors">
                              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/50 pb-3">
                                   <h3 className="text-sm font-bold text-gray-900 dark:text-gray-300 flex items-center gap-2">
                                        <Headphones size={16} className="text-indigo-600 dark:text-indigo-400" /> Ambient Studio
                                   </h3>
                                   <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${isPlayingNoise ? "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30" : "bg-gray-100 dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700"}`}>
                                        {isPlayingNoise ? "Broadcasting" : "Offline"}
                                   </span>
                              </div>

                              <div className="grid grid-cols-3 gap-2">
                                   {(["brown", "pink", "white"] as NoiseColor[]).map((type) => (
                                        <button
                                             key={type}
                                             onClick={() => changeNoiseType(type)}
                                             className={`p-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${noiseType === type ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 shadow-sm dark:shadow-none" : "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-500 hover:border-gray-300 dark:hover:border-gray-700"}`}
                                        >
                                             {type}
                                        </button>
                                   ))}
                              </div>

                              <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-950 p-3 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors">
                                   <button
                                        onClick={toggleNoise}
                                        className={`p-2.5 rounded-xl transition-all shadow-sm dark:shadow-none ${isPlayingNoise ? "bg-indigo-600 text-white dark:shadow-[0_0_15px_rgba(99,102,241,0.3)]" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-transparent hover:text-gray-900 dark:hover:text-white"}`}
                                   >
                                        {isPlayingNoise ? <Pause size={16} /> : <Play size={16} />}
                                   </button>
                                   <div className="flex flex-col flex-grow gap-2">
                                        <div className="flex justify-between items-center text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">
                                             <span>Volume</span>
                                             <span>{Math.round(volume * 100)}%</span>
                                        </div>
                                        <input
                                             type="range"
                                             min="0" max="1" step="0.01"
                                             value={volume}
                                             onChange={handleVolumeChange}
                                             className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                        />
                                   </div>
                              </div>
                         </div>

                         {/* Task Ledger */}
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col flex-grow min-h-[300px] transition-colors">
                              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-300 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800/50 pb-3 mb-4">
                                   <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" /> Focus Session Ledger
                              </h3>

                              <form onSubmit={addTask} className="flex gap-2 mb-4">
                                   <input
                                        type="text"
                                        value={newTask}
                                        onChange={(e) => setNewTask(e.target.value)}
                                        placeholder="What are you working on?"
                                        className="flex-grow bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-rose-500/50 transition-all"
                                   />
                                   <button type="submit" className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-transparent text-gray-700 dark:text-white p-2 rounded-xl transition-all shadow-sm dark:shadow-none">
                                        <Plus size={16} />
                                   </button>
                              </form>

                              <div className="flex flex-col gap-2 flex-grow overflow-y-auto pr-1 custom-scrollbar">
                                   {tasks.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400 dark:text-gray-600">
                                             <Activity size={24} className="opacity-20" />
                                             <span className="text-xs">No active tasks. Add a goal to crush.</span>
                                        </div>
                                   ) : (
                                        tasks.map(task => (
                                             <div key={task.id} className="flex items-center justify-between group bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-3 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
                                                  <label className="flex items-center gap-3 cursor-pointer">
                                                       <input
                                                            type="checkbox"
                                                            checked={task.done}
                                                            onChange={() => toggleTask(task.id)}
                                                            className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-rose-500 focus:ring-rose-500/50 cursor-pointer"
                                                       />
                                                       <span className={`text-sm transition-all ${task.done ? "text-gray-400 dark:text-gray-600 line-through" : "text-gray-800 dark:text-gray-300"}`}>
                                                            {task.text}
                                                       </span>
                                                  </label>
                                                  <button onClick={() => removeTask(task.id)} className="text-gray-400 dark:text-gray-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100">
                                                       <Trash2 size={14} />
                                                  </button>
                                             </div>
                                        ))
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* ========================================= */}
               {/* SEO CONTENT & FAQS */}
               {/* ========================================= */}
               <div className="mt-12 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm dark:shadow-none">
                    <div className="prose dark:prose-invert max-w-none">
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Master Deep Work with the Pomodoro Focus Engine</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              Constant context switching and digital distractions destroy productivity. ToolLok's <strong>Pomodoro Focus Engine & Ambient Studio</strong> combines the scientifically proven Pomodoro timing technique with a built-in neural noise generator. Whether you are coding, writing, or studying, this <Link href="/categories/productivity-tools" className="text-rose-600 dark:text-rose-400 hover:underline">Productivity Tool</Link> helps you maintain flow state and track your completed task cycles directly in the browser.
                         </p>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Optimize Your Focus Sessions</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Automated Cycles:</strong> Seamlessly switch between 25-minute Deep Focus blocks, 5-minute Short Breaks, and 15-minute Long Breaks to prevent mental burnout.</li>
                              <li><strong>Synthetic Neural Noise:</strong> Generate mathematical Brown, Pink, and White noise directly via your browser's Web Audio API. This masks distracting background sounds without eating up internet bandwidth.</li>
                              <li><strong>Session Ledger:</strong> Keep track of exactly what you need to accomplish during your current sprint using the integrated task checklist.</li>
                         </ul>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">What is the Pomodoro Technique?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">The Pomodoro Technique is a time management method developed by Francesco Cirillo. It traditionally breaks work into intervals, usually 25 minutes in length, separated by short 5-minute breaks. This trains your brain to focus in short, intense bursts while ensuring you rest frequently.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">What is the difference between Brown, Pink, and White noise?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">White noise contains all frequencies at equal intensity, sounding like static TV. Pink noise has deeper low frequencies and sounds like heavy rain. Brown noise focuses even more heavily on lower frequencies, sounding like a deep ocean roar, which many find highly effective for concentration and ADHD management.</p>
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
                                             "name": "What is the Pomodoro Technique?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "The Pomodoro Technique is a time management method that breaks work into 25-minute intervals separated by short 5-minute breaks, helping to maintain focus and prevent burnout." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "What is the difference between Brown, Pink, and White noise?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "White noise has all frequencies equal (static). Pink noise has deeper lows (heavy rain). Brown noise is very deep (ocean roar), which is often highly effective for concentration." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-pomodoro-ad" format="fluid" className="mt-4" />
          </div>
     );
}