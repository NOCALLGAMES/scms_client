import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiCreditCard,
  FiCalendar,
  FiBriefcase,
  FiMapPin,
  FiArrowLeft,
  FiEdit,
  FiActivity,
  FiTrendingUp,
  FiXCircle,
  FiLayers,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";
import { FaNairaSign } from "react-icons/fa6";
import { useMemberProfile, useUserFinancials } from "../hooks/useMembers";
import UserEditModal from "../../../shared/components/common/UserEditModal";
import { format } from "date-fns";

const MemberProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: member, isLoading: profileLoading } = useMemberProfile(id);
  const { data: financials, isLoading: financialsLoading } =
    useUserFinancials(id);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("info"); // 'info' or 'thrift'

  if (profileLoading || financialsLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="text-blue-600 animate-spin">
          <FiActivity size={48} />
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Member Not Found</h2>
        <button
          onClick={() => navigate("/admin/users")}
          className="mt-4 text-blue-600 hover:underline flex items-center justify-center mx-auto"
        >
          <FiArrowLeft className="mr-2" /> Back to Directory
        </button>
      </div>
    );
  }

  const StatCard = ({ label, value, icon: Icon, colorClass }) => (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
      <div className={`p-3 rounded-2xl ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-xl font-black text-gray-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/admin/users")}
            className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Member Profile
            </h1>
            <p className="text-gray-500 font-medium tracking-tight">
              Admin Overview • <span className="text-blue-600 font-bold">{member.name}</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg"
        >
          <FiEdit />
          <span>Edit Details</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Info Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-blue-600 to-indigo-700 opacity-10"></div>
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="w-full h-full rounded-full bg-white p-1 ring-4 ring-blue-50 overflow-hidden shadow-inner">
                {member.profilePicture ? (
                  <img
                    src={`${import.meta.env.VITE_SERVER_URL}/img/users/${member.profilePicture}`}
                    alt=""
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-blue-200 bg-blue-50/50">
                    <FiUser size={64} />
                  </div>
                )}
              </div>
              <div
                className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-white ${member.status === "active" ? "bg-green-500" : "bg-amber-500"}`}
              ></div>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-1">
              {member.name}
            </h2>
            <p className="text-gray-500 font-medium mb-6">{member.email}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-widest border border-blue-100">
                {member.membershipType || "REGULAR"}
              </span>
              <span className="px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-bold uppercase tracking-widest border border-green-100">
                {member.status?.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] border-b pb-4">
              Quick Contact
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-600">
                <FiMail size={18} className="text-blue-500" />
                <span className="text-sm font-semibold">{member.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <FiPhone size={18} className="text-blue-500" />
                <span className="text-sm font-semibold">
                  {member.phoneNumber || "No Phone"}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <FiMapPin size={18} className="text-blue-500" />
                <span className="text-sm font-semibold leading-relaxed">
                  {member.address || "No Address Provided"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial & Detailed Info Section */}
        <div className="lg:col-span-8 space-y-8">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              label="Savings"
              value={`₦${Number(financials?.accounts?.find((a) => a.accountType === "savings")?.balance || 0).toLocaleString()}`}
              icon={FaNairaSign}
              colorClass="bg-green-50 text-green-600"
            />
            <StatCard
              label="Loans"
              value={`₦${Number(financials?.loans?.reduce((sum, loan) => sum + Number(loan.outstandingBalance), 0) || 0).toLocaleString()}`}
              icon={FiTrendingUp}
              colorClass="bg-red-50 text-red-600"
            />
            <StatCard
              label="Plans"
              value={financials?.savingsPlans?.length || 0}
              icon={FiCalendar}
              colorClass="bg-blue-50 text-blue-600"
            />
          </div>

          {/* Detailed Tabs/Sections */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
            <div className="flex border-b border-gray-50 bg-gray-50/20">
              <button 
                onClick={() => setActiveTab('info')}
                className={`px-8 py-6 text-sm font-black uppercase tracking-widest transition-all ${
                  activeTab === 'info' 
                  ? 'text-blue-600 border-b-4 border-blue-600' 
                  : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Identity & Employment
              </button>
              <button 
                onClick={() => setActiveTab('thrift')}
                className={`px-8 py-6 text-sm font-black uppercase tracking-widest transition-all ${
                  activeTab === 'thrift' 
                  ? 'text-blue-600 border-b-4 border-blue-600' 
                  : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Thrift History
              </button>
            </div>

            <div className="p-8">
              {activeTab === 'info' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-2 duration-300">
                   <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      ID Type & Number
                    </p>
                    <div className="flex items-center space-x-2 text-gray-800 font-bold">
                      <FiShield size={16} className="text-gray-300" />
                      <span>
                        {member.idType} - {member.idNumber || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Occupation & Employer
                    </p>
                    <div className="flex items-center space-x-2 text-gray-800 font-bold">
                      <FiBriefcase size={16} className="text-gray-300" />
                      <span>
                        {member.occupation || "N/A"} @ {member.employer || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Date of Birth
                    </p>
                    <div className="flex items-center space-x-2 text-gray-800 font-bold">
                      <FiCalendar size={16} className="text-gray-300" />
                      <span>
                        {member.dateOfBirth
                          ? format(new Date(member.dateOfBirth), 'PPP')
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Banking Details
                    </p>
                    <div className="flex items-center space-x-2 text-gray-800 font-bold">
                      <FiCreditCard size={16} className="text-gray-300" />
                      <span>
                        {member.bankName} - {member.accountNumber || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'thrift' && (
                <div className="animate-in slide-in-from-bottom-2 duration-300 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Month</th>
                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                        <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Method</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {financials?.contributions?.length > 0 ? (
                        financials.contributions.map((row) => (
                          <tr key={row.id} className="group hover:bg-gray-50/50 transition-all">
                            <td className="py-4 text-sm font-bold text-gray-800">
                              {format(new Date(row.month + '-01'), 'MMMM yyyy')}
                            </td>
                            <td className="py-4">
                              <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                                row.type === 'thrift' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                              }`}>
                                {row.type?.replace(/_/g, " ")}
                              </span>
                            </td>
                            <td className="py-4 text-sm font-black text-gray-900">
                              ₦{parseFloat(row.amount).toLocaleString()}
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-1.5">
                                {row.status === 'paid' ? (
                                  <FiCheckCircle className="text-green-500" />
                                ) : row.status === 'failed_insufficient' ? (
                                  <FiXCircle className="text-red-500" />
                                ) : (
                                  <FiClock className="text-amber-500" />
                                )}
                                <span className={`text-[10px] font-bold uppercase ${
                                  row.status === 'paid' ? 'text-green-600' : 
                                  row.status === 'failed_insufficient' ? 'text-red-600' : 'text-amber-600'
                                }`}>
                                  {row.status === 'failed_insufficient' ? 'FAILED' : row.status?.replace(/_/g, " ")}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                              {row.collectionMethod || '—'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="py-12 text-center text-gray-400 italic text-sm">
                            No contribution history documented yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Accounts & Loans Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center justify-between">
                <span>Active Accounts</span>
                <FiCreditCard className="text-blue-500" />
              </h3>
              <div className="space-y-4">
                {financials?.accounts?.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100"
                  >
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {acc.accountType.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs font-mono font-medium text-gray-500">
                        {acc.accountNumber}
                      </p>
                    </div>
                    <p className="text-base font-black text-gray-900">
                      ₦{Number(acc.balance).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center justify-between">
                <span>Recent Loans</span>
                <FiTrendingUp className="text-red-500" />
              </h3>
              <div className="space-y-4">
                {financials?.loans?.slice(0, 3).map((loan) => (
                  <div
                    key={loan.id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100"
                  >
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {loan.status?.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs font-medium text-gray-500">
                        Total: ₦{Number(loan.loanAmount).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-base font-black text-red-600">
                      -₦{Number(loan.outstandingBalance).toLocaleString()}
                    </p>
                  </div>
                ))}
                {(!financials?.loans || financials.loans.length === 0) && (
                  <p className="text-sm text-gray-400 italic text-center py-4">
                    No loan records
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <UserEditModal
          user={member}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
};

export default MemberProfile;
