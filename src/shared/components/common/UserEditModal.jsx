import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  FiX,
  FiSave,
  FiUser,
  FiMail,
  FiPhone,
  FiCreditCard,
  FiShield,
  FiBriefcase,
  FiMapPin,
} from "react-icons/fi";
import { useUpdateMember as useAdminUpdateUser } from "../../../features/members/hooks/useMembers";
import BaseModal from "./BaseModal";

const UserEditModal = ({ user, onClose }) => {
  const updateUserMutation = useAdminUpdateUser();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      phoneNumber: user?.phoneNumber || "",
      role: user?.role || "",
      status: user?.status || "",
      bankName: user?.bankName || "",
      accountNumber: user?.accountNumber || "",
      occupation: user?.occupation || "",
      employer: user?.employer || "",
      address: user?.address || "",
      lga: user?.lga || "",
      state: user?.state || "",
      maritalStatus: user?.maritalStatus || "",
      gender: user?.gender || "",
      membershipType: user?.membershipType || "",
      nextOfKinAddress: user?.nextOfKinAddress || "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        phoneNumber: user.phoneNumber || "",
        role: user.role,
        status: user.status,
        bankName: user.bankName || "",
        accountNumber: user.accountNumber || "",
        occupation: user.occupation || "",
        employer: user.employer || "",
        address: user.address || "",
        lga: user.lga || "",
        state: user.state || "",
        maritalStatus: user.maritalStatus || "",
        gender: user.gender || "",
        membershipType: user.membershipType || "",
        nextOfKinAddress: user.nextOfKinAddress || "",
      });
    }
  }, [user, reset]);

  const onSubmit = (data) => {
    updateUserMutation.mutate(
      {
        id: user.id,
        updateData: data,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  if (!user) return null;

  return (
    <BaseModal
      isOpen={!!user}
      onClose={onClose}
      title="Edit User Details"
      icon={FiUser}
      subtitle={`Update information for ${user.name}`}
      maxWidthClass="max-w-2xl"
      footer={
        <div className="flex justify-end space-x-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={updateUserMutation.isPending}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all text-sm flex items-center"
          >
            {updateUserMutation.isPending ? (
              "Saving..."
            ) : (
              <>
                <FiSave className="mr-2" /> Save Changes
              </>
            )}
          </button>
        </div>
      }
    >
      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8"
      >
        {/* Section: Basic Info */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-blue-50 pb-2 mb-4">
            Basic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register("name", { required: "Name is required" })}
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register("phoneNumber")}
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Gender
              </label>
              <select
                {...register("gender")}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section: Admin settings */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-blue-50 pb-2 mb-4">
            Administrative Settings
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                System Role
              </label>
              <div className="relative">
                <FiShield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  {...register("role")}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white appearance-none"
                >
                  <option value="user">User (Basic)</option>
                  <option value="member">Member</option>
                  <option value="staff">Staff</option>
                  <option value="super_admin">Admin</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Account Status
              </label>
              <select
                {...register("status")}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="pending_onboarding">Pending Onboarding</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section: Professional */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-blue-50 pb-2 mb-4">
            Professional Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Occupation
              </label>
              <div className="relative">
                <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register("occupation")}
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Employer
              </label>
              <input
                {...register("employer")}
                type="text"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section: Banking */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-blue-50 pb-2 mb-4">
            Banking Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Bank Name
              </label>
              <div className="relative">
                <FiCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register("bankName")}
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Account Number
              </label>
              <input
                {...register("accountNumber")}
                type="text"
                maxLength={10}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section: Address */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-blue-50 pb-2 mb-4">
            Location
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Home Address
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register("address")}
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  LGA
                </label>
                <input
                  {...register("lga")}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  State
                </label>
                <input
                  {...register("state")}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </BaseModal>
  );
};

export default UserEditModal;
