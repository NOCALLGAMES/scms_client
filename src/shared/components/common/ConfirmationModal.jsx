import React from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiAlertTriangle,
  FiX,
} from "react-icons/fi";
import BaseModal from "./BaseModal";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  type = "danger", // 'danger', 'warning', 'success', 'info'
  isLoading = false,
  maxWidthClass = "max-w-md",
}) => {
  const getIcon = () => {
    switch (type) {
      case "danger":
        return {
          icon: FiAlertCircle,
          color: "text-red-600",
          bg: "bg-red-50",
          btn: "bg-red-600 shadow-red-200 hover:bg-red-700",
        };
      case "warning":
        return {
          icon: FiAlertTriangle,
          color: "text-amber-600",
          bg: "bg-amber-50",
          btn: "bg-amber-600 shadow-amber-200 hover:bg-amber-700",
        };
      case "success":
        return {
          icon: FiCheckCircle,
          color: "text-green-600",
          bg: "bg-green-50",
          btn: "bg-green-600 shadow-green-200 hover:bg-green-700",
        };
      case "info":
      default:
        return {
          icon: FiInfo,
          color: "text-blue-600",
          bg: "bg-blue-50",
          btn: "bg-blue-600 shadow-blue-200 hover:bg-blue-700",
        };
    }
  };

  const { icon: Icon, color, bg, btn } = getIcon();

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidthClass={maxWidthClass}>
      <div className="p-8">
        <div className="flex flex-col items-center text-center">
          <div className={`p-4 ${bg} rounded-full mb-6 animate-bounce-subtle`}>
            <Icon className={`w-10 h-10 ${color}`} />
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
            {title}
          </h3>

          <p className="text-gray-500 text-base leading-relaxed max-w-xs mx-auto">
            {message}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-10">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all text-sm"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-6 py-3.5 text-white rounded-2xl font-bold shadow-lg transition-all text-sm flex items-center justify-center ${btn} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </div>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default ConfirmationModal;
