import React, { useState, useEffect } from "react";
import { getMeetings } from "../services/meetingsApi";
import { FiCalendar, FiClock, FiMapPin, FiFileText, FiChevronRight, FiUsers, FiInfo, FiSearch, FiArchive } from "react-icons/fi";
import { format } from "date-fns";
import toast from "react-hot-toast";

const MeetingArchive = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const data = await getMeetings(activeTab);
      setMeetings(data);
    } catch (err) {
      toast.error("Failed to load meetings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [activeTab]);

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
    try {
      const [hours, minutes] = timeStr.split(':');
      const date = new Date();
      date.setHours(parseInt(hours));
      date.setMinutes(parseInt(minutes));
      return format(date, 'hh:mm a');
    } catch (e) {
      return timeStr;
    }
  };

  const filtered = meetings.filter(m => 
    m.title?.toLowerCase()?.includes(searchTerm?.toLowerCase()) || 
    m.description?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight text-premium">Meeting Archive</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Cooperative Governance & Minutes
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-2 border border-slate-100 shadow-sm flex gap-1 self-start">
         <button 
           onClick={() => setActiveTab("upcoming")}
           className={`px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'upcoming' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
         >
           Upcoming
         </button>
         <button 
           onClick={() => setActiveTab("past")}
           className={`px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'past' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
         >
           Minutes Archive
         </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-4">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            type="text"
            placeholder="Search meetings by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-20 text-center animate-pulse">
             <FiClock size={40} className="mx-auto text-slate-100 mb-4" />
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Loading Records...</p>
          </div>
        ) : filtered.length > 0 ? (
          filtered.map(meeting => (
            <div key={meeting.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col md:flex-row p-4 gap-8">
               <div className="md:w-48 h-48 bg-slate-50 rounded-[2rem] flex flex-col items-center justify-center border border-slate-100 relative overflow-hidden group-hover:bg-blue-600 transition-colors">
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 group-hover:bg-white/20 transition-colors"></div>
                  <span className="text-3xl font-black text-slate-800 group-hover:text-white transition-colors">{format(new Date(meeting.date), 'dd')}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-100 transition-colors">{format(new Date(meeting.date), 'MMMM yyyy')}</span>
                  <div className="mt-4 px-3 py-1 bg-white rounded-full text-[8px] font-black text-blue-600 uppercase tracking-widest border border-slate-100">
                     {meeting.status?.replace(/_/g, " ")}
                  </div>
               </div>

               <div className="flex-1 py-4 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-blue-100">
                        {meeting.type} Meeting
                     </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">{meeting.title}</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 line-clamp-2 italic">"{meeting.description}"</p>

                  <div className="mt-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="flex items-center gap-3 text-slate-400">
                        <div className="p-2 bg-slate-50 rounded-lg"><FiClock /></div>
                        <span className="text-[10px] font-black uppercase tracking-widest">{formatTime(meeting.time)}</span>
                     </div>
                     <div className="flex items-center gap-3 text-slate-400">
                        <div className="p-2 bg-slate-50 rounded-lg"><FiMapPin /></div>
                        <span className="text-[10px] font-black uppercase tracking-widest truncate">{meeting.location}</span>
                     </div>
                  </div>
               </div>

               <div className="md:w-64 border-l border-slate-50 pl-8 flex flex-col justify-center">
                  {meeting.minutes ? (
                    <div className="space-y-4">
                       <div className="flex items-center gap-2 text-emerald-600">
                          <FiFileText />
                          <span className="text-[10px] font-black uppercase tracking-widest">Minutes Recorded</span>
                       </div>
                       <button className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                          Read Minutes <FiChevronRight />
                       </button>
                    </div>
                  ) : meeting.status === 'completed' ? (
                    <div className="text-center p-4 bg-amber-50 rounded-2xl border border-amber-100 border-dashed">
                       <p className="text-[8px] font-black text-amber-700 uppercase tracking-widest">Awaiting Publication</p>
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-blue-50/50 rounded-2xl border border-blue-100 border-dashed">
                       <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest">No Minutes Yet</p>
                    </div>
                  )}
               </div>
            </div>
          ))
        ) : (
          <div className="py-28 bg-white rounded-[3rem] border border-slate-100 border-dashed text-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-100 mx-auto mb-6">
                <FiArchive size={40} />
             </div>
             <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.25em]">No Meetings Found</h3>
             <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest text-premium">There are no records matching your selection.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingArchive;
