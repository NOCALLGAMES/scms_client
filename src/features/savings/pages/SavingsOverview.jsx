import React from "react";
import { Link } from "react-router-dom";
import {
  FiPlusCircle,
  FiMinusCircle,
  FiSettings,
  FiTrendingUp,
  FiPieChart,
  FiHome,
  FiBook,
  FiBriefcase,
  FiZap,
  FiShield,
  FiLock,
  FiFlag,
  FiCoffee,
} from "react-icons/fi";
import { FaNairaSign } from "react-icons/fa6";

import { getMySavingsPlans } from "../services/savingsApi";
import { getMyAccounts } from "../../accounts/services/accountApi";
import { getChartData } from "../../dashboard/services/dashboardApi";
import MemberContributions from "../components/MemberContributions";
import { useSocket } from "../../../contexts/SocketContext";
import toast from "react-hot-toast";

const SavingsOverview = () => {
  const [savingsData, setSavingsData] = React.useState([]);
  const [accounts, setAccounts] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [mainSavingsBalance, setMainSavingsBalance] = React.useState(0);

  const socket = useSocket();

  const fetchOverviewData = React.useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [plansRef, accountsRef, chartRef] = await Promise.all([
        getMySavingsPlans(),
        getMyAccounts(),
        getChartData(),
      ]);

      const mainSavings = accountsRef
        .filter((acc) => acc.accountType === "savings")
        .map((acc) => ({
          id: `main-${acc.id}`,
          name: "Main Savings",
          balance: acc.balance,
          accumulatedInterest: 0,
          status: acc.status,
          type: "main",
        }));

      if (mainSavings.length > 0) {
        setMainSavingsBalance(parseFloat(mainSavings[0].balance));
      }

      const targetPlans = plansRef.map((plan) => ({
        id: `plan-${plan.id}`,
        name: plan.product?.name || "Target Savings",
        balance: plan.account?.balance || plan.balance,
        accumulatedInterest: plan.accumulatedInterest || 0,
        status: plan.status,
        planName: plan.planName,
        withdrawalRequestedAt: plan.withdrawalRequestedAt,
        type: "plan",
        productType: plan.product?.type || "target",
        category: plan.product?.category || "none",
      }));

      setAccounts([...mainSavings, ...targetPlans]);

      setSavingsData(
        chartRef.data.map((item) => ({
          month: item.name,
          amount: item.savings,
        })),
      );
    } catch (error) {
      console.error("Failed to fetch savings overview:", error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  // Real-time socket listener
  React.useEffect(() => {
    if (!socket) return;

    const handleAccountSync = (data) => {
      console.log("Real-time account sync received:", data);
      fetchOverviewData(true); // Silent refresh
      
      if (data.reason || data.type) {
        toast.success(`Account updated: ${data.reason || data.type}`, {
          icon: '💰',
          duration: 4000
        });
      }
    };

    socket.on("account_sync", handleAccountSync);

    return () => {
      socket.off("account_sync", handleAccountSync);
    };
  }, [socket, fetchOverviewData]);

  const totalBalance = accounts.reduce(
    (acc, plan) => acc + parseFloat(plan.balance || 0),
    0,
  );
  const totalInterest = accounts.reduce(
    (acc, plan) => acc + parseFloat(plan.accumulatedInterest || 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Savings Overview</h1>
          <p className="text-gray-600">
            Manage your savings portfolio and transactions
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/accounts/fund"
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            <FiPlusCircle className="mr-2" /> Fund Account
          </Link>
          <Link
            to="/savings/withdrawal"
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            <FiMinusCircle className="mr-2" /> Withdraw
          </Link>
          <Link
            to="/savings/products"
            className="flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <FiSettings className="mr-2" /> Products
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <FaNairaSign className="text-xl" />
            </div>
          </div>
          <h3 className="text-3xl font-bold">
            ₦{totalBalance.toLocaleString()}
          </h3>
          <p className="text-blue-100 text-sm mt-1">Total Savings Balance</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <FiTrendingUp className="text-xl" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            ₦{totalInterest.toLocaleString()}
          </h3>
          <p className="text-gray-500 text-sm mt-1">Total Interest Earned</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <FiPieChart className="text-xl" />
            </div>
            <span className="text-xs font-semibold bg-purple-50 text-purple-600 px-2 py-1 rounded">
              {accounts.filter((a) => a.status === "active").length} Active
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            {accounts.length} Accounts
          </h3>
          <p className="text-gray-500 text-sm mt-1">Total Savings Plans</p>
        </div>
      </div>

      {/* Monthly Thrift Status */}
      <MemberContributions />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Chart Placeholder */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Savings Growth
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
             <div className="text-center">
                <FiTrendingUp className="mx-auto text-3xl text-gray-300 mb-2" />
                <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Savings trends will appear here</p>
             </div>
          </div>
        </div>

        {/* Account List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Your Accounts
          </h3>
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-center text-gray-400 font-medium py-4">
                Loading accounts...
              </p>
            ) : accounts.length > 0 ? (
              // Show main account + up to 2 plans (Total max 3)
              accounts.slice(0, 3).map((acc) => (
                <Link
                  key={acc.id}
                  to={
                    acc.type === "plan"
                      ? `/savings/plans/${acc.id.replace("plan-", "")}`
                      : "/savings/all-accounts"
                  }
                  className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors flex items-center group"
                >
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center text-lg mr-4 shadow-sm transition-transform group-hover:scale-110 ${
                      acc.productType === "safebox"
                        ? "bg-orange-50 text-orange-600"
                        : acc.productType === "fixed"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {acc.category === "rent" && <FiHome />}
                    {acc.category === "education" && <FiBook />}
                    {acc.category === "business" && <FiBriefcase />}
                    {acc.category === "emergency" && <FiZap />}
                    {acc.category === "festive" && <FiCoffee />}
                    {acc.category === "none" &&
                      (acc.productType === "safebox" ? (
                        <FiShield />
                      ) : acc.productType === "fixed" ? (
                        <FiLock />
                      ) : (
                        <FiFlag />
                      ))}
                    {acc.type === "main" && <FaNairaSign />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                        {acc.planName || acc.name}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          acc.withdrawalRequestedAt
                            ? "bg-amber-50 text-amber-600 animate-pulse"
                            : acc.status === "active"
                              ? "bg-green-50 text-green-600"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {acc.withdrawalRequestedAt
                          ? "PENDING (24H)"
                          : acc.status?.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs text-gray-400 uppercase">
                          Balance
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          ₦{parseFloat(acc.balance).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase">
                          Interest
                        </p>
                        <p className="text-sm font-medium text-green-600">
                          +₦
                          {parseFloat(acc.accumulatedInterest).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center text-gray-400 font-medium py-4">
                No active savings plans found.
              </p>
            )}
          </div>
          <Link 
            to="/savings/all-accounts"
            className="w-full mt-4 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center"
          >
            View All Accounts
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SavingsOverview;
