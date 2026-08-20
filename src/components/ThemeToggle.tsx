"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
     const { resolvedTheme, setTheme } = useTheme();
     const [mounted, setMounted] = useState(false);

     useEffect(() => setMounted(true), []);

     if (!mounted) return <div className="w-9 h-9" />; // Placeholder prevents hydration crash

     return (
          <button
               onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
               className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 transition-colors"
          >
               {resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
     );
}