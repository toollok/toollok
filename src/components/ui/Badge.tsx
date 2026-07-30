import { Tier } from "@/types";

export default function TierBadge({ tier, text }: { tier: Tier; text?: string }) {
     if (tier === "free") {
          return (
               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    🟢 Free
               </span>
          );
     }

     if (tier === "freemium") {
          return (
               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    🟡 Freemium
               </span>
          );
     }

     return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
               🔴 {text || "Premium"}
          </span>
     );
}