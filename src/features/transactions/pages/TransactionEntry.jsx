import React from "react";
import { useForm } from "react-hook-form";
import { FiSave, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useConfirm } from "../../../contexts/ConfirmationContext";

const TransactionEntry = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const confirm = useConfirm();

  const onSubmit = async (data) => {
    const isConfirmed = await confirm({
      title: "Post Transaction",
      message: "Are you sure you want to post this manual transaction entry? This will update the ledger immediately.",
      type: "info",
      confirmLabel: "Post Transaction"
    });

    if (isConfirmed) {
      // NOTE: When wiring this to a real API, generate an idempotency key 
      // e.g. const idempotencyKey = self.crypto.randomUUID();
      // and pass it to the API call to prevent duplicate postings.
      const payload = {
        ...data,
        amount: Math.ceil(parseFloat(data.amount))
      };
      console.log(payload);
      toast.success("Transaction posted successfully");
      reset();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          to="/transactions"
          className="text-sm text-blue-600 hover:underline mb-2 inline-block"
        >
          &larr; Back to History
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">
          Manual Transaction Entry
        </h1>
        <p className="text-gray-600">
          Post journal entries, adjustments, or expense records.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Date
              </label>
              <input
                type="date"
                {...register("date", { required: "Date is required" })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.date.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference Number
              </label>
              <input
                type="text"
                {...register("reference", {
                  required: "Reference is required",
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. JNL-0042"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type
            </label>
            <select
              {...register("type", { required: true })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="expense">Office Expense</option>
              <option value="income">Other Income</option>
              <option value="adjustment">Account Adjustment</option>
              <option value="bank_charge">Bank Charge</option>
              <option value="transfer">Inter-Bank Transfer</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₦)
              </label>
              <input
                type="text"
                inputMode="decimal"
                {...register("amount", { 
                  required: "Amount is required",
                  validate: val => !isNaN(parseFloat(val)) || "Valid number required"
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category / GL Account
              </label>
              <select
                {...register("category")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">Select Account</option>
                <option value="travel">Travel & Transport</option>
                <option value="utilities">Utilities</option>
                <option value="supplies">Office Supplies</option>
                <option value="maintenance">Maintenance</option>
                <option value="fees">Legal & Prof. Fees</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description / Narration
            </label>
            <textarea
              {...register("description", {
                required: "Description is required",
              })}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Enter details of the transaction..."
            ></textarea>
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="pt-4 flex justify-end space-x-4">
            <Link
              to="/transactions"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 flex items-center"
            >
              <FiX className="mr-2" /> Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md flex items-center"
            >
              <FiSave className="mr-2" /> Post Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionEntry;
