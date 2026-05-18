import React from "react";
import {
  FiTrendingUp,
  FiCreditCard,
  FiActivity,
  FiPlusCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { FaNairaSign } from "react-icons/fa6";
import UpcomingMeetingWidget from "../../../shared/components/dashboard/UpcomingMeetingWidget";
import { useAuth } from "../../auth/hooks/useAuth";
import { Link } from "react-router-dom";
import { getDashboardStats } from "../services/dashboardApi";
import toast from "react-hot-toast";
import { useSocket } from "../../../contexts/SocketContext";
import { useBrand } from "../../../contexts/BrandContext";

const MemberDashboard = () => {
  const { user } = useAuth();
  const { getBrandText, getBrandBgLight } = useBrand();
  const [statsData, setStatsData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const socket = useSocket();

  const fetchData = React.useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const statsRes = await getDashboardStats({ type: "personal" });
      setStatsData(statsRes.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  React.useEffect(() => {
    if (!socket) return;

    const handleAccountSync = (data) => {
      fetchData(true);
    };

    socket.on("account_sync", handleAccountSync);
    return () => {
      socket.off("account_sync", handleAccountSync);
    };
  }, [socket, fetchData]);

  const memberStats = [
    {
      title: "My Savings",
      value: statsData?.mySavings || "...",
      icon: <FaNairaSign />,
      change: "Total balance",
      color: "green",
    },
    {
      title: "Loan Balance",
      value: statsData?.loanBalance || "...",
      icon: <FiCreditCard />,
      change: "Outstanding sum",
      color: "orange",
    },
  ];

  if (isLoading)
    return (
      <div className="p-10 text-center text-gray-400">Loading Dashboard...</div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, {user?.name || "Member"}!
          </h1>
          <p className="text-gray-600">Here is your financial summary.</p>
        </div>
      </div>



      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {memberStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div
                className={`p-3 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}
              >
              <span className="text-xl">{stat.icon}</span>
              </div>
              <span 
                className="text-xs font-medium px-2 py-1 rounded-full"
                style={getBrandBgLight()}
              >
                <span style={getBrandText()}>{stat.change}</span>
              </span>
            </div>
            <div className="mt-4 flex flex-col items-start gap-2">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
                  {stat.value}
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                  {stat.title}
                </p>
              </div>
              </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UpcomingMeetingWidget />
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-center text-center relative overflow-hidden group">
          <div 
            className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform opacity-50"
            style={getBrandBgLight()}
          ></div>
          <FiActivity className="mx-auto mb-6" size={40} style={getBrandText()} />
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] mb-3">Governance Portal</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
            Cooperative meetings are vital for community growth. Visit the archive to read past minutes.
          </p>
          <Link 
            to="/meetings" 
            className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
            style={getBrandText()}
          >
            Enter Archive &rarr;
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
          <Link to="/transactions" className="text-sm font-medium hover:underline" style={getBrandText()}>
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase">
                <th className="pb-3 px-2">Type</th>
                <th className="pb-3 px-2">Description</th>
                <th className="pb-3 px-2">Date</th>
                <th className="pb-3 px-2 text-right">Amount</th>
                <th className="pb-3 px-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {statsData?.recentTransactions?.length > 0 ? (
                statsData.recentTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <span className={`${tx.transactionType === "deposit" ||
                          tx.transactionType === "savings_contribution" ||
                          tx.transactionType === "loan_disbursement" ||
                          tx.transactionType === "dividend" ||
                          tx.transactionType === "share_purchase"
                          ? "text-green-600 bg-green-50"
                          : "text-red-600 bg-red-50"
                        } font-bold px-2 py-1 rounded text-xs`}>
                        {tx.transactionType.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-medium text-gray-700">{tx.description}</td>
                    <td className="py-3 px-2 text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-2 text-right font-bold text-gray-900">₦{parseFloat(tx.amount).toLocaleString()}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`w-2 h-2 rounded-full ${tx.status === "completed" ? "bg-green-500" : "bg-yellow-500"} inline-block`}></span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-gray-400 italic">No recent transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>



    </div>
  );
};

export default MemberDashboard;
