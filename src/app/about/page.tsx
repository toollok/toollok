import Link from "next/link";
import { ArrowLeft, Terminal, Shield, Zap, Code } from "lucide-react";

export const metadata = {
     title: "About Us | ToolLok",
     description: "Learn more about ToolLok, the 100% free, client-side toolkit for developers, creators, and entrepreneurs.",
};

export default function AboutPage() {
     return (
          <main className="min-h-screen bg-[#090d16] text-white flex flex-col items-center px-4 py-12">
               <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors bg-gray-900 border border-gray-800 px-3.5 py-2 rounded-xl w-fit">
                         <ArrowLeft size={14} /> Back to Home
                    </Link>

                    {/* Hero Section */}
                    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 md:p-12 flex flex-col items-center text-center gap-6 shadow-xl relative overflow-hidden">
                         <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400"></div>

                         <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-2">
                              <Terminal size={32} className="text-white font-bold" />
                         </div>

                         <div>
                              <h1 className="text-3xl md:text-5xl font-black text-white mb-4">Empowering Builders.</h1>
                              <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
                                   ToolLok is a premium collection of highly engineered, 100% free web utilities designed specifically for developers, startup founders, and digital creators.
                              </p>
                         </div>
                    </div>

                    {/* Core Values / Features */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 flex flex-col gap-4">
                              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                   <Shield size={20} />
                              </div>
                              <h3 className="text-lg font-bold text-white">Privacy First</h3>
                              <p className="text-xs text-gray-400 leading-relaxed">
                                   We believe your data is yours. 99% of our tools run entirely client-side in your browser. No databases, no hidden server uploads.
                              </p>
                         </div>
                         <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 flex flex-col gap-4">
                              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 border border-amber-500/20">
                                   <Zap size={20} />
                              </div>
                              <h3 className="text-lg font-bold text-white">Lightning Fast</h3>
                              <p className="text-xs text-gray-400 leading-relaxed">
                                   Built on Next.js and optimized for speed. Our utilities load instantly without the bloated paywalls or intrusive popups found elsewhere.
                              </p>
                         </div>
                         <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 flex flex-col gap-4">
                              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 border border-purple-500/20">
                                   <Code size={20} />
                              </div>
                              <h3 className="text-lg font-bold text-white">100% Free</h3>
                              <p className="text-xs text-gray-400 leading-relaxed">
                                   We are committed to keeping core developer and startup tools accessible to everyone, from indie hackers to enterprise engineers.
                              </p>
                         </div>
                    </div>
               </div>
          </main>
     );
}