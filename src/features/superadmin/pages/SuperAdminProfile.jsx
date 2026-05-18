import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth, useUpdatePassword, useUpdateProfile } from "../../../features/auth/hooks/useAuth";
import toast from "react-hot-toast";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiSave,
  FiCamera,
  FiLoader,
  FiShield,
  FiInfo,
  FiActivity,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

const SuperAdminProfile = () => {
  const { user } = useAuth();
  const updatePasswordMutation = useUpdatePassword();
  const updateProfileMutation = useUpdateProfile();
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
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
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phoneNumber || "",
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

      const formData = new FormData();
      let profileChanged = false;

      if (data.name !== user.name) {
        formData.append("name", data.name);
        profileChanged = true;
      }
      if (data.phone !== (user.phoneNumber || "")) {
        formData.append("phoneNumber", data.phone);
        profileChanged = true;
      }
      if (selectedFile) {
        formData.append("profilePicture", selectedFile);
        profileChanged = true;
      }

      if (profileChanged) {
        await updateProfileMutation.mutateAsync(formData);
        setSelectedFile(null);
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
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Platform Administrator Settings</h1>
          <p className="text-gray-500 font-medium">Global governance and administrative credentials</p>
        </div>
        <div className="hidden md:flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
          <FiShield className="text-emerald-600" />
          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Master Authority</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Card */}
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-100 p-8 text-center h-fit sticky top-24 overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#006a61]"></div>
            <div className="relative inline-block group mb-6">
              <div className="w-28 h-28 bg-emerald-100 rounded-3xl mx-auto flex items-center justify-center text-emerald-700 text-4xl font-black shadow-inner overflow-hidden transform rotate-3">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={user?.name}
                    className="w-full h-full object-cover -rotate-3 scale-110"
                  />
                ) : (
                  <span className="-rotate-3">{user?.name?.charAt(0) || "A"}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-2.5 bg-[#006a61] rounded-xl text-white hover:bg-emerald-700 transition-all shadow-lg hover:scale-110 active:scale-95"
                title="Change Profile Picture"
              >
                <FiCamera size={16} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={onFileSelect}
                accept="image/*"
                className="hidden"
              />
            </div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight">{user?.name}</h2>
            <p className="text-sm text-gray-500 mb-6 font-medium tracking-tight">{user?.email}</p>
            
            <div className="space-y-3">
               <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Status</span>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
               </div>
               <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Role</span>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Platform Admin</span>
               </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="flex-1 space-y-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Identity Section */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-100 p-8 relative overflow-hidden">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-sm">
                  <FiUser size={20} />
                </div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase">Identity & Contact</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">
                    Full Legal Name
                  </label>
                  <div className="relative group">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                    <input
                      type="text"
                      {...register("name", { required: "Name is required" })}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-200 focus:bg-white outline-none transition-all font-bold text-gray-800"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-[10px] font-bold mt-2 px-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">
                      System Email
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        {...register("email")}
                        className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-gray-100 rounded-2xl text-gray-400 cursor-not-allowed outline-none font-medium"
                        readOnly
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">
                      Direct Phone
                    </label>
                    <div className="relative group">
                      <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                      <input
                        type="text"
                        {...register("phone")}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-200 focus:bg-white outline-none transition-all font-bold text-gray-800"
                        placeholder="+234..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-100 p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl shadow-sm">
                  <FiLock size={20} />
                </div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase">Authority & Security</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">
                    Current Authority Password
                  </label>
                  <div className="relative group">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                    <input
                      type={showPasswordCurrent ? "text" : "password"}
                      {...register("passwordCurrent")}
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-50 focus:border-red-200 focus:bg-white outline-none transition-all font-bold"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPasswordCurrent(!showPasswordCurrent)}
                    >
                      {showPasswordCurrent ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">
                      New Password
                    </label>
                    <div className="relative group">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                      <input
                        type={showPasswordNew ? "text" : "password"}
                        {...register("password", {
                          minLength: { value: 6, message: "Min 6 characters" },
                        })}
                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-200 focus:bg-white outline-none transition-all font-bold"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPasswordNew(!showPasswordNew)}
                      >
                        {showPasswordNew ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-[10px] font-bold mt-2 px-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">
                      Confirm Authority Password
                    </label>
                    <div className="relative group">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                      <input
                        type={showPasswordConfirm ? "text" : "password"}
                        {...register("confirmPassword", {
                          validate: (value) =>
                            !watch("password") ||
                            value === watch("password") ||
                            "Passwords do not match",
                        })}
                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-200 focus:bg-white outline-none transition-all font-bold"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      >
                        {showPasswordConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-[10px] font-bold mt-2 px-1">
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
                className="px-12 py-5 bg-[#006a61] text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-emerald-800 shadow-xl shadow-emerald-100 flex items-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {updateProfileMutation.isPending ||
                updatePasswordMutation.isPending ? (
                  <FiLoader className="mr-3 animate-spin" />
                ) : (
                  <FiSave className="mr-3" />
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

export default SuperAdminProfile;
