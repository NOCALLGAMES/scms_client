import React, { useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";

const BaseModal = ({
  isOpen,
  onClose,
  title,
  icon: Icon,
  subtitle,
  children,
  footer,
  maxWidthClass = "max-w-2xl",
}) => {
  const modalRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Click-outside layer */}
      <div
        className="absolute inset-0 z-[-1]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        className={`bg-white rounded-3xl shadow-2xl w-full ${maxWidthClass} max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300 relative z-10`}
      >
        {/* Header (Optional, rendered if title is provided) */}
        {title && (
          <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center shrink-0">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                {Icon && <Icon className="mr-2 text-blue-600" />} {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              aria-label="Close modal"
            >
              <FiX size={20} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>

        {/* Footer (Optional) */}
        {footer && (
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 shrink-0 rounded-b-3xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseModal;
