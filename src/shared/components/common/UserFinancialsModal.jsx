import { FaNairaSign } from "react-icons/fa6";
import React, { useState } from "react";
import { FiX,
  FiCreditCard,
  FiActivity,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiCalendar,
  FiHash,
  FiInfo,
  FiTrendingUp,
  FiPieChart,
  FiCheckCircle,
  FiAlertCircle } from "react-icons/fi";
import { useUserFinancials } from "../../../features/members/hooks/useMembers";
import api from "../../../lib/api";
import BaseModal from "./BaseModal";

const UserFinancialsModal = ({ user, onClose }) => {
  const { data, isLoading } = useUserFinancials(user?.id);
  const { accounts = [], loans = [], savingsPlans = [] } = data || {};

  const [selectedItem, setSelectedItem] = useState(null); // Can be account, loan, or plan
  const [itemType, setItemType] = useState(null); // 'account', 'loan', 'plan'
  const [statement, setStatement] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleSelectAccount = async (account) => {
    setSelectedItem(account);
    setItemType("account");
    setLoadingDetails(true);
    try {
      const { data } = await api.get(`/accounts/${account.id}/statement`);
      setStatement(data.data);
    } catch (error) {
      console.error("Failed to fetch statement", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSelectItem = (item, type) => {
    setSelectedItem(item);
    setItemType(type);
    setStatement(null); // Not used for loans/plans in this simple view
  };

  if (!user) return null;

  return (
    <BaseModal
      isOpen={!!user}
      onClose={onClose}
      title="User Financials"
      icon={FiCreditCard}
      subtitle={`Accounts and transactions for ${user.name}`}
      maxWidthClass="max-w-5xl"
      footer={
        <div className="flex justify-end w-full">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all text-sm"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="flex-1 overflow-hidden flex bg-gray-50/30 h-[600px]">
        {/* Accounts Sidebar */}
        <div className="w-1/3 border-r border-gray-100 bg-white p-6 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-gray-50 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Accounts Section */}
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center">
                  <FiCreditCard className="mr-2" /> Accounts ({accounts.length})
                </h3>
                <div className="space-y-3">
                  {accounts.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => handleSelectAccount(acc)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        selectedItem?.id === acc.id && itemType === "account"
                          ? "bg-blue-50 border-blue-200 ring-2 ring-blue-50"
                          : "bg-white border-gray-100 hover:border-blue-100 hover:bg-blue-50/30"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold text-blue-600 uppercase">
                          {acc.accountType.replace(/_/g, " ")}
                        </span>
                        <span
                          className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${acc.status === "active" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}
                        >
                          {acc.status?.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="text-base font-bold text-gray-900">
                        ₦
                        {Number(acc.balance).toLocaleString("en-NG", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Savings Plans Section */}
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center">
                  <FiTrendingUp className="mr-2" /> Savings Plans (
                  {savingsPlans.length})
                </h3>
                <div className="space-y-3">
                  {savingsPlans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => handleSelectItem(plan, "plan")}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        selectedItem?.id === plan.id && itemType === "plan"
                          ? "bg-blue-50 border-blue-200 ring-2 ring-blue-50"
                          : "bg-white border-gray-100 hover:border-blue-100 hover:bg-blue-50/30"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase">
                          {plan.product?.name || "Savings Plan"}
                        </span>
                        <span
                          className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${plan.status === "active" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
                        >
                          {plan.status?.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="text-base font-bold text-gray-900">
                        ₦{Number(plan.autoSaveAmount || 0).toLocaleString()}{" "}
                        <span className="text-[10px] text-gray-400 font-normal">
                          / {plan.frequency}
                        </span>
                      </div>
                    </button>
                  ))}
                  {savingsPlans.length === 0 && (
                    <p className="text-[10px] text-gray-400 ml-4 font-medium italic">
                      No active plans
                    </p>
                  )}
                </div>
              </div>

              {/* Loans Section */}
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center">
                  <FaNairaSign className="mr-2" /> Loans ({loans.length})
                </h3>
                <div className="space-y-3">
                  {loans.map((loan) => (
                    <button
                      key={loan.id}
                      onClick={() => handleSelectItem(loan, "loan")}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        selectedItem?.id === loan.id && itemType === "loan"
                          ? "bg-blue-50 border-blue-200 ring-2 ring-blue-50"
                          : "bg-white border-gray-100 hover:border-blue-100 hover:bg-blue-50/30"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold text-red-600 uppercase">
                          Loan
                        </span>
                        <span
                          className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${loan.status === "disbursed" || loan.status === "repaying" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}
                        >
                          {loan.status?.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="text-base font-bold text-gray-900">
                        ₦
                        {Number(loan.outstandingBalance).toLocaleString(
                          "en-NG",
                          { minimumFractionDigits: 2 },
                        )}
                      </div>
                    </button>
                  ))}
                  {loans.length === 0 && (
                    <p className="text-[10px] text-gray-400 ml-4 font-medium italic">
                      No loan records
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transactions Detail */}
        <div className="w-2/3 p-8 flex flex-col h-full overflow-hidden">
          {!selectedItem ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <FiActivity size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">
                Select an item to view details
              </p>
            </div>
          ) : itemType === "account" ? (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Transaction History
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedItem.accountNumber} •{" "}
                    {selectedItem.accountType.replace(/_/g, " ")}
                  </p>
                </div>
                {loadingDetails && (
                  <div className="text-blue-500 animate-spin">
                    <FiActivity />
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                {loadingDetails ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-16 bg-white/50 rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                ) : statement?.transactions?.length > 0 ? (
                  <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <th className="pb-2 pl-4">Date</th>
                        <th className="pb-2">Details</th>
                        <th className="pb-2 text-right pr-4">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statement.transactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="bg-white border-y border-gray-50 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow"
                        >
                          <td className="py-4 pl-4 rounded-l-xl">
                            <div className="flex items-center text-xs">
                              <div
                                className={`p-2 rounded-lg mr-3 ${tx.transactionType === "deposit" || tx.transactionType === "credit" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
                              >
                                {tx.transactionType === "deposit" ||
                                tx.transactionType === "credit" ? (
                                  <FiArrowDownLeft />
                                ) : (
                                  <FiArrowUpRight />
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-gray-800">
                                  {new Date(tx.createdAt).toLocaleDateString()}
                                </div>
                                <div className="text-gray-400 font-mono text-[10px]">
                                  {tx.reference?.slice(0, 10)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="text-xs font-semibold text-gray-700 line-clamp-1">
                              {tx.description}
                            </div>
                            <div className="text-[10px] text-gray-400 uppercase">
                              {tx.transactionType}
                            </div>
                          </td>
                          <td
                            className={`py-4 pr-4 text-right rounded-r-xl font-bold text-xs ${tx.transactionType === "deposit" || tx.transactionType === "credit" ? "text-green-600" : "text-red-600"}`}
                          >
                            {tx.transactionType === "deposit" ||
                            tx.transactionType === "credit"
                              ? "+"
                              : "-"}
                            ₦
                            {Number(tx.amount).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-300">
                    <FiCalendar size={32} className="mb-2 opacity-30" />
                    <p className="text-sm">No transactions found.</p>
                  </div>
                )}
              </div>
            </div>
          ) : itemType === "loan" ? (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                    Loan Details
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Status:{" "}
                    <span className="capitalize font-bold text-red-600">
                      {selectedItem.status?.replace(/_/g, " ")}
                    </span>
                  </p>
                </div>
                <div className="bg-red-50 text-red-700 px-4 py-2 rounded-2xl border border-red-100">
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-60">
                    Outstanding
                  </div>
                  <div className="text-xl font-black">
                    ₦{Number(selectedItem.outstandingBalance).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <FaNairaSign className="text-blue-500 mb-2" size={24} />
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Total Loan
                  </div>
                  <div className="text-xl font-black text-gray-900">
                    ₦{Number(selectedItem.loanAmount).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Repayable: ₦
                    {Number(selectedItem.totalRepayable).toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <FiActivity className="text-purple-500 mb-2" size={24} />
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Monthly Payment
                  </div>
                  <div className="text-xl font-black text-gray-900">
                    ₦{Number(selectedItem.monthlyPayment).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Next:{" "}
                    {selectedItem.nextPaymentDate
                      ? new Date(
                          selectedItem.nextPaymentDate,
                        ).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">
                  Repayment Progress
                </h4>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-green-500 h-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(100, (Number(selectedItem.totalRepayable - selectedItem.outstandingBalance) / Number(selectedItem.totalRepayable)) * 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-green-600">
                    Paid: ₦
                    {Number(
                      selectedItem.totalRepayable -
                        selectedItem.outstandingBalance,
                    ).toLocaleString()}
                  </span>
                  <span className="text-gray-400">
                    {Math.round(
                      (Number(
                        selectedItem.totalRepayable -
                          selectedItem.outstandingBalance,
                      ) /
                        Number(selectedItem.totalRepayable)) *
                        100,
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                    {selectedItem.product?.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Status:{" "}
                    <span className="capitalize font-bold text-green-600">
                      {selectedItem.status?.replace(/_/g, " ")}
                    </span>
                  </p>
                </div>
                <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-2xl border border-indigo-100 text-right">
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-60">
                    Maturity Date
                  </div>
                  <div className="text-xl font-black">
                    {new Date(selectedItem.maturityDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <FiPieChart className="text-indigo-500 mb-2" size={24} />
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Target Amount
                  </div>
                  <div className="text-xl font-black text-gray-900">
                    ₦{Number(selectedItem.targetAmount || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Duration: {selectedItem.duration} Days
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <FiActivity className="text-green-500 mb-2" size={24} />
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Auto-Save
                  </div>
                  <div className="text-xl font-black text-gray-900">
                    ₦{Number(selectedItem.autoSaveAmount).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Frequency: {selectedItem.frequency}
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
                <div className="flex items-center text-xs text-gray-500">
                  <FiCheckCircle className="mr-2 text-green-500" /> Start Date:{" "}
                  {new Date(selectedItem.startDate).toLocaleDateString()}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <FiAlertCircle className="mr-2 text-amber-500" /> Interest
                  Rate: {selectedItem.product?.interestRate}% p.a.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  );
};

export default UserFinancialsModal;
