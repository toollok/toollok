import { MASTER_TOOLS_LIST } from "@/constants";
import { notFound } from "next/navigation";
import { BookOpen, Info } from "lucide-react";
import { use } from "react";
import dynamic from "next/dynamic";
import { Metadata } from "next";
import { generateToolMetadata, generateToolSchema } from "@/lib/seo";


// 1. Sleek, Geometric Skeleton Loader (Strictly avoiding rotational effects)
const ToolSkeleton = () => (
     <div
          className="w-full min-h-[400px] bg-gray-900/40 border border-gray-800 rounded-3xl p-8 flex flex-col items-center justify-center shadow-inner"
          aria-busy="true"
          aria-label="Loading tool interface..."
     >
          <div className="flex gap-3 mb-6">
               <div className="w-3 h-3 bg-blue-500/80 rounded-sm animate-pulse" style={{ animationDelay: '0ms' }}></div>
               <div className="w-3 h-3 bg-cyan-400/80 rounded-sm animate-pulse" style={{ animationDelay: '150ms' }}></div>
               <div className="w-3 h-3 bg-emerald-400/80 rounded-sm animate-pulse" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="text-xs text-gray-500 font-mono tracking-widest uppercase">Initializing Interface</p>
     </div>
);

// 2. Dynamic Imports Dictionary (Creates automated code-splitting chunks)
const ToolComponents: Record<string, React.ComponentType> = {
     "css-animation-builder": dynamic(() => import("@/components/tools/CssAnimationBuilder"), { loading: () => <ToolSkeleton /> }),
     "json-formatter-validator": dynamic(() => import("@/components/tools/JsonFormatterValidator"), { loading: () => <ToolSkeleton /> }),
     "api-mock-server": dynamic(() => import("@/components/tools/ApiMockServer"), { loading: () => <ToolSkeleton /> }),
     "regex-tester-visualizer": dynamic(() => import("@/components/tools/RegexTester"), { loading: () => <ToolSkeleton /> }),
     "youtube-thumbnail-previewer": dynamic(() => import("@/components/tools/YouTubeThumbnailPreviewer"), { loading: () => <ToolSkeleton /> }),
     "code-snippet-animator": dynamic(() => import("@/components/tools/CodeSnippetAnimator"), { loading: () => <ToolSkeleton /> }),
     "audio-stem-separator": dynamic(() => import("@/components/tools/AudioStemSeparator"), { loading: () => <ToolSkeleton /> }),
     "options-payoff-visualizer": dynamic(() => import("@/components/tools/OptionsPayoffVisualizer"), { loading: () => <ToolSkeleton /> }),
     "option-strategy-builder": dynamic(() => import("@/components/tools/OptionStrategyBuilder"), { loading: () => <ToolSkeleton /> }),
     "trade-journal-analyzer": dynamic(() => import("@/components/tools/TradeJournalAnalyzer"), { loading: () => <ToolSkeleton /> }),
     "utm-link-builder": dynamic(() => import("@/components/tools/UtmLinkBuilder"), { loading: () => <ToolSkeleton /> }),
     "position-size-calculator": dynamic(() => import("@/components/tools/PositionSizeCalculator"), { loading: () => <ToolSkeleton /> }),
     "saas-metrics-calculator": dynamic(() => import("@/components/tools/SaasMetricsCalculator"), { loading: () => <ToolSkeleton /> }),
     "legacy-code-refactorer": dynamic(() => import("@/components/tools/LegacyCodeRefactorer"), { loading: () => <ToolSkeleton /> }),
     "thumbnail-ctr-predictor": dynamic(() => import("@/components/tools/ThumbnailCtrPredictor"), { loading: () => <ToolSkeleton /> }),
     "short-video-repurposer": dynamic(() => import("@/components/tools/ShortVideoRepurposer"), { loading: () => <ToolSkeleton /> }),
     "conversion-funnel-simulator": dynamic(() => import("@/components/tools/ConversionFunnelSimulator"), { loading: () => <ToolSkeleton /> }),
     "predictive-churn-analyzer": dynamic(() => import("@/components/tools/PredictiveChurnAnalyzer"), { loading: () => <ToolSkeleton /> }),
};

// 3. Dynamic Server-Side Metadata Generation
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
     const { slug } = await params;
     const tool = MASTER_TOOLS_LIST.find(t => t.slug === `/tools/${slug}`);

     if (!tool) {
          return { title: "Tool Not Found | CodeMines" };
     }

     return generateToolMetadata(tool);
}

// 4. The Main Page Component
export default function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
     // Unwrap the params Promise safely for Next.js 15
     const { slug } = use(params);

     const tool = MASTER_TOOLS_LIST.find(t => t.slug === `/tools/${slug}`);

     if (!tool) {
          return notFound();
     }

     // Resolve the specific component from the dictionary
     // Note: We remove the `/tools/` prefix from the DB slug to match our dictionary keys
     const componentKey = tool.slug.replace('/tools/', '');
     const ActiveToolComponent = ToolComponents[componentKey];

     // Generate the JSON-LD Schema
     const jsonLd = generateToolSchema(tool);

     return (
          <div className="w-full min-h-screen bg-[#090d16] pt-24 pb-20 px-4">

               {/* Hidden SEO Schema Injection */}
               <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
               />

               <div className="max-w-7xl mx-auto flex flex-col gap-10">

                    {/* Global Tool Header */}
                    <div className="text-center max-w-3xl mx-auto mt-8 mb-4">
                         <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
                              {tool.name}
                         </h1>
                         <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 inline-flex items-start gap-4 text-left shadow-lg">
                              <Info className="text-blue-400 shrink-0 mt-1" size={24} />
                              <p className="text-base md:text-lg text-gray-300 leading-relaxed">
                                   {tool.description}
                              </p>
                         </div>
                    </div>

                    {/* The Interactive Tool Injection Zone */}
                    <div className="w-full relative z-10">
                         {ActiveToolComponent ? <ActiveToolComponent /> : (
                              <div className="text-center p-10 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400">
                                   Component not found for this slug. Please verify the component dictionary map.
                              </div>
                         )}
                    </div>

                    {/* Dynamic "How to Use" Section */}
                    <div className="max-w-4xl mx-auto w-full bg-gray-900/40 border border-gray-800 rounded-3xl p-8 md:p-10 shadow-xl mt-12">
                         <div className="flex items-center gap-3 mb-8">
                              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20">
                                   <BookOpen size={20} />
                              </div>
                              <h2 className="text-2xl font-bold text-white">How to use the {tool.name}</h2>
                         </div>

                         <div className="space-y-6">
                              {tool.howToUse ? (
                                   tool.howToUse.map((step, index) => (
                                        <div key={index} className="flex gap-4">
                                             <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-sm font-bold text-gray-400">
                                                  {index + 1}
                                             </div>
                                             <p className="text-gray-300 pt-1 leading-relaxed">{step}</p>
                                        </div>
                                   ))
                              ) : (
                                   <p className="text-gray-500 italic border-l-2 border-gray-800 pl-4">
                                        Step-by-step instructions for this tool will be added shortly. The interface is designed to be intuitive and self-explanatory.
                                   </p>
                              )}
                         </div>
                    </div>

               </div>
          </div>
     );
}