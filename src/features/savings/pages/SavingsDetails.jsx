import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiTrendingUp,
  FiLock,
  FiShield,
  FiInfo,
  FiClock,
  FiChevronRight,
  FiZap,
  FiHome,
  FiBook,
  FiBriefcase,
  FiCoffee,
  FiFlag,
  FiAlertCircle,
  FiPrinter
} from "react-icons/fi";
import { FaNairaSign } from "react-icons/fa6";
import { getSavingsPlanById, requestWithdrawal } from "../services/savingsApi";
import { getTransactionHistory } from "../../transactions/services/transactionsApi";
import ConfirmationModal from "../../../shared/components/common/ConfirmationModal";
import StatementDownloadModal from "../../../shared/components/common/StatementDownloadModal";
import toast from "react-hot-toast";

const SavingsDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Modals state
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({});
  const [showStatementModal, setShowStatementModal] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [planData, trxData] = await Promise.all([
          getSavingsPlanById(id),
          getTransactionHistory({ search: id }), // Using plan ID or account number might be better
        ]);
        setPlan(planData);
        // Filter transactions for this specific account
        const filteredTrx = trxData.filter(
          (trx) => trx.accountId === planData.accountId,
        );
        setTransactions(filteredTrx);
      } catch (error) {
        console.error("Failed to fetch plan details:", error);
        toast.error("Failed to load plan details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleConfirmClick = () => {
    setShowWithdrawConfirm(false);
    executeWithdrawal();
  };



  const executeWithdrawal = async () => {
    setIsWithdrawing(true);
    try {
      const response = await requestWithdrawal({ planId: id });

      if (response.status === "pending_24h") {
        toast.success(
          "Withdrawal initiated! Funds will be available in 24 hours.",
        );
        // Refresh plan data
        const updatedPlan = await getSavingsPlanById(id);
        setPlan(updatedPlan);
      } else {
        toast.success("Funds withdrawn to your main account successfully!");
        navigate("/savings");
      }
    } catch (error) {
      console.error("Withdrawal failed:", error);
      toast.error(error.response?.data?.message || "Withdrawal failed");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const initiateWithdrawal = () => {
    if (!plan) return;

    const isSafebox = plan.product?.type === "safebox";
    const isMature = new Date() >= new Date(plan.maturityDate);
    const penaltyPct = plan.product?.penaltyPercentage || 0;

    let config = {
      title: "Confirm Withdrawal",
      message:
        "Are you sure you want to withdraw your funds to your main account?",
      confirmLabel: "Withdraw",
      type: "info",
    };

    if (isSafebox) {
      if (plan.withdrawalRequestedAt) {
        config.message = "Are you sure you want to complete this withdrawal?";
        config.confirmLabel = "Confirm Withdrawal";
      } else {
        config.title = "Initiate SafeBox Withdrawal";
        config.message =
          "SafeBox withdrawals take 24 hours to process. Do you want to initiate the request?";
        config.confirmLabel = "Initiate Request";
        config.type = "warning";
      }
    } else if (!isMature) {
      config.title = "Early Withdrawal Penalty";
      config.message = `This plan hasn't matured yet. Withdrawing now will incur a ${penaltyPct}% penalty (₦${(
        parseFloat(plan.account?.balance) *
        (penaltyPct / 100)
      ).toLocaleString()}). Proceed?`;
      config.confirmLabel = "Liquidate with Penalty";
      config.type = "danger";
    }

    setConfirmConfig(config);
    setShowWithdrawConfirm(true);
  };

  const getCategoryIcon = (category, type) => {
    switch (category) {
      case "rent":
        return <FiHome />;
      case "education":
        return <FiBook />;
      case "business":
        return <FiBriefcase />;
      case "emergency":
        return <FiZap />;
      case "festive":
        return <FiCoffee />;
      default:
        return type === "safebox" ? (
          <FiShield />
        ) : type === "fixed" ? (
          <FiLock />
        ) : (
          <FiFlag />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!plan) return <div className="text-center py-10">Plan not found</div>;

  const balance = parseFloat(plan.account?.balance || 0);
  const target = parseFloat(plan.targetAmount || 0);
  const progress = target > 0 ? Math.min((balance / target) * 100, 100) : 0;
  const isSafebox = plan.product?.type === "safebox";
  const isMature = new Date() >= new Date(plan.maturityDate);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Nav */}
      <button
        onClick={() => navigate("/savings")}
        className="flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium"
      >
        <FiArrowLeft className="mr-2" /> Back to Overview
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div
          className={`p-8 ${
            isSafebox
              ? "bg-gradient-to-r from-orange-500 to-orange-600"
              : plan.product?.type === "fixed"
                ? "bg-gradient-to-r from-purple-600 to-purple-700"
                : "bg-gradient-to-r from-blue-600 to-blue-700"
          } text-white`}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl text-2xl">
                {getCategoryIcon(plan.product?.category, plan.product?.type)}
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {plan.planName || plan.product?.name}
                </h1>
                <p className="text-white/80 text-sm uppercase tracking-wider">
                  {plan.product?.type?.replace(/_/g, " ")} Plan
                </p>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  plan.status === "active"
                    ? "bg-green-400/30 text-green-100"
                    : "bg-white/20 text-white"
                }`}
              >
                {plan.status?.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/70 text-sm">Current Balance</p>
              <h2 className="text-4xl font-bold">
                ₦{balance.toLocaleString()}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-sm">Accumulated Interest</p>
              <h2 className="text-2xl font-bold text-green-300">
                +₦{parseFloat(plan.accumulatedInterest || 0).toLocaleString()}
              </h2>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Progress Section */}
          {target > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-end text-sm">
                <span className="text-gray-500 font-medium">
                  Progress to ₦{target.toLocaleString()}
                </span>
                <span className="text-blue-600 font-bold">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Key Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
              <FiCalendar className="text-blue-500 text-xl" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">
                  Start Date
                </p>
                <p className="text-sm font-semibold text-gray-700">
                  {new Date(plan.startDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
              <FiClock className="text-purple-500 text-xl" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">
                  Maturity Date
                </p>
                <p className="text-sm font-semibold text-gray-700">
                  {new Date(plan.maturityDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
              <FiTrendingUp className="text-green-500 text-xl" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">
                  Interest Rate
                </p>
                <p className="text-sm font-semibold text-gray-700">
                  {plan.product?.interestRate}% p.a
                </p>
              </div>
            </div>
          </div>

          {/* Actions & Alerts */}
          <div className="space-y-4">
            {isSafebox && plan.withdrawalRequestedAt && (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start space-x-3 text-amber-800">
                <FiClock className="mt-1 text-xl flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-bold">Withdrawal Pending</p>
                  <p>
                    Request initiated on{" "}
                    {new Date(plan.withdrawalRequestedAt).toLocaleString()}.
                    Funds will be available 24 hours from this time.
                  </p>
                </div>
              </div>
            )}

            {!isMature && !isSafebox && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3 text-red-800">
                <FiAlertCircle className="mt-1 text-xl flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-bold">Early Withdrawal Penalty</p>
                  <p>
                    This plan matures on{" "}
                    {new Date(plan.maturityDate).toLocaleDateString()}.
                    Liquidating now will incur a{" "}
                    <strong>{plan.product?.penaltyPercentage}%</strong> penalty
                    on your balance.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={initiateWithdrawal}
                disabled={isWithdrawing}
                className={`flex-1 flex items-center justify-center px-6 py-3 rounded-xl font-bold transition-all ${
                  isWithdrawing
                    ? "bg-gray-100 text-gray-400"
                    : isSafebox && plan.withdrawalRequestedAt
                      ? "bg-orange-600 text-white hover:bg-orange-700"
                      : !isMature && !isSafebox
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                } shadow-sm`}
              >
                {isWithdrawing
                  ? "Processing..."
                  : isSafebox
                    ? plan.withdrawalRequestedAt
                      ? "Complete Withdrawal"
                      : "Withdraw Funds (24h)"
                    : isMature
                      ? "Withdraw (No Penalty)"
                      : "Liquidate Early (Penalty)"}
              </button>

              <button className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                Add More Funds
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowStatementModal(true)}
              className="text-sm text-gray-600 font-medium flex items-center hover:text-gray-800"
            >
              <FiPrinter className="mr-1" /> Print Statement
            </button>
            <button className="text-sm text-blue-600 font-medium flex items-center">
              View All <FiChevronRight className="ml-1" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {transactions.length > 0 ? (
            transactions.slice(0, 5).map((trx) => (
              <div
                key={trx.id}
                className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-2 rounded-lg ${
                      ["deposit", "transfer_in", "interest"].includes(
                        trx.transactionType,
                      )
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {["deposit", "transfer_in", "interest"].includes(
                      trx.transactionType,
                    ) ? (
                      <FiTrendingUp />
                    ) : (
                      <FiAlertCircle />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {trx.description}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(trx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div
                  className={`text-sm font-bold ${
                    ["deposit", "transfer_in", "interest"].includes(
                      trx.transactionType,
                    )
                      ? "text-green-600"
                      : "text-red-800"
                  }`}
                >
                  {["deposit", "transfer_in", "interest"].includes(
                    trx.transactionType,
                  )
                    ? "+"
                    : "-"}
                  ₦{parseFloat(trx.amount).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 py-4 italic">
              No recent activity for this plan.
            </p>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showWithdrawConfirm}
        onClose={() => setShowWithdrawConfirm(false)}
        onConfirm={handleConfirmClick}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel={confirmConfig.confirmLabel}
        type={confirmConfig.type}
      />



      {plan.account && (
        <StatementDownloadModal
          isOpen={showStatementModal}
          onClose={() => setShowStatementModal(false)}
          selectedAccountId={plan.account.id}
        />
      )}
    </div>
  );
};

export default SavingsDetails;
