import { CATEGORIES } from "@/constants";
import CategoryCard from "@/components/ui/CategoryCard";
import { LayoutGrid } from "lucide-react";

export default function FeaturedCategories() {
     return (
          <section className="mb-16">
               <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                    <div>
                         <div className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">
                              <LayoutGrid size={14} /> Ecosystem Map
                         </div>
                         <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                              Explore Tool Categories
                         </h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md mt-2 md:mt-0">
                         Categorized utilities designed for client-side privacy, sub-millisecond execution, and high developer productivity.
                    </p>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {CATEGORIES.map((cat) => (
                         <CategoryCard key={cat.id} category={cat} />
                    ))}
               </div>
          </section>
     );
}