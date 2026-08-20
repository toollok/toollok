import Link from "next/link";
import { Category } from "@/types";
import { ArrowRight } from "lucide-react";

export default function CategoryCard({ category }: { category: Category }) {
     return (
          <Link
               href={`/categories/${category.slug}`}
               className="group bg-white dark:bg-gray-900/40 hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 rounded-2xl p-6 transition-all duration-300 backdrop-blur-md flex flex-col justify-between shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
               <div>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${category.colorTheme} flex items-center justify-center text-white font-bold mb-4 shadow-md`}>
                         {category.name.charAt(0)}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                         {category.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-4">
                         {category.description}
                    </p>
               </div>
               <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
                    <span>{category.toolCount} Tools</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-blue-600 dark:text-blue-400" />
               </div>
          </Link>
     );
}