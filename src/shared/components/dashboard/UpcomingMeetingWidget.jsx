import React, { useState, useEffect } from "react";
import { getMeetings } from "../../../features/meetings/services/meetingsApi";
import { FiCalendar, FiClock, FiMapPin, FiChevronRight, FiAlertCircle } from "react-icons/fi";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const UpcomingMeetingWidget = () => {
  const [nextMeeting, setNextMeeting] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNext = async () => {
      try {
        const meetings = await getMeetings("upcoming");
        if (meetings && meetings.length > 0) {
          setNextMeeting(meetings[0]); // Get the soonest one
        }
      } catch (err) {
        console.error("Failed to fetch upcoming meeting for widget", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNext();
  }, []);

  if (loading) return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 animate-pulse">
       <div className="h-4 bg-gray-100 rounded w-1/3 mb-4"></div>
       <div className="h-10 bg-gray-50 rounded w-full"></div>
    </div>
  );

  if (!nextMeeting) return (
    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[300px] group transition-all hover:shadow-md">
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-6 group-hover:scale-110 transition-transform duration-500">
        <FiCalendar size={32} />
      </div>
      <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] mb-3">No Upcoming Meetings</h3>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed max-w-[200px]">
        Your schedule is currently clear. Any newly scheduled meetings will appear here.
      </p>
      <Link 
        to="/meetings" 
        className="mt-8 flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] hover:gap-3 transition-all"
      >
        View Archive <FiChevronRight />
      </Link>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-500">
         <FiCalendar size={80} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
           <span className="px-2 py-0.5 bg-white/20 rounded text-[8px] font-black uppercase tracking-widest">Upcoming Meeting</span>
           <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
        </div>
        
        <h3 className="text-xl font-black mb-4 line-clamp-1">{nextMeeting.title}</h3>
        
        <div className="flex flex-col gap-3 mb-6">
           <div className="flex items-center gap-3 text-blue-100">
              <FiCalendar className="text-blue-300" />
              <span className="text-xs font-bold uppercase tracking-widest leading-none">
                 {format(new Date(nextMeeting.date), 'EEEE, MMMM do')}
              </span>
           </div>
           <div className="flex items-center gap-3 text-blue-100">
              <FiClock className="text-blue-300" />
              <span className="text-xs font-bold uppercase tracking-widest leading-none">{nextMeeting.time}</span>
           </div>
           <div className="flex items-center gap-3 text-blue-100">
              <FiMapPin className="text-blue-300" />
              <span className="text-xs font-bold uppercase tracking-widest leading-none truncate">{nextMeeting.location}</span>
           </div>
        </div>

        <Link 
          to="/meetings"
          className="w-full py-4 bg-white text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors shadow-lg"
        >
           View Agenda <FiChevronRight />
        </Link>
      </div>
    </div>
  );
};

export default UpcomingMeetingWidget;
