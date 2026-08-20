"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Terminal, Copy, Check, Code2, Info, AlertTriangle } from "lucide-react";
import AdSlot from "@/components/ui/AdSlot";

type Language = "javascript" | "python" | "go";

export default function RegexTester() {
     const [pattern, setPattern] = useState<string>("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
     const [flags, setFlags] = useState<string>("g");
     const [testString, setTestString] = useState<string>("Hello there!\n\nPlease contact support at support@codemines.com for billing.\nFor sales inquiries, reach out to sales-team@codemines.com.\n\nInvalid emails like admin@.com or user@domain shouldn't match.");

     const [error, setError] = useState<string | null>(null);
     const [highlightedElements, setHighlightedElements] = useState<React.ReactNode[]>([]);
     const [matchCount, setMatchCount] = useState<number>(0);

     const [activeLang, setActiveLang] = useState<Language>("javascript");
     const [isCopied, setIsCopied] = useState(false);

     useEffect(() => {
          if (!pattern) {
               setHighlightedElements([<span key="empty">{testString}</span>]);
               setMatchCount(0);
               setError(null);
               return;
          }
          try {
               new RegExp(pattern, flags);
               const safeFlags = flags.includes('g') ? flags : flags + 'g';
               const regex = new RegExp(pattern, safeFlags);

               let match;
               let lastIndex = 0;
               const elements: React.ReactNode[] = [];
               let count = 0;

               while ((match = regex.exec(testString)) !== null) {
                    if (match.index === regex.lastIndex) regex.lastIndex++;
                    if (match.index > lastIndex) {
                         elements.push(<span key={`text-${lastIndex}`}>{testString.substring(lastIndex, match.index)}</span>);
                    }
                    if (match[0].length > 0) {
                         elements.push(
                              <span key={`match-${match.index}`} className="bg-blue-500/30 text-blue-300 border-b border-blue-400 rounded-sm px-0.5">
                                   {match[0]}
                              </span>
                         );
                         count++;
                    }
                    lastIndex = match.index + match[0].length;
               }
               if (lastIndex < testString.length) {
                    elements.push(<span key={`text-end`}>{testString.substring(lastIndex)}</span>);
               }

               setHighlightedElements(elements.length > 0 ? elements : [<span key="none">{testString}</span>]);
               setMatchCount(count);
               setError(null);
          } catch (err: any) {
               setError(err.message);
               setHighlightedElements([<span key="error" className="text-gray-500">{testString}</span>]);
               setMatchCount(0);
          }
     }, [pattern, flags, testString]);

     const generateCodeSnippet = () => {
          switch (activeLang) {
               case "javascript":
                    return `const regex = /${pattern}/${flags};\nconst str = \`${testString.split('\n')[0]}...\`;\n\n// Check if matches\nconst isValid = regex.test(str);\n\n// Extract all matches\nconst matches = str.match(regex);\nconsole.log(matches);`;
               case "python":
                    return `import re\n\npattern = r"${pattern}"\nstring = "${testString.split('\n')[0]}..."\n\n# Find all matches\nmatches = re.findall(pattern, string)\nprint(matches)`;
               case "go":
                    return `package main\n\nimport (\n\t"fmt"\n\t"regexp"\n)\n\nfunc main() {\n\tre := regexp.MustCompile(\`${pattern}\`)\n\tstr := "${testString.split('\n')[0]}..."\n\n\t// Find all matches\n\tmatches := re.FindAllString(str, -1)\n\tfmt.Println(matches)\n}`;
          }
     };

     const handleCopyCode = () => {
          navigator.clipboard.writeText(generateCodeSnippet());
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
     };

     return (
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
               <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                         <Terminal size={24} />
                    </div>
                    <div>
                         <div className="flex items-center gap-3">
                              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Interactive Regex Tester</h2>
                              <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                   🟢 100% Free
                              </span>
                         </div>
                         <p className="text-sm text-gray-600 dark:text-gray-400">Write, test, and debug regular expressions in real-time.</p>
                    </div>
               </div>

               <AdSlot adSlot="top-regex-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    <div className="xl:col-span-8 flex flex-col gap-6">
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors">
                              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                              <label className="text-sm font-bold text-gray-900 dark:text-gray-300 mb-3 block">Regular Expression</label>

                              <div className="flex flex-col sm:flex-row gap-3">
                                   <div className="flex-grow flex items-center bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
                                        <span className="text-gray-500 font-mono text-lg mr-1">/</span>
                                        <input
                                             type="text"
                                             value={pattern}
                                             onChange={(e) => setPattern(e.target.value)}
                                             className="w-full bg-transparent text-indigo-600 dark:text-indigo-300 font-mono text-base outline-none"
                                             placeholder="Enter regex pattern (e.g., ^[a-z]+$)"
                                             spellCheck="false"
                                        />
                                        <span className="text-gray-500 font-mono text-lg ml-1">/</span>
                                   </div>
                                   <input
                                        type="text"
                                        value={flags}
                                        onChange={(e) => setFlags(e.target.value)}
                                        className="w-full sm:w-24 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400 outline-none focus:border-indigo-500 placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-colors"
                                        placeholder="flags"
                                        spellCheck="false"
                                   />
                              </div>

                              {error && (
                                   <div className="mt-4 flex items-center gap-2 text-rose-600 dark:text-rose-400 text-sm bg-rose-50 dark:bg-rose-500/10 px-3 py-2 rounded-lg border border-rose-200 dark:border-rose-500/20">
                                        <AlertTriangle size={16} />
                                        <span className="font-mono">{error}</span>
                                   </div>
                              )}
                         </div>

                         <div className="bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl flex flex-col flex-grow min-h-[300px] transition-colors">
                              <div className="px-5 py-4 bg-gray-50 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between transition-colors">
                                   <span className="text-sm font-bold text-gray-900 dark:text-gray-300">Test String</span>
                                   <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${matchCount > 0 ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700"}`}>
                                        {matchCount} {matchCount === 1 ? "Match" : "Matches"}
                                   </span>
                              </div>

                              <div className="relative flex-grow">
                                   {/* Invisible textarea for editing over dark background */}
                                   <textarea
                                        value={testString}
                                        onChange={(e) => setTestString(e.target.value)}
                                        className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-gray-900 dark:caret-white font-mono text-sm p-5 outline-none resize-none z-10"
                                        spellCheck="false"
                                   />
                                   {/* Visible layer with highlights (Hardcoded to dark for proper syntax visibility) */}
                                   <div className="absolute inset-0 w-full h-full font-mono text-sm p-5 bg-[#0d1117] text-gray-400 whitespace-pre-wrap break-words pointer-events-none z-0">
                                        {highlightedElements}
                                   </div>
                              </div>
                         </div>
                    </div>

                    <div className="xl:col-span-4 flex flex-col gap-6">
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl transition-colors">
                              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 transition-colors">
                                   <Code2 size={16} className="text-indigo-600 dark:text-indigo-400" />
                                   <span className="text-sm font-bold text-gray-900 dark:text-gray-300">Export Code</span>
                              </div>
                              <div className="flex border-b border-gray-200 dark:border-gray-800 text-xs font-medium transition-colors">
                                   {(["javascript", "python", "go"] as Language[]).map((lang) => (
                                        <button
                                             key={lang} onClick={() => setActiveLang(lang)}
                                             className={`flex-1 py-3 text-center transition-colors capitalize ${activeLang === lang ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-500/5" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"}`}
                                        >
                                             {lang}
                                        </button>
                                   ))}
                              </div>
                              <div className="relative group">
                                   <button onClick={handleCopyCode} className="absolute top-3 right-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm dark:shadow-none" title="Copy snippet">
                                        {isCopied ? <Check size={14} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={14} />}
                                   </button>
                                   {/* Hardcoded dark terminal block for optimal code rendering */}
                                   <pre className="p-5 font-mono text-xs text-gray-400 bg-[#0a0f18] overflow-x-auto">
                                        <code dangerouslySetInnerHTML={{ __html: generateCodeSnippet().replace(/\n/g, '<br/>').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;') }} />
                                   </pre>
                              </div>
                         </div>

                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm dark:shadow-xl transition-colors">
                              <div className="flex items-center gap-2 mb-4">
                                   <Info size={16} className="text-amber-600 dark:text-amber-400" />
                                   <span className="text-sm font-bold text-gray-900 dark:text-gray-300">Quick Reference</span>
                              </div>
                              <div className="space-y-2 text-xs font-mono">
                                   {[
                                        { token: ".", desc: "Any character except newline" },
                                        { token: "\\w", desc: "Alphanumeric + underscore" },
                                        { token: "\\d", desc: "Any digit (0-9)" },
                                        { token: "\\s", desc: "Whitespace character" },
                                        { token: "[A-Z]", desc: "Character range" },
                                        { token: "^", desc: "Start of string" },
                                        { token: "$", desc: "End of string" },
                                        { token: "*", desc: "0 or more times" },
                                        { token: "+", desc: "1 or more times" },
                                        { token: "?", desc: "0 or 1 time" },
                                   ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/50 last:border-0 transition-colors">
                                             <span className="text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-transparent px-1.5 py-0.5 rounded">{item.token}</span>
                                             <span className="text-gray-500">{item.desc}</span>
                                        </div>
                                   ))}
                              </div>
                         </div>
                    </div>
               </div>

               {/* ========================================= */}
               {/* SEO CONTENT & FAQS */}
               {/* ========================================= */}
               <div className="mt-12 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm dark:shadow-none">
                    <div className="prose dark:prose-invert max-w-none">
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Master Regular Expressions with the Interactive Regex Tester</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              Writing Regular Expressions (Regex) can be incredibly frustrating without visual feedback. ToolLok's <strong>Interactive Regex Tester</strong> solves this by evaluating your patterns and flags in real-time, highlighting exact matches and capture groups directly over your test strings. Whether you are validating emails or parsing logs, this utility is a cornerstone of our <Link href="/categories/developer-tools" className="text-indigo-600 dark:text-indigo-400 hover:underline">Developer Tools</Link> suite.
                         </p>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Key Features</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Live Match Highlighting:</strong> Instantly see which characters your Regex is capturing and identify catastrophic backtracking loops before they reach production.</li>
                              <li><strong>Code Snippet Export:</strong> Once your pattern is perfect, export the implementation code directly into JavaScript, Python, or Go with a single click.</li>
                              <li><strong>Integrated Cheat Sheet:</strong> Never forget a metacharacter again. The quick reference sidebar keeps common boundaries, anchors, and quantifiers easily accessible.</li>
                         </ul>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">What does the "g" flag mean in Regex?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">The "g" flag stands for "global". Without it, a regular expression will stop searching after it finds the very first match. Including the "g" flag tells the regex engine to find all possible matches within the entire string.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Are my Regex patterns logged?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">No. The ToolLok Regex Tester evaluates all patterns client-side using your browser's native JavaScript execution engine. Your proprietary patterns and sensitive test strings are never sent to an external server.</p>
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
                                             "name": "What does the 'g' flag mean in Regex?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "The 'g' flag stands for 'global', instructing the regex engine to find all possible matches within the entire string rather than stopping at the first match." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "Are my Regex patterns logged?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "No. The Regex Tester evaluates all patterns client-side. Your proprietary patterns and sensitive test strings are never sent to an external server." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-regex-ad" format="fluid" className="mt-4" />
          </div>
     );
}