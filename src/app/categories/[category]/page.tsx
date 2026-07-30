import React from "react";
import { notFound } from "next/navigation";
import { MASTER_TOOLS_LIST, CATEGORIES } from "@/constants";
import AdSlot from "@/components/ui/AdSlot";
import ToolCard from "@/components/ui/ToolCard";
import Link from "next/link";
import { ArrowLeft, FolderKanban } from "lucide-react";

interface CategoryPageProps {
     params: Promise<{
          category: string;
     }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
     const resolvedParams = await params;
     const rawSlug = resolvedParams?.category || "";
     const safeSlug = typeof rawSlug === "string" ? rawSlug : Array.isArray(rawSlug) ? rawSlug[0] : "";

     const category = CATEGORIES.find(
          (c) => c.slug === safeSlug || c.id === safeSlug || c.slug === `/${safeSlug}` || c.slug === `/categories/${safeSlug}`
     ) || { id: safeSlug, name: safeSlug ? safeSlug.replace(/-/g, " ").toUpperCase() : "Category", slug: safeSlug };

     // Robust filter that ignores hyphens, underscores, and casing differences
     const normalizedSlug = safeSlug.toLowerCase().replace(/[-_]/g, "");

     const categoryTools = MASTER_TOOLS_LIST.filter((t) => {
          const toolCat = (t.category || "").toLowerCase().replace(/[-_]/g, "");
          const catId = (category.id || "").toLowerCase().replace(/[-_]/g, "");
          const catSlug = (category.slug || "").toLowerCase().replace(/[-_]/g, "");

          return (
               toolCat === normalizedSlug ||
               toolCat === catId ||
               toolCat === catSlug ||
               normalizedSlug.includes(toolCat) ||
               toolCat.includes(normalizedSlug)
          );
     });

     return (
          <main className="min-h-screen bg-[#090d16] text-white flex flex-col items-center px-4 py-8">
               <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">

                    {/* Back Link */}
                    <div>
                         <Link
                              href="/"
                              className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors bg-gray-900 border border-gray-800 px-3.5 py-2 rounded-xl"
                         >
                              <ArrowLeft size={14} /> Back to Home
                         </Link>
                    </div>

                    {/* Category Header */}
                    <div className="bg-gradient-to-r from-gray-900 via-[#0c121e] to-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                                   <FolderKanban size={28} />
                              </div>
                              <div>
                                   <h1 className="text-2xl md:text-3xl font-black text-white">{category.name}</h1>
                                   <p className="text-sm text-gray-400 mt-1">Explore free browser-based tools optimized for {category.name.toLowerCase()}.</p>
                              </div>
                         </div>
                    </div>

                    {/* CATEGORY TOP AD BANNER */}
                    <AdSlot adSlot="category-top-banner" format="horizontal" minHeight="90px" className="w-full my-2" />

                    {/* Tools Grid */}
                    {categoryTools.length > 0 ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {categoryTools.map((tool, idx) => (
                                   <React.Fragment key={tool.id}>
                                        <ToolCard tool={tool} />
                                        {/* Insert an in-feed ad slot after every 3 tools for optimal monetization */}
                                        {(idx + 1) % 3 === 0 && (
                                             <div className="col-span-full my-2">
                                                  <AdSlot adSlot={`category-infeed-${idx}`} format="fluid" />
                                             </div>
                                        )}
                                   </React.Fragment>
                              ))}
                         </div>
                    ) : (
                         <div className="bg-gray-900 border border-gray-800 rounded-3xl p-12 text-center text-gray-400 flex flex-col items-center gap-3">
                              <p className="text-base font-semibold">No tools found in this category yet.</p>
                              <p className="text-xs text-gray-500">Check back soon or explore other tool categories on the homepage.</p>
                              <Link href="/" className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl">
                                   Return to Home
                              </Link>
                         </div>
                    )}

                    {/* CATEGORY BOTTOM AD BANNER */}
                    <AdSlot adSlot="category-bottom-banner" format="horizontal" minHeight="90px" className="w-full my-4" />

               </div>
          </main>
     );
}