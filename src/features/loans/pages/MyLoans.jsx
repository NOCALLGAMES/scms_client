import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
  FiCalendar,
  FiLoader,
  FiXCircle,
} from "react-icons/fi";
import { FaNairaSign } from "react-icons/fa6";
import { getMyLoans, cancelLoan } from "../services/loansApi";
import toast from "react-hot-toast";
import { useSocket } from "../../../contexts/SocketContext";
import { useCallback } from "react";
import ConfirmationModal from "../../../shared/components/common/ConfirmationModal";
import { FiChevronRight, FiInfo, FiActivity, FiSearch, FiFilter } from "react-icons/fi";

const STATUS_CONFIG = {
  disbursed: { label: "Disbursed", bg: "bg-blue-50", text: "text-blue-600", icon: <FiClock size={10} /> },
  repaying: { label: "Repaying", bg: "bg-emerald-50", text: "text-emerald-600", icon: <FiActivity size={10} /> },
  pending: { label: "Pending Review", bg: "bg-amber-50", text: "text-amber-600", icon: <FiClock size={10} /> },
  requested: { label: "Requested", bg: "bg-amber-50", text: "text-amber-600", icon: <FiClock size={10} /> },
  defaulted: { label: "Overdue", bg: "bg-red-50", text: "text-red-600", icon: <FiAlertCircle size={10} /> },
  completed: { label: "Completed", bg: "bg-slate-50", text: "text-slate-500", icon: <FiCheckCircle size={10} /> },
  rejected: { label: "Rejected", bg: "bg-red-50", text: "text-red-700", icon: <FiXCircle size={10} /> },
  cancelled: { label: "Cancelled", bg: "bg-gray-50", text: "text-gray-500", icon: <FiXCircle size={10} /> },
};

const StatusChip = ({ status }) => {
  const s = STATUS_CONFIG[status?.toLowerCase()] || { label: status?.replace(/_/g, " "), bg: "bg-gray-50", text: "text-gray-500", icon: <FiInfo size={10} /> };
  return (
    <span className={`flex items-center gap-1.5 px-3 py-1 ${s.bg} ${s.text} border border-current/10 rounded-full text-[10px] font-black uppercase tracking-widest w-fit`}>
      {s.icon} {s.label}
    </span>
  );
};

