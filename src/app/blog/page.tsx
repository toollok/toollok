import Link from "next/link";
import { Suspense } from "react"; // <-- Added Suspense
import { Zap, TrendingUp, Wrench, ChevronRight, Clock, Calendar, SearchX } from "lucide-react";
import { getAllPosts } from "@/lib/blog";
import { MASTER_TOOLS_LIST } from "@/constants";
import BlogSearch from "@/components/blog/BlogSearch";

export const metadata = {
     title: "ToolLok Blog | Premium Tools & Engineering Guides",
     description: "Deep dive tutorials, case studies, and tool guides to help you maximize productivity and build better software.",
};

interface BlogHomepageProps {
     searchParams: Promise<{ q?: string }>;
}

export default async function BlogHomepage({ searchParams }: BlogHomepageProps) {
     const resolvedParams = await searchParams;
     const query = resolvedParams?.q?.toLowerCase() || "";
     const isSearching = !!query;

     const allPosts = await getAllPosts();

     // Handle Search Filtering
     const displayedPosts = isSearching
          ? allPosts.filter(post =>
               post.title.toLowerCase().includes(query) ||
               post.excerpt.toLowerCase().includes(query) ||
               post.tags.some(tag => tag.toLowerCase().includes(query))
          )
          : allPosts;

     // 1. Magazine Grid Posts 
     const featuredPost = allPosts[0];
     const heroGridPosts = allPosts.slice(1, 5);

     // 2. Older Posts 
     const remainingPosts = allPosts.slice(5);

     // 3. Sidebar Data
     const popularPosts = allPosts.filter(p => p.isPopular).slice(0, 4);
     const recommendedTools = MASTER_TOOLS_LIST.slice(0, 4);

     return (
          <div className="w-full min-h-screen bg-white dark:bg-[#090d16] text-gray-900 dark:text-white selection:bg-blue-500 selection:text-white pb-24 transition-colors">

               {/* Search & Header Strip */}
               <div className="w-full border-b border-gray-200 dark:border-gray-800/60 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-xl sticky top-0 z-50">
                    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                         <div className="flex items-center gap-6">
                              <Link href="/blog" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">
                                   ToolLok Journal
                              </Link>
                         </div>

                         {/* Suspense wrapper perfectly isolates the client search from the server page */}
                         <Suspense fallback={<div className="w-full sm:w-96 h-10 bg-gray-100 dark:bg-gray-900 rounded-xl animate-pulse" />}>
                              <BlogSearch />
                         </Suspense>

                    </div>
               </div>

               <main className="max-w-[1440px] mx-auto px-4 lg:px-8 mt-8">

                    {/* ========================================= */}
                    {/* DEFAULT VIEW: MAGAZINE HERO GRID          */}
                    {/* ========================================= */}
                    {!isSearching && featuredPost && (
                         <>
                              {/* News Ticker */}
                              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-2 mb-6 overflow-hidden shadow-sm dark:shadow-none">
                                   <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap">
                                        <Zap size={14} /> LATEST
                                   </span>
                                   <Link href={`/blog/${featuredPost.slug}`} className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white truncate transition-colors flex items-center gap-2">
                                        {featuredPost.title} <ChevronRight size={14} className="text-gray-400 dark:text-gray-500" />
                                   </Link>
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-16">
                                   {/* LEFT: Large Featured Post */}
                                   <Link href={`/blog/${featuredPost.slug}`} className="group relative block w-full h-[400px] lg:h-[500px] rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={featuredPost.coverImage} alt={featuredPost.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 dark:from-[#090d16] dark:via-[#090d16]/40 to-transparent"></div>

                                        <div className="absolute bottom-0 left-0 w-full p-6 lg:p-10">
                                             <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 group-hover:text-blue-300 transition-colors leading-[1.15]">
                                                  {featuredPost.title}
                                             </h2>
                                             <div className="flex items-center gap-2 text-sm text-gray-200 dark:text-gray-300 font-medium">
                                                  <span>by ToolLok</span>
                                                  <span className="text-gray-400 dark:text-gray-600">•</span>
                                                  <span>{new Date(featuredPost.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                             </div>
                                        </div>
                                   </Link>

                                   {/* RIGHT: Grid of 4 Smaller Posts */}
                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                                        {heroGridPosts.map(post => (
                                             <Link key={post.id} href={`/blog/${post.slug}`} className="group relative block w-full h-[200px] lg:h-[242px] rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg">
                                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                                  <img src={post.coverImage} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                                                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 dark:from-[#090d16] dark:via-[#090d16]/30 to-transparent"></div>

                                                  <div className="absolute bottom-0 left-0 w-full p-5">
                                                       <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors leading-snug line-clamp-2">
                                                            {post.title}
                                                       </h3>
                                                       <div className="text-xs text-gray-300 dark:text-gray-400 font-medium">
                                                            {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                       </div>
                                                  </div>
                                             </Link>
                                        ))}
                                   </div>
                              </div>
                         </>
                    )}

                    {/* ========================================= */}
                    {/* LOWER SECTION: Dynamic Content & Sidebar  */}
                    {/* ========================================= */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8">

                         <div className="lg:col-span-8">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800/80 pb-4">
                                   {isSearching ? `Search Results for "${query}"` : "More Articles"}
                              </h3>

                              <div className="flex flex-col gap-6">
                                   {displayedPosts.length > 0 ? displayedPosts.map(post => (
                                        <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col sm:flex-row gap-6 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 rounded-3xl p-4 transition-all shadow-sm dark:shadow-none">
                                             <div className="w-full sm:w-64 h-40 flex-shrink-0 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800/50">
                                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                                  <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                             </div>
                                             <div className="flex flex-col justify-center">
                                                  <div className="flex items-center gap-3 mb-2 text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                       <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(post.publishedAt).toLocaleDateString()}</span>
                                                       <span className="flex items-center gap-1.5"><Clock size={14} /> {post.readingTime}</span>
                                                  </div>
                                                  <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2 line-clamp-2 leading-snug">{post.title}</h4>
                                                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{post.excerpt}</p>
                                             </div>
                                        </Link>
                                   )) : (
                                        <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 p-12 rounded-3xl border border-gray-200 dark:border-gray-800 text-center">
                                             <SearchX size={48} className="text-gray-400 dark:text-gray-600 mb-4" />
                                             <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No guides found</h4>
                                             <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">We couldn't find anything matching "{query}". Try searching by a different term.</p>
                                             <Link href="/blog" className="mt-6 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-white font-bold transition-colors">
                                                  Clear Search
                                             </Link>
                                        </div>
                                   )}
                              </div>
                         </div>

                         <aside className="lg:col-span-4 flex flex-col gap-8">
                              {popularPosts.length > 0 && (
                                   <div className="bg-gray-50 dark:bg-gray-900/40 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-none">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                                             <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" /> Trending Now
                                        </h3>
                                        <div className="flex flex-col gap-5">
                                             {popularPosts.map((post, i) => (
                                                  <Link key={post.id} href={`/blog/${post.slug}`} className="flex gap-4 group">
                                                       <span className="text-2xl font-black text-gray-300 dark:text-gray-800 group-hover:text-gray-400 dark:group-hover:text-gray-700 transition-colors">0{i + 1}</span>
                                                       <div className="flex flex-col gap-1">
                                                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">{post.title}</h4>
                                                            <span className="text-xs text-gray-500 font-mono">{post.readingTime}</span>
                                                       </div>
                                                  </Link>
                                             ))}
                                        </div>
                                   </div>
                              )}

                              <div className="bg-gray-50 dark:bg-gray-900/40 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-none">
                                   <h3 className="text-sm font-bold text-gray-900 dark:text-gray-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Wrench size={16} className="text-orange-500 dark:text-orange-400" /> Featured Tools
                                   </h3>
                                   <div className="flex flex-col gap-3">
                                        {recommendedTools.map(tool => (
                                             <Link key={tool.id} href={tool.slug} className="group p-3 bg-white dark:bg-transparent border border-gray-200 dark:border-gray-800 hover:border-blue-500/30 rounded-xl transition-all shadow-sm dark:shadow-none">
                                                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{tool.name}</h4>
                                                  <p className="text-xs text-gray-500 line-clamp-1 mt-1">{tool.description}</p>
                                             </Link>
                                        ))}
                                   </div>
                              </div>
                         </aside>
                    </div>
               </main>
          </div>
     );
}