import React, { useState } from "react";
import {
  FiX,
  FiUserPlus,
  FiLock,
  FiMail,
  FiUser,
  FiLayers,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { useAdminCreateUser } from "../../../features/members/hooks/useMembers";
import { useForm } from "react-hook-form";
import BaseModal from "./BaseModal";

const UserActionForm = ({ onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const createUserMutation = useAdminCreateUser();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    createUserMutation.mutate(data, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <BaseModal
      isOpen={true} // Form manages its own open state via the parent component rendering it
      onClose={onClose}
      title="Add New User"
      icon={FiUserPlus}
      maxWidthClass="max-w-md"
      footer={
        <div className="flex space-x-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={createUserMutation.isPending}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
          >
            {createUserMutation.isPending ? "Creating..." : "Create User"}
          </button>
        </div>
      }
    >
      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Full Name
          </label>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              {...register("name", { required: "Name is required" })}
              type="text"
              placeholder="John Doe"
              className={`w-full pl-10 pr-4 py-2 border ${errors.name ? "border-red-500" : "border-gray-200"} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm`}
            />
          </div>
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              type="email"
              placeholder="john@example.com"
              className={`w-full pl-10 pr-4 py-2 border ${errors.email ? "border-red-500" : "border-gray-200"} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm`}
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={`w-full pl-10 pr-10 py-2 border ${errors.password ? "border-red-500" : "border-gray-200"} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm`}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Role
          </label>
          <div className="relative">
            <FiLayers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              {...register("role", { required: "Role is required" })}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm appearance-none bg-white"
            >
              <option value="">Select Role</option>
              <option value="member">Member</option>
              <option value="staff">Staff</option>
              <option value="super_admin">Admin</option>
            </select>
          </div>
          {errors.role && (
            <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>
          )}
        </div>
      </form>
    </BaseModal>
  );
};

export default UserActionForm;
