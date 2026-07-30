import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
     title: "Privacy Policy | ToolLok",
     description: "Read the Privacy Policy for ToolLok to understand how we protect your data and handle cookies.",
};

export default function PrivacyPage() {
     return (
          <main className="min-h-screen bg-[#090d16] text-white flex flex-col items-center px-4 py-12">
               <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors bg-gray-900 border border-gray-800 px-3.5 py-2 rounded-xl w-fit">
                         <ArrowLeft size={14} /> Back to Home
                    </Link>

                    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 md:p-12 flex flex-col gap-6 shadow-xl">
                         <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                   <Shield size={24} />
                              </div>
                              <div>
                                   <h1 className="text-2xl md:text-3xl font-black text-white">Privacy Policy</h1>
                                   <p className="text-sm text-gray-400">Last updated: July 2026</p>
                              </div>
                         </div>

                         <div className="flex flex-col gap-4 text-xs md:text-sm text-gray-300 leading-relaxed">
                              <h2 className="text-white font-bold text-base mt-2">1. Information We Collect</h2>
                              <p>ToolLok provides 100% free browser-based utilities. Most tools run entirely client-side in your browser, meaning your input data is never sent to our servers. We may collect standard anonymized analytics (such as browser type and pages visited) to improve our utility performance.</p>

                              <h2 className="text-white font-bold text-base mt-2">2. Cookies and Advertising</h2>
                              <p>We may use third-party advertising networks (such as Google AdSense) to serve ads when you visit our website. These companies may use cookies or web beacons to gather information regarding your visits to provide relevant advertisements about goods and services.</p>

                              <h2 className="text-white font-bold text-base mt-2">3. Third-Party Links</h2>
                              <p>Our website may contain links to external sites not operated by us. We assume no responsibility for the privacy practices of those third-party sites.</p>

                              <h2 className="text-white font-bold text-base mt-2">4. Contact</h2>
                              <p>If you have any questions regarding this Privacy Policy, please contact us at support@toollok.com.</p>
                         </div>
                    </div>
               </div>
          </main>
     );
}