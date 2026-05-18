import { FaNairaSign } from "react-icons/fa6";
;
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiArrowLeft,
  FiUser,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiInfo,
  FiShield,
  FiBriefcase,
  FiLoader } from "react-icons/fi";
import { getLoanById, approveLoan, rejectLoan, getAllLoans } from "../services/loansApi";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import toast from "react-hot-toast";

const LoanReview = () => {
  const { role } = useAuth();
  const isAdmin = role === "institution_admin";
  const { id } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [history, setHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  useEffect(() => {
    const fetchLoan = async () => {
      try {
        setIsLoading(true);
        const data = await getLoanById(id);
        setLoan(data);
        if (data.remarks) setRemarks(data.remarks);
      } catch (err) {
        toast.error("Failed to fetch loan details");
        navigate("/admin/loan-requests");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchLoan();
  }, [id, navigate]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!loan?.userId) return;
      try {
        setIsHistoryLoading(true);
        const { loans } = await getAllLoans({ userId: loan.userId, limit: 10 });
        setHistory(loans.filter(l => l.id.toString() !== id));
      } catch (err) {
        console.error("Failed to fetch member history", err);
      } finally {
        setIsHistoryLoading(false);
      }
    };

    if (loan) fetchHistory();
  }, [loan, id]);

  const canDecide = ['pending', 'under_review'].includes(loan?.status);

  const handleAction = async (status) => {
    if (!canDecide) {
      toast.error("This loan is no longer in a reviewable state.");
      return;
    }
    // Require a reason for rejection
    if (status === "rejected" && !remarks.trim()) {
      toast.error("Please provide a reason for rejection before proceeding.");
      return;
    }

    try {
      setIsProcessing(true);
      const toastId = toast.loading(`${status === "approved" ? "Approving" : "Rejecting"} loan...`);
      
      if (status === "approved") {
        await approveLoan(id);
        toast.success("Loan approved and moved to Disbursement queue.", { id: toastId });
        navigate("/admin/disbursements");
      } else {
        await rejectLoan(id, { remarks });
        toast.success("Loan rejected. Member has been notified.", { id: toastId });
        navigate("/admin/loan-requests");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${status} loan`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <FiLoader className="animate-spin text-4xl text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium">Loading application details...</p>
      </div>
    );
  }

  if (!loan) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all active:scale-95 shadow-sm"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight italic">
                LOAN REVIEW
              </h1>
              <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                loan.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                loan.status === 'under_review' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                loan.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                loan.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                loan.status === 'disbursed' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                loan.status === 'repaying' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                loan.status === 'completed' ? 'bg-slate-50 text-slate-500 border-slate-100' :
                'bg-slate-50 text-slate-400 border-slate-100'
              }`}>
                {loan.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium tracking-tight">
              Application ID: <span className="font-mono font-bold text-slate-700">#LN-{loan.id}</span> • Applied on {new Date(loan.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Main Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Applicant Card */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center italic">
              <FiUser className="mr-3 text-blue-500" />
              APPLICANT INFORMATION
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</p>
                <p className="font-bold text-slate-800 text-lg tracking-tight">{loan.borrower?.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                <p className="font-bold text-slate-800 tracking-tight">{loan.borrower?.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Savings Balance</p>
                <p className="text-xl font-black italic text-blue-600">
                   ₦{parseFloat(loan.borrower?.accounts?.[0]?.balance || 0).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Member ID</p>
                <p className="font-bold text-slate-800 tracking-tight">MEM-{loan.userId}</p>
              </div>
            </div>
          </div>

          {/* Loan Terms Card */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center italic">
              <FiBriefcase className="mr-3 text-blue-500" />
              LOAN TERMS & PURPOSE
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Requested Amount</p>
                <p className="text-3xl font-black italic text-slate-900 tracking-tighter">₦{parseFloat(loan.loanAmount).toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Interest Rate</p>
                <p className="text-3xl font-black italic text-slate-900 tracking-tighter">{loan.interestRate}% <span className="text-xs font-medium text-slate-400 font-sans tracking-normal">Per Annum</span></p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                <p className="font-bold text-slate-800">{loan.duration} Months</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Payment</p>
                <p className="font-bold text-slate-800">₦{parseFloat(loan.monthlyPayment).toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Repayment Mode</p>
                <p className="font-bold text-slate-800 capitalize">{loan.repaymentMode}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loan Type</p>
                <p className="font-bold text-slate-800 capitalize">{loan.loanType?.replace(/[_-]/g, ' ') || 'General'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Purpose of Loan</p>
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-slate-700 leading-relaxed font-medium">
                {loan.loanPurpose || "No specific purpose provided."}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Guarantors & Actions */}
        <div className="space-y-8">
          {/* Loan History Card */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h3 className="text-sm font-black text-slate-900 mb-6 flex items-center italic">
              <FiBriefcase className="mr-3 text-blue-500" />
              MEMBER LOAN HISTORY
            </h3>
            <div className="space-y-4">
              {isHistoryLoading ? (
                <div className="flex justify-center py-8">
                  <FiLoader className="animate-spin text-blue-500" />
                </div>
              ) : history.length > 0 ? (
                history.map((h, idx) => {
                  const outstanding = parseFloat(h.outstandingBalance || 0);
                  const total = parseFloat(h.totalRepayable || 0);
                  const progress = total > 0 ? Math.round(((total - outstanding) / total) * 100) : 0;
                  
                  return (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-black text-slate-800 tracking-tight">₦{parseFloat(h.loanAmount).toLocaleString()}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{h.loanType?.replace(/[_-]/g, ' ') || 'General'}</p>
                        </div>
                        <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${
                          h.status === 'repaying' || h.status === 'disbursed' ? 'bg-green-50 text-green-700 border-green-100' :
                          h.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          h.status === 'rejected' || h.status === 'defaulted' ? 'bg-red-50 text-red-700 border-red-100' :
                          'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {h.status?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      
                      {['repaying', 'disbursed', 'defaulted'].includes(h.status) && (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-400">
                            <span>Repayment Progress</span>
                            <span className="text-blue-600">{progress}%</span>
                          </div>
                          <div className="h-1 bg-white rounded-full overflow-hidden border border-slate-100">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${
                                h.status === 'defaulted' ? 'bg-red-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <FiInfo size={32} className="text-slate-200 mx-auto mb-3" />
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No Previous Loan History</p>
                </div>
              )}
            </div>
          </div>

          {/* Decision Card */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-black mb-6 flex items-center italic">
                <FiCheckCircle className="mr-3 text-blue-400" />
                DECISION CONSOLE
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Decision Remarks
                    </label>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${remarks.trim() ? 'text-green-400' : 'text-red-400'}`}>
                      {remarks.trim() ? `${remarks.length} chars` : '* Required for rejection'}
                    </span>
                  </div>
                  {canDecide ? (
                    <textarea
                      rows="4"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className={`w-full px-5 py-4 bg-white/5 border rounded-2xl focus:bg-white/10 outline-none text-sm transition-all resize-none ${
                        remarks.trim() ? 'border-white/20 focus:border-blue-500' : 'border-red-500/30 focus:border-red-400'
                      }`}
                      placeholder="Enter your review remarks here. This will be included in the rejection email sent to the member..."
                    ></textarea>
                  ) : (
                    <div className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm italic text-slate-300">
                      {loan.remarks || "No evaluation remarks provided for this application."}
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-2">
                  {canDecide ? (
                    isAdmin ? (
                      <>
                        <button
                          onClick={() => handleAction("approved")}
                          disabled={isProcessing}
                          className="w-full flex items-center justify-center space-x-3 bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black transition-all shadow-xl shadow-blue-950/20 active:scale-95 disabled:opacity-50"
                        >
                          <FiCheckCircle size={20} />
                          <span>APPROVE APPLICATION</span>
                        </button>
                        
                        <button
                          onClick={() => handleAction("rejected")}
                          disabled={isProcessing}
                          className="w-full flex items-center justify-center space-x-3 bg-red-600/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 py-4 rounded-2xl font-bold transition-all border border-red-500/20 hover:border-red-500/40 active:scale-95 disabled:opacity-50"
                        >
                          <FiXCircle size={18} />
                          <span>REJECT APPLICATION</span>
                        </button>
                      </>
                    ) : (
                      <div className="py-6 px-5 bg-white/5 border border-white/10 rounded-2xl text-center">
                         <FiAlertCircle className="mx-auto mb-3 text-amber-400 text-2xl" />
                         <p className="text-[11px] font-black text-amber-400 uppercase tracking-[0.2em] mb-1">
                           Operational Review Mode
                         </p>
                         <p className="text-[10px] text-slate-400 font-medium">
                           You can review documentation and leave notes, but only a Manager can finalize the approval.
                         </p>
                      </div>
                    )
                  ) : (
                    <div className="py-4 px-5 bg-white/5 border border-white/10 rounded-2xl text-center">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {loan.status === 'rejected' ? '✗ Application Rejected' :
                         loan.status === 'approved' ? '✓ Application Approved' :
                         `Loan is currently ${loan.status.replace(/_/g, ' ')} — no further review action is available.`}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-[10px] text-blue-100/70 italic flex items-start space-x-3">
                  <FiInfo className="mt-0.5 flex-shrink-0 text-sm" />
                  <p>An email + in-app notification will be sent to the member automatically. Rejection emails will include your remarks.</p>
                </div>
              </div>
            </div>
            
            {/* Background Accent */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500 opacity-5 blur-[80px] rounded-full pointer-events-none"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanReview;
