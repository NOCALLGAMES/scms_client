import { FaNairaSign } from "react-icons/fa6";
;
import React, { useState } from "react";
import { FiTrendingUp, FiLoader, FiAlertCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import { buyFromSavings } from "../../admin/services/sharesApi";

const BuySharesModal = ({ isOpen, onClose, savingsBalance, onPortfolioUpdate }) => {
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) > parseFloat(savingsBalance)) {
      toast.error("Insufficient savings balance");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await buyFromSavings(Math.ceil(parseFloat(amount)));
      toast.success(response.message || "Shares purchased successfully!");
      onClose();
      if (onPortfolioUpdate) onPortfolioUpdate();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to purchase shares");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div>
            <h2 className="text-xl font-black flex items-center gap-2">
              <FiTrendingUp />
              Buy Share Capital
            </h2>
            <p className="text-blue-100 text-xs mt-1">Convert savings to cooperative shares.</p>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform duration-200 p-2 rounded-full hover:bg-white/10">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Available Savings</p>
              <p className="text-lg font-black text-slate-700">₦{parseFloat(savingsBalance || 0).toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <FaNairaSign />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Purchase Amount (₦)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">₦</span>
              <input
                type="text"
                inputMode="decimal"
                required
                autoFocus
                className="w-full pl-9 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white transition-all outline-none font-black text-xl text-slate-800 placeholder:text-slate-300"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            {amount && parseFloat(amount) > 0 && (
                <p className="mt-2 text-[10px] text-blue-600 font-bold flex items-center gap-1 px-1">
                    <FiAlertCircle /> This will be deducted from your savings balance.
                </p>
            )}
          </div>

          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
            <h4 className="text-[10px] font-black text-blue-600 uppercase mb-1">Why buy shares?</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Shares represent your ownership in the cooperative and entitle you to annual **Dividend Distributions** based on surplus.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <FiLoader className="animate-spin" /> Processing...
              </>
            ) : (
              "Confirm Purchase"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BuySharesModal;
