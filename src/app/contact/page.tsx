import Link from "next/link";
import { Mail, ArrowLeft, MessageSquare } from "lucide-react";

export const metadata = {
     title: "Contact Us | ToolLok",
     description: "Get in touch with the ToolLok team for feedback, tool suggestions, or support inquiries.",
};

export default function ContactPage() {
     return (
          <main className="min-h-screen bg-white dark:bg-[#090d16] text-gray-900 dark:text-white flex flex-col items-center px-4 py-12 transition-colors">
               <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3.5 py-2 rounded-xl w-fit">
                         <ArrowLeft size={14} /> Back to Home
                    </Link>

                    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 md:p-12 flex flex-col gap-6 shadow-xl">
                         <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                                   <MessageSquare size={24} />
                              </div>
                              <div>
                                   <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Contact Us</h1>
                                   <p className="text-sm text-gray-500 dark:text-gray-400">We would love to hear your feedback or tool requests.</p>
                              </div>
                         </div>

                         <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                              <p>Have a question about our free web utilities, or want to suggest a new tool for our roadmap? Reach out to us directly via email.</p>
                              <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
                                   <Mail className="text-blue-600 dark:text-blue-400 shrink-0" size={24} />
                                   <div>
                                        <span className="text-xs text-gray-500 block uppercase font-bold">Direct Support Email</span>
                                        <a href="mailto:support@toollok.com" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">tool.lok01@gmail.com</a>
                                   </div>
                              </div>
                              <p className="text-xs text-gray-500">We typically respond to inquiries within 24 to 48 hours.</p>
                         </div>
                    </div>
               </div>
          </main>
     );
}