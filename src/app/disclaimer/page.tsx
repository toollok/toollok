import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

export const metadata = {
     title: "Disclaimer | ToolLok",
     description: "Read the liability and financial/legal disclaimers for ToolLok utilities.",
};

export default function DisclaimerPage() {
     return (
          <main className="min-h-screen bg-[#090d16] text-white flex flex-col items-center px-4 py-12">
               <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors bg-gray-900 border border-gray-800 px-3.5 py-2 rounded-xl w-fit">
                         <ArrowLeft size={14} /> Back to Home
                    </Link>

                    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 md:p-12 flex flex-col gap-6 shadow-xl">
                         <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 border border-amber-500/20">
                                   <AlertCircle size={24} />
                              </div>
                              <div>
                                   <h1 className="text-2xl md:text-3xl font-black text-white">Disclaimer</h1>
                                   <p className="text-sm text-gray-400">Important notices regarding financial and legal tools.</p>
                              </div>
                         </div>

                         <div className="flex flex-col gap-4 text-xs md:text-sm text-gray-300 leading-relaxed">
                              <h2 className="text-white font-bold text-base mt-2">Financial & Trading Tools</h2>
                              <p>Calculators and simulators provided in the financial and trading categories (such as options P&L simulators) are for educational and simulation purposes only. They do not constitute formal financial advice or trade recommendations.</p>

                              <h2 className="text-white font-bold text-base mt-2">Legal Contract Scanners</h2>
                              <p>Automated contract risk scanners highlight common clauses and red flags. They do not substitute professional legal counsel. Always consult a licensed attorney for binding agreements.</p>
                         </div>
                    </div>
               </div>
          </main>
     );
}