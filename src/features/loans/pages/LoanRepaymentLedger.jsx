import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiPrinter,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiList,
  FiRefreshCw,
  FiInfo,
} from "react-icons/fi";
import { FaNairaSign } from "react-icons/fa6";
import { getLoanRepayments, getMyTotalRepaymentHistory } from "../services/repaymentApi";
import toast from "react-hot-toast";
import { useSocket } from "../../../contexts/SocketContext";
import { useCallback } from "react";

const LoanRepaymentLedger = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("history");
  const [loan, setLoan] = useState(null);
  const [history, setHistory] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const isUnified = !id;
  const socket = useSocket();

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      if (isUnified) {
        const res = await getMyTotalRepaymentHistory();
        setHistory(res.data.repayments);
      } else {
        const res = await getLoanRepayments(id);
        setLoan(res.data.loan);
        setHistory(res.data.repayments);
        setSchedule([]); 
      }
    } catch (err) {
      if (!isSilent) toast.error("Failed to load ledger data");
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  }, [id, isUnified]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time socket listener
  useEffect(() => {
    if (!socket) return;

    const handleSync = (data) => {
      console.log("Ledger sync received:", data);
      fetchData(true);
    };

    socket.on("account_sync", handleSync);

    return () => {
      socket.off("account_sync", handleSync);
    };
  }, [socket, fetchData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FiRefreshCw className="animate-spin text-3xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 no-print">
        <div>
          <Link
            to="/loans/my-loans"
            className="flex items-center text-sm text-blue-600 hover:underline mb-2"
          >
            <FiArrowLeft className="mr-1" /> Back to Portfolio
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            {isUnified ? "Unified Payment Ledger" : "Loan Repayment Ledger"}
          </h1>
          <p className="text-gray-600">
            {isUnified 
              ? "Complete transaction flow for all your loans" 
              : `Detailed transaction history for Loan ID: #${id}`}
          </p>
        </div>

        <div className="flex space-x-2">
          <button 
            onClick={() => window.print()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold shadow-md transition-colors"
          >
            <FiPrinter />
            <span>Print Ledger</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {!isUnified && loan && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
              Total Principal
            </p>
            <p className="text-xl font-extrabold text-gray-900 mt-1">
              ₦{parseFloat(loan.loanAmount).toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
              Outstanding Balance
            </p>
            <p className="text-xl font-extrabold text-red-600 mt-1">
              ₦{parseFloat(loan.outstandingBalance).toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
              Repayment Mode
            </p>
            <p className="text-xl font-extrabold text-blue-600 mt-1 uppercase text-sm">
              {loan.repaymentMode}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
              Status
            </p>
            <div className="mt-1 flex items-center">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold mr-2 ${
                loan.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
              }`}>
                {loan.status?.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100 no-print">
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === "history" ? "text-blue-600 border-blue-600 bg-blue-50/30" : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"}`}
          >
            <div className="flex items-center justify-center">
              <FiList className="mr-2" /> Payment Flow
            </div>
          </button>
          {!isUnified && (
            <button
              onClick={() => setActiveTab("schedule")}
              className={`flex-1 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === "schedule" ? "text-blue-600 border-blue-600 bg-blue-50/30" : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"}`}
            >
              <div className="flex items-center justify-center">
                <FiCalendar className="mr-2" /> Original Schedule
              </div>
            </button>
          )}
        </div>

        <div className="p-0">
          {activeTab === "history" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    {isUnified && (
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Loan
                      </th>
                    )}
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                      Principal
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                      Interest
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                      Total Paid
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.length > 0 ? history.map((trx) => (
                    <tr key={trx.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(trx.paidAt).toLocaleDateString()}
                      </td>
                      {isUnified && (
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-black text-slate-400 uppercase">
                            #{trx.loanId} 
                            <span className="ml-2 px-1.5 py-0.5 bg-slate-100 rounded text-[8px]">
                              {trx.loan?.loanType?.replace(/_/g, " ")}
                            </span>
                          </span>
                        </td>
                      )}
                      <td className="px-6 py-4 font-mono text-[10px] font-bold text-blue-600">
                        {trx.transaction?.reference}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-slate-500 font-medium tracking-tight">
                        ₦{parseFloat(trx.principal).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-slate-500 font-medium tracking-tight">
                        ₦{parseFloat(trx.interest).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-extrabold text-gray-900 italic">
                          ₦{parseFloat(trx.amount).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={isUnified ? 6 : 5} className="py-20 text-center text-slate-400 italic">
                        No transactions found in this flow.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-4">
              <FiInfo className="mx-auto text-4xl text-slate-200" />
              <p className="font-medium italic">Amortization schedule details are currently being moved to our new accounting engine.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanRepaymentLedger;
