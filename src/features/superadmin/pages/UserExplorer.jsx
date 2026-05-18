import React, { useState, useEffect } from "react";
import {
  FiUsers,
  FiSearch,
  FiMapPin,
  FiShield,
  FiMoreVertical,
  FiKey,
  FiSlash,
  FiActivity,
  FiCheckCircle,
  FiExternalLink,
} from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { searchAllUsers } from "../../admin/services/superAdminApi";
import { useConfirm } from "../../../contexts/ConfirmationContext";
import toast from "react-hot-toast";

const UserExplorer = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const confirm = useConfirm();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ["global-user-search", debouncedQuery],
    queryFn: () => searchAllUsers(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  const handleResetPassword = (user) => {
    confirm({
      title: "Reset User Password?",
      message: `Are you sure you want to trigger a password reset for ${user.name}? This will send an email to ${user.email}.`,
      confirmText: "Reset Password",
      confirmColor: "bg-emerald-600",
      onConfirm: async () => {
        toast.success(`Password reset instructions sent to ${user.email}`);
      },
    });
  };

  const handleToggleStatus = (user) => {
    const newStatus = user.status === "active" ? "suspended" : "active";
    confirm({
      title: `${newStatus === "active" ? "Activate" : "Suspend"} Account?`,
      message: `Are you sure you want to ${newStatus === "active" ? "activate" : "suspend"} the account for ${user.name}?`,
      confirmText: newStatus === "active" ? "Activate" : "Suspend",
      confirmColor: newStatus === "active" ? "bg-green-600" : "bg-red-600",
      onConfirm: async () => {
        toast.success(`User status updated to ${newStatus}`);
      },
    });
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Global User Explorer
        </h1>
        <p className="text-gray-500 mt-1 text-sm font-medium">
          Search and manage any account across all cooperative institutions on the platform.
        </p>
      </div>

      {/* Search Bar Area */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-8">
        <div className="relative max-w-2xl">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Search by name, email, or phone number..."
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-medium text-gray-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isLoading && debouncedQuery.length >= 2 && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
               <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        <p className="mt-3 text-xs text-gray-400 font-medium">
          Type at least 2 characters to begin searching across all cooperatives.
        </p>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {debouncedQuery.length < 2 ? (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="bg-emerald-50 p-6 rounded-full mb-4">
              <FiUsers className="text-4xl text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Ready to search</h3>
            <p className="text-gray-500 max-w-sm mt-1">
              Enter a member's name or email address above to look them up in the global database.
            </p>
          </div>
        ) : isError ? (
          <div className="p-20 text-center text-red-500">
            <FiSlash className="mx-auto text-4xl mb-2" />
            <p className="font-bold">Error loading users</p>
            <p className="text-sm">Please try again or contact technical support.</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-20 text-center text-gray-400">
            <FiSearch className="mx-auto text-4xl mb-2 text-gray-200" />
            <p className="font-bold">No users found</p>
            <p className="text-sm">No accounts matched "{debouncedQuery}"</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                  <th className="px-6 py-4 text-left">Member Profile</th>
                  <th className="px-6 py-4 text-left">Institution</th>
                  <th className="px-6 py-4 text-left">Role / Status</th>
                  <th className="px-6 py-4 text-left">Contact</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold group-hover:scale-105 transition-transform">
                          {user.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{user.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">ID: USR-{user.id.toString().padStart(4, '0')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-gray-100 rounded-lg">
                           <FiMapPin className="text-gray-500 text-xs" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800">{user.institution?.name}</p>
                          <p className="text-[10px] text-emerald-600 font-bold">{user.institution?.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md self-start border border-gray-200">
                          {user.role?.replace(/_/g, " ")}
                        </span>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md self-start border ${
                          user.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {user.status?.replace(/_/g, " ")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-xs font-medium text-gray-700">{user.email}</p>
                       <p className="text-[10px] text-gray-400">{user.phoneNumber || 'No phone'}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleResetPassword(user)}
                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Reset Password"
                          >
                            <FiKey size={16} />
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(user)}
                            className={`p-2 rounded-lg transition-all ${
                              user.status === 'active' ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title={user.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                          >
                            {user.status === 'active' ? <FiSlash size={16} /> : <FiCheckCircle size={16} />}
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                            <FiExternalLink size={16} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserExplorer;
