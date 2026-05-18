import React, { useState } from "react";
import {
  FiActivity,
  FiUser,
  FiCalendar,
  FiInfo,
  FiFilter,
  FiSearch,
  FiTerminal,
  FiCpu,
  FiShield,
  FiClock,
  FiGlobe,
} from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "../../admin/services/superAdminApi";

const AuditLogExplorer = () => {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({
    action: "",
    userId: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", page, filter],
    queryFn: () => getAuditLogs({ page, limit: 20, ...filter }),
  });

  const logs = data?.logs || [];
  const pagination = data?.pagination || {};

  const getActionColor = (action) => {
    if (action.includes('DELETE') || action.includes('REJECT') || action.includes('SUSPEND')) return 'text-red-600 bg-red-50 border-red-100';
    if (action.includes('CREATE') || action.includes('APPROVE') || action.includes('ACTIVATE')) return 'text-green-600 bg-green-50 border-green-100';
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'text-amber-600 bg-amber-50 border-amber-100';
    if (action.includes('LOGIN')) return 'text-blue-600 bg-blue-50 border-blue-100';
    return 'text-gray-600 bg-gray-50 border-gray-100';
  };

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          System Audit Explorer
        </h1>
        <p className="text-gray-500 mt-1 text-sm font-medium">
          Monitor platform-wide security events, administrative actions, and system updates.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-8 flex flex-wrap gap-4 items-end">
         <div className="flex-1 min-w-[200px]">
           <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Action Type</label>
           <div className="relative">
             <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <input 
               type="text" 
               placeholder="Filter by action (e.g. LOGIN)"
               className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium"
               value={filter.action}
               onChange={(e) => setFilter(f => ({ ...f, action: e.target.value.toUpperCase() }))}
             />
           </div>
         </div>
         <div className="flex-1 min-w-[200px]">
           <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">User ID</label>
           <div className="relative">
             <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <input 
               type="text" 
               placeholder="Filter by specific User ID"
               className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium"
               value={filter.userId}
               onChange={(e) => setFilter(f => ({ ...f, userId: e.target.value }))}
             />
           </div>
         </div>
         <button 
           onClick={() => setFilter({ action: "", userId: "" })}
           className="px-4 py-2.5 text-gray-500 hover:text-emerald-600 font-bold text-sm"
         >
           Reset
         </button>
      </div>

      {/* Log Feed */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
           <div className="flex items-center space-x-2">
              <FiTerminal className="text-emerald-600" />
              <h2 className="text-sm font-bold text-gray-900">Live Platform Stream</h2>
           </div>
           <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-200 px-2 py-1 rounded">
             Showing {logs.length} of {pagination.total || 0} events
           </span>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-gray-400">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-medium">Decoding encrypted logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
             <FiCpu className="text-4xl text-gray-200 mx-auto mb-2" />
             <p className="font-bold">No logs matched your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {logs.map((log) => (
              <div key={log.id} className="p-6 hover:bg-gray-50/50 transition-colors group">
                 <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex items-start space-x-4">
                       <div className={`mt-1 p-2.5 rounded-xl border ${getActionColor(log.action)} shadow-sm group-hover:scale-110 transition-transform`}>
                          <FiShield size={18} />
                       </div>
                       <div>
                          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                             <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${getActionColor(log.action)}`}>
                                {log.action?.replace(/_/g, " ")}
                             </span>
                             <span className="text-sm font-bold text-gray-900">
                                {log.user ? log.user.name : 'System / Automated'}
                             </span>
                             <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded uppercase">
                                {log.user?.institution?.name || 'Platform Core'}
                             </span>
                          </div>
                          <div className="mt-2 text-sm text-gray-600 font-medium max-w-2xl leading-relaxed">
                             {(() => {
                                if (!log.details) return 'No additional context provided.';
                                try {
                                   const parsed = JSON.parse(log.details);
                                   if (typeof parsed !== 'object') return log.details;
                                   return (
                                      <div className="flex flex-wrap gap-2 mt-1">
                                         {Object.entries(parsed).map(([key, val]) => (
                                            <div key={key} className="bg-gray-100 px-2 py-1 rounded text-[10px] font-bold border border-gray-200">
                                               <span className="text-gray-400 uppercase mr-1">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                               <span className="text-gray-700">{typeof val === 'object' ? '...' : String(val)}</span>
                                            </div>
                                         ))}
                                      </div>
                                   );
                                } catch (e) {
                                   return log.details;
                                }
                             })()}
                          </div>
                          <div className="mt-3 flex items-center space-x-4 text-[10px] font-bold text-gray-400">
                             <span className="flex items-center">
                                <FiClock className="mr-1" />
                                {new Date(log.createdAt).toLocaleString()}
                             </span>
                             <span className="flex items-center">
                                <FiGlobe className="mr-1" />
                                {log.ipAddress || 'Internal'}
                             </span>
                             <span className="hidden sm:flex items-center max-w-[200px] truncate">
                                <FiCpu className="mr-1" />
                                {log.userAgent || 'Unknown Agent'}
                             </span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-4">
                       <div className="text-right">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Entry ID</p>
                          <p className="text-xs font-mono text-gray-900 font-bold">#LOG-{log.id.toString().padStart(6, '0')}</p>
                       </div>
                       <button className="text-[10px] font-extrabold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 transition-all active:scale-95">
                          RECONCILE
                       </button>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs font-bold text-gray-500">
              Page {page} of {pagination.pages}
            </span>
            <button 
              disabled={page === pagination.pages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogExplorer;
