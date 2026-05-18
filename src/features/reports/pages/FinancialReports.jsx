import React, { useState, useEffect } from "react";
import {
  FiDownload,
  FiPrinter,
  FiFilter,
  FiCalendar,
  FiSearch,
  FiLoader,
  FiActivity,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiRefreshCw,
} from "react-icons/fi";
import { exportToCSV } from "../../../shared/utils/exportUtils";
import api from "../../../lib/api";
import toast from "react-hot-toast";

const FinancialReports = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    transactionType: "all",
  });

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/reports/transactions", {
        params: filters
      });
      setTransactions(data.data.transactions || []);
      toast.success("Report updated");
    } catch (error) {
      toast.error("Failed to fetch transaction report");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const totalInflow = transactions
    .filter(t => ['deposit', 'transfer_in', 'loan_repayment'].includes(t.transactionType))
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalOutflow = transactions
    .filter(t => ['withdrawal', 'transfer_out', 'loan_disbursement'].includes(t.transactionType))
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const handlePrint = () => {
    const style = document.createElement('style');
    style.id = 'print-report-styles';
    style.innerHTML = `
      @media print {
        body * { visibility: hidden !important; }
        #report-print-area, #report-print-area * { visibility: visible !important; }
        #report-print-area { position: fixed; top: 0; left: 0; width: 100%; padding: 24px; }
        .no-print { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    window.print();
    document.head.removeChild(style);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <FiActivity className="text-blue-600" />
            System Transaction Report
          </h1>
          <p className="text-slate-500 font-medium">
            Monitor and export all cooperative financial activities across the system.
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button 
            onClick={handlePrint}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center text-slate-700 font-bold text-sm shadow-sm transition-all active:scale-95"
          >
            <FiPrinter className="mr-2" />
            Print Report
          </button>
          <button 
            onClick={() => {
              exportToCSV(transactions, "system_transaction_report");
              toast.success("Exporting report to CSV...");
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center font-bold text-sm shadow-lg shadow-blue-900/10 transition-all active:scale-95"
          >
            <FiDownload className="mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
              <FiArrowDownLeft size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Inflow</p>
              <h3 className="text-2xl font-black text-slate-800">₦{totalInflow.toLocaleString()}</h3>
            </div>
          </div>
          <div className="h-1 bg-slate-50 rounded-full overflow-hidden">
             <div className="h-full bg-green-500 w-full"></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
              <FiArrowUpRight size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Outflow</p>
              <h3 className="text-2xl font-black text-slate-800">₦{totalOutflow.toLocaleString()}</h3>
            </div>
          </div>
          <div className="h-1 bg-slate-50 rounded-full overflow-hidden">
             <div className="h-full bg-red-500 w-full"></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <FiActivity size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Volume</p>
              <h3 className="text-2xl font-black text-slate-800">₦{(totalInflow - totalOutflow).toLocaleString()}</h3>
            </div>
          </div>
          <div className="h-1 bg-slate-50 rounded-full overflow-hidden">
             <div className="h-full bg-blue-500 w-full"></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 no-print">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Transaction Type
            </label>
            <select
              value={filters.transactionType}
              onChange={(e) => setFilters({ ...filters, transactionType: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-slate-700"
            >
              <option value="all">All Transactions</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="loan_disbursement">Loan Disbursements</option>
              <option value="loan_repayment">Loan Repayments</option>
              <option value="interest">Interest Posting</option>
              <option value="dividend">Dividend Posting</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              From Date
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              To Date
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none"
              />
            </div>
          </div>
          <button 
            onClick={fetchReports}
            disabled={isLoading}
            className="w-full py-3.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 flex items-center justify-center font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <FiRefreshCw className="animate-spin mr-2" /> : <FiFilter className="mr-2" />}
            Filter Report
          </button>
        </div>
      </div>

      {/* Transaction Table — this is the only thing that prints */}
      <div id="report-print-area" className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        {/* Print-only header */}
        <div className="hidden print:block p-8 border-b border-slate-100">
          <h2 className="text-2xl font-black text-slate-800">System Transaction Report</h2>
          <p className="text-slate-500 text-sm mt-1">
            Period: {filters.startDate || 'All time'} — {filters.endDate || 'Present'} &nbsp;|&nbsp;
            Type: {filters.transactionType === 'all' ? 'All Transactions' : filters.transactionType} &nbsp;|&nbsp;
            Generated: {new Date().toLocaleString()}
          </p>
        </div>

        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Recent Financial Activity</h3>
          <span className="px-4 py-1 bg-slate-50 text-slate-500 rounded-full text-xs font-bold uppercase tracking-widest">
            {transactions.length} Records Found
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <FiLoader className="animate-spin mx-auto text-blue-600 mb-4" size={32} />
                    <p className="text-slate-400 font-bold">Synchronizing ledger data...</p>
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((trx) => {
                   const isCredit = ['deposit', 'transfer_in', 'interest', 'loan_disbursement'].includes(trx.transactionType);
                   return (
                    <tr key={trx.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <p className="text-xs font-black text-slate-500">{new Date(trx.createdAt).toLocaleDateString()}</p>
                        <p className="text-[10px] text-slate-300 font-mono">{trx.reference || `TXN-${trx.id}`}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors no-print">
                            <FiSearch size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-700">{trx.account?.user?.name || 'System'}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{trx.account?.accountNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-slate-600">{trx.description}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          isCredit ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {trx.transactionType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <p className={`text-lg font-black tracking-tighter ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                          {isCredit ? '+' : '-'}₦{parseFloat(trx.amount).toLocaleString()}
                        </p>
                      </td>
                    </tr>
                   );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-bold">
                    No transaction records found for the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-8 bg-slate-50 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">End of Audit Report</p>
        </div>
      </div>
    </div>
  );
};

export default FinancialReports;

