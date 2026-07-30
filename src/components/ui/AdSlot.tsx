"use client";

import { useEffect } from "react";
import { ENABLE_ADS } from "@/constants";

interface AdSlotProps {
     adSlot: string;
     format?: "auto" | "fluid" | "horizontal" | "vertical";
     className?: string;
     minHeight?: string;
}

export default function AdSlot({
     adSlot,
     format = "auto",
     className = "",
     minHeight = "120px"
}: AdSlotProps) {

     // 🔴 If ads are disabled globally, render absolutely nothing
     if (!ENABLE_ADS) {
          return null;
     }

     useEffect(() => {
          try {
               const adsbygoogle = (window as any).adsbygoogle || [];
               adsbygoogle.push({});
          } catch (err) {
               console.error("AdSense injection failed:", err);
          }
     }, []);

     return (
          <div
               className={`w-full flex flex-col items-center justify-center bg-gray-900/20 border border-gray-800/40 rounded-2xl relative overflow-hidden ${className}`}
               style={{ minHeight }}
          >
               <span className="absolute top-2 left-3 text-[9px] font-bold text-gray-600 uppercase tracking-widest z-10">
                    Advertisement
               </span>

               <div className="w-full h-full pt-6 pb-2 px-2 z-0 relative flex justify-center items-center">
                    <ins
                         className="adsbygoogle"
                         style={{ display: "block", width: "100%", height: "100%" }}
                         data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // TODO: Add your Publisher ID here later
                         data-ad-slot={adSlot}
                         data-ad-format={format}
                         data-full-width-responsive="true"
                    />
               </div>
          </div>
     );
}