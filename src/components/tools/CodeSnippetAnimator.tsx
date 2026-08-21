"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
     Video, Play, Pause, Lock, Palette, Type, Layout, Download,
     Plus, Trash2, Copy, SkipBack, Save, FolderOpen, Settings, Check,
     Monitor, Smartphone, Square, Layers, Wand2, Undo, Redo, Image as ImageIcon
} from "lucide-react";

// --- TYPES & INTERFACES ---
type AspectRatio = "16:9" | "9:16" | "1:1";
type WindowStyle = "macos" | "windows" | "minimal" | "floating";
type ThemeType = "dark" | "monokai" | "dracula" | "tokyo" | "github";

interface TextLayer {
     id: string;
     text: string;
     x: number;
     y: number;
     fontSize: number;
     color: string;
}

interface Scene {
     id: string;
     name: string;
     code: string;
     duration: number;
     spotlightLines: number[];
     textLayers: TextLayer[];
}

interface ProjectState {
     aspectRatio: AspectRatio;
     theme: ThemeType;
     bgGradient: string;
     padding: number;
     windowStyle: WindowStyle;
     typingSpeed: number;
     brandKit: { handle: string; enabled: boolean; opacity: number };
     scenes: Scene[];
}

// --- DEFAULT STATE ---
const defaultScene: Scene = {
     id: "scene-1",
     name: "Hook",
     code: "function calculateYield(principal, rate) {\n  // 📈 Calculate annual returns\n  const annual = principal * (rate / 100);\n  console.log(`Yield: $${annual}`);\n  return annual;\n}\n\ncalculateYield(10000, 8.5);",
     duration: 4,
     spotlightLines: [],
     textLayers: []
};

const defaultProject: ProjectState = {
     aspectRatio: "16:9",
     theme: "dracula",
     bgGradient: "from-blue-600 via-indigo-600 to-purple-700",
     padding: 48,
     windowStyle: "macos",
     typingSpeed: 35,
     brandKit: { handle: "@CodeMines", enabled: true, opacity: 70 },
     scenes: [defaultScene]
};

