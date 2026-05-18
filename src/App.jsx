import { Toaster } from "react-hot-toast";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import AuthLayout from "./layouts/AuthLayout";
import PrivateRoute from "./shared/components/common/PrivateRoute";

// Import pages
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import ForgotPassword from "./features/auth/pages/ForgotPassword";
import UserProfile from "./features/auth/pages/UserProfile";
import ResetPassword from "./features/auth/pages/ResetPassword";
import VerifyEmail from "./features/auth/pages/VerifyEmail";
import Onboarding from "./features/auth/pages/Onboarding";
import PendingApproval from "./features/auth/pages/PendingApproval";

import MemberDashboard from "./features/dashboard/pages/MemberDashboard";
import AdminDashboard from "./features/dashboard/pages/AdminDashboard";
import Dashboard from "./features/dashboard/pages/Dashboard";
import SuperAdminDashboard from "./features/superadmin/pages/SuperAdminDashboard";
import UserExplorer from "./features/superadmin/pages/UserExplorer";
import AuditLogExplorer from "./features/superadmin/pages/AuditLogExplorer";
import InstitutionDetail from "./features/superadmin/pages/InstitutionDetail";
import PlatformTeam from "./features/superadmin/pages/PlatformTeam";
import Messages from "./features/dashboard/pages/Messages";
import Support from "./features/dashboard/pages/Support";
import SuperAdminProfile from "./features/superadmin/pages/SuperAdminProfile";

import MemberProfile from "./features/members/pages/MemberProfile";
import SavingsOverview from "./features/savings/pages/SavingsOverview";
import SavingsProducts from "./features/savings/pages/SavingsProducts";
import LoanApplication from "./features/loans/pages/LoanApplication";
import LoanPortfolio from "./features/loans/pages/LoanPortfolio";
import LoanRequests from "./features/loans/pages/LoanRequests";
import LoanRepayment from "./features/loans/pages/LoanRepayment";
import MyLoans from "./features/loans/pages/MyLoans";
import TransactionHistory from "./features/transactions/pages/TransactionHistory";
import TransactionEntry from "./features/transactions/pages/TransactionEntry";
import FinancialReports from "./features/reports/pages/FinancialReports";
import InstitutionActivityLog from "./features/reports/pages/InstitutionActivityLog";
import UserManagement from "./features/admin/pages/UserManagement";
import AdminManagement from "./features/admin/pages/AdminManagement";
import RegistrationQueue from "./features/admin/pages/RegistrationQueue";
import InterestPosting from "./features/admin/pages/InterestPosting";
import JobDashboard from "./features/admin/pages/JobDashboard";
import WithdrawalQueue from "./features/admin/pages/WithdrawalQueue";
import LoanDisbursement from "./features/admin/pages/LoanDisbursement";
import LoanRepaymentLedger from "./features/loans/pages/LoanRepaymentLedger";
import ShareManagement from "./features/admin/pages/ShareManagement";
import ContributionManagement from "./features/admin/pages/ContributionManagement";
import MeetingArchive from "./features/meetings/pages/MeetingArchive";
import MeetingManagement from "./features/admin/pages/MeetingManagement";
import AdminSettings from "./features/admin/pages/AdminSettings";
import InstitutionProfile from "./features/admin/pages/InstitutionProfile";
import AdminLoanRepayments from "./features/admin/pages/AdminLoanRepayments";
import InstitutionManagement from "./features/admin/pages/InstitutionManagement";
import InstitutionTreasury from "./features/admin/pages/InstitutionTreasury";
import VerifyTreasuryFunding from "./features/admin/pages/VerifyTreasuryFunding";



import WithdrawalRequest from "./features/savings/pages/WithdrawalRequest";
import LoanCalculator from "./features/loans/pages/LoanCalculator";
import LoanAppraisal from "./features/loans/pages/LoanAppraisal";
import LoanReview from "./features/loans/pages/LoanReview";
import FinancialStatements from "./features/reports/pages/FinancialStatements";
import LandingPage from "./features/landing/pages/LandingPage";
import SavingsDetails from "./features/savings/pages/SavingsDetails";
import AllSavings from "./features/savings/pages/AllSavings";
import FundAccount from "./features/accounts/pages/FundAccount";
import NotFound from "./features/NotFound";

import React, { useEffect } from "react";
import { useAuth } from "./features/auth/hooks/useAuth";
import { setNavigate } from "./lib/api";
import { useNavigate } from "react-router-dom";

