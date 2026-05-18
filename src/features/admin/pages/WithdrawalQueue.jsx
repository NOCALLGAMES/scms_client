import { FaNairaSign } from "react-icons/fa6";
import React, { useState, useEffect } from "react";
import { FiUser,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiSearch,
  FiAlertCircle } from "react-icons/fi";
import {
  getWithdrawalQueue,
  processWithdrawal,
} from "../../savings/services/withdrawalApi";
import toast from "react-hot-toast";
import BaseModal from "../../../shared/components/common/BaseModal";
import ConfirmationModal from "../../../shared/components/common/ConfirmationModal";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { useSocket } from "../../../contexts/SocketContext";

const WithdrawalQueue = () => {
  const { role } = useAuth();
  const isAdmin = role === "institution_admin";
  const [withdrawals, setWithdrawals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const socket = useSocket();

  // Rejection modal state
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Approval confirmation state
  const [approveTarget, setApproveTarget] = useState(null);

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const data = await getWithdrawalQueue();
      setWithdrawals(data.requests || []);
    } catch (error) {
      toast.error("Failed to load withdrawal queue");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  // Listen for real-time withdrawal updates
  useEffect(() => {
    if (!socket) return;

    socket.on("withdrawal_updated", (data) => {
      // Refresh the queue when a withdrawal is approved/rejected
      fetchQueue();
      toast.success(`Withdrawal ${data.status} for ₦${parseFloat(data.amount).toLocaleString()}`);
    });

    socket.on("request_sync", (data) => {
      if (data?.type === "new_withdrawal_request") {
        fetchQueue();
        toast.info(`New withdrawal request: ₦${parseFloat(data.amount).toLocaleString()} from ${data.applicant}`);
      }
    });

    return () => {
      socket.off("withdrawal_updated");
      socket.off("request_sync");
    };
  }, [socket]);

  const handleApprove = async () => {
    if (!approveTarget) return;
    setIsProcessing(true);
    try {
      await processWithdrawal(approveTarget, "approved", "");
      toast.success("Withdrawal approved successfully");
      setApproveTarget(null);
      fetchQueue();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to approve withdrawal",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget || !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    setIsProcessing(true);
    try {
      await processWithdrawal(rejectTarget.id, "rejected", rejectionReason);
      toast.success("Withdrawal rejected");
      setRejectTarget(null);
      setRejectionReason("");
      fetchQueue();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to reject withdrawal",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredWithdrawals = withdrawals.filter(
    (w) =>
      w.user?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      w.account?.accountNumber?.includes(searchTerm),
  );

  const pendingCount = withdrawals.filter((w) => w.status === "pending").length;
  const pendingVolume = withdrawals
    .filter((w) => w.status === "pending")
    .reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Withdrawal Queue</h1>
          <p className="text-gray-500 text-sm mt-1">
            Approve or reject member withdrawal requests.
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search members or accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
            />
          </div>
          <button
            onClick={fetchQueue}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
            title="Refresh Queue"
          >
            <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
          <p className="text-blue-600 text-sm font-medium">Pending Requests</p>
          <p className="text-2xl font-bold text-blue-900">
            {isLoading ? "..." : pendingCount}
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
          <p className="text-amber-600 text-sm font-medium">
            Total Pending Volume
          </p>
          <p className="text-2xl font-bold text-amber-900">
            ₦{isLoading ? "..." : pendingVolume.toLocaleString()}
          </p>
        </div>
        <div className="bg-green-50 border border-green-100 p-4 rounded-xl">
          <p className="text-green-600 text-sm font-medium">Total Processed</p>
          <p className="text-2xl font-bold text-green-900">
            {isLoading
              ? "..."
              : withdrawals.filter((w) => w.status !== "pending").length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredWithdrawals.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3 overflow-hidden">
                        {req.user?.profilePicture ? (
                          <img
                            src={`${import.meta.env.VITE_SERVER_URL}/img/users/${req.user.profilePicture}`}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FiUser />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">
                          {req.user?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {req.user?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">
                      ₦{parseFloat(req.amount).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400 max-w-[150px] truncate">
                      {req.reason}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-700">
                      {req.account?.accountNumber}
                    </div>
                    <div className="text-xs text-gray-500 uppercase">
                      {req.account?.accountType?.replace(/_/g, " ")}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${req.status === "pending"
                          ? "bg-amber-50 text-amber-600 border border-amber-100"
                          : req.status === "approved"
                            ? "bg-green-50 text-green-600 border border-green-100"
                            : "bg-red-50 text-red-600 border border-red-100"
                        }`}
                    >
                      {req.status?.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    <div className="flex items-center">
                      <FiClock className="mr-2" />
                      {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {req.status === "pending" ? (
                      isAdmin ? (
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => setApproveTarget(req.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <FiCheckCircle />
                          </button>
                          <button
                            onClick={() => {
                              setRejectTarget(req);
                              setRejectionReason("");
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <FiXCircle />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-xs text-amber-500 font-medium">
                          Awaiting Admin
                        </div>
                      )
                    ) : (
                      <div className="text-center text-xs text-slate-400 italic">
                        Processed
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isLoading && filteredWithdrawals.length === 0 && (
          <div className="py-20 text-center">
            <FiCheckCircle className="text-5xl text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              No withdrawal requests found.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="py-20 text-center text-slate-400">
            <FiRefreshCw className="animate-spin text-3xl mx-auto mb-2" />
            <p>Loading queue...</p>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      <BaseModal
        isOpen={!!rejectTarget}
        onClose={() => {
          setRejectTarget(null);
          setRejectionReason("");
        }}
        title="Reject Withdrawal"
        icon={FiXCircle}
        subtitle={
          rejectTarget
            ? `Rejecting ₦${parseFloat(rejectTarget.amount).toLocaleString()} from ${rejectTarget.user?.name}`
            : ""
        }
        maxWidthClass="max-w-lg"
        footer={
          <div className="flex justify-end space-x-3 w-full">
            <button
              onClick={() => {
                setRejectTarget(null);
                setRejectionReason("");
              }}
              className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={isProcessing || !rejectionReason.trim()}
              className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Rejecting..." : "Confirm Rejection"}
            </button>
          </div>
        }
      >
        <div className="p-6">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Reason for Rejection
          </label>
          <p className="text-xs text-gray-500 mb-3">
            This reason will be visible in the system records. Please be clear
            and professional.
          </p>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g., The requested amount exceeds the available balance after pending obligations..."
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-red-500 outline-none text-sm resize-y min-h-[120px]"
          />
        </div>
      </BaseModal>

      {/* Approval Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        onConfirm={handleApprove}
        title="Approve Withdrawal"
        message="Are you sure you want to approve this withdrawal? The funds will be deducted from the member's account and a payout will be initiated if bank details are on file."
        confirmLabel="Approve Now"
        type="success"
        isLoading={isProcessing}
      />
    </div>
  );
};

export default WithdrawalQueue;
