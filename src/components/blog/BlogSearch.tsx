"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function BlogSearch() {
     const router = useRouter();
     const searchParams = useSearchParams();

     // Initialize state from URL if someone shares a link like /blog?q=css
     const [query, setQuery] = useState(searchParams.get("q") || "");

     useEffect(() => {
          const timer = setTimeout(() => {
               // Only push to router if the query exists
               if (query.trim()) {
                    router.push(`/blog?q=${encodeURIComponent(query)}`);
               }
               // If query is empty, but the URL still has ?q=, we clear it
               else if (searchParams.has("q")) {
                    router.push(`/blog`);
               }
          }, 400); // 400ms debounce

          return () => clearTimeout(timer);
     }, [query, router, searchParams]);

     return (
          <div className="relative w-full sm:w-96 group">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
               <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search guides, tools, authors..."
                    className="w-full bg-gray-900 border border-gray-800 focus:border-blue-500/50 rounded-xl pl-10 pr-4 py-2 text-sm text-white outline-none transition-all shadow-inner"
               />
          </div>
     );
}