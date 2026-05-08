import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiUser,
  FiInfo,
  FiRefreshCw,
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { getAllLoans } from "../../loans/services/loansApi";
import toast from "react-hot-toast";

const STATUS_CONFIG = {
  disbursed: { label: "Disbursed", bg: "bg-blue-50", text: "text-blue-600", icon: <FiClock size={10} /> },
  repaying: { label: "Repaying", bg: "bg-emerald-50", text: "text-emerald-600", icon: <FiActivity size={10} /> },
  defaulted: { label: "Defaulted", bg: "bg-red-50", text: "text-red-600", icon: <FiAlertTriangle size={10} /> },
  completed: { label: "Completed", bg: "bg-slate-50", text: "text-slate-500", icon: <FiCheckCircle size={10} /> },
};

const StatusChip = ({ status }) => {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.repaying;
  return (
    <span className={`flex items-center gap-1.5 px-3 py-1.5 ${s.bg} ${s.text} border border-current/10 rounded-full text-xs font-medium w-fit`}>
      {s.icon} {s.label}
    </span>
  );
};

const AdminLoanRepayments = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchLoansData = async (currentPage = 1) => {
    setIsLoading(true);
    try {
      const res = await getAllLoans({
        status: "disbursed,repaying,defaulted,completed",
        include: "user",
        page: currentPage,
        limit,
      });
      setLoans(res.loans || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error("Failed to load loan repayments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoansData(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
      fetchLoansData(newPage);
    }
  };

  const filtered = loans.filter((loan) => {
    const term = searchTerm?.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      loan.id.toString().includes(term) ||
      loan.borrower?.name?.toLowerCase()?.includes(term) ||
      loan.borrower?.email?.toLowerCase()?.includes(term) ||
      loan.loanType?.toLowerCase()?.includes(term);
    const matchesStatus = statusFilter === "all" || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination Component
  const Pagination = () => {
    if (pagination.totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;

      if (pagination.totalPages <= maxVisible) {
        for (let i = 1; i <= pagination.totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (page <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i);
          pages.push('...');
          pages.push(pagination.totalPages);
        } else if (page >= pagination.totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = pagination.totalPages - 3; i <= pagination.totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = page - 1; i <= page + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(pagination.totalPages);
        }
      }
      return pages;
    };

    return (
      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
        <div className="text-sm text-slate-500">
          Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, pagination.totalCount)} of {pagination.totalCount} loans
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={!pagination.hasPrevPage}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <FiChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((p, idx) => (
              p === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === p
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                >
                  {p}
                </button>
              )
            ))}
          </div>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={!pagination.hasNextPage}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  };

  const countOf = (s) => loans.filter((l) => l.status === s).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FiRefreshCw className="animate-spin text-3xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Loan Repayments</h1>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Active Portfolio — Loans Being Serviced
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Disbursed", count: countOf("disbursed"), color: "blue", icon: <FiClock /> },
          { label: "Repaying", count: countOf("repaying"), color: "emerald", icon: <FiActivity /> },
          { label: "Defaulted", count: countOf("defaulted"), color: "red", icon: <FiAlertTriangle /> },
          { label: "Completed", count: countOf("completed"), color: "slate", icon: <FiCheckCircle /> },
        ].map((s) => (
          <div
            key={s.label}
            onClick={() => setStatusFilter(s.label?.toLowerCase())}
            className={`bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer ${statusFilter === s.label?.toLowerCase() ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200"}`}
          >
            <div className={`w-10 h-10 rounded-lg bg-${s.color}-50 text-${s.color}-600 flex items-center justify-center mb-3 text-lg`}>{s.icon}</div>
            <h3 className="text-2xl font-bold text-slate-900">{s.count}</h3>
            <p className="text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 group">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name, loan ID or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 outline-none min-w-[180px]"
        >
          <option value="all">All Active Loans</option>
          <option value="disbursed">Disbursed</option>
          <option value="repaying">Repaying</option>
          <option value="defaulted">Defaulted</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Loan Cards - List View */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <FiInfo className="mx-auto text-slate-300 text-4xl mb-4" />
          <p className="text-slate-500 text-sm">
            {searchTerm || statusFilter !== "all" ? "No loans match your filters." : "No active loans in the repayment portfolio."}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {filtered.map((loan) => {
              const outstanding = parseFloat(loan.outstandingBalance || 0);
              const total = parseFloat(loan.totalRepayable || 0);
              const progress = total > 0 ? Math.max(0, Math.min(100, ((total - outstanding) / total) * 100)) : 0;
              const circumference = 2 * Math.PI * 20;
              const strokeDashoffset = circumference - (progress / 100) * circumference;
              const progressColor = loan.status === "defaulted" ? "#ef4444" : loan.status === "completed" ? "#10b981" : "#3b82f6";

              return (
                <button
                  key={loan.id}
                  onClick={() => navigate(`/loans/repayments/${loan.id}`)}
                  className="w-full bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all text-left flex items-center gap-4 group active:scale-[0.99]"
                >
                  {/* Circular Progress */}
                  <div className="relative shrink-0">
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 44 44">
                      {/* Background circle */}
                      <circle
                        cx="22"
                        cy="22"
                        r="20"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="4"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="22"
                        cy="22"
                        r="20"
                        fill="none"
                        stroke={progressColor}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-slate-700">{progress.toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* Loan Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                        {loan.borrower?.name || `Loan #${loan.id}`}
                      </h3>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500">Loan #{loan.id}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mb-2">
                      {loan.borrower?.email || "Unknown Member"}
                    </p>
                    <div className="flex items-center gap-3">
                      <StatusChip status={loan.status} />
                      <span className="text-xs text-slate-400 capitalize">{loan.loanType?.replace(/[_-]/g, " ")}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-400 capitalize">{loan.repaymentMode}</span>
                    </div>
                  </div>

                  {/* Balance */}
                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-slate-900">₦{outstanding.toLocaleString()}</div>
                    <p className="text-xs text-slate-500">Balance Due</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Pagination */}
          <Pagination />
        </>
      )}
    </div>
  );
};

export default AdminLoanRepayments;
