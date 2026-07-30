export default function Newsletter() {
     return (
          <section className="max-w-7xl mx-auto px-4 py-16">
               <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-gray-800 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                         <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Stay Updated on New Tools</h3>
                         <p className="text-gray-400 text-sm">Get notified when new utilities, financial models, and AI tools go live.</p>
                    </div>
                    <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                         <input
                              type="email"
                              placeholder="Enter your email address"
                              className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 w-full sm:w-72"
                         />
                         <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm whitespace-nowrap shadow-lg shadow-blue-600/20">
                              Subscribe Free
                         </button>
                    </div>
               </div>
          </section>
     );
}