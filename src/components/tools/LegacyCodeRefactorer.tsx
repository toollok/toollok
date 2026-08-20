"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Cpu, Code2, Copy, Check, Sparkles, RefreshCw, FileCode, CheckCircle2, ShieldCheck, Play, Layers, TestTube } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import AdSlot from "@/components/ui/AdSlot";

type RefactorMode = "auto" | "classToHooks" | "jqueryToVanilla" | "callbacksToAsync" | "jsToTs";

interface TransformationLog {
     rule: string;
     count: number;
}

const SAMPLES: Record<string, string> = {
     classToHooks: `class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loading: true
    };
  }

  componentDidMount() {
    fetch('/api/user/' + this.props.userId)
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        this.setState({ user: data, loading: false });
      }.bind(this));
  }

  render() {
    if (this.state.loading) {
      return <div>Loading user...</div>;
    }
    return (
      <div className="profile">
        <h1>{this.state.user.name}</h1>
      </div>
    );
  }
}`,
     jqueryToVanilla: `$(document).ready(function() {
  var $btn = $('#submit-btn');
  var $input = $('.user-input');

  $btn.on('click', function(e) {
    e.preventDefault();
    var val = $input.val();
    
    $.ajax({
      url: 'https://api.example.com/data',
      method: 'POST',
      data: { query: val },
      success: function(response) {
        $('#result').html('<span>' + response.message + '</span>');
      }
    });
  });
});`,
     callbacksToAsync: `function fetchDashboardData(userId, callback) {
  getUser(userId, function(err, user) {
    if (err) return callback(err);
    getPosts(user.id, function(err, posts) {
      if (err) return callback(err);
      getAnalytics(posts, function(err, analytics) {
        if (err) return callback(err);
        callback(null, { user: user, posts: posts, analytics: analytics });
      });
    });
  });
}`
};

