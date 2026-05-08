import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useForgotPassword } from "../hooks/useAuth";
import { FiMail, FiBriefcase, FiArrowLeft, FiLoader } from "react-icons/fi";

const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [submitted, setSubmitted] = useState(false);
  const forgotPasswordMutation = useForgotPassword();

  const onSubmit = async (data) => {
    try {
      await forgotPasswordMutation.mutateAsync(data.email);
      setSubmitted(true);
    } catch (err) {
      console.error("Forgot password request failed:", err);
    }
  };

  if (submitted) {
    return (
      <div className="text-center w-full animate-in fade-in zoom-in duration-500">
        <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-600 shadow-inner group">
          <FiMail className="text-4xl group-hover:scale-110 transition-transform duration-300" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
          Check your inbox
        </h2>
        <p className="text-gray-600 mb-8 max-w-sm mx-auto leading-relaxed">
          We've sent a secure password reset link to <br/>
          <span className="font-bold text-gray-900 border-b-2 border-blue-200 pb-0.5 mt-1 inline-block">
            {watch("email")}
          </span>. 
          <br/><br/>
          Please check your email and follow the instructions to regain access to your account.
        </p>
        
        <div className="space-y-4">
          <Link
            to="/login"
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Back to Login
          </Link>
          
          <div className="pt-6 mt-6 border-t border-gray-100 italic">
            <p className="text-sm text-gray-500 mb-2">Didn't receive the email? Check your spam folder or</p>
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={forgotPasswordMutation.isPending}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 focus:outline-none disabled:opacity-50 underline-offset-4 hover:underline"
            >
              {forgotPasswordMutation.isPending ? "Sending link..." : "Click here to resend"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Link
        to="/login"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6 font-medium"
      >
        <FiArrowLeft className="mr-2" /> Back to Login
      </Link>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Forgot Password?
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email and we'll send you instructions to reset your
          password.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMail className="text-gray-400" />
            </div>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
              })}
              type="email"
              placeholder="you@example.com"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        {forgotPasswordMutation.isError && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
            {forgotPasswordMutation.error?.response?.data?.message ||
              "Failed to send reset link. Please try again."}
          </div>
        )}

        <button
          type="submit"
          disabled={forgotPasswordMutation.isPending}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {forgotPasswordMutation.isPending ? (
            <FiLoader className="animate-spin h-5 w-5" />
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
