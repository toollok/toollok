import Link from "next/link";
import { ArrowRight, Search, Calendar, Clock, TrendingUp, Zap, BookOpen, Tags, Wrench } from "lucide-react";
import { getAllPosts, getFeaturedPost } from "@/lib/blog";
import { BLOG_CATEGORIES } from "@/constants/blog";
import { MASTER_TOOLS_LIST } from "@/constants";

export const metadata = {
     title: "ToolLok Blog | Premium Tools & Engineering Guides",
     description: "Deep dive tutorials, case studies, and tool guides to help you maximize productivity and build better software.",
};

export default async function BlogHomepage() {
     const allPosts = await getAllPosts();
     const featuredPost = await getFeaturedPost();
     const popularPosts = allPosts.filter(p => p.isPopular);
     const recentPosts = allPosts.filter(p => p.id !== featuredPost?.id).slice(0, 6);

     // Extract unique tags
     const allTags = Array.from(new Set(allPosts.flatMap(post => post.tags))).slice(0, 10);
     const recommendedTools = MASTER_TOOLS_LIST.slice(0, 4);

     return (
          <div className="w-full min-h-screen bg-[#090d16] text-white selection:bg-blue-500 selection:text-white pb-24">

               {/* Search & Header Strip */}
               <div className="w-full border-b border-gray-800/60 bg-[#090d16]/80 backdrop-blur-xl sticky top-0 z-50">
                    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                         <div className="flex items-center gap-6">
                              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                                   ToolLok Journal
                              </h1>
                         </div>
                         {/* Live Search UI Architecture */}
                         <div className="relative w-full sm:w-96 group">
                              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                              <input
                                   type="text"
                                   placeholder="Search guides, tools, authors..."
                                   className="w-full bg-gray-900 border border-gray-800 focus:border-blue-500/50 rounded-xl pl-10 pr-4 py-2 text-sm text-white outline-none transition-all shadow-inner"
                              />
                         </div>
                    </div>
               </div>

               <div className="max-w-[1440px] mx-auto px-4 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Main Content Area */}
                    <div className="lg:col-span-8 flex flex-col gap-16">

                         {/* Hero Section / Featured Article */}
                         {featuredPost && (
                              <section className="flex flex-col gap-6">
                                   <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                                        <Zap size={14} /> Editor's Choice
                                   </div>
                                   <Link href={`/blog/${featuredPost.slug}`} className="group relative block aspect-[2/1] w-full">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-emerald-500/20 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>
                                        <div className="relative w-full h-full overflow-hidden rounded-3xl border border-gray-700/50 shadow-2xl">
                                             {/* eslint-disable-next-line @next/next/no-img-element */}
                                             <img src={featuredPost.coverImage} alt={featuredPost.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out" />
                                             <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/40 to-transparent"></div>
                                             <div className="absolute bottom-0 left-0 p-8 w-full">
                                                  <div className="flex items-center gap-3 mb-4">
                                                       <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
                                                            {featuredPost.categoryId.toUpperCase()}
                                                       </span>
                                                       <span className="flex items-center gap-1 text-xs text-gray-300"><Clock size={12} /> {featuredPost.readingTime}</span>
                                                  </div>
                                                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors leading-tight">
                                                       {featuredPost.title}
                                                  </h2>
                                                  <p className="text-gray-300 text-sm sm:text-base line-clamp-2 max-w-2xl">{featuredPost.excerpt}</p>
                                             </div>
                                        </div>
                                   </Link>
                              </section>
                         )}

                         {/* Categories Grid */}
                         <section>
                              <h3 className="text-xl font-bold text-white mb-6 border-b border-gray-800/80 pb-4">Browse by Category</h3>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                   {BLOG_CATEGORIES.map(cat => (
                                        <Link key={cat.id} href={`/blog/category/${cat.slug}`} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 hover:border-gray-600 transition-colors flex flex-col items-center justify-center text-center gap-2 group">
                                             <span className="text-sm font-bold text-gray-300 group-hover:text-white">{cat.name}</span>
                                        </Link>
                                   ))}
                              </div>
                         </section>

                         {/* Latest Articles */}
                         <section>
                              <h3 className="text-xl font-bold text-white mb-6 border-b border-gray-800/80 pb-4">Latest Guides</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   {recentPosts.map(post => (
                                        <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col bg-gray-900/50 border border-gray-800 hover:border-blue-500/30 rounded-2xl overflow-hidden transition-all">
                                             <div className="aspect-[16/9] w-full overflow-hidden relative">
                                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                                  <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                             </div>
                                             <div className="p-6 flex flex-col flex-grow">
                                                  <div className="flex items-center gap-2 mb-3 text-xs text-gray-400 font-mono">
                                                       <Calendar size={12} />
                                                       <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                  </div>
                                                  <h4 className="text-lg font-bold text-gray-100 group-hover:text-blue-400 transition-colors mb-2 line-clamp-2">{post.title}</h4>
                                                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">{post.excerpt}</p>
                                             </div>
                                        </Link>
                                   ))}
                              </div>

                              {/* Pagination Architecture */}
                              <div className="mt-12 flex justify-center items-center gap-2">
                                   <button className="px-4 py-2 text-sm text-gray-400 bg-gray-900 border border-gray-800 rounded-lg opacity-50 cursor-not-allowed">Previous</button>
                                   <button className="px-4 py-2 text-sm text-white bg-blue-600 border border-blue-600 rounded-lg">1</button>
                                   <button className="px-4 py-2 text-sm text-gray-400 bg-gray-900 border border-gray-800 rounded-lg hover:text-white">2</button>
                                   <button className="px-4 py-2 text-sm text-gray-400 bg-gray-900 border border-gray-800 rounded-lg hover:text-white">Next</button>
                              </div>
                         </section>

                    </div>

                    {/* Sidebar Architecture */}
                    <aside className="lg:col-span-4 flex flex-col gap-8">

                         {/* Newsletter Box 
                         <div className="bg-gradient-to-br from-blue-900/20 to-emerald-900/20 border border-blue-500/20 rounded-3xl p-6 relative overflow-hidden">
                              <h3 className="text-lg font-bold text-white mb-2">Join 10,000+ Builders</h3>
                              <p className="text-xs text-gray-400 mb-4 leading-relaxed">Get our latest system architecture breakdowns and tool updates delivered weekly.</p>
                              <form className="flex flex-col gap-3">
                                   <input type="email" placeholder="developer@company.com" className="w-full bg-gray-950/50 border border-gray-700 focus:border-blue-500/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none" />
                                   <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-2.5 rounded-xl transition-colors">Subscribe</button>
                              </form>
                         </div>*/}

                         {/* Popular / Trending Articles */}
                         <div className="bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-3xl p-6">
                              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                                   <TrendingUp size={16} className="text-emerald-400" /> Trending Now
                              </h3>
                              <div className="flex flex-col gap-5">
                                   {popularPosts.map((post, i) => (
                                        <Link key={post.id} href={`/blog/${post.slug}`} className="flex gap-4 group">
                                             <span className="text-2xl font-black text-gray-800 group-hover:text-gray-700 transition-colors">0{i + 1}</span>
                                             <div className="flex flex-col gap-1">
                                                  <h4 className="text-sm font-bold text-gray-200 group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">{post.title}</h4>
                                                  <span className="text-xs text-gray-500 font-mono">{post.readingTime}</span>
                                             </div>
                                        </Link>
                                   ))}
                              </div>
                         </div>

                         {/* Reading Guides */}
                         <div className="bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-3xl p-6">
                              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                                   <BookOpen size={16} className="text-blue-400" /> Curated Guides
                              </h3>
                              <div className="flex flex-col gap-3">
                                   <Link href="#" className="text-sm text-gray-400 hover:text-white hover:underline">Complete Guide to Next.js SEO</Link>
                                   <Link href="#" className="text-sm text-gray-400 hover:text-white hover:underline">Mastering CSS Animations</Link>
                                   <Link href="#" className="text-sm text-gray-400 hover:text-white hover:underline">Local-First Web Architecture</Link>
                              </div>
                         </div>

                         {/* Popular Tags */}
                         <div className="bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-3xl p-6">
                              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                                   <Tags size={16} className="text-purple-400" /> Popular Tags
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                   {allTags.map(tag => (
                                        <Link key={tag} href={`/blog/tag/${tag}`} className="bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 px-3 py-1.5 rounded-full transition-colors">
                                             #{tag}
                                        </Link>
                                   ))}
                              </div>
                         </div>

                         {/* Tool Recommendations */}
                         <div className="bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-3xl p-6">
                              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                                   <Wrench size={16} className="text-orange-400" /> Featured Tools
                              </h3>
                              <div className="flex flex-col gap-3">
                                   {recommendedTools.map(tool => (
                                        <Link key={tool.id} href={tool.slug} className="group p-3 border border-gray-800 hover:border-blue-500/30 rounded-xl transition-all">
                                             <h4 className="text-sm font-bold text-gray-200 group-hover:text-blue-400">{tool.name}</h4>
                                             <p className="text-xs text-gray-500 line-clamp-1">{tool.description}</p>
                                        </Link>
                                   ))}
                              </div>
                         </div>

                    </aside>
               </div>
          </div>
     );
}