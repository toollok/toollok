"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Building, Search, Download, Bookmark, Check, Filter, Globe, Mail, MapPin, Users, DollarSign, Edit3, Copy, ShieldCheck } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import AdSlot from "@/components/ui/AdSlot";

interface Lead {
     id: string; companyName: string; industry: string; employees: string;
     location: string; revenue: string; contactEmail: string; website: string; isVerified: boolean;
}

const INITIAL_DIRECTORY: Lead[] = [
     { id: "1", companyName: "CloudScale AI", industry: "SaaS", employees: "50-200", location: "San Francisco, CA", revenue: "$10M - $50M", contactEmail: "founders@cloudscale.ai", website: "cloudscale.ai", isVerified: true },
     { id: "2", companyName: "FinFlow Solutions", industry: "FinTech", employees: "20-50", location: "New York, NY", revenue: "$5M - $10M", contactEmail: "sales@finflow.io", website: "finflow.io", isVerified: true },
     { id: "3", companyName: "MediPulse Tech", industry: "HealthTech", employees: "100-500", location: "Boston, MA", revenue: "$20M - $100M", contactEmail: "contact@medipulse.com", website: "medipulse.com", isVerified: false },
     { id: "4", companyName: "OmniCart Global", industry: "E-Commerce", employees: "10-50", location: "Austin, TX", revenue: "$2M - $5M", contactEmail: "growth@omnicart.com", website: "omnicart.com", isVerified: true },
     { id: "5", companyName: "DataShield Security", industry: "SaaS", employees: "200-500", location: "Seattle, WA", revenue: "$50M+", contactEmail: "security@datashield.net", website: "datashield.net", isVerified: true },
     { id: "6", companyName: "PayStream Systems", industry: "FinTech", employees: "10-20", location: "Chicago, IL", revenue: "$1M - $5M", contactEmail: "hello@paystream.co", website: "paystream.co", isVerified: false }
];

