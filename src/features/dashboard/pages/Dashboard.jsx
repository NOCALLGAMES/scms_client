import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import AdminDashboard from "./AdminDashboard";
import MemberDashboard from "./MemberDashboard";

/**
 * Dashboard Entry Point
 * Smart switcher that renders the appropriate dashboard based on user role.
 */
const Dashboard = () => {
  const { role } = useAuth();

  // Super admin has their own dedicated route at /superadmin/dashboard
  if (role === "super_admin") {
    return <Navigate to="/superadmin/dashboard" replace />;
  }

  // All other roles (including admins and staff) see the personal member dashboard at this route.
  // Their administrative dashboard is located at /admin/dashboard.
  return <MemberDashboard />;
};

export default Dashboard;
