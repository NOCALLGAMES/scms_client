import React from "react";
import { FiClock, FiMail, FiPhone, FiLogOut } from "react-icons/fi";
import { useLogout } from "../hooks/useAuth";

const PendingApproval = () => {
  const logout = useLogout();

  return (
    <div className="flex flex-col justify-center py-8">
      <div className="max-w-md mx-auto w-full text-center">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mb-6 animate-pulse">
            <FiClock size={40} />
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Approval Pending
          </h2>

          <div className="space-y-4 text-gray-600 mb-8 text-lg leading-relaxed">
            <p>
              Thank you for submitting your application! Our administrators are
              currently reviewing your details.
            </p>
            <p className="font-semibold text-blue-600">
              Expected approval time: 48 hours.
            </p>
          </div>

          <div className="w-full border-t pt-8 mb-8 space-y-4">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
              Need Help?
            </p>
            <div className="flex flex-col space-y-3">
              <a
                href="mailto:support@scms.com"
                className="flex items-center justify-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <FiMail />
                <span>support@scms.com</span>
              </a>
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <FiPhone />
                <span>+234 800 000 0000</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => logout.mutate()}
            className="flex items-center justify-center px-8 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all w-full"
          >
            <FiLogOut className="mr-2" /> Sign Out
          </button>
        </div>

        <p className="mt-8 text-gray-400 text-sm italic">
          Scms Cooperative Society Management System
        </p>
      </div>
    </div>
  );
};

export default PendingApproval;
