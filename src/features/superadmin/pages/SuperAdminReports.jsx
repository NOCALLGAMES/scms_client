import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPlatformReportSummary } from "../../admin/services/superAdminApi";
import { 
  FiTrendingUp, 
  FiBox, 
  FiUsers, 
  FiBriefcase, 
  FiAlertTriangle, 
  FiDownload, 
  FiPrinter, 
  FiCalendar, 
  FiRefreshCw, 
  FiFileText, 
  FiDollarSign, 
  FiPercent, 
  FiArrowUpRight, 
  FiArrowDownRight,
  FiShield
} from "react-icons/fi";
import { FaNairaSign } from "react-icons/fa6";
import { useBrand } from "../../../contexts/BrandContext";

const SuperAdminReports = () => {
  const { getBrandText, getBrandBg, getBrandBgLight } = useBrand();
  const [activeTab, setActiveTab] = useState("overview");
  const [filterType, setFilterType] = useState("month"); // 'month', '30days', 'all', 'custom'
  const [customDates, setCustomDates] = useState({
    startDate: "",
    endDate: ""
  });

  // Calculate dates based on filterType
  const getQueryParams = () => {
    const params = {};
    const today = new Date();
    
    if (filterType === "30days") {
      const past30 = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      params.startDate = past30.toISOString().split("T")[0];
      params.endDate = today.toISOString().split("T")[0];
    } else if (filterType === "month") {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      params.startDate = startOfMonth.toISOString().split("T")[0];
      params.endDate = today.toISOString().split("T")[0];
    } else if (filterType === "custom") {
      if (customDates.startDate) params.startDate = customDates.startDate;
      if (customDates.endDate) params.endDate = customDates.endDate;
    }
    return params;
  };

  const queryParams = getQueryParams();

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["platform-report-summary", queryParams],
    queryFn: () => getPlatformReportSummary(queryParams),
    keepPreviousData: true
  });

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 2
    }).format(val || 0);

  const formatNumber = (val) =>
    new Intl.NumberFormat("en-US").format(val || 0);

  // CSV Export utility
  const exportToCSV = (csvData, fileName) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    const headers = Object.keys(csvData[0]).join(",");
    csvContent += headers + "\r\n";

    // Add rows
    csvData.forEach((row) => {
      const rowStr = Object.values(row)
        .map((value) => {
          // Escape strings containing commas
          const str = String(value);
          return str.includes(",") ? `"${str}"` : str;
        })
        .join(",");
      csvContent += rowStr + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportInstitutionCSV = () => {
    if (!data?.institutionSummary || data.institutionSummary.length === 0) return;
    const exportData = data.institutionSummary.map((inst) => ({
      InstitutionName: inst.name,
      Code: inst.code,
      Status: inst.status,
      MemberCount: inst.memberCount,
      AUM_Balance: inst.balance,
      OutstandingLoans: inst.outstandingLoans,
      TransactionVolume: inst.txnVolume,
      TransactionCount: inst.txnCount
    }));
    exportToCSV(exportData, `institution_summary_report_${new Date().toISOString().split("T")[0]}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const vitals = data?.vitals || {};
  const transactionMetrics = data?.transactionMetrics || [];
  const highValueAlerts = data?.highValueAlerts || [];
  const institutionSummary = data?.institutionSummary || [];

  // Compute calculated metrics
  const defaultRate = vitals.totalOutstandingLoans 
    ? (vitals.defaultedLoansAmount / vitals.totalOutstandingLoans) * 100 
    : 0;

  const totalTxnVolume = transactionMetrics.reduce((sum, item) => sum + parseFloat(item.totalAmount || 0), 0);
  const totalTxnCount = transactionMetrics.reduce((sum, item) => sum + parseInt(item.count || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12 print:bg-white print:pb-0">
      
      {/* ─── Top Dashboard Header ─────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center space-x-2">
            <FiTrendingUp className="text-[#006a61]" />
            <span>Platform Financial Reports</span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">
            Aggregated system-wide bookkeeping, audit flags, and institution comparisons.
          </p>
        </div>
        
        {/* Actions bar */}
        <div className="flex items-center space-x-3 self-end md:self-auto">
          <button 
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 font-bold text-xs text-gray-700 shadow-sm transition-all"
          >
            <FiPrinter />
            <span>Print Report</span>
          </button>
          
          <button 
            onClick={() => refetch()}
            className={`flex items-center justify-center p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 shadow-sm transition-all ${isFetching ? 'animate-spin' : ''}`}
            title="Refresh statistics"
          >
            <FiRefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* ─── Filter Section (Print-friendly / Hidden in screen if print) ──────── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8 print:border-none print:shadow-none print:p-0 print:mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-2 print:hidden">
            <FiCalendar className="text-gray-400" />
            <span className="text-sm font-bold text-gray-500">Reporting Interval:</span>
            <div className="inline-flex rounded-lg border border-gray-150 p-1 bg-gray-50">
              {[
                { label: "This Month", val: "month" },
                { label: "Last 30 Days", val: "30days" },
                { label: "All Time", val: "all" },
                { label: "Custom Range", val: "custom" }
              ].map((t) => (
                <button
                  key={t.val}
                  onClick={() => setFilterType(t.val)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    filterType === t.val 
                      ? "bg-white text-[#006a61] shadow-sm border border-gray-150" 
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="print:block hidden border-b border-gray-200 pb-4 mb-4 w-full">
            <h2 className="text-lg font-bold text-gray-800">Platform Overview Audit Report</h2>
            <p className="text-xs text-gray-500 font-semibold">
              Reporting period: {queryParams.startDate ? `${queryParams.startDate} to ${queryParams.endDate || 'Now'}` : "All Time Records"}
            </p>
          </div>

          {filterType === "custom" && (
            <div className="flex items-center space-x-3 animate-in slide-in-from-left duration-250 print:hidden">
              <input
                type="date"
                value={customDates.startDate}
                onChange={(e) => setCustomDates({ ...customDates, startDate: e.target.value })}
                className="px-3 py-2 text-xs font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#006a61]"
              />
              <span className="text-xs font-bold text-gray-400">to</span>
              <input
                type="date"
                value={customDates.endDate}
                onChange={(e) => setCustomDates({ ...customDates, endDate: e.target.value })}
                className="px-3 py-2 text-xs font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#006a61]"
              />
            </div>
          )}
        </div>
      </div>

      {/* ─── Financial Vitals Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aggregate Savings</p>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
                {isLoading ? "—" : formatCurrency(vitals.totalSavings)}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <FaNairaSign size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3 font-semibold">Total target & regular accounts</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Outstanding Loans</p>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
                {isLoading ? "—" : formatCurrency(vitals.totalOutstandingLoans)}
              </h3>
            </div>
            <div className="p-3 bg-brand-50 rounded-xl text-brand-600" style={getBrandBgLight()}>
              <FiBriefcase size={20} style={getBrandText()} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3 font-semibold">Total active platform credit exposure</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total system funds</p>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
                {isLoading ? "—" : formatCurrency(vitals.totalSystemFunds)}
              </h3>
            </div>
            <div className="p-3 bg-green-50 rounded-xl text-green-600">
              <FiDollarSign size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3 font-semibold">Cash pool across all sub-accounts</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Default Risk Ratio</p>
              <h3 className="text-xl sm:text-2xl font-black text-red-600 mt-2">
                {isLoading ? "—" : `${defaultRate.toFixed(2)}%`}
              </h3>
            </div>
            <div className="p-3 bg-red-50 rounded-xl text-red-600">
              <FiAlertTriangle size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3 font-semibold">
            {formatCurrency(vitals.defaultedLoansAmount)} defaulted
          </p>
        </div>
      </div>

      {/* ─── Tab Bar (Screen only) ────────────────────────────────────────────── */}
      <div className="flex border-b border-gray-200 mb-8 print:hidden overflow-x-auto custom-scrollbar">
        {[
          { id: "overview", label: "Financial Metrics", icon: <FiTrendingUp /> },
          { id: "institutions", label: "Institution Performance", icon: <FiBox /> },
          { id: "compliance", label: "Compliance (Large Operations)", icon: <FiShield /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 border-b-2 font-bold text-xs whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "border-[#006a61] text-[#006a61]"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ─── TAB CONTENT: OVERVIEW ────────────────────────────────────────────── */}
      {(activeTab === "overview" || window.matchMedia("print").matches) && (
        <div className={`space-y-8 ${activeTab !== "overview" ? "print:block hidden" : ""}`}>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Transaction types distribution summary (2/3) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 print:border-none print:shadow-none print:p-0">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-base font-bold text-gray-800">Operational Cash flow by Transaction Type</h2>
                <span className="text-xs text-gray-400 font-bold uppercase print:hidden">
                  Vol: {formatCurrency(totalTxnVolume)}
                </span>
              </div>
              
              {isLoading ? (
                <div className="p-20 text-center text-gray-400 italic text-sm">Syncing ledger records...</div>
              ) : transactionMetrics.length === 0 ? (
                <div className="p-20 text-center text-gray-400 italic text-sm">No transaction records found for this period.</div>
              ) : (
                <div className="space-y-6">
                  {transactionMetrics.map((item) => {
                    const ratio = totalTxnVolume ? (parseFloat(item.totalAmount) / totalTxnVolume) * 100 : 0;
                    const isCredit = ['deposit', 'loan_repayment', 'share_purchase', 'transfer_in'].includes(item.transactionType);
                    
                    return (
                      <div key={item.transactionType}>
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                              {item.transactionType?.replace(/_/g, " ")}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold ml-2">({item.count} ops)</span>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs font-black ${isCredit ? 'text-green-600' : 'text-orange-600'}`}>
                              {formatCurrency(item.totalAmount)}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold ml-2">({ratio.toFixed(1)}%)</span>
                          </div>
                        </div>
                        <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCredit ? 'bg-green-500' : 'bg-orange-500'
                            }`}
                            style={{ width: `${ratio}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Platform indicators (1/3) */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 print:border-none print:shadow-none print:p-0">
              <h2 className="text-base font-bold text-gray-800 mb-6">Platform Vitals summary</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-gray-500">Institution Active Rate</span>
                    <span className="text-xs font-black text-gray-800">
                      {vitals.totalInstitutions ? ((vitals.activeInstitutions / vitals.totalInstitutions) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#006a61] rounded-full" 
                      style={{ width: vitals.totalInstitutions ? `${(vitals.activeInstitutions / vitals.totalInstitutions) * 100}%` : '0%' }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-gray-500">Net Flow Leverage</span>
                    <span className="text-xs font-black text-green-600">Healthy</span>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-150 rounded-xl">
                    <p className="text-[11px] text-green-800 font-semibold leading-relaxed">
                      Deposit and savings accumulation are outstripping outstanding loan claims, showing healthy capital adequacy.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                    <span>Institutions Count</span>
                    <span className="text-gray-800">{vitals.totalInstitutions || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                    <span>Total Members</span>
                    <span className="text-gray-800">{(vitals.totalUsers || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-gray-500">
                    <span>Total Disbursed Credit</span>
                    <span className="text-gray-800">{formatCurrency(vitals.totalLoansDisbursed)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB CONTENT: INSTITUTIONS ────────────────────────────────────────── */}
      {(activeTab === "institutions" || window.matchMedia("print").matches) && (
        <div className={`space-y-8 ${activeTab !== "institutions" ? "print:block hidden" : ""}`}>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
            <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 print:bg-transparent print:border-b-2 print:px-0">
              <div>
                <h2 className="text-base font-bold text-gray-800">Institution Performance breakdown</h2>
                <p className="text-xs text-gray-400 font-medium mt-1">Comparing asset values and user bases per tenant</p>
              </div>
              <button 
                onClick={handleExportInstitutionCSV}
                className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 font-bold text-xs text-gray-600 shadow-sm transition-all self-end sm:self-auto print:hidden"
              >
                <FiDownload />
                <span>Export CSV</span>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/30 border-b border-gray-100 print:bg-transparent">
                    <th className="px-6 py-4 print:px-2">Institution</th>
                    <th className="px-6 py-4 text-center">Members</th>
                    <th className="px-6 py-4 text-right">AUM (Savings)</th>
                    <th className="px-6 py-4 text-right">Loan exposure</th>
                    <th className="px-6 py-4 text-right print:hidden">Txn Volume ({filterType === 'all' ? 'All Time' : 'Period'})</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="p-10 text-center text-gray-400 italic text-sm">
                        Calculating tenant performance ledger...
                      </td>
                    </tr>
                  ) : institutionSummary.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-10 text-center text-gray-400 italic text-sm">
                        No institution details found.
                      </td>
                    </tr>
                  ) : (
                    institutionSummary.map((inst) => (
                      <tr key={inst.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 print:px-2">
                          <p className="text-sm font-bold text-gray-900">{inst.name}</p>
                          <p className="text-[10px] text-gray-450 font-bold uppercase">{inst.code}</p>
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                          {inst.memberCount || 0}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                          {formatCurrency(inst.balance)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                          {formatCurrency(inst.outstandingLoans)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-bold text-gray-700 print:hidden">
                          {formatCurrency(inst.txnVolume)}
                          <span className="text-[10px] text-gray-400 font-medium block">({inst.txnCount} txns)</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                            inst.status === 'active' 
                              ? 'bg-green-50 text-green-700 border-green-100' 
                              : 'bg-red-50 text-red-700 border-red-100'
                          }`}>
                            {inst.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB CONTENT: COMPLIANCE ──────────────────────────────────────────── */}
      {(activeTab === "compliance" || window.matchMedia("print").matches) && (
        <div className={`space-y-8 ${activeTab !== "compliance" ? "print:block hidden" : ""}`}>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 print:border-none print:shadow-none print:p-0">
            <div className="flex items-center space-x-3 mb-6">
              <FiShield className="text-amber-500 text-xl" />
              <div>
                <h2 className="text-base font-bold text-gray-800">Compliance & Large Operations Feed</h2>
                <p className="text-xs text-gray-400 font-medium">Flagging all transactions exceeding ₦1,000,000 threshold for audit review</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/30 border-b border-gray-100 print:bg-transparent">
                    <th className="px-6 py-4 print:px-2">Reference</th>
                    <th className="px-6 py-4">Beneficiary/User</th>
                    <th className="px-6 py-4">Institution</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4 text-right">Value</th>
                    <th className="px-6 py-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="p-10 text-center text-gray-400 italic text-sm">
                        Scanning compliance records...
                      </td>
                    </tr>
                  ) : highValueAlerts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-10 text-center text-gray-400 italic text-sm">
                        No compliance exceptions flagged during this period.
                      </td>
                    </tr>
                  ) : (
                    highValueAlerts.map((txn) => {
                      const isCredit = ['deposit', 'loan_repayment', 'share_purchase', 'transfer_in'].includes(txn.transactionType);
                      return (
                        <tr key={txn.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 print:px-2 font-mono text-xs font-bold text-gray-700">
                            {txn.reference}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-gray-900">{txn.account?.user?.name || "System"}</p>
                            <p className="text-[10px] text-gray-400">{txn.account?.user?.email || "internal@system"}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs font-bold text-gray-800">{txn.institution?.name}</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase">{txn.institution?.code}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                              {txn.transactionType?.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-black text-gray-900">
                            <span className={isCredit ? 'text-green-600' : 'text-orange-600'}>
                              {formatCurrency(txn.amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-xs text-gray-500 font-medium">
                            {new Date(txn.createdAt).toLocaleDateString()}
                            <span className="block text-[10px] text-gray-400 font-medium">
                              {new Date(txn.createdAt).toLocaleTimeString()}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperAdminReports;
