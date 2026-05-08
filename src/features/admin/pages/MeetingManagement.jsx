import React, { useState, useEffect } from "react";
import { getMeetings, scheduleMeeting, recordMeetingMinutes, cancelMeeting } from "../../meetings/services/meetingsApi";
import { FiCalendar, FiPlus, FiFileText, FiXCircle, FiCheckCircle, FiClock, FiMapPin, FiUsers, FiInfo, FiActivity, FiArchive } from "react-icons/fi";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useConfirm } from "../../../contexts/ConfirmationContext";

const MeetingManagement = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const confirm = useConfirm();
  
  // Schedule Form State
  const [formData, setFormData] = useState({
    title: "", description: "", type: "general", date: "", time: "", location: ""
  });

  // Minutes Form State
  const [minuteData, setMinuteData] = useState({
    content: "", attendanceCount: 0, fileUrl: ""
  });

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const data = await getMeetings();
      setMeetings(data);
    } catch (err) {
      toast.error("Failed to load meetings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleSchedule = async (e) => {
    e.preventDefault();
    try {
      await scheduleMeeting(formData);
      toast.success("Meeting scheduled & members notified!");
      setShowScheduleForm(false);
      setFormData({ title: "", description: "", type: "general", date: "", time: "", location: "" });
      fetchMeetings();
    } catch (err) {
      toast.error("Failed to schedule meeting");
    }
  };

  const handleRecordMinutes = async (e) => {
    e.preventDefault();
    try {
      await recordMeetingMinutes(selectedMeeting.id, minuteData);
      toast.success("Minutes recorded and meeting finalized");
      setIsRecording(false);
      setSelectedMeeting(null);
      setMinuteData({ content: "", attendanceCount: 0, fileUrl: "" });
      fetchMeetings();
    } catch (err) {
      toast.error("Failed to record minutes");
    }
  };

  const handleCancel = async (id) => {
    const isConfirmed = await confirm({
      title: "Cancel Meeting",
      message: "Are you sure you want to cancel this meeting? Members will be notified and this event will be removed from the calendar.",
      type: "danger",
      confirmLabel: "Cancel Meeting"
    });

    if (!isConfirmed) return;
    try {
      await cancelMeeting(id);
      toast.success("Meeting cancelled");
      fetchMeetings();
    } catch (err) {
      toast.error("Action failed");
    }
  };

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

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight text-premium">Governance Management</h1>
          <p className="text-slate-500 font-medium leading-relaxed uppercase tracking-[0.2em] text-[10px] mt-1">Schedule meetings and archive official minutes</p>
        </div>
        <button 
          onClick={() => setShowScheduleForm(true)}
          className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all shadow-xl shadow-slate-200"
        >
           <FiPlus /> New Meeting
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {[
           { label: "Scheduled", count: meetings.filter(m => m.status === 'scheduled').length, color: "blue", icon: <FiCalendar /> },
           { label: "Completed", count: meetings.filter(m => m.status === 'completed').length, color: "emerald", icon: <FiCheckCircle /> },
           { label: "Minutes Pending", count: meetings.filter(m => m.status === 'completed' && !m.minutes).length, color: "amber", icon: <FiFileText /> },
           { label: "Total Archeived", count: meetings.length, color: "purple", icon: <FiArchive /> },
         ].map((s, i) => (
           <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <FiActivity size={40} />
             </div>
             <div className={`w-10 h-10 rounded-xl bg-${s.color}-50 text-${s.color}-600 flex items-center justify-center mb-4`}>{s.icon}</div>
             <h3 className="text-2xl font-black text-slate-800 mb-1">{s.count}</h3>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{s.label}</p>
           </div>
         ))}
      </div>

      {showScheduleForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
              <form onSubmit={handleSchedule}>
                 <div className="sticky top-0 bg-white px-8 py-6 border-b border-slate-50 flex items-center justify-between z-10">
                    <div>
                       <h2 className="text-xl font-black text-slate-800">Schedule Meeting</h2>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 tracking-tighter">Official Cooperative Gathering</p>
                    </div>
                    <button onClick={() => setShowScheduleForm(false)} className="text-slate-400 hover:text-slate-600"><FiXCircle size={24} /></button>
                 </div>
                 <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                       <input 
                         required
                         className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10"
                         value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                         placeholder="e.g. Q1 General Assembly"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                       <select 
                         className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10"
                         value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                       >
                          <option value="general">General</option>
                          <option value="executive">Executive</option>
                          <option value="emergency">Emergency</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                       <input 
                         type="date" required
                         min={new Date().toISOString().split("T")[0]}
                         className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none"
                         value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time</label>
                       <input 
                         type="time" required
                         className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none"
                         value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                       <input 
                         placeholder="Hall A or Zoom Link" required
                         className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none"
                         value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                       />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                       <textarea 
                         className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none resize-none" rows="3"
                         value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                         placeholder="Provide brief details about the agenda..."
                       ></textarea>
                    </div>
                 </div>
                 <div className="p-8 pt-0 flex gap-4">
                    <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-100">Schedule & Broadcast</button>
                    <button type="button" onClick={() => setShowScheduleForm(false)} className="px-10 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest">Discard</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {isRecording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-xl animate-in fade-in">
           <div className="bg-slate-900 rounded-[3rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-3xl text-white p-12 relative border border-white/10">
              <div className="flex justify-between items-start mb-12">
                 <div>
                    <h2 className="text-2xl font-black mb-2 flex items-center gap-3">
                       <FiFileText className="text-blue-400" /> Archiving: {selectedMeeting?.title}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Official Minute Recording</p>
                 </div>
                 <button onClick={() => {setIsRecording(false); setSelectedMeeting(null);}} className="text-slate-500 hover:text-white transition-colors"><FiXCircle size={32} /></button>
              </div>

              <form onSubmit={handleRecordMinutes} className="space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.25em] ml-1">Meeting Content / Executive Summary</label>
                    <textarea 
                      required rows="8"
                      className="w-full px-6 py-6 bg-white/5 border border-white/10 rounded-[2rem] text-sm font-medium text-blue-100 outline-none focus:border-blue-500/50 transition-all resize-none shadow-inner"
                      placeholder="Detail the decisions, motions, and discussions..."
                      value={minuteData.content} onChange={e => setMinuteData({...minuteData, content: e.target.value})}
                    ></textarea>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.25em] ml-1">Attendance Count</label>
                       <div className="relative">
                          <FiUsers className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input 
                            type="text"
                            inputMode="numeric"
                            required
                            className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-sm font-black text-white outline-none"
                            value={minuteData.attendanceCount} 
                            onChange={e => {
                              const val = parseFloat(e.target.value);
                              setMinuteData({...minuteData, attendanceCount: isNaN(val) ? e.target.value : Math.ceil(val)});
                            }}
                          />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.25em] ml-1">Document Link (PDF)</label>
                       <div className="relative">
                          <FiInfo className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input 
                            className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium text-white outline-none"
                            placeholder="Optional PDF URL"
                            value={minuteData.fileUrl} onChange={e => setMinuteData({...minuteData, fileUrl: e.target.value})}
                          />
                       </div>
                    </div>
                 </div>
                 <button type="submit" className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-blue-900/40 border border-blue-400/20">
                    Finalize Meeting & Publish Minutes
                 </button>
              </form>
           </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Date & Meeting</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Type</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {meetings.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400 border border-white ring-4 ring-slate-50">
                                <span className="text-xs font-black leading-none">{format(new Date(m.date), 'dd')}</span>
                                <span className="text-[7px] font-black uppercase tracking-tighter">{format(new Date(m.date), 'MMM')}</span>
                             </div>
                             <div>
                                <h4 className="text-xs font-black text-slate-800 leading-tight mb-1">{m.title}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5 line-clamp-1 truncate max-w-[200px]">
                                   <FiClock size={10} className="text-blue-500" /> {formatTime(m.time)} • <FiMapPin size={10} className="text-emerald-500" /> {m.location}
                                </p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-xl text-[8px] font-black uppercase tracking-widest border border-slate-200">
                             {m.type}
                          </span>
                       </td>
                       <td className="px-8 py-6 uppercase tracking-widest text-[8px] font-black">
                         {m.status === 'scheduled' ? <span className="text-blue-600">Upcoming</span> : 
                          m.status === 'completed' ? <span className="text-emerald-600">Completed</span> : 
                          <span className="text-red-600">Cancelled</span>}
                       </td>
                       <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                             {m.status === 'scheduled' && (
                               <>
                                 <button 
                                   onClick={() => {setSelectedMeeting(m); setIsRecording(true);}}
                                   className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all border border-blue-100" title="Record Minutes"
                                 >
                                    <FiFileText size={16} />
                                 </button>
                                 <button 
                                   onClick={() => handleCancel(m.id)}
                                   className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-100" title="Cancel Meeting"
                                 >
                                    <FiXCircle size={16} />
                                 </button>
                               </>
                             )}
                             {m.status === 'completed' && !m.minutes && (
                               <button 
                                 onClick={() => {setSelectedMeeting(m); setIsRecording(true);}}
                                 className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100 hover:bg-amber-600 hover:text-white transition-all"
                               >
                                  Record Minutes
                               </button>
                             )}
                             {m.minutes && (
                               <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-1">
                                  <FiCheckCircle /> Archived
                               </span>
                             )}
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default MeetingManagement;
