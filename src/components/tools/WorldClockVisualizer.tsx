"use client";

import { useState, useEffect } from "react";
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
     const [meetingHour, setMeetingHour] = useState(12); // 0 to 23

     // Initialize local timezone on mount
     useEffect(() => {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          setLocalTimezone(tz);
          setSelectedZones([tz, "Europe/London", "Asia/Tokyo"]); // Default starting zones
     }, []);

     const addZone = (e: React.ChangeEvent<HTMLSelectElement>) => {
          const zone = e.target.value;
          if (zone && !selectedZones.includes(zone)) {
               setSelectedZones([...selectedZones, zone]);
          }
          e.target.value = ""; // Reset dropdown
     };

     const removeZone = (zoneToRemove: string) => {
          setSelectedZones(selectedZones.filter(z => z !== zoneToRemove));
     };

     // Helper to format time, determine weekday offset, and status
     const getZoneStatus = (ianaZone: string, localMeetingHour: number) => {
          if (!localTimezone) return null;

          // Create a date object set to today at the selected local hour
          const date = new Date();
          date.setHours(localMeetingHour, 0, 0, 0);

          // Get the hour and weekday in the target timezone
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

          // Format splits into ["Mon", "2:00 PM"]
          const fullTimeString = formatter.format(date);
          const [weekday, timeString] = fullTimeString.split(", ");

          const targetHour24 = parseInt(hour24Formatter.format(date));

          // Determine Status (Working: 8-17, Evening/Morning: 6-7 & 18-21, Sleep: 22-5)
          let status = "working";
          let color = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
          let icon = <Sun size={16} />;

          if (targetHour24 >= 22 || targetHour24 < 6) {
               status = "sleeping";
               color = "text-rose-400 bg-rose-500/10 border-rose-500/30";
               icon = <Moon size={16} />;
          } else if ((targetHour24 >= 6 && targetHour24 < 8) || (targetHour24 >= 18 && targetHour24 < 22)) {
               status = "fringe hours";
               color = "text-amber-400 bg-amber-500/10 border-amber-500/30";
               icon = <Sunrise size={16} />;
          }

          // Extract City Name
          const city = ianaZone.split("/").pop()?.replace("_", " ") || ianaZone;

          return { city, timeString, weekday, targetHour24, status, color, icon };
     };

     // Format the slider label
     const formatSliderTime = (hour: number) => {
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour % 12 === 0 ? 12 : hour % 12;
          return `${displayHour}:00 ${ampm}`;
     };

     return (
          <div className="w-full flex flex-col gap-6">

               {/* Header Section */}
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                              <Globe size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-white">World Clock & Time Zone Visualizer</h2>
                                   <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-400">Drag the timeline slider to visually pinpoint the perfect meeting overlap across global teams.</p>
                         </div>
                    </div>
               </div>

               {/* Top Ad Banner */}
               <AdSlot adSlot="top-clock-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2 print:hidden" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* LEFT COLUMN: Controls (Span 4) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">

                         <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-6 shadow-xl">
                              <div className="space-y-3">
                                   <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                        <Plus size={16} className="text-indigo-400" /> Add Team Locations
                                   </label>
                                   <select
                                        onChange={addZone}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
                                        defaultValue=""
                                   >
                                        <option value="" disabled>Select a timezone...</option>
                                        {POPULAR_ZONES.map(z => (
                                             <option key={z.id} value={z.id}>{z.label}</option>
                                        ))}
                                   </select>
                              </div>

                              <div className="space-y-3 pt-2 border-t border-gray-800">
                                   <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                        <Clock size={16} className="text-cyan-400" /> Active Workspaces
                                   </label>
                                   <div className="flex flex-col gap-2">
                                        {selectedZones.map(zone => {
                                             const city = zone.split("/").pop()?.replace("_", " ");
                                             return (
                                                  <div key={zone} className="flex items-center justify-between bg-gray-950 border border-gray-800 rounded-xl p-3">
                                                       <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-gray-200">{city}</span>
                                                            <span className="text-[10px] text-gray-500 font-mono">{zone}</span>
                                                       </div>
                                                       {zone !== localTimezone && (
                                                            <button onClick={() => removeZone(zone)} className="text-gray-600 hover:text-rose-400 transition-colors">
                                                                 <X size={14} />
                                                            </button>
                                                       )}
                                                  </div>
                                             )
                                        })}
                                        {selectedZones.length === 0 && (
                                             <div className="text-xs text-gray-500 text-center py-4 bg-gray-950 rounded-xl border border-gray-800">
                                                  No locations added yet.
                                             </div>
                                        )}
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* RIGHT COLUMN: Interactive Scrubber & Visualizer (Span 8) */}
                    <div className="lg:col-span-8 flex flex-col gap-6">

                         {/* Time Scrubber */}
                         <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-6 shadow-xl">
                              <div className="flex items-center justify-between">
                                   <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                        <Sliders size={16} className="text-emerald-400" /> Scrub Local Meeting Time
                                   </label>
                                   <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg text-sm font-bold font-mono">
                                        {formatSliderTime(meetingHour)} (Your Time)
                                   </div>
                              </div>

                              <input
                                   type="range"
                                   min="0" max="23" step="1"
                                   value={meetingHour}
                                   onChange={(e) => setMeetingHour(Number(e.target.value))}
                                   className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                              />

                              <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider px-1">
                                   <span>Midnight</span>
                                   <span>Noon</span>
                                   <span>11 PM</span>
                              </div>
                         </div>

                         {/* Overlap Results */}
                         <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 overflow-hidden flex flex-col flex-grow shadow-xl">
                              <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2 pb-4 border-b border-gray-800/50">
                                   <CalendarClock size={16} className="text-indigo-400" /> Projected Global Overlap
                              </h3>

                              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                   {selectedZones.map(zone => {
                                        const data = getZoneStatus(zone, meetingHour);
                                        if (!data) return null;

                                        return (
                                             <div key={zone} className={`p-4 rounded-xl border flex flex-col justify-center gap-2 transition-all ${data.color}`}>
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

               {/* Bottom Ad Banner */}
               <AdSlot adSlot="bottom-clock-ad" format="fluid" className="mt-4 print:hidden" />

          </div>
     );
}