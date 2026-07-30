"use client";

import Link from "next/link";
import { Terminal, Mail, Heart } from "lucide-react";

// Inline SVG components for brand icons (since Lucide removed them)
const TwitterIcon = ({ size = 18 }) => (
     <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
     </svg>
);

const GithubIcon = ({ size = 18 }) => (
     <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
          <path d="M9 18c-4.51 2-5-2-7-2" />
     </svg>
);

const LinkedinIcon = ({ size = 18 }) => (
     <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect width="4" height="12" x="2" y="9" />
          <circle cx="4" cy="4" r="2" />
     </svg>
);

export default function Footer() {
     const currentYear = new Date().getFullYear();

     return (
          <footer className="bg-[#090d16] border-t border-gray-800 pt-16 pb-8 mt-auto">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">

                         {/* Brand & Description */}
                         <div className="flex flex-col gap-4 lg:pr-8">
                              <Link href="/" className="flex items-center gap-2 group w-fit">
                                   <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                                        <Terminal size={16} className="text-white font-bold" />
                                   </div>
                                   <span className="text-xl font-extrabold tracking-tight text-white">
                                        Tool<span className="text-blue-400">Lok</span>
                                   </span>
                              </Link>
                              <p className="text-sm text-gray-400 leading-relaxed mt-2">
                                   A premium collection of highly engineered, 100% free client-side web utilities designed for developers, creators, and entrepreneurs.
                              </p>
                              {/* Social Links */}
                              <div className="flex items-center gap-4 mt-4">
                                   <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-cyan-400 transition-colors" aria-label="Twitter">
                                        <TwitterIcon size={18} />
                                   </a>
                                   <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors" aria-label="GitHub">
                                        <GithubIcon size={18} />
                                   </a>
                                   <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-400 transition-colors" aria-label="LinkedIn">
                                        <LinkedinIcon size={18} />
                                   </a>
                              </div>
                         </div>

                         {/* Categories */}
                         <div>
                              <h3 className="text-white font-bold mb-4 uppercase text-[11px] tracking-wider">Browse Categories</h3>
                              <ul className="flex flex-col gap-2.5 text-sm">
                                   <li><Link href="/categories/developer-tools" className="text-gray-400 hover:text-cyan-400 transition-colors">Developer Tools</Link></li>
                                   <li><Link href="/categories/content-creator-tools" className="text-gray-400 hover:text-cyan-400 transition-colors">Content Creator Tools</Link></li>
                                   <li><Link href="/categories/analytics-tools" className="text-gray-400 hover:text-cyan-400 transition-colors">Analytics Tools</Link></li>
                                   <li><Link href="/categories/business-tools" className="text-gray-400 hover:text-cyan-400 transition-colors">Business Tools</Link></li>
                                   <li><Link href="/categories/ai-tools" className="text-gray-400 hover:text-cyan-400 transition-colors">AI Tools</Link></li>
                                   <li><Link href="/categories/productivity-tools" className="text-gray-400 hover:text-cyan-400 transition-colors">Productivity Tools</Link></li>
                                   <li><Link href="/categories/seo-tools" className="text-gray-400 hover:text-cyan-400 transition-colors">SEO Tools</Link></li>
                                   <li><Link href="/categories/privacy-tools" className="text-gray-400 hover:text-cyan-400 transition-colors">Privacy Tools</Link></li>
                              </ul>
                         </div>

                         {/* Quick Links */}
                         <div>
                              <h3 className="text-white font-bold mb-4 uppercase text-[11px] tracking-wider">Quick Links</h3>
                              <ul className="flex flex-col gap-2.5 text-sm">
                                   <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                                   <li><Link href="/popular" className="text-gray-400 hover:text-amber-400 transition-colors">Popular Tools</Link></li>
                                   <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                                   <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Support</Link></li>
                                   <li><Link href="/sitemap" className="text-gray-400 hover:text-white transition-colors">HTML Sitemap</Link></li>
                              </ul>
                         </div>

                         {/* Legal & Compliance */}
                         <div>
                              <h3 className="text-white font-bold mb-4 uppercase text-[11px] tracking-wider">Legal & Compliance</h3>
                              <ul className="flex flex-col gap-2.5 text-sm">
                                   <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                                   <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms & Conditions</Link></li>
                                   <li><Link href="/disclaimer" className="text-gray-400 hover:text-white transition-colors">Disclaimer</Link></li>
                              </ul>

                              <div className="mt-6 bg-gray-950 border border-gray-800 rounded-xl p-4 flex flex-col gap-2">
                                   <div className="flex items-center gap-2 text-gray-300 text-sm font-bold">
                                        <Mail size={14} className="text-blue-400" /> Need Help?
                                   </div>
                                   <a href="mailto:support@toollok.com" className="text-xs text-gray-500 hover:text-blue-400 transition-colors">
                                        support@toollok.com
                                   </a>
                              </div>
                         </div>
                    </div>

                    {/* Bottom Copyright Bar */}
                    <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
                         <p className="text-xs text-gray-500">
                              &copy; {currentYear} ToolLok. All rights reserved.
                         </p>
                         <p className="text-xs text-gray-500 flex items-center gap-1.5">
                              Built with <Heart size={12} className="text-rose-500 fill-rose-500" /> for the web community.
                         </p>
                    </div>
               </div>
          </footer>
     );
}