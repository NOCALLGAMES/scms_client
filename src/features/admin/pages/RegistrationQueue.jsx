import React, { useState } from "react";
import {
  FiUser,
  FiMail,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiX,
  FiFileText,
  FiBriefcase,
  FiCreditCard,
  FiMapPin,
  FiPhone,
} from "react-icons/fi";
import {
  useMembers,
  useApproveMember,
  usePendingRegistrations,
  useRejectMember,
} from "../../members/hooks/useMembers";
import ManagementDirectory from "../../../shared/components/common/ManagementDirectory";
import UserActionMenu from "../../../shared/components/common/UserActionMenu";
import BaseModal from "../../../shared/components/common/BaseModal";
import ConfirmationModal from "../../../shared/components/common/ConfirmationModal";
import { useAuth } from "../../auth/hooks/useAuth";
import toast from "react-hot-toast";

const RegistrationQueue = () => {
  const { role } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToReject, setUserToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [userToApprove, setUserToApprove] = useState(null);

  const {
    data: pendingUsers = [],
    isLoading,
    isError,
  } = usePendingRegistrations();
  const approveUserMutation = useApproveMember();
  const rejectUserMutation = useRejectMember();

  const isAdmin = role === "institution_admin";

  const handleApprove = async () => {
    if (!userToApprove) return;

    await approveUserMutation.mutateAsync(userToApprove);
    setUserToApprove(null);
    setSelectedUser(null);
  };

  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    await rejectUserMutation.mutateAsync({
      id: userToReject.id,
      reason: rejectionReason,
    });

    setUserToReject(null);
    setRejectionReason("");
    // Close the review modal too just in case it was open
    if (selectedUser?.id === userToReject.id) {
      setSelectedUser(null);
    }
  };

  const columns = [
    {
      header: "Applicant",
      accessor: "name",
      render: (reg) => (
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3 overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
            {reg.profilePicture ? (
              <img
                src={`${import.meta.env.VITE_SERVER_URL}/img/users/${reg.profilePicture}`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <FiUser className="text-xl opacity-70" />
            )}
          </div>
          <div>
            <div className="font-bold text-gray-900 tracking-tight">
              {reg.name}
            </div>
            <div className="text-xs text-gray-500 flex items-center mt-0.5">
              <FiMail className="mr-1" /> {reg.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (reg) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${
            reg.status === "rejected"
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}
        >
          {reg.status.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      header: "Submitted",
      accessor: "createdAt",
      render: (reg) => (
        <div className="flex items-center text-sm text-gray-600 font-medium">
          <FiClock className="mr-2 text-gray-400" />
          {new Date(reg.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      align: "right",
      render: (reg) => (
        <div className="flex justify-end items-center space-x-2">
          <button
            onClick={() => setSelectedUser(reg)}
            className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors text-sm font-bold flex items-center border border-blue-100"
          >
            <FiEye className="mr-1" /> Review
          </button>
          {isAdmin && (
            <button
              onClick={() => setUserToApprove(reg.id)}
              disabled={approveUserMutation.isPending}
              className="p-1.5 text-green-600 hover:bg-green-50 rounded border border-transparent hover:border-green-200 transition-all"
              title="Quick Approve"
            >
              <FiCheckCircle size={18} />
            </button>
          )}
          {isAdmin && (
            <UserActionMenu
              user={reg}
              onViewProfile={() => setSelectedUser(reg)}
              onReviewRegistration={() => setSelectedUser(reg)}
              onSuspend={() => toast.error("Active users only")}
              onActivate={() => setUserToApprove(reg.id)}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <ManagementDirectory
        title="Registration Queue"
        description="Review and approve new member applications."
        data={pendingUsers}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        searchKeys={["name", "email"]}
        emptyMessage="All caught up! No pending applications to review."
      />

      {/* Profile Review Modal */}
      <BaseModal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="Applicant Review"
        icon={FiUser}
        maxWidthClass="max-w-4xl"
      >
        {selectedUser && (
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Avatar & Quick Actions */}
              <div className="md:col-span-1 space-y-4">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
                  <div className="w-32 h-32 mx-auto rounded-full bg-blue-50 border-4 border-white shadow-md overflow-hidden mb-4">
                    {selectedUser.profilePicture ? (
                      <img
                        src={`${import.meta.env.VITE_SERVER_URL}/img/users/${selectedUser.profilePicture}`}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiUser className="w-full h-full text-blue-300 p-6" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedUser.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {selectedUser.email}
                  </p>

                  {isAdmin && (
                    <div className="w-full flex space-x-3 mt-6">
                      <button
                        onClick={() => setUserToApprove(selectedUser.id)}
                        className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-green-700 transition"
                      >
                        Approve
                      </button>
                    </div>
                  )}

                  {selectedUser.status === "rejected" &&
                    selectedUser.rejectionReason && (
                      <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-100 text-left">
                        <div className="flex items-center text-red-600 font-bold text-[10px] uppercase tracking-wider mb-1.5">
                          <FiXCircle className="mr-1.5" /> Previous Rejection
                        </div>
                        <p className="text-xs text-red-700 font-medium leading-relaxed italic">
                          "{selectedUser.rejectionReason}"
                        </p>
                      </div>
                    )}
                </div>

                {/* ID / Identification */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-800 border-b pb-2 mb-3 flex items-center">
                    <FiCreditCard className="mr-2 text-blue-500" />{" "}
                    Identification
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-500 uppercase text-xs block font-semibold tracking-wider">
                        ID Type
                      </span>
                      <span className="text-gray-900 font-medium">
                        {selectedUser.idType || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 uppercase text-xs block font-semibold tracking-wider">
                        ID Number
                      </span>
                      <span className="text-gray-900 font-medium break-all">
                        {selectedUser.idNumber || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Details */}
              <div className="md:col-span-2 space-y-6">
                {/* Personal & Contact Detail */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <FiUser className="mr-2 text-blue-500" /> Personal Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 block text-xs uppercase font-semibold">
                        Phone
                      </span>
                      <span className="font-medium flex items-center mt-1">
                        <FiPhone className="mr-1 text-gray-400" />{" "}
                        {selectedUser.phoneNumber || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs uppercase font-semibold">
                        DOB
                      </span>
                      <span className="font-medium block mt-1">
                        {selectedUser.dateOfBirth
                          ? new Date(
                              selectedUser.dateOfBirth,
                            ).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs uppercase font-semibold">
                        Gender
                      </span>
                      <span className="font-medium block mt-1 capitalize">
                        {selectedUser.gender || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs uppercase font-semibold">
                        Marital Status
                      </span>
                      <span className="font-medium block mt-1 capitalize">
                        {selectedUser.maritalStatus || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs uppercase font-semibold">
                        Membership Type
                      </span>
                      <span className="font-medium block mt-1 capitalize">
                        {selectedUser.membershipType || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Banking Details */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <FiCreditCard className="mr-2 text-blue-500" /> Banking
                    Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 block text-xs uppercase font-semibold">
                        Bank Name
                      </span>
                      <span className="font-medium block mt-1">
                        {selectedUser.bankName || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs uppercase font-semibold">
                        Account Number
                      </span>
                      <span className="font-medium block mt-1">
                        {selectedUser.accountNumber || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Employment & Location */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <FiBriefcase className="mr-2 text-blue-500" /> Background
                    Info
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="col-span-2 md:col-span-1">
                      <span className="text-gray-500 block text-xs uppercase font-semibold">
                        Occupation
                      </span>
                      <span className="font-medium block mt-1">
                        {selectedUser.occupation || "N/A"}
                      </span>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <span className="text-gray-500 block text-xs uppercase font-semibold">
                        Employer
                      </span>
                      <span className="font-medium block mt-1">
                        {selectedUser.employer || "N/A"}
                      </span>
                    </div>
                    <div className="col-span-2 mt-2">
                      <span className="text-gray-500 block text-xs uppercase font-semibold">
                        Home Address
                      </span>
                      <span className="font-medium flex items-center mt-1">
                        <FiMapPin className="mr-1 text-gray-400 flex-shrink-0" />
                        {selectedUser.address || "N/A"},{" "}
                        {selectedUser.lga || "LGA"},{" "}
                        {selectedUser.state || "State"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Documents Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <FiFileText className="mr-2 text-blue-500" /> Uploaded
                    Documents
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ID Image */}
                    <div className="border rounded-lg p-3 bg-gray-50 text-center">
                      <span className="text-xs font-bold text-gray-500 uppercase block mb-2">
                        Government ID
                      </span>
                      {selectedUser.idImage ? (
                        <a
                          href={`${import.meta.env.VITE_SERVER_URL}/img/users/${selectedUser.idImage}`}
                          target="_blank"
                          rel="noreferrer"
                          className="block relative group overflow-hidden rounded-md h-32 border border-gray-200"
                        >
                          <img
                            src={`${import.meta.env.VITE_SERVER_URL}/img/users/${selectedUser.idImage}`}
                            className="w-full h-full object-cover"
                            alt="ID Document"
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            <span className="text-white text-sm font-bold flex items-center">
                              <FiEye className="mr-1" /> View Full
                            </span>
                          </div>
                        </a>
                      ) : (
                        <div className="h-32 flex items-center justify-center bg-gray-100 rounded-md border text-gray-400 text-sm">
                          No Document
                        </div>
                      )}
                    </div>

                    {/* Address Proof */}
                    <div className="border rounded-lg p-3 bg-gray-50 text-center">
                      <span className="text-xs font-bold text-gray-500 uppercase block mb-2">
                        Proof of Address
                      </span>
                      {selectedUser.addressProof ? (
                        <a
                          href={`${import.meta.env.VITE_SERVER_URL}/img/users/${selectedUser.addressProof}`}
                          target="_blank"
                          rel="noreferrer"
                          className="block relative group overflow-hidden rounded-md h-32 border border-gray-200"
                        >
                          {selectedUser.addressProof.endsWith(".pdf") ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50 text-blue-500">
                              <FiFileText size={32} />
                              <span className="mt-2 text-xs font-bold">
                                View PDF
                              </span>
                            </div>
                          ) : (
                            <img
                              src={`${import.meta.env.VITE_SERVER_URL}/img/users/${selectedUser.addressProof}`}
                              className="w-full h-full object-cover"
                              alt="Utility Bill"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            <span className="text-white text-sm font-bold flex items-center">
                              <FiEye className="mr-1" /> View Full
                            </span>
                          </div>
                        </a>
                      ) : (
                        <div className="h-32 flex items-center justify-center bg-gray-100 rounded-md border text-gray-400 text-sm">
                          No Document
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </BaseModal>

      {/* Rejection Modal */}
      <BaseModal
        isOpen={!!userToReject}
        onClose={() => {
          setUserToReject(null);
          setRejectionReason("");
        }}
        title="Reject Application"
        icon={FiXCircle}
        subtitle={
          userToReject
            ? `Provide a reason for rejecting ${userToReject.name}'s application`
            : ""
        }
        maxWidthClass="max-w-lg"
        footer={
          <div className="flex justify-end space-x-3 w-full">
            <button
              onClick={() => {
                setUserToReject(null);
                setRejectionReason("");
              }}
              className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              onClick={submitRejection}
              disabled={rejectUserMutation.isPending || !rejectionReason.trim()}
              className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {rejectUserMutation.isPending
                ? "Rejecting..."
                : "Confirm Rejection"}
            </button>
          </div>
        }
      >
        <div className="p-6">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Reason for Rejection
          </label>
          <p className="text-xs text-gray-500 mb-3 block">
            This reason will be included in the email sent to the applicant.
            Please be clear and professional.
          </p>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g., The uploaded proof of address is blurry and illegible. Please re-apply with a clear document."
            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-red-500 outline-none text-sm resize-y min-h-[120px]"
          ></textarea>
        </div>
      </BaseModal>

      {/* Confirmation Modal for Approval */}
      <ConfirmationModal
        isOpen={!!userToApprove}
        onClose={() => setUserToApprove(null)}
        onConfirm={handleApprove}
        title="Approve Application"
        message="Are you sure you want to approve this applicant? This will automatically create their system accounts."
        confirmLabel="Approve Now"
        type="success"
        isLoading={approveUserMutation.isPending}
      />
    </div>
  );
};

export default RegistrationQueue;
