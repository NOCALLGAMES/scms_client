import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiActivity,
  FiCheckCircle,
  FiInfo,
  FiRefreshCw,
  FiSearch,
  FiUser,
  FiShield,
  FiCalendar
} from "react-icons/fi";
import { FaNairaSign } from "react-icons/fa6";
import { getLoanRepayments, makeRepayment } from "../services/repaymentApi";
import { useAuth } from "../../auth/hooks/useAuth";
import toast from "react-hot-toast";

const LoanRepayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm();
  const { role } = useAuth();

  const isMember = role === "member";
  const isAdmin = ["super_admin", "staff"].includes(role);
  const backPath = isMember ? "/loans/my-loans" : "/admin/loan-repayments";

  const [loanData, setLoanData] = useState(null);
  const [repayments, setRepayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch specific loan details
  useEffect(() => {
    if (!id) {
      if (isMember) {
        navigate("/loans/my-loans");
      } else {
        navigate("/loans/my-loans"); // Admins also go there now
      }
      return;
    }
    fetchRepaymentDetails();
  }, [id, isMember, navigate]);

  const fetchRepaymentDetails = async () => {
    setIsLoading(true);
    try {
      const data = await getLoanRepayments(id);
      setLoanData(data.data.loan);
      setRepayments(data.data.repayments || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load loan details");
      navigate(backPath);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      // Round up as requested, but don't exceed the actual outstanding balance 
      // This ensures small fractional debts (like 0.02) can be cleared perfectly.
      const rawAmount = parseFloat(data.amount);
      const roundedAmount = Math.ceil(rawAmount);
      const finalAmount = roundedAmount > loanData.outstandingBalance ? rawAmount : roundedAmount;

      const res = await makeRepayment(id, {
        amount: finalAmount,
      });
      toast.success(res.message || "Repayment recorded!");
      reset();
      fetchRepaymentDetails(); // Refresh view
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FiRefreshCw className="animate-spin text-3xl text-blue-500" />
      </div>
    );
  }

  if (!["disbursed", "repaying", "completed", "defaulted"].includes(loanData?.status?.toLowerCase())) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-amber-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-amber-500 border-4 border-white shadow-xl shadow-amber-900/10">
          <FiRefreshCw size={40} className="animate-spin duration-[3000ms]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Application Under Review</h1>
          <p className="text-slate-500 font-medium max-w-md mx-auto">
            Loan #{id} is currently in the <b>{loanData?.status?.replace(/_/g, " ")}</b> stage. Repayment tools will be activated once the loan is fully approved and disbursed.
          </p>
        </div>
        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            Go Back
          </button>
          <Link
            to="/dashboard"
            className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/30"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-200 transition shadow-sm"
          >
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Loan Repayment
            </h1>
            <p className="text-slate-500 text-sm">
              Loan #{id} — <span className="capitalize">{loanData?.status?.replace(/_/g, " ")}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
          <div className="text-right">
            <p className="text-xs text-slate-500 font-medium uppercase">
              Outstanding Balance
            </p>
            <h2 className="text-xl font-bold text-slate-900">
              ₦{parseFloat(loanData?.outstandingBalance || 0).toLocaleString()}
            </h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistics & Quick Repay */}
        <div className="space-y-8">
          {!["completed", "rejected", "cancelled"].includes(loanData?.status?.toLowerCase()) && (
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-6 flex items-center">
                  <FaNairaSign className="mr-2 text-blue-400" />
                  Quick Repayment
                </h3>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400">
                      Enter Amount (₦)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₦</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        {...register("amount", {
                          required: true,
                          validate: val => /^\d+$/.test(val) || "Whole numbers only"
                        })}
                        onKeyDown={(e) => {
                          if (!/[0-9]|Backspace|Tab|Enter|Arrow/.test(e.key) && !e.ctrlKey && !e.metaKey) {
                            e.preventDefault();
                          }
                        }}
                        className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-blue-400 outline-none text-lg font-semibold transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400">
                      Payment Method
                    </label>
                    <select
                      {...register("paymentMethod", { required: true })}
                      defaultValue={isAdmin ? "Cash" : "Savings Account"}
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-blue-400 outline-none text-sm font-medium transition-all appearance-none"
                    >
                      {isAdmin ? (
                        <>
                          <option value="Cash" className="bg-slate-900">Cash Payment</option>
                          <option value="Bank Transfer" className="bg-slate-900">Bank Transfer</option>
                          <option value="Cheque" className="bg-slate-900">Cheque</option>
                          <option value="POS" className="bg-slate-900">POS Terminal</option>
                        </>
                      ) : (
                        <option value="Savings Account" className="bg-slate-900">Savings Account</option>
                      )}
                    </select>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-sm text-blue-100/80 flex items-start space-x-2">
                    <FiInfo className="mt-0.5 flex-shrink-0" size={16} />
                    <p className="leading-relaxed">
                      {isAdmin
                        ? "Recording a manual payment will update the user's ledger immediately."
                        : "Funds will be deducted from your primary savings account instantly."}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || loanData?.outstandingBalance <= 0}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/30 disabled:opacity-40 active:scale-95"
                  >
                    {isSubmitting ? (
                      <FiRefreshCw className="animate-spin" />
                    ) : (
                      <>
                        <FiCheckCircle size={18} />
                        <span>Post Repayment</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
              {/* Ambient Background Glow */}
              <div className="absolute top-[-10%] right-[-10%] w-48 h-48 bg-blue-500/15 blur-[80px] rounded-full" />
            </div>
          )}

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-sm font-semibold text-slate-600">
              Loan Summary
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl text-sm">
                <span className="text-slate-500">Principal</span>
                <span className="font-bold text-slate-800">
                  ₦{parseFloat(loanData?.loanAmount || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl text-sm">
                <span className="text-slate-500">Total Interest</span>
                <span className="font-bold text-slate-800">
                  ₦{(
                    parseFloat(loanData?.totalRepayable || 0) -
                    parseFloat(loanData?.loanAmount || 0)
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl text-sm">
                <span className="text-slate-500">Duration</span>
                <span className="font-bold text-slate-800">
                  {loanData?.duration ? `${loanData.duration} months` : "N/A"}
                </span>
              </div>
              {loanData?.status?.toLowerCase() === "completed" ? (
                <div className="flex justify-between p-3 bg-emerald-50 rounded-xl text-sm border border-emerald-100">
                  <span className="text-emerald-600">Completed At</span>
                  <span className="font-bold text-emerald-700">
                    {loanData?.completedAt
                      ? new Date(loanData.completedAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between p-3 bg-blue-50 rounded-xl text-sm border border-blue-100">
                    <span className="text-blue-600">Monthly Payment</span>
                    <span className="font-bold text-blue-700">
                      ₦{parseFloat(loanData?.monthlyPayment || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-50 rounded-xl text-sm">
                    <span className="text-slate-500">Next Payment</span>
                    <span className="font-bold text-blue-600">
                      {(() => {
                        if (loanData?.nextPaymentDate) {
                          return new Date(loanData.nextPaymentDate).toLocaleDateString();
                        }
                        if (loanData?.disbursedAt) {
                          const next = new Date(loanData.disbursedAt);
                          next.setMonth(next.getMonth() + 1);
                          return next.toLocaleDateString();
                        }
                        return loanData?.status === 'approved' ? "Pending Disbursement" : "N/A";
                      })()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-sm font-semibold text-slate-600">
              Parties Involved
            </h4>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-slate-50 rounded-xl">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mr-3">
                  <FiUser size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500 text-xs">Borrower</span>
                  <span className="font-semibold text-slate-800 text-sm">
                    {loanData?.borrower?.name || "Unknown Member"}
                  </span>
                </div>
              </div>
              <div className="flex items-center p-3 bg-slate-50 rounded-xl">
                <div className="bg-green-100 p-2 rounded-lg text-green-600 mr-3">
                  <FiShield size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500 text-xs">Approved By</span>
                  <span className="font-semibold text-slate-800 text-sm">
                    {loanData?.approver?.name || "System Automated"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Repayment History Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-slate-50/50">
            <h3 className="font-semibold text-slate-800">
              Repayment History
            </h3>
            <span className="px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600 w-fit">
              {repayments.length} {repayments.length === 1 ? 'Payment' : 'Payments'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-xs font-medium text-slate-500">
                <tr>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Reference</th>
                  <th className="px-5 py-4">Method</th>
                  <th className="px-5 py-4 text-right">Principal</th>
                  <th className="px-5 py-4 text-right">Interest</th>
                  <th className="px-5 py-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {repayments.length > 0 ? (
                  repayments.map((rp) => (
                    <tr
                      key={rp.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-2">
                          <FiCalendar className="text-slate-400" size={14} />
                          <span className="font-medium text-slate-700 text-sm">
                            {new Date(rp.paidAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-slate-400">
                          {rp.transaction?.reference || "N/A"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-slate-500">
                          {rp.transaction?.description?.split('Via: ')[1]?.replace(')', '') ||
                            (rp.transaction?.description?.includes('Cash') ? 'Cash' : 'Savings')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right text-sm text-slate-600">
                        ₦{parseFloat(rp.principal).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right text-sm text-slate-600">
                        ₦{parseFloat(rp.interest).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-semibold text-slate-900">
                          ₦{parseFloat(rp.amount).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-5 py-16 text-center">
                      <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FiInfo className="text-xl text-slate-300" />
                      </div>
                      <p className="text-slate-400 text-sm">
                        No repayment records found.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanRepayment;
