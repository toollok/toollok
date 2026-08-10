import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, Calendar, ArrowRight, Sparkles, ChevronRight, ChevronLeft, Zap } from "lucide-react";
import { getPostBySlug, getAllPosts, getAuthorById, getCategoryById } from "@/lib/blog";
import { MASTER_TOOLS_LIST } from "@/constants";
import ClientShare from "@/components/blog/ClientShare";

interface BlogPostPageProps {
     params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
     const posts = await getAllPosts();
     return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
     const resolvedParams = await params;
     const post = await getPostBySlug(resolvedParams.slug);

     if (!post) return { title: "Post Not Found | ToolLok" };

     return {
          title: post.seo.metaTitle,
          description: post.seo.metaDescription,
          keywords: post.seo.keywords,
          alternates: { canonical: `https://toollok.com/blog/${post.slug}` },
          openGraph: {
               title: post.seo.metaTitle,
               description: post.seo.metaDescription,
               url: `https://toollok.com/blog/${post.slug}`,
               images: [{ url: post.coverImage }],
               type: "article",
               publishedTime: post.publishedAt,
               modifiedTime: post.updatedAt || post.publishedAt,
               authors: ["https://toollok.com/about"],
          },
          twitter: {
               card: "summary_large_image",
               title: post.seo.metaTitle,
               description: post.seo.metaDescription,
               images: [post.coverImage],
          },
     };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
     const resolvedParams = await params;
     const post = await getPostBySlug(resolvedParams.slug);
     if (!post) notFound();

     const author = await getAuthorById(post.authorId);
     const category = await getCategoryById(post.categoryId);
     const allPosts = await getAllPosts();

     // Related ecosystem queries
     const relatedTools = MASTER_TOOLS_LIST.filter(tool => post.relatedToolIds.includes(tool.id));

     // Fetch popular tools (excluding the related ones so we don't show duplicates)
     const popularTools = MASTER_TOOLS_LIST.filter(tool => !post.relatedToolIds.includes(tool.id)).slice(0, 4);

     // Simulate fetching the newest tools (Grabbing the last 3 tools in your master list)
     const newlyAddedTools = [...MASTER_TOOLS_LIST].reverse().slice(0, 3);

     const relatedPosts = allPosts.filter(p => p.categoryId === post.categoryId && p.id !== post.id).slice(0, 2);
     const postIndex = allPosts.findIndex(p => p.id === post.id);
     const previousPost = postIndex > 0 ? allPosts[postIndex - 1] : null;
     const nextPost = postIndex < allPosts.length - 1 ? allPosts[postIndex + 1] : null;

     // Schema & Sharing Setup
     const shareUrl = `https://toollok.com/blog/${post.slug}`;
     const encodedTitle = encodeURIComponent(post.title);

     const jsonLdArticle = {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.seo.metaTitle,
          description: post.seo.metaDescription,
          image: post.coverImage,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt || post.publishedAt,
          author: { "@type": "Person", name: author?.name || "ToolLok ", url: "https://toollok.com/about" },
          publisher: { "@type": "Organization", name: "ToolLok", logo: { "@type": "ImageObject", url: "https://toollok.com/logo.png" } },
     };

