import { FaNairaSign } from "react-icons/fa6";
;
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { FiPlus,
  FiEdit2,
  FiTrash2,
  FiInfo,
  FiX,
  FiCheck,
  FiPercent,
  FiClock,
  FiHome,
  FiBook,
  FiBriefcase,
  FiZap,
  FiShield,
  FiLock,
  FiFlag,
  FiCoffee,
  FiPower,
  FiCheckCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import { useConfirm } from "../../../contexts/ConfirmationContext";
import {
  getSavingsProducts,
  createSavingsProduct,
  updateSavingsProduct,
  deleteSavingsProduct,
} from "../services/savingsApi";
import { useAuth } from "../../auth/hooks/useAuth";
import SubscribeModal from "../components/SubscribeModal";

const SavingsProducts = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const isManagement = ["institution_admin", "super_admin", "staff"].includes(role);
  const isAdmin = ["institution_admin", "super_admin"].includes(role);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [subscribingProduct, setSubscribingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const confirm = useConfirm();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const fetchProducts = async () => {
    try {
      const data = await getSavingsProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load saving plans");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubscriptionSuccess = () => {
    fetchProducts();
    // Redirect to savings overview after a short delay to allow the toast to be seen
    setTimeout(() => {
      navigate("/savings");
    }, 1500);
  };

  const openModal = (product = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
    reset(
      product || {
        name: "",
        type: "target",
        category: "none",
        isQuickSaving: false,
        interestRate: "",
        minDuration: 30,
        penaltyPercentage: 0,
        allowEarlyWithdrawal: true,
        description: "",
      },
    );
  };

  const closeModal = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
    reset();
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm({
      title: "Delete Saving Plan",
      message: "Are you sure you want to permanently delete this plan? This will mark it as inactive.",
      type: "danger",
      confirmLabel: "Delete Plan"
    });

    if (isConfirmed) {
      try {
        await deleteSavingsProduct(id);
        toast.success("Plan deleted successfully");
        fetchProducts();
      } catch (error) {
        toast.error("Failed to delete plan");
      }
    }
  };

  const handleToggleStatus = async (product) => {
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    const isConfirmed = await confirm({
      title: `${newStatus === 'active' ? 'Activate' : 'Deactivate'} Plan`,
      message: `Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} the ${product.name} plan?`,
      type: newStatus === 'active' ? 'info' : 'warning',
      confirmLabel: newStatus === 'active' ? 'Activate' : 'Deactivate'
    });

    if (isConfirmed) {
      try {
        await updateSavingsProduct({ id: product.id, status: newStatus });
        toast.success(`Plan ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
        fetchProducts();
      } catch (error) {
        toast.error(`Failed to ${newStatus === 'active' ? 'activate' : 'deactivate'} plan`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link
            to="/savings"
            className="text-sm text-blue-600 hover:underline mb-1 inline-block"
          >
            &larr; Back to Overview
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            {isManagement ? "Saving Plans Manager" : "Available Saving Plans"}
          </h1>
        </div>
        {isAdmin && (
          <button
            onClick={() => openModal()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md font-bold"
          >
            <FiPlus className="mr-2" /> Create New Plan
          </button>
        )}
      </div>

      {!isManagement && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Custom Plan Entry */}
            <button
              onClick={() => {
                const targetProduct = products.find(
                  (p) => p.type === "target" && p.category === "none",
                ) || products.find(p => p.type === "target") || products[0];

                if (!targetProduct || targetProduct.id === "custom") {
                  toast.error("No suitable savings template found for custom goals.");
                  return;
                }

                setSubscribingProduct({
                  ...targetProduct,
                  name: "My Custom Goal",
                  description:
                    "Create a personalized savings goal from scratch.",
                });
              }}
              className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-100 flex flex-col items-center justify-center text-center group hover:bg-blue-700 transition-all border-2 border-blue-500 hover:scale-[1.02]"
            >
              <div className="h-14 w-14 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl mb-3 group-hover:scale-110 transition-transform">
                <FiPlus />
              </div>
              <h3 className="text-white font-bold text-lg">Create Custom</h3>
              <p className="text-blue-100 text-xs mt-1">Set your own rules</p>
            </button>

            {/* Quick Savings Templates */}
            {products
              .filter((p) => p.isQuickSaving)
              .map((product) => (
                <button
                  key={product.id}
                  onClick={() => setSubscribingProduct(product)}
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col items-center text-center group"
                >
                  <div
                    className={`h-14 w-14 rounded-full flex items-center justify-center text-2xl mb-3 shadow-sm ${product.category === "rent"
                        ? "bg-blue-50 text-blue-600"
                        : product.category === "education"
                          ? "bg-purple-50 text-purple-600"
                          : product.category === "business"
                            ? "bg-green-50 text-green-600"
                            : product.category === "emergency"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-blue-50 text-blue-600"
                      }`}
                  >
                    {product.category === "rent" && <FiHome />}
                    {product.category === "education" && <FiBook />}
                    {product.category === "business" && <FiBriefcase />}
                    {product.category === "emergency" && <FiZap />}
                    {product.category === "festive" && <FiCoffee />}
                    {product.category === "none" && <FiFlag />}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-xs text-green-600 font-bold mt-1">
                      {product.interestRate}% P.A.
                    </p>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="text-gray-500 col-span-full">Loading plans...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-500 col-span-full">
            No active plans available.
          </p>
        ) : (
          products
            .filter((p) => !p.isQuickSaving || isManagement)
            .map((product) => (
              <div
                key={product.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative overflow-hidden ${product.status === "inactive" ? "opacity-75" : ""}`}
              >
                {product.status === "inactive" && (
                  <div className="absolute top-0 right-0 bg-red-100 text-red-600 text-[10px] px-2 py-1 rounded-bl-lg font-black uppercase tracking-wider">
                    INACTIVE
                  </div>
                )}
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`h-12 w-12 rounded-lg flex items-center justify-center text-xl shadow-sm ${product.type === "safebox"
                        ? "bg-orange-50 text-orange-600"
                        : product.type === "fixed"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-blue-50 text-blue-600"
                      }`}
                  >
                    {product.category === "rent" && <FiHome />}
                    {product.category === "education" && <FiBook />}
                    {product.category === "business" && <FiBriefcase />}
                    {product.category === "emergency" && <FiZap />}
                    {product.category === "festive" && <FiCoffee />}
                    {product.category === "none" &&
                      (product.type === "safebox" ? (
                        <FiShield />
                      ) : product.type === "fixed" ? (
                        <FiLock />
                      ) : (
                        <FiFlag />
                      ))}
                  </div>
                  {product.isQuickSaving && (
                    <div className="absolute top-0 left-0 bg-yellow-400 text-white text-[10px] px-2 py-0.5 rounded-br-lg font-black tracking-widest uppercase">
                      QUICK
                    </div>
                  )}
                  {isAdmin && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => openModal(product)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Plan"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(product)}
                        className={`p-2 rounded-lg transition-colors ${product.status === 'active'
                            ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                        title={product.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {product.status === 'active' ? <FiPower size={16} /> : <FiCheckCircle size={16} />}
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Permanently"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {product.description || "No description provided."}
                </p>

                <div className="space-y-3 pt-3 border-t border-gray-50">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center">
                      <FiPercent className="mr-1.5" /> Interest Rate
                    </span>
                    <span className="font-semibold text-green-600">
                      {product.interestRate}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center">
                      <FiClock className="mr-1.5" /> Duration
                    </span>
                    <span className="font-semibold text-gray-700">
                      {product.duration}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center">
                      <FaNairaSign className="mr-1.5" /> Min. Deposit
                    </span>
                    <span className="font-semibold text-gray-700">
                      ₦{parseFloat(product.minDeposit || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!isManagement && (
                  <button
                    onClick={() => setSubscribingProduct(product)}
                    className="w-full mt-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Subscribe
                  </button>
                )}
              </div>
            ))
        )}
      </div>

      {/* Basic Modal Implementation */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-gray-800 text-lg">
                {editingProduct ? "Edit Plan" : "New Saving Plan"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200"
              >
                <FiX />
              </button>
            </div>
            <form
              onSubmit={handleSubmit(async (data) => {
                try {
                  const payload = {
                    ...data,
                    interestRate: Math.ceil(parseFloat(data.interestRate) || 0),
                    minDeposit: Math.ceil(parseFloat(data.minDeposit) || 0),
                    minDuration: Math.ceil(parseFloat(data.minDuration) || 0),
                    penaltyPercentage: Math.ceil(parseFloat(data.penaltyPercentage) || 0),
                  };
                  if (editingProduct) {
                    await updateSavingsProduct({
                      id: editingProduct.id,
                      ...payload,
                    });
                    toast.success("Saving plan updated!");
                  } else {
                    await createSavingsProduct({ ...payload, isActive: true });
                    toast.success("Saving plan created!");
                  }
                  fetchProducts();
                  closeModal();
                } catch (error) {
                  toast.error("Failed to save plan details");
                }
              })}
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Product Type
                  </label>
                  <select
                    {...register("type", { required: "Type is required" })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="target">Target Savings</option>
                    <option value="fixed">Fixed Deposit</option>
                    <option value="safebox">SafeBox</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Category (Icon)
                  </label>
                  <select
                    {...register("category")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="none">Generic Plan</option>
                    <option value="rent">Rent</option>
                    <option value="education">Education</option>
                    <option value="business">Business</option>
                    <option value="emergency">Emergency</option>
                    <option value="festive">Festive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-yellow-50 p-2 rounded-lg border border-yellow-100">
                <input
                  type="checkbox"
                  {...register("isQuickSaving")}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-bold text-yellow-800">
                  Feature as "Quick Saving" Template?
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  {...register("name", { required: "Name is required" })}
                  className={`w-full px-4 py-2 border ${errors.name ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                  placeholder="e.g. Christmas Goal"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Interest Rate (%)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    {...register("interestRate", {
                      required: "Required",
                      min: { value: 0, message: "Min 0" },
                      validate: val => !isNaN(parseFloat(val)) || "Valid number required"
                    })}
                    className={`w-full px-4 py-2 border ${errors.interestRate ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                    placeholder="5.0"
                  />
                  {errors.interestRate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.interestRate.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Min. Deposit (₦)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    {...register("minDeposit", {
                      required: "Required",
                      min: { value: 0, message: "Min 0" },
                      validate: val => !isNaN(parseFloat(val)) || "Valid number required"
                    })}
                    className={`w-full px-4 py-2 border ${errors.minDeposit ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                    placeholder="1000"
                  />
                  {errors.minDeposit && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.minDeposit.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Min Duration (Days)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    {...register("minDuration", {
                      required: "Required",
                      validate: val => !isNaN(parseInt(val)) || "Valid number required"
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Penalty Fee (%)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    {...register("penaltyPercentage", {
                      validate: val => !val || !isNaN(parseFloat(val)) || "Valid number required"
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. 2.5"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register("allowEarlyWithdrawal")}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  Allow early withdrawal with penalty?
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                  placeholder="Details about this saving plan..."
                ></textarea>
              </div>
              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  {editingProduct ? "Save Changes" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isManagement && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start">
          <FiInfo className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            <strong>Administrator Note:</strong> Deactivating a saving plan will
            prevent new members from subscribing to it, but existing
            subscriptions will continue until maturity.
          </p>
        </div>
      )}

      {subscribingProduct && (
        <SubscribeModal
          product={subscribingProduct}
          onClose={() => setSubscribingProduct(null)}
          onSuccess={handleSubscriptionSuccess}
        />
      )}
    </div>
  );
};

export default SavingsProducts;
