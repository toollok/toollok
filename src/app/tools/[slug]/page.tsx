import { notFound } from "next/navigation";
import { MASTER_TOOLS_LIST as TOOLS_LIST } from "@/constants";
import AdSlot from "@/components/ui/AdSlot";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Zap } from "lucide-react";
import dynamic from "next/dynamic";
import ToolSkeleton from "@/components/ui/ToolSkeleton";

// Tool component dictionary mapping slugs to dynamic imports
const toolComponents: Record<string, any> = {
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
     "meta-tags-generator": dynamic(() => import("@/components/tools/MetaTagsGenerator"), { loading: () => <ToolSkeleton /> }),
     "invoice-generator": dynamic(() => import("@/components/tools/InvoiceGenerator"), { loading: () => <ToolSkeleton /> }),
     "b2b-lead-scraper": dynamic(() => import("@/components/tools/B2BLeadScraper"), { loading: () => <ToolSkeleton /> }),
     "saas-pricing-simulator": dynamic(() => import("@/components/tools/SaaSPricingSimulator"), { loading: () => <ToolSkeleton /> }),
     "ai-pitch-deck-auditor": dynamic(() => import("@/components/tools/AiPitchDeckAuditor"), { loading: () => <ToolSkeleton /> }),
     "legal-contract-scanner": dynamic(() => import("@/components/tools/LegalContractScanner"), { loading: () => <ToolSkeleton /> }),
     "prompt-optimizer": dynamic(() => import("@/components/tools/PromptOptimizer"), { loading: () => <ToolSkeleton /> }),
     "ai-text-humanizer": dynamic(() => import("@/components/tools/AiTextHumanizer"), { loading: () => <ToolSkeleton /> }),
     "autonomous-research-agent": dynamic(() => import("@/components/tools/AutonomousResearchAgent"), { loading: () => <ToolSkeleton /> }),
     "ai-model-cost-calculator": dynamic(() => import("@/components/tools/AiModelCostCalculator"), { loading: () => <ToolSkeleton /> }),
     "prompt-security-tester": dynamic(() => import("@/components/tools/PromptSecurityTester"), { loading: () => <ToolSkeleton /> }),
     "world-clock-timezone-visualizer": dynamic(() => import("@/components/tools/WorldClockVisualizer"), { loading: () => <ToolSkeleton /> }),
     "markdown-publishing-studio": dynamic(() => import("@/components/tools/MarkdownStudio"), { loading: () => <ToolSkeleton /> }),
     "pomodoro-focus-engine": dynamic(() => import("@/components/tools/PomodoroFocusEngine"), { loading: () => <ToolSkeleton /> }),
     "meeting-actionizer": dynamic(() => import("@/components/tools/MeetingActionizer"), { loading: () => <ToolSkeleton /> }),
     "automated-sop-builder": dynamic(() => import("@/components/tools/AutomatedSopBuilder"), { loading: () => <ToolSkeleton /> }),
     "schema-markup-generator": dynamic(() => import("@/components/tools/SchemaMarkupGenerator"), { loading: () => <ToolSkeleton /> }),
     "serp-preview-optimizer": dynamic(() => import("@/components/tools/SerpPreviewOptimizer"), { loading: () => <ToolSkeleton /> }),
     "robots-sitemap-inspector": dynamic(() => import("@/components/tools/RobotsSitemapInspector"), { loading: () => <ToolSkeleton /> }),
     "content-cluster-architect": dynamic(() => import("@/components/tools/ContentClusterArchitect"), { loading: () => <ToolSkeleton /> }),
     "internal-link-visualizer": dynamic(() => import("@/components/tools/InternalLinkVisualizer"), { loading: () => <ToolSkeleton /> }),
     "browser-pii-scrubber": dynamic(() => import("@/components/tools/BrowserPiiScrubber"), { loading: () => <ToolSkeleton /> }),
     "image-exif-stripper": dynamic(() => import("@/components/tools/ImageExifStripper"), { loading: () => <ToolSkeleton /> }),
     "local-wasm-llm-chat": dynamic(() => import("@/components/tools/LocalWasmLlmChat"), { loading: () => <ToolSkeleton /> }),
     "password-entropy-analyzer": dynamic(() => import("@/components/tools/PasswordEntropyAnalyzer"), { loading: () => <ToolSkeleton /> }),
     "disposable-endpoint-tester": dynamic(() => import("@/components/tools/DisposableEndpointTester"), { loading: () => <ToolSkeleton /> }),

};

interface PageProps {
     params: Promise<{
          slug: string;
     }>;
}

export default async function ToolDetailPage({ params }: PageProps) {
     const resolvedParams = await params;
     const rawSlug = resolvedParams?.slug || "";
     const slug = typeof rawSlug === "string" ? rawSlug : Array.isArray(rawSlug) ? rawSlug[0] : "";

     if (!slug) {
          notFound();
     }

     const tool = TOOLS_LIST.find((t) => t.slug === `/tools/${slug}` || t.slug === slug || t.slug?.endsWith(`/${slug}`));

     if (!tool) {
          notFound();
     }

     const ToolComponent = toolComponents[slug];

     return (
          <main className="min-h-screen bg-[#090d16] text-white flex flex-col items-center px-4 py-8">
               <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">

                    {/* Back Navigation & Breadcrumb */}
                    <div className="flex items-center justify-between">
                         <Link
                              href="/"
                              className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors bg-gray-900 border border-gray-800 px-3.5 py-2 rounded-xl"
                         >
                              <ArrowLeft size={14} /> Back to All Tools
                         </Link>

                         <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                              <ShieldCheck size={14} />
                              <span>Verified Secure Tool</span>
                         </div>
                    </div>

                    {/* TOP AD BANNER */}
                    <AdSlot adSlot="tool-detail-top-banner" format="horizontal" minHeight="90px" className="w-full my-2" />

                    {/* Dynamic Tool Component Container */}
                    <div className="w-full bg-[#0c121e]/50 border border-gray-800/80 rounded-3xl p-4 md:p-8 shadow-2xl backdrop-blur-sm">
                         {ToolComponent ? (
                              <ToolComponent />
                         ) : (
                              <div className="py-12 text-center text-gray-400">Tool component loading or under maintenance.</div>
                         )}
                    </div>

                    {/* How to Use Section */}
                    {tool.howToUse && tool.howToUse.length > 0 && (
                         <div className="w-full bg-gray-900/60 border border-gray-800 rounded-3xl p-6 md:p-8 flex flex-col gap-4">
                              <h3 className="text-white font-bold text-base flex items-center gap-2">
                                   <Zap size={18} className="text-cyan-400" /> How to use {tool.name}
                              </h3>
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-300">
                                   {tool.howToUse.map((step, idx) => (
                                        <li key={idx} className="bg-gray-950/60 border border-gray-800/60 p-3.5 rounded-2xl flex items-start gap-2.5">
                                             <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                                  {idx + 1}
                                             </span>
                                             <span>{step}</span>
                                        </li>
                                   ))}
                              </ul>
                         </div>
                    )}

                    {/* BOTTOM IN-FEED AD BANNER */}
                    <AdSlot adSlot="tool-detail-bottom-fluid" format="fluid" className="w-full my-4" />

               </div>
          </main>
     );
}