export default function CodeVideoStudio() {
     // --- STATE ---
     const [project, setProject] = useState<ProjectState>(defaultProject);
     const [activeSceneId, setActiveSceneId] = useState<string>(defaultProject.scenes[0].id);
     const [activeTab, setActiveTab] = useState<"code" | "design" | "brand" | "export">("code");

     // Playback & Animation Engine
     const [isPlaying, setIsPlaying] = useState<boolean>(false);
     const [playbackSceneIndex, setPlaybackSceneIndex] = useState<number>(0);
     const [displayedCode, setDisplayedCode] = useState<string>(defaultScene.code);

     // UI & History
     const [isPremiumUser, setIsPremiumUser] = useState(false);
     const [showPremiumModal, setShowPremiumModal] = useState(false);
     const [isExporting, setIsExporting] = useState(false);
     const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");
     const [history, setHistory] = useState<ProjectState[]>([defaultProject]);
     const [historyIndex, setHistoryIndex] = useState<number>(0);

     const activeScene = project.scenes.find(s => s.id === activeSceneId) || project.scenes[0];

     // --- HISTORY MANAGEMENT (UNDO/REDO) ---
     const updateProject = useCallback((newProject: typeof project | ((prev: typeof project) => typeof project)) => {
          setProject(prev => {
               const nextState = typeof newProject === "function" ? newProject(prev) : newProject;
               const newHistory = history.slice(0, historyIndex + 1);
               newHistory.push(nextState);
               setHistory(newHistory);
               setHistoryIndex(newHistory.length - 1);
               return nextState;
          });
     }, [history, historyIndex]);

     const handleUndo = useCallback(() => {
          if (historyIndex > 0) {
               setHistoryIndex(prev => prev - 1);
               setProject(history[historyIndex - 1]);
          }
     }, [history, historyIndex]);

     const handleRedo = useCallback(() => {
          if (historyIndex < history.length - 1) {
               setHistoryIndex(prev => prev + 1);
               setProject(history[historyIndex + 1]);
          }
     }, [history, historyIndex]);

     // --- KEYBOARD SHORTCUTS & AUTOSAVE ---
     useEffect(() => {
          const handleKeyDown = (e: KeyboardEvent) => {
               if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                    if (e.shiftKey) handleRedo();
                    else handleUndo();
               }
               if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                    e.preventDefault();
                    saveProjectLocal();
               }
          };
          window.addEventListener('keydown', handleKeyDown);
          return () => window.removeEventListener('keydown', handleKeyDown);
     }, [handleUndo, handleRedo]);

     useEffect(() => {
          const timer = setTimeout(() => {
               localStorage.setItem("code_studio_autosave", JSON.stringify(project));
               setSaveStatus("saved");
               setTimeout(() => setSaveStatus("idle"), 2000);
          }, 1500);
          return () => clearTimeout(timer);
     }, [project]);

     // --- ANIMATION ENGINE ---
     useEffect(() => {
          if (isPlaying) {
               const currentPlayScene = project.scenes[playbackSceneIndex];
               if (!currentPlayScene) {
                    setIsPlaying(false);
                    setPlaybackSceneIndex(0);
                    return;
               }

               let currentIndex = 0;
               setDisplayedCode("");

               const interval = setInterval(() => {
                    setDisplayedCode(currentPlayScene.code.substring(0, currentIndex + 1));
                    currentIndex++;

                    if (currentIndex >= currentPlayScene.code.length) {
                         clearInterval(interval);
                         // Move to next scene after a pause
                         setTimeout(() => {
                              if (playbackSceneIndex < project.scenes.length - 1) {
                                   setPlaybackSceneIndex(prev => prev + 1);
                              } else {
                                   setIsPlaying(false);
                                   setPlaybackSceneIndex(0);
                                   setDisplayedCode(activeScene.code);
                              }
                         }, 1500);
                    }
               }, project.typingSpeed);

               return () => clearInterval(interval);
          } else {
               setDisplayedCode(activeScene.code);
          }
     }, [isPlaying, playbackSceneIndex, project.scenes, project.typingSpeed, activeScene.code]);

     const togglePlay = () => setIsPlaying(!isPlaying);
     const resetPlay = () => { setIsPlaying(false); setPlaybackSceneIndex(0); setDisplayedCode(activeScene.code); };

     // --- DATA MANAGEMENT ---
     const saveProjectLocal = () => {
          const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `code-studio-project-${new Date().getTime()}.json`;
          a.click();
          URL.revokeObjectURL(url);
     };

     const loadProjectLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (event) => {
               try {
                    const loadedProject = JSON.parse(event.target?.result as string);
                    if (loadedProject.scenes && loadedProject.aspectRatio) {
                         updateProject(loadedProject);
                         setActiveSceneId(loadedProject.scenes[0].id);
                    }
               } catch (err) {
                    alert("Invalid project file.");
               }
          };
          reader.readAsText(file);
     };

     const handleExport = () => {
          if (!isPremiumUser) {
               setShowPremiumModal(true);
               return;
          }
          setIsExporting(true);
          // Simulating true client-side geometric progress render
          setTimeout(() => {
               setIsExporting(false);
               alert("MP4 Export Complete! (Simulated for Demo)");
          }, 4000);
     };

     // --- CONFIGURATIONS ---
     const themes = {
          dark: { bg: "bg-[#1e1e1e]", text: "text-gray-300", keyword: "text-blue-400", string: "text-amber-400", comment: "text-emerald-500", highlight: "bg-white/10" },
          monokai: { bg: "bg-[#272822]", text: "text-[#f8f8f2]", keyword: "text-[#f92672]", string: "text-[#e6db74]", comment: "text-[#75715e]", highlight: "bg-white/10" },
          dracula: { bg: "bg-[#282a36]", text: "text-[#f8f8f2]", keyword: "text-[#ff79c6]", string: "text-[#f1fa8c]", comment: "text-[#6272a4]", highlight: "bg-white/10" },
          tokyo: { bg: "bg-[#1a1b26]", text: "text-[#a9b1d6]", keyword: "text-[#bb9af7]", string: "text-[#9ece6a]", comment: "text-[#565f89]", highlight: "bg-white/10" },
          github: { bg: "bg-[#0d1117]", text: "text-[#c9d1d9]", keyword: "text-[#ff7b72]", string: "text-[#a5d6ff]", comment: "text-[#8b949e]", highlight: "bg-white/10" },
     };

     const aspectStyles = {
          "16:9": "aspect-video w-full max-w-4xl",
          "9:16": "aspect-[9/16] h-full max-h-[70vh]",
          "1:1": "aspect-square w-full max-w-2xl"
     };

     // --- RENDERERS ---
     const renderHighlightedCode = (rawCode: string, spotlightLines: number[]) => {
          const currentTheme = themes[project.theme];
          const lines = rawCode.split('\n');

          return lines.map((line, i) => {
               const isSpotlight = spotlightLines.length === 0 || spotlightLines.includes(i + 1);

               // 1. First, escape HTML characters to prevent DOM breakage and XSS
               const safeLine = line
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');

               // 2. Single-pass regex to grab comments, strings, and keywords simultaneously.
               const tokenRegex = /(\/\/.*)|(`.*?`|".*?"|'.*?')|\b(function|const|let|var|return|import|from|async|await)\b/g;

               // 3. Replace based on which capture group matched
               const highlightedLine = safeLine.replace(tokenRegex, (match, comment, string, keyword) => {
                    if (comment) return `<span class="${currentTheme.comment}">${comment}</span>`;
                    if (string) return `<span class="${currentTheme.string}">${string}</span>`;
                    if (keyword) return `<span class="${currentTheme.keyword}">${keyword}</span>`;
                    return match;
               });

               return (
                    <div
                         key={i}
                         className={`leading-relaxed flex transition-all duration-300 ${!isSpotlight ? 'opacity-30 blur-[0.5px]' : 'opacity-100'}`}
                    >
                         <span className="w-8 text-right mr-4 opacity-30 select-none text-xs shrink-0 flex items-center justify-end">{i + 1}</span>
                         <span dangerouslySetInnerHTML={{ __html: highlightedLine || " " }} className="break-all whitespace-pre-wrap" />
                    </div>
               );
          });
     };

     return (
          <div className="min-h-screen w-full bg-gray-50 dark:bg-[#0b0f19] text-gray-900 dark:text-gray-200 flex flex-col font-sans selection:bg-blue-200 dark:selection:bg-blue-500/30 transition-colors duration-300">

               {/* ========================================= */}
               {/* HEAD METADATA FOR ON-PAGE SEO */}
               {/* ========================================= */}
               <title>Cinematic Code Snippet Animator | Developer Video Creator</title>
               <meta name="description" content="Convert your source code snippets into engaging, animated typing videos perfectly optimized for YouTube Shorts, Instagram Reels, and LinkedIn." />
               <meta name="keywords" content="code animation generator, code to video, code snippet video maker, coding video generator, programming animation maker, animated code generator, developer content creator tools" />

               {/* ========================================= */}
               {/* MAIN APPLICATION WORKSPACE (100vh) */}
               {/* ========================================= */}
               <div className="flex flex-col h-screen shrink-0 overflow-hidden relative border-b border-gray-200 dark:border-gray-800 shadow-2xl transition-colors duration-300">

                    {/* HEADER */}
                    <header className="h-14 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] flex items-center justify-between px-4 shrink-0 z-20 transition-colors duration-300">
                         <div className="flex items-center gap-4">
                              <div className="w-8 h-8 bg-blue-50 dark:bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 shadow-inner">
                                   <Video size={18} />
                              </div>
                              <h1 className="font-bold text-sm tracking-wide text-gray-900 dark:text-white hidden md:block">
                                   Cinematic Code Snippet Animator
                              </h1>

                              <div className="h-4 w-px bg-gray-200 dark:bg-gray-800 mx-2 hidden md:block"></div>

                              <div className="flex items-center gap-2">
                                   <button onClick={handleUndo} disabled={historyIndex === 0} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-colors"><Undo size={14} /></button>
                                   <button onClick={handleRedo} disabled={historyIndex === history.length - 1} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-colors"><Redo size={14} /></button>
                                   <span className={`text-[10px] font-mono ml-2 transition-opacity ${saveStatus === 'saved' ? 'opacity-100 text-emerald-500 dark:text-emerald-400' : 'opacity-0'}`}>Saved</span>
                              </div>
                         </div>

                         <div className="flex items-center gap-3">
                              <button onClick={() => setIsPremiumUser(!isPremiumUser)} className="text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 px-2 py-1 rounded transition-colors hidden md:block">
                                   Premium: {isPremiumUser ? "ON" : "OFF"}
                              </button>

                              <label className="flex items-center gap-2 bg-gray-100 dark:bg-[#0b0f19] hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors border border-gray-200 dark:border-gray-800 shadow-sm">
                                   <FolderOpen size={14} /> Open
                                   <input type="file" accept=".json" onChange={loadProjectLocal} className="hidden" />
                              </label>

                              <button onClick={saveProjectLocal} className="flex items-center gap-2 bg-gray-100 dark:bg-[#0b0f19] hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-gray-200 dark:border-gray-800 shadow-sm">
                                   <Save size={14} /> Save
                              </button>

                              <button
                                   onClick={handleExport}
                                   disabled={isExporting}
                                   className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all relative overflow-hidden group ml-2 shadow-lg shadow-blue-600/20"
                              >
                                   {isExporting ? (
                                        <>
                                             <span className="relative z-10">Rendering HD...</span>
                                             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[morphingWave_1.5s_linear_infinite]" />
                                        </>
                                   ) : (
                                        <><Download size={14} /> Export</>
                                   )}
                              </button>
                         </div>
                    </header>

                    {/* MAIN WORKSPACE GRID */}
                    <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative bg-gray-50 dark:bg-[#0b0f19] transition-colors duration-300">

                         {/* LEFT PANEL: Scene & Code Controls */}
                         <aside className="w-full lg:w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] flex flex-col shrink-0 lg:h-full h-[40vh] z-10 order-2 lg:order-1 transition-colors duration-300">
                              <div className="flex border-b border-gray-200 dark:border-gray-800 p-2 gap-1 overflow-x-auto no-scrollbar">
                                   {[
                                        { id: "code", icon: Type, label: "Editor" },
                                        { id: "design", icon: Palette, label: "Design" },
                                        { id: "brand", icon: Layout, label: "Brand" },
                                        { id: "export", icon: Settings, label: "Export" },
                                   ].map(t => (
                                        <button
                                             key={t.id}
                                             onClick={() => setActiveTab(t.id as any)}
                                             className={`flex-1 min-w-[70px] flex flex-col items-center gap-1 p-2 rounded-lg text-[10px] font-medium transition-colors ${activeTab === t.id ? "bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-white shadow-sm" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-300"}`}
                                        >
                                             <t.icon size={14} /> {t.label}
                                        </button>
                                   ))}
                              </div>

                              <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-6">
                                   {activeTab === "code" && (
                                        <div className="space-y-5 animate-in fade-in duration-200">
                                             <div>
                                                  <div className="flex justify-between items-center mb-2">
                                                       <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Scene Code</label>
                                                       <span className="text-[10px] text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded font-mono">{activeScene.name}</span>
                                                  </div>
                                                  <textarea
                                                       value={activeScene.code}
                                                       onChange={(e) => {
                                                            updateProject(prev => ({
                                                                 ...prev,
                                                                 scenes: prev.scenes.map(s => s.id === activeScene.id ? { ...s, code: e.target.value } : s)
                                                            }));
                                                       }}
                                                       className="w-full h-56 bg-gray-50 dark:bg-[#0b0f19] border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-[13px] text-gray-900 dark:text-gray-300 font-mono outline-none focus:border-blue-500 resize-none transition-colors shadow-inner"
                                                       spellCheck="false"
                                                  />
                                             </div>

                                             <div className="p-3 bg-white dark:bg-[#0b0f19] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
                                                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2 block">Code Spotlight</label>
                                                  <p className="text-[10px] text-gray-500 mb-2">Comma-separated line numbers to highlight (e.g., 2,4,5). Leave empty to show all.</p>
                                                  <input
                                                       type="text"
                                                       placeholder="e.g. 2, 4, 5"
                                                       value={activeScene.spotlightLines.join(", ")}
                                                       onChange={(e) => {
                                                            const lines = e.target.value.split(",").map(n => parseInt(n.trim())).filter(n => !isNaN(n));
                                                            updateProject(prev => ({
                                                                 ...prev,
                                                                 scenes: prev.scenes.map(s => s.id === activeScene.id ? { ...s, spotlightLines: lines } : s)
                                                            }));
                                                       }}
                                                       className="w-full bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-xs text-gray-900 dark:text-white font-mono outline-none focus:border-blue-500"
                                                  />
                                             </div>
                                        </div>
                                   )}

                                   {activeTab === "design" && (
                                        <div className="space-y-6 animate-in fade-in duration-200">
                                             <div>
                                                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3 block">Canvas Format</label>
                                                  <div className="grid grid-cols-3 gap-2">
                                                       {[
                                                            { id: "16:9", icon: Monitor, label: "16:9" },
                                                            { id: "9:16", icon: Smartphone, label: "9:16" },
                                                            { id: "1:1", icon: Square, label: "1:1" }
                                                       ].map(format => (
                                                            <button
                                                                 key={format.id}
                                                                 onClick={() => updateProject({ ...project, aspectRatio: format.id as AspectRatio })}
                                                                 className={`py-2 flex flex-col items-center gap-1.5 rounded-lg text-[10px] font-bold border transition-all ${project.aspectRatio === format.id ? "bg-blue-50 dark:bg-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-300" : "bg-white dark:bg-[#0b0f19] border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700"}`}
                                                            >
                                                                 <format.icon size={14} /> {format.label}
                                                            </button>
                                                       ))}
                                                  </div>
                                             </div>

                                             <div>
                                                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3 block">Syntax Theme</label>
                                                  <div className="grid grid-cols-2 gap-2">
                                                       {(Object.keys(themes) as Array<ThemeType>).map((t) => (
                                                            <button
                                                                 key={t}
                                                                 onClick={() => updateProject({ ...project, theme: t })}
                                                                 className={`py-1.5 px-3 rounded-lg text-[11px] font-bold capitalize border transition-all ${project.theme === t ? "bg-blue-50 dark:bg-white/10 border-blue-500 dark:border-white/20 text-blue-600 dark:text-white" : "bg-white dark:bg-[#0b0f19] border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5"}`}
                                                            >
                                                                 {t}
                                                            </button>
                                                       ))}
                                                  </div>
                                             </div>

                                             <div>
                                                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3 block">Window Theme</label>
                                                  <div className="grid grid-cols-2 gap-2">
                                                       {[
                                                            { id: "macos", label: "macOS" },
                                                            { id: "windows", label: "Windows" },
                                                            { id: "minimal", label: "Minimal" },
                                                            { id: "floating", label: "Floating" }
                                                       ].map(style => (
                                                            <button
                                                                 key={style.id}
                                                                 onClick={() => updateProject({ ...project, windowStyle: style.id as WindowStyle })}
                                                                 className={`py-1.5 px-3 rounded-lg text-[11px] font-bold capitalize border transition-all ${project.windowStyle === style.id ? "bg-blue-50 dark:bg-white/10 border-blue-500 dark:border-white/20 text-blue-600 dark:text-white" : "bg-white dark:bg-[#0b0f19] border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5"}`}
                                                            >
                                                                 {style.label}
                                                            </button>
                                                       ))}
                                                  </div>
                                             </div>

                                             <div>
                                                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3 block">Background Engine</label>
                                                  <div className="flex flex-wrap gap-2">
                                                       {[
                                                            { id: "cosmic", class: "from-blue-600 via-indigo-600 to-purple-700" },
                                                            { id: "emerald", class: "from-emerald-500 to-teal-700" },
                                                            { id: "sunset", class: "from-rose-500 to-orange-500" },
                                                            { id: "midnight", class: "from-gray-800 to-gray-950" },
                                                            { id: "mesh", class: "from-indigo-500 via-purple-500 to-pink-500" }
                                                       ].map((grad) => (
                                                            <button
                                                                 key={grad.id}
                                                                 onClick={() => updateProject({ ...project, bgGradient: grad.class })}
                                                                 className={`w-10 h-10 rounded-lg bg-gradient-to-br ${grad.class} border-2 transition-transform ${project.bgGradient === grad.class ? "border-white scale-110 shadow-lg" : "border-transparent hover:scale-105 opacity-50 hover:opacity-100"}`}
                                                                 title={grad.id}
                                                            />
                                                       ))}
                                                  </div>
                                             </div>

                                             <div>
                                                  <div className="flex justify-between items-center mb-2">
                                                       <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Canvas Padding</label>
                                                       <span className="text-[10px] text-gray-500 font-mono">{project.padding}px</span>
                                                  </div>
                                                  <input type="range" min="16" max="96" step="8" value={project.padding} onChange={(e) => updateProject({ ...project, padding: Number(e.target.value) })} className="w-full accent-blue-500" />
                                             </div>
                                        </div>
                                   )}

                                   {activeTab === "brand" && (
                                        <div className="space-y-6 animate-in fade-in duration-200">
                                             <div className="p-4 bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-xl">
                                                  <div className="flex items-center justify-between mb-4">
                                                       <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2"><ImageIcon size={14} /> Watermark</label>
                                                       <button
                                                            onClick={() => updateProject({ ...project, brandKit: { ...project.brandKit, enabled: !project.brandKit.enabled } })}
                                                            className={`w-8 h-4 rounded-full relative transition-colors ${project.brandKit.enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                                                       >
                                                            <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${project.brandKit.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                                                       </button>
                                                  </div>
                                                  <input
                                                       type="text"
                                                       value={project.brandKit.handle}
                                                       onChange={(e) => updateProject({ ...project, brandKit: { ...project.brandKit, handle: e.target.value } })}
                                                       disabled={!project.brandKit.enabled}
                                                       className="w-full bg-white dark:bg-[#0b0f19] border border-gray-200 dark:border-gray-800 rounded-lg p-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 outline-none disabled:opacity-50"
                                                  />
                                                  <div className="mt-4">
                                                       <div className="flex justify-between items-center mb-2">
                                                            <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase">Opacity</label>
                                                            <span className="text-[10px] text-gray-500">{project.brandKit.opacity}%</span>
                                                       </div>
                                                       <input
                                                            type="range" min="10" max="100"
                                                            value={project.brandKit.opacity}
                                                            onChange={(e) => updateProject({ ...project, brandKit: { ...project.brandKit, opacity: Number(e.target.value) } })}
                                                            disabled={!project.brandKit.enabled}
                                                            className="w-full accent-blue-500 disabled:opacity-50"
                                                       />
                                                  </div>
                                             </div>

                                             <div className="p-4 border border-gray-200 dark:border-white/5 border-dashed rounded-xl flex flex-col items-center text-center opacity-50 cursor-not-allowed">
                                                  <Wand2 size={20} className="mb-2 text-gray-400" />
                                                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Custom Brand Uploads</span>
                                                  <span className="text-[10px] text-gray-500 mt-1">Available in Pro. (Logos, Custom Fonts)</span>
                                             </div>
                                        </div>
                                   )}

                                   {activeTab === "export" && (
                                        <div className="space-y-6 animate-in fade-in duration-200">
                                             <div>
                                                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2 block">Animation Speed</label>
                                                  <div className="flex justify-between items-center mb-2">
                                                       <span className="text-[10px] text-gray-500">Fast</span>
                                                       <span className="text-[10px] text-gray-500">Slow</span>
                                                  </div>
                                                  <input
                                                       type="range" min="10" max="100"
                                                       value={project.typingSpeed}
                                                       onChange={(e) => updateProject({ ...project, typingSpeed: Number(e.target.value) })}
                                                       className="w-full accent-blue-500"
                                                  />
                                             </div>

                                             <hr className="border-gray-200 dark:border-white/5" />

                                             <div>
                                                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3 block">Export Video Data</label>
                                                  <button onClick={saveProjectLocal} className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-transparent rounded-lg text-xs font-medium text-gray-900 dark:text-white transition-colors mb-2">
                                                       <span className="flex items-center gap-2"><Save size={14} /> Download Project (.json)</span>
                                                       <Download size={14} className="text-gray-500" />
                                                  </button>
                                                  <button onClick={handleExport} className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 rounded-lg text-xs font-bold text-blue-700 dark:text-blue-300 transition-colors">
                                                       <span className="flex items-center gap-2"><Video size={14} /> Render HD Video (MP4)</span>
                                                       {isPremiumUser ? <Check size={14} /> : <Lock size={14} />}
                                                  </button>
                                                  {!isPremiumUser && <p className="text-[9px] text-gray-500 mt-2 text-center">Video export requires Premium rendering tier.</p>}
                                             </div>

                                             <hr className="border-gray-200 dark:border-white/5" />

                                             {/* Shorts Description Generator */}
                                             <div className="bg-gray-50 dark:bg-[#0b0f19] border border-gray-200 dark:border-gray-800 rounded-xl p-3">
                                                  <div className="flex justify-between items-center mb-2">
                                                       <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Social Copy & Tags</label>
                                                       <button
                                                            onClick={() => {
                                                                 navigator.clipboard.writeText(`Learn how this code works! 🚀💻\n\nDrop a comment if this helped you out. Subscribe to ${project.brandKit.handle} for more daily developer tips and coding tutorials! ⚡️\n\n#webdevelopment #coding #programming #developer #softwareengineer`);
                                                                 alert("Copied to clipboard!");
                                                            }}
                                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-[10px] font-bold flex items-center gap-1"
                                                       >
                                                            <Copy size={12} /> Copy
                                                       </button>
                                                  </div>
                                                  <textarea
                                                       readOnly
                                                       className="w-full h-24 bg-transparent text-[11px] text-gray-500 font-sans outline-none resize-none custom-scrollbar"
                                                       value={`Learn how this code works! 🚀💻\n\nDrop a comment if this helped you out. Subscribe to ${project.brandKit.handle} for more daily developer tips and coding tutorials! ⚡️\n\n#webdevelopment #coding #programming #developer #softwareengineer`}
                                                  />
                                             </div>
                                        </div>
                                   )}
                              </div>
                         </aside>

                         {/* CENTER: Canvas Preview */}
                         <section className="flex-1 overflow-hidden flex flex-col items-center justify-center p-4 lg:p-8 relative pattern-grid-lg order-1 lg:order-2">

                              {/* Canvas Wrapper */}
                              <div className={`relative transition-all duration-500 ease-out flex items-center justify-center border border-gray-200 dark:border-white/5 shadow-2xl overflow-hidden ${aspectStyles[project.aspectRatio]} rounded-md`}>

                                   {/* Background Layer */}
                                   <div className={`absolute inset-0 bg-gradient-to-br ${project.bgGradient} opacity-90 transition-all duration-700`}></div>

                                   {/* Branding Overlay */}
                                   {project.brandKit.enabled && (
                                        <div
                                             className="absolute bottom-6 right-8 font-bold tracking-tight text-white z-20 pointer-events-none transition-opacity font-sans"
                                             style={{ opacity: project.brandKit.opacity / 100, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
                                        >
                                             {project.brandKit.handle}
                                        </div>
                                   )}

                                   {/* Code Window Element */}
                                   <div
                                        className={`relative z-10 w-full max-w-[90%] overflow-hidden transition-all duration-300 ${themes[project.theme].bg} border border-white/10 flex flex-col ${project.windowStyle === 'floating' ? 'shadow-[0_20px_60px_rgba(0,0,0,0.5)]' : 'shadow-2xl'}`}
                                        style={{
                                             padding: project.padding === 0 ? 0 : '',
                                             margin: `${project.padding}px`,
                                             borderRadius: project.windowStyle === 'windows' ? '4px' : project.windowStyle === 'minimal' ? '8px' : '12px'
                                        }}
                                   >
                                        {(project.windowStyle === "macos" || project.windowStyle === "floating") && (
                                             <div className="h-10 px-4 flex items-center gap-2 bg-black/20 border-b border-white/5 shrink-0">
                                                  <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-sm"></div>
                                                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-sm"></div>
                                                  <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-sm"></div>
                                                  <div className="flex-grow text-center text-xs font-mono text-gray-400 opacity-60 mr-14">
                                                       {isPlaying ? project.scenes[playbackSceneIndex].name : activeScene.name}.ts
                                                  </div>
                                             </div>
                                        )}

                                        {project.windowStyle === "windows" && (
                                             <div className="h-10 px-4 flex items-center justify-between bg-black/20 border-b border-white/5 shrink-0">
                                                  <div className="text-xs font-mono text-gray-400 opacity-60 flex items-center gap-2">
                                                       <Type size={12} />
                                                       {isPlaying ? project.scenes[playbackSceneIndex].name : activeScene.name}.ts
                                                  </div>
                                                  <div className="flex items-center gap-4 opacity-40">
                                                       <div className="w-2.5 h-[1px] bg-white"></div>
                                                       <div className="w-2.5 h-2.5 border border-white"></div>
                                                       <div className="w-2.5 h-2.5 relative flex items-center justify-center">
                                                            <div className="absolute w-full h-[1px] bg-white rotate-45"></div>
                                                            <div className="absolute w-full h-[1px] bg-white -rotate-45"></div>
                                                       </div>
                                                  </div>
                                             </div>
                                        )}

                                        <div className={`p-6 md:p-8 font-mono text-[11px] sm:text-[13px] md:text-sm overflow-hidden ${themes[project.theme].text} relative leading-relaxed`}>
                                             {renderHighlightedCode(displayedCode, isPlaying ? project.scenes[playbackSceneIndex].spotlightLines : activeScene.spotlightLines)}
                                             {isPlaying && <span className="inline-block w-2 h-4 bg-blue-400 ml-1 animate-pulse align-middle shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>}
                                        </div>
                                   </div>
                              </div>

                              {/* Quick Play Controls Over Canvas */}
                              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 dark:bg-[#111827]/80 backdrop-blur-md border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-full shadow-2xl z-30 transition-colors duration-300">
                                   <button onClick={resetPlay} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" title="Reset"><SkipBack size={16} /></button>
                                   <button onClick={togglePlay} className="w-10 h-10 flex items-center justify-center bg-gray-900 dark:bg-white text-white dark:text-black rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-lg">
                                        {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-1" />}
                                   </button>
                                   <span className="text-xs font-mono text-gray-600 dark:text-gray-300 ml-2 border-l border-gray-300 dark:border-gray-700 pl-4">
                                        {isPlaying ? `Scene ${playbackSceneIndex + 1}/${project.scenes.length}` : 'Preview'}
                                   </span>
                              </div>
                         </section>
                    </main>

                    {/* BOTTOM PANEL: Multi-Scene Timeline */}
                    <footer className="h-40 lg:h-48 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0b0f19] shrink-0 flex flex-col z-20 order-3 transition-colors duration-300">
                         <div className="h-10 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 shrink-0 bg-white dark:bg-[#111827] transition-colors duration-300">
                              <div className="flex items-center gap-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                   <Layers size={14} /> Scene Timeline
                              </div>
                              <div className="flex items-center gap-2">
                                   <button
                                        onClick={() => {
                                             const newScene = { ...defaultScene, id: `scene-${Date.now()}`, name: `Scene ${project.scenes.length + 1}` };
                                             updateProject(prev => ({ ...prev, scenes: [...prev.scenes, newScene] }));
                                             setActiveSceneId(newScene.id);
                                        }}
                                        className="text-xs flex items-center gap-1 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-800 dark:text-white px-2 py-1 rounded transition-colors border border-gray-300 dark:border-white/10 shadow-sm dark:shadow-none"
                                   >
                                        <Plus size={12} /> Add Scene
                                   </button>
                              </div>
                         </div>

                         {/* Timeline Tracks */}
                         <div className="flex-1 overflow-x-auto p-4 flex gap-3 items-start relative custom-scrollbar">
                              {project.scenes.map((scene, idx) => (
                                   <div
                                        key={scene.id}
                                        onClick={() => setActiveSceneId(scene.id)}
                                        className={`h-24 min-w-[180px] rounded-lg border-2 flex flex-col overflow-hidden cursor-pointer transition-all ${activeSceneId === scene.id ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)] bg-blue-50 dark:bg-blue-500/10" : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] hover:border-gray-300 dark:hover:border-gray-700"}`}
                                   >
                                        <div className="h-7 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-2">
                                             <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 truncate w-24">{idx + 1}. {scene.name}</span>
                                             {project.scenes.length > 1 && (
                                                  <button
                                                       onClick={(e) => {
                                                            e.stopPropagation();
                                                            const newScenes = project.scenes.filter(s => s.id !== scene.id);
                                                            updateProject({ ...project, scenes: newScenes });
                                                            if (activeSceneId === scene.id) setActiveSceneId(newScenes[0].id);
                                                       }}
                                                       className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                                  >
                                                       <Trash2 size={12} />
                                                  </button>
                                             )}
                                        </div>
                                        <div className="flex-1 p-2 flex flex-col justify-center opacity-70">
                                             <div className="text-[9px] font-mono text-gray-500 truncate">{scene.code.substring(0, 30)}...</div>
                                             <div className="mt-2 flex gap-1">
                                                  {scene.spotlightLines.length > 0 && <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[8px] px-1 rounded border border-amber-200 dark:border-amber-500/30">Spotlight</span>}
                                             </div>
                                        </div>
                                   </div>
                              ))}
                         </div>
                    </footer>
               </div>

               {/* ========================================= */}
               {/* SEO CONTENT & FAQS (Scrollable below app) */}
               {/* ========================================= */}
               <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-24 transition-colors duration-300">
                    <article className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 md:p-12 lg:p-14 shadow-xl text-left transition-colors duration-300">
                         <div className="mb-14">
                              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">The Ultimate Cinematic Code Snippet Animator</h2>
                              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base max-w-3xl leading-relaxed">
                                   Visual storytelling is crucial for developer advocates and tech influencers. Transform raw algorithms into stunning, high-resolution typing animations perfectly sized for YouTube Shorts, Instagram Reels, and X. Stand out from the crowd with professional transitions and accurate syntax highlighting.
                              </p>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 mb-16">
                              <div>
                                   <h3 className="text-lg font-bold text-gray-900 dark:text-gray-200 mb-3 flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 flex items-center justify-center text-xs border border-blue-200 dark:border-blue-500/20">1</span>
                                        Multi-Scene Architecture
                                   </h3>
                                   <p className="text-sm text-gray-600 dark:text-gray-500 leading-relaxed">
                                        Don't just show a wall of text. Use the multi-scene timeline to break your tutorials down into logical steps. Build a narrative by guiding your audience from the hook, to the function breakdown, and finally to the result.
                                   </p>
                              </div>
                              <div>
                                   <h3 className="text-lg font-bold text-gray-900 dark:text-gray-200 mb-3 flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 flex items-center justify-center text-xs border border-blue-200 dark:border-blue-500/20">2</span>
                                        Intelligent Code Spotlight
                                   </h3>
                                   <p className="text-sm text-gray-600 dark:text-gray-500 leading-relaxed">
                                        Keep your viewers focused. By targeting specific line numbers, the editor will automatically dim and blur surrounding lines, highlighting exactly what matters in your JavaScript, Python, HTML, or CSS snippet.
                                   </p>
                              </div>
                         </div>

                         <div className="bg-gray-50 dark:bg-[#0b0f19] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-10 transition-colors duration-300">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8">Frequently Asked Questions</h3>

                              <div className="space-y-8">
                                   <div className="border-b border-gray-200 dark:border-gray-800 pb-8">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-300 mb-3">How do I create a vertical coding video for YouTube Shorts?</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-500 leading-relaxed">
                                             Open the <strong>Design</strong> tab in the editor panel and select the <strong>9:16 Format</strong>. This automatically adjusts the canvas dimensions and export aspect ratio to perfectly fit vertical platforms like YouTube Shorts, Instagram Reels, and TikTok without cutting off your code horizontally.
                                        </p>
                                   </div>

                                   <div className="border-b border-gray-200 dark:border-gray-800 pb-8">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-300 mb-3">What IDE syntax themes are supported?</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-500 leading-relaxed">
                                             The studio currently supports the most popular developer environments, including <strong>Dracula, Monokai, Tokyo Night, GitHub Dark, and standard Dark Mode</strong>. All themes include accurate keyword parsing, string detection, and custom highlight overlays to ensure your code is readable.
                                        </p>
                                   </div>

                                   <div>
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-300 mb-3">Can I save my projects and continue later?</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-500 leading-relaxed">
                                             Yes. The tool features a robust local project system. You can save your timeline, scenes, themes, and branding data as a lightweight <code>.json</code> file to your computer. When you're ready to edit again, simply click "Open" and select your file to pick up right where you left off. The tool also autosaves to your browser every few seconds.
                                        </p>
                                   </div>
                              </div>
                         </div>

                         {/* Structured Data for Google Rich Snippets */}
                         <script
                              type="application/ld+json"
                              dangerouslySetInnerHTML={{
                                   __html: JSON.stringify([
                                        {
                                             "@context": "https://schema.org",
                                             "@type": "SoftwareApplication",
                                             "name": "Cinematic Code Snippet Animator",
                                             "operatingSystem": "Web Browser",
                                             "applicationCategory": "MultimediaApplication",
                                             "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
                                        },
                                        {
                                             "@context": "https://schema.org",
                                             "@type": "FAQPage",
                                             "mainEntity": [
                                                  {
                                                       "@type": "Question",
                                                       "name": "How do I create a vertical coding video for YouTube Shorts?",
                                                       "acceptedAnswer": {
                                                            "@type": "Answer",
                                                            "text": "Open the Design tab and select the 9:16 Format. This automatically adjusts the canvas and export resolution for vertical platforms."
                                                       }
                                                  },
                                                  {
                                                       "@type": "Question",
                                                       "name": "What IDE syntax themes are supported?",
                                                       "acceptedAnswer": {
                                                            "@type": "Answer",
                                                            "text": "The studio currently supports Dracula, Monokai, Tokyo Night, GitHub Dark, and standard Dark Mode."
                                                       }
                                                  },
                                                  {
                                                       "@type": "Question",
                                                       "name": "Can I save my projects and continue later?",
                                                       "acceptedAnswer": {
                                                            "@type": "Answer",
                                                            "text": "Yes. The tool features a robust local project system allowing you to download a .json file of your workspace, alongside automatic browser autosaving."
                                                       }
                                                  }
                                             ]
                                        }
                                   ])
                              }}
                         />
                    </article>
               </div>

               {/* PREMIUM MODAL */}
               {showPremiumModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                         <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden transition-colors duration-300">
                              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 shadow-inner">
                                   <Download size={32} />
                              </div>
                              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Unlock HD Video Export</h2>
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                                   Export your cinematic multi-scene sequences in uncompressed 4K MP4 format directly from your browser. No watermarks.
                              </p>
                              <div className="flex flex-col gap-3">
                                   <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md">
                                        Upgrade to Creator Pro
                                   </button>
                                   <button onClick={() => setShowPremiumModal(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm font-medium py-2 transition-colors">
                                        Cancel
                                   </button>
                              </div>
                         </div>
                    </div>
               )}

               <style dangerouslySetInnerHTML={{
                    __html: `
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #9ca3af; border-radius: 4px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .pattern-grid-lg {
          background-image: linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
          background-size: 64px 64px;
        }
        .dark .pattern-grid-lg {
          background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        }
        @keyframes morphingWave {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}} />
          </div>
     );
}