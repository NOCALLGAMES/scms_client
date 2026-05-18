import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { FiCalendar, FiPercent, FiLoader, FiAlertCircle, FiShield, FiInfo } from "react-icons/fi";
import { FaNairaSign } from "react-icons/fa6";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { applyForLoan, getLoanSettings } from "../services/loansApi";
import { getDashboardStats } from "../../dashboard/services/dashboardApi";
import { useAuth } from "../../auth/hooks/useAuth";
import { differenceInMonths } from "date-fns";

const LoanApplication = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const prefilledData = location.state;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      loanAmount: prefilledData?.amount || "",
      loanTerm: prefilledData?.tenure || "",
      loanType: "",
      loanPurpose: "",
    },
  });

  const [tiers, setTiers] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loanAmount = parseFloat(watch("loanAmount")) || 0;
  const loanTerm = parseInt(watch("loanTerm")) || 0;
  const loanType = watch("loanType");

  // Fetch settings and user stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Invalidate user query to ensure we have the most recent createdAt date for tenure calculation
        await queryClient.invalidateQueries({ queryKey: ["user"] });

        const [settings, statsRes] = await Promise.all([
          getLoanSettings(),
          getDashboardStats({ type: "personal" })
        ]);

        if (settings.loan_interest_tiers) {
          setTiers(JSON.parse(settings.loan_interest_tiers));
        }
        setStats(statsRes.data);
      } catch (err) {
        toast.error("Failed to load application data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [queryClient]);

  // ── Smart Interest Algorithm & Eligibility ────────────────────────────────
  const { rate, monthlyPayment, totalInterest, totalPayment, reasons, eligibility } = useMemo(() => {
    const fallback = { 
      rate: 0, 
      monthlyPayment: 0, 
      totalInterest: 0, 
      totalPayment: 0, 
      reasons: [], 
      eligibility: { passed: false, reasons: ["Initializing system data..."] } 
    };

    if (!tiers.length || !stats || !user) return fallback;

    // 1. Hard Eligibility Checks (Always run these)
    const checkResults = [];
    let isEligible = true;

    // Membership Tenure Check
    const membershipMonths = differenceInMonths(new Date(), new Date(user.createdAt));
    const MIN_MONTHS = 3;
    if (membershipMonths < MIN_MONTHS) {
      checkResults.push(`Membership Tenure: Required ${MIN_MONTHS} months (Current: ${membershipMonths})`);
      isEligible = false;
    }

    // Savings Threshold Check
    const savings = parseFloat(stats.mySavingsNumeric || 0);
    const SAVINGS_MULTIPLIER = 3;
    const maxLoan = savings * SAVINGS_MULTIPLIER;
    if (loanAmount > maxLoan) {
      checkResults.push(`Savings Threshold: Maximum loan allowed is ₦${maxLoan.toLocaleString()} (3x savings)`);
      isEligible = false;
    }

    // Form Completion Checks
    if (loanAmount <= 0) {
      checkResults.push("Please enter a valid loan amount.");
      isEligible = false;
    }
    if (!loanTerm) {
      checkResults.push("Please select a repayment duration.");
      isEligible = false;
    }
    if (!loanType) {
      checkResults.push("Please select a loan type.");
      isEligible = false;
    }

    // 2. Interest Rate Calculation
    const tier = tiers.find(t => loanTerm >= t.minMonths && loanTerm <= t.maxMonths);
    let finalRate = tier ? tier.rate : 0;
    const reasonsList = [];

    // Adjustment: Savings-to-Loan Ratio
    if (loanAmount > 0) {
      if (loanAmount <= savings) {
        finalRate -= 2;
        reasonsList.push("Full Coverage Discount (-2%)");
      } else if (loanAmount > (savings * 2)) {
        finalRate += 3;
        reasonsList.push("Excess Leverage Premium (+3%)");
      }
    }

    // Adjustment: Purpose Based
    if (loanType === "business" || loanType === "agricultural") {
      finalRate -= 1;
      reasonsList.push("Productive Sector Rebate (-1%)");
    } else if (loanType === "personal" || loanType === "emergency") {
      finalRate += 1;
      reasonsList.push("Commercial Adjustment (+1%)");
    }

    // 3. Totals
    const interest = loanAmount * (finalRate / 100) * (loanTerm / 12);
    const total = loanAmount + interest;

    return {
      rate: finalRate,
      monthlyPayment: loanTerm > 0 ? Math.ceil(total / loanTerm) : 0,
      totalInterest: Math.ceil(interest),
      totalPayment: Math.ceil(total),
      reasons: reasonsList,
      eligibility: { passed: isEligible, reasons: checkResults }
    };
  }, [loanAmount, loanTerm, loanType, tiers, stats, user]);

  const onSubmit = async (data) => {
    if (!eligibility.passed) {
      toast.error(eligibility.reasons[0] || "Eligibility check failed.");
      return;
    }

    setIsSubmitting(true);
    try {
      await applyForLoan({
        loanAmount: Math.ceil(loanAmount),
        duration: loanTerm,
        interestRate: rate,
        loanType: data.loanType,
        loanPurpose: data.loanPurpose,
        repaymentMode: 'manual'
      });
      toast.success("Loan application submitted successfully!");
      navigate('/loans/my-loans');
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-20 text-slate-400">
      <FiLoader className="animate-spin text-3xl mb-4" />
      <p className="font-medium">Synchronizing Financial Credentials...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Loan Application</h1>
        <p className="text-slate-500 mt-2">Institutional-grade credit facility with risk-adjusted rates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-8 space-y-6">
          {/* Main Application Card */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Loan Type */}
              <div className="space-y-4">
                <label className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                  <FiShield className="text-blue-500" /> Loan Type
                </label>
                <select
                  {...register("loanType", { required: "Loan type is required" })}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none"
                >
                  <option value="">Select Category</option>
                  <option value="personal">Personal (Commercial)</option>
                  <option value="business">Business (Productive)</option>
                  <option value="agricultural">Agricultural (Productive)</option>
                  <option value="emergency">Emergency (Urgent)</option>
                </select>
                {errors.loanType && <p className="text-red-500 text-xs font-bold">{errors.loanType.message}</p>}
              </div>

              {/* Amount */}
              <div className="space-y-4">
                <label className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                  <FaNairaSign className="text-blue-500" /> Amount
                </label>
                <div className="relative">
                  <input
                    {...register("loanAmount", { required: "Amount is required", min: 1000 })}
                    className="w-full bg-slate-50 border-none rounded-2xl pl-6 pr-12 py-4 text-slate-800 font-black text-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    placeholder="0.00"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">₦</div>
                </div>
              </div>

              {/* Tenure Selection */}
              <div className="md:col-span-2 space-y-4">
                <label className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                  <FiCalendar className="text-blue-500" /> Repayment Duration
                </label>
                <div className="flex flex-wrap gap-3">
                  {[3, 6, 12, 18, 24].map(m => {
                    const isWithinTier = tiers.some(t => m >= t.minMonths && m <= t.maxMonths);
                    if (!isWithinTier) return null;
                    
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setValue("loanTerm", m);
                        }}
                        className={`px-6 py-3 rounded-xl text-xs font-black transition-all border-2 ${
                          loanTerm === m 
                            ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                            : "bg-white border-slate-100 text-slate-400 hover:border-blue-200"
                        }`}
                      >
                        {m} Months
                      </button>
                    );
                  })}
                </div>
                <input type="hidden" {...register("loanTerm", { required: "Term is required" })} />
              </div>

              {/* Purpose */}
              <div className="md:col-span-2 space-y-4">
                <label className="text-sm font-black text-slate-700 uppercase tracking-widest">Purpose of Credit Facility</label>
                <textarea
                  {...register("loanPurpose", { required: "Purpose is required" })}
                  rows={2}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none"
                  placeholder="Describe how this facility will be utilized..."
                />
              </div>
            </div>
          </div>
        </form>

        {/* Sidebar: Calculation & Eligibility */}
        <div className="lg:col-span-4 space-y-6">
          {/* Summary Card */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-900/20 overflow-hidden relative group">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-700">
               <FiPercent size={120} />
             </div>
             
             <div className="relative z-10 space-y-8">
               <div>
                 <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-3">Adjusted Interest Rate</p>
                 <div className="flex items-baseline gap-2">
                   <h2 className="text-5xl font-black">{rate > 0 ? `${rate}%` : "--%"}</h2>
                   <span className="text-blue-400 text-sm font-bold uppercase tracking-wider">APR</span>
                 </div>
                 {reasons.length > 0 && (
                    <div className="mt-4 space-y-1">
                      {reasons.map((r, i) => (
                        <p key={i} className="text-[10px] text-white/40 font-bold uppercase tracking-wide flex items-center gap-2">
                          <span className="w-1 h-1 bg-blue-500 rounded-full"></span> {r}
                        </p>
                      ))}
                    </div>
                 )}
               </div>

               <div className="space-y-4 pt-6 border-t border-white/10">
                 <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Monthly Payment</span>
                    <span className="text-xl font-black">₦{monthlyPayment.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center opacity-60">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total Interest</span>
                    <span className="text-sm font-bold">₦{totalInterest.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total Repayment</span>
                    <span className="text-sm font-black text-blue-400">₦{totalPayment.toLocaleString()}</span>
                 </div>
               </div>
             </div>
          </div>

          {/* Eligibility Card */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] mb-2">Automated Compliance</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${user && differenceInMonths(new Date(), new Date(user.createdAt)) >= 3 ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"}`}>
                  <FiShield size={16} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800 uppercase tracking-wide">Membership Tenure</p>
                  <p className="text-[10px] text-slate-400 font-bold">Minimum 3 months required.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${loanAmount > 0 && loanAmount <= (parseFloat(stats?.mySavingsNumeric || 0) * 3) ? "bg-green-50 text-green-500" : (loanAmount > 0 ? "bg-red-50 text-red-500" : "bg-slate-50 text-slate-300")}`}>
                   <FaNairaSign size={14} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800 uppercase tracking-wide">Savings Threshold</p>
                  <p className="text-[10px] text-slate-400 font-bold">Loan cannot exceed 3x your savings.</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mt-6">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">System Feedback</p>
              <ul className="space-y-1">
                {eligibility.reasons.length > 0 ? (
                  eligibility.reasons.map((r, i) => (
                    <li key={i} className={`text-[9px] font-bold leading-tight flex items-start gap-2 ${r.includes('Required') || r.includes('Maximum') ? 'text-red-500' : 'text-slate-500'}`}>
                      <span>•</span> {r}
                    </li>
                  ))
                ) : (
                  <li className="text-[9px] text-green-600 font-bold leading-tight flex items-start gap-2 italic">
                    <span>✓</span> All compliance checks passed.
                  </li>
                )}
              </ul>
            </div>

            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting || !eligibility.passed}
              className="w-full py-4 bg-blue-600 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-95 mt-4"
            >
              {isSubmitting ? "Processing Request..." : "Submit Application"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanApplication;
