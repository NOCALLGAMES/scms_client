import React, { useState } from "react";
import { FiPlus, FiBox, FiUser, FiMail, FiPhone, FiMapPin, FiCheckCircle, FiX, FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ManagementDirectory from "../../../shared/components/common/ManagementDirectory";
import { useConfirm } from "../../../contexts/ConfirmationContext";
import { useBrand } from "../../../contexts/BrandContext";
import { getAllInstitutions, createInstitution } from "../services/institutionApi";

const InstitutionManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { brandColor, getBrandBg, getBrandBgLight, getBrandText } = useBrand();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [createdInstitution, setCreatedInstitution] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    code: "",
    currency: "NGN",
    defaultInterestRate: "5",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch institutions
  const { data: institutions = [], isLoading, isError } = useQuery({
    queryKey: ["institutions"],
    queryFn: getAllInstitutions,
  });

  // Create institution mutation
  const createMutation = useMutation({
    mutationFn: createInstitution,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
      setCreatedInstitution(data);
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        code: "",
        currency: "NGN",
        defaultInterestRate: "5",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
      });
      setFormErrors({});
    },
    onError: (error) => {
      setFormErrors(error.response?.data?.message ? { general: error.response.data.message } : { general: "Failed to create institution" });
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Institution name is required";
    if (!formData.email.trim()) errors.email = "Institution email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Invalid email format";
    if (!formData.adminName.trim()) errors.adminName = "Admin name is required";
    if (!formData.adminEmail.trim()) errors.adminEmail = "Admin email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) errors.adminEmail = "Invalid email format";
    if (!formData.adminPassword.trim()) errors.adminPassword = "Admin password is required";
    else if (formData.adminPassword.length < 8) errors.adminPassword = "Password must be at least 8 characters";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      createMutation.mutate({
        ...formData,
        defaultInterestRate: parseFloat(formData.defaultInterestRate) || 5,
      });
    }
  };

  const closeSuccessModal = () => {
    setCreatedInstitution(null);
    setIsCreateModalOpen(false);
  };

  const columns = [
    {
      header: "Institution",
      accessor: "name",
      render: (institution) => (
        <div className="flex items-center">
          <div 
            className="h-10 w-10 rounded-full flex flex-shrink-0 items-center justify-center font-bold overflow-hidden"
            style={getBrandBgLight()}
          >
            <FiBox className="text-xl" style={getBrandText()} />
          </div>
          <div className="ml-4">
            <div className="text-sm font-bold text-gray-900">{institution.name}</div>
            <div className="text-xs text-gray-500">{institution.code}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Contact",
      accessor: "email",
      render: (institution) => (
        <div className="text-sm text-gray-700">
          <div className="flex items-center">
            <FiMail className="mr-2 text-gray-400" size={14} />
            {institution.email}
          </div>
          {institution.phone && (
            <div className="flex items-center mt-1">
              <FiPhone className="mr-2 text-gray-400" size={14} />
              {institution.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Address",
      accessor: "address",
      render: (institution) =>
        institution.address ? (
          <div className="flex items-center text-sm text-gray-700">
            <FiMapPin className="mr-2 text-gray-400 flex-shrink-0" size={14} />
            <span className="truncate max-w-xs">{institution.address}</span>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (institution) => (
        <span
          className={`px-3 py-1 inline-flex text-xs font-bold rounded-full capitalize ${institution.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700"
            }`}
        >
          {institution.status?.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      header: "Created",
      accessor: "createdAt",
      render: (institution) => (
        <span className="text-sm text-gray-600">
          {new Date(institution.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <ManagementDirectory
        title="Institution Management"
        description="Manage cooperative societies and their administrators."
        primaryAction={{
          label: "Create Institution",
          icon: <FiPlus />,
          onClick: () => setIsCreateModalOpen(true),
        }}
        data={institutions}
        onRowClick={(inst) => navigate(`/superadmin/institutions/${inst.id}`)}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        searchKeys={["name", "code", "email"]}
        emptyMessage="No institutions found. Create your first institution to get started."
      />

      {/* Create Institution Modal */}
      {isCreateModalOpen && !createdInstitution && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Create New Institution</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {formErrors.general && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
                  {formErrors.general}
                </div>
              )}

              {/* Institution Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Institution Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Institution Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg outline-none transition-all ${formErrors.name ? "border-red-300" : "border-gray-300"
                        }`}
                      style={{ '--focus-ring': brandColor }}
                      onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${brandColor}40`}
                      onBlur={(e) => e.target.style.boxShadow = ''}
                      placeholder="e.g., ABC Cooperative Society"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Institution Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg outline-none transition-all ${formErrors.email ? "border-red-300" : "border-gray-300"
                        }`}
                      style={{ '--focus-ring': brandColor }}
                      onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${brandColor}40`}
                      onBlur={(e) => e.target.style.boxShadow = ''}
                      placeholder="institution@example.com"
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none transition-all"
                      onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${brandColor}40`}
                      onBlur={(e) => e.target.style.boxShadow = ''}
                      placeholder="+234..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Institution Code (Optional)
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none transition-all"
                      onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${brandColor}40`}
                      onBlur={(e) => e.target.style.boxShadow = ''}
                      placeholder="Auto-generated if empty"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Leave empty to auto-generate (e.g., COOP1234)
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Full institution address"
                  />
                </div>
              </div>

              {/* First Admin Details */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  First Administrator *
                </h3>
                <p className="text-xs text-gray-500">
                  Create the first admin user for this institution
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admin Name *
                    </label>
                    <input
                      type="text"
                      name="adminName"
                      value={formData.adminName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg outline-none transition-all ${formErrors.adminName ? "border-red-300" : "border-gray-300"
                        }`}
                      onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${brandColor}40`}
                      onBlur={(e) => e.target.style.boxShadow = ''}
                      placeholder="Full name"
                    />
                    {formErrors.adminName && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.adminName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admin Email *
                    </label>
                    <input
                      type="email"
                      name="adminEmail"
                      value={formData.adminEmail}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg outline-none transition-all ${formErrors.adminEmail ? "border-red-300" : "border-gray-300"
                        }`}
                      onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${brandColor}40`}
                      onBlur={(e) => e.target.style.boxShadow = ''}
                      placeholder="admin@example.com"
                    />
                    {formErrors.adminEmail && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.adminEmail}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admin Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminPassword ? "text" : "password"}
                        name="adminPassword"
                        value={formData.adminPassword}
                        onChange={handleInputChange}
                        className={`w-full px-3 pr-10 py-2 border rounded-lg outline-none transition-all ${formErrors.adminPassword ? "border-red-300" : "border-gray-300"
                          }`}
                        onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${brandColor}40`}
                        onBlur={(e) => e.target.style.boxShadow = ''}
                        placeholder="Minimum 8 characters"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                      >
                        {showAdminPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                      </button>
                    </div>
                    {formErrors.adminPassword && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.adminPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Default Settings
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none transition-all"
                      onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${brandColor}40`}
                      onBlur={(e) => e.target.style.boxShadow = ''}
                    >
                      <option value="NGN">NGN - Nigerian Naira</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      name="defaultInterestRate"
                      value={formData.defaultInterestRate}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none transition-all"
                      onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${brandColor}40`}
                      onBlur={(e) => e.target.style.boxShadow = ''}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  style={getBrandBg()}
                  className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {createMutation.isPending ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <FiPlus className="mr-2" />
                      Create Institution
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal with Admin Credentials */}
      {createdInstitution && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="text-green-600 text-3xl" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Institution Created Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                {createdInstitution.institution.name} has been created with code{" "}
                <strong>{createdInstitution.institution.code}</strong>.
              </p>

              <div 
                className="rounded-lg p-4 text-left mb-6"
                style={getBrandBgLight()}
              >
                <h3 className="text-sm font-semibold mb-3 flex items-center" style={getBrandText()}>
                  <FiUser className="mr-2" />
                  First Administrator Credentials
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{createdInstitution.admin.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{createdInstitution.admin.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium capitalize">{createdInstitution.admin.role.replace(/_/g, " ")}</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-blue-700">
                  The admin can now login with the email and password you provided.
                </p>
              </div>

              <button
                onClick={closeSuccessModal}
                style={getBrandBg()}
                className="w-full px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstitutionManagement;
