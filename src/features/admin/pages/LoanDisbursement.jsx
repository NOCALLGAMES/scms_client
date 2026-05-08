import { FaNairaSign } from "react-icons/fa6";
;
import React, { useState, useEffect } from "react";
import { FiCreditCard,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiSearch,
  FiRefreshCw,
  FiZap } from "react-icons/fi";
import { getAllLoans, disburseLoan } from "../../loans/services/loansApi";
import toast from "react-hot-toast";
import { useConfirm } from "../../../contexts/ConfirmationContext";

const LoanDisbursement = () => {
  const [loans, setLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const confirm = useConfirm();

  const fetchLoans = async () => {
    setIsLoading(true);
    try {
      const data = await getAllLoans({ status: "approved" });
      setLoans(data.loans || []);
    } catch (err) {
      toast.error("Failed to load approved loans");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleDisburse = async (loan) => {
    const isConfirmed = await confirm({
      title: "Confirm Loan Disbursement",
      message: `Are you sure you want to disburse ₦${parseFloat(loan.loanAmount).toLocaleString()} to ${loan.borrower?.name}? The funds will be credited directly to their savings account and activate their repayment schedule.`,
      type: "info",
      confirmLabel: "Confirm & Credit Savings Account",
    });

    if (!isConfirmed) return;

    setIsProcessing(true);
    const toastId = toast.loading(`Disbursing loan to savings account...`);

    try {
      await disburseLoan(loan.id, { mode: "internal" });
      toast.success(`Loan disbursed. Funds credited to member's savings account.`, { id: toastId });
      fetchLoans();
    } catch (err) {
      toast.error(err.response?.data?.message || "Disbursement failed", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredLoans = loans.filter(
    (loan) =>
      loan.id.toString().includes(searchTerm) ||
      loan.borrower?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Loan Disbursement</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1.5 flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${loans.length > 0 ? "bg-amber-500 animate-pulse" : "bg-slate-300"}`} />
            Approved Loans Awaiting Fund Release
          </p>
        </div>
        <button
          onClick={fetchLoans}
          disabled={isLoading}
          className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm disabled:opacity-50"
        >
          <FiRefreshCw className={isLoading ? "animate-spin" : ""} size={18} />
        </button>
      </div>

      {/* Stat Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-7 rounded-[2.5rem] border shadow-sm ${loans.length > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-slate-100"}`}>
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-5 shadow-inner text-xl ${loans.length > 0 ? "bg-amber-100 text-amber-600" : "bg-slate-50 text-slate-400"}`}>
            <FiClock />
          </div>
          <h3 className="text-3xl font-black text-slate-800 mb-1">{loans.length}</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Loans Pending Disbursal</p>
        </div>
        <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 shadow-inner text-xl">
            <FaNairaSign />
          </div>
          <h3 className="text-3xl font-black text-slate-800 mb-1">
            ₦{loans.reduce((sum, l) => sum + parseFloat(l.loanAmount), 0).toLocaleString()}
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Amount to Release</p>
        </div>
        <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 shadow-inner text-xl">
            <FiAlertCircle />
          </div>
          <p className="text-xs font-bold text-slate-500 leading-relaxed">
            Disbursing activates the member's repayment schedule. Ensure all legal documentation is signed before proceeding.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5">
        <div className="relative group">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by loan ID or member name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Loan / Member</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Amount &amp; Terms</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] text-right">Disburse</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="py-28 text-center text-slate-400 uppercase tracking-[0.4em] text-[10px] font-black animate-pulse">
                    Loading approved loans...
                  </td>
                </tr>
              ) : filteredLoans.length > 0 ? (
                filteredLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-amber-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[1.25rem] bg-blue-50 flex items-center justify-center text-blue-500 shadow-inner">
                          <FiCreditCard size={20} />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 tracking-tight">Loan #{loan.id}</p>
                          <p className="text-sm text-slate-500 font-medium">{loan.borrower?.name || "Unknown Member"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-800 text-lg">₦{parseFloat(loan.loanAmount).toLocaleString()}</p>
                      <p className="text-xs text-blue-600 font-bold bg-blue-50 inline-block px-2 py-0.5 rounded-md mt-1 italic">
                        {loan.interestRate}% Interest · {loan.duration} Months
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-2xl text-[10px] font-black uppercase tracking-widest w-fit animate-pulse">
                        <FiClock size={10} /> Awaiting Disbursal
                      </span>
                      <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-tighter">
                        Approved {new Date(loan.updatedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleDisburse(loan)}
                          disabled={isProcessing}
                          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-emerald-100 active:scale-95 disabled:opacity-50"
                        >
                          <FiZap size={14} /> Disburse to Savings
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-28 text-center">
                    <FiCheckCircle className="text-slate-200 text-5xl mx-auto mb-5" />
                    <p className="text-[11px] text-slate-300 font-black uppercase tracking-[0.4em]">No loans awaiting disbursal</p>
                    <p className="text-[10px] text-slate-200 font-bold mt-2 uppercase tracking-widest">Approve loan applications from the Loan Requests page first.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LoanDisbursement;
