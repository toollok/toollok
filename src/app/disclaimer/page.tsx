import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

export const metadata = {
     title: "Disclaimer | ToolLok",
     description: "Read the liability and financial/legal disclaimers for ToolLok utilities.",
};

export default function DisclaimerPage() {
     return (
          <main className="min-h-screen bg-gray-50 dark:bg-[#090d16] text-gray-900 dark:text-white flex flex-col items-center px-4 py-12 transition-colors">
               <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3.5 py-2 rounded-xl w-fit shadow-sm dark:shadow-none">
                         <ArrowLeft size={14} /> Back to Home
                    </Link>

                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 md:p-12 flex flex-col gap-6 shadow-sm dark:shadow-xl transition-colors">
                         <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                                   <AlertCircle size={24} />
                              </div>
                              <div>
                                   <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Disclaimer</h1>
                                   <p className="text-sm text-gray-600 dark:text-gray-400">Important notices regarding financial and legal tools.</p>
                              </div>
                         </div>

                         <div className="flex flex-col gap-4 text-xs md:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              <h2 className="text-gray-900 dark:text-white font-bold text-base mt-2">Financial & Trading Tools</h2>
                              <p>Calculators and simulators provided in the financial and trading categories (such as options P&L simulators) are for educational and simulation purposes only. They do not constitute formal financial advice or trade recommendations.</p>

                              <h2 className="text-gray-900 dark:text-white font-bold text-base mt-2">Legal Contract Scanners</h2>
                              <p>Automated contract risk scanners highlight common clauses and red flags. They do not substitute professional legal counsel. Always consult a licensed attorney for binding agreements.</p>
                         </div>
                    </div>
               </div>
          </main>
     );
}