import Link from "next/link";
import { ArrowLeft, SearchCode } from "lucide-react";

export default function NotFound() {
     return (
          <main className="min-h-screen bg-[#090d16] text-white flex flex-col items-center justify-center px-4 py-12">
               <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-8 text-center flex flex-col items-center gap-6 shadow-2xl">
                    <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                         <SearchCode size={32} />
                    </div>
                    <div>
                         <h1 className="text-3xl font-black text-white mb-2">404 - Page Not Found</h1>
                         <p className="text-xs text-gray-400">The tool or page you are looking for does not exist or has been moved.</p>
                    </div>
                    <Link href="/" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2">
                         <ArrowLeft size={16} /> Return to Homepage
                    </Link>
               </div>
          </main>
     );
}