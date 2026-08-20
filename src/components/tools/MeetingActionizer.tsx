"use client";

import { useState } from "react";
import Link from "next/link";
import { Mic, FileText, CheckSquare, Kanban, Mail, Sparkles, Copy, Check, Bot, LayoutTemplate, Send, RefreshCw, AlertCircle } from "lucide-react";
import AdSlot from "@/components/ui/AdSlot";

type TabType = "summary" | "tasks" | "jira" | "email";

export default function MeetingActionizer() {
     const [transcript, setTranscript] = useState("");
     const [isProcessing, setIsProcessing] = useState(false);
     const [progressStep, setProgressStep] = useState("");
     const [activeTab, setActiveTab] = useState<TabType>("summary");
     const [isCopied, setIsCopied] = useState(false);

     const [results, setResults] = useState<{
          summary: string; tasks: { owner: string; task: string; deadline: string }[];
          jira: { type: string; title: string; desc: string; storyPoints: string }[]; email: string;
     } | null>(null);

     const analyzeTranscript = (text: string) => {
          const lines = text.split('\n').filter(l => l.trim().length > 0);
          let currentSpeaker = "Team Member";
          const tasks: { owner: string; task: string; deadline: string }[] = [];
          const decisions: string[] = [];
          const speakers = new Set<string>();

          lines.forEach(line => {
               const speakerMatch = line.match(/^([A-Za-z\s]+)(?:\s*\[.*?\])?\s*:/);
               let content = line;
               if (speakerMatch) {
                    currentSpeaker = speakerMatch[1].trim();
                    speakers.add(currentSpeaker);
                    content = line.replace(/^.*?:/, '').trim();
               }
               const lower = content.toLowerCase();

               if (lower.includes("will ") || lower.includes("need to ") || lower.includes("assigned to ") || lower.includes("action item")) {
                    let deadline = "TBD";
                    if (lower.includes("tomorrow")) deadline = "Tomorrow";
                    else if (lower.includes("friday")) deadline = "Friday";
                    else if (lower.includes("next week")) deadline = "Next Week";
                    else if (lower.includes("eod")) deadline = "End of Day";
                    tasks.push({ owner: currentSpeaker, task: content, deadline });
               }

               if (lower.includes("decided") || lower.includes("agreed") || lower.includes("plan is") || lower.includes("prioritize")) {
                    decisions.push(content);
               }
          });

          const speakerList = Array.from(speakers);
          const summary = `Meeting analyzed with ${speakerList.length > 0 ? speakerList.length : 'multiple'} participants detected${speakerList.length > 0 ? ' (' + speakerList.join(', ') + ')' : ''}. \n\n${decisions.length > 0 ? 'Key Decisions:\n- ' + decisions.join('\n- ') : 'No explicit major decisions were detected in the transcript. The conversation primarily focused on standard updates.'}`;

          const jira = tasks.map((t, index) => {
               const points = t.task.length > 60 ? "5" : t.task.length > 30 ? "3" : "1";
               const type = t.task.toLowerCase().includes("bug") || t.task.toLowerCase().includes("fix") ? "Bug" : "Task";
               return {
                    type, title: t.task.split(' ').slice(0, 6).join(' ') + "...",
                    desc: `As discussed in the recent sync.\n\nAssignee: ${t.owner}\nDetails: ${t.task}\nTarget: ${t.deadline}`,
                    storyPoints: points
               };
          });

          const emailTasks = tasks.map(t => `- @${t.owner}: ${t.task} (Due: ${t.deadline})`).join('\n');
          const email = `Hi Team,\n\nThanks for the great sync today. Here is the automated recap of our meeting:\n\n${decisions.length > 0 ? '## Key Alignments\n- ' + decisions.join('\n- ') + '\n\n' : ''}## Action Items\n${emailTasks || 'No direct action items recorded.'}\n\nPlease let me know if anything was missed!\n\nBest,\n[Your Name]`;

          return { summary, tasks, jira, email };
     };

     const processTranscript = () => {
          if (!transcript.trim()) return;
          setIsProcessing(true);
          setProgressStep("Running heuristic speaker diarization...");

          setTimeout(() => {
               setProgressStep("Extracting contextual action items & deadlines...");
               setTimeout(() => {
                    setProgressStep("Formatting Jira payloads & email drafts...");
                    setTimeout(() => {
                         setResults(analyzeTranscript(transcript));
                         setIsProcessing(false);
                         setActiveTab("summary");
                    }, 600);
               }, 600);
          }, 600);
     };

     const copyContent = (text: string) => {
          navigator.clipboard.writeText(text);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
     };

     const getActiveContent = () => {
          if (!results) return "";
          if (activeTab === "summary") return results.summary;
          if (activeTab === "email") return results.email;
          if (activeTab === "tasks") return results.tasks.map(t => `[ ] ${t.task} (@${t.owner}) - Due: ${t.deadline}`).join('\n');
          if (activeTab === "jira") return results.jira.map(j => `[${j.type}] ${j.title} (Points: ${j.storyPoints})\nDesc: ${j.desc}`).join('\n\n');
          return "";
     };

     return (
          <div className="w-full flex flex-col gap-6">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                              <Bot size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Context-Aware Meeting Actionizer</h2>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Convert messy audio transcripts into structured summaries, Jira tickets, and follow-up emails instantly.</p>
                         </div>
                    </div>
               </div>

               <AdSlot adSlot="top-actionizer-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-5 flex flex-col gap-6">
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 flex flex-col gap-6 shadow-sm dark:shadow-xl transition-colors">
                              <div className="space-y-3 flex-grow">
                                   <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-gray-900 dark:text-gray-300 flex items-center gap-2">
                                             <Mic size={16} className="text-amber-600 dark:text-amber-400" /> Raw Meeting Transcript
                                        </label>
                                        <span className="text-[10px] bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-500 px-2 py-1 rounded-md font-mono transition-colors">
                                             {transcript.trim() ? `${transcript.trim().split(/\s+/).length} words` : "0 words"}
                                        </span>
                                   </div>
                                   <textarea
                                        value={transcript}
                                        onChange={(e) => setTranscript(e.target.value)}
                                        placeholder="Paste your raw Zoom, Teams, or Slack transcript here...&#10;&#10;Format Example:&#10;Alex: What are we doing about the DB migration?&#10;Sarah: I will have the script done by Friday.&#10;Alex: Great, we agreed to prioritize that over UI."
                                        className="w-full min-h-[220px] bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-xs font-mono text-gray-900 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-700 focus:outline-none focus:border-amber-500/50 transition-all resize-none leading-relaxed"
                                   />
                              </div>
                              <button
                                   onClick={processTranscript}
                                   disabled={!transcript.trim() || isProcessing}
                                   className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold rounded-xl transition-all shadow-md dark:shadow-lg dark:shadow-amber-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                   {isProcessing ? (
                                        <span className="flex items-center gap-2 animate-pulse"><RefreshCw size={18} className="animate-spin" /> {progressStep}</span>
                                   ) : (
                                        <><Sparkles size={18} /> Extract Action Items</>
                                   )}
                              </button>
                         </div>
                    </div>

                    <div className="lg:col-span-7 flex flex-col gap-6 h-full">
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col h-full min-h-[400px] transition-colors">
                              <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 dark:border-gray-800/50 pb-4 mb-4">
                                   <button onClick={() => setActiveTab("summary")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "summary" ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30" : "bg-gray-50 dark:bg-gray-950 text-gray-500 border border-gray-200 dark:border-gray-800 hover:text-gray-900 dark:hover:text-gray-300"}`}>
                                        <FileText size={14} /> Exec Summary
                                   </button>
                                   <button onClick={() => setActiveTab("tasks")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "tasks" ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30" : "bg-gray-50 dark:bg-gray-950 text-gray-500 border border-gray-200 dark:border-gray-800 hover:text-gray-900 dark:hover:text-gray-300"}`}>
                                        <CheckSquare size={14} /> Action Items
                                   </button>
                                   <button onClick={() => setActiveTab("jira")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "jira" ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30" : "bg-gray-50 dark:bg-gray-950 text-gray-500 border border-gray-200 dark:border-gray-800 hover:text-gray-900 dark:hover:text-gray-300"}`}>
                                        <Kanban size={14} /> Jira Tickets
                                   </button>
                                   <button onClick={() => setActiveTab("email")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "email" ? "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30" : "bg-gray-50 dark:bg-gray-950 text-gray-500 border border-gray-200 dark:border-gray-800 hover:text-gray-900 dark:hover:text-gray-300"}`}>
                                        <Mail size={14} /> Follow-up Email
                                   </button>
                              </div>

                              <div className="flex-grow flex flex-col relative">
                                   {!results ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-700 gap-3 absolute inset-0">
                                             <LayoutTemplate className="opacity-20" size={48} />
                                             <p className="text-center px-8 text-xs max-w-sm">Paste a transcript and click extract. The heuristic engine will automatically isolate speakers, track decisions, and draft assets.</p>
                                        </div>
                                   ) : (
                                        <div className="flex flex-col h-full gap-4">
                                             <div className="flex-grow bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-5 overflow-y-auto max-h-[300px] transition-colors">
                                                  {activeTab === "summary" && (
                                                       <div className="text-sm text-gray-800 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                                            {results.summary}
                                                       </div>
                                                  )}
                                                  {activeTab === "tasks" && (
                                                       <div className="space-y-3">
                                                            {results.tasks.length === 0 ? (
                                                                 <div className="text-xs text-gray-500 flex items-center gap-2"><AlertCircle size={14} /> No obvious action items detected in transcript.</div>
                                                            ) : (
                                                                 results.tasks.map((t, i) => (
                                                                      <div key={i} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm dark:shadow-none transition-colors">
                                                                           <div className="mt-0.5"><CheckSquare size={16} className="text-emerald-600 dark:text-emerald-400" /></div>
                                                                           <div className="flex flex-col">
                                                                                <span className="text-sm text-gray-900 dark:text-gray-200">{t.task}</span>
                                                                                <div className="flex items-center gap-3 mt-1 text-[10px] font-bold uppercase tracking-wider">
                                                                                     <span className="text-amber-600 dark:text-amber-400">Owner: {t.owner}</span>
                                                                                     <span className="text-gray-500">Target: {t.deadline}</span>
                                                                                </div>
                                                                           </div>
                                                                      </div>
                                                                 ))
                                                            )}
                                                       </div>
                                                  )}
                                                  {activeTab === "jira" && (
                                                       <div className="space-y-3">
                                                            {results.jira.length === 0 ? (
                                                                 <div className="text-xs text-gray-500 flex items-center gap-2"><AlertCircle size={14} /> No action items to convert into tickets.</div>
                                                            ) : (
                                                                 results.jira.map((j, i) => (
                                                                      <div key={i} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg space-y-2 shadow-sm dark:shadow-none transition-colors">
                                                                           <div className="flex items-center justify-between">
                                                                                <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded uppercase border border-blue-100 dark:border-transparent">{j.type}</span>
                                                                                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-500 bg-gray-100 dark:bg-gray-950 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-800">{j.storyPoints} Points</span>
                                                                           </div>
                                                                           <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">{j.title}</h4>
                                                                           <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{j.desc}</p>
                                                                      </div>
                                                                 ))
                                                            )}
                                                       </div>
                                                  )}
                                                  {activeTab === "email" && (
                                                       <div className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-300 font-mono leading-relaxed">
                                                            {results.email}
                                                       </div>
                                                  )}
                                             </div>

                                             <div className="flex items-center justify-between pt-2">
                                                  <button onClick={() => copyContent(getActiveContent())} className="flex items-center gap-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:border-gray-600 text-gray-900 dark:text-white font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-sm dark:shadow-none">
                                                       {isCopied ? <Check size={14} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={14} />}
                                                       {isCopied ? "Copied to Clipboard!" : "Copy Active Tab"}
                                                  </button>
                                                  <div className="flex items-center gap-2">
                                                       {activeTab === "email" && (
                                                            <a
                                                                 href={`mailto:?subject=Meeting%20Recap%20%26%20Action%20Items&body=${encodeURIComponent(results.email)}`}
                                                                 className="flex items-center gap-1.5 text-[10px] font-bold bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-500 transition-colors shadow-md"
                                                            >
                                                                 <Send size={12} /> Open in Email Client
                                                            </a>
                                                       )}
                                                  </div>
                                             </div>
                                        </div>
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
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Turn Meeting Transcripts into Tasks Instantly</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              Stop wasting time manually summarizing Zoom or Teams calls. ToolLok's <strong>Meeting Actionizer</strong> uses an intelligent heuristic engine to parse raw meeting transcripts, automatically identifying speakers, extracting decisions, and assigning deadlines. With one click, convert conversational text into executable Jira tickets and professional follow-up emails. Enhance your team's velocity with our comprehensive <Link href="/categories/productivity-tools" className="text-amber-600 dark:text-amber-400 hover:underline">Productivity Tools</Link>.
                         </p>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Intelligent Extraction Features</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Automated Action Items:</strong> Detects commitments made during the call (e.g., "I will send the report by Friday") and formats them into a clean task list with owners and deadlines.</li>
                              <li><strong>Jira Ticket Generation:</strong> Automatically structures tasks into agile ticket formats, predicting story points based on task complexity.</li>
                              <li><strong>100% Privacy:</strong> Unlike standard AI transcription services, our heuristic engine runs completely client-side in your browser, keeping your corporate meetings entirely confidential.</li>
                         </ul>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">How does the AI extract action items?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">The tool uses a pattern-matching engine that looks for structural cues in the transcript, such as speaker names followed by commitment verbs ("will do", "need to", "action item"). It then correlates these with temporal keywords to assign deadlines.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Can it write follow-up emails?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Yes! The tool aggregates the extracted decisions and action items into a clean, professional email template. You can click the "Open in Email Client" button to immediately draft the email in your default mail app.</p>
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
                                             "name": "How does the AI extract action items?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "The tool uses pattern-matching to find structural cues, such as speaker names and commitment verbs, correlating them with temporal keywords to assign deadlines." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "Can it write follow-up emails?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Yes! It aggregates decisions and action items into a clean email template that you can open directly in your mail client." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-actionizer-ad" format="fluid" className="mt-4" />
          </div>
     );
}