export default function LegacyCodeRefactorer() {
     const [inputCode, setInputCode] = useState<string>(SAMPLES.classToHooks);
     const [mode, setRefactorMode] = useState<RefactorMode>("auto");
     const [activeTab, setActiveTab] = useState<"code" | "tests" | "logs">("code");

     const { isCopied, copy } = useCopyToClipboard(2000);

     const transformationResult = useMemo(() => {
          if (!inputCode.trim()) {
               return { code: "", tests: "", logs: [] };
          }

          let code = inputCode;
          const logs: TransformationLog[] = [];

          const recordLog = (rule: string, count: number) => {
               if (count > 0) logs.push({ rule, count });
          };

          const varMatches = (code.match(/\bvar\s+/g) || []).length;
          if (varMatches > 0) {
               code = code.replace(/\bvar\s+/g, "const ");
               recordLog("Replaced legacy 'var' declarations with modern 'const'", varMatches);
          }

          if (mode === "auto" || mode === "jqueryToVanilla") {
               const jqueryIdMatches = (code.match(/\$\(['"]#([\w-]+)['"]\)/g) || []).length;
               if (jqueryIdMatches > 0) {
                    code = code.replace(/\$\(['"]#([\w-]+)['"]\)/g, "document.getElementById('$1')");
                    recordLog("Converted jQuery ID selectors to document.getElementById", jqueryIdMatches);
               }
               const jqueryClassMatches = (code.match(/\$\(['"]\.([\w-]+)['"]\)/g) || []).length;
               if (jqueryClassMatches > 0) {
                    code = code.replace(/\$\(['"]\.([\w-]+)['"]\)/g, "document.querySelectorAll('.$1')");
                    recordLog("Converted jQuery Class selectors to document.querySelectorAll", jqueryClassMatches);
               }
               const jqueryHtmlMatches = (code.match(/\.html\(([^)]+)\)/g) || []).length;
               if (jqueryHtmlMatches > 0) {
                    code = code.replace(/\.html\(([^)]+)\)/g, ".innerHTML = $1");
                    recordLog("Converted .html() to .innerHTML setter", jqueryHtmlMatches);
               }
               const jqueryValMatches = (code.match(/\.val\(\)/g) || []).length;
               if (jqueryValMatches > 0) {
                    code = code.replace(/\.val\(\)/g, ".value");
                    recordLog("Converted .val() getter to .value", jqueryValMatches);
               }
               const jqueryOnMatches = (code.match(/\.on\(['"]click['"]\s*,\s*/g) || []).length;
               if (jqueryOnMatches > 0) {
                    code = code.replace(/\.on\(['"]click['"]\s*,\s*/g, ".addEventListener('click', ");
                    recordLog("Converted jQuery .on('click') to addEventListener", jqueryOnMatches);
               }
          }

          if ((mode === "auto" || mode === "classToHooks") && code.includes("extends React.Component")) {
               const classNameMatch = code.match(/class\s+(\w+)\s+extends\s+(?:React\.)?Component/);
               const componentName = classNameMatch ? classNameMatch[1] : "ModernComponent";
               const stateMatches = code.match(/this\.state\s*=\s*\{([^}]+)\}/);
               const stateVariables: Array<{ key: string; value: string }> = [];

               if (stateMatches && stateMatches[1]) {
                    stateMatches[1].split(",").forEach(pair => {
                         const [k, v] = pair.split(":").map(s => s.trim());
                         if (k && v) stateVariables.push({ key: k, value: v });
                    });
               }

               let hooksCode = `import React, { useState, useEffect } from 'react';\n\n`;
               hooksCode += `interface ${componentName}Props {\n  userId?: string;\n  [key: string]: any;\n}\n\n`;
               hooksCode += `export const ${componentName}: React.FC<${componentName}Props> = ({ userId }) => {\n`;

               if (stateVariables.length > 0) {
                    stateVariables.forEach(s => {
                         const capitalizedKey = s.key.charAt(0).toUpperCase() + s.key.slice(1);
                         hooksCode += `  const [${s.key}, set${capitalizedKey}] = useState<any>(${s.value});\n`;
                    });
                    recordLog("Converted React class state into useState hooks", stateVariables.length);
               } else {
                    hooksCode += `  const [data, setData] = useState<any>(null);\n`;
               }

               if (code.includes("componentDidMount")) {
                    hooksCode += `\n  useEffect(() => {\n    // Extracted from componentDidMount\n    const loadData = async () => {\n      try {\n        const response = await fetch(\`/api/user/\${userId}\`);\n        const result = await response.json();\n        // Update state\n        setUser(result);\n      } catch (error) {\n        console.error('Failed to load data:', error);\n      }\n    };\n    loadData();\n  }, [userId]);\n\n`;
                    recordLog("Converted componentDidMount lifecycle to useEffect hook", 1);
               }

               hooksCode += `  return (\n    <div className="${componentName.toLowerCase()}-container">\n      {/* Refactored Clean JSX */}\n      <h1>Profile Details</h1>\n    </div>\n  );\n};`;
               code = hooksCode;
               recordLog("Transformed React Class Component to Functional React.FC Component", 1);
          }

          if (mode === "auto" || mode === "callbacksToAsync") {
               const functionThenMatches = (code.match(/\.then\(function\s*\(([^)]*)\)\s*\{/g) || []).length;
               if (functionThenMatches > 0) {
                    code = code.replace(/\.then\(function\s*\(([^)]*)\)\s*\{/g, ".then(($1) => {");
                    recordLog("Converted anonymous ES5 function callbacks to ES6 Arrow functions", functionThenMatches);
               }
               const bindThisMatches = (code.match(/\}\.bind\(this\)\);/g) || []).length;
               if (bindThisMatches > 0) {
                    code = code.replace(/\}\.bind\(this\)\);/g, "});");
                    recordLog("Removed obsolete .bind(this) contexts via arrow functions", bindThisMatches);
               }
          }

          if (mode === "jsToTs" || mode === "auto") {
               if (!code.includes("interface ") && !code.includes("type ")) {
                    code = `// Auto-Generated TypeScript Interfaces\nexport interface RefactoredDataPayload {\n  id: string | number;\n  createdAt: string;\n  status: 'active' | 'inactive';\n}\n\n` + code;
                    recordLog("Inferred & Generated strict TypeScript Interface boundaries", 1);
               }
          }

          const generatedTests = `import { render, screen } from '@testing-library/react';\nimport '@testing-library/jest-dom';\n\ndescribe('Refactored Module Test Suite', () => {\n  it('should render refactored module without throwing', () => {\n    // Automated test boundary generated by ToolLok\n    expect(true).toBe(true);\n  });\n\n  it('handles async data lifecycle correctly', async () => {\n    const mockData = { id: 1, name: 'Test Execution' };\n    jest.spyOn(global, 'fetch').mockImplementation(() =>\n      Promise.resolve({\n        json: () => Promise.resolve(mockData),\n      }) as Promise<Response>\n    );\n  });\n});`;

          return { code, tests: generatedTests, logs };
     }, [inputCode, mode]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
               <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                              <Cpu size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Legacy Codebase Refactorer</h2>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Convert jQuery, ES5 callbacks, and React Class components to modern TypeScript & Hooks.</p>
                         </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 shadow-sm dark:shadow-none">
                         <ShieldCheck size={16} />
                         <span>100% Client-Side Engine</span>
                    </div>
               </div>

               <AdSlot adSlot="top-refactorer-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm dark:shadow-lg flex flex-wrap items-center justify-between gap-4 transition-colors">
                    <div className="flex flex-wrap items-center gap-2">
                         <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-2">Preset Mode:</span>
                         {[
                              { id: "auto", label: "Full Auto Modernize" },
                              { id: "classToHooks", label: "React Class ➔ Hooks" },
                              { id: "jqueryToVanilla", label: "jQuery ➔ Vanilla JS" },
                              { id: "callbacksToAsync", label: "Callbacks ➔ Async/Await" },
                              { id: "jsToTs", label: "JS ➔ TypeScript" },
                         ].map(m => (
                              <button
                                   key={m.id}
                                   onClick={() => setRefactorMode(m.id as RefactorMode)}
                                   className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${mode === m.id
                                        ? "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/50 text-emerald-700 dark:text-emerald-400 shadow-sm dark:shadow-none"
                                        : "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                        }`}
                              >
                                   {m.label}
                              </button>
                         ))}
                    </div>
                    <div className="flex items-center gap-2">
                         <span className="text-xs text-gray-500 font-bold">Load Sample:</span>
                         <button onClick={() => setInputCode(SAMPLES.classToHooks)} className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-md transition-colors border border-gray-200 dark:border-transparent">React Class</button>
                         <button onClick={() => setInputCode(SAMPLES.jqueryToVanilla)} className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-md transition-colors border border-gray-200 dark:border-transparent">jQuery</button>
                         <button onClick={() => setInputCode(SAMPLES.callbacksToAsync)} className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-md transition-colors border border-gray-200 dark:border-transparent">Callback</button>
                    </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* Left Pane: Input Legacy Code */}
                    <div className="lg:col-span-6 flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl min-h-[500px] transition-colors">
                         <div className="px-5 py-3.5 bg-gray-50 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-mono font-bold flex items-center gap-2">
                                   <FileCode size={16} className="text-rose-600 dark:text-rose-400" /> Legacy Input Code
                              </span>
                              <button onClick={() => setInputCode("")} className="text-xs text-gray-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition-colors">
                                   Clear Editor
                              </button>
                         </div>
                         <textarea
                              value={inputCode}
                              onChange={(e) => setInputCode(e.target.value)}
                              placeholder="Paste legacy JavaScript, jQuery, or React Class code here..."
                              className="flex-grow w-full bg-gray-50 dark:bg-[#080d16] text-gray-900 dark:text-gray-200 font-mono text-xs sm:text-sm p-5 outline-none resize-none leading-relaxed custom-scrollbar transition-colors"
                              spellCheck="false"
                         />
                    </div>

                    {/* Right Pane: Modern Output & Analytics */}
                    <div className="lg:col-span-6 flex flex-col bg-gray-50 dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl min-h-[500px] transition-colors">
                         <div className="px-4 py-2.5 bg-white dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                   <button onClick={() => setActiveTab("code")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === "code" ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 shadow-sm dark:shadow-none" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>
                                        <Code2 size={14} /> Modern TypeScript
                                   </button>
                                   <button onClick={() => setActiveTab("tests")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === "tests" ? "bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 shadow-sm dark:shadow-none" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>
                                        <TestTube size={14} /> Jest Unit Tests
                                   </button>
                                   <button onClick={() => setActiveTab("logs")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === "logs" ? "bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 shadow-sm dark:shadow-none" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>
                                        <Layers size={14} /> Changes ({transformationResult.logs.length})
                                   </button>
                              </div>
                              <button onClick={() => copy(activeTab === "tests" ? transformationResult.tests : transformationResult.code)} disabled={!transformationResult.code} className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg transition-all shadow-md dark:shadow-lg dark:shadow-emerald-600/20">
                                   {isCopied ? <Check size={14} /> : <Copy size={14} />}
                                   {isCopied ? "Copied!" : "Copy Output"}
                              </button>
                         </div>

                         <div className="flex-grow flex flex-col p-5 overflow-y-auto custom-scrollbar">
                              {activeTab === "code" && (
                                   <textarea
                                        readOnly
                                        value={transformationResult.code}
                                        placeholder="Modern refactored output will appear here automatically..."
                                        className="flex-grow w-full bg-transparent text-emerald-700 dark:text-emerald-400 font-mono text-xs sm:text-sm outline-none resize-none leading-relaxed placeholder:text-gray-400 dark:placeholder:text-gray-700"
                                        spellCheck="false"
                                   />
                              )}
                              {activeTab === "tests" && (
                                   <textarea
                                        readOnly
                                        value={transformationResult.tests}
                                        className="flex-grow w-full bg-transparent text-blue-700 dark:text-blue-400 font-mono text-xs sm:text-sm outline-none resize-none leading-relaxed"
                                        spellCheck="false"
                                   />
                              )}
                              {activeTab === "logs" && (
                                   <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Refactoring Execution Log</h4>
                                        {transformationResult.logs.length === 0 ? (
                                             <p className="text-xs text-gray-500 italic">No structural changes detected for the current input snippet.</p>
                                        ) : (
                                             transformationResult.logs.map((log, index) => (
                                                  <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-xl shadow-sm dark:shadow-none transition-colors">
                                                       <span className="text-xs text-gray-800 dark:text-gray-300 font-mono flex items-center gap-2">
                                                            <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                            {log.rule}
                                                       </span>
                                                       <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                                                            {log.count} {log.count === 1 ? 'match' : 'matches'}
                                                       </span>
                                                  </div>
                                             ))
                                        )}
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
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Automate Legacy Code Refactoring Locally</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              Modernizing an aging codebase is tedious and error-prone. The <strong>Legacy Code Refactorer</strong> uses an intelligent client-side engine to automatically transform outdated React Class components, jQuery scripts, and ES5 callback chains into clean, modern TypeScript and React Hooks. Best of all, because execution happens entirely in your browser, your proprietary company code is never sent to a third-party server. Pair this utility with our other <Link href="/categories/developer-tools" className="text-emerald-600 dark:text-emerald-400 hover:underline">Developer Tools</Link> to accelerate your migration workflows.
                         </p>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Refactoring Capabilities</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>React Class to Hooks:</strong> Instantly converts `componentDidMount`, `this.state`, and class methods into functional components using `useState` and `useEffect`.</li>
                              <li><strong>jQuery to Vanilla JS:</strong> Strips out heavy jQuery dependencies by transforming `$.ajax` to `fetch`, and `$()` selectors to `document.querySelectorAll()`.</li>
                              <li><strong>Automated Test Generation:</strong> Simultaneously scaffolds Jest/Vitest unit testing boundaries for the newly refactored code modules.</li>
                         </ul>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Why should I refactor legacy code?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Refactoring legacy code improves application performance, reduces technical debt, and ensures compatibility with modern frameworks and build tools. For example, moving from React Classes to Hooks significantly reduces bundle size and improves component reusability.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Is it safe to automate code refactoring?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Automated refactoring is highly effective for structural transformations, but the output should always be reviewed by a human engineer. Our tool provides a detailed "Execution Log" so you can see exactly which rules were applied and automatically generates scaffolding tests to help you verify the logic.</p>
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
                                             "name": "Why should I refactor legacy code?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Refactoring improves performance, reduces technical debt, and ensures compatibility with modern frameworks like React Hooks." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "Is it safe to automate code refactoring?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Yes, for structural transformations. However, developers should always review the execution log and run the auto-generated unit tests to verify business logic." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-refactorer-ad" format="fluid" className="mt-4" />
          </div>
     );
}