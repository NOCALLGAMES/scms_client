import React, { useState, useEffect } from "react";
import {
  FiBriefcase,
  FiFileText,
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiTrendingUp,
  FiUser,
  FiRefreshCw,
} from "react-icons/fi";
import { getAllLoans, approveLoan, rejectLoan, getLoanById } from "../services/loansApi";
import toast from "react-hot-toast";
import { useConfirm } from "../../../contexts/ConfirmationContext";
import { useParams, useNavigate } from "react-router-dom";

const LoanAppraisal = () => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const confirm = useConfirm();

  const fetchPendingLoans = async () => {
    setIsLoading(true);
    try {
      const data = await getAllLoans({ status: "pending" });
      setLoans(data.loans || []);
    } catch (err) {
      toast.error("Failed to load pending loans");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingLoans();
  }, []);

  // Handle URL-based selection
  useEffect(() => {
    if (urlId && loans.length > 0) {
      const loan = loans.find(l => l.id === parseInt(urlId));
      if (loan) {
        setSelectedAppraisal(loan);
      } else {
        // If not in pending list, fetch specifically
        const fetchSpecfic = async () => {
          try {
            const specificLoan = await getLoanById(urlId);
            if (specificLoan) setSelectedAppraisal(specificLoan);
          } catch (err) {
            console.error("Could not fetch specific loan", err);
          }
        };
        fetchSpecfic();
      }
    }
  }, [urlId, loans]);

  const handleAction = async (status) => {
    if (!selectedAppraisal) return;

    const isConfirmed = await confirm({
      title: `Confirm Loan ${status === "approved" ? "Approval" : "Rejection"}`,
      message: `Are you sure you want to ${status === "approved" ? "approve" : "reject"} the loan application for ${selectedAppraisal.borrower?.name}?`,
      type: status === "approved" ? "info" : "danger",
    });

    if (!isConfirmed) return;

    setIsProcessing(true);
    const toastId = toast.loading(`Processing ${status}...`);

    try {
      if (status === "approved") {
        await approveLoan(selectedAppraisal.id);
      } else {
        await rejectLoan(selectedAppraisal.id);
      }
      toast.success(`Loan ${status} successfully`, { id: toastId });
      setSelectedAppraisal(null);
      fetchPendingLoans();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed", {
        id: toastId,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getScoreColor = (score = 0) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  // Simple mock score helper as the backend doesn't provide a credit score yet
  const getMockScore = (id) => (id % 40) + 55;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Loan Appraisal & Scoring
          </h1>
          <p className="text-slate-600 mt-1">
            Evaluate loan requests based on member history and risk metrics.
          </p>
        </div>
        <button
          onClick={fetchPendingLoans}
          disabled={isLoading}
          className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Appraisal List */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-bold text-slate-800 tracking-tight">
              Pending Appraisals
            </h3>
            <span className="px-4 py-1.5 bg-blue-50 rounded-xl text-xs font-black text-blue-600 uppercase tracking-widest">
              {loans.length} New Requests
            </span>
          </div>

          <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="p-20 text-center">
                <FiRefreshCw className="animate-spin text-3xl text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">
                  Fetching applications...
                </p>
              </div>
            ) : loans.length > 0 ? (
              loans.map((app) => {
                const score = getMockScore(app.id);
                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedAppraisal(app)}
                    className={`p-6 cursor-pointer transition-all hover:bg-slate-50 flex items-center justify-between group ${selectedAppraisal?.id === app.id
                        ? "bg-blue-50/50 border-l-4 border-blue-500 shadow-inner"
                        : "border-l-4 border-transparent"
                      }`}
                  >
                    <div className="flex items-center space-x-5">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${selectedAppraisal?.id === app.id
                            ? "bg-white shadow-md text-blue-600"
                            : "bg-slate-100 text-slate-400 group-hover:bg-white group-hover:shadow-sm"
                          }`}
                      >
                        <FiUser size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg tracking-tight">
                          {app.borrower?.name || "Unknown Member"}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                          ID #{app.id} • ₦
                          {parseFloat(app.loanAmount).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div
                          className={`text-sm font-black px-4 py-1.5 rounded-xl ${getScoreColor(score)}`}
                        >
                          {score}/100
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase mt-1.5 tracking-tighter">
                          {score >= 80
                            ? "Low"
                            : score >= 60
                              ? "Medium"
                              : "High"}{" "}
                          Risk
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-24 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiCheckCircle className="text-4xl text-slate-200" />
                </div>
                <h3 className="text-slate-800 font-bold mb-1">Queue Empty</h3>
                <p className="text-slate-400 text-sm">
                  All loan applications have been processed.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Scoring Breakdown Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-200 h-full min-h-[500px] sticky top-8">
            <h3 className="text-xl font-bold mb-8 flex items-center tracking-tight">
              <FiShield className="mr-3 text-blue-400" />
              Risk Assessment
            </h3>

            {selectedAppraisal ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                  <div className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] mb-2">
                    Loan Principal
                  </div>
                  <div className="text-2xl font-black italic tracking-tighter">
                    ₦{parseFloat(selectedAppraisal.loanAmount).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium mt-1">
                    Duration: {selectedAppraisal.duration} Months @{" "}
                    {selectedAppraisal.interestRate}%
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-3">
                    <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>Savings Capability</span>
                      <span className="text-blue-400">92%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[92%] shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>Repayment History</span>
                      <span className="text-green-400">100%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[100%] shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>Liquidity Ratio</span>
                      <span className="text-amber-400">45%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 w-[45%] shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                    </div>
                  </div>
                </div>

                <div className="pt-10 space-y-4">
                  <button
                    onClick={() => handleAction("approved")}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center space-x-3 bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black transition-all shadow-xl shadow-blue-950/20 active:scale-95 disabled:opacity-50"
                  >
                    <FiCheckCircle size={20} />
                    <span>Approve Application</span>
                  </button>
                  <button
                    onClick={() => handleAction("rejected")}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center space-x-3 bg-transparent hover:bg-red-500/10 text-slate-500 hover:text-red-400 py-4 rounded-2xl font-bold transition-all border border-slate-800 hover:border-red-500/30 active:scale-95 disabled:opacity-50"
                  >
                    <FiXCircle size={18} />
                    <span>Decline Application</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 text-center space-y-6 opacity-40">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-slate-600">
                  <FiTrendingUp size={40} />
                </div>
                <p className="text-slate-400 text-sm font-medium px-8 leading-relaxed">
                  Select an appraisal from the list to view detailed scoring
                  metrics and risk factors.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanAppraisal;
