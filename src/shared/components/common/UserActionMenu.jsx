import React, { useState, useRef, useEffect } from "react";
import {
  FiMoreVertical,
  FiEye,
  FiEdit2,
  FiUserCheck,
  FiUserX,
  FiShield,
  FiUser,
} from "react-icons/fi";
import { FiCreditCard } from "react-icons/fi";

const UserActionMenu = ({
  user,
  onViewProfile,
  onEdit,
  onViewFinancials,
  onSuspend,
  onActivate,
  onMakeAdmin,
  onMakeStaff,
  onMakeMember,
  onReviewRegistration,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState("bottom"); // "bottom" or "top"
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => {
    if (!isOpen && menuRef.current) {
      // Calculate available space before opening
      const rect = menuRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const estimatedMenuHeight = 350; // Approximate max height of the menu

      if (spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight) {
        setMenuPosition("top");
      } else {
        setMenuPosition("bottom");
      }
    }
    setIsOpen(!isOpen);
  };

  const handleAction = (actionFn) => {
    setIsOpen(false);

    if (actionFn) actionFn(user);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <FiMoreVertical />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 w-48 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-[9999] overflow-hidden divide-y divide-gray-100 ${
            menuPosition === "top"
              ? "bottom-full mb-2 origin-bottom-right animate-in slide-in-from-bottom-2 zoom-in-95 duration-200"
              : "top-full mt-2 origin-top-right animate-in slide-in-from-top-2 zoom-in-95 duration-200"
          }`}
        >
          <div className="py-1">
            {(user.status === "pending_approval" ||
              user.status === "rejected") &&
              onReviewRegistration && (
                <button
                  onClick={() => handleAction(onReviewRegistration)}
                  className="group flex items-center w-full px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 font-medium"
                >
                  <FiEye className="mr-3 h-4 w-4 text-blue-500" />
                  {user.status === "rejected"
                    ? "Re-review Application"
                    : "Review Application"}
                </button>
              )}

            {onViewProfile && user.status !== "pending_approval" && (
              <button
                onClick={() => handleAction(onViewProfile)}
                className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FiEye className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                View Profile
              </button>
            )}

            {onEdit && (
              <button
                onClick={() => handleAction(onEdit)}
                className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FiEdit2 className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                Edit Details
              </button>
            )}

            {onViewFinancials && (
              <button
                onClick={() => handleAction(onViewFinancials)}
                className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FiCreditCard className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                View Financials
              </button>
            )}
          </div>

          {user.status === "active" && (
            <div className="py-1">
              {onMakeAdmin && user.role !== "super_admin" && (
                <button
                  onClick={() => handleAction(onMakeAdmin)}
                  className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <FiShield className="mr-3 h-4 w-4 text-purple-400 group-hover:text-purple-500" />
                  Make Admin
                </button>
              )}

              {onMakeStaff &&
                user.role !== "staff" &&
                user.role !== "super_admin" && (
                  <button
                    onClick={() => handleAction(onMakeStaff)}
                    className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FiUser className="mr-3 h-4 w-4 text-blue-400 group-hover:text-blue-500" />
                    Make Staff
                  </button>
                )}

              {onMakeMember &&
                user.role !== "member" &&
                user.role !== "super_admin" && (
                  <button
                    onClick={() => handleAction(onMakeMember)}
                    className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FiUserCheck className="mr-3 h-4 w-4 text-green-400 group-hover:text-green-500" />
                    Make Member
                  </button>
                )}
            </div>
          )}

          <div className="py-1">
            {user.status === "active" && onSuspend && (
              <button
                onClick={() => handleAction(onSuspend)}
                className="group flex items-center w-full px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 font-medium"
              >
                <FiUserX className="mr-3 h-4 w-4 text-orange-500" />
                Suspend Account
              </button>
            )}

            {(user.status === "suspended" ||
              user.status === "inactive" ||
              user.status === "pending_approval" ||
              user.status === "rejected") &&
              onActivate && (
                <button
                  onClick={() => handleAction(onActivate)}
                  className="group flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50 font-medium"
                >
                  <FiUserCheck className="mr-3 h-4 w-4 text-green-500" />
                  {user.status === "rejected" ||
                  user.status === "pending_approval"
                    ? "Approve User"
                    : "Activate"}
                </button>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserActionMenu;
