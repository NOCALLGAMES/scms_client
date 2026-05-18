import { FaNairaSign } from "react-icons/fa6";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch,
  FiUser,
  FiActivity,
  FiFileText,
  FiSettings,
  FiGrid,
  FiFolder,
  FiCornerDownLeft,
  FiLock,
  FiUsers,
  FiBox,
  FiClock,
  FiArrowUpRight } from "react-icons/fi";
import { globalSearch } from "../../../services/searchApi";
import { useAuth } from "../../../features/auth/hooks/useAuth";

// Predefined static navigation routes for quick access
const STATIC_ROUTES = [
  { id: "static-1", title: "Dashboard", subtitle: "Overview metrics", type: "Page", path: "/dashboard", icon: "Grid", roles: ["member", "staff", "institution_admin", "super_admin"] },
  { id: "static-2", title: "My Profile", subtitle: "Account settings", type: "Page", path: "/profile", icon: "User", roles: ["member", "staff", "institution_admin", "super_admin"] },
  { id: "static-3", title: "User Management", subtitle: "Admin members list", type: "Page", path: "/admin/users", icon: "Users", roles: ["staff", "institution_admin"] },
  { id: "static-4", title: "System Settings", subtitle: "Global configuration", type: "Page", path: "/admin/settings", icon: "Settings", roles: ["institution_admin"] },
  { id: "static-5", title: "Loan Requests", subtitle: "View all pending applications", type: "Page", path: "/admin/loan-requests", icon: "FileText", roles: ["staff", "institution_admin"] },
  { id: "static-6", title: "Transaction History", subtitle: "Ledger and payments", type: "Page", path: "/transactions", icon: "Activity", roles: ["member", "staff", "institution_admin"] },
  { id: "static-7", title: "Audit Logs", subtitle: "System tracking", type: "Page", path: "/admin/audit", icon: "Lock", roles: ["institution_admin"] },
  { id: "static-8", title: "Communication Templates", subtitle: "Email & SMS editor", type: "Page", path: "/admin/templates", icon: "FileText", roles: ["institution_admin"] },
  { id: "static-9", title: "Savings Overview", subtitle: "My savings portfolio", type: "Page", path: "/savings", icon: "Folder", roles: ["member", "staff", "institution_admin"] },
  { id: "static-10", title: "Welfare Management", subtitle: "Welfare applications", type: "Page", path: "/admin/welfare", icon: "Users", roles: ["staff", "institution_admin"] },
  { id: "static-11", title: "Contribution Dashboard", subtitle: "Monthly contributions", type: "Page", path: "/admin/contributions", icon: "DollarSign", roles: ["staff", "institution_admin"] },
  { id: "static-12", title: "Registration Queue", subtitle: "Pending signups", type: "Page", path: "/admin/registrations", icon: "Clock", roles: ["staff", "institution_admin"] },
  { id: "static-13", title: "Withdrawal Request", subtitle: "Submit a new request", type: "Page", path: "/savings/withdrawal", icon: "ArrowUpRight", roles: ["member", "staff", "institution_admin"] },
  { id: "static-14", title: "Withdrawal Management", subtitle: "Approve pending withdrawals", type: "Page", path: "/admin/withdrawals", icon: "ArrowUpRight", roles: ["staff", "institution_admin"] },
  // Super Admin specific routes
  { id: "static-sa-1", title: "Platform Overview", subtitle: "Global metrics", type: "Page", path: "/superadmin/dashboard", icon: "Grid", roles: ["super_admin"] },
  { id: "static-sa-2", title: "Institutions", subtitle: "Manage cooperatives", type: "Page", path: "/superadmin/institutions", icon: "Box", roles: ["super_admin"] },
  { id: "static-sa-3", title: "User Explorer", subtitle: "System-wide search", type: "Page", path: "/superadmin/users", icon: "Users", roles: ["super_admin"] },
];

