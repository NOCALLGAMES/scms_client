import React, { useState } from "react";
import {
  FiMenu,
  FiBell,
  FiSearch,
  FiUser,
  FiChevronDown,
  FiSettings,
  FiLogOut,
  FiShield,
} from "react-icons/fi";
import { useAuth, useLogout } from "../../../features/auth/hooks/useAuth";
import { Link } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import { useBrand } from "../../../contexts/BrandContext";


const Topbar = ({ setSidebarOpen, sidebarOpen, onOpenCommandPalette }) => {
  const { user } = useAuth();
  const { mutate: logout } = useLogout();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { getBrandBg, getBrandBgLight, getBrandText } = useBrand();


  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left Section (Search & Toggle) */}
        <div className="flex items-center flex-1">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 focus:outline-none"
          >
            <FiMenu className="text-2xl" />
          </button>

          <div className="ml-6 relative hidden md:block w-full max-w-md">
            <button
              onClick={onOpenCommandPalette}
              className="w-full relative flex items-center group bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-xl transition-all duration-200 overflow-hidden"
            >
              <div className="pl-4 pr-3 py-2.5 flex items-center justify-center">
                <FiSearch 
                  className="text-gray-400 transition-colors" 
                  style={{ color: 'var(--brand-color)' }}
                />
              </div>
              <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700 flex-1 text-left">
                Search databases, members...
              </span>
              <div className="pr-2 py-1.5 flex items-center justify-center">
                <kbd className="hidden sm:inline-flex items-center gap-1 bg-white border border-gray-200 rounded px-2 py-0.5 text-[10px] font-bold text-gray-400 shadow-sm uppercase tracking-widest leading-none">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </button>
          </div>
        </div>

        {/* Right Section (Notifications & Profile) */}
        <div className="flex items-center space-x-4">
          <NotificationBell />


          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow-md overflow-hidden"
                style={getBrandBg()}
              >
                {user?.profilePicture ? (
                  <img
                    src={`${import.meta.env.VITE_SERVER_URL}/img/users/${user.profilePicture}`}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-700 leading-tight">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role || "Member"}
                </p>
              </div>
              <FiChevronDown
                className={`text-gray-400 transition-transform duration-200 ${showProfileMenu ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right ring-1 ring-black ring-opacity-5 focus:outline-none"
                onMouseLeave={() => setShowProfileMenu(false)}
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">
                    Signed in as
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    to={user?.role === 'super_admin' ? "/superadmin/profile" : "/profile"}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = getBrandBgLight().backgroundColor; e.currentTarget.style.color = getBrandText().color; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = ''; }}
                  >
                    <FiUser className="mr-3 h-4 w-4" /> My Profile
                  </Link>

                  <Link
                    to={user?.role === 'super_admin' ? "/superadmin/profile" : "/profile"}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = getBrandBgLight().backgroundColor; e.currentTarget.style.color = getBrandText().color; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = ''; }}
                  >
                    <FiSettings className="mr-3 h-4 w-4" /> Account Settings
                  </Link>
                </div>

                <div className="py-1 border-t border-gray-100">
                  <button
                    onClick={logout}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <FiLogOut className="mr-3 h-4 w-4" /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </header>
  );
};

export default Topbar;
