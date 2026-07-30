import Link from "next/link";
import { Terminal } from "lucide-react"; // Notice we removed the brand icons from here!

// Custom SVG Icons for Brands (Since Lucide removed them)
const TwitterIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5 5 9.2 5 9.2c.3.1.6.2 1 .2C4 7.3 5 3 5 3c1.4 1.7 3.5 2.8 5.8 3 0 0-1.5-4.4 3-6 2.1-.9 4.6.1 5.5 2.2h3z" />
     </svg>
);

const GithubIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
          <path d="M9 18c-4.51 2-5-2-7-2" />
     </svg>
);

const YoutubeIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
     </svg>
);

export default function Footer() {
     return (
          <footer className="w-full bg-[#05080f] border-t border-gray-800 pt-16 pb-8 px-4">
               <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">

                         {/* Brand Column */}
                         <div className="lg:col-span-2">
                              <Link href="/" className="flex items-center gap-2 mb-6 outline-none">
                                   <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                                        <Terminal size={16} className="text-white font-bold" />
                                   </div>
                                   <span className="text-xl font-extrabold tracking-tight text-white">
                                        Tool<span className="text-blue-400">Lok</span>
                                   </span>
                              </Link>
                              <p className="text-gray-400 text-sm mb-6 max-w-xs leading-relaxed">
                                   The ultimate all-in-one platform providing 50+ premium tools for developers, traders, and content creators.
                              </p>
                              {/* ... social icons remain the same ... */}
                              <div className="flex items-center gap-4 text-gray-500">
                                   <Link href="#" className="hover:text-white transition-colors" aria-label="Twitter"><TwitterIcon /></Link>
                                   <Link href="#" className="hover:text-white transition-colors" aria-label="GitHub"><GithubIcon /></Link>
                                   <Link href="#" className="hover:text-white transition-colors" aria-label="YouTube"><YoutubeIcon /></Link>
                              </div>
                         </div>

                         {/* Links Columns */}
                         <div>
                              <h4 className="text-white font-bold mb-6">Categories</h4>
                              <ul className="space-y-3 text-sm text-gray-400">
                                   <li><Link href="/categories/finance" className="hover:text-blue-400 transition-colors">Financial Tools</Link></li>
                                   <li><Link href="/categories/developer" className="hover:text-blue-400 transition-colors">Developer Tools</Link></li>
                                   <li><Link href="/categories/creator" className="hover:text-blue-400 transition-colors">Creator Tools</Link></li>
                                   <li><Link href="/categories/seo" className="hover:text-blue-400 transition-colors">SEO & Marketing</Link></li>
                                   <li><Link href="/categories/ai" className="hover:text-blue-400 transition-colors">AI Generators</Link></li>
                              </ul>
                         </div>

                         <div>
                              <h4 className="text-white font-bold mb-6">Popular Tools</h4>
                              <ul className="space-y-3 text-sm text-gray-400">
                                   <li><Link href="#" className="hover:text-blue-400 transition-colors">Options Payoff Calculator</Link></li>
                                   <li><Link href="#" className="hover:text-blue-400 transition-colors">JSON Formatter</Link></li>
                                   <li><Link href="#" className="hover:text-blue-400 transition-colors">YouTube Title Generator</Link></li>
                                   <li><Link href="#" className="hover:text-blue-400 transition-colors">Position Size Calculator</Link></li>
                                   <li><Link href="#" className="hover:text-blue-400 transition-colors">CSS Wave Border</Link></li>
                              </ul>
                         </div>

                         <div>
                              <h4 className="text-white font-bold mb-6">Company</h4>
                              <ul className="space-y-3 text-sm text-gray-400">
                                   <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                                   <li><Link href="/premium" className="hover:text-purple-400 transition-colors">Premium</Link></li>
                                   <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                                   <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                                   <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                              </ul>
                         </div>

                    </div>

                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
                         <p>© {new Date().getFullYear()} ToolLok. All rights reserved.</p>                         <div className="flex gap-4 mt-4 md:mt-0">
                              <Link href="/sitemap.xml" className="hover:text-white transition-colors">Sitemap</Link>
                              <span>Designed for Professionals</span>
                         </div>
                    </div>
               </div>
          </footer>
     );
}