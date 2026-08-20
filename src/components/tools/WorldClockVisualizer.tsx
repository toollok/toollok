"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Plus, X, Globe, Sun, Moon, Sunrise, CalendarClock, Sliders } from "lucide-react";
import AdSlot from "@/components/ui/AdSlot";

const POPULAR_ZONES = [
     { id: "America/Los_Angeles", label: "Pacific Time (PT) - San Francisco" },
     { id: "America/New_York", label: "Eastern Time (ET) - New York" },
     { id: "Europe/London", label: "British Summer Time (BST) - London" },
     { id: "Europe/Berlin", label: "Central European Time (CET) - Berlin" },
     { id: "Asia/Dubai", label: "Gulf Standard Time (GST) - Dubai" },
     { id: "Asia/Kolkata", label: "India Standard Time (IST) - India" },
     { id: "Asia/Singapore", label: "Singapore Time (SGT) - Singapore" },
     { id: "Asia/Tokyo", label: "Japan Standard Time (JST) - Tokyo" },
     { id: "Australia/Sydney", label: "Australian Eastern Time (AET) - Sydney" }
];

export default function WorldClockVisualizer() {
     const [localTimezone, setLocalTimezone] = useState("");
     const [selectedZones, setSelectedZones] = useState<string[]>([]);
     const [meetingHour, setMeetingHour] = useState(12);

     useEffect(() => {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          setLocalTimezone(tz);
          setSelectedZones([tz, "Europe/London", "Asia/Tokyo"]);
     }, []);

     const addZone = (e: React.ChangeEvent<HTMLSelectElement>) => {
          const zone = e.target.value;
          if (zone && !selectedZones.includes(zone)) {
               setSelectedZones([...selectedZones, zone]);
          }
          e.target.value = "";
     };

     const removeZone = (zoneToRemove: string) => {
          setSelectedZones(selectedZones.filter(z => z !== zoneToRemove));
     };

     const getZoneStatus = (ianaZone: string, localMeetingHour: number) => {
          if (!localTimezone) return null;

          const date = new Date();
          date.setHours(localMeetingHour, 0, 0, 0);

          const formatter = new Intl.DateTimeFormat("en-US", {
               timeZone: ianaZone,
               weekday: "short",
               hour: "numeric",
               minute: "2-digit",
               hour12: true,
          });

          const hour24Formatter = new Intl.DateTimeFormat("en-US", {
               timeZone: ianaZone,
               hour: "numeric",
               hour12: false,
          });

          const fullTimeString = formatter.format(date);
          const [weekday, timeString] = fullTimeString.split(", ");

          const targetHour24 = parseInt(hour24Formatter.format(date));

          let status = "working";
          let color = "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30";
          let icon = <Sun size={16} />;

          if (targetHour24 >= 22 || targetHour24 < 6) {
               status = "sleeping";
               color = "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30";
               icon = <Moon size={16} />;
          } else if ((targetHour24 >= 6 && targetHour24 < 8) || (targetHour24 >= 18 && targetHour24 < 22)) {
               status = "fringe hours";
               color = "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30";
               icon = <Sunrise size={16} />;
          }

          const city = ianaZone.split("/").pop()?.replace("_", " ") || ianaZone;

          return { city, timeString, weekday, targetHour24, status, color, icon };
     };

     const formatSliderTime = (hour: number) => {
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour % 12 === 0 ? 12 : hour % 12;
          return `${displayHour}:00 ${ampm}`;
     };

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                              <Globe size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">World Clock & Time Zone Visualizer</h2>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Drag the timeline slider to visually pinpoint the perfect meeting overlap across global teams.</p>
                         </div>
                    </div>
               </div>

               <AdSlot adSlot="top-clock-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2 print:hidden" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-4 flex flex-col gap-6">
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-6 shadow-sm dark:shadow-xl transition-colors">
                              <div className="space-y-3">
                                   <label className="text-sm font-bold text-gray-900 dark:text-gray-300 flex items-center gap-2">
                                        <Plus size={16} className="text-indigo-600 dark:text-indigo-400" /> Add Team Locations
                                   </label>
                                   <select
                                        onChange={addZone}
                                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-sm text-gray-900 dark:text-gray-300 focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
                                        defaultValue=""
                                   >
                                        <option value="" disabled>Select a timezone...</option>
                                        {POPULAR_ZONES.map(z => (
                                             <option key={z.id} value={z.id}>{z.label}</option>
                                        ))}
                                   </select>
                              </div>

                              <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                                   <label className="text-sm font-bold text-gray-900 dark:text-gray-300 flex items-center gap-2">
                                        <Clock size={16} className="text-cyan-600 dark:text-cyan-400" /> Active Workspaces
                                   </label>
                                   <div className="flex flex-col gap-2">
                                        {selectedZones.map(zone => {
                                             const city = zone.split("/").pop()?.replace("_", " ");
                                             return (
                                                  <div key={zone} className="flex items-center justify-between bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-3 transition-colors">
                                                       <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-gray-900 dark:text-gray-200">{city}</span>
                                                            <span className="text-[10px] text-gray-500 dark:text-gray-500 font-mono">{zone}</span>
                                                       </div>
                                                       {zone !== localTimezone && (
                                                            <button onClick={() => removeZone(zone)} className="text-gray-400 dark:text-gray-600 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                                                                 <X size={14} />
                                                            </button>
                                                       )}
                                                  </div>
                                             )
                                        })}
                                        {selectedZones.length === 0 && (
                                             <div className="text-xs text-gray-500 text-center py-4 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors">
                                                  No locations added yet.
                                             </div>
                                        )}
                                   </div>
                              </div>
                         </div>
                    </div>

                    <div className="lg:col-span-8 flex flex-col gap-6">
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-6 shadow-sm dark:shadow-xl transition-colors">
                              <div className="flex items-center justify-between">
                                   <label className="text-sm font-bold text-gray-900 dark:text-gray-300 flex items-center gap-2">
                                        <Sliders size={16} className="text-emerald-600 dark:text-emerald-400" /> Scrub Local Meeting Time
                                   </label>
                                   <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-sm font-bold font-mono transition-colors">
                                        {formatSliderTime(meetingHour)} (Your Time)
                                   </div>
                              </div>

                              <input
                                   type="range"
                                   min="0" max="23" step="1"
                                   value={meetingHour}
                                   onChange={(e) => setMeetingHour(Number(e.target.value))}
                                   className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                              />

                              <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-500 font-bold uppercase tracking-wider px-1">
                                   <span>Midnight</span><span>Noon</span><span>11 PM</span>
                              </div>
                         </div>

                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 overflow-hidden flex flex-col flex-grow shadow-sm dark:shadow-xl transition-colors">
                              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-300 flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-800/50">
                                   <CalendarClock size={16} className="text-indigo-600 dark:text-indigo-400" /> Projected Global Overlap
                              </h3>

                              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                   {selectedZones.map(zone => {
                                        const data = getZoneStatus(zone, meetingHour);
                                        if (!data) return null;

                                        return (
                                             <div key={zone} className={`p-4 rounded-xl border flex flex-col justify-center gap-2 transition-all shadow-sm dark:shadow-none ${data.color}`}>
                                                  <div className="flex items-center justify-between">
                                                       <span className="text-sm font-black">{data.city}</span>
                                                       {data.icon}
                                                  </div>
                                                  <div className="flex items-end justify-between mt-1">
                                                       <div className="flex items-baseline gap-2">
                                                            <span className="text-2xl font-black font-mono">{data.timeString}</span>
                                                            <span className="text-xs font-bold opacity-80">{data.weekday}</span>
                                                       </div>
                                                       <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">{data.status}</span>
                                                  </div>
                                             </div>
                                        );
                                   })}
                              </div>
                         </div>
                    </div>
               </div>

               {/* ========================================= */}
               {/* SEO CONTENT & FAQS */}
               {/* ========================================= */}
               <div className="mt-12 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm dark:shadow-none">
                    <div className="prose dark:prose-invert max-w-none">
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">World Clock & Global Time Zone Visualizer</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              Scheduling meetings across continents shouldn't require mental gymnastics. ToolLok's <strong>World Clock Visualizer</strong> allows remote teams and digital nomads to instantly spot overlapping business hours. Simply select the cities of your coworkers and drag the slider to find a time where nobody has to wake up at 3 AM. Combine this visualizer with our <Link href="/categories/productivity-tools" className="text-indigo-600 dark:text-indigo-400 hover:underline">Productivity Tools</Link> to streamline your international communication.
                         </p>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Key Features</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Interactive Scrubbing:</strong> Drag the time slider to instantly simulate time zone shifts globally without reloading the page.</li>
                              <li><strong>Status Heat-Mapping:</strong> Time zones automatically color-code into Green (Working Hours), Yellow (Fringe Hours), and Red (Sleeping Hours) to quickly highlight acceptable overlap windows.</li>
                              <li><strong>Zero-Upload Privacy:</strong> All time calculations are handled via your browser's native JavaScript `Intl.DateTimeFormat` API, meaning your geographical searches remain entirely private.</li>
                         </ul>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">How do time zones handle Daylight Saving Time (DST)?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Our visualizer utilizes standard IANA time zone databases which automatically adjust for Daylight Saving Time rules natively within your browser, ensuring extreme accuracy no matter what time of year it is.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">What are "Fringe Hours"?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">Fringe Hours are defined as early mornings (6 AM - 8 AM) and evenings (6 PM - 10 PM). While not standard working hours, these are typically acceptable times to schedule urgent cross-continental meetings.</p>
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
                                             "name": "How do time zones handle Daylight Saving Time (DST)?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "The visualizer uses standard IANA time zone databases to automatically adjust for Daylight Saving Time rules directly in your browser." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "What are 'Fringe Hours'?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Fringe Hours are early mornings and evenings. They aren't standard working hours but are generally acceptable for urgent cross-continental meetings." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-clock-ad" format="fluid" className="mt-4 print:hidden" />
          </div>
     );
}