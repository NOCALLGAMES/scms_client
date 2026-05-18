import { FaNairaSign } from "react-icons/fa6";
;
import React from "react";
import { FiBox,
  FiUsers,
  FiActivity,
  FiAlertCircle,
  FiTrendingUp,
  FiPlus,
  FiCreditCard,
  FiClock,
  FiShield,
  FiSettings,
  FiChevronRight,
  FiArrowUpRight } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { getSystemStats, getRecentActivity, getInstitutionsSummary } from "../../admin/services/superAdminApi";
import { getJobs } from "../../admin/services/jobApi";
import { useNavigate } from "react-router-dom";
import { useBrand } from "../../../contexts/BrandContext";

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ label, value, fullValue, icon: Icon, color, sub }) => (
  <div className={`rounded-2xl p-6 border ${color.border} ${color.bg} flex items-start space-x-4 shadow-sm group hover:scale-[1.02] transition-all duration-200`}>
    <div className={`p-3 rounded-xl ${color.icon} shadow-md`}>
      <Icon className="text-xl text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</p>
      <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1 truncate" title={fullValue || (typeof value === 'string' || typeof value === 'number' ? value : undefined)}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1 font-medium">{sub}</p>}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { getBrandBg, getBrandText, getBrandBgLight } = useBrand();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["super-admin-stats"],
    queryFn: getSystemStats,
  });

  const { data: institutions, isLoading: instLoading } = useQuery({
    queryKey: ["super-admin-institutions-summary"],
    queryFn: getInstitutionsSummary,
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["super-admin-jobs"],
    queryFn: getJobs,
  });

  const { data: activity } = useQuery({
    queryKey: ["super-admin-activity"],
    queryFn: getRecentActivity,
  });

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    }).format(val);

  const formatCurrencyExact = (val) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 2,
    }).format(val);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 animate-in fade-in duration-500 pb-10">
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            NoCall Management Console
          </h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">
            Global Oversight — Governance & Platform Health
          </p>
        </div>
      </div>

      {/* Global Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="Active Institutions"
          value={statsLoading ? "—" : stats?.institutions?.active || 0}
          icon={FiBox}
          color={{ bg: "bg-emerald-50", border: "border-emerald-100", icon: "bg-emerald-600" }}
          sub={`${stats?.institutions?.total || 0} total registered`}
        />
        <StatCard
          label="Total Member Base"
          value={statsLoading ? "—" : (stats?.users?.total || 0).toLocaleString()}
          icon={FiUsers}
          color={{ bg: "bg-brand-50", border: "border-brand-100", icon: "bg-brand-600" }}
          sub="Across all cooperatives"
        />
        <StatCard
          label="Platform Liquidity"
          value={statsLoading ? "—" : formatCurrency(stats?.finances?.totalSystemFunds || 0)}
          fullValue={statsLoading ? null : formatCurrencyExact(stats?.finances?.totalSystemFunds || 0)}
          icon={FaNairaSign}
          color={{ bg: "bg-green-50", border: "border-green-100", icon: "bg-green-600" }}
          sub="Total aggregate balance"
        />
        <StatCard
          label="Loan Exposure"
          value={statsLoading ? "—" : formatCurrency(stats?.finances?.totalOutstandingLoans || 0)}
          fullValue={statsLoading ? null : formatCurrencyExact(stats?.finances?.totalOutstandingLoans || 0)}
          icon={FiCreditCard}
          color={{ bg: "bg-orange-50", border: "border-orange-100", icon: "bg-orange-600" }}
          sub="Platform-wide risk"
        />
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Institution Performance (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
               <div className="flex items-center space-x-2">
                  <FiTrendingUp style={getBrandText()} />
                  <h2 className="text-base font-bold text-gray-900">Institution Performance</h2>
               </div>
               <button onClick={() => navigate("/superadmin/institutions")} className="text-xs font-bold hover:underline" style={getBrandText()}>View All</button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/30 border-b border-gray-50">
                       <th className="px-6 py-4">Cooperative</th>
                       <th className="px-6 py-4">Members</th>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                     {instLoading ? (
                       <tr><td colSpan="4" className="p-10 text-center text-gray-400 text-sm">Loading performance data...</td></tr>
                     ) : institutions?.slice(0, 5).map(inst => (
                       <tr key={inst.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group" onClick={() => navigate(`/superadmin/institutions/${inst.id}`)}>
                          <td className="px-6 py-4">
                             <p className="text-sm font-bold text-gray-900">{inst.name}</p>
                             <p className="text-[10px] text-gray-400 font-bold uppercase">{inst.code}</p>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex items-center space-x-1">
                                <span className="text-sm font-bold text-gray-700">{inst.memberCount || 0}</span>
                                <FiArrowUpRight className="text-green-500 text-xs" />
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${inst.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                {inst.status?.replace(/_/g, ' ')}
                             </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <FiChevronRight className="inline-block text-gray-300 group-hover:translate-x-1 transition-all" style={{ '--group-hover-color': 'var(--brand-color)' }} />
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>

          {/* System Jobs / Health */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
             <div className="px-6 py-5 border-b border-gray-100 flex items-center space-x-2 bg-gray-50/50">
                <FiSettings style={getBrandText()} />
                <h2 className="text-base font-bold text-gray-900">Background System Jobs</h2>
             </div>
             <div className="divide-y divide-gray-50">
                {jobsLoading ? (
                  <div className="p-10 text-center text-gray-400 text-sm italic">Synchronizing scheduler...</div>
                ) : jobs?.slice(0, 4).map(job => (
                  <div key={job.id} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                     <div className="flex items-center space-x-4">
                        <div 
                           className={`p-2 rounded-lg ${job.isEnabled ? '' : 'bg-gray-100 text-gray-400'}`}
                           style={job.isEnabled ? getBrandBgLight() : {}}
                         >
                            <FiClock size={16} style={job.isEnabled ? getBrandText() : {}} />
                         </div>
                        <div>
                           <p className="text-sm font-bold text-gray-800">{job.name}</p>
                           <p className="text-[10px] text-gray-500 font-medium">Last Run: {job.lastRunAt ? new Date(job.lastRunAt).toLocaleTimeString() : 'Never'}</p>
                        </div>
                     </div>
                     <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${job.lastRunStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {job.lastRunStatus || 'IDLE'}
                     </span>
                  </div>
                ))}
             </div>
              <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
                 <button onClick={() => navigate("/admin/jobs")} className="text-xs font-bold hover:underline" style={getBrandText()}>Monitor All Jobs →</button>
              </div>
          </div>
        </div>

        {/* Right Column: Platform Vitals & Actions (1/3) */}
        <div className="space-y-8">
           {/* Platform Status */}
           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Platform Vitals</h2>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs font-bold text-gray-500">Member Growth</span>
                       <span className="text-xs font-black text-green-600">+12%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-green-500 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                 </div>
                  <div>
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-500">System Stability</span>
                        <span className="text-xs font-black" style={getBrandText()}>99.9%</span>
                     </div>
                     <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: '99%', ...getBrandBg() }}></div>
                     </div>
                  </div>
              </div>
           </div>

           {/* Quick Actions / Security */}
           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-2">
               <button 
                onClick={() => navigate("/superadmin/logs")}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl transition-all group"
                onMouseEnter={e => e.currentTarget.style.backgroundColor = getBrandBgLight().backgroundColor}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
              >
                 <div className="flex items-center space-x-3">
                    <FiShield className="text-gray-400 group-hover:text-brand-600" />
                    <span className="text-sm font-bold text-gray-700">Security Audit Logs</span>
                 </div>
                 <FiChevronRight className="text-gray-300" />
              </button>
              
              {/* Live Mini Log Feed */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">Live Security Feed</p>
                <div className="space-y-3">
                   {activity?.logs?.slice(0, 3).map(log => (
                    <div key={log.id} className="flex items-start space-x-3 px-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-700 leading-tight">
                          {log.action?.replace(/_/g, ' ')} <span className="text-gray-400 font-medium">by</span> {log.user?.name || 'System'}
                        </p>
                        <p className="text-[9px] text-gray-400">{new Date(log.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                  {(!activity?.logs || activity.logs.length === 0) && (
                    <p className="text-[10px] text-gray-400 italic px-2">No recent activity detected.</p>
                  )}
                </div>
              </div>

               <button 
                onClick={() => navigate("/superadmin/users")}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl transition-all group mt-4"
                onMouseEnter={e => e.currentTarget.style.backgroundColor = getBrandBgLight().backgroundColor}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
              >
                 <div className="flex items-center space-x-3">
                    <FiUsers className="text-gray-400 group-hover:text-brand-600" />
                    <span className="text-sm font-bold text-gray-700">User Explorer</span>
                 </div>
                 <FiChevronRight className="text-gray-300" />
              </button>
           </div>

           {/* Announcements / System Alert */}
            <div 
              className="rounded-2xl p-6 text-white shadow-xl shadow-emerald-100"
              style={getBrandBg()}
            >
               <FiActivity className="text-white/70 mb-4" size={24} />
               <h3 className="font-bold text-lg mb-2">Platform Integrity</h3>
               <p className="text-white/80 text-xs leading-relaxed mb-6">All systems are currently operational. Next platform-wide thrift processing is scheduled for May 1st.</p>
               <button className="w-full py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs font-bold hover:bg-white/20 transition-all">Check Job Queue</button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default SuperAdminDashboard;
