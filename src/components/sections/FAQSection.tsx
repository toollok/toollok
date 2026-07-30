"use client";

import { useState } from "react";
import { FAQS } from "@/constants";
import { HelpCircle } from "lucide-react";

export default function FAQSection() {
     const [activeFaq, setActiveFaq] = useState<number | null>(null);

     return (
          <section className="max-w-4xl mx-auto px-4 py-20 border-t border-gray-800/40">
               <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">
                         <HelpCircle size={14} /> Clear Answers
                    </div>
                    <h2 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
               </div>

               <div className="space-y-4">
                    {FAQS.map((faq, index) => (
                         <div
                              key={index}
                              className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden transition-colors"
                         >
                              <button
                                   onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                                   className="w-full text-left p-6 flex justify-between items-center font-bold text-white hover:text-blue-400 transition-colors"
                              >
                                   <span>{faq.question}</span>
                                   <span className="text-xl text-gray-500">{activeFaq === index ? "−" : "+"}</span>
                              </button>
                              {activeFaq === index && (
                                   <div className="px-6 pb-6 text-sm text-gray-400 leading-relaxed border-t border-gray-800/50 pt-4">
                                        {faq.answer}
                                   </div>
                              )}
                         </div>
                    ))}
               </div>
          </section>
     );
}