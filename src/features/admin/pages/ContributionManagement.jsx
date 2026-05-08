import React, { useState, useEffect } from "react";
import {
  getMonthlyReport,
  generateMonthlyRecords,
  getContributionStats,
  collectInternalBalance,
  recordCashPayment
} from "../../savings/services/contributionsApi";
import { getAllSettings, updateSetting } from "../services/settingsApi";
import {
  FiUsers, FiSettings, FiRefreshCw, FiAlertCircle,
  FiCheckCircle, FiSearch, FiCalendar,
  FiCreditCard, FiPrinter, FiX
} from "react-icons/fi";
import { FaNairaSign } from "react-icons/fa6";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { triggerJob } from "../services/jobApi";

const ContributionManagement = () => {
  const [report, setReport] = useState([]);
  const [poolStats, setPoolStats] = useState({ poolBalance: 0, stats: [] });
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [selectedType, setSelectedType] = useState("thrift");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunningDeductions, setIsRunningDeductions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reportData, statsData, settingsData] = await Promise.all([
        getMonthlyReport(selectedMonth, selectedType),
        getContributionStats(),
        getAllSettings()
      ]);
      setReport(reportData);
      setPoolStats(statsData);
      setSettings(settingsData);
    } catch (err) {
      toast.error("Failed to load management data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedType]);

  const handleGenerateValues = async () => {
    setIsGenerating(true);
    try {
      await generateMonthlyRecords(selectedMonth);
      toast.success(`Generated records for ${selectedMonth}`);
      fetchData();
    } catch (err) {
      toast.error("Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRunDeductions = async () => {
    if (!window.confirm("Are you sure you want to run the automated deduction process now? This will attempt to collect pending obligations from all members.")) return;
    setIsRunningDeductions(true);
    try {
      await triggerJob('thrift-deductions');
      toast.success('Deduction process executed successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to run deductions');
    } finally {
      setIsRunningDeductions(false);
    }
  };

  const currentThriftAmount = settings.find(s => s.key === 'monthly_thrift_amount')?.value || "5000";
  const currentCommissionAmount = settings.find(s => s.key === 'monthly_commission_amount')?.value || "500";



  const handleCollectInternal = async (id) => {
    setProcessingId(id);
    try {
      await collectInternalBalance(id);
      toast.success("Funds collected from member wallet");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Collection failed");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRecordCash = async (id) => {
    if (!window.confirm("Confirm that you have received physical cash for this obligation?")) return;
    setProcessingId(id);
    try {
      await recordCashPayment(id);
      toast.success("Cash payment recorded successfully");
      fetchData();
    } catch (err) {
      toast.error("Failed to record cash payment");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredReport = report.filter(r =>
    r.user?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    r.user?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  const stats = {
    total: report.length,
    paid: report.filter(r => r.status === 'paid').length,
    pending: report.filter(r => r.status === 'pending' || r.status === 'failed_insufficient').length,
    failed: report.filter(r => r.status === 'failed_insufficient').length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Centralized Thrift Management</h1>
          <p className="text-slate-500 font-medium">Manage monthly collections and cooperative pool</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRunDeductions}
            disabled={isRunningDeductions}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all font-black text-xs shadow-md disabled:opacity-50 uppercase tracking-widest"
          >
            <FiCheckCircle className={isRunningDeductions ? "animate-pulse" : ""} /> {isRunningDeductions ? "Running..." : "Force Deductions Now"}
          </button>
          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-2xl hover:bg-slate-900 transition-all font-black text-xs shadow-md uppercase tracking-widest"
          >
            <FiPrinter /> Print Report
          </button>
          <button
            onClick={handleGenerateValues}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-black text-xs shadow-md disabled:opacity-50 uppercase tracking-widest"
          >
            <FiRefreshCw className={isGenerating ? "animate-spin" : ""} /> {isGenerating ? "Generating..." : "Generate Month"}
          </button>
        </div>
      </div>

      {/* Main Stats Card (Pool Focus) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 flex items-center gap-2">
            <FaNairaSign className="text-blue-400" /> Total Thrift Pool Assets
          </p>
          <h2 className="text-4xl font-black mb-6 tracking-tighter">
            ₦{poolStats.poolBalance.toLocaleString()}
          </h2>
          <div className="flex gap-4">
            <div className="flex-1 bg-white/5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 text-center">
              Current Rate: ₦{parseFloat(currentThriftAmount).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-3 gap-4">
          {[
            { label: "Collection Target", value: stats.total, color: "blue", icon: <FiUsers /> },
            { label: "Successful", value: stats.paid, color: "green", icon: <FiCheckCircle /> },
            { label: "Failed/Low Balance", value: stats.failed, color: "red", icon: <FiAlertCircle /> }
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-${s.color}-50 text-${s.color}-600 mb-4`}>
                {s.icon}
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 leading-none mb-1">{s.value}</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Row (Commission focus) */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white px-8 py-4 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <FiSettings />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Monthly Maintenance Fee</p>
            <p className="text-sm font-black text-slate-800">₦{parseFloat(currentCommissionAmount).toLocaleString()}</p>
          </div>
        </div>
        <div className="px-6 py-2 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-100 italic">
          Standard Rate
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100">
            <FiCalendar className="text-slate-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none text-sm font-black text-slate-700 focus:ring-0 outline-none p-0 w-32"
            />
          </div>
          <div className="flex gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-100">
            {['thrift', 'commission'].map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedType === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="relative w-full md:w-[350px]">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search member..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-5 py-3 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Member Information</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Account Number</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Wallet Balance</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Required</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Loading records...</td></tr>
              ) : filteredReport.length > 0 ? (
                filteredReport.map(res => (
                  <tr key={res.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-3xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 font-black text-sm shadow-sm">
                          {res.user?.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 leading-tight">{res.user?.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">{res.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-mono font-bold text-slate-500">
                        {res.user?.accounts?.[0]?.accountNumber || "N/A"}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-sm font-black ${parseFloat(res.user?.accounts?.[0]?.balance || 0) < parseFloat(res.amount) ? 'text-red-500' : 'text-slate-800'}`}>
                        ₦{parseFloat(res.user?.accounts?.[0]?.balance || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-black text-slate-800 uppercase tracking-tighter">₦{parseFloat(res.amount).toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-sm border ${res.status === 'paid' ? 'bg-green-100 text-green-700 border-green-200' :
                          res.status === 'failed_insufficient' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                        {res.status === 'failed_insufficient' ? 'Low Balance' : res.status?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      {res.status !== 'paid' && (
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => handleCollectInternal(res.id)}
                            disabled={processingId === res.id}
                            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-blue-100 transition-all flex items-center gap-2"
                            title="Deduct from member digital wallet"
                          >
                            <FiCreditCard /> {processingId === res.id ? 'Processing...' : 'Digital'}
                          </button>
                          <button
                            onClick={() => handleRecordCash(res.id)}
                            className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-amber-100 transition-all flex items-center gap-2"
                            title="Record payment received in cash"
                          >
                            <FaNairaSign /> Cash
                          </button>
                        </div>
                      )}
                      {res.status === 'paid' && (
                        <div className="flex items-center justify-end gap-1.5 text-slate-400">
                          {res.collectionMethod === 'cash' ? <FaNairaSign className="text-amber-500" /> : <FiCreditCard className="text-blue-500" />}
                          <span className="text-[10px] font-black uppercase tracking-widest">{res.collectionMethod?.replace(/_/g, " ") || 'Automatic'}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="px-8 py-28 text-center bg-slate-50/30">
                  <div className="max-w-xs mx-auto">
                    <FiAlertCircle className="text-3xl text-slate-300 mx-auto mb-4" />
                    <p className="text-sm font-black text-slate-500 uppercase tracking-widest">No Records Found</p>
                    <button
                      onClick={handleGenerateValues}
                      className="mt-4 text-blue-600 font-black text-xs uppercase tracking-widest hover:text-blue-700"
                    >
                      Generate Records for {selectedMonth}
                    </button>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="px-10 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-800">Print Collection Report</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Review before sending to printer</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-black text-xs shadow-lg uppercase tracking-widest"
                >
                  <FiPrinter /> Confirm Print
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-2.5 bg-white text-slate-400 hover:text-slate-600 rounded-2xl border border-slate-100 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            {/* Modal Content (Printable Area) */}
            <div className="flex-1 overflow-y-auto p-10 print:p-0 bg-white" id="printable-report">
              <style>{`
                @media print {
                  /* Hide everything by default */
                  body * { 
                    visibility: hidden !important; 
                    -webkit-print-color-adjust: exact;
                  }
                  /* Show only the printable area and its contents */
                  #printable-report, #printable-report * { 
                    visibility: visible !important; 
                  }
                  /* Position the printable area at the very top of the page */
                  #printable-report { 
                    position: absolute !important; 
                    left: 0 !important; 
                    top: 0 !important; 
                    width: 100% !important; 
                    margin: 0 !important;
                    padding: 0 !important;
                    background: white !important;
                  }
                  /* Remove any scrolling/overflow from parents during print */
                  html, body {
                    height: auto !important;
                    overflow: visible !important;
                  }
                  /* Ensure background colors are printed */
                  .bg-slate-50 { background-color: #f8fafc !important; }
                  .bg-green-50 { background-color: #f0fdf4 !important; }
                  .bg-red-50 { background-color: #fef2f2 !important; }
                  .bg-blue-50 { background-color: #eff6ff !important; }
                }
              `}</style>
              <div className="max-w-4xl mx-auto border border-slate-100 p-12 rounded-[2rem]">
                <div className="flex justify-between items-start mb-12 border-b border-slate-100 pb-8">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">SCMS COOPERATIVE</h2>
                    <p className="text-xs font-black text-blue-600 uppercase tracking-[0.3em]">Monthly Collection Report</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Report Period</p>
                    <p className="text-lg font-black text-slate-800">{format(new Date(selectedMonth), "MMMM yyyy")}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4 mb-1">Type</p>
                    <p className="text-sm font-black text-slate-800 capitalize">{selectedType}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-6 mb-12">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Total</p>
                    <p className="text-xl font-black text-slate-800">{stats.total}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-2xl">
                    <p className="text-[8px] font-black text-green-400 uppercase tracking-widest mb-1">Successful</p>
                    <p className="text-xl font-black text-green-700">{stats.paid}</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-2xl">
                    <p className="text-[8px] font-black text-red-400 uppercase tracking-widest mb-1">Pending/Failed</p>
                    <p className="text-xl font-black text-red-700">{stats.pending}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-2xl">
                    <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Value</p>
                    <p className="text-xl font-black text-blue-700">₦{(stats.paid * parseFloat(selectedType === 'thrift' ? currentThriftAmount : currentCommissionAmount)).toLocaleString()}</p>
                  </div>
                </div>

                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-900">
                      <th className="py-4 text-[10px] font-black text-slate-900 uppercase tracking-widest">Member Name</th>
                      <th className="py-4 text-[10px] font-black text-slate-900 uppercase tracking-widest">Account #</th>
                      <th className="py-4 text-[10px] font-black text-slate-900 uppercase tracking-widest text-right">Amount</th>
                      <th className="py-4 text-[10px] font-black text-slate-900 uppercase tracking-widest text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredReport.map(r => (
                      <tr key={r.id}>
                        <td className="py-4">
                          <p className="text-sm font-black text-slate-800">{r.user?.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">{r.user?.email}</p>
                        </td>
                        <td className="py-4 text-xs font-mono font-bold text-slate-600">
                          {r.user?.accounts?.[0]?.accountNumber || "N/A"}
                        </td>
                        <td className="py-4 text-sm font-black text-slate-800 text-right">
                          ₦{parseFloat(r.amount).toLocaleString()}
                        </td>
                        <td className="py-4 text-right">
                          <span className={`text-[10px] font-black uppercase ${r.status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                            {r.status?.replace(/_/g, " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-20 flex justify-between border-t border-slate-100 pt-8">
                  <div className="text-center">
                    <div className="w-40 border-b border-slate-400 mb-2"></div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Prepared By</p>
                  </div>
                  <div className="text-center">
                    <div className="w-40 border-b border-slate-400 mb-2"></div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Authorized Signature</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContributionManagement;
