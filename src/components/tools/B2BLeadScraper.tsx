"use client";

import { useState, useMemo } from "react";
import { Building, Search, Download, Bookmark, Check, Filter, Globe, Mail, MapPin, Users, DollarSign, Edit3, Copy, ShieldCheck } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import AdSlot from "@/components/ui/AdSlot";

interface Lead {
     id: string;
     companyName: string;
     industry: string;
     employees: string;
     location: string;
     revenue: string;
     contactEmail: string;
     website: string;
     isVerified: boolean;
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

               {/* Header Section */}
               <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                              <Building size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-white">B2B Lead Directory & Prospect Finder (Demo)</h2>
                                   <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-400">Search, filter, add notes, and export targeted B2B company leads and directory profiles.</p>
                         </div>
                    </div>

                    <button
                         onClick={exportCsv}
                         className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-cyan-600/25"
                    >
                         <Download size={16} /> Export CSV ({savedLeadIds.length > 0 ? `${savedLeadIds.length} Saved` : `${filteredLeads.length} Filtered`})
                    </button>
               </div>

               {/* Top Ad Banner */}
               <AdSlot adSlot="top-leads-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               {/* Advanced Filters Bar */}
               <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                         <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Search Companies</label>
                         <div className="relative">
                              <Search size={16} className="absolute left-3.5 top-3 text-gray-500" />
                              <input
                                   type="text"
                                   value={searchQuery}
                                   onChange={(e) => setSearchQuery(e.target.value)}
                                   placeholder="Search name, industry..."
                                   className="w-full bg-gray-950 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500"
                              />
                         </div>
                    </div>

                    <div>
                         <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Industry Filter</label>
                         <select
                              value={selectedIndustry}
                              onChange={(e) => setSelectedIndustry(e.target.value)}
                              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2.5 text-xs font-bold text-white outline-none"
                         >
                              <option value="All">All Industries</option>
                              <option value="SaaS">SaaS</option>
                              <option value="FinTech">FinTech</option>
                              <option value="HealthTech">HealthTech</option>
                              <option value="E-Commerce">E-Commerce</option>
                         </select>
                    </div>

                    <div>
                         <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Company Size</label>
                         <select
                              value={selectedSize}
                              onChange={(e) => setSelectedSize(e.target.value)}
                              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2.5 text-xs font-bold text-white outline-none"
                         >
                              <option value="All">All Sizes</option>
                              <option value="10-20">10-20 employees</option>
                              <option value="20-50">20-50 employees</option>
                              <option value="50-200">50-200 employees</option>
                              <option value="200-500">200-500 employees</option>
                         </select>
                    </div>

                    <div>
                         <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Location</label>
                         <select
                              value={selectedLocation}
                              onChange={(e) => setSelectedLocation(e.target.value)}
                              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2.5 text-xs font-bold text-white outline-none"
                         >
                              <option value="All">All Locations</option>
                              <option value="San Francisco">San Francisco, CA</option>
                              <option value="New York">New York, NY</option>
                              <option value="Boston">Boston, MA</option>
                              <option value="Austin">Austin, TX</option>
                              <option value="Seattle">Seattle, WA</option>
                         </select>
                    </div>
               </div>

               {/* Leads Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLeads.map((lead) => {
                         const isSaved = savedLeadIds.includes(lead.id);
                         const hasNote = leadNotes[lead.id];
                         const isEditingNote = activeNoteId === lead.id;

                         return (
                              <div key={lead.id} className="bg-[#0c121e] border border-gray-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between gap-4 relative">
                                   <div className="flex items-start justify-between">
                                        <div>
                                             <div className="flex items-center gap-2">
                                                  <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                                       {lead.industry}
                                                  </span>
                                                  {lead.isVerified && (
                                                       <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                                                            <ShieldCheck size={12} /> Verified
                                                       </span>
                                                  )}
                                             </div>
                                             <h3 className="text-white font-bold text-lg mt-2">{lead.companyName}</h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                             <button
                                                  onClick={() => copyCrmFormat(lead)}
                                                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-900 text-gray-400 border border-gray-800 hover:text-white transition-all"
                                                  title="Copy CRM Format"
                                             >
                                                  <Copy size={14} />
                                             </button>
                                             <button
                                                  onClick={() => toggleSaveLead(lead.id)}
                                                  className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${isSaved ? 'bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-600/30' : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'}`}
                                                  title="Bookmark Lead"
                                             >
                                                  <Bookmark size={16} />
                                             </button>
                                        </div>
                                   </div>

                                   <div className="grid grid-cols-2 gap-3 text-xs font-mono text-gray-300 bg-gray-950 p-3.5 rounded-2xl border border-gray-800/80">
                                        <div className="flex items-center gap-1.5">
                                             <Users size={14} className="text-cyan-400" />
                                             <span>{lead.employees}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                             <DollarSign size={14} className="text-emerald-400" />
                                             <span>{lead.revenue}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 col-span-2 pt-1 border-t border-gray-900">
                                             <MapPin size={14} className="text-rose-400 shrink-0" />
                                             <span className="truncate">{lead.location}</span>
                                        </div>
                                   </div>

                                   {/* Custom Note Section */}
                                   <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-800/60">
                                        <div className="flex items-center justify-between text-[10px] text-gray-400 uppercase font-bold">
                                             <span>Lead Notes</span>
                                             <button
                                                  onClick={() => {
                                                       setActiveNoteId(isEditingNote ? null : lead.id);
                                                       setTempNoteText(leadNotes[lead.id] || "");
                                                  }}
                                                  className="text-cyan-400 hover:underline flex items-center gap-1 lowercase"
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
                                                       className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2 text-xs text-white outline-none resize-none"
                                                  />
                                                  <button
                                                       onClick={() => saveNote(lead.id)}
                                                       className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-1.5 rounded-lg text-[10px]"
                                                  >
                                                       Save Note
                                                  </button>
                                             </div>
                                        ) : hasNote ? (
                                             <p className="text-xs text-gray-300 bg-gray-950/60 p-2.5 rounded-xl border border-gray-800 italic">
                                                  "{hasNote}"
                                             </p>
                                        ) : null}
                                   </div>

                                   <div className="flex items-center justify-between pt-2 border-t border-gray-800/60 text-xs font-mono">
                                        <a href={`mailto:${lead.contactEmail}`} className="text-cyan-400 hover:underline flex items-center gap-1.5 truncate">
                                             <Mail size={14} /> {lead.contactEmail}
                                        </a>
                                        <a href={`https://${lead.website}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white flex items-center gap-1">
                                             <Globe size={14} /> {lead.website}
                                        </a>
                                   </div>
                              </div>
                         );
                    })}
               </div>

               {/* Bottom In-Feed Ad Banner */}
               <AdSlot adSlot="bottom-leads-ad" format="fluid" className="mt-4" />

          </div>
     );
}