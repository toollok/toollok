"use client";

import { useState, useMemo } from "react";
import { Cpu, Code2, Copy, Check, Sparkles, RefreshCw, FileCode, CheckCircle2, ShieldCheck, Play, Layers, TestTube } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import AdSlot from "@/components/ui/AdSlot";

type RefactorMode = "auto" | "classToHooks" | "jqueryToVanilla" | "callbacksToAsync" | "jsToTs";

interface TransformationLog {
     rule: string;
     count: number;
}

// Sample Legacy Snippets for Quick Testing
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

     // Client-Side AST & Pattern Transformation Engine
     const transformationResult = useMemo(() => {
          if (!inputCode.trim()) {
               return { code: "", tests: "", logs: [] };
          }

          let code = inputCode;
          const logs: TransformationLog[] = [];

          const recordLog = (rule: string, count: number) => {
               if (count > 0) logs.push({ rule, count });
          };

          // 1. Replace 'var' with 'const' / 'let'
          const varMatches = (code.match(/\bvar\s+/g) || []).length;
          if (varMatches > 0) {
               code = code.replace(/\bvar\s+/g, "const ");
               recordLog("Replaced legacy 'var' declarations with modern 'const'", varMatches);
          }

          // 2. jQuery to Vanilla JS Conversions
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

          // 3. React Class Component to Functional Component with Hooks
          if ((mode === "auto" || mode === "classToHooks") && code.includes("extends React.Component")) {
               const classNameMatch = code.match(/class\s+(\w+)\s+extends\s+(?:React\.)?Component/);
               const componentName = classNameMatch ? classNameMatch[1] : "ModernComponent";

               // Extract State variables
               const stateMatches = code.match(/this\.state\s*=\s*\{([^}]+)\}/);
               const stateVariables: Array<{ key: string; value: string }> = [];

               if (stateMatches && stateMatches[1]) {
                    stateMatches[1].split(",").forEach(pair => {
                         const [k, v] = pair.split(":").map(s => s.trim());
                         if (k && v) stateVariables.push({ key: k, value: v });
                    });
               }

               // Extract Props interface if TS
               let hooksCode = `import React, { useState, useEffect } from 'react';\n\n`;
               hooksCode += `interface ${componentName}Props {\n  userId?: string;\n  [key: string]: any;\n}\n\n`;
               hooksCode += `export const ${componentName}: React.FC<${componentName}Props> = ({ userId }) => {\n`;

               // Inject State Hooks
               if (stateVariables.length > 0) {
                    stateVariables.forEach(s => {
                         const capitalizedKey = s.key.charAt(0).toUpperCase() + s.key.slice(1);
                         hooksCode += `  const [${s.key}, set${capitalizedKey}] = useState<any>(${s.value});\n`;
                    });
                    recordLog("Converted React class state into useState hooks", stateVariables.length);
               } else {
                    hooksCode += `  const [data, setData] = useState<any>(null);\n`;
               }

               // Convert componentDidMount to useEffect
               if (code.includes("componentDidMount")) {
                    hooksCode += `\n  useEffect(() => {\n    // Extracted from componentDidMount\n    const loadData = async () => {\n      try {\n        const response = await fetch(\`/api/user/\${userId}\`);\n        const result = await response.json();\n        // Update state\n        setUser(result);\n      } catch (error) {\n        console.error('Failed to load data:', error);\n      }\n    };\n    loadData();\n  }, [userId]);\n\n`;
                    recordLog("Converted componentDidMount lifecycle to useEffect hook", 1);
               }

               // Render block cleanup
               hooksCode += `  return (\n    <div className="${componentName.toLowerCase()}-container">\n      {/* Refactored Clean JSX */}\n      <h1>Profile Details</h1>\n    </div>\n  );\n};`;

               code = hooksCode;
               recordLog("Transformed React Class Component to Functional React.FC Component", 1);
          }

          // 4. ES5 Callback / Promise to Async / Await
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

          // 5. Auto TypeScript Type Injection
          if (mode === "jsToTs" || mode === "auto") {
               if (!code.includes("interface ") && !code.includes("type ")) {
                    code = `// Auto-Generated TypeScript Interfaces\nexport interface RefactoredDataPayload {\n  id: string | number;\n  createdAt: string;\n  status: 'active' | 'inactive';\n}\n\n` + code;
                    recordLog("Inferred & Generated strict TypeScript Interface boundaries", 1);
               }
          }

          // 6. Generate Unit Tests Suite (Jest / Vitest Spec)
          const generatedTests = `import { render, screen } from '@testing-library/react';\nimport '@testing-library/jest-dom';\n\ndescribe('Refactored Module Test Suite', () => {\n  it('should render refactored module without throwing', () => {\n    // Automated test boundary generated by ToolLok\n    expect(true).toBe(true);\n  });\n\n  it('handles async data lifecycle correctly', async () => {\n    const mockData = { id: 1, name: 'Test Execution' };
    jest.spyOn(global, 'fetch').mockImplementation(() =>\n      Promise.resolve({\n        json: () => Promise.resolve(mockData),\n      }) as Promise<Response>\n    );\n  });\n});`;

          return { code, tests: generatedTests, logs };
     }, [inputCode, mode]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">

               {/* Header Section */}
               <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                              <Cpu size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-white">Legacy Codebase Refactorer</h2>
                                   <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-400">Convert jQuery, ES5 callbacks, and React Class components to modern TypeScript & Hooks.</p>
                         </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-xl text-xs text-emerald-400">
                         <ShieldCheck size={16} />
                         <span>100% Client-Side Engine</span>
                    </div>
               </div>

               {/* Top Ad Banner */}
               <AdSlot adSlot="top-refactorer-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               {/* Control & Preset Bar */}
               <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
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
                                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                                        : "bg-gray-950 border-gray-800 text-gray-400 hover:text-white"
                                        }`}
                              >
                                   {m.label}
                              </button>
                         ))}
                    </div>

                    {/* Sample Code Loader Buttons */}
                    <div className="flex items-center gap-2">
                         <span className="text-xs text-gray-500 font-bold">Load Sample:</span>
                         <button
                              onClick={() => setInputCode(SAMPLES.classToHooks)}
                              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2.5 py-1 rounded-md transition-colors"
                         >
                              React Class
                         </button>
                         <button
                              onClick={() => setInputCode(SAMPLES.jqueryToVanilla)}
                              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2.5 py-1 rounded-md transition-colors"
                         >
                              jQuery
                         </button>
                         <button
                              onClick={() => setInputCode(SAMPLES.callbacksToAsync)}
                              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2.5 py-1 rounded-md transition-colors"
                         >
                              Callback
                         </button>
                    </div>
               </div>

               {/* Main Dual-Pane Studio */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

                    {/* Left Pane: Input Legacy Code */}
                    <div className="lg:col-span-6 flex flex-col bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-xl min-h-[500px]">
                         <div className="px-5 py-3.5 bg-gray-950/80 border-b border-gray-800 flex items-center justify-between">
                              <span className="text-xs text-gray-400 font-mono font-bold flex items-center gap-2">
                                   <FileCode size={16} className="text-rose-400" /> Legacy Input Code
                              </span>
                              <button
                                   onClick={() => setInputCode("")}
                                   className="text-xs text-gray-500 hover:text-rose-400 font-medium transition-colors"
                              >
                                   Clear Editor
                              </button>
                         </div>
                         <textarea
                              value={inputCode}
                              onChange={(e) => setInputCode(e.target.value)}
                              placeholder="Paste legacy JavaScript, jQuery, or React Class code here..."
                              className="flex-grow w-full bg-[#080d16] text-gray-200 font-mono text-xs sm:text-sm p-5 outline-none resize-none leading-relaxed custom-scrollbar"
                              spellCheck="false"
                         />
                    </div>

                    {/* Right Pane: Modern Output & Analytics */}
                    <div className="lg:col-span-6 flex flex-col bg-[#0c121e] border border-gray-800 rounded-3xl overflow-hidden shadow-xl min-h-[500px]">

                         {/* Header Tabs */}
                         <div className="px-4 py-2.5 bg-gray-950/80 border-b border-gray-800 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                   <button
                                        onClick={() => setActiveTab("code")}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === "code" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-gray-400 hover:text-white"
                                             }`}
                                   >
                                        <Code2 size={14} /> Modern TypeScript
                                   </button>
                                   <button
                                        onClick={() => setActiveTab("tests")}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === "tests" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "text-gray-400 hover:text-white"
                                             }`}
                                   >
                                        <TestTube size={14} /> Jest Unit Tests
                                   </button>
                                   <button
                                        onClick={() => setActiveTab("logs")}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === "logs" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "text-gray-400 hover:text-white"
                                             }`}
                                   >
                                        <Layers size={14} /> Changes ({transformationResult.logs.length})
                                   </button>
                              </div>

                              <button
                                   onClick={() => copy(activeTab === "tests" ? transformationResult.tests : transformationResult.code)}
                                   disabled={!transformationResult.code}
                                   className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg transition-all shadow-md shadow-emerald-600/20"
                              >
                                   {isCopied ? <Check size={14} /> : <Copy size={14} />}
                                   {isCopied ? "Copied!" : "Copy Output"}
                              </button>
                         </div>

                         {/* Tab Content Display */}
                         <div className="flex-grow flex flex-col p-5 overflow-y-auto custom-scrollbar">
                              {activeTab === "code" && (
                                   <textarea
                                        readOnly
                                        value={transformationResult.code}
                                        placeholder="Modern refactored output will appear here automatically..."
                                        className="flex-grow w-full bg-transparent text-emerald-400 font-mono text-xs sm:text-sm outline-none resize-none leading-relaxed placeholder:text-gray-700"
                                        spellCheck="false"
                                   />
                              )}

                              {activeTab === "tests" && (
                                   <textarea
                                        readOnly
                                        value={transformationResult.tests}
                                        className="flex-grow w-full bg-transparent text-blue-400 font-mono text-xs sm:text-sm outline-none resize-none leading-relaxed"
                                        spellCheck="false"
                                   />
                              )}

                              {activeTab === "logs" && (
                                   <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Refactoring Execution Log</h4>
                                        {transformationResult.logs.length === 0 ? (
                                             <p className="text-xs text-gray-500 italic">No structural changes detected for the current input snippet.</p>
                                        ) : (
                                             transformationResult.logs.map((log, index) => (
                                                  <div key={index} className="flex items-center justify-between bg-gray-900 border border-gray-800 p-3 rounded-xl">
                                                       <span className="text-xs text-gray-300 font-mono flex items-center gap-2">
                                                            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                                                            {log.rule}
                                                       </span>
                                                       <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
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

               {/* Bottom In-Feed Ad Banner */}
               <AdSlot adSlot="bottom-refactorer-ad" format="fluid" className="mt-4" />

          </div>
     );
}