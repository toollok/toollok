import { MASTER_TOOLS_LIST, CATEGORIES } from "@/constants";
import ToolCard from "@/components/ui/ToolCard";
import Link from "next/link";
import { ChevronRight, LayoutGrid } from "lucide-react";
import { notFound } from "next/navigation";

interface Props {
     params: Promise<{
          category: string;
     }>;
}

export default async function CategoryPage({ params }: Props) {
     const { category } = await params;

     const categoryData = CATEGORIES.find(c => c.slug.includes(category));
     if (!categoryData) return notFound();

     const categoryTools = MASTER_TOOLS_LIST.filter(tool => tool.category === category);

     return (
          <div className="w-full min-h-screen py-12 px-4 flex flex-col items-center">
               <div className="max-w-7xl w-full">

                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-10 font-medium">
                         <Link href="/" className="hover:text-white transition-colors">Home</Link>
                         <ChevronRight size={14} />
                         <Link href="/categories" className="hover:text-white transition-colors">Categories</Link>
                         <ChevronRight size={14} />
                         <span className="text-blue-400">{categoryData.name}</span>
                    </nav>

                    {/* Header */}
                    <div className="mb-12 border-b border-gray-800/50 pb-10">
                         <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${categoryData.colorTheme} bg-opacity-10 text-white text-xs font-bold mb-6 uppercase tracking-widest`}>
                              <LayoutGrid size={14} /> {categoryData.toolCount} Tools
                         </div>
                         <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                              {categoryData.name}
                         </h1>
                         <p className="text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed">
                              {categoryData.description}
                         </p>
                    </div>

                    {/* Tools Grid */}
                    {categoryTools.length > 0 ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                              {categoryTools.map((tool) => (
                                   <ToolCard key={tool.id} tool={tool} />
                              ))}
                         </div>
                    ) : (
                         <div className="py-20 text-center border border-gray-800 rounded-3xl bg-gray-900/30">
                              <h3 className="text-xl text-gray-400 font-medium">Tools for this category are currently in development.</h3>
                         </div>
                    )}

               </div>
          </div>
     );
}