import React, { useState } from "react";
import {
  FiActivity,
  FiFilter,
  FiSearch,
  FiTerminal,
  FiCpu,
  FiShield,
  FiClock,
  FiGlobe,
  FiRefreshCw,
} from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/api";

const fetchInstitutionLogs = async ({ page, limit, action, userId }) => {
  const params = { page, limit };
  if (action) params.action = action;
  if (userId) params.userId = userId;
  const { data } = await api.get("/reports/audit-logs", { params });
  return data.data;
};

const getActionColor = (action = "") => {
  if (action.includes("DELETE") || action.includes("REJECT") || action.includes("SUSPEND"))
    return "text-red-600 bg-red-50 border-red-100";
  if (action.includes("CREATE") || action.includes("APPROVE") || action.includes("ACTIVATE"))
    return "text-green-600 bg-green-50 border-green-100";
  if (action.includes("UPDATE") || action.includes("EDIT"))
    return "text-amber-600 bg-amber-50 border-amber-100";
  if (action.includes("LOGIN"))
    return "text-blue-600 bg-blue-50 border-blue-100";
  return "text-gray-600 bg-gray-50 border-gray-100";
};

const InstitutionActivityLog = () => {
  const [page, setPage] = useState(1);
  const [filterInput, setFilterInput] = useState({ action: "", userId: "" });
  const [appliedFilter, setAppliedFilter] = useState({ action: "", userId: "" });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["institution-audit-logs", page, appliedFilter],
    queryFn: () => fetchInstitutionLogs({ page, limit: 25, ...appliedFilter }),
    keepPreviousData: true,
  });

  const logs = data?.logs || [];
  const pagination = data?.pagination || {};

  const handleApply = () => {
    setPage(1);
    setAppliedFilter({ ...filterInput });
  };

  const handleReset = () => {
    setFilterInput({ action: "", userId: "" });
    setAppliedFilter({ action: "", userId: "" });
    setPage(1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <FiTerminal className="text-blue-600" />
            Institution Activity Log
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            A complete audit trail of all administrative actions within your cooperative.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all active:scale-95"
        >
          <FiRefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px] space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Type</label>
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="e.g. LOGIN, UPDATE, CREATE"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              value={filterInput.action}
              onChange={(e) => setFilterInput((f) => ({ ...f, action: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
            />
          </div>
        </div>
        <div className="flex-1 min-w-[200px] space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User ID</label>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Filter by User ID"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              value={filterInput.userId}
              onChange={(e) => setFilterInput((f) => ({ ...f, userId: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
            />
          </div>
        </div>
        <button
          onClick={handleApply}
          className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95"
        >
          Apply Filter
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2.5 text-slate-500 hover:text-slate-800 font-bold text-sm transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Log Feed */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FiActivity className="text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Activity Stream</h2>
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-2 py-1 rounded">
            {logs.length} of {pagination.total || 0} events
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium">Loading audit trail...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <FiCpu className="text-4xl text-slate-200 mx-auto mb-2" />
            <p className="font-bold">No log entries matched your filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {logs.map((log) => (
              <div key={log.id} className="p-6 hover:bg-slate-50/50 transition-colors group">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 p-2.5 rounded-xl border ${getActionColor(log.action)} shadow-sm group-hover:scale-110 transition-transform`}>
                      <FiShield size={16} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${getActionColor(log.action)}`}>
                          {log.action?.replace(/_/g, " ")}
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                          {log.user ? log.user.name : "System / Automated"}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">
                          {log.user?.role?.replace(/_/g, " ") || "system"}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="text-sm text-slate-600 font-medium max-w-2xl leading-relaxed mt-1">
                        {(() => {
                          if (!log.details) return "No additional context.";
                          try {
                            const parsed = JSON.parse(log.details);
                            if (typeof parsed !== "object") return log.details;
                            return (
                              <div className="flex flex-wrap gap-2 mt-1">
                                {Object.entries(parsed).map(([key, val]) => (
                                  <div key={key} className="bg-slate-100 px-2 py-1 rounded text-[10px] font-bold border border-slate-200">
                                    <span className="text-slate-400 uppercase mr-1">
                                      {key.replace(/([A-Z])/g, " $1")}:
                                    </span>
                                    <span className="text-slate-700">
                                      {typeof val === "object" ? "..." : String(val)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            );
                          } catch {
                            return log.details;
                          }
                        })()}
                      </div>

                      <div className="mt-3 flex items-center gap-4 text-[10px] font-bold text-slate-400">
                        <span className="flex items-center gap-1">
                          <FiClock size={11} />
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiGlobe size={11} />
                          {log.ipAddress || "Internal"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entry ID</p>
                    <p className="text-xs font-mono text-slate-700 font-bold">
                      #LOG-{String(log.id).padStart(6, "0")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-all"
            >
              Previous
            </button>
            <span className="text-xs font-bold text-slate-500">
              Page {page} of {pagination.pages}
            </span>
            <button
              disabled={page === pagination.pages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstitutionActivityLog;
