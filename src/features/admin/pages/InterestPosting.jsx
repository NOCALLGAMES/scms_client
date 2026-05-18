import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FiPercent,
  FiPlay,
  FiRefreshCw,
  FiCalendar,
  FiInfo,
  FiCheckCircle,
  FiUsers,
  FiActivity,
  FiEye,
  FiAlertCircle,
  FiX,
  FiLayers,
  FiShield,
  FiTrash2,
} from "react-icons/fi";
import {
  getPostingStats,
  processPosting,
  getPostingHistory,
  approvePosting,
  rejectPosting,
} from "../services/interestApi";
import { getSavingsProducts } from "../../savings/services/savingsApi";
import toast from "react-hot-toast";
import { useConfirm } from "../../../contexts/ConfirmationContext";

const InterestPosting = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Form State
  const [rate, setRate] = useState(5.5);
  const [taxRate, setTaxRate] = useState(10);
  const [minBalance, setMinBalance] = useState(5000);
  const [targetProductId, setTargetProductId] = useState("all");
  const [postingType, setPostingType] = useState("interest");
  const [period, setPeriod] = useState(
    `Monthly-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
  );
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Data State
  const [statsData, setStatsData] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [savingsProducts, setSavingsProducts] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);

  const [dryRunResult, setDryRunResult] = useState(null);
  const [showDryRunModal, setShowDryRunModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);

  const confirm = useConfirm();

  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const data = await getPostingStats({
        type: postingType,
        rate: Math.ceil(parseFloat(rate) || 0),
        productId: targetProductId,
        minBalanceSource: Math.ceil(parseFloat(minBalance) || 0),
        taxRate: Math.ceil(parseFloat(taxRate) || 0)
      });
      setStatsData(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load statistics");
    } finally {
      setIsLoadingStats(false);
    }
  }, [postingType, rate, targetProductId, minBalance, taxRate]);

  const fetchData = async () => {
    setIsLoadingHistory(true);
    setIsLoadingProducts(true);
    try {
      const [logs, products] = await Promise.all([
        getPostingHistory(),
        getSavingsProducts()
      ]);
      setHistoryLogs(logs.logs || []);
      setSavingsProducts(products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingHistory(false);
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchStats(), 500);
    return () => clearTimeout(timer);
  }, [fetchStats]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleDryRun = async () => {
    setIsProcessing(true);
    const toastId = toast.loading("Executing Dry Run...");
    try {
      const res = await processPosting({
        type: postingType,
        period,
        rate: Math.ceil(parseFloat(rate) || 0),
        targetProductId,
        minBalance: Math.ceil(parseFloat(minBalance) || 0),
        taxRate: Math.ceil(parseFloat(taxRate) || 0),
        isDryRun: true,
      });
      setDryRunResult(res.data);
      setShowDryRunModal(true);
      toast.success("Dry Run completed", { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || "Dry Run failed", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePropose = async () => {
    if (!isConfirmed) {
      toast.error("Please confirm the configuration before proposing.");
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading("Proposing distributions...");
    try {
      await processPosting({
        type: postingType,
        period,
        rate: Math.ceil(parseFloat(rate) || 0),
        targetProductId,
        minBalance: Math.ceil(parseFloat(minBalance) || 0),
        taxRate: Math.ceil(parseFloat(taxRate) || 0),
        isDryRun: false,
      });
      toast.success("Distribution proposed! A second admin must approve this.", { id: toastId, duration: 5000 });
      setIsConfirmed(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Proposal failed", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    const toastId = toast.loading("Finalizing distribution across accounts...");
    try {
      await approvePosting(selectedProposal.id);
      toast.success("Interest posted successfully!", { id: toastId });
      setShowApproveModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Approval failed", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    const confirmResult = await confirm({
      title: "Reject Proposal?",
      message: "This will remove the proposed distribution and an admin will need to re-propose it. Are you sure?",
      type: "danger"
    });

    if (!confirmResult) return;

    setIsProcessing(true);
    try {
      await rejectPosting(selectedProposal.id, { remarks: "Rejected by auditor" });
      toast.success("Proposal rejected");
      setShowApproveModal(false);
      fetchData();
    } catch (err) {
      toast.error("Action failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const stats = useMemo(() => [
    {
      label: "Eligible Members",
      value: isLoadingStats ? "..." : statsData?.eligibleMembers?.toLocaleString() || "0",
      icon: <FiUsers className="text-blue-500" />,
    },
    {
      label: "Total Volume",
      value: isLoadingStats ? "..." : `\u20A6${statsData?.totalVolume || "0"}`,
      icon: <FiActivity className="text-green-500" />,
    },
    {
      label: "Net Distribution",
      value: isLoadingStats ? "..." : `\u20A6${statsData?.netDistribution || "0"}`,
      subValue: `Tax Deduct: \u20A6${statsData?.estimatedTax || "0"}`,
      icon: <FiPercent className="text-amber-500" />,
    },
  ], [statsData, isLoadingStats]);

  const handlePeriodChange = (e) => {
    const val = e.target.value;
    const now = new Date();
    if (val === "monthly_interest") {
      setPeriod(`Monthly-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
      setPostingType("interest");
      setRate(5.5);
    } else if (val === "annual_dividend") {
      setPeriod(`FY-${now.getFullYear()}`);
      setPostingType("dividend");
      setRate(12.0);
      setTargetProductId("all");
    }
  };

  const pendingProposals = useMemo(() => 
    historyLogs.filter(log => log.status === 'proposed'), 
  [historyLogs]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <FiShield size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Accounting Controls</h1>
            <p className="text-slate-500 text-sm">Interest Distribution & Maker-Checker Workflow</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
        >
          <FiRefreshCw className={isLoadingHistory ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
              {React.cloneElement(stat.icon, { size: 100 })}
            </div>
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-2xl shadow-inner">
              {stat.icon}
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              {stat.label}
            </p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">
              {stat.value}
            </h3>
            {stat.subValue && (
              <p className="text-[10px] text-red-500 font-bold mt-2 flex items-center capitalize">
                <FiInfo className="mr-1" /> {stat.subValue}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Configuration Section */}
        <div className="lg:col-span-4 bg-white rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-100 p-8 space-y-8">
           <div className="space-y-6">
            <div className="flex items-center space-x-2 text-blue-600 font-black text-xs uppercase tracking-widest">
              <FiPercent /> <span>Disburment Engine</span>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Operation Type</label>
                <select
                  onChange={handlePeriodChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none text-sm font-bold text-slate-700 transition-all"
                >
                  <option value="monthly_interest">Monthly Interest (Savings)</option>
                  <option value="annual_dividend">Annual Dividend (Share Capital)</option>
                </select>
              </div>

              {postingType === 'interest' && (
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Target Product</label>
                  <select
                    value={targetProductId}
                    onChange={(e) => setTargetProductId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none text-sm font-bold text-slate-700 transition-all"
                  >
                    <option value="all">All Savings Products</option>
                    {savingsProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Distribution Rate (%)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-blue-600 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">WHT Rate (%)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-red-500 outline-none focus:ring-4 focus:ring-red-100 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Min Eligibility Balance (\u20A6)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={minBalance}
                  onChange={(e) => setMinBalance(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Period Identifier</label>
                <div className="relative">
                  <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100"
                    placeholder="e.g. FY-2024"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <button
                onClick={handleDryRun}
                disabled={isProcessing}
                className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all text-sm"
              >
                <FiEye /> <span>Dry Run Preview</span>
              </button>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <label className="flex items-start cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isConfirmed}
                    onChange={(e) => setIsConfirmed(e.target.checked)}
                    className="mt-1 w-5 h-5 border-amber-200 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="ml-3 text-[11px] font-bold text-amber-700 leading-relaxed">
                    I confirm this rate and criteria are audit-ready for {period}.
                  </span>
                </label>
              </div>

              <button
                onClick={handlePropose}
                disabled={isProcessing || !isConfirmed || statsData?.eligibleMembers === 0}
                className={`w-full flex items-center justify-center space-x-2 py-4 rounded-2xl font-black transition-all shadow-lg ${
                  !isConfirmed || isProcessing || statsData?.eligibleMembers === 0
                    ? "bg-slate-100 text-slate-350 cursor-not-allowed shadow-none"
                    : "bg-slate-900 border-2 border-slate-900 hover:bg-white hover:text-slate-900 text-white shadow-slate-200 active:scale-95"
                }`}
              >
                <FiLayers /> <span>Propose Distribution</span>
              </button>
            </div>
           </div>
        </div>

        {/* Queue and History Section */}
        <div className="lg:col-span-8 space-y-8">
          {/* Pending Approvals Queue */}
          <div className="bg-white rounded-[2rem] border border-blue-100 shadow-xl shadow-blue-50/50 p-8">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-black text-slate-800 flex items-center">
                 <FiShield className="mr-3 text-blue-600" /> Administrative Review Queue
               </h3>
               <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase">
                 {pendingProposals.length} Pending
               </span>
            </div>

            {pendingProposals.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-3xl">
                <FiCheckCircle size={40} className="mx-auto text-slate-100 mb-4" />
                <p className="text-slate-400 font-bold text-sm">Review queue is empty.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingProposals.map(proposal => (
                  <div key={proposal.id} className="group flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-blue-50/20 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-slate-100 font-black text-xs">
                        {proposal.type[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 text-sm capitalize">{proposal.type?.replace(/_/g, " ")} Distribution</h4>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{proposal.period}</span>
                          <span className="text-slate-300">\u2022</span>
                          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{proposal.rate}% Rate</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-black text-slate-800">\u20A6{Number(proposal.totalAmount).toLocaleString()}</p>
                        <p className="text-[10px] font-bold text-slate-400">{proposal.beneficiaryCount} Members</p>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedProposal(proposal);
                          setShowApproveModal(true);
                        }}
                        className="bg-white px-5 py-2.5 rounded-xl border border-blue-100 text-blue-600 text-xs font-black shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all active:scale-95"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recently Completed Logs */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
            <h3 className="text-lg font-black text-slate-800 mb-6">Posting Architecture Logs</h3>
            <div className="space-y-3">
              {historyLogs.filter(log => log.status === 'completed' || log.status === 'rejected').slice(0, 5).map(log => (
                <div key={log.id} className="flex items-center justify-between p-4 bg-white border border-slate-50 rounded-2xl hover:border-slate-200 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${log.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {log.status === 'completed' ? <FiCheckCircle size={14} /> : <FiX size={14} />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h5 className="text-xs font-black text-slate-800 capitalize leading-none">{log.type?.replace(/_/g, " ")} Run</h5>
                        <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${log.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {log.status?.replace(/_/g, " ")}
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                        {log.period} \u2022 {new Date(log.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-800">\u20A6{Number(log.totalAmount).toLocaleString()}</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase">{log.beneficiaryCount} Beneficiaries</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dry Run Modal */}
      {showDryRunModal && dryRunResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 bg-slate-50">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 flex items-center">
                    <FiEye className="mr-3 text-blue-600" /> Simulation Preview
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-bold">Auditing internal distribution before proposal</p>
                </div>
                <button onClick={() => setShowDryRunModal(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors">
                  <FiX size={20} />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900 text-white p-6 rounded-3xl">
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Accounts</div>
                  <div className="font-black text-lg">{dryRunResult.summary.beneficiaryCount}</div>
                </div>
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Gross</div>
                  <div className="font-black text-lg text-blue-400">\u20A6{dryRunResult.summary.totalGrossAmount}</div>
                </div>
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">WHT Deduct</div>
                  <div className="font-black text-lg text-red-400">-\u20A6{dryRunResult.summary.totalTaxAmount}</div>
                </div>
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Payout</div>
                  <div className="font-black text-lg text-green-400">\u20A6{dryRunResult.summary.netAmount}</div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Granular Breakdown (Sample)</h3>
                <div className="border border-slate-100 rounded-3xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                      <tr>
                        <th className="px-6 py-4">Account</th>
                        <th className="px-6 py-4 text-right">Current Bal.</th>
                        <th className="px-6 py-4 text-right">Tax (WHT)</th>
                        <th className="px-6 py-4 text-right">Net Credit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {dryRunResult?.preview?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-black text-slate-700">#{item.accountId}</td>
                          <td className="px-6 py-4 text-right text-slate-500 font-bold">\u20A6{Number(item.currentBalance).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right text-red-400 font-black">- \u20A6{item.taxDeduction}</td>
                          <td className="px-6 py-4 text-right font-black text-green-600">+ \u20A6{item.netPayout}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Review Modal */}
      {showApproveModal && selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5">
             <div className="px-10 py-10 space-y-8">
               <div className="text-center space-y-4">
                 <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                   <FiShield size={40} />
                 </div>
                 <div>
                   <h2 className="text-2xl font-black text-slate-800">Review Disbursement</h2>
                   <p className="text-slate-500 text-sm font-medium">Verify the distribution parameters for {selectedProposal.period}</p>
                 </div>
               </div>

               <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Operation Type</span>
                    <span className="font-black text-slate-800 capitalize">{selectedProposal.type?.replace(/_/g, " ")} Posting</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Distribution Rate</span>
                   <span className="font-black text-blue-600">{selectedProposal.rate}%</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Tax Deduction</span>
                   <span className="font-black text-red-500">{selectedProposal.taxRate}% (WHT)</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Beneficiaries</span>
                   <span className="font-black text-slate-800">{selectedProposal.beneficiaryCount} Members</span>
                 </div>
                 <div className="pt-4 border-t border-slate-200 mt-4 flex justify-between items-center">
                   <span className="text-slate-800 font-black uppercase tracking-widest text-xs">Total Net Payout</span>
                   <span className="text-xl font-black text-green-600">\u20A6{(selectedProposal.totalAmount - selectedProposal.taxAmount).toLocaleString()}</span>
                 </div>
               </div>

               <div className="grid grid-cols-1 gap-4">
                 <button
                   onClick={handleApprove}
                   disabled={isProcessing}
                   className="w-full flex items-center justify-center space-x-2 py-5 bg-slate-900 border-2 border-slate-900 text-white rounded-3xl font-black shadow-2xl shadow-slate-200 hover:bg-blue-600 hover:border-blue-600 transition-all active:scale-95"
                 >
                   <FiCheckCircle /> <span>Approve & Execute Distribution</span>
                 </button>
                 <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handleReject}
                      disabled={isProcessing}
                      className="flex items-center justify-center space-x-2 py-4 bg-white border-2 border-red-50 text-red-400 rounded-2xl font-bold hover:bg-red-50 transition-all text-xs"
                    >
                      <FiTrash2 /> <span>Reject Proposal</span>
                    </button>
                    <button
                      onClick={() => setShowApproveModal(false)}
                      disabled={isProcessing}
                      className="flex items-center justify-center space-x-2 py-4 bg-white border-2 border-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-50 transition-all text-xs"
                    >
                      <FiX /> <span>Dismiss</span>
                    </button>
                 </div>
               </div>

               <div className="flex items-center justify-center space-x-2 text-red-400 bg-red-50/50 py-3 px-6 rounded-2xl border border-red-50">
                 <FiAlertCircle size={14} className="flex-shrink-0" />
                 <p className="text-[9px] font-black uppercase leading-tight">This action will modify all eligible ledger balances and cannot be undone.</p>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterestPosting;
