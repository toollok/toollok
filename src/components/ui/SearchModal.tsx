"use client";

import { useState, useEffect } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import { MASTER_TOOLS_LIST } from "@/constants";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
     const [query, setQuery] = useState("");

     // Filter tools based on query
     const searchResults = MASTER_TOOLS_LIST.filter(tool =>
          tool.name.toLowerCase().includes(query.toLowerCase()) ||
          tool.description.toLowerCase().includes(query.toLowerCase())
     );

     // Handle Cmd+K to open
     useEffect(() => {
          const handleKeyDown = (e: KeyboardEvent) => {
               if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                    e.preventDefault();
                    isOpen ? onClose() : onClose(); // Toggle logic handled by parent, but we block default here
               }
               if (e.key === "Escape") onClose();
          };
          window.addEventListener("keydown", handleKeyDown);
          return () => window.removeEventListener("keydown", handleKeyDown);
     }, [isOpen, onClose]);

     return (
          <AnimatePresence>
               {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
                         {/* Backdrop */}
                         <motion.div
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              onClick={onClose}
                              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                         />

                         {/* Modal */}
                         <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -20 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -20 }}
                              className="relative w-full max-w-2xl bg-gray-900 border border-gray-700 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[70vh]"
                         >
                              {/* Search Input */}
                              <div className="flex items-center px-4 py-4 border-b border-gray-800">
                                   <Search className="text-blue-400 mr-3" size={20} />
                                   <input
                                        autoFocus
                                        type="text"
                                        placeholder="Search for tools (e.g., 'JSON Formatter', 'SIP Calculator')..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        className="w-full bg-transparent text-white outline-none text-lg placeholder:text-gray-500"
                                   />
                                   <button onClick={onClose} className="p-2 text-gray-500 hover:text-white rounded-lg">
                                        <X size={20} />
                                   </button>
                              </div>

                              {/* Results List */}
                              <div className="overflow-y-auto p-4 flex-grow">
                                   {query.length === 0 ? (
                                        <div className="text-center py-10 text-gray-500 text-sm font-medium">
                                             Start typing to search 100+ tools...
                                        </div>
                                   ) : searchResults.length > 0 ? (
                                        <div className="space-y-2">
                                             {searchResults.map(tool => (
                                                  <Link
                                                       key={tool.id}
                                                       href={tool.slug}
                                                       onClick={onClose}
                                                       className="group flex items-center justify-between p-4 bg-gray-800/30 hover:bg-blue-900/20 border border-transparent hover:border-blue-500/30 rounded-xl transition-all"
                                                  >
                                                       <div>
                                                            <h4 className="text-white font-medium group-hover:text-blue-400 transition-colors">{tool.name}</h4>
                                                            <p className="text-sm text-gray-400">{tool.description}</p>
                                                       </div>
                                                       <ArrowRight size={16} className="text-gray-600 group-hover:text-blue-400 transform group-hover:translate-x-1 transition-all" />
                                                  </Link>
                                             ))}
                                        </div>
                                   ) : (
                                        <div className="text-center py-10 text-gray-500 text-sm font-medium">
                                             No tools found for "{query}"
                                        </div>
                                   )}
                              </div>
                         </motion.div>
                    </div>
               )}
          </AnimatePresence>
     );
}