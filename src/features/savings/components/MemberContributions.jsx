import React, { useState, useEffect } from "react";
import { getMyContributions } from "../services/contributionsApi";
import { getPublicSettings } from "../../admin/services/settingsApi";
import { FiCheckCircle, FiClock, FiAlertCircle, FiCalendar, FiInfo } from "react-icons/fi";
import { format, parseISO } from "date-fns";

const MemberContributions = () => {
  const [contributions, setContributions] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [contribData, settingsData] = await Promise.all([
          getMyContributions(),
          getPublicSettings()
        ]);
        setContributions(contribData);
        setSettings(settingsData);
      } catch (err) {
        console.error("Failed to fetch contributions", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <FiCheckCircle className="text-green-500" />;
      case "pending":
        return <FiClock className="text-amber-500" />;
      case "defaulted":
        return <FiAlertCircle className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm";
    switch (status) {
      case "paid":
        return <span className={`${baseClasses} bg-green-100 text-green-700 border border-green-200`}>Paid</span>;
      case "pending":
        return <span className={`${baseClasses} bg-amber-100 text-amber-700 border border-amber-200`}>Pending</span>;
      case "defaulted":
        return <span className={`${baseClasses} bg-red-100 text-red-700 border border-red-200`}>Defaulted</span>;
      default:
        return null;
    }
  };

  if (loading) return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm animate-pulse">
      <div className="h-4 w-48 bg-slate-100 rounded mb-6"></div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-50 rounded-2xl"></div>)}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
        <div>
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <FiCalendar className="text-blue-500" />
            Monthly Thrift Status
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Mandatory Contributions Tracking</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Paid</span>
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Pending</span>
          </div>
        </div>
      </div>
      
      {/* Monthly Obligation Info */}
      <div className="mx-6 mt-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
               <FiInfo />
            </div>
            <div>
               <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">Your Monthly Obligation</p>
               <h4 className="text-lg font-black text-slate-800 mt-0.5">
                  ₦{parseFloat(settings.monthly_thrift_amount || 5000).toLocaleString()}
               </h4>
            </div>
         </div>
         <p className="text-[10px] text-slate-500 font-bold max-w-[220px] leading-tight text-right">
            This amount is automatically billed on the 1st of every month to your savings history.
         </p>
      </div>

      <div className="p-4 uppercase tracking-widest text-[10px] font-black text-slate-400 mt-2 px-6">
         History & Compliance
      </div>

      <div className="p-4">
        {contributions.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {contributions.map((con) => (
              <div 
                key={con.id}
                className={`relative group p-4 rounded-2xl border transition-all duration-300 ${
                  con.status === 'paid' 
                    ? 'bg-green-50/30 border-green-100 hover:bg-green-50' 
                    : 'bg-white border-slate-100 hover:border-blue-200'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    {format(parseISO(`${con.month}-01`), 'MMM yyyy')}
                  </span>
                  <div className="text-lg mb-2">
                    {getStatusIcon(con.status)}
                  </div>
                  <span className="text-xs font-black text-slate-700 leading-none mb-2">
                    ₦{parseFloat(con.amount).toLocaleString()}
                  </span>
                  {getStatusBadge(con.status)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-200">
               <FiCalendar className="text-3xl" />
            </div>
            <p className="text-sm font-bold text-slate-500">No contribution records found yet.</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Records are generated on the 1st of every month</p>
          </div>
        )}
      </div>
      
      <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-100">
         <p className="text-[10px] text-slate-400 font-bold uppercase leading-tight max-w-[200px]">
           Consistent contributions improve your loan eligibility score.
         </p>
         <button className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-colors">
           View Rules
         </button>
      </div>
    </div>
  );
};

export default MemberContributions;
