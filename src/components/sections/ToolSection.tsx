import { Tool } from "@/types";
import ToolCard from "@/components/ui/ToolCard";
import AdSlot from "@/components/ui/AdSlot";
import { LucideIcon } from "lucide-react";

interface ToolSectionProps {
     title: string;
     subtitle: string;
     icon: LucideIcon;
     iconColorClass: string;
     tools: Tool[];
     bottomAdSlotId?: string; // Optional AdSense integration
}

export default function ToolSection({ title, subtitle, icon: Icon, iconColorClass, tools, bottomAdSlotId }: ToolSectionProps) {
     return (
          <section className="py-16 border-t border-gray-800/40">
               <div className="flex items-center justify-between mb-10">
                    <div>
                         <div className={`inline-flex items-center gap-2 ${iconColorClass} text-xs font-bold uppercase tracking-widest mb-2`}>
                              <Icon size={14} /> {subtitle}
                         </div>
                         <h2 className="text-3xl font-extrabold text-white">{title}</h2>
                    </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {tools.map((tool) => (
                         <ToolCard key={tool.id} tool={tool} />
                    ))}
               </div>

               {/* Automatically injects an in-feed Ad if an ID is provided */}
               {bottomAdSlotId && (
                    <AdSlot adSlot={bottomAdSlotId} format="fluid" minHeight="120px" className="mt-8" />
               )}
          </section>
     );
}