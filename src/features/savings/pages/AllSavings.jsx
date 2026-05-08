import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiHome,
  FiBook,
  FiBriefcase,
  FiZap,
  FiCoffee,
  FiShield,
  FiLock,
  FiFlag,
} from "react-icons/fi";
import { FaNairaSign } from "react-icons/fa6";
import { getMySavingsPlans } from "../services/savingsApi";
import { getMyAccounts } from "../../accounts/services/accountApi";

const AllSavings = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [plansRef, accountsRef] = await Promise.all([
        getMySavingsPlans(),
        getMyAccounts(),
      ]);

      const mainSavings = accountsRef
        .filter((acc) => acc.accountType === "savings")
        .map((acc) => ({
          id: `main-${acc.id}`,
          name: "Main Savings Account",
          balance: acc.balance,
          accumulatedInterest: 0,
          status: acc.status,
          type: "main",
        }));

      const targetPlans = plansRef.map((plan) => ({
        id: `plan-${plan.id}`,
        name: plan.planName || plan.product?.name || "Target Savings",
        balance: plan.account?.balance || plan.balance,
        accumulatedInterest: plan.accumulatedInterest || 0,
        status: plan.status,
        type: "plan",
        productType: plan.product?.type || "target",
        category: plan.product?.category || "none",
        withdrawalRequestedAt: plan.withdrawalRequestedAt,
      }));

      setAccounts([...mainSavings, ...targetPlans]);
    } catch (error) {
      console.error("Failed to fetch all savings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const getCategoryIcon = (category, productType, type) => {
    if (type === "main") return <FaNairaSign />;
    switch (category) {
      case "rent": return <FiHome />;
      case "education": return <FiBook />;
      case "business": return <FiBriefcase />;
      case "emergency": return <FiZap />;
      case "festive": return <FiCoffee />;
      default:
        if (productType === "safebox") return <FiShield />;
        if (productType === "fixed") return <FiLock />;
        return <FiFlag />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate("/savings")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FiArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Your Savings Portfolio</h1>
          <p className="text-gray-500 font-medium">All active and completed savings accounts</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
               <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Synchronizing Accounts...</p>
            </div>
          ) : accounts.length > 0 ? (
            <div className="space-y-4">
              {accounts.map((acc) => (
                <Link
                  key={acc.id}
                  to={acc.type === "plan" ? `/savings/plans/${acc.id.replace("plan-", "")}` : "#"}
                  className="group p-6 border border-gray-100 rounded-[2rem] hover:bg-white hover:border-blue-100 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:shadow-blue-900/5"
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-transform group-hover:scale-110 ${
                      acc.productType === "safebox" ? "bg-orange-50 text-orange-600" :
                      acc.productType === "fixed" ? "bg-purple-50 text-purple-600" :
                      "bg-blue-50 text-blue-600"
                    }`}>
                      {getCategoryIcon(acc.category, acc.productType, acc.type)}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-black text-gray-800 text-xl group-hover:text-blue-600 transition-colors tracking-tight">
                          {acc.name}
                        </h3>
                        <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                          acc.withdrawalRequestedAt ? "bg-amber-100 text-amber-700 animate-pulse" :
                          acc.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {acc.withdrawalRequestedAt ? "Pending (24h)" : acc.status?.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                        {acc.type === 'main' ? 'Internal Wallet' : `${acc.productType} account`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-12 text-right">
                    <div className="hidden md:block">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Accumulated Interest</p>
                      <p className="text-sm font-black text-green-600 tracking-tighter">
                        +₦{parseFloat(acc.accumulatedInterest).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Available Balance</p>
                      <p className="text-3xl font-black text-gray-900 tracking-tighter">
                        ₦{parseFloat(acc.balance).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
               <FiFlag size={48} className="mx-auto text-gray-200 mb-4" />
               <p className="text-gray-400 font-bold">No savings accounts found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllSavings;
