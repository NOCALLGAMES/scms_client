import React, { useState } from "react";
import { FiPlus, FiShield, FiMail, FiPhone, FiCheckCircle, FiX, FiEye, FiEyeOff, FiMoreVertical, FiTrash2, FiUser } from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ManagementDirectory from "../../../shared/components/common/ManagementDirectory";
import { useConfirm } from "../../../contexts/ConfirmationContext";
import { getPlatformAdmins, createPlatformAdmin } from "../../admin/services/superAdminApi";
import toast from "react-hot-toast";

const PlatformTeam = () => {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  // Fetch platform admins
  const { data: admins = [], isLoading, isError } = useQuery({
    queryKey: ["platform-admins"],
    queryFn: getPlatformAdmins,
  });

  // Create admin mutation
  const createMutation = useMutation({
    mutationFn: createPlatformAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-admins"] });
      setIsCreateModalOpen(false);
      setFormData({ name: "", email: "", phoneNumber: "", password: "" });
      toast.success("Platform administrator created successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create administrator");
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    createMutation.mutate(formData);
  };

  const columns = [
    {
      header: "Administrator",
      accessor: "name",
      render: (admin) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 flex flex-shrink-0 items-center justify-center text-emerald-600 font-black shadow-sm transform rotate-3">
            <span className="-rotate-3">{admin.name[0].toUpperCase()}</span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-black text-gray-900">{admin.name}</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">ID: ADM-{admin.id.toString().padStart(3, '0')}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Contact",
      accessor: "email",
      render: (admin) => (
        <div className="text-sm">
          <div className="flex items-center font-medium text-gray-700">
            <FiMail className="mr-2 text-emerald-500" size={14} />
            {admin.email}
          </div>
          {admin.phoneNumber && (
            <div className="flex items-center mt-1 text-gray-400 font-medium">
              <FiPhone className="mr-2" size={14} />
              {admin.phoneNumber}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (admin) => (
        <span className="px-3 py-1 inline-flex text-[10px] font-black uppercase tracking-widest rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
          {admin.status}
        </span>
      ),
    },
    {
      header: "Joined",
      accessor: "createdAt",
      render: (admin) => (
        <span className="text-xs font-bold text-gray-500">
          {new Date(admin.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      ),
    },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <ManagementDirectory
        title="Platform Team Management"
        description="Manage the core administrative team with global platform oversight."
        primaryAction={{
          label: "Add Administrator",
          icon: <FiPlus />,
          onClick: () => setIsCreateModalOpen(true),
        }}
        data={admins}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        searchKeys={["name", "email"]}
        emptyMessage="No additional administrators found."
      />

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                  <FiShield size={20} />
                </div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">New Admin Credentials</h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-200 focus:bg-white outline-none transition-all font-bold"
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
                    System Email address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-200 focus:bg-white outline-none transition-all font-bold"
                    placeholder="admin@nocall.coop"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
                    Direct Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-200 focus:bg-white outline-none transition-all font-bold"
                    placeholder="+234..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
                    Access Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 pr-12 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-200 focus:bg-white outline-none transition-all font-bold"
                      placeholder="Minimum 8 characters"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full py-4 bg-[#006a61] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-800 shadow-xl shadow-emerald-100 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center"
                >
                  {createMutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Granting Access...
                    </>
                  ) : (
                    <>
                      <FiShield className="mr-3" />
                      Grant Platform Access
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformTeam;