const MyLoans = () => {
  const [loans, setLoans] = useState({ active: [], closed: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const socket = useSocket();
  const navigate = useNavigate();

  const fetchLoans = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const data = await getMyLoans();
      const [active, closed] = data.reduce(
        (acc, loan) => {
          if (
            ["completed", "rejected", "cancelled"].includes(
              loan.status?.toLowerCase()
            )
          ) {
            acc[1].push(loan);
          } else {
            acc[0].push(loan);
          }
          return acc;
        },
        [[], []]
      );
      setLoans({ active, closed });
    } catch (err) {
      if (!isSilent) toast.error("Failed to load your loans");
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  useEffect(() => {
    if (!socket) return;
    const handleAccountSync = () => fetchLoans(true);
    socket.on("account_sync", handleAccountSync);
    return () => socket.off("account_sync", handleAccountSync);
  }, [socket, fetchLoans]);

  const filterLoans = (list) => {
    const term = searchTerm.toLowerCase();
    return list.filter(l =>
      l.id.toString().includes(term) ||
      l.loanType?.toLowerCase().includes(term) ||
      l.loanPurpose?.toLowerCase().includes(term)
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FiLoader className="animate-spin text-blue-600 text-3xl" />
      </div>
    );
  }

  const activeFiltered = filterLoans(loans.active);
  const closedFiltered = filterLoans(loans.closed);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            My Loan Portfolio
          </h1>
          <p className="text-slate-500 font-medium">
            Manage your active loans and track your repayment progress.
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/loans/ledger"
            className="px-6 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center space-x-2"
          >
            <FiGrid />
            <span>Unified Ledger</span>
          </Link>
          <Link
            to="/loans"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/40 flex items-center space-x-2"
          >
            <FaNairaSign />
            <span>New Application</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-4">
        <div className="relative group">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by loan ID, type or purpose..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Active Loans Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="size-2 bg-blue-500 rounded-full animate-pulse" />
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">
            Active Loans ({activeFiltered.length})
          </h2>
        </div>

        {activeFiltered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-4 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <FiGrid size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No active loans found</h3>
          </div>
        ) : (
          <div className="space-y-3">
            {activeFiltered.map((loan) => (
              <LoanListItem key={loan.id} loan={loan} onRefresh={fetchLoans} />
            ))}
          </div>
        )}
      </div>

      {/* History Section */}
      {loans.closed.length > 0 && (
        <div className="pt-8 border-t border-slate-200/60 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="size-2 bg-slate-300 rounded-full" />
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">
              Loan History ({closedFiltered.length})
            </h2>
          </div>

          <div className="space-y-3 opacity-80">
            {closedFiltered.map((loan) => (
              <LoanListItem key={loan.id} loan={loan} onRefresh={fetchLoans} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const LoanListItem = ({ loan, onRefresh }) => {
  const navigate = useNavigate();
  const [isCancelling, setIsCancelling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const outstanding = parseFloat(loan.outstandingBalance || 0);
  const total = parseFloat(loan.totalRepayable || 0);
  const progress = total > 0 ? Math.max(0, Math.min(100, ((total - outstanding) / total) * 100)) : 0;
  const circumference = 2 * Math.PI * 20;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const progressColor = loan.status === "defaulted" ? "#ef4444" : loan.status === "completed" ? "#10b981" : "#3b82f6";

  const executeCancel = async () => {
    try {
      setIsCancelling(true);
      await cancelLoan(loan.id);
      toast.success("Loan application cancelled successfully.");
      setShowConfirm(false);
      if (onRefresh) onRefresh(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel loan.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <button
        onClick={() => navigate(`/loans/repayments/${loan.id}`)}
        className="w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all text-left flex flex-col md:flex-row items-center gap-4 group active:scale-[0.99]"
      >
        {/* Progress Circle (Only for active/repaying) */}
        <div className="relative shrink-0">
          <svg className="w-14 h-14 -rotate-90" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="20" fill="none" stroke="#f1f5f9" strokeWidth="4" />
            <circle
              cx="22" cy="22" r="20" fill="none" stroke={progressColor} strokeWidth="4"
              strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-black text-slate-700">{progress.toFixed(0)}%</span>
          </div>
        </div>

        {/* Loan Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight">
              ₦{parseFloat(loan.loanAmount || 0).toLocaleString()}
            </h3>
            <span className="text-xs text-slate-300">·</span>
            <span className="text-[10px] font-mono font-bold text-slate-400">#{loan.id}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusChip status={loan.status} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{loan.loanType?.replace(/[_-]/g, " ")}</span>
            <span className="text-xs text-slate-300">·</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {loan.duration} Months
            </span>
          </div>
        </div>

        {/* Balance & Actions */}
        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right">
            <div className="text-lg font-black text-slate-900 tracking-tighter">₦{outstanding.toLocaleString()}</div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Outstanding</p>
          </div>
          <div className="flex gap-2">
            {['pending', 'requested'].includes(loan.status) && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}
                className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              >
                <FiXCircle size={20} />
              </button>
            )}
            <div className="p-3 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
              <FiChevronRight size={20} />
            </div>
          </div>
        </div>
      </button>

      {showConfirm && (
        <ConfirmationModal
          isOpen={showConfirm}
          onClose={() => !isCancelling && setShowConfirm(false)}
          onConfirm={executeCancel}
          title="Cancel Loan Request"
          message="Are you sure you want to cancel this loan request? This action cannot be undone."
          confirmLabel="Yes, Cancel Loan"
          cancelLabel="Go Back"
          type="danger"
          isLoading={isCancelling}
        />
      )}
    </>
  );
};




export default MyLoans;
