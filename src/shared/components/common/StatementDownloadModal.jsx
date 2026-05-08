import React, { useState, useEffect } from "react";
import { FiDownload, FiX, FiCalendar, FiLoader } from "react-icons/fi";
import API from "../../../lib/api";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import toast from "react-hot-toast";

const StatementDownloadModal = ({ isOpen, onClose, selectedAccountId = "" }) => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  
  const [formData, setFormData] = useState({
    accountId: selectedAccountId || "",
    startDate: "",
    endDate: "",
  });
  
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch user accounts if they didn't provide a specific one
  useEffect(() => {
    if (isOpen && !selectedAccountId) {
      const fetchAccounts = async () => {
        setIsLoadingAccounts(true);
        try {
          // A member can view their own accounts. To be safe, we use the specific user accounts endpoint
          const res = await API.get(`/accounts`);
          // Note: the backend returns accounts under the data object
          setAccounts(res.data?.data?.accounts || res.data?.data || []);
          
          if (res.data?.data?.accounts?.length === 1) {
             setFormData(prev => ({ ...prev, accountId: res.data.data.accounts[0].id }));
          }
        } catch (error) {
          toast.error("Failed to load accounts for statement");
        } finally {
          setIsLoadingAccounts(false);
        }
      };
      
      fetchAccounts();
    } else if (selectedAccountId) {
      setFormData(prev => ({ ...prev, accountId: selectedAccountId }));
    }
  }, [isOpen, selectedAccountId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePrint = async (e) => {
    e.preventDefault();
    if (!formData.accountId) {
      toast.error("Please select an account");
      return;
    }

    setIsDownloading(true);
    try {
      const params = new URLSearchParams({ accountId: formData.accountId });
      if (formData.startDate) params.append("startDate", formData.startDate);
      if (formData.endDate) params.append("endDate", formData.endDate);

      const response = await API.get(`/reports/statement?${params.toString()}`);
      const data = response.data.data;

      // Create printable content
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Account Statement - ${data.account.accountNumber}</title>
            <style>
              body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
              .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 30px; }
              .logo-placeholder { font-size: 24px; font-weight: 800; color: #2563eb; }
              .info-grid { display: grid; grid-cols: 2; gap: 20px; margin-bottom: 40px; }
              .info-item { margin-bottom: 10px; }
              .info-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; }
              .info-value { font-size: 14px; font-weight: 600; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th { background: #f8fafc; text-align: left; padding: 12px; font-size: 10px; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; }
              td { padding: 12px; font-size: 12px; border-bottom: 1px solid #f1f5f9; }
              .amount { text-align: right; font-weight: 700; }
              .deposit { color: #10b981; }
              .withdrawal { color: #ef4444; }
              .footer { margin-top: 50px; font-size: 10px; color: #94a3b8; text-align: center; }
              @media print {
                @page { margin: 2cm; }
                body { padding: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo-placeholder">${user?.institution?.name || 'SCMS'}</div>
              <div style="text-align: right">
                <div style="font-weight: 800; font-size: 18px;">Account Statement</div>
                <div style="font-size: 12px; color: #64748b;">Generated on ${new Date().toLocaleDateString()}</div>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
              <div>
                <div class="info-item">
                  <div class="info-label">Account Name</div>
                  <div class="info-value">${data.account.ownerName}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Account Number</div>
                  <div class="info-value">${data.account.accountNumber}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Account Type</div>
                  <div class="info-value">${data.account.accountType.toUpperCase()}</div>
                </div>
              </div>
              <div style="text-align: right">
                <div class="info-item">
                  <div class="info-label">Statement Period</div>
                  <div class="info-value">${data.statementPeriod.startDate} - ${data.statementPeriod.endDate}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Opening Balance</div>
                  <div class="info-value">₦${parseFloat(data.statementPeriod.openingBalance).toLocaleString()}</div>
                </div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th style="text-align: right">Amount</th>
                  <th style="text-align: right">Balance</th>
                </tr>
              </thead>
              <tbody>
                ${data.transactions.map(tx => `
                  <tr>
                    <td>${new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td>${tx.description}</td>
                    <td style="text-transform: capitalize;">${tx.transactionType.replace(/_/g, ' ')}</td>
                    <td class="amount ${tx.amount > 0 ? 'deposit' : 'withdrawal'}">
                      ₦${Math.abs(parseFloat(tx.amount)).toLocaleString()}
                    </td>
                    <td class="amount">₦${parseFloat(tx.balanceAfter).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="footer">
              This is a computer-generated document. No signature required.
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      
      // Wait for content to load then print
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 500);

      toast.success("Statement ready for printing");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate statement. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Print Statement
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handlePrint} className="p-6 space-y-5">
          {/* Account Selection (Hide if pre-selected) */}
          {!selectedAccountId && (
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Select Account
              </label>
              <select
                name="accountId"
                value={formData.accountId}
                onChange={handleChange}
                required
                disabled={isLoadingAccounts}
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all font-medium text-slate-700 disabled:opacity-50"
              >
                <option value="">-- Choose Account --</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.accountType.replace(/_/g, " ").toUpperCase()} - {acc.accountNumber} (₦{parseFloat(acc.balance).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <FiCalendar /> Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all font-medium text-slate-700"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <FiCalendar /> End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all font-medium text-slate-700"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            Leave dates empty to view all-time statement history.
          </p>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDownloading || !formData.accountId}
              className="flex-[2] px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <>
                  <FiLoader className="animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <FiDownload /> Print Statement
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatementDownloadModal;
