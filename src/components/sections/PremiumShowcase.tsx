import { PREMIUM_TOOLS, ENABLE_PREMIUM_SHOWCASE } from "@/constants";
import ToolCard from "@/components/ui/ToolCard";

export default function PremiumShowcase() {
     // 🔴 Safely hide the entire section if the flag is set to false in constants/index.ts
     if (!ENABLE_PREMIUM_SHOWCASE) return null;

     return (
          <section className="py-20 border-t border-gray-800/40">
               <div className="bg-gradient-to-br from-rose-950/30 via-gray-900 to-gray-950 border border-rose-500/20 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="max-w-2xl mb-10 relative z-10">
                         <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-widest mb-4">
                              🔴 Enterprise Tier
                         </span>
                         <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
                              Unlock Advanced AI & Cloud Automation
                         </h2>
                         <p className="text-gray-400 text-base md:text-lg">
                              Unlock server-side LLM agents, local WebGPU processing, Wasm code refactoring, and automated B2B lead scraping.
                         </p>
                    </div>

                    {/* Premium Tools Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10 relative z-10">
                         {PREMIUM_TOOLS.slice(0, 4).map((tool) => (
                              <ToolCard key={tool.id} tool={tool} />
                         ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
                         <button className="w-full sm:w-auto bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-rose-600/25 transition-all text-center">
                              Upgrade to Premium Pass
                         </button>
                         <span className="text-xs text-gray-500">30-day money-back guarantee • Cancel anytime</span>
                    </div>
               </div>
          </section>
     );
}