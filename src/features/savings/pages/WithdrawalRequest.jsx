import { FaNairaSign } from "react-icons/fa6";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FiInfo,
  FiAlertCircle,
  FiSend,
  FiCreditCard,
  FiFileText,
  FiChevronDown,
  FiCheckCircle,
  FiX,
  FiDownload,
  FiUser } from "react-icons/fi";
import { requestWithdrawal } from "../services/withdrawalApi";
import api from "../../../lib/api";
import toast from "react-hot-toast";
import { useSocket } from "../../../contexts/SocketContext";

const WithdrawalRequest = () => {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [withdrawToOwn, setWithdrawToOwn] = useState(true);
  const socket = useSocket();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      amount: "",
      narration: "",
      accountId: "",
      recipientName: "",
      recipientAccount: "",
      recipientBank: "",
    },
  });

  const selectedAccountId = watch("accountId");
  const selectedAccount = accounts.find(
    (a) => a.id === parseInt(selectedAccountId),
  );

  const fetchAccounts = async () => {
    try {
      const { data } = await api.get("/accounts/my-accounts");
      // Only allow withdrawals from the main 'savings' account
      const savingsAccounts = (data.data.accounts || []).filter(acc => acc.accountType === 'savings');
      setAccounts(savingsAccounts);
      
      // Auto-select the savings account if it exists
      if (savingsAccounts.length > 0) {
        reset(prev => ({ ...prev, accountId: savingsAccounts[0].id.toString() }));
      }
    } catch {
      toast.error("Failed to load your accounts");
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Listen for real-time account updates
  useEffect(() => {
    if (!socket) return;

    const handleSync = (data) => {
      if (["withdrawal_processed", "withdrawal_approved", "withdrawal_rejected"].includes(data?.type)) {
        fetchAccounts();
        
        if (data.type === "withdrawal_approved") {
          toast.success(`Your withdrawal of ₦${parseFloat(data.amount).toLocaleString()} was approved!`);
        } else if (data.type === "withdrawal_rejected") {
          toast.error(`Your withdrawal request was rejected. Reason: ${data.reason}`);
        }
      }
    };

    socket.on("account_sync", handleSync);

    return () => {
      socket.off("account_sync", handleSync);
    };
  }, [socket]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const rawAmount = parseFloat(data.amount);
      const roundedAmount = Math.ceil(rawAmount);
      const availableBalance = parseFloat(selectedAccount?.balance || 0);
      const finalAmount = roundedAmount > availableBalance ? rawAmount : roundedAmount;

      const response = await requestWithdrawal({
        accountId: parseInt(data.accountId),
        amount: finalAmount,
        reason: data.narration || "Withdrawal request",
        recipientName: withdrawToOwn ? null : data.recipientName,
        recipientAccount: withdrawToOwn ? null : data.recipientAccount,
        recipientBank: withdrawToOwn ? null : data.recipientBank,
      });

      const isAutoApproved = response.autoApproved;

      if (isAutoApproved) {
        // Show receipt for auto-approved withdrawals
        setReceiptData({
          amount: finalAmount,
          accountNumber: selectedAccount?.accountNumber,
          accountType: selectedAccount?.accountType,
          date: new Date().toLocaleString(),
          reference: `WD-${Date.now()}`,
          narration: data.narration || "Withdrawal",
          recipientName: withdrawToOwn ? "Own Account" : data.recipientName,
          recipientAccount: withdrawToOwn ? selectedAccount?.accountNumber : data.recipientAccount,
          recipientBank: withdrawToOwn ? "Cooperative Savings" : data.recipientBank,
        });
        setShowReceipt(true);
        toast.success(`₦${finalAmount.toLocaleString()} withdrawn successfully!`);
      } else {
        toast.success("Withdrawal request submitted for admin approval (₦500,000+).");
      }

      reset({ amount: "", narration: "", recipientName: "", recipientAccount: "", recipientBank: "" });
      fetchAccounts(); // Refresh accounts after successful request
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit request");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReceipt = () => {
    if (!receiptData) return;

    const receiptText = `
WITHDRAWAL RECEIPT
==================
Reference: ${receiptData.reference}
Date: ${receiptData.date}
Amount: ₦${receiptData.amount.toLocaleString()}
From Account: ${receiptData.accountNumber}
To: ${receiptData.recipientName}
Account: ${receiptData.recipientAccount}
Bank: ${receiptData.recipientBank}
Note: ${receiptData.narration}
==================
Thank you for using our services!
    `.trim();

    const blob = new Blob([receiptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${receiptData.reference}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold text-slate-900">Withdraw Funds</h1>
        <p className="text-slate-600 mt-2">
          Request to withdraw funds from your main savings account.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Select Account
              </label>
              <div className="relative">
                {accounts.length > 0 ? (
                  <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 flex items-center justify-between">
                    <span>
                      {selectedAccount?.accountType.replace(/_/g, " ").toUpperCase()} - {selectedAccount?.accountNumber}
                    </span>
                    <FiCheckCircle className="text-green-500" />
                  </div>
                ) : (
                  <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 italic">
                    Loading account...
                  </div>
                )}
                {/* Hidden input to keep form value in sync */}
                <input 
                  type="hidden" 
                  {...register("accountId", { required: "Account is required" })} 
                />
              </div>
              {errors.accountId && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.accountId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Amount to Withdraw (₦)
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  ₦
                </div>
                <input
                  {...register("amount", {
                    required: "Amount is required",
                    min: {
                      value: 1000,
                      message: "Minimum withdrawal is ₦1,000",
                    },
                    validate: (val) => !isNaN(parseFloat(val)) || "Valid number required",
                  })}
                  type="text"
                  inputMode="decimal"
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  placeholder="0.00"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.amount.message}
                </p>
              )}
            </div>

            {/* Destination Selection */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Withdraw To
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setWithdrawToOwn(true)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${withdrawToOwn
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600 border border-slate-200"
                    }`}
                >
                  My Account
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawToOwn(false)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${!withdrawToOwn
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600 border border-slate-200"
                    }`}
                >
                  Another Account
                </button>
              </div>
            </div>

            {/* External Account Fields */}
            {!withdrawToOwn && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h4 className="font-semibold text-blue-800 mb-2">Recipient Details</h4>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Recipient Name *
                  </label>
                  <input
                    {...register("recipientName", {
                      required: withdrawToOwn ? false : "Recipient name is required",
                    })}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Full name"
                  />
                  {errors.recipientName && (
                    <p className="mt-1 text-sm text-red-500">{errors.recipientName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Account Number *
                  </label>
                  <input
                    {...register("recipientAccount", {
                      required: withdrawToOwn ? false : "Account number is required",
                    })}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="10-digit account number"
                  />
                  {errors.recipientAccount && (
                    <p className="mt-1 text-sm text-red-500">{errors.recipientAccount.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Bank Name *
                  </label>
                  <input
                    {...register("recipientBank", {
                      required: withdrawToOwn ? false : "Bank name is required",
                    })}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Bank name"
                  />
                  {errors.recipientBank && (
                    <p className="mt-1 text-sm text-red-500">{errors.recipientBank.message}</p>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Additional Note (Optional)
              </label>
              <textarea
                {...register("narration")}
                rows="3"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none"
                placeholder="Briefly describe the reason for this withdrawal..."
              />
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start space-x-3">
              <FiAlertCircle className="text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                <span className="font-bold">Note:</span> Large withdrawals
                (above ₦500,000) may require additional administrative calls and
                up to 48 hours to process.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center space-x-2 py-4 rounded-xl font-bold transition-all shadow-lg ${isLoading
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
                }`}
            >
              <FiSend />
              <span>
                {isLoading ? "Submitting..." : "Submit Withdrawal Request"}
              </span>
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex justify-between items-start mb-8">
              <FaNairaSign className="text-2xl text-blue-400" />
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                Available Balance
              </span>
            </div>
            <div className="mb-2">
              <span className="text-sm text-slate-400">
                {selectedAccount
                  ? selectedAccount.accountType.replace(/_/g, " ").toUpperCase()
                  : "Total Balance"}
              </span>
              <h2 className="text-3xl font-black">
                ₦
                {selectedAccount
                  ? parseFloat(selectedAccount.balance).toLocaleString()
                  : "0.00"}
              </h2>
            </div>
            <div className="pt-4 border-t border-slate-700 mt-4 flex justify-between items-center text-xs">
              <span className="text-slate-400">
                {selectedAccount
                  ? `ID: ${selectedAccount.accountNumber}`
                  : "---"}
              </span>
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full font-bold">
                {selectedAccount ? selectedAccount.status.replace(/_/g, " ").toUpperCase() : "---"}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center">
              <FiInfo className="mr-2 text-blue-500" />
              Quick Info
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start text-sm text-slate-600">
                <FiCreditCard className="mr-2 mt-1 text-slate-400 flex-shrink-0" />
                <span>Daily withdrawal limit is ₦1,000,000.</span>
              </li>
              <li className="flex items-start text-sm text-slate-600">
                <FiFileText className="mr-2 mt-1 text-slate-400 flex-shrink-0" />
                <span>Withdrawals below ₦500,000 are processed instantly.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && receiptData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <FiCheckCircle className="text-green-600 text-xl" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Withdrawal Successful</h3>
              </div>
              <button
                onClick={() => setShowReceipt(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <FiX className="text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center py-4 border-b border-slate-100">
                <p className="text-sm text-slate-500 mb-1">Amount Withdrawn</p>
                <p className="text-3xl font-black text-slate-800">
                  ₦{receiptData.amount.toLocaleString()}
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Reference</span>
                  <span className="font-mono font-medium">{receiptData.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date</span>
                  <span>{receiptData.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">From</span>
                  <span className="font-medium">{receiptData.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">To</span>
                  <span className="font-medium text-right">
                    {receiptData.recipientName}
                    <br />
                    <span className="text-slate-400">{receiptData.recipientBank}</span>
                  </span>
                </div>
                {receiptData.narration && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Note</span>
                    <span className="text-right max-w-[200px]">{receiptData.narration}</span>
                  </div>
                )}
              </div>

              <button
                onClick={downloadReceipt}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition-colors"
              >
                <FiDownload />
                <span>Download Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalRequest;
