import React from "react";
import {
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiCreditCard,
  FiBriefcase,
  FiMapPin,
  FiFileText,
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiClock,
} from "react-icons/fi";
import BaseModal from "./BaseModal";

const UserDetailsModal = ({ user, onClose }) => {
  if (!user) return null;

  const DetailItem = ({ label, value, icon: Icon }) => (
    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all group">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5 group-hover:text-blue-500 transition-colors">
        {label}
      </span>
      <div className="flex items-center text-sm font-semibold text-gray-700">
        {Icon && (
          <Icon
            className="mr-2 text-gray-400 group-hover:text-blue-400 transition-colors"
            size={14}
          />
        )}
        <span className="truncate">{value || "Not Provided"}</span>
      </div>
    </div>
  );

  return (
    <BaseModal
      isOpen={!!user}
      onClose={onClose}
      title="User Profile"
      icon={FiUser}
      subtitle="Detailed information and administrative overview"
      maxWidthClass="max-w-4xl"
      footer={
        <div className="flex justify-end w-full">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold shadow-lg shadow-gray-200 hover:bg-gray-800 transition-all text-sm"
          >
            Close Profile
          </button>
        </div>
      }
    >
      <div className="flex-1 p-8 bg-gray-50/20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Col: Photo & Quick Stats */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="w-full h-full rounded-full bg-blue-50 p-1 ring-4 ring-blue-50/50 overflow-hidden shadow-inner">
                  {user.profilePicture ? (
                    <img
                      src={`${import.meta.env.VITE_SERVER_URL}/img/users/${user.profilePicture}`}
                      alt={user.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-blue-200">
                      <FiUser size={64} />
                    </div>
                  )}
                </div>
                <div
                  className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-white ${user.status === "active" ? "bg-green-500" : "bg-amber-500"}`}
                ></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {user.name}
              </h3>
              <p className="text-sm text-gray-500 font-medium mb-6">
                {user.email}
              </p>

              <div className="flex flex-wrap justify-center gap-2">
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    user.role === "super_admin"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {user.role?.replace(/_/g, " ")}
                </span>
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    user.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {user.status?.replace(/_/g, " ")}
                </span>
              </div>

              {user.status === "rejected" && user.rejectionReason && (
                <div className="mt-6 p-4 bg-red-50 rounded-2xl border border-red-100 text-left">
                  <div className="flex items-center text-red-600 font-bold text-xs uppercase tracking-wider mb-2">
                    <FiXCircle className="mr-2" /> Rejection Reason
                  </div>
                  <p className="text-sm text-red-700 font-medium leading-relaxed italic">
                    "{user.rejectionReason}"
                  </p>
                </div>
              )}
            </div>

            {/* ID info */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h4 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-3 mb-4 flex items-center">
                <FiShield className="mr-2 text-blue-500" /> Identity
                Verification
              </h4>
              <div className="space-y-4">
                <DetailItem
                  label="ID Type"
                  value={user.idType}
                  icon={FiCreditCard}
                />
                <DetailItem
                  label="ID Number"
                  value={user.idNumber}
                  icon={FiFileText}
                />
              </div>
            </div>
          </div>

          {/* Right Col: Tabs and Groups */}
          <div className="md:col-span-8 space-y-6">
            {/* Personal */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <FiUser className="mr-3 text-blue-500" /> Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem
                  label="Phone Number"
                  value={user.phoneNumber}
                  icon={FiPhone}
                />
                <DetailItem
                  label="Date of Birth"
                  value={
                    user.dateOfBirth
                      ? new Date(user.dateOfBirth).toLocaleDateString()
                      : null
                  }
                  icon={FiClock}
                />
                <DetailItem label="Gender" value={user.gender} icon={FiUser} />
                <DetailItem
                  label="Marital Status"
                  value={user.maritalStatus}
                  icon={FiUser}
                />
                <DetailItem
                  label="Membership Type"
                  value={user.membershipType}
                  icon={FiShield}
                />
                <DetailItem
                  label="Joined Date"
                  value={new Date(user.createdAt).toLocaleDateString()}
                  icon={FiCheckCircle}
                />
              </div>
            </div>

            {/* Housing & Job */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <FiBriefcase className="mr-3 text-blue-500" /> Professional &
                Location
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem
                  label="Occupation"
                  value={user.occupation}
                  icon={FiBriefcase}
                />
                <DetailItem
                  label="Employer"
                  value={user.employer}
                  icon={FiBriefcase}
                />
                <div className="md:col-span-2">
                  <DetailItem
                    label="Home Address"
                    value={`${user.address || ""} ${user.lga || ""} ${user.state || ""}`.trim()}
                    icon={FiMapPin}
                  />
                </div>
              </div>
            </div>

            {/* Banking */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <FiCreditCard className="mr-3 text-blue-500" /> Banking Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem
                  label="Bank Name"
                  value={user.bankName}
                  icon={FiCreditCard}
                />
                <DetailItem
                  label="Account Number"
                  value={user.accountNumber}
                  icon={FiFileText}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default UserDetailsModal;
