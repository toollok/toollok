"use client";
import SearchModal from "@/components/ui/SearchModal";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Menu, X, ChevronDown, Terminal, Home, Info, Flame, FolderKanban, Mail } from "lucide-react";

export default function Navbar() {
     const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
     const [isCategoryOpen, setIsCategoryOpen] = useState(false);
     const [isScrolled, setIsScrolled] = useState(false);
     const [isSearchOpen, setIsSearchOpen] = useState(false);

     // Scroll detection logic
     useEffect(() => {
          const handleScroll = () => {
               if (window.scrollY > 20) {
                    setIsScrolled(true);
               } else {
                    setIsScrolled(false);
               }
          };

          window.addEventListener("scroll", handleScroll);
          return () => window.removeEventListener("scroll", handleScroll);
     }, []);

     return (
          <header
               className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled
                    ? "bg-[#090d16]/80 backdrop-blur-md border-b border-gray-800 shadow-2xl"
                    : "bg-transparent border-b border-transparent"
                    }`}
          >
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

                    {/* Brand Logo */}
                    <div className="flex items-center gap-6 lg:gap-8">
                         <Link href="/" className="flex items-center gap-2 group">
                              <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                                   <Terminal size={18} className="text-white font-bold" />
                              </div>
                              <span className="text-xl font-extrabold tracking-tight text-white">
                                   Tool<span className="text-blue-400">Lok</span>
                              </span>
                         </Link>

                         {/* Navigation Links */}
                         <nav className="hidden md:flex items-center gap-1">
                              <Link href="/" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors">
                                   <Home size={15} /> Home
                              </Link>

                              <div className="relative">
                                   <button
                                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                                   >
                                        <FolderKanban size={15} /> Categories <ChevronDown size={14} className={`transition-transform duration-200 ${isCategoryOpen ? "rotate-180" : ""}`} />
                                   </button>

                                   {/* Simple Category Dropdown Overlay */}
                                   {isCategoryOpen && (
                                        <div
                                             className="absolute top-full left-0 mt-2 w-56 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-2 z-50"
                                             onMouseLeave={() => setIsCategoryOpen(false)}
                                        >
                                             <Link href="/categories/financial-tools" className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg">Financial & Trading</Link>
                                             <Link href="/categories/business-tools" className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg">Business & Startup</Link>
                                             <Link href="/categories/developer-tools" className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg">Developer Tools</Link>
                                             <Link href="/categories/creator" className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg">Content Creator Tools</Link>
                                             <Link href="/categories/seo" className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg">SEO Tools</Link>
                                        </div>
                                   )}
                              </div>

                              <Link href="/popular" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors">
                                   <Flame size={15} className="text-amber-400" /> Popular
                              </Link>

                              <Link href="/about" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors">
                                   <Info size={15} /> About
                              </Link>

                              <Link href="/contact" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors">
                                   <Mail size={15} /> Contact
                              </Link>
                         </nav>
                    </div>

                    {/* Right Action Items */}
                    <div className="flex items-center gap-3">
                         <button
                              onClick={() => setIsSearchOpen(true)}
                              className="flex items-center gap-2 bg-gray-900/80 hover:bg-gray-800 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-400 transition-colors cursor-text outline-none"
                         >
                              <Search size={14} />
                              <span className="hidden sm:inline">Search tools...</span>
                              <kbd className="hidden sm:inline bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded text-[10px] font-mono">⌘K</kbd>
                         </button>

                         {/* Mobile Menu Toggle Button */}
                         <button
                              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                              className="md:hidden text-gray-400 hover:text-white p-2"
                              aria-label="Toggle Navigation Menu"
                         >
                              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                         </button>
                    </div>
               </div>

               {/* Mobile Drawer */}
               {isMobileMenuOpen && (
                    <div className="md:hidden bg-gray-900 border-b border-gray-800 px-4 pt-3 pb-6 space-y-2">
                         <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-300 text-sm font-medium py-2 px-3 rounded-lg hover:bg-gray-800">
                              <Home size={16} /> Home
                         </Link>
                         <Link href="/popular" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-amber-400 text-sm font-medium py-2 px-3 rounded-lg hover:bg-gray-800">
                              <Flame size={16} /> Popular Tools
                         </Link>
                         <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-300 text-sm font-medium py-2 px-3 rounded-lg hover:bg-gray-800">
                              <Info size={16} /> About Us
                         </Link>
                         <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-300 text-sm font-medium py-2 px-3 rounded-lg hover:bg-gray-800">
                              <Mail size={16} /> Contact Us
                         </Link>

                         <div className="pt-2 pb-1 text-[10px] uppercase font-bold text-gray-500 tracking-wider px-3">Categories</div>
                         <Link href="/categories/financial-tools" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-300 text-sm font-medium py-2 px-3 rounded-lg hover:bg-gray-800">Financial & Trading Tools</Link>
                         <Link href="/categories/business-tools" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-300 text-sm font-medium py-2 px-3 rounded-lg hover:bg-gray-800">Business & Startup Tools</Link>
                         <Link href="/categories/developer-tools" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-300 text-sm font-medium py-2 px-3 rounded-lg hover:bg-gray-800">Developer Tools</Link>
                         <Link href="/categories/creator" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-300 text-sm font-medium py-2 px-3 rounded-lg hover:bg-gray-800">Content Creator Tools</Link>
                    </div>
               )}

               {/* Command+K Search Modal */}
               <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
          </header>
     );
}