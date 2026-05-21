import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FiGrid,
  FiBox,
  FiUsers,
  FiShield,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiActivity,
  FiTrendingUp,
} from "react-icons/fi";
import { useAuth, useLogout } from "../../../features/auth/hooks/useAuth";

const navItems = [
  {
    name: "Platform Overview",
    path: "/superadmin/dashboard",
    icon: <FiGrid />,
  },
  {
    name: "Institutions",
    path: "/superadmin/institutions",
    icon: <FiBox />,
  },
  { name: "Global Users", path: "/superadmin/users", icon: <FiUsers /> },
  { name: "Platform Team", path: "/superadmin/team", icon: <FiShield /> },
  { name: "Audit Logs", path: "/superadmin/activity", icon: <FiActivity /> },
  {
    name: "Platform Reports",
    path: "/superadmin/reports",
    icon: <FiTrendingUp />,
  },
];

const SuperAdminSidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();
  const { mutate: logout } = useLogout();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile && isOpen) setIsOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, isMobile]);

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`bg-white text-gray-900 flex flex-col h-screen z-50 transition-all duration-300 border-r border-gray-200
          ${isOpen ? "w-64" : "w-20"}
          ${isMobile ? `fixed left-0 top-0 transform ${isOpen ? "translate-x-0" : "-translate-x-full"}` : "sticky top-0"}
          lg:sticky lg:translate-x-0 shadow-sm`}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between h-20 bg-gray-50/50">
          <div className="flex items-center space-x-3 overflow-hidden">
            {/* Platform logo mark */}
            <div className="bg-[#006a61] p-2 rounded-lg flex-shrink-0 shadow-lg shadow-emerald-100">
              <span className="text-white font-black text-xl w-6 h-6 flex items-center justify-center">N</span>
            </div>
            {(isOpen || isMobile) && (
              <div className="whitespace-nowrap animate-in fade-in duration-200">
                <h2 className="text-base font-bold text-gray-900 leading-tight">
                  NoCall Cooperative
                </h2>
                <p className="text-[#006a61] text-[10px] font-black uppercase tracking-tighter">
                  Global Console
                </p>
              </div>
            )}
          </div>
          {/* Toggle button (desktop only) */}
          {!isMobile && (
            <button
              onClick={() => setIsOpen((p) => !p)}
              className="text-gray-400 hover:text-[#006a61] transition-colors ml-auto"
              title={isOpen ? "Collapse" : "Expand"}
            >
              {isOpen ? <FiChevronLeft /> : <FiChevronRight />}
            </button>
          )}
          {isMobile && (
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white ml-auto"
            >
              <FiX />
            </button>
          )}
        </div>

        {/* Role badge */}
        {isOpen && (
          <div className="mx-4 mt-4 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100 text-center">
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
              Administrator
            </span>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-3 rounded-lg transition-all duration-150 group
                ${isActive
                  ? "bg-[#006a61] text-white shadow-lg shadow-emerald-200"
                  : "text-gray-500 hover:text-[#006a61] hover:bg-emerald-50"
                }`
              }
              title={!isOpen ? item.name : undefined}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {(isOpen || isMobile) && (
                <span className="ml-3 font-medium text-sm whitespace-nowrap">
                  {item.name}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer / User info */}
        <div className="border-t border-gray-100 p-4 space-y-3 bg-gray-50/30">
          {isOpen && (
            <NavLink 
              to="/superadmin/profile"
              className={({isActive}) => `flex items-center space-x-3 px-1 py-2 rounded-xl transition-all ${isActive ? 'bg-emerald-50 ring-1 ring-emerald-100' : 'hover:bg-gray-100'}`}
            >
              <div className="w-8 h-8 rounded-full bg-[#006a61] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {user?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="overflow-hidden text-left">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user?.name || "Admin"}
                </p>
                <p className="text-[10px] text-gray-500 truncate font-medium uppercase tracking-tighter">View Profile</p>
              </div>
            </NavLink>
          )}
          <button
            onClick={() => logout()}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors
              ${!isOpen ? "justify-center" : ""}`}
            title="Logout"
          >
            <FiLogOut className="text-lg flex-shrink-0" />
            {(isOpen || isMobile) && (
              <span className="ml-3 text-sm font-bold">Logout</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default SuperAdminSidebar;
