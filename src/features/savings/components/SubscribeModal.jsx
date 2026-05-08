import { FaNairaSign } from "react-icons/fa6";
;
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FiX,
  FiTarget,
  FiCalendar,
  FiRefreshCw,
  FiInfo,
  FiHome,
  FiBook,
  FiBriefcase,
  FiZap,
  FiShield,
  FiLock,
  FiFlag,
  FiCoffee,
  FiTag } from "react-icons/fi";
import toast from "react-hot-toast";
import { createSavingsPlan } from "../services/savingsApi";

const SubscribeModal = ({ product, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      productId: product.id,
      duration: product.minDuration || 30,
      frequency: "monthly",
      targetAmount: "",
      autoSaveAmount: "",
    },
  });

  const watchTargetAmount = watch("targetAmount");
  const watchDuration = watch("duration");
  const watchFrequency = watch("frequency");
  const watchAutoSaveAmount = watch("autoSaveAmount");
  const watchInitialDeposit = watch("initialDeposit");

  // Bidirectional Calculator Logic
  useEffect(() => {
    if (product.type === "safebox") return;

    if (watchTargetAmount && watchDuration && watchFrequency !== "manual") {
      const target = parseFloat(watchTargetAmount);
      const days = parseInt(watchDuration);
      if (isNaN(target) || isNaN(days)) return;

      let divisor = 1;
      if (watchFrequency === "daily") divisor = days;
      else if (watchFrequency === "weekly") divisor = Math.max(1, Math.ceil(days / 7));
      else if (watchFrequency === "monthly") divisor = Math.max(1, Math.ceil(days / 30));

      const activeField = document.activeElement?.name;

      // If user is typing in target, OR if frequency/duration changed, update periodic
      if (activeField === "targetAmount" || activeField === "frequency" || activeField === "duration" || !activeField) {
        const calculatedAutoSave = Math.ceil(target / divisor);
        if (calculatedAutoSave !== parseFloat(watchAutoSaveAmount)) {
          setValue("autoSaveAmount", calculatedAutoSave);
        }
      }
      // If user is typing in periodic, update target
      else if (activeField === "autoSaveAmount") {
        const periodic = parseFloat(watchAutoSaveAmount);
        if (!isNaN(periodic)) {
          const calculatedTarget = Math.ceil(periodic * divisor);
          if (calculatedTarget !== parseFloat(watchTargetAmount)) {
            setValue("targetAmount", calculatedTarget);
          }
        }
      }
    }
  }, [
    watchTargetAmount,
    watchAutoSaveAmount,
    watchDuration,
    watchFrequency,
    setValue,
    product.type,
  ]);
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        targetAmount: data.targetAmount ? Math.ceil(parseFloat(data.targetAmount)) : undefined,
        autoSaveAmount: data.autoSaveAmount ? Math.ceil(parseFloat(data.autoSaveAmount)) : undefined,
        initialDeposit: data.initialDeposit ? Math.ceil(parseFloat(data.initialDeposit)) : undefined,
        duration: parseInt(data.duration)
      };
      await createSavingsPlan(payload);
      toast.success(`Successfully subscribed to ${product.name}!`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Subscription failed:", error);
      toast.error(
        error.response?.data?.message || "Failed to create savings plan",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div
          className={`px-6 py-4 border-b border-gray-100 flex justify-between items-center text-white ${
            product.type === "safebox"
              ? "bg-orange-600"
              : product.type === "fixed"
                ? "bg-purple-600"
                : "bg-blue-600"
          }`}
        >
          <div className="flex items-center">
            {product.category === "rent" ? (
              <FiHome className="mr-2 text-xl" />
            ) : product.category === "education" ? (
              <FiBook className="mr-2 text-xl" />
            ) : product.category === "business" ? (
              <FiBriefcase className="mr-2 text-xl" />
            ) : product.category === "emergency" ? (
              <FiZap className="mr-2 text-xl" />
            ) : product.category === "festive" ? (
              <FiCoffee className="mr-2 text-xl" />
            ) : product.type === "safebox" ? (
              <FiShield className="mr-2 text-xl" />
            ) : product.type === "fixed" ? (
              <FiLock className="mr-2 text-xl" />
            ) : (
              <FiTarget className="mr-2 text-xl" />
            )}
            <h2 className="font-bold text-lg">
              {product.isQuickSaving
                ? `Setup Your ${product.name}`
                : `Subscribe to ${product.name}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div
            className={`${
              product.type === "safebox"
                ? "bg-orange-50 border-orange-100 text-orange-800"
                : product.type === "fixed"
                  ? "bg-purple-50 border-purple-100 text-purple-800"
                  : "bg-blue-50 border-blue-100 text-blue-800"
            } border rounded-xl p-4 flex items-start mb-2 shadow-sm`}
          >
            <FiInfo className="mt-1 mr-3 flex-shrink-0" />
            <div className="text-xs space-y-1">
              <p className="font-bold">
                {product.type === "safebox"
                  ? "SafeBox Saving Schedule"
                  : product.type === "fixed"
                    ? "Fixed Deposit Terms"
                    : "Target Goal Setup"}
              </p>
              <p className="leading-relaxed">
                {product.type === "safebox"
                  ? "Lock your funds securely for 30-1000 days. No early withdrawal penalties, just disciplined growth with daily interest."
                  : `Set your target and duration. We'll help you calculate how much you need to save ${
                      watchFrequency === "manual"
                        ? "to reach your goal"
                        : watchFrequency + " to stay on track"
                    }.`}
              </p>
              {parseFloat(product.penaltyPercentage) > 0 && (
                <p className="text-red-600 font-bold border-t border-current pt-1 mt-1">
                  ⚠️ Note: A {product.penaltyPercentage}% penalty applies for
                  early withdrawals from this plan.
                </p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
              <FiTag className="mr-1 text-gray-400" /> Plan Name (e.g. My Secret
              Stash)
            </label>
            <input
              type="text"
              {...register("planName")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder={`My ${product.name}`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Target Amount */}
            {product.type !== "safebox" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                  <FaNairaSign className="mr-1 text-gray-400" /> Target Goal
                  (₦)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  {...register("targetAmount", {
                    required: product.type !== "safebox",
                    min: 100,
                    validate: val => product.type === "safebox" || !isNaN(parseFloat(val)) || "Valid number required"
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. 500000"
                />
                {errors.targetAmount && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.targetAmount.message}
                  </p>
                )}
              </div>
            )}

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                <FiCalendar className="mr-1 text-gray-400" />{" "}
                {product.type === "safebox" ? "Lock Funds For" : "Duration"}{" "}
                (Days)
              </label>
              <input
                type="text"
                inputMode="numeric"
                {...register("duration", {
                  required: "Duration is required",
                  min: {
                    value: product.minDuration || 30,
                    message: `Min ${product.minDuration || 30} days`,
                  },
                  validate: val => !isNaN(parseInt(val)) || "Valid number required"
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. 90"
              />
              {errors.duration && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.duration.message}
                </p>
              )}
            </div>
          </div>

          {/* Initial Deposit for SafeBox */}
          {product.type === "safebox" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                <FaNairaSign className="mr-1 text-gray-400" /> Initial Deposit
                (₦)
              </label>
              <input
                type="text"
                inputMode="decimal"
                {...register("initialDeposit", {
                  required: "Initial deposit is required",
                  min: product.minDeposit || 0,
                  validate: val => !isNaN(parseFloat(val)) || "Valid number required"
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder={`Min. ₦${product.minDeposit || 0}`}
              />
            </div>
          )}

          {product.type !== "safebox" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Frequency */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                  <FiRefreshCw className="mr-1 text-gray-400" /> Frequency
                </label>
                <select
                  {...register("frequency")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="manual">Manual (No Autosave)</option>
                </select>
              </div>

              {/* AutoSave Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Periodic Saving (₦)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  {...register("autoSaveAmount", {
                    required: watchFrequency !== "manual",
                    min: 0,
                    validate: val => watchFrequency === "manual" || !isNaN(parseFloat(val)) || "Valid number required"
                  })}
                  disabled={watchFrequency === "manual"}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${watchFrequency === "manual" ? "bg-gray-50" : ""}`}
                />
                {errors.autoSaveAmount && (
                  <p className="text-red-500 text-xs mt-1">
                    Required for autosave
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Projection Card */}
          {product.type === "safebox" &&
            watchInitialDeposit &&
            watchDuration && (
              <div className="bg-orange-50 rounded-xl p-4 border border-dashed border-orange-200">
                <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2">
                  SafeBox Earnings Projection
                </h4>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-gray-600">
                      Estimated Interest ({product.interestRate}% p.a):
                    </p>
                    <p className="text-xl font-bold text-orange-600">
                      +₦
                      {Math.floor(
                        (parseFloat(watchInitialDeposit) *
                          (product.interestRate / 100) *
                          parseInt(watchDuration)) /
                          365,
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Lock Period</p>
                    <p className="text-sm font-bold text-gray-700">
                      {watchDuration} Days
                    </p>
                  </div>
                </div>
              </div>
            )}

          {product.type !== "safebox" && watchTargetAmount && watchDuration && (
            <div className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Goal Projection
              </h4>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-gray-600">
                    Target: ₦{parseFloat(watchTargetAmount).toLocaleString()}
                  </p>
                  <p className="text-xl font-bold text-blue-600">
                    ₦{parseFloat(watchAutoSaveAmount || 0).toLocaleString()}{" "}
                    <span className="text-sm font-normal text-gray-400">
                      / {watchFrequency}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="text-sm font-bold text-gray-700">
                    {watchDuration} Days
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Processing..." : "Start Saving Now"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscribeModal;
