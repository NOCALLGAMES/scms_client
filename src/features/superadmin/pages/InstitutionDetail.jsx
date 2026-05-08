import { FaNairaSign } from "react-icons/fa6";
;
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiUsers,
  FiCreditCard,
  FiAlertCircle,
  FiPauseCircle,
  FiMail,
  FiPhone,
  FiMapPin,
  FiChevronLeft,
  FiSettings,
  FiExternalLink,
  FiShield,
  FiBarChart2,
  FiActivity,
  FiTrash2,
  FiCheckCircle } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { getInstitutionDetail } from "../../admin/services/superAdminApi";
import { useConfirm } from "../../../contexts/ConfirmationContext";
import toast from "react-hot-toast";

// ─── Metric Card Component ──────────────────────────────────────────────────
const MetricCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-start space-x-4">
    <div className={`p-3 rounded-xl ${color} shadow-sm`}>
      <Icon className="text-xl text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-extrabold text-gray-900 mt-1 truncate">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1 font-medium">{sub}</p>}
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const InstitutionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["institution-detail", id],
    queryFn: () => getInstitutionDetail(id),
  });

  const handleSuspend = () => {
    confirm({
      title: "Suspend Institution?",
      message: "This will block all access for their members and administrators immediately. Continue?",
      confirmText: "Suspend Access",
      confirmColor: "bg-red-600",
      onConfirm: async () => {
        toast.success("Institution access suspended");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-400">
        <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-sm">Aggregating cooperative metrics...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-400 p-6 text-center">
        <FiAlertCircle className="text-5xl text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Institution Not Found</h2>
        <button onClick={() => navigate(-1)} className="mt-6 text-emerald-600 font-bold flex items-center">
          <FiChevronLeft className="mr-1" /> Back to Dashboard
        </button>
      </div>
    );
  }

  const { institution, metrics, admins } = data;

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: institution.currency || "NGN",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      {/* Header Navigation */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-sm font-bold text-gray-500 hover:text-emerald-600 transition-colors group"
      >
        <FiChevronLeft className="mr-1 group-hover:-translate-x-1 transition-transform" />
        Return to Directory
      </button>

      {/* Primary Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div className="flex items-center space-x-5">
          <div className="w-20 h-20 rounded-3xl bg-emerald-600 flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-emerald-200">
            {institution.name[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {institution.name}
              </h1>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                institution.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
              }`}>
                {institution.status?.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-sm font-mono font-bold text-gray-400 mt-1 uppercase tracking-tighter">
              Platform Registry ID: {institution.code}
            </p>
          </div>
        </div>

        {/* Governance Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm flex items-center">
            <FiSettings className="mr-2" /> Config
          </button>
          <button 
            onClick={() => navigate("/superadmin/logs", { state: { filter: { institutionId: institution.id } } })}
            className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm flex items-center"
          >
            <FiActivity className="mr-2" /> Audit Logs
          </button>
          <button 
            onClick={handleSuspend}
            className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 text-sm font-bold rounded-xl hover:bg-red-100 transition-all flex items-center"
          >
            <FiPauseCircle className="mr-2" /> Suspend
          </button>
          <button className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center active:scale-95">
            <FiExternalLink className="mr-2" /> Impersonate
          </button>
        </div>
      </div>

      {/* Financial Health Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <MetricCard
          label="Aggregate Members"
          value={metrics.totalMembers.toLocaleString()}
          icon={FiUsers}
          color="bg-blue-600"
          sub="Total registered count"
        />
        <MetricCard
          label="Vault Balance"
          value={formatCurrency(metrics.totalSavingsBalance)}
          icon={FaNairaSign}
          color="bg-green-600"
          sub="Platform liquidity"
        />
        <MetricCard
          label="Loan Exposure"
          value={formatCurrency(metrics.totalLoansOutstanding)}
          icon={FiCreditCard}
          color="bg-orange-600"
          sub="Total risk amount"
        />
        <MetricCard
          label="Processing Queue"
          value={metrics.pendingActions.loans + metrics.pendingActions.withdrawals}
          icon={FiAlertCircle}
          color="bg-amber-600"
          sub="Total pending requests"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Risk & Compliance (2/3) */}
        <div className="lg:col-span-2 space-y-8">
           {/* Institution Risk Indicators */}
           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-8 flex items-center">
                 <FiBarChart2 className="mr-2 text-emerald-600" />
                 Compliance & Performance Indicators
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="text-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Loan Default Rate</p>
                    <p className="text-2xl font-black text-green-600">0.00%</p>
                    <p className="text-[10px] text-gray-500 mt-1 font-bold">EXCELLENT</p>
                 </div>
                 <div className="text-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Admin Activity</p>
                    <p className="text-2xl font-black text-blue-600">HIGH</p>
                    <p className="text-[10px] text-gray-500 mt-1 font-bold">Active Management</p>
                 </div>
                 <div className="text-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Avg. Disbursement</p>
                    <p className="text-2xl font-black text-gray-900">{formatCurrency(0)}</p>
                    <p className="text-[10px] text-gray-500 mt-1 font-bold">TBD</p>
                 </div>
              </div>
              
              <div className="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                 <div className="flex items-center space-x-3 mb-4">
                    <FiShield className="text-emerald-600" />
                    <p className="text-sm font-bold text-emerald-900">Governance Recommendation</p>
                 </div>
                 <p className="text-xs text-emerald-700 leading-relaxed font-medium">
                    This institution is currently performing within healthy platform thresholds. No immediate governance action is required. All {metrics.totalAdmins} administrators are active and verified.
                 </p>
              </div>
           </div>

           {/* Pending Operational Queue */}
           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center space-x-2">
                 <FiAlertCircle className="text-amber-600" />
                 <h2 className="text-base font-bold text-gray-900">Operational Bottlenecks</h2>
              </div>
              <div className="divide-y divide-gray-50">
                 <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                       <div className="p-3 bg-amber-100 text-amber-700 rounded-xl font-black text-lg">
                          {metrics.pendingActions.loans}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-gray-800">Pending Loan Requests</p>
                          <p className="text-xs text-gray-500">Applications awaiting local admin review</p>
                       </div>
                    </div>
                    <button className="text-[10px] font-black text-emerald-600 hover:underline">REMAIND ADMINS</button>
                 </div>
                 <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                       <div className="p-3 bg-blue-100 text-blue-700 rounded-xl font-black text-lg">
                          {metrics.pendingActions.withdrawals}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-gray-800">Pending Withdrawals</p>
                          <p className="text-xs text-gray-500">Payouts awaiting processing</p>
                       </div>
                    </div>
                    <button className="text-[10px] font-black text-emerald-600 hover:underline">REMAIND ADMINS</button>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Column: Ownership & Identity (1/3) */}
        <div className="space-y-8">
           {/* Ownership / Admins */}
           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Institution Ownership</h2>
              <div className="space-y-6">
                 {admins.map(admin => (
                    <div key={admin.id} className="flex items-center space-x-4">
                       <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                          {admin.name[0]}
                       </div>
                       <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-900 truncate">{admin.name}</p>
                          <p className="text-[10px] text-gray-500 font-medium truncate">{admin.email}</p>
                       </div>
                       <div className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:text-emerald-600 cursor-pointer transition-colors">
                          <FiMail size={14} />
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Quick Summary Box */}
           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Cooperative Summary</h2>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-gray-400">Total Funds</span>
                    <span className="text-gray-900">{formatCurrency(metrics.totalSavingsBalance)}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-gray-400">Total Members</span>
                    <span className="text-gray-900">{metrics.totalMembers}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs font-bold pt-4 border-t border-gray-50">
                    <span className="text-gray-400">Creation Date</span>
                    <span className="text-gray-900">{new Date(institution.createdAt).toLocaleDateString()}</span>
                 </div>
              </div>
           </div>

           {/* Emergency Controls */}
           <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
              <h3 className="font-bold text-red-900 text-sm mb-2">Emergency Termination</h3>
              <p className="text-red-700 text-[10px] leading-relaxed mb-4 font-medium">Deleting an institution is permanent and will wipe all associated member data and financial records. Proceed with extreme caution.</p>
              <button className="flex items-center justify-center space-x-2 w-full py-2.5 bg-white border border-red-200 text-red-600 rounded-xl text-[10px] font-black hover:bg-red-100 transition-all">
                 <FiTrash2 />
                 <span>DELETE INSTITUTION</span>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionDetail;
