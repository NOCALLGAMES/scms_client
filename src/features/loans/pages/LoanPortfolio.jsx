import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import {
  FiTrendingUp,
  FiAlertCircle,
  FiCheckSquare,
  FiLoader,
} from "react-icons/fi";
import { getPortfolioStats } from "../services/loansApi";
import toast from "react-hot-toast";

const LoanPortfolio = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getPortfolioStats();
        setStats(data);
      } catch (err) {
        toast.error("Failed to load portfolio statistics");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <FiLoader className="animate-spin text-blue-600 text-4xl" />
        <p className="text-slate-500 font-medium animate-pulse">Analyzing portfolio data...</p>
      </div>
    );
  }

  const { summary, atRisk, distribution } = stats;

  const kpiData = [
    {
      title: "Total Outstanding",
      value: `₦${(summary.totalOutstanding / 1e6).toFixed(1)}M`.replace('.0M', 'M'),
      sub: `${summary.totalCount} active accounts`,
      icon: <FiCheckSquare />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Expected Revenue",
      value: `₦${(summary.interestRevenue / 1e3).toFixed(0)}k`,
      sub: "Projected interest income",
      icon: <FiTrendingUp />,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Portfolio at Risk",
      value: `₦${(atRisk.value / 1e3).toFixed(0)}k`,
      sub: `${atRisk.count} accounts defaulted`,
      icon: <FiAlertCircle />,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Loan Portfolio</h1>
          <p className="text-gray-600">
            Real-time overview of organization-wide lending performance and risk.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpiData.map((kpi, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start space-x-4"
          >
            <div className={`p-3 rounded-lg ${kpi.bg} ${kpi.color}`}>
              <span className="text-2xl">{kpi.icon}</span>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{kpi.title}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {kpi.value}
              </h3>
              <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Portfolio Distribution
          </h3>
          <div className="space-y-4">
            {distribution.length > 0 ? (
              distribution.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="font-bold text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-black text-gray-900">₦{parseFloat(item.value).toLocaleString()}</span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-10 italic">No distribution data</p>
            )}
          </div>
        </div>

        {/* At Risk List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Risk Analysis
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-1">Total Defaulters</p>
              <p className="text-2xl font-black text-red-600">{atRisk.count}</p>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-xs font-black text-amber-400 uppercase tracking-widest mb-1">Value at Risk</p>
              <p className="text-2xl font-black text-amber-600">₦{parseFloat(atRisk.value).toLocaleString()}</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
              <p className="text-xs font-black text-green-400 uppercase tracking-widest mb-1">Performing Loans</p>
              <p className="text-2xl font-black text-green-600">{summary.totalCount - atRisk.count}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-blue-900">Manage Repayments</h3>
          <p className="text-blue-700 text-sm">
            Record manual payments or view amortization schedules.
          </p>
        </div>
        <Link
          to="/admin/loan-repayments"
          className="mt-4 md:mt-0 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
        >
          Go to Repayments &rarr;
        </Link>
      </div>
    </div>
  );
};

export default LoanPortfolio;
