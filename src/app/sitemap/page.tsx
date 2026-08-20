import Link from "next/link";
import { MASTER_TOOLS_LIST, CATEGORIES } from "@/constants";
import { ArrowLeft, FolderKanban } from "lucide-react";

export const metadata = {
     title: "HTML Sitemap | ToolLok",
     description: "Browse all free browser tools, developer utilities, and categories available on ToolLok.",
};

export default function HtmlSitemapPage() {
     return (
          <main className="min-h-screen bg-gray-50 dark:bg-[#090d16] text-gray-900 dark:text-white flex flex-col items-center px-4 py-12 transition-colors">
               <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3.5 py-2 rounded-xl w-fit shadow-sm dark:shadow-none">
                         <ArrowLeft size={14} /> Back to Home
                    </Link>

                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 md:p-12 flex flex-col gap-6 shadow-sm dark:shadow-xl transition-colors">
                         <h1 className="text-3xl font-black text-gray-900 dark:text-white">ToolLok HTML Sitemap</h1>
                         <p className="text-sm text-gray-600 dark:text-gray-400">Complete index of all categories and free browser utilities.</p>

                         <div className="flex flex-col gap-6 mt-4">
                              <h2 className="text-cyan-600 dark:text-cyan-400 font-bold text-lg border-b border-gray-200 dark:border-gray-800 pb-2">Main Pages</h2>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                   <Link href="/" className="text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-gray-950 p-3 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors">Home</Link>
                                   <Link href="/blog" className="text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-gray-950 p-3 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors">Blog</Link>
                                   <Link href="/popular" className="text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-gray-950 p-3 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors">Popular Tools</Link>
                                   <Link href="/about" className="text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-gray-950 p-3 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors">About Us</Link>
                                   <Link href="/contact" className="text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-gray-950 p-3 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors">Contact Us</Link>
                                   <Link href="/privacy" className="text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-gray-950 p-3 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors">Privacy Policy</Link>
                                   <Link href="/terms" className="text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-gray-950 p-3 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors">Terms & Conditions</Link>
                                   <Link href="/disclaimer" className="text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-gray-950 p-3 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors">Disclaimer</Link>
                              </div>

                              <h2 className="text-cyan-600 dark:text-cyan-400 font-bold text-lg border-b border-gray-200 dark:border-gray-800 pb-2 mt-4">All Tools Index</h2>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                   {MASTER_TOOLS_LIST.map((tool) => (
                                        <Link key={tool.id} href={tool.slug} className="text-xs text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 bg-gray-50 dark:bg-gray-950 p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between transition-colors">
                                             <span className="font-medium">{tool.name}</span>
                                             <span className="text-[10px] text-gray-500 uppercase">{tool.category}</span>
                                        </Link>
                                   ))}
                              </div>
                         </div>
                    </div>
               </div>
          </main>
     );
}