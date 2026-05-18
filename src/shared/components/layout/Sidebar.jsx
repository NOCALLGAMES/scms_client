import { FaNairaSign } from "react-icons/fa6";
import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FiHome,
  FiUsers,
  FiCreditCard,
  FiBarChart2,
  FiSettings,
  FiBriefcase,
  FiHelpCircle,
  FiMessageSquare,
  FiLogOut,
  FiChevronDown,
  FiChevronRight,
  FiGrid,
  FiList,
  FiPlusCircle,
  FiActivity,
  FiShield,
  FiSliders,
  FiUserPlus,
  FiFileText,
  FiPercent,
  FiBox,
  FiMail,
  FiArrowUpRight,
  FiTrendingUp,
  FiAlertTriangle,
  FiHeart,
  FiCalendar,
  FiX } from "react-icons/fi";
;
import { useAuth, useLogout } from "../../../features/auth/hooks/useAuth";
import { useBrand } from "../../../contexts/BrandContext";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { role, user } = useAuth();
  const { mutate: logout } = useLogout();
  const { getBrandBg, getBrandBgLight, getBrandText, getBrandBgDark } = useBrand();
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  // Handle resize to detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close sidebar on route change for mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      setIsOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, isMobile, setIsOpen]);

  const toggleMenu = (name) => {
    setExpandedMenu((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FiHome />,
      roles: ["institution_admin", "staff", "member", "super_admin"],
    },
    {
      name: "Savings",
      icon: <FaNairaSign />,
      roles: ["institution_admin", "staff", "member"],
      submenu: [
        { name: "Overview", path: "/savings", icon: <FiGrid /> },
        {
          name: "Withdrawal",
          path: "/savings/withdrawal",
          icon: <FiArrowUpRight />,
          roles: ["member", "institution_admin", "staff"],
        },
        {
          name: "Fund Account",
          path: "/accounts/fund",
          icon: <FiPlusCircle />,
          roles: ["member", "institution_admin", "staff"],
        },
      ],
    },
    {
      name: "Loans",
      icon: <FiCreditCard />,
      roles: ["institution_admin", "staff", "member"],
      submenu: [
        { name: "Apply / View", path: "/loans", icon: <FiGrid /> },
        {
          name: "My Loans",
          path: "/loans/my-loans",
          icon: <FiList />,
          roles: ["member"],
        },
        {
          name: "Calculator",
          path: "/loans/calculator",
          icon: <FiPlusCircle />,
          roles: ["member", "institution_admin", "staff"],
        },
      ],
    },
    {
      name: "Meetings",
      path: "/meetings",
      icon: <FiCalendar />,
    },
    {
      name: "Transactions",
      icon: <FiBriefcase />,
      roles: ["institution_admin", "staff", "member"],
      submenu: [
        { name: "History", path: "/transactions", icon: <FiList /> },
      ],
    },
    {
      name: "Cooperative Admin",
      icon: <FiSettings />,
      roles: ["institution_admin", "staff"],
      submenu: [
        { name: "System Dashboard", path: "/admin/dashboard", icon: <FiActivity /> },
        { name: "Users", path: "/admin/users", icon: <FiUsers /> },
        { name: "Admins", path: "/admin/admins", icon: <FiShield /> },
        { name: "Institution Profile", path: "/admin/institution", icon: <FiBriefcase /> },
        { name: "Treasury / Funding", path: "/admin/treasury", icon: <FaNairaSign /> },
        { name: "Settings", path: "/admin/settings", icon: <FiSliders /> },
        {
          name: "New Entry (Journal)",
          path: "/transactions/entry",
          icon: <FiPlusCircle />,
          roles: ["institution_admin", "staff"],
        },
        {
          name: "Registrations",
          path: "/admin/registrations",
          icon: <FiUserPlus />,
          roles: ["institution_admin", "staff"],
        },
        {
          name: "Withdrawals",
          path: "/admin/withdrawals",
          icon: <FiArrowUpRight />,
          roles: ["institution_admin", "staff"],
        },
        {
          name: "Disbursements",
          path: "/admin/disbursements",
          icon: <FiPlusCircle />,
          roles: ["institution_admin", "staff"],
        },
        {
          name: "Interest Posting",
          path: "/admin/interest",
          icon: <FiPercent />,
          roles: ["institution_admin"],
        },
        {
          name: "Job Dashboard",
          path: "/admin/jobs",
          icon: <FiActivity />,
          roles: ["institution_admin"],
        },
        { name: "Thrift Contributions", path: "/admin/contributions", icon: <FiList />, roles: ["institution_admin", "staff"] },
        { name: "Meeting Management", path: "/admin/meetings", icon: <FiCalendar />, roles: ["institution_admin", "staff"] },
        {
          name: "Savings Products",
          path: "/admin/savings-products",
          icon: <FiSliders />,
        },
        {
          name: "Loan Portfolio",
          path: "/admin/loan-portfolio",
          icon: <FiBarChart2 />,
        },
        {
          name: "Loan Requests",
          path: "/admin/loan-requests",
          icon: <FiList />,
          roles: ["institution_admin", "staff"],
        },
        {
          name: "Loan Repayments",
          path: "/admin/loan-repayments",
          icon: <FaNairaSign />,
        },
        {
          name: "Loan Appraisal",
          path: "/admin/loan-appraisal",
          icon: <FiShield />,
        },
        {
          name: "System Reports",
          path: "/admin/reports",
          icon: <FiBarChart2 />,
        },
        {
          name: "Activity Log",
          path: "/admin/activity-log",
          icon: <FiActivity />,
          roles: ["institution_admin"],
        },
        {
          name: "Account Statements",
          path: "/admin/reports/statements",
          icon: <FiFileText />,
        },
      ],
    },
    {
      name: "Super Admin",
      icon: <FiShield />,
      roles: ["super_admin"],
      submenu: [
        { name: "Dashboard", path: "/admin/dashboard", icon: <FiHome /> },
        { name: "Institutions", path: "/admin/institutions", icon: <FiBox /> },
      ],
    },
  ];

  const bottomItems = [
    { name: "Support", path: "/support", icon: <FiHelpCircle /> },
    { name: "Messages", path: "/messages", icon: <FiMessageSquare /> },
  ];

  const isRoleAllowed = (allowedRoles) => {
    if (!allowedRoles) return true;
    return allowedRoles.includes(role);
  };

  const handleBackdropClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200 lg:hidden"
          onClick={handleBackdropClick}
        />
      )}

      <aside
        className={`text-white transition-all duration-300 flex flex-col h-screen z-50 bg-[var(--brand-bg-deep)]
          ${isOpen ? "w-64" : "w-20"}
          ${isMobile ? `fixed left-0 top-0 transform ${isOpen ? "translate-x-0" : "-translate-x-full"}` : "sticky top-0"}
          lg:sticky lg:translate-x-0`}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between h-20">
          <div className="flex items-center space-x-3 overflow-hidden">
            {user?.institution?.logoUrl ? (
              <div className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden bg-white flex items-center justify-center p-0.5 shadow-sm">
                <img 
                  src={`${import.meta.env.VITE_SERVER_URL}/img/institutions/${user.institution.logoUrl}`} 
                  alt={user.institution.name} 
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div
                className="p-2 rounded-lg flex-shrink-0 w-10 h-10 flex items-center justify-center"
                style={getBrandBg()}
              >
                <FiBriefcase className="text-xl text-white" />
              </div>
            )}
            {(isOpen || isMobile) && (
              <div className="whitespace-nowrap animate-in fade-in duration-200">
                <h2 className="text-xl font-bold truncate max-w-[140px] block" title={user?.institution?.name || "NoCall"}>
                  {user?.institution?.name || "NoCall"}
                </h2>
                <p className="text-gray-400 text-xs truncate max-w-[140px]">
                  {user?.institution?.code || "Management System"}
                </p>
              </div>
            )}
          </div>
          {/* Mobile Close Button */}
          {isMobile && isOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <FiX className="text-xl" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-6 overflow-y-auto custom-scrollbar pb-6">
          <div className="px-4 mb-2">
            {isOpen && (
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Menu
              </p>
            )}
          </div>

          <ul className="space-y-1">
            {menuItems.map((item) => {
              if (!isRoleAllowed(item.roles)) return null;

              // Filter Submenus by role
              const submenu = item.submenu?.filter((sub) =>
                isRoleAllowed(sub.roles),
              );

              // Check if active (for parent styling)
              const isActive =
                item.path === location.pathname ||
                submenu?.some((sub) => sub.path === location.pathname);

              if (submenu && submenu.length > 0) {
                return (
                  <li key={item.name} className="px-3">
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-colors ${isActive ? "text-white bg-white/10" : "text-gray-400 hover:text-white hover:bg-white/10"}`}
                    >
                      <div className="flex items-center">
                        <span className="text-xl">{item.icon}</span>
                        {isOpen && (
                          <span className="ml-3 font-medium">{item.name}</span>
                        )}
                      </div>
                      {isOpen &&
                        (expandedMenu[item.name] ? (
                          <FiChevronDown />
                        ) : (
                          <FiChevronRight />
                        ))}
                    </button>

                    {/* Submenu */}
                    {isOpen && expandedMenu[item.name] && (
                      <ul className="mt-1 ml-4 space-y-1 border-l-2 border-white/10 pl-2 animate-in slide-in-from-top-2 duration-200">
                        {submenu.map((sub) => (
                          <li key={sub.name}>
                            <NavLink
                              to={sub.path}
                              className={({ isActive }) =>
                                `flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${isActive ? "font-medium" : "text-gray-400 hover:text-white hover:bg-white/10"}`
                              }
                              style={({ isActive }) => isActive ? { ...getBrandBgLight(), ...getBrandText() } : {}}
                            >
                              <span className="mr-3">{sub.icon}</span>
                              {sub.name}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              }

              return (
                <li key={item.name} className="px-3">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-3 rounded-lg transition-colors ${isActive ? "text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/10"}`
                    }
                    style={({ isActive }) => isActive ? getBrandBg() : {}}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {isOpen && (
                      <span className="ml-3 font-medium">{item.name}</span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>

          <div className="my-6 border-t border-white/10 mx-4"></div>

          <div className="px-4 mb-2">
            {isOpen && (
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Help
              </p>
            )}
          </div>
          <ul className="space-y-1 px-3">
            {bottomItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-3 rounded-lg transition-colors ${isActive ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/10"}`
                  }
                >
                  <span className="text-xl">{item.icon}</span>
                  {isOpen && (
                    <span className="ml-3 font-medium">{item.name}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Profile Summary Section */}
        <div className="mx-4 mb-4 p-3 bg-white/5 rounded-xl border border-white/5">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold overflow-hidden"
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
            {isOpen && (
              <div className="flex-1 min-w-0 animate-in fade-in duration-300">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-400 truncate capitalize">
                  {role?.replace(/_/g, " ")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-gray-400 hover:bg-red-600/20 hover:text-red-400 transition-colors rounded-lg group"
          >
            <FiLogOut className="text-xl group-hover:text-red-400" />
            {isOpen && <span className="ml-3 font-medium">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