     const jsonLdBreadcrumb = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
               { "@type": "ListItem", position: 1, name: "Home", item: "https://toollok.com" },
               { "@type": "ListItem", position: 2, name: "Blog", item: "https://toollok.com/blog" },
               { "@type": "ListItem", position: 3, name: post.title, item: shareUrl }
          ]
     };

     return (
          <div className="w-full min-h-screen bg-[#090d16] text-gray-100 selection:bg-blue-500 selection:text-white pb-32">
               <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }} />
               <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />

               <main className="max-w-[1200px] mx-auto px-4 lg:px-8 pt-12">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8 font-mono">
                         <Link href="/" className="hover:text-white">Home</Link> <span>/</span>
                         <Link href="/blog" className="hover:text-white">Blog</Link> <span>/</span>
                         <span className="text-blue-400 truncate max-w-[200px] sm:max-w-none">{post.title}</span>
                    </nav>

                    {/* Hero Header */}
                    <header className="flex flex-col gap-6 max-w-4xl mx-auto mb-12 text-center items-center">
                         <div className="flex items-center gap-3 flex-wrap justify-center">
                              {category && (
                                   <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold">
                                        {category.name}
                                   </span>
                              )}
                              <span className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                                   <Calendar size={14} /> {new Date(post.publishedAt).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                                   <Clock size={14} /> {post.readingTime}
                              </span>
                         </div>
                         <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">{post.title}</h1>
                         <p className="text-lg text-gray-300 leading-relaxed max-w-2xl">{post.excerpt}</p>
                    </header>

                    {/* 2-Column Layout: Article | Tools Sidebar */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto items-start">

                         {/* Left: Main Article Body & Image (Takes up 8 columns, perfectly aligned) */}
                         <div className="lg:col-span-8 w-full">

                              {/* Featured Cover Image (Centered & Aligned precisely with the text width) */}
                              <div className="w-full mb-12 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl aspect-[2/1]">
                                   {/* eslint-disable-next-line @next/next/no-img-element */}
                                   <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                              </div>

                              <article className="prose prose-invert prose-blue max-w-none 
              prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-white
              prose-p:text-gray-300 prose-p:leading-relaxed prose-p:text-base prose-p:mb-6
              prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white prose-code:text-emerald-400 prose-code:bg-gray-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none"
                                   dangerouslySetInnerHTML={{ __html: post.content }}
                              >
                              </article>

                              {/* Share Feature */}
                              <div className="mt-16 flex items-center gap-4 border-t border-gray-800/80 pt-8">
                                   <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Share this guide:</span>
                                   <div className="flex items-center gap-2">

                                        {/* Copy Link & Native Device Share */}
                                        <ClientShare url={shareUrl} title={post.title} />

                                        {/* Twitter / X Share */}
                                        <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-[#1DA1F2]/20 hover:border-[#1DA1F2]/50 transition-all" title="Share on X">
                                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                                        </a>

                                        {/* LinkedIn Share */}
                                        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-[#0077b5]/20 hover:border-[#0077b5]/50 transition-all" title="Share on LinkedIn">
                                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
                                        </a>

                                        {/* Facebook Share */}
                                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-[#1877F2]/20 hover:border-[#1877F2]/50 transition-all" title="Share on Facebook">
                                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                                        </a>
                                   </div>
                              </div>
                         </div>

                         {/* Right: Internal Linking Tool Funnel (Takes up 4 columns) */}
                         <aside className="lg:col-span-4 flex flex-col gap-8 sticky top-24">

                              {/* Related Tools */}
                              {relatedTools.length > 0 && (
                                   <div className="bg-gradient-to-b from-gray-900/90 to-gray-950/90 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full"></div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest mb-2"><Sparkles size={14} /> Recommended Tool</div>
                                        <h3 className="text-lg font-bold text-white mb-4">Put this into practice</h3>
                                        <div className="flex flex-col gap-4">
                                             {relatedTools.map(tool => (
                                                  <div key={tool.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-3 group hover:border-blue-500/50 transition-all">
                                                       <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{tool.name}</h4>
                                                       <Link href={tool.slug} className="mt-2 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 rounded-xl transition-all">
                                                            Launch Tool <ArrowRight size={14} />
                                                       </Link>
                                                  </div>
                                             ))}
                                        </div>
                                   </div>
                              )}

                              {/* Popular Tools */}
                              {popularTools.length > 0 && (
                                   <div className="bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-3xl p-6 shadow-xl">
                                        <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-widest mb-4"><Zap size={14} /> Popular Tools</div>
                                        <div className="flex flex-col gap-4">
                                             {popularTools.map(tool => (
                                                  <Link key={tool.id} href={tool.slug} className="group p-3 border border-gray-800 bg-gray-900/50 hover:border-gray-600 rounded-xl transition-all flex flex-col gap-1">
                                                       <h4 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{tool.name}</h4>
                                                       <p className="text-xs text-gray-500 line-clamp-1">{tool.description}</p>
                                                  </Link>
                                             ))}
                                        </div>
                                   </div>
                              )}

                         </aside>

                    </div>

                    {/* Footer Area: Tags, Nav, Recommended */}
                    <footer className="max-w-4xl mx-auto mt-16 pt-8 border-t border-gray-800/50">

                         {/* Tags */}
                         <div className="flex items-center gap-2 flex-wrap mb-12">
                              <span className="text-xs text-gray-500 uppercase font-bold mr-2">Tags:</span>
                              {post.tags.map(tag => (
                                   <span key={tag} className="bg-gray-900 border border-gray-800 text-gray-300 text-xs px-3 py-1 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer">#{tag}</span>
                              ))}
                         </div>

                         {/* Newly Added Tools (Replaced Author Box) */}
                         {newlyAddedTools.length > 0 && (
                              <div className="mb-12">
                                   <h3 className="text-xl font-bold text-white mb-6 border-b border-gray-800/80 pb-3">Newly Added Tools</h3>
                                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {newlyAddedTools.map(tool => (
                                             <Link key={tool.id} href={tool.slug} className="group p-5 border border-gray-800 bg-gray-900/30 hover:bg-gray-900/80 rounded-2xl transition-all flex flex-col justify-between gap-3 hover:border-gray-600">
                                                  <div>
                                                       <h4 className="text-sm font-bold text-gray-200 group-hover:text-blue-400 transition-colors">{tool.name}</h4>
                                                       <p className="text-xs text-gray-500 line-clamp-2 mt-1">{tool.description}</p>
                                                  </div>
                                                  <span className="text-blue-400 text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                       Try Now <ArrowRight size={12} />
                                                  </span>
                                             </Link>
                                        ))}
                                   </div>
                              </div>
                         )}

                         {/* Previous / Next Article */}
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16 mt-8">
                              {previousPost ? (
                                   <Link href={`/blog/${previousPost.slug}`} className="p-4 border border-gray-800 rounded-2xl hover:border-gray-600 bg-gray-900/30 group flex flex-col gap-2 transition-all">
                                        <span className="text-xs text-gray-500 uppercase flex items-center gap-1"><ChevronLeft size={14} /> Previous</span>
                                        <span className="text-sm font-bold text-gray-300 group-hover:text-white line-clamp-1">{previousPost.title}</span>
                                   </Link>
                              ) : <div />}
                              {nextPost ? (
                                   <Link href={`/blog/${nextPost.slug}`} className="p-4 border border-gray-800 rounded-2xl hover:border-gray-600 bg-gray-900/30 group flex flex-col gap-2 items-end text-right transition-all">
                                        <span className="text-xs text-gray-500 uppercase flex items-center gap-1">Next <ChevronRight size={14} /></span>
                                        <span className="text-sm font-bold text-gray-300 group-hover:text-white line-clamp-1">{nextPost.title}</span>
                                   </Link>
                              ) : <div />}
                         </div>

                         {/* Related Articles */}
                         {relatedPosts.length > 0 && (
                              <div className="mb-8">
                                   <h3 className="text-2xl font-bold text-white mb-6">Read Next</h3>
                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {relatedPosts.map(p => (
                                             <Link key={p.id} href={`/blog/${p.slug}`} className="group block">
                                                  <div className="aspect-[16/9] w-full overflow-hidden rounded-xl mb-3 border border-gray-800 group-hover:border-gray-600 transition-colors">
                                                       {/* eslint-disable-next-line @next/next/no-img-element */}
                                                       <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                  </div>
                                                  <h4 className="text-md font-bold text-gray-200 group-hover:text-blue-400 transition-colors">{p.title}</h4>
                                             </Link>
                                        ))}
                                   </div>
                              </div>
                         )}

                    </footer>
               </main>
          </div>
     );
}