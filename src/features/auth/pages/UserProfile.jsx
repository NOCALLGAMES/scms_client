import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth, useUpdatePassword, useUpdateProfile } from "../hooks/useAuth";
import toast from "react-hot-toast";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiSave,
  FiCamera,
  FiLoader,
  FiCreditCard,
  FiFileText,
  FiInfo,
  FiUploadCloud,
  FiActivity,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

const UserProfile = () => {
  const { user, role } = useAuth();
  const updatePasswordMutation = useUpdatePassword();
  const updateProfileMutation = useUpdateProfile();
  const fileInputRef = useRef(null);
  const addressProofRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [addressProofFile, setAddressProofFile] = useState(null);
  const [showPasswordCurrent, setShowPasswordCurrent] = useState(false);
  const [showPasswordNew, setShowPasswordNew] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phoneNumber || "",
      bankName: user?.bankName || "",
      accountNumber: user?.accountNumber || "",
      maritalStatus: user?.maritalStatus || "",
      membershipType: user?.membershipType || "",
      nextOfKinName: user?.nextOfKinName || "",
      nextOfKinPhone: user?.nextOfKinPhone || "",
      nextOfKinRelationship: user?.nextOfKinRelationship || "",
      nextOfKinAddress: user?.nextOfKinAddress || "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phoneNumber || "",
        bankName: user.bankName || "",
        accountNumber: user.accountNumber || "",
        maritalStatus: user.maritalStatus || "",
        membershipType: user.membershipType || "",
        nextOfKinName: user.nextOfKinName || "",
        nextOfKinPhone: user.nextOfKinPhone || "",
        nextOfKinRelationship: user.nextOfKinRelationship || "",
        nextOfKinAddress: user.nextOfKinAddress || "",
      });
    }
  }, [user, reset]);

  const onFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const onAddressProofSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAddressProofFile(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (data.password) {
        if (!data.passwordCurrent) {
          toast.error("Current password is required to change password");
          return;
        }
        await updatePasswordMutation.mutateAsync({
          passwordCurrent: data.passwordCurrent,
          password: data.password,
          passwordConfirm: data.confirmPassword,
        });
        reset({
          ...data,
          password: "",
          confirmPassword: "",
          passwordCurrent: "",
        });
      }

      // If profile data or pictures changed
      const formData = new FormData();
      let profileChanged = false;

      // Basic Info
      if (data.name !== user.name) {
        formData.append("name", data.name);
        profileChanged = true;
      }
      if (data.phone !== (user.phoneNumber || "")) {
        formData.append("phoneNumber", data.phone);
        profileChanged = true;
      }

      // Banking Details
      if (data.bankName !== (user.bankName || "")) {
        formData.append("bankName", data.bankName);
        profileChanged = true;
      }
      if (data.accountNumber !== (user.accountNumber || "")) {
        formData.append("accountNumber", data.accountNumber);
        profileChanged = true;
      }

      // Supplemental Info
      if (data.maritalStatus !== (user.maritalStatus || "")) {
        formData.append("maritalStatus", data.maritalStatus);
        profileChanged = true;
      }
      if (data.membershipType !== (user.membershipType || "")) {
        formData.append("membershipType", data.membershipType);
        profileChanged = true;
      }

      // Next of Kin Info
      if (data.nextOfKinName !== (user.nextOfKinName || "")) {
        formData.append("nextOfKinName", data.nextOfKinName);
        profileChanged = true;
      }
      if (data.nextOfKinPhone !== (user.nextOfKinPhone || "")) {
        formData.append("nextOfKinPhone", data.nextOfKinPhone);
        profileChanged = true;
      }
      if (data.nextOfKinRelationship !== (user.nextOfKinRelationship || "")) {
        formData.append("nextOfKinRelationship", data.nextOfKinRelationship);
        profileChanged = true;
      }
      if (data.nextOfKinAddress !== (user.nextOfKinAddress || "")) {
        formData.append("nextOfKinAddress", data.nextOfKinAddress);
        profileChanged = true;
      }

      // Files
      if (selectedFile) {
        formData.append("profilePicture", selectedFile);
        profileChanged = true;
      }
      if (addressProofFile) {
        formData.append("addressProof", addressProofFile);
        profileChanged = true;
      }

      if (profileChanged) {
        await updateProfileMutation.mutateAsync(formData);
        setSelectedFile(null);
        setAddressProofFile(null);
      }
    } catch (err) {
      console.error("Profile update failed:", err);
    }
  };

  const profileImageUrl =
    previewUrl ||
    (user?.profilePicture
      ? `${import.meta.env.VITE_SERVER_URL}/img/users/${user.profilePicture}`
      : null);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-600">
          Manage your personal information, security, and banking details.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Card */}
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center h-fit sticky top-24">
            <div className="relative inline-block group">
              <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto flex items-center justify-center text-blue-600 text-3xl font-bold mb-4 overflow-hidden border-2 border-blue-50">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={user?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0) || "U"
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-0 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors shadow-sm"
                title="Change Profile Picture"
              >
                <FiCamera size={14} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={onFileSelect}
                accept="image/*"
                className="hidden"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-sm text-gray-500 mb-2">{user?.email}</p>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wide">
              {role?.replace(/_/g, " ")}
            </span>

            <div className="mt-6 pt-6 border-t border-gray-100 text-left">
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <FiInfo className="mr-2 text-blue-500" />
                <span>Status: </span>
                <span className="ml-1 font-bold capitalize">
                  {user?.status?.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FiFileText className="mr-2 text-blue-500" />
                <span>Joined: </span>
                <span className="ml-1 font-bold">
                  {new Date(user?.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="flex-1 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Details Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2 flex items-center">
                <FiUser className="mr-2 text-blue-600" /> Basic Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      {...register("name", { required: "Name is required" })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-3.5 text-gray-400" />
                      <input
                        type="email"
                        {...register("email")}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 outline-none"
                        readOnly
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-3.5 text-gray-400" />
                      <input
                        type="text"
                        {...register("phone")}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="+234..."
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marital Status
                    </label>
                    <select
                      {...register("maritalStatus")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all"
                    >
                      <option value="">Select Status</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Membership Type
                    </label>
                    <select
                      {...register("membershipType")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all"
                    >
                      <option value="">Select Type</option>
                      <option value="regular">Regular</option>
                      <option value="premium">Premium</option>
                      <option value="executive">Executive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Next of Kin Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2 flex items-center">
                <FiActivity className="mr-2 text-blue-600" /> Next of Kin / Emergency
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                       Full Name
                    </label>
                    <input
                      type="text"
                      {...register("nextOfKinName")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Next of Kin Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                       Relationship
                    </label>
                    <input
                      type="text"
                      {...register("nextOfKinRelationship")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g. Spouse, Brother"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                       Phone Number
                    </label>
                    <input
                      type="text"
                      {...register("nextOfKinPhone")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Emergency contact #"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                       Home Address
                    </label>
                    <input
                      type="text"
                      {...register("nextOfKinAddress")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Full residential address"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Banking Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2 flex items-center">
                <FiCreditCard className="mr-2 text-blue-600" /> Banking Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    {...register("bankName")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter bank name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    {...register("accountNumber")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter 10-digit number"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>

            {/* Verification Documents Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2 flex items-center">
                <FiFileText className="mr-2 text-blue-600" /> Verification
                Documents
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Proof (Utility Bill)
                  </label>
                  <div
                    onClick={() => addressProofRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-500 hover:bg-blue-50/10 transition-all cursor-pointer"
                  >
                    <FiUploadCloud className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      {addressProofFile
                        ? addressProofFile.name
                        : user?.addressProof
                          ? "Change uploaded document"
                          : "Click to upload utility bill"}
                    </p>
                    <input
                      type="file"
                      ref={addressProofRef}
                      onChange={onAddressProofSelect}
                      accept=".pdf,image/*"
                      className="hidden"
                    />
                  </div>
                  {user?.addressProof && !addressProofFile && (
                    <p className="mt-2 text-xs text-green-600 font-medium flex items-center">
                      <FiFileText className="mr-1" /> Currently uploaded:{" "}
                      {user.addressProof}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2 flex items-center">
                <FiLock className="mr-2 text-blue-600" /> Security & Password
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type={showPasswordCurrent ? "text" : "password"}
                      {...register("passwordCurrent")}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPasswordCurrent(!showPasswordCurrent)}
                    >
                      {showPasswordCurrent ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password (Optional)
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-3.5 text-gray-400" />
                      <input
                        type={showPasswordNew ? "text" : "password"}
                        {...register("password", {
                          minLength: { value: 6, message: "Min 6 characters" },
                        })}
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPasswordNew(!showPasswordNew)}
                      >
                        {showPasswordNew ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-3.5 text-gray-400" />
                      <input
                        type={showPasswordConfirm ? "text" : "password"}
                        {...register("confirmPassword", {
                          validate: (value) =>
                            !watch("password") ||
                            value === watch("password") ||
                            "Passwords do not match",
                        })}
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      >
                        {showPasswordConfirm ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={
                  updateProfileMutation.isPending ||
                  updatePasswordMutation.isPending
                }
                className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center transition-all disabled:opacity-50"
              >
                {updateProfileMutation.isPending ||
                updatePasswordMutation.isPending ? (
                  <FiLoader className="mr-2 animate-spin" />
                ) : (
                  <FiSave className="mr-2" />
                )}
                Save All Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
