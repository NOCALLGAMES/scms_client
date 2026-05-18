import { FaNairaSign } from "react-icons/fa6";
;
import React, { useState, useEffect } from "react";
import api from "../../../lib/api";
import { FiSettings, FiCalendar, FiShield, FiSave, FiAlertCircle, FiInfo, FiActivity } from "react-icons/fi";
import toast from "react-hot-toast";

const AdminSettings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("financial");

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/settings");
      setSettings(data.data.settings);
    } catch (err) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdate = (key, value) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      await api.patch("/admin/settings/bulk-update", { 
        settings: settings.map(s => ({ key: s.key, value: s.value })) 
      });
      toast.success("All settings saved successfully!");
      fetchSettings();
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const getSetting = (key) => settings.find(s => s.key === key)?.value || "";

  const renderSection = (title, icon, keys) => {
    const filtered = settings.filter(s => keys.includes(s.key));
    if (filtered.length === 0) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-8">
           <div className={`p-4 bg-slate-100 text-slate-800 rounded-[1.5rem] shadow-inner`}>{icon}</div>
           <div>
              <h3 className="text-xl font-black text-slate-800">{title}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">System Governance Parameters</p>
           </div>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
           {filtered.map(s => {
             const isTiers = s.key === 'loan_interest_tiers';
             
             if (isTiers) {
               let tiers = [];
               try { tiers = JSON.parse(s.value); } catch(e) { tiers = []; }
               
               return (
                 <div key={s.key} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm col-span-full border-b-4 border-b-blue-50">
                    <div className="flex justify-between items-center mb-6">
                       <div>
                         <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest block">
                            Loan Interest Tiers (Duration Based)
                         </label>
                         <p className="text-[9px] text-slate-400 font-medium italic mt-1">"{s.description}"</p>
                       </div>
                       <button 
                         onClick={() => {
                           const newTiers = [...tiers, { minMonths: 1, maxMonths: 12, rate: 5, label: 'New Tier' }];
                           handleUpdate(s.key, JSON.stringify(newTiers));
                         }}
                         className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-100 transition-colors"
                       >
                         + Add Tier
                       </button>
                    </div>

                    <div className="overflow-x-auto">
                       <table className="w-full text-left border-separate border-spacing-y-2">
                          <thead>
                             <tr>
                                <th className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">Label</th>
                                <th className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">Min Months</th>
                                <th className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">Max Months</th>
                                <th className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">Monthly Rate (%)</th>
                                <th className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">Actions</th>
                             </tr>
                          </thead>
                          <tbody>
                             {tiers.map((t, idx) => (
                               <tr key={idx} className="group">
                                  <td className="px-2">
                                     <input 
                                       type="text" 
                                       className="w-full px-4 py-3 bg-slate-50 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                       value={t.label}
                                       onChange={(e) => {
                                         const nt = [...tiers];
                                         nt[idx].label = e.target.value;
                                         handleUpdate(s.key, JSON.stringify(nt));
                                       }}
                                     />
                                  </td>
                                  <td className="px-2">
                                     <input 
                                       type="number" 
                                       className="w-32 px-4 py-3 bg-slate-50 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                       value={t.minMonths}
                                       onChange={(e) => {
                                         const nt = [...tiers];
                                         nt[idx].minMonths = parseInt(e.target.value);
                                         handleUpdate(s.key, JSON.stringify(nt));
                                       }}
                                     />
                                  </td>
                                  <td className="px-2">
                                     <input 
                                       type="number" 
                                       className="w-32 px-4 py-3 bg-slate-50 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                       value={t.maxMonths}
                                       onChange={(e) => {
                                         const nt = [...tiers];
                                         nt[idx].maxMonths = parseInt(e.target.value);
                                         handleUpdate(s.key, JSON.stringify(nt));
                                       }}
                                     />
                                  </td>
                                  <td className="px-2">
                                     <input 
                                       type="number" 
                                       step="0.1"
                                       className="w-32 px-4 py-3 bg-slate-50 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                       value={t.rate}
                                       onChange={(e) => {
                                         const nt = [...tiers];
                                         nt[idx].rate = parseFloat(e.target.value);
                                         handleUpdate(s.key, JSON.stringify(nt));
                                       }}
                                     />
                                  </td>
                                  <td className="px-4">
                                     <button 
                                       onClick={() => {
                                         const nt = tiers.filter((_, i) => i !== idx);
                                         handleUpdate(s.key, JSON.stringify(nt));
                                       }}
                                       className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                                     >
                                        <FiActivity className="rotate-45" />
                                     </button>
                                  </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
               );
             }

             return (
               <div key={s.key} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all border-b-4 border-b-slate-50">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-4 block group-hover:text-blue-500 transition-colors">
                     {s.key.replace(/_/g, ' ')}
                  </label>
                  <div className="relative">
                     <input 
                       type="text"
                       className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-black text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                       value={s.value}
                       onChange={(e) => handleUpdate(s.key, e.target.value)}
                     />
                  </div>
                  <p className="mt-4 text-[9px] text-slate-400 font-medium italic px-2 leading-relaxed">"{s.description}"</p>
               </div>
             );
           })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter text-premium">Configuration Master</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.25em] text-[10px] mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200"></span>
            Global System State & Business Rules
          </p>
        </div>
        <button 
          onClick={saveAll}
          disabled={saving}
          className="px-12 py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all shadow-2xl shadow-slate-200 disabled:opacity-50"
        >
           {saving ? <FiActivity className="animate-spin" /> : <FiSave />} 
           {saving ? "Deploying Changes..." : "Commit Settings"}
        </button>
      </div>

      <div className="flex gap-2 p-2 bg-slate-50 rounded-[2.5rem] border border-slate-100 self-start">
         {[
           { id: "financial", label: "Financials", icon: <FaNairaSign /> },
           { id: "governance", label: "Governance", icon: <FiCalendar /> },
           { id: "limits", label: "Welfare Limits", icon: <FiShield /> },
         ].map(t => (
           <button 
             key={t.id}
             onClick={() => setActiveTab(t.id)}
             className={`px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === t.id ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:bg-white/50'}`}
           >
             {t.icon} {t.label}
           </button>
         ))}
      </div>

      <div className="bg-white/40 backdrop-blur-sm rounded-[3rem] p-4 border border-slate-50 min-h-[500px]">
        {loading ? (
          <div className="py-40 text-center animate-pulse">
             <FiSettings size={60} className="mx-auto text-slate-100 mb-6 animate-spin-slow" />
             <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">Synchronizing Master State...</p>
          </div>
        ) : (
          <div className="p-8">
             {activeTab === 'financial' && renderSection("Financial Rules", <FaNairaSign size={24} />, ["monthly_thrift_amount", "monthly_commission_amount", "lateThriftPenalty", "loan_guarantor_threshold", "loan_interest_tiers"])}
             {activeTab === 'governance' && renderSection("Governance Cycle", <FiCalendar size={24} />, ["deductionDay", "allowLoanApplications", "allowWithdrawals"])}
             {activeTab === 'limits' && renderSection("Benefit Caps", <FiShield size={24} />, ["medicalWelfareCap", "funeralWelfareCap"])}
          </div>
        )}
      </div>

      <div className="bg-amber-50 rounded-[2rem] p-8 border border-amber-100 flex items-start gap-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-5">
            <FiAlertCircle size={100} />
         </div>
         <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl"><FiAlertCircle size={24} /></div>
         <div>
            <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest mb-2 px-1">Atomic Impact Warning</h4>
            <p className="text-[10px] text-amber-700 font-medium leading-relaxed max-w-2xl px-1">
               Changes to these master records have immediate effect across all automated jobs, financial reports, and member eligibility checks. Ensure all stakeholders are informed before modifying core financial parameters.
            </p>
         </div>
      </div>
    </div>
  );
};

export default AdminSettings;