const ICONS = {
  User: <FiUser />,
  Activity: <FiActivity />,
  FileText: <FiFileText />,
  Settings: <FiSettings />,
  Grid: <FiGrid />,
  Folder: <FiFolder />,
  Lock: <FiLock />,
  Users: <FiUsers />,
  DollarSign: <FaNairaSign />,
  Clock: <FiClock />,
  Box: <FiBox />,
  ArrowUpRight: <FiArrowUpRight />,
};

const CommandPalette = ({ isOpen, onClose }) => {
  const { role } = useAuth();
  const [query, setQuery] = useState("");
  
  // Filter static routes based on user role
  const filteredStaticRoutes = useMemo(() => {
    return STATIC_ROUTES.filter(route => !route.roles || route.roles.includes(role));
  }, [role]);

  const [results, setResults] = useState(filteredStaticRoutes);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setResults(filteredStaticRoutes);
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, filteredStaticRoutes]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults(filteredStaticRoutes);
        return;
      }

      setIsLoading(true);

      // Filter static routes locally
      const filteredStatic = filteredStaticRoutes.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.subtitle.toLowerCase().includes(query.toLowerCase())
      );

      try {
        const data = await globalSearch(query);
        const dynamicResults = data.results || [];
        setResults([...filteredStatic, ...dynamicResults]);
      } catch (error) {
        console.error("Search failed:", error);
        setResults(filteredStatic); // Fallback to just static if API fails
      } finally {
        setIsLoading(false);
        setSelectedIndex(0);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, filteredStaticRoutes]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const handleSelect = (item) => {
    onClose();
    navigate(item.path);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col z-10 animate-in slide-in-from-top-4 duration-300">
        {/* Search Input Area */}
        <div className="flex items-center px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <FiSearch className="text-2xl text-blue-500 mr-4" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-xl font-medium text-slate-800 placeholder-slate-400 outline-none"
            placeholder="Search for pages, members, loans, or transactions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-slate-200 text-slate-500 rounded text-[10px] font-bold uppercase tracking-widest leading-none">
              ESC
            </span>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
          {isLoading ? (
            <div className="px-8 py-12 text-center">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Searching Database...
              </p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((item, index) => {
                const isSelected = index === selectedIndex;
                const IconComponent = ICONS[item.icon] || <FiFileText />;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center px-4 py-4 rounded-2xl transition-all text-left group ${isSelected
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                        : "hover:bg-slate-50 text-slate-700"
                      }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm transition-colors ${isSelected
                          ? "bg-white/20 text-white"
                          : "bg-white border border-slate-100 text-slate-500"
                        }`}
                    >
                      {IconComponent}
                    </div>
                    <div className="ml-4 flex-1 overflow-hidden">
                      <p
                        className={`text-sm font-bold truncate transition-colors ${isSelected ? "text-white" : "text-slate-800"
                          }`}
                      >
                        {item.title}
                      </p>
                      <p
                        className={`text-xs font-medium truncate mt-0.5 transition-colors ${isSelected ? "text-blue-100" : "text-slate-500"
                          }`}
                      >
                        {item.subtitle}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center gap-3">
                      <span
                        className={`text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full transition-colors ${isSelected
                            ? "bg-blue-500 text-white border border-blue-400"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}
                      >
                        {item.type}
                      </span>
                      {isSelected && (
                        <FiCornerDownLeft className="text-blue-200 ml-1" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-8 py-16 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                <FiSearch size={28} />
              </div>
              <p className="text-sm font-black text-slate-800">
                No results found
              </p>
              <p className="text-xs text-slate-500 mt-2">
                We couldn't find anything matching "{query}"
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50/80 border-t border-slate-100 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
            <span className="flex items-center gap-1.5"><span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[9px] font-black shadow-sm">↑</span><span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[9px] font-black shadow-sm">↓</span> Navigate</span>
            <span className="flex items-center gap-1.5"><span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[9px] font-black shadow-sm">↵</span> Select</span>
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">SCMS Command</p>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
