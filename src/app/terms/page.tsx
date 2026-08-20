import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata = {
     title: "Terms & Conditions | ToolLok",
     description: "Review the terms and conditions for using ToolLok's free browser utilities and developer tools.",
};

export default function TermsPage() {
     return (
          <main className="min-h-screen bg-gray-50 dark:bg-[#090d16] text-gray-900 dark:text-white flex flex-col items-center px-4 py-12 transition-colors">
               <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3.5 py-2 rounded-xl w-fit shadow-sm dark:shadow-none">
                         <ArrowLeft size={14} /> Back to Home
                    </Link>

                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 md:p-12 flex flex-col gap-6 shadow-sm dark:shadow-xl transition-colors">
                         <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                                   <FileText size={24} />
                              </div>
                              <div>
                                   <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Terms & Conditions</h1>
                                   <p className="text-sm text-gray-600 dark:text-gray-400">Last updated: July 2026</p>
                              </div>
                         </div>

                         <div className="flex flex-col gap-4 text-xs md:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              <h2 className="text-gray-900 dark:text-white font-bold text-base mt-2">1. Acceptance of Terms</h2>
                              <p>By accessing and using ToolLok, you accept and agree to be bound by these Terms & Conditions. If you do not agree, please refrain from using our web tools.</p>

                              <h2 className="text-gray-900 dark:text-white font-bold text-base mt-2">2. Free Utility Use</h2>
                              <p>All developer, financial, and business tools on ToolLok are provided completely free of charge for personal and commercial use without any warranty of continuous uptime or accuracy.</p>

                              <h2 className="text-gray-900 dark:text-white font-bold text-base mt-2">3. Intellectual Property</h2>
                              <p>The layout, design, codebase, and tool architecture of ToolLok remain the exclusive property of the platform.</p>
                         </div>
                    </div>
               </div>
          </main>
     );
}