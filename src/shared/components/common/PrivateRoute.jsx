import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../../features/auth/hooks/useAuth";

const PrivateRoute = ({ allowedRoles }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Determine default dashboard based on role
  const getHomeRoute = () => {
    return user.role === "super_admin" ? "/superadmin/dashboard" : "/dashboard";
  };

  // Handle Email Verification Redirection
  // Admins and Staff are exempt if they are already active
  const isAdmin = user.role === "super_admin" || user.role === "staff";
  if (user.isEmailVerified === false && !isAdmin) {
    if (location.pathname !== "/verify-email") {
      return <Navigate to="/verify-email" replace />;
    }
    // Stop further checks if already on verify-email
    return <Outlet />;
  }

  if (
    (user.isEmailVerified === true || isAdmin) &&
    location.pathname === "/verify-email"
  ) {
    return <Navigate to={getHomeRoute()} replace />;
  }

  // Handle Onboarding/Approval Status Redirection
  if (user.status === "pending_onboarding") {
    if (location.pathname !== "/onboarding") {
      return <Navigate to="/onboarding" replace />;
    }
    // Stop further checks if already on onboarding
    return <Outlet />;
  }

  if (user.status === "pending_approval") {
    if (location.pathname !== "/pending-approval") {
      return <Navigate to="/pending-approval" replace />;
    }
    // Stop further checks if already on pending-approval
    return <Outlet />;
  }

  // If user is trying to access onboarding/pending-approval but is already active
  if (
    user.status === "active" &&
    (location.pathname === "/onboarding" ||
      location.pathname === "/pending-approval")
  ) {
    return <Navigate to={getHomeRoute()} replace />;
  }

  // Role based access control (for active users)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If a super admin tries to access a member/admin route, send them to their dashboard
    // If a member tries to access a super admin route, they can go to /unauthorized or their dashboard
    return <Navigate to={getHomeRoute()} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
