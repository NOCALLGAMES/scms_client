import React, { useState, useEffect } from "react";
import {
  FiFileText,
  FiDownload,
  FiPrinter,
  FiFilter,
  FiCalendar,
  FiSearch,
  FiLoader,
  FiActivity,
  FiUser,
  FiArrowLeft,
} from "react-icons/fi";
import { exportToCSV, printPage } from "../../../shared/utils/exportUtils";
import api from "../../../lib/api";
import { getMyAccounts } from "../../accounts/services/accountApi";
import { useAuth } from "../../auth/hooks/useAuth";
import MemberSearchInput from "../../../shared/components/common/MemberSearchInput";
import toast from "react-hot-toast";

const FinancialStatements = () => {
  const { user } = useAuth();
  const isAdmin = ["super_admin", "staff"].includes(user?.role);
  
  const [accounts, setAccounts] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [statement, setStatement] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Initial fetch for members: get their own accounts
  useEffect(() => {
    if (!isAdmin) {
      fetchMemberAccounts();
    }
  }, [isAdmin]);

  const fetchMemberAccounts = async (memberId = null) => {
    setIsLoadingAccounts(true);
    try {
      let data;
      if (memberId) {
        // Admin fetching member accounts
        const res = await api.get(`/accounts/user/${memberId}`);
        data = res.data?.data?.accounts || [];
      } else {
        // Member fetching their own accounts
        data = await getMyAccounts();
      }
      
      setAccounts(data);
      if (data.length > 0) {
        setSelectedAccountId(data[0].id);
      } else {
        setSelectedAccountId("");
      }
    } catch (error) {
      toast.error("Failed to load accounts");
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const handleMemberSelect = (member) => {
    setSelectedMember(member);
    setStatement([]);
    setMeta(null);
    if (member) {
      fetchMemberAccounts(member.id);
    } else {
      setAccounts([]);
      setSelectedAccountId("");
    }
  };

  const handleGenerateStatement = async () => {
    if (!selectedAccountId) {
      return toast.error("Please select an account first");
    }

    setIsGenerating(true);
    try {
      const { data } = await api.get(`/accounts/${selectedAccountId}/statement`, {
        params: {
          startDate: dateRange.start,
          endDate: dateRange.end,
          limit: 100
        }
      });
      
      setStatement(data.data.transactions || []);
      setMeta({
        accountNumber: data.data.account.accountNumber,
        currentBalance: data.data.account.currentBalance,
        ownerName: data.data.account.ownerName || (selectedMember?.name),
        period: dateRange.start && dateRange.end 
          ? `${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`
          : "Full History"
      });
      
      toast.success("Statement generated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate statement");
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedAccount = accounts.find(a => a.id === parseInt(selectedAccountId));

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <style>
        {`
          @media print {
            aside, nav, .no-print, button, .lg\\:col-span-1 {
              display: none !important;
            }
            .lg\\:col-span-3 {
              width: 100% !important;
              grid-column: span 4 / span 4 !important;
            }
            .bg-white {
              border: none !important;
              shadow: none !important;
            }
            body {
              background: white !important;
            }
            .max-w-6xl {
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }
          }
        `}
      </style>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center no-print">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <FiFileText className="text-blue-600" />
            {isAdmin ? "Admin Account Statements" : "My Account Statements"}
          </h1>
          <p className="text-slate-500 font-medium">
            {isAdmin 
              ? "Generate and audit formal financial statements for any cooperative member."
              : "View and download your official savings and loan statements."}
          </p>
        </div>

        {(statement.length > 0) && (
          <div className="flex space-x-2 mt-4 md:mt-0">
            <button 
              onClick={printPage}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-sm font-bold text-slate-700 transition-all active:scale-95 shadow-sm"
            >
              <FiPrinter />
              <span>Print</span>
            </button>
            <button 
              onClick={() => {
                exportToCSV(statement, "account_statement");
                toast.success("Exported statement to CSV");
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-bold transition-all active:scale-95 shadow-lg shadow-blue-900/10"
            >
              <FiDownload />
              <span>Export CSV</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6 no-print">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            {isAdmin && (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Step 1: Select Member</label>
                <MemberSearchInput 
                  onSelect={handleMemberSelect}
                  selectedMember={selectedMember}
                  placeholder="Search name or email..."
                />
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                {isAdmin ? "Step 2: Select Account" : "Select Account"}
              </label>
              <div className="relative">
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  disabled={isLoadingAccounts || (isAdmin && !selectedMember)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none appearance-none font-bold text-slate-700 disabled:opacity-50 transition-all"
                >
                  {isLoadingAccounts ? (
                    <option>Loading accounts...</option>
                  ) : accounts.length > 0 ? (
                    accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.planName || acc.name} ({acc.accountNumber})
                      </option>
                    ))
                  ) : (
                    <option value="">{selectedMember ? "No accounts found" : "Select a member first"}</option>
                  )}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <FiActivity className="text-slate-400" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Period (Optional)</label>
              <div className="space-y-2">
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                    placeholder="Start Date"
                  />
                </div>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                    placeholder="End Date"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateStatement}
              disabled={isGenerating || !selectedAccountId}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <FiLoader className="animate-spin" /> Generating...
                </>
              ) : (
                "Generate Statement"
              )}
            </button>
          </div>
        </div>

        {/* Main Content View */}
        <div className="lg:col-span-3">
          {statement.length > 0 ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
              {/* Statement Header */}
              <div className="p-10 bg-slate-50 border-b border-slate-100">
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                      <FiActivity size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Account Statement</h2>
                      <p className="text-slate-500 font-medium">Official financial record generated by NoCall Cooperative</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Statement Period</p>
                    <p className="text-sm font-bold text-slate-700">{meta?.period}</p>
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Generated On</p>
                      <p className="text-sm font-bold text-slate-700">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                  <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Member Name</p>
                    <p className="text-lg font-black text-slate-800">{meta?.ownerName || user.name}</p>
                  </div>
                  <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Account Number</p>
                    <p className="text-lg font-black text-slate-800 tracking-widest font-mono">{meta?.accountNumber}</p>
                  </div>
                  <div className="p-6 bg-white rounded-3xl border border-blue-100 bg-blue-50/30 shadow-sm">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Closing Balance</p>
                    <p className="text-lg font-black text-blue-700">₦{parseFloat(meta?.currentBalance || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Transaction Table */}
              <div className="flex-1 overflow-x-auto p-4 md:p-10">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference</th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Debit</th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Credit</th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {statement.map((trx, idx) => {
                      const isCredit = ['deposit', 'transfer_in', 'interest', 'loan_disbursement'].includes(trx.transactionType);
                      return (
                        <tr key={trx.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 text-xs font-bold text-slate-500">{new Date(trx.createdAt).toLocaleDateString()}</td>
                          <td className="py-4 text-[10px] font-mono text-slate-400">{trx.reference || `REF-${trx.id}`}</td>
                          <td className="py-4">
                            <p className="text-xs font-black text-slate-700">{trx.description}</p>
                            <p className="text-[9px] text-slate-400 uppercase font-black">{trx.transactionType.replace('_', ' ')}</p>
                          </td>
                          <td className="py-4 text-right text-xs font-black text-red-600">
                            {!isCredit ? `₦${parseFloat(trx.amount).toLocaleString()}` : "-"}
                          </td>
                          <td className="py-4 text-right text-xs font-black text-green-600">
                            {isCredit ? `₦${parseFloat(trx.amount).toLocaleString()}` : "-"}
                          </td>
                          <td className="py-4 text-right text-xs font-black text-slate-900 bg-slate-50/30">
                            ₦{parseFloat(trx.balanceAfter).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Statement Footer */}
              <div className="p-8 bg-white border-t border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">*** End of Statement ***</p>
                <p className="text-[9px] text-slate-300 mt-2">This is a computer-generated statement and does not require a physical signature.</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center p-20 text-center min-h-[600px]">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8">
                <FiFileText size={48} />
              </div>
              <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest mb-2">No Statement Generated</h3>
              <p className="text-slate-400 font-medium max-w-xs mx-auto">
                Select a member and account on the left to generate an official financial statement.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialStatements;
