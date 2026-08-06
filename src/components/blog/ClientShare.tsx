"use client";

import { useState } from "react";
import { Link2, Share2, Check } from "lucide-react";

export default function ClientShare({ url, title }: { url: string; title: string }) {
     const [copied, setCopied] = useState(false);

     const copyLink = async () => {
          try {
               await navigator.clipboard.writeText(url);
               setCopied(true);
               setTimeout(() => setCopied(false), 2000);
          } catch (err) {
               console.error("Failed to copy!", err);
          }
     };

     const nativeShare = async () => {
          if (navigator.share) {
               try {
                    await navigator.share({ title, url });
               } catch (err) {
                    console.error("Error sharing", err);
               }
          } else {
               // Fallback to copy link if the browser (like older desktops) doesn't support native share
               copyLink();
          }
     };

     return (
          <>
               <button
                    onClick={copyLink}
                    className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 hover:border-gray-600 transition-all"
                    title="Copy Link"
               >
                    {copied ? <Check size={18} className="text-emerald-400" /> : <Link2 size={18} />}
               </button>

               <button
                    onClick={nativeShare}
                    className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 hover:border-gray-600 transition-all sm:hidden md:block"
                    title="Share via Device"
               >
                    <Share2 size={18} />
               </button>
          </>
     );
}