"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
     Edit3, Download, Copy, Check, FileText, Code, Eye, FileCode2,
     Bold, Italic, Heading1, Heading2, Quote, List, Link as LinkIcon, Image, Type, Clock
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import AdSlot from "@/components/ui/AdSlot";

const DEFAULT_MARKDOWN = `# Welcome to Markdown Studio
Start typing in the editor on the left to see the live preview on the right.

## Features Supported:
* **Bold text** and *Italic text*
* Clean PDF Rendering (Press Ctrl+P)
* Local Auto-Save
* Blockquotes and ~~Strikethrough~~

### Task Lists
- [x] Build Markdown Studio
- [x] Add formatting toolbar
- [ ] Write a viral blog post

> "The best way to predict the future is to invent it."

### Code Blocks
\`\`\`javascript
function helloWorld() {
  console.log("Hello, ToolLok!");
}
\`\`\`
---
`;

export default function MarkdownStudio() {
     const [markdown, setMarkdown] = useLocalStorage<string>("toollok_md_draft", DEFAULT_MARKDOWN);
     const [isCopied, setIsCopied] = useState(false);
     const [activeTab, setActiveTab] = useState<"split" | "editor" | "preview">("split");
     const textareaRef = useRef<HTMLTextAreaElement>(null);

     const parsedHtml = useMemo(() => {
          let html = markdown
               .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-gray-100">$1</h3>')
               .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4 border-b border-gray-200 dark:border-gray-800 pb-2 text-gray-900 dark:text-gray-50">$1</h2>')
               .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-black mt-4 mb-6 text-gray-900 dark:text-white">$1</h1>')
               .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-indigo-500 pl-4 py-1 my-4 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-r-lg">$1</blockquote>')
               .replace(/^---/gim, '<hr class="my-8 border-gray-200 dark:border-gray-800" />')
               .replace(/^- \[x\] (.*$)/gim, '<div class="flex items-start gap-2 my-1"><input type="checkbox" checked disabled class="mt-1 rounded bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-indigo-500" /> <span>$1</span></div>')
               .replace(/^- \[ \] (.*$)/gim, '<div class="flex items-start gap-2 my-1"><input type="checkbox" disabled class="mt-1 rounded bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700" /> <span>$1</span></div>')
               .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>')
               .replace(/\*(.*?)\*/gim, '<em class="italic text-gray-700 dark:text-gray-300">$1</em>')
               .replace(/~~(.*?)~~/gim, '<del class="text-gray-400 dark:text-gray-500">$1</del>')
               .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' class='rounded-xl my-4 max-w-full' />")
               .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2' target='_blank' class='text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 underline underline-offset-2'>$1</a>")
               .replace(/```[\s\S]*?\n([\s\S]*?)```/gim, '<pre class="bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 p-4 rounded-xl my-4 overflow-x-auto text-sm font-mono text-gray-700 dark:text-gray-300"><code>$1</code></pre>')
               .replace(/`(.*?)`/gim, '<code class="bg-gray-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded-md text-sm font-mono">$1</code>')
               .replace(/^\* (.*$)/gim, '<li class="ml-5 list-disc my-1">$1</li>')
               .replace(/\n$/gim, '<br />');
          return html;
     }, [markdown]);

     const metrics = useMemo(() => {
          const words = markdown.trim().split(/\s+/).filter(w => w.length > 0).length;
          const chars = markdown.length;
          const readTime = Math.max(1, Math.ceil(words / 200));
          return { words, chars, readTime };
     }, [markdown]);

     const injectMarkdown = (prefix: string, suffix: string = "") => {
          const textarea = textareaRef.current;
          if (!textarea) return;
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const text = textarea.value;
          const selectedText = text.substring(start, end);
          const newText = text.substring(0, start) + prefix + (selectedText || "text") + suffix + text.substring(end);
          setMarkdown(newText);
          setTimeout(() => {
               textarea.focus();
               const newStart = start + prefix.length;
               const newEnd = selectedText ? newStart + selectedText.length : newStart + 4;
               textarea.setSelectionRange(newStart, newEnd);
          }, 0);
     };

     const handlePrint = () => window.print();

     const copyHtml = () => {
          navigator.clipboard.writeText(parsedHtml);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
     };

     useKeyboardShortcuts([{ key: "p", ctrlOrCmd: true, action: handlePrint }]);

     return (
          <div className="w-full flex flex-col gap-6">
               <style jsx global>{`
                    @media print {
                         @page { size: A4 portrait; margin: 15mm; }
                         body * { visibility: hidden; }
                         #printable-markdown, #printable-markdown * { visibility: visible; color: black !important; }
                         #printable-markdown { position: absolute; left: 0; top: 0; width: 100% !important; background: white !important; margin: 0 !important; padding: 0 !important; }
                         #printable-markdown h1, #printable-markdown h2, #printable-markdown h3 { color: black !important; border-color: #ccc !important; }
                         #printable-markdown pre { background: #f4f4f4 !important; border: 1px solid #ddd !important; color: #333 !important; }
                         #printable-markdown code { background: #f4f4f4 !important; color: #d63384 !important; }
                         #printable-markdown blockquote { border-left-color: #666 !important; background: transparent !important; color: #555 !important; }
                    }
               `}</style>

               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                              <Edit3 size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Markdown to PDF/HTML Publishing Studio</h2>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Write in Markdown, preview in real-time, and export to perfectly formatted PDF or raw HTML.</p>
                         </div>
                    </div>

                    <div className="flex items-center gap-2">
                         <button onClick={copyHtml} className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:border-gray-600 text-gray-900 dark:text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-sm dark:shadow-none">
                              {isCopied ? <Check size={16} className="text-emerald-600 dark:text-emerald-400" /> : <FileCode2 size={16} />}
                              {isCopied ? "HTML Copied!" : "Copy HTML"}
                         </button>
                         <button onClick={handlePrint} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md dark:shadow-lg dark:shadow-indigo-600/25" title="Shortcut: Ctrl+P">
                              <Download size={16} /> Export PDF
                         </button>
                    </div>
               </div>

               <AdSlot adSlot="top-markdown-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2 print:hidden" />

               <div className="flex lg:hidden bg-gray-50 dark:bg-gray-950 p-1 rounded-xl border border-gray-200 dark:border-gray-800 print:hidden transition-colors">
                    <button onClick={() => setActiveTab("editor")} className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === "editor" ? "bg-indigo-600 text-white shadow-sm" : "text-gray-600 dark:text-gray-400"}`}>
                         <Code size={14} /> Editor
                    </button>
                    <button onClick={() => setActiveTab("preview")} className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === "preview" ? "bg-indigo-600 text-white shadow-sm" : "text-gray-600 dark:text-gray-400"}`}>
                         <Eye size={14} /> Preview
                    </button>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto min-h-[650px]">
                    <div className={`bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl flex-col overflow-hidden shadow-sm dark:shadow-xl print:hidden transition-colors ${activeTab === "preview" ? "hidden lg:flex" : "flex"}`}>
                         <div className="bg-gray-50 dark:bg-gray-950 px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-2 overflow-x-auto transition-colors">
                              <div className="flex items-center gap-1.5">
                                   <button onClick={() => injectMarkdown("**", "**")} className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md transition-colors" title="Bold"><Bold size={16} /></button>
                                   <button onClick={() => injectMarkdown("*", "*")} className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md transition-colors" title="Italic"><Italic size={16} /></button>
                                   <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1"></div>
                                   <button onClick={() => injectMarkdown("# ", "")} className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md transition-colors" title="Heading 1"><Heading1 size={16} /></button>
                                   <button onClick={() => injectMarkdown("## ", "")} className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md transition-colors" title="Heading 2"><Heading2 size={16} /></button>
                                   <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1"></div>
                                   <button onClick={() => injectMarkdown("> ", "")} className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md transition-colors" title="Quote"><Quote size={16} /></button>
                                   <button onClick={() => injectMarkdown("* ", "")} className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md transition-colors" title="List"><List size={16} /></button>
                                   <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1"></div>
                                   <button onClick={() => injectMarkdown("[", "](https://)")} className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md transition-colors" title="Link"><LinkIcon size={16} /></button>
                                   <button onClick={() => injectMarkdown("![Alt Text](", ")")} className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md transition-colors" title="Image"><Image size={16} /></button>
                              </div>
                              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden sm:block">Editor</span>
                         </div>
                         <textarea
                              ref={textareaRef}
                              value={markdown}
                              onChange={(e) => setMarkdown(e.target.value)}
                              spellCheck="false"
                              placeholder="Type your markdown here..."
                              className="w-full h-full min-h-[500px] flex-grow bg-transparent p-6 text-sm text-gray-900 dark:text-gray-300 font-mono leading-relaxed outline-none resize-none transition-colors"
                         />
                         <div className="bg-gray-50 dark:bg-gray-950 px-4 py-2 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider transition-colors">
                              <div className="flex items-center gap-4">
                                   <span className="flex items-center gap-1.5"><Type size={12} className="text-indigo-600 dark:text-indigo-400" /> {metrics.words} Words</span>
                                   <span className="hidden sm:inline">({metrics.chars} Chars)</span>
                              </div>
                              <span className="flex items-center gap-1.5"><Clock size={12} className="text-emerald-600 dark:text-emerald-400" /> ~{metrics.readTime} Min Read</span>
                         </div>
                    </div>

                    <div className={`bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl flex-col overflow-hidden shadow-sm dark:shadow-xl print:border-none print:bg-white transition-colors ${activeTab === "editor" ? "hidden lg:flex" : "flex"}`}>
                         <div className="bg-gray-50 dark:bg-gray-950 px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 print:hidden h-[49px] transition-colors">
                              <FileText size={14} className="text-emerald-600 dark:text-emerald-400" />
                              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Live Preview</span>
                         </div>
                         <div
                              id="printable-markdown"
                              className="p-8 md:p-10 w-full h-full overflow-y-auto text-gray-800 dark:text-gray-300 leading-relaxed custom-markdown-preview transition-colors"
                              dangerouslySetInnerHTML={{ __html: parsedHtml }}
                         />
                    </div>
               </div>

               {/* ========================================= */}
               {/* SEO CONTENT & FAQS */}
               {/* ========================================= */}
               <div className="mt-12 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm dark:shadow-none print:hidden">
                    <div className="prose dark:prose-invert max-w-none">
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">The Ultimate Markdown to PDF Studio</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              Content creation should be fast and distraction-free. ToolLok's <strong>Markdown Publishing Studio</strong> provides a dual-pane editing environment that parses Markdown syntax in real-time. Whether you are drafting technical documentation, a blog post, or a quick GitHub README, this studio allows you to focus purely on your words and export them directly to an HTML block or PDF. Combine it with our <Link href="/categories/content-creator-tools" className="text-indigo-600 dark:text-indigo-400 hover:underline">Content Creator Tools</Link> for maximum productivity.
                         </p>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Key Editing Features</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Real-Time HTML Parsing:</strong> See your bold text, headers, and code blocks rendered instantly in the preview pane as you type.</li>
                              <li><strong>Local Auto-Save:</strong> Your drafts are securely stored in your browser's local cache. If you accidentally close the tab, your work will be exactly where you left it.</li>
                              <li><strong>Print-Ready CSS:</strong> Press `Ctrl+P` (or click Export PDF) to generate a clean, white-background document without printing the surrounding UI menus.</li>
                         </ul>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">What is Markdown?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Markdown is a lightweight markup language used by developers and writers to add formatting elements (like headings or bold text) to plaintext documents without relying on heavy word processors like MS Word.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Can I convert Markdown to PDF?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Yes! Once you have finished your document in the Markdown Studio, simply click the "Export PDF" button. Our tool utilizes specific CSS rules to ensure the resulting PDF is perfectly formatted.</p>
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
                                             "name": "What is Markdown?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Markdown is a lightweight markup language used to add formatting elements to plaintext documents." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "Can I convert Markdown to PDF?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Yes! Click the Export PDF button to generate a perfectly formatted PDF document directly from your Markdown." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-markdown-ad" format="fluid" className="mt-4 print:hidden" />
          </div>
     );
}