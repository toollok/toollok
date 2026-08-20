"use client";

import { TESTIMONIALS } from "@/constants";
import { Quote, Star } from "lucide-react";

export default function Testimonials() {
     return (
          <section className="max-w-7xl mx-auto px-4 py-20 border-t border-gray-200 dark:border-gray-800/40">
               <div className="text-center max-w-2xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
                         <Star size={14} /> Trusted by Professionals
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                         Built for Speed & Privacy
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                         See why thousands of developers, traders, and content creators rely on ToolLok daily.
                    </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((testimonial) => (
                         <div
                              key={testimonial.id}
                              className="bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 relative flex flex-col justify-between hover:bg-gray-50 dark:hover:bg-gray-900/80 transition-colors shadow-lg"
                         >
                              <Quote size={40} className="text-gray-200 dark:text-gray-800 absolute top-6 right-6 opacity-50" />

                              <div className="mb-8 relative z-10">
                                   {/* 5-Star Rating */}
                                   <div className="flex items-center gap-1 mb-4 text-amber-500 dark:text-amber-400">
                                        {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                   </div>
                                   <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                        "{testimonial.content}"
                                   </p>
                              </div>

                              <div className="flex items-center gap-4 border-t border-gray-100 dark:border-gray-800/60 pt-4">
                                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                                        {testimonial.name.charAt(0)}
                                   </div>
                                   <div>
                                        <h4 className="text-gray-900 dark:text-white font-bold text-sm">{testimonial.name}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{testimonial.role} at {testimonial.company}</p>
                                   </div>
                              </div>
                         </div>
                    ))}
               </div>
          </section>
     );
}