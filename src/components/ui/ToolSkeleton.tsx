export default function ToolSkeleton() {
     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 animate-pulse">
               {/* Header Skeleton */}
               <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-gray-800 rounded-xl" />
                         <div className="flex flex-col gap-2">
                              <div className="w-64 h-6 bg-gray-800 rounded-lg" />
                              <div className="w-96 h-4 bg-gray-800/60 rounded-lg" />
                         </div>
                    </div>
               </div>

               {/* Studio Grid Skeleton */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-6 bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 h-[400px]" />
                    <div className="lg:col-span-6 bg-gray-900/60 border border-gray-800 rounded-3xl p-6 md:p-8 h-[400px]" />
               </div>
          </div>
     );
}