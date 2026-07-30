"use client";
import SearchModal from "@/components/ui/SearchModal";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Menu, X, ChevronDown, Sparkles, Terminal } from "lucide-react";

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
                    <div className="flex items-center gap-8">
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
                              <div className="relative">
                                   <button
                                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                                   >
                                        Categories <ChevronDown size={14} className={`transition-transform duration-200 ${isCategoryOpen ? "rotate-180" : ""}`} />
                                   </button>

                                   {/* Simple Category Dropdown Overlay */}
                                   {isCategoryOpen && (
                                        <div
                                             className="absolute top-full left-0 mt-2 w-56 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-2 z-50"
                                             onMouseLeave={() => setIsCategoryOpen(false)}
                                        >
                                             <Link href="/categories/finance" className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg">Financial Tools</Link>
                                             <Link href="/categories/developer" className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg">Developer Tools</Link>
                                             <Link href="/categories/creator" className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg">Content Creator Tools</Link>
                                             <Link href="/categories/ai" className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg">AI Utilities</Link>
                                             <Link href="/categories/seo" className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg">SEO Tools</Link>
                                        </div>
                                   )}
                              </div>

                              <Link href="/popular" className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors">
                                   Popular Tools
                              </Link>
                              <Link href="/premium" className="px-3 py-2 text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-300 hover:opacity-80 transition-opacity flex items-center gap-1">
                                   <Sparkles size={14} className="text-amber-400" /> Premium
                              </Link>
                         </nav>
                    </div>

                    {/* Right Action Items */}
                    <div className="flex items-center gap-3">
                         <button
                              onClick={() => setIsSearchOpen(true)}
                              className="hidden sm:flex items-center gap-2 bg-gray-900/80 hover:bg-gray-800 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-400 transition-colors cursor-text outline-none"
                         >
                              <Search size={14} />
                              <span>Search 500+ tools...</span>
                              <kbd className="bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded text-[10px] font-mono">⌘K</kbd>
                         </button>

                         <Link href="/login" className="hidden sm:block text-sm font-medium text-gray-300 hover:text-white px-3 py-1.5 transition-colors">
                              Log In
                         </Link>
                         <Link href="/signup" className="hidden sm:block bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-600/20">
                              Get Started
                         </Link>

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
                    <div className="md:hidden bg-gray-900 border-b border-gray-800 px-4 pt-2 pb-6 space-y-3">
                         <Link href="/categories/finance" className="block text-gray-300 text-sm font-medium py-2">Financial Tools</Link>
                         <Link href="/categories/developer" className="block text-gray-300 text-sm font-medium py-2">Developer Tools</Link>
                         <Link href="/categories/creator" className="block text-gray-300 text-sm font-medium py-2">Creator Tools</Link>
                         <Link href="/premium" className="block text-purple-400 font-bold text-sm py-2">CodeMines Premium</Link>
                         <div className="pt-2 border-t border-gray-800 flex flex-col gap-2">
                              <Link href="/login" className="text-center text-gray-300 text-sm font-medium py-2">Log In</Link>
                              <Link href="/signup" className="text-center bg-blue-600 text-white text-sm font-bold py-2 rounded-lg">Get Started</Link>
                         </div>
                    </div>
               )}
               {/* Mobile Drawer */}
               {isMobileMenuOpen && (
                    <div className="md:hidden bg-gray-900 border-b border-gray-800 px-4 pt-2 pb-6 space-y-3">
                         {/* ... mobile menu links ... */}
                    </div>
               )}

               {/* Put the Modal right here at the bottom! */}
               <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
          </header>
     );
}