const AppRoutes = () => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  if (isLoading) return null; // Or a loading spinner

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          !isAuthenticated ? (
            <LandingPage />
          ) : role === "super_admin" ? (
            <Navigate to="/superadmin/dashboard" replace />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      {/* Convenience redirects */}
      <Route path="/super-admin" element={<Navigate to="/superadmin/dashboard" replace />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        {/* Focused Onboarding Pages (No Sidebar/Header) */}
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route element={<MainLayout />}>
          <Route path="/pending-approval" element={<PendingApproval />} />
          
          {/* 
            Strictly guard the root dashboard to prevent Super Admins 
            from seeing the member layout flash before redirecting.
          */}
          <Route element={<PrivateRoute allowedRoles={["member", "staff", "institution_admin"]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/support" element={<Support />} />

          {/* Member & Admin Management (Institution Admin/Staff/Super Admin only) */}
          <Route
            element={<PrivateRoute allowedRoles={["super_admin", "institution_admin", "staff"]} />}
          >
            {/* Redirect /members to /admin/users */}
            <Route
              path="/members"
              element={<Navigate to="/admin/users" replace />}
            />
            <Route
              path="/members/:id"
              element={<Navigate to="/admin/users/:id" replace />}
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={<Navigate to="/admin/dashboard" replace />}
            />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/admins" element={<AdminManagement />} />
            <Route path="/admin/users/:id" element={<MemberProfile />} />
            <Route
              path="/admin/registrations"
              element={<RegistrationQueue />}
            />
            <Route path="/admin/interest" element={<InterestPosting />} />
            <Route path="/admin/jobs" element={<JobDashboard />} />
            <Route path="/admin/withdrawals" element={<WithdrawalQueue />} />
            <Route path="/admin/disbursements" element={<LoanDisbursement />} />
            <Route path="/admin/shares" element={<ShareManagement />} />
            <Route path="/admin/contributions" element={<ContributionManagement />} />
            <Route path="/admin/meetings" element={<MeetingManagement />} />
            <Route path="/admin/institution" element={<InstitutionProfile />} />
            <Route path="/admin/treasury" element={<InstitutionTreasury />} />
            <Route path="/admin/treasury/verify" element={<VerifyTreasuryFunding />} />
            <Route path="/admin/settings" element={<AdminSettings />} />

            {/* New Admin-managed Loan/Savings Routes */}
            <Route path="/admin/savings-products" element={<SavingsProducts />} />
            <Route path="/admin/loan-portfolio" element={<LoanPortfolio />} />
            <Route path="/admin/loan-requests" element={<LoanRequests />} />
            <Route path="/admin/loans" element={<LoanRequests />} />
            <Route path="/admin/loan-repayments" element={<AdminLoanRepayments />} />
            <Route path="/admin/loan-repayments/:id" element={<LoanRepayment />} />
            <Route path="/admin/loan-appraisal/:id?" element={<LoanAppraisal />} />
            <Route path="/admin/loan-review/:id" element={<LoanReview />} />

            {/* New Admin Report Routes */}
            <Route path="/admin/reports" element={<FinancialReports />} />
            <Route path="/admin/activity-log" element={<InstitutionActivityLog />} />
            <Route path="/admin/reports/statements" element={<FinancialStatements />} />
          </Route>



          {/* Governance Routes */}
          <Route path="/meetings" element={<MeetingArchive />} />

          {/* Savings Routes */}
          <Route path="/savings" element={<SavingsOverview />} />
          <Route path="/savings/all-accounts" element={<AllSavings />} />
          <Route path="/savings/products" element={<SavingsProducts />} />
          <Route path="/savings/plans/:id" element={<SavingsDetails />} />
          <Route path="/savings/withdrawal" element={<WithdrawalRequest />} />


          {/* Account Routes */}
          <Route path="/accounts/fund" element={<FundAccount />} />
          <Route path="/accounts/fund/verify" element={<FundAccount />} />

          {/* Loan Routes */}
          <Route path="/loans" element={<LoanApplication />} />
          <Route path="/loans/my-loans" element={<MyLoans />} />
          <Route path="/loans/repayments/:id" element={<LoanRepayment />} />
          <Route path="/loans/calculator" element={<LoanCalculator />} />
          <Route path="/loans/ledger/:id?" element={<LoanRepaymentLedger />} />


          {/* Transaction Routes */}
          <Route path="/transactions" element={<TransactionHistory />} />

          <Route path="/transactions/entry" element={<TransactionEntry />} />

          {/* Member Side Report Routes */}
          <Route path="/reports/statements" element={<FinancialStatements />} />
        </Route>
      </Route>

      {/* ── Super Admin Console (completely separate layout) ── */}
      <Route element={<PrivateRoute allowedRoles={["super_admin"]} />}>
        <Route element={<SuperAdminLayout />}>
          <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/superadmin/institutions" element={<InstitutionManagement />} />
          <Route path="/superadmin/institutions/:id" element={<InstitutionDetail />} />
          <Route path="/superadmin/users" element={<UserExplorer />} />
          <Route path="/superadmin/team" element={<PlatformTeam />} />
          <Route path="/superadmin/activity" element={<AuditLogExplorer />} />
          <Route path="/superadmin/profile" element={<SuperAdminProfile />} />
        </Route>
      </Route>

      {/* Catch all for 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

import { ConfirmationProvider } from "./contexts/ConfirmationContext";
import { SocketProvider } from "./contexts/SocketContext";
import { BrandProvider } from "./contexts/BrandContext";

const App = () => {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <ConfirmationProvider>
        <SocketProvider>
          <BrandProvider>
            <AppRoutes />
          </BrandProvider>
        </SocketProvider>
      </ConfirmationProvider>
    </Router>
  );
};

export default App;
