import React, { useState, useEffect } from "react";
import {
  FiFileText,
  FiSearch,
  FiFilter,
  FiPlus,
  FiLoader,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { getTransactionHistory } from "../services/transactionsApi";
import toast from "react-hot-toast";

const TransactionHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState("");

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await getTransactionHistory({
        search: searchTerm,
        type: filterType,
      });
      setTransactions(data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      toast.error("Failed to load transaction history");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTransactions();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filterType]);



  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      case "reversed":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Transaction History
          </h1>
          <p className="text-gray-600">
            View and manage all financial records.
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/reports/statements"
            className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium"
          >
            <FiFileText className="mr-2" /> View Statements
          </Link>
          <Link
            to="/transactions/entry"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <FiPlus className="mr-2" /> Manual Entry
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by reference or description..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <select
              className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white outline-none focus:border-blue-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="loan_disbursement">Loan Disbursement</option>
              <option value="loan_repayment">Loan Repayment</option>
              <option value="transfer_in">Transfer In</option>
              <option value="transfer_out">Transfer Out</option>
              <option value="interest">Interest</option>
              <option value="dividend">Dividend</option>
              <option value="share_purchase">Share Purchase</option>
            </select>
          </div>
        </div>

        {/* Table/Content */}
        <div className="overflow-x-auto min-h-[200px] relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
              <FiLoader className="animate-spin text-blue-600 text-3xl" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 italic">No transactions found.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>

                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((trx) => (
                  <tr
                    key={trx.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(trx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 line-clamp-1">
                        {trx.description}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        {trx.reference} • {trx.account?.accountNumber}
                      </div>
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${
                        [
                          "deposit",
                          "loan_disbursement",
                          "transfer_in",
                          "interest",
                          "dividend",
                          "share_purchase"
                        ].includes(trx.transactionType)
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {[
                        "deposit",
                        "loan_disbursement",
                        "transfer_in",
                        "interest",
                        "dividend",
                        "share_purchase"
                      ].includes(trx.transactionType)
                        ? "+"
                        : "-"}
                      ₦
                      {parseFloat(trx.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`${getStatusColor(trx.status)} px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}
                      >
                        {trx.status?.replace(/_/g, " ")}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default TransactionHistory;
