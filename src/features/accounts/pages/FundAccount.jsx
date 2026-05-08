import { FaNairaSign } from "react-icons/fa6";
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiArrowLeft,
  FiCreditCard,
  FiShield,
  FiAlertCircle,
} from "react-icons/fi";
import { getMyAccounts } from "../services/accountApi";
import { initializePayment, verifyPayment } from "../services/paymentApi";
import toast from "react-hot-toast";

// ─── Verify Page Sub-Component ────────────────────────────────────────────────
const PaymentVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying | success | failed
  const [result, setResult] = useState(null);

  const verificationStarted = React.useRef(false);

  useEffect(() => {
    if (verificationStarted.current) return;
    verificationStarted.current = true;

    const run = async () => {
      const reference = searchParams.get("reference");
      const mock = searchParams.get("mock");
      const accountId = searchParams.get("accountId");
      const amount = searchParams.get("amount");

      if (!reference) {
        setStatus("failed");
        return;
      }

      try {
        const params = {};
        if (mock) params.mock = mock;
        if (accountId) params.accountId = accountId;
        if (amount) params.amount = amount;

        const data = await verifyPayment(reference, params);
        setResult(data);
        setStatus("success");
        toast.success(data.message || "Payment verified!");
      } catch (err) {
        setStatus("failed");
        toast.error(
          err.response?.data?.message || "Payment verification failed.",
        );
      }
    };

    run();
  }, [searchParams]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-8">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 max-w-md w-full text-center">
        {status === "verifying" && (
          <>
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
              <FiRefreshCw className="text-blue-500 text-3xl animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Verifying Payment
            </h2>
            <p className="text-gray-500">
              Please wait while we confirm your deposit...
            </p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="text-green-500 text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Deposit Successful!
            </h2>
            <p className="text-gray-500 mb-2">
              {result?.message || "Your account has been credited."}
            </p>
            {result?.data?.amount && (
              <div className="text-3xl font-black text-green-600 my-4">
                ₦{parseFloat(result.data.amount).toLocaleString()}
              </div>
            )}
            <button
              onClick={() => navigate("/savings")}
              className="mt-6 w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
            >
              View My Accounts
            </button>
          </>
        )}
        {status === "failed" && (
          <>
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
              <FiXCircle className="text-red-500 text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Payment Failed
            </h2>
            <p className="text-gray-500 mb-6">
              We could not verify your payment. Please contact support if funds
              were deducted.
            </p>
            <button
              onClick={() => navigate("/accounts/fund")}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Main FundAccount Component ────────────────────────────────────────────────
const QUICK_AMOUNTS = [1000, 5000, 10000, 20000, 50000, 100000];

const FundAccount = () => {
  const [searchParams] = useSearchParams();
  const isVerifyPage = searchParams.get("reference") !== null;

  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAccounts, setIsFetchingAccounts] = useState(true);

  // If we have a reference in the URL, show the verify page
  if (isVerifyPage) {
    return <PaymentVerify />;
  }

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await getMyAccounts();
        const active = (data || []).filter((a) => a.status === "active");
        setAccounts(active);
        if (active.length > 0) setSelectedAccountId(active[0].id);
      } catch (err) {
        toast.error("Failed to load accounts");
      } finally {
        setIsFetchingAccounts(false);
      }
    };
    fetchAccounts();
  }, []);

  const handleFund = async () => {
    if (!selectedAccountId || !amount || parseFloat(amount) < 1) {
      toast.error("Please select an account and enter at least ₦1.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Initializing payment...");

    try {
      const data = await initializePayment(
        parseInt(selectedAccountId),
        Math.ceil(parseFloat(amount)),
      );
      toast.dismiss(toastId);
      // Redirect to Paystack checkout
      window.location.href = data.authorization_url;
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to initialize payment",
        { id: toastId },
      );
      setIsLoading(false);
    }
  };

  const selectedAccount = accounts.find(
    (a) => a.id === parseInt(selectedAccountId),
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition text-gray-600"
        >
          <FiArrowLeft />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Fund Account</h1>
          <p className="text-gray-500 text-sm">
            Deposit money securely via Paystack
          </p>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start space-x-3">
        <FiShield className="text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-800 font-medium">
          All payments are secured and processed by Paystack. Your card details
          are never stored on our servers.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
        {/* Account Selector */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Select Account to Fund
          </label>
          {isFetchingAccounts ? (
            <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
          ) : accounts.length === 0 ? (
            <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 border border-amber-100 rounded-xl p-4">
              <FiAlertCircle />
              <span className="text-sm font-medium">
                No active accounts found. Please contact support.
              </span>
            </div>
          ) : (
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.accountType?.replace(/_/g, " ").toUpperCase()} —{" "}
                  {acc.accountNumber} (₦
                  {parseFloat(acc.balance).toLocaleString()})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Amount (₦)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">
              ₦
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xl font-bold text-gray-900"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Minimum deposit: ₦1</p>
        </div>

        {/* Quick Amounts */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Quick Select
          </label>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_AMOUNTS.map((q) => (
              <button
                key={q}
                onClick={() => setAmount(q.toString())}
                className={`py-2 px-3 rounded-xl text-sm font-bold border transition-all ${
                  parseFloat(amount) === q
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                ₦{q.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        {selectedAccount && amount && parseFloat(amount) >= 100 && (
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-sm space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Account</span>
              <span className="font-bold capitalize">
                {selectedAccount.accountType?.replace(/_/g, " ")}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Current Balance</span>
              <span className="font-bold">
                ₦{parseFloat(selectedAccount.balance).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-gray-600 border-t border-gray-200 pt-2 mt-2">
              <span>After Deposit</span>
              <span className="font-black text-green-600">
                ₦
                {(
                  parseFloat(selectedAccount.balance) + parseFloat(amount)
                ).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={handleFund}
          disabled={
            isLoading ||
            !selectedAccountId ||
            !amount ||
            parseFloat(amount) < 100
          }
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <FiRefreshCw className="animate-spin" />
              <span>Redirecting to Paystack...</span>
            </>
          ) : (
            <>
              <FiCreditCard />
              <span>Pay with Paystack</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FundAccount;
