import { Zap, Lock, Smartphone } from "lucide-react";

export default function WhyChooseUs() {
     const features = [
          { icon: Zap, title: "Sub-Millisecond Speed", desc: "Powered by WebAssembly for instant client-side computation." },
          { icon: Lock, title: "Zero Data Retention", desc: "Your code and sensitive inputs never leave your local browser." },
          { icon: Smartphone, title: "100% Mobile Ready", desc: "Fully responsive layouts optimized for touch devices and tablets." }
     ];

     return (
          <section className="py-16 border-t border-gray-200 dark:border-gray-800/40">
               <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Engineered for Privacy & Speed</h2>
                    <p className="text-gray-600 dark:text-gray-400">Why thousands of engineers and creators trust ToolLok Tools every day.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((item, idx) => (
                         <div key={idx} className="bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow">
                              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mx-auto mb-6">
                                   <item.icon size={24} />
                              </div>
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                         </div>
                    ))}
               </div>
          </section>
     );
}