import React, { useState, useEffect } from "react";
import {
  FiFileText,
  FiEye,
  FiClock,
  FiSearch,
  FiLoader,
  FiXCircle,
  FiAlertCircle,
  FiFilter,
} from "react-icons/fi";
import { getAllLoans, startReview } from "../services/loansApi";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";

const STATUS_MAP = {
  pending:         { label: "Pending",        bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200" },
  action_required: { label: "Action Required", bg: "bg-red-50",     text: "text-red-700",    border: "border-red-200" },
  under_review:    { label: "Under Review",   bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-200" },
  rejected:        { label: "Rejected",       bg: "bg-red-50",     text: "text-red-700",    border: "border-red-200" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  return (
    <span className={`px-3 py-1 inline-flex text-[10px] leading-5 font-black uppercase tracking-widest rounded-full border ${s.bg} ${s.text} ${s.border}`}>
      {s.label}
    </span>
  );
};

const LoanRequests = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get("status") || "all";
  
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      // Only fetch pre-decision statuses — approved/disbursed/repaying go to other pages
      const data = await getAllLoans({ status: "pending,under_review,rejected" });
      setRequests(data.loans || []);
    } catch (err) {
      toast.error("Failed to fetch loan requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleReview = async (req) => {
    navigate(`/admin/loan-review/${req.id}`);
  };

  const filtered = requests.filter((r) => {
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const term = searchTerm?.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      r.borrower?.name?.toLowerCase()?.includes(term) ||
      String(r.id).includes(term) ||
      r.loanType?.toLowerCase()?.includes(term);
    return matchesStatus && matchesSearch;
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const reviewCount  = requests.filter((r) => r.status === "under_review").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FiLoader className="animate-spin text-blue-600 text-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Loan Requests</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending Applications &amp; Review Queue
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Awaiting First Review", count: pendingCount,    color: "amber",  icon: <FiClock /> },
          { label: "Under Review",          count: reviewCount,     color: "blue",   icon: <FiEye /> },
          { label: "Rejected",              count: rejectedCount,   color: "red",    icon: <FiXCircle /> },
        ].map((s) => (
          <div key={s.label} className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className={`w-11 h-11 rounded-2xl bg-${s.color}-50 text-${s.color}-600 flex items-center justify-center mb-5 shadow-inner text-xl`}>{s.icon}</div>
            <h3 className="text-3xl font-black text-slate-800 mb-1">{s.count}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name, loan ID or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 outline-none min-w-[200px]"
        >
          <option value="all">All Stages</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Applicant</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Loan Details</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Applied</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Stage</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-28 text-center">
                    <FiAlertCircle className="text-slate-200 text-5xl mx-auto mb-5" />
                    <p className="text-[11px] text-slate-300 font-black uppercase tracking-[0.4em]">
                      {searchTerm || statusFilter !== "all" ? "No matching requests." : "No pending applications at this time."}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[1.25rem] bg-slate-100 flex items-center justify-center text-slate-500 font-black shadow-inner border-2 border-white text-base">
                          {req.borrower?.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 leading-tight">{req.borrower?.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">MEM-{req.userId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-base font-black text-slate-800">₦{parseFloat(req.loanAmount).toLocaleString()}</p>
                      <p className="text-[10px] text-blue-600 font-black uppercase tracking-tight mt-1">{req.loanType?.replace(/[_-]/g, " ")}</p>
                      <p className="text-[10px] text-slate-400 italic mt-0.5">{req.loanPurpose}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                        <FiClock className="text-slate-300" />
                        {new Date(req.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <StatusBadge status={req.guarantors?.some(g => g.status === 'rejected') && req.status === 'pending' ? 'action_required' : req.status} />
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => handleReview(req)}
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 ${
                          req.status === "rejected"
                            ? "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-slate-100"
                            : "bg-slate-900 hover:bg-blue-600 text-white shadow-slate-200"
                        }`}
                      >
                        {req.status === "rejected" ? (
                          <>
                            <FiFileText size={13} /> View Details
                          </>
                        ) : (
                          <>
                            <FiEye size={13} />
                            {req.status === "under_review" ? "Continue Review" : "Begin Review"}
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LoanRequests;
