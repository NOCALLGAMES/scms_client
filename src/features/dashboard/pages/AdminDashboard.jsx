import React from "react";
import {
  FiUsers,
  FiCreditCard,
  FiClock,
  FiAlertCircle,
  FiActivity,
  FiUserPlus,
} from "react-icons/fi";
import { FaNairaSign } from "react-icons/fa6";

import { useAuth } from "../../auth/hooks/useAuth";
import { Link } from "react-router-dom";
import { getDashboardStats, getChartData } from "../services/dashboardApi";
import { useSocket } from "../../../contexts/SocketContext";
import toast from "react-hot-toast";
import { useBrand } from "../../../contexts/BrandContext";

const AdminDashboard = () => {
  const { role } = useAuth();
  const { getBrandText, getBrandBgLight } = useBrand();
  const [statsData, setStatsData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const socket = useSocket();

  const fetchData = React.useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [statsRes] = await Promise.all([
        getDashboardStats({ type: "system" }),
      ]);
      setStatsData(statsRes.data);
    } catch (err) {
      console.error("Failed to fetch admin dashboard data:", err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  React.useEffect(() => {
    if (!socket) return;

    const handleRequestSync = (data) => {
      fetchData(true);
    };

    socket.on("request_sync", handleRequestSync);
    return () => {
      socket.off("request_sync", handleRequestSync);
    };
  }, [socket, fetchData]);

  const adminStats = [
    {
      title: "Total Cooperative Assets",
      value: statsData?.totalSystemFunds || "₦0",
      icon: <FaNairaSign />,
      change: "Institutional Funds",
      color: "green",
    },
    {
      title: "Treasury Balance",
      value: statsData?.treasuryBalance || "₦0",
      icon: <FaNairaSign />,
      change: "Loan Liquidity",
      color: "emerald",
    },
    {
      title: "Institutional Members",
      value: statsData?.totalMembers || "0",
      icon: <FiUsers />,
      change: "Active Members",
      color: "blue",
    },
    {
      title: "Approval Queue",
      value: statsData?.pendingActions || "0",
      icon: <FiClock />,
      change: "Awaiting Review",
      color: "purple",
    },
  ];

  if (isLoading)
    return (
      <div className="p-10 text-center text-gray-400">Loading Admin Dashboard...</div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Overview</h1>
          <p className="text-gray-600">Real-time system health and performance metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminStats.map((stat, index) => (
          <div
            key={index}
            className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${(stat.title === "Approval Queue" || stat.title === "Total Cooperative Assets") ? "group relative" : ""
              }`}
          >
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}>
                <span className="text-xl">{stat.icon}</span>
              </div>
              <span 
                className="text-xs font-medium px-2 py-1 rounded-full"
                style={getBrandBgLight()}
              >
                <span style={getBrandText()}>{stat.change}</span>
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
            </div>

            {/* Hover popup for Approval Queue */}
            {stat.title === "Approval Queue" && (
              <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Pending Loans:</span>
                    <span className="font-semibold">{statsData?.pendingLoans || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Registrations:</span>
                    <span className="font-semibold">{statsData?.pendingRegistrations || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Withdrawals:</span>
                    <span className="font-semibold">{statsData?.pendingWithdrawals || 0}</span>
                  </div>
                </div>
                <div className="absolute -top-1 left-6 w-2 h-2 bg-gray-800 transform rotate-45"></div>
              </div>
            )}

            {/* Hover popup for Total Cooperative Assets */}
            {stat.title === "Total Cooperative Assets" && (
              <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Member Savings:</span>
                    <span className="font-semibold text-green-400">{statsData?.totalSavingsVolume || '₦0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Member Shares:</span>
                    <span className="font-semibold text-blue-400">{statsData?.totalShareVolume || '₦0'}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-600 pt-1 mt-1">
                    <span>Treasury Reserves:</span>
                    <span className="font-semibold text-emerald-400">{statsData?.treasuryBalance || '₦0'}</span>
                  </div>
                </div>
                <div className="absolute -top-1 left-6 w-2 h-2 bg-gray-800 transform rotate-45"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Insights</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Savings</p>
                <p className="text-xl font-black text-slate-800">{statsData?.totalSavingsVolume || '₦0'}</p>
             </div>
             <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Shares</p>
                <p className="text-xl font-black text-slate-800">{statsData?.totalShareVolume || '₦0'}</p>
             </div>
             <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Loan Interest</p>
                <p className="text-xl font-black text-slate-800">{statsData?.interestRevenue || '₦0'}</p>
             </div>
             <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">System Health</p>
                <p className="text-xl font-black text-emerald-600">Stable</p>
             </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Critical Tasks</h3>
          <div className="flex-1 space-y-4">
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start space-x-3">
              <div className="p-2 bg-white rounded-full text-red-500 shadow-sm">
                <FiAlertCircle />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800">{statsData?.defaulters || 0} Loan Defaults</h4>
                <Link to="/admin/loan-portfolio" className="text-xs text-red-600 hover:underline">View Portfolio &rarr;</Link>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start space-x-3">
              <div className="p-2 bg-white rounded-full text-blue-500 shadow-sm">
                <FiUserPlus />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800">User Registrations</h4>
                <p className="text-xs text-gray-500">New members awaiting verification</p>
                <Link to="/admin/registrations" className="text-xs hover:underline" style={getBrandText()}>Review Queue &rarr;</Link>
              </div>
            </div>

            <div className="p-3 bg-purple-50 border border-purple-100 rounded-lg flex items-start space-x-3">
              <div className="p-2 bg-white rounded-full text-purple-500 shadow-sm">
                <FiCreditCard />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800">Loan Requests</h4>
                <p className="text-xs text-gray-500">Active applications in queue</p>
                <Link to="/admin/loan-requests" className="text-xs hover:underline" style={getBrandText()}>Go to Queue &rarr;</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
