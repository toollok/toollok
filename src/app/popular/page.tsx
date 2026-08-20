import Link from "next/link";
import { ArrowLeft, Flame, ArrowRight } from "lucide-react";
import { MASTER_TOOLS_LIST } from "@/constants";

export const metadata = {
     title: "Popular Tools | ToolLok",
     description: "Discover the most used and highest-rated free developer, business, and financial utilities on ToolLok.",
};

export default function PopularToolsPage() {
     // For the popular page, we can slice the first 9 tools, 
     // or filter by a specific criteria if you add 'isPopular: true' to your constants later.
     const popularTools = MASTER_TOOLS_LIST.slice(0, 9);

     return (
          <main className="min-h-screen bg-white dark:bg-[#090d16] text-gray-900 dark:text-white flex flex-col items-center px-4 py-12 transition-colors">
               <div className="w-full max-w-7xl mx-auto flex flex-col gap-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                         <div>
                              <Link href="/" className="inline-flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3.5 py-2 rounded-xl w-fit mb-6">
                                   <ArrowLeft size={14} /> Back to Home
                              </Link>
                              <div className="flex items-center gap-3">
                                   <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 shadow-lg shadow-amber-500/10">
                                        <Flame size={24} />
                                   </div>
                                   <div>
                                        <h1 className="text-3xl font-black text-gray-900 dark:text-white">Popular Tools</h1>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">The most frequently used utilities by our community right now.</p>
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Tools Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                         {popularTools.map((tool) => (
                              <Link
                                   key={tool.id}
                                   href={tool.slug}
                                   className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 hover:bg-gray-50 dark:hover:bg-gray-800/80 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 flex flex-col h-full shadow-lg hover:shadow-xl dark:shadow-xl dark:hover:shadow-2xl"
                              >
                                   <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-110 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-all duration-300">
                                             <Flame size={20} />
                                        </div>
                                        <span className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                                             {tool.category.replace("-", " ")}
                                        </span>
                                   </div>

                                   <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                                        {tool.name}
                                   </h3>
                                   <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6 flex-grow">
                                        {tool.description}
                                   </p>

                                   <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
                                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                             🟢 Free
                                        </span>
                                        <span className="text-xs font-bold text-gray-500 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white flex items-center gap-1 transition-colors">
                                             Launch Tool <ArrowRight size={14} />
                                        </span>
                                   </div>
                              </Link>
                         ))}
                    </div>
               </div>
          </main>
     );
}