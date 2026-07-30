import Link from "next/link";
import { Tool } from "@/types";
import TierBadge from "./Badge";
import {
     Sparkles, FileJson, Server, Terminal, Cpu, Layout, Video, Music,
     Eye, Film, LineChart, Link as LinkIcon, BarChart, Filter, Activity,
     FileText, Users, DollarSign, Briefcase, FileCheck, Bot, Calculator,
     Globe, ShieldAlert, Clock, Edit3, CheckSquare, Zap, List, Code,
     Search, CheckCircle, Layers, Share2, Shield, Image, Key, Inbox, ArrowUpRight
} from "lucide-react";

// Dynamic Icon Map lookup avoiding heavy external overhead
const ICON_MAP: Record<string, any> = {
     Sparkles, FileJson, Server, Terminal, Cpu, Layout, Video, Music,
     Eye, Film, LineChart, Link: LinkIcon, BarChart, Filter, Activity,
     FileText, Users, DollarSign, Briefcase, FileCheck, Bot, Calculator,
     Globe, ShieldAlert, Clock, Edit3, CheckSquare, Zap, List, Code,
     Search, CheckCircle, Layers, Share2, Shield, Image, Key, Inbox
};

export default function ToolCard({ tool }: { tool: Tool }) {
     const IconComponent = ICON_MAP[tool.iconName] || Code;

     return (
          <Link
               href={tool.slug}
               className="group relative bg-gray-900/40 hover:bg-gray-800/60 border border-gray-800 hover:border-gray-700/80 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between backdrop-blur-md shadow-lg hover:shadow-2xl hover:-translate-y-1"
          >
               <div>
                    {/* Header Badge Row */}
                    <div className="flex items-center justify-between mb-4">
                         <div className="w-12 h-12 bg-gray-800/80 group-hover:bg-blue-600/10 border border-gray-700/50 group-hover:border-blue-500/30 rounded-xl flex items-center justify-center text-gray-300 group-hover:text-blue-400 transition-colors">
                              <IconComponent size={22} />
                         </div>
                         <TierBadge tier={tool.tier} text={tool.badgeText} />
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors mb-2 line-clamp-1">
                         {tool.name}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed mb-6">
                         {tool.description}
                    </p>
               </div>

               {/* Footer Link Action */}
               <div className="flex items-center justify-between pt-4 border-t border-gray-800/60 text-xs font-semibold text-gray-500 group-hover:text-blue-400 transition-colors">
                    <span className="capitalize">{tool.category.replace("-tools", "")}</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                         Open Tool <ArrowUpRight size={14} />
                    </span>
               </div>
          </Link>
     );
}