export default function B2BLeadScraper() {
     const [searchQuery, setSearchQuery] = useState<string>("");
     const [selectedIndustry, setSelectedIndustry] = useState<string>("All");
     const [selectedSize, setSelectedSize] = useState<string>("All");
     const [selectedLocation, setSelectedLocation] = useState<string>("All");

     const [savedLeadIds, setSavedLeadIds] = useLocalStorage<string[]>("toollok_saved_leads", []);
     const [leadNotes, setLeadNotes] = useLocalStorage<Record<string, string>>("toollok_lead_notes", {});
     const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
     const [tempNoteText, setTempNoteText] = useState<string>("");

     const { isCopied, copy } = useCopyToClipboard(2000);

     const filteredLeads = useMemo(() => {
          return INITIAL_DIRECTORY.filter(lead => {
               const matchesSearch = lead.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    lead.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    lead.location.toLowerCase().includes(searchQuery.toLowerCase());
               const matchesIndustry = selectedIndustry === "All" || lead.industry === selectedIndustry;
               const matchesSize = selectedSize === "All" || lead.employees === selectedSize;
               const matchesLocation = selectedLocation === "All" || lead.location.includes(selectedLocation);
               return matchesSearch && matchesIndustry && matchesSize && matchesLocation;
          });
     }, [searchQuery, selectedIndustry, selectedSize, selectedLocation]);

     const toggleSaveLead = (id: string) => {
          if (savedLeadIds.includes(id)) {
               setSavedLeadIds(savedLeadIds.filter(item => item !== id));
          } else {
               setSavedLeadIds([...savedLeadIds, id]);
          }
     };

     const saveNote = (id: string) => {
          setLeadNotes({ ...leadNotes, [id]: tempNoteText });
          setActiveNoteId(null);
     };

     const copyCrmFormat = (lead: Lead) => {
          const note = leadNotes[lead.id] ? `\nNotes: ${leadNotes[lead.id]}` : "";
          const text = `Company: ${lead.companyName}\nIndustry: ${lead.industry}\nEmail: ${lead.contactEmail}\nLocation: ${lead.location}${note}`;
          copy(text);
     };

     const exportCsv = () => {
          const targets = INITIAL_DIRECTORY.filter(l => savedLeadIds.includes(l.id));
          const exportList = targets.length > 0 ? targets : filteredLeads;
          let csv = "CompanyName,Industry,Employees,Location,Revenue,ContactEmail,Website,Notes\n";
          exportList.forEach(l => {
               const note = leadNotes[l.id] ? leadNotes[l.id].replace(/"/g, '""') : "";
               csv += `"${l.companyName}","${l.industry}","${l.employees}","${l.location}","${l.revenue}","${l.contactEmail}","${l.website}","${note}"\n`;
          });
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", "toollok_b2b_leads.csv");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
     };

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">

               <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-500/20">
                              <Building size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">B2B Lead Directory & Prospect Finder (Demo)</h2>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Search, filter, add notes, and export targeted B2B company leads and directory profiles.</p>
                         </div>
                    </div>

                    <button
                         onClick={exportCsv}
                         className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md dark:shadow-lg dark:shadow-cyan-600/25"
                    >
                         <Download size={16} /> Export CSV ({savedLeadIds.length > 0 ? `${savedLeadIds.length} Saved` : `${filteredLeads.length} Filtered`})
                    </button>
               </div>

               <AdSlot adSlot="top-leads-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl grid grid-cols-1 md:grid-cols-4 gap-4 transition-colors">
                    <div>
                         <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">Search Companies</label>
                         <div className="relative">
                              <Search size={16} className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500" />
                              <input
                                   type="text"
                                   value={searchQuery}
                                   onChange={(e) => setSearchQuery(e.target.value)}
                                   placeholder="Search name, industry..."
                                   className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-cyan-500 transition-colors"
                              />
                         </div>
                    </div>

                    <div>
                         <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">Industry Filter</label>
                         <select value={selectedIndustry} onChange={(e) => setSelectedIndustry(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 dark:text-white outline-none transition-colors">
                              <option value="All">All Industries</option>
                              <option value="SaaS">SaaS</option>
                              <option value="FinTech">FinTech</option>
                              <option value="HealthTech">HealthTech</option>
                              <option value="E-Commerce">E-Commerce</option>
                         </select>
                    </div>

                    <div>
                         <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">Company Size</label>
                         <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 dark:text-white outline-none transition-colors">
                              <option value="All">All Sizes</option>
                              <option value="10-20">10-20 employees</option>
                              <option value="20-50">20-50 employees</option>
                              <option value="50-200">50-200 employees</option>
                              <option value="200-500">200-500 employees</option>
                         </select>
                    </div>

                    <div>
                         <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">Location</label>
                         <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 dark:text-white outline-none transition-colors">
                              <option value="All">All Locations</option>
                              <option value="San Francisco">San Francisco, CA</option>
                              <option value="New York">New York, NY</option>
                              <option value="Boston">Boston, MA</option>
                              <option value="Austin">Austin, TX</option>
                              <option value="Seattle">Seattle, WA</option>
                         </select>
                    </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLeads.map((lead) => {
                         const isSaved = savedLeadIds.includes(lead.id);
                         const hasNote = leadNotes[lead.id];
                         const isEditingNote = activeNoteId === lead.id;

                         return (
                              <div key={lead.id} className="bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col justify-between gap-4 relative transition-colors">
                                   <div className="flex items-start justify-between">
                                        <div>
                                             <div className="flex items-center gap-2">
                                                  <span className="bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                                       {lead.industry}
                                                  </span>
                                                  {lead.isVerified && (
                                                       <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
                                                            <ShieldCheck size={12} /> Verified
                                                       </span>
                                                  )}
                                             </div>
                                             <h3 className="text-gray-900 dark:text-white font-bold text-lg mt-2">{lead.companyName}</h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                             <button onClick={() => copyCrmFormat(lead)} className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:text-gray-900 dark:hover:text-white transition-all" title="Copy CRM Format">
                                                  <Copy size={14} />
                                             </button>
                                             <button onClick={() => toggleSaveLead(lead.id)} className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${isSaved ? 'bg-cyan-600 text-white border-cyan-500 shadow-md dark:shadow-cyan-600/30' : 'bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:text-gray-900 dark:hover:text-white'}`} title="Bookmark Lead">
                                                  <Bookmark size={16} />
                                             </button>
                                        </div>
                                   </div>

                                   <div className="grid grid-cols-2 gap-3 text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-950 p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800/80 transition-colors">
                                        <div className="flex items-center gap-1.5">
                                             <Users size={14} className="text-cyan-600 dark:text-cyan-400" />
                                             <span>{lead.employees}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                             <DollarSign size={14} className="text-emerald-600 dark:text-emerald-400" />
                                             <span>{lead.revenue}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 col-span-2 pt-1 border-t border-gray-200 dark:border-gray-900">
                                             <MapPin size={14} className="text-rose-600 dark:text-rose-400 shrink-0" />
                                             <span className="truncate">{lead.location}</span>
                                        </div>
                                   </div>

                                   <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-100 dark:border-gray-800/60">
                                        <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">
                                             <span>Lead Notes</span>
                                             <button
                                                  onClick={() => {
                                                       setActiveNoteId(isEditingNote ? null : lead.id);
                                                       setTempNoteText(leadNotes[lead.id] || "");
                                                  }}
                                                  className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 lowercase"
                                             >
                                                  <Edit3 size={12} /> {isEditingNote ? "cancel" : hasNote ? "edit note" : "+ add note"}
                                             </button>
                                        </div>

                                        {isEditingNote ? (
                                             <div className="flex flex-col gap-2 mt-1">
                                                  <textarea
                                                       value={tempNoteText}
                                                       onChange={(e) => setTempNoteText(e.target.value)}
                                                       placeholder="Add private note..."
                                                       rows={2}
                                                       className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl p-2 text-xs text-gray-900 dark:text-white outline-none resize-none transition-colors"
                                                  />
                                                  <button onClick={() => saveNote(lead.id)} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-1.5 rounded-lg text-[10px]">
                                                       Save Note
                                                  </button>
                                             </div>
                                        ) : hasNote ? (
                                             <p className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-950/60 p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 italic transition-colors">
                                                  "{hasNote}"
                                             </p>
                                        ) : null}
                                   </div>

                                   <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800/60 text-xs font-mono">
                                        <a href={`mailto:${lead.contactEmail}`} className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1.5 truncate">
                                             <Mail size={14} /> {lead.contactEmail}
                                        </a>
                                        <a href={`https://${lead.website}`} target="_blank" rel="noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 transition-colors">
                                             <Globe size={14} /> {lead.website}
                                        </a>
                                   </div>
                              </div>
                         );
                    })}
               </div>

               {/* ========================================= */}
               {/* SEO CONTENT & FAQS */}
               {/* ========================================= */}
               <div className="mt-12 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm dark:shadow-none">
                    <div className="prose dark:prose-invert max-w-none">
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Free B2B Lead Directory & Prospect Finder</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              Effective sales outreach begins with accurate, targeted data. ToolLok's <strong>B2B Lead Scraper & Directory</strong> empowers sales teams to rapidly filter and locate high-quality prospects across industries like SaaS, FinTech, and HealthTech. By refining targets based on employee size and revenue, you can export perfectly formatted CSVs straight into your CRM. Explore more utilities in our <Link href="/categories/business-tools" className="text-cyan-600 dark:text-cyan-400 hover:underline">Business Tools</Link> section.
                         </p>
                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Optimize Your Sales Pipeline</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Instant CSV Exports:</strong> Select your target accounts and download a clean CSV file perfectly formatted for import into Salesforce, HubSpot, or Apollo.</li>
                              <li><strong>CRM Data Copying:</strong> Click a single button to copy a lead's vital information and personal notes in a structured plain-text format.</li>
                              <li><strong>Local Private Notes:</strong> Safely annotate prospect records with context. Notes are stored securely in your local browser cache, keeping your strategy private.</li>
                         </ul>
                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">How do I export leads to my CRM?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Click the bookmark icon on any lead card to save it to your local list. Once you have built your list, click the 'Export CSV' button to download a standardized file that can be imported directly into any major CRM platform.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Are my private lead notes secure?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Yes. Any notes you add to a company profile are stored locally on your device via `localStorage`. ToolLok does not send or save your prospect notes on our servers, ensuring your sales strategies remain confidential.</p>
                              </div>
                         </div>
                    </div>
                    <script
                         type="application/ld+json"
                         dangerouslySetInnerHTML={{
                              __html: JSON.stringify({
                                   "@context": "https://schema.org",
                                   "@type": "FAQPage",
                                   "mainEntity": [
                                        {
                                             "@type": "Question",
                                             "name": "How do I export leads to my CRM?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Bookmark any lead card to save it, then click Export CSV to download a standardized file for import into Salesforce, HubSpot, or Apollo." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "Are my private lead notes secure?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Yes. Any notes you add are stored locally on your device via localStorage. We do not transmit or save your notes on our servers." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-leads-ad" format="fluid" className="mt-4" />
          </div>
     );
}