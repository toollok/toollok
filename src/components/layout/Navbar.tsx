"use client";
import SearchModal from "@/components/ui/SearchModal";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Menu, X, ChevronDown, Terminal, Home, Info, Flame, FolderKanban, Mail } from "lucide-react";

export default function Navbar() {
     const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
     const [isCategoryOpen, setIsCategoryOpen] = useState(false);
     const [isScrolled, setIsScrolled] = useState(false);
     const [isSearchOpen, setIsSearchOpen] = useState(false);

     // Scroll detection logic
     useEffect(() => {
          const handleScroll = () => {
               setIsScrolled(window.scrollY > 20);
          };
          window.addEventListener("scroll", handleScroll);
          return () => window.removeEventListener("scroll", handleScroll);
     }, []);

     // Prevent background scrolling when mobile menu is open
     useEffect(() => {
          if (isMobileMenuOpen) {
               document.body.style.overflow = "hidden";
          } else {
               document.body.style.overflow = "auto";
          }
          return () => { document.body.style.overflow = "auto"; };
     }, [isMobileMenuOpen]);

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
                         <Link href="/" className="flex items-center gap-2 group" onClick={() => setIsMobileMenuOpen(false)}>
                              <div className="group-hover:scale-105 transition-transform shadow-lg shadow-blue-500/10 rounded-xl overflow-hidden flex items-center justify-center">
                                   <Image
                                        src="/logo.png"
                                        alt="ToolLok Logo"
                                        width={36}
                                        height={36}
                                        className="w-9 h-9 object-cover"
                                   />
                              </div>
                              <span className="text-xl font-extrabold tracking-tight text-white">
                                   Tool<span className="text-blue-400">Lok</span>
                              </span>
                         </Link>

                         {/* Desktop Navigation Links */}
                         <nav className="hidden md:flex items-center gap-1">
                              <Link href="/" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors">
                                   <Home size={15} /> Home
                              </Link>

                              {/* Dropdown Container (Hover to open) */}
                              <div
                                   className="relative"
                                   onMouseEnter={() => setIsCategoryOpen(true)}
                                   onMouseLeave={() => setIsCategoryOpen(false)}
                              >
                                   <button
                                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                                   >
                                        <FolderKanban size={15} /> Categories <ChevronDown size={14} className={`transition-transform duration-200 ${isCategoryOpen ? "rotate-180" : ""}`} />
                                   </button>

                                   {/* Category Dropdown Overlay */}
                                   <div
                                        className={`absolute top-full left-0 mt-1 w-64 bg-[#0c121e] border border-gray-800 rounded-2xl shadow-2xl p-2 z-50 transition-all duration-200 origin-top-left ${isCategoryOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
                                             }`}
                                   >
                                        <Link href="/categories/developer-tools" onClick={() => setIsCategoryOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-xl transition-colors">
                                             Developer Tools
                                        </Link>
                                        <Link href="/categories/content-creator-tools" onClick={() => setIsCategoryOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-xl transition-colors">
                                             Content Creator Tools
                                        </Link>
                                        <Link href="/categories/analytics-tools" onClick={() => setIsCategoryOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-xl transition-colors">
                                             Analytics Tools
                                        </Link>
                                        <Link href="/categories/business-tools" onClick={() => setIsCategoryOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-xl transition-colors">
                                             Business Tools
                                        </Link>
                                        <Link href="/categories/ai-tools" onClick={() => setIsCategoryOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-xl transition-colors">
                                             AI Tools
                                        </Link>
                                        <Link href="/categories/productivity-tools" onClick={() => setIsCategoryOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-xl transition-colors">
                                             Productivity Tools
                                        </Link>
                                        <Link href="/categories/seo-tools" onClick={() => setIsCategoryOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-xl transition-colors">
                                             SEO Tools
                                        </Link>
                                        <Link href="/categories/privacy-tools" onClick={() => setIsCategoryOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-xl transition-colors">
                                             Privacy Tools
                                        </Link>
                                   </div>
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
                              className="md:hidden text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
                              aria-label="Toggle Navigation Menu"
                         >
                              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                         </button>
                    </div>
               </div>

               {/* Mobile Drawer */}
               <div
                    className={`md:hidden fixed inset-x-0 top-[64px] bottom-0 bg-[#090d16]/95 backdrop-blur-xl border-t border-gray-800 transition-transform duration-300 ease-in-out overflow-y-auto ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
                         }`}
               >
                    <div className="px-4 py-6 flex flex-col gap-2">
                         <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-gray-200 text-sm font-medium py-3 px-4 rounded-xl hover:bg-gray-800/80 transition-colors">
                              <Home size={18} className="text-gray-400" /> Home
                         </Link>
                         <Link href="/popular" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-gray-200 text-sm font-medium py-3 px-4 rounded-xl hover:bg-gray-800/80 transition-colors">
                              <Flame size={18} className="text-amber-400" /> Popular Tools
                         </Link>
                         <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-gray-200 text-sm font-medium py-3 px-4 rounded-xl hover:bg-gray-800/80 transition-colors">
                              <Info size={18} className="text-gray-400" /> About Us
                         </Link>
                         <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-gray-200 text-sm font-medium py-3 px-4 rounded-xl hover:bg-gray-800/80 transition-colors">
                              <Mail size={18} className="text-gray-400" /> Contact Us
                         </Link>

                         <div className="mt-4 pt-4 border-t border-gray-800/60">
                              <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider px-4 mb-2 flex items-center gap-2">
                                   <FolderKanban size={12} /> Browse Categories
                              </div>
                              <div className="flex flex-col gap-1">
                                   <Link href="/categories/developer-tools" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-300 text-sm font-medium py-3 px-4 rounded-xl hover:bg-gray-800/80 transition-colors">
                                        Developer Tools
                                   </Link>
                                   <Link href="/categories/content-creator-tools" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-300 text-sm font-medium py-3 px-4 rounded-xl hover:bg-gray-800/80 transition-colors">
                                        Content Creator Tools
                                   </Link>
                                   <Link href="/categories/analytics-tools" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-300 text-sm font-medium py-3 px-4 rounded-xl hover:bg-gray-800/80 transition-colors">
                                        Analytics Tools
                                   </Link>
                                   <Link href="/categories/business-tools" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-300 text-sm font-medium py-3 px-4 rounded-xl hover:bg-gray-800/80 transition-colors">
                                        Business Tools
                                   </Link>
                                   <Link href="/categories/ai-tools" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-300 text-sm font-medium py-3 px-4 rounded-xl hover:bg-gray-800/80 transition-colors">
                                        AI Tools
                                   </Link>
                                   <Link href="/categories/productivity-tools" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-300 text-sm font-medium py-3 px-4 rounded-xl hover:bg-gray-800/80 transition-colors">
                                        Productivity Tools
                                   </Link>
                                   <Link href="/categories/seo-tools" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-300 text-sm font-medium py-3 px-4 rounded-xl hover:bg-gray-800/80 transition-colors">
                                        SEO Tools
                                   </Link>
                                   <Link href="/categories/privacy-tools" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-300 text-sm font-medium py-3 px-4 rounded-xl hover:bg-gray-800/80 transition-colors">
                                        Privacy Tools
                                   </Link>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Command+K Search Modal */}
               <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
          </header>
     );
}