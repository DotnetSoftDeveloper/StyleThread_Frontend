import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../../ProtectedRoute";
import PublicRoute from "../../PublicRoute";
import SuperAdminLogin from "../../Pages/Admin/SuperAdminLogin";
import SuperAdminLayout from "../../layouts/SuperAdminLayout/SuperAdminLayout";
import SuperAdminDashboard from "../../features/super-admin/pages/SuperAdminDashboard";
import ApplicationsQueuePage from "../../features/super-admin/pages/ApplicationsQueuePage";
import StoresManagementPage from "../../features/super-admin/pages/StoresManagementPage";
import StoreDetailsPage from "../../features/super-admin/pages/StoreDetailsPage";
import AdminsDirectoryPage from "../../features/super-admin/pages/AdminsDirectoryPage";
import StoreAssignmentsPage from "../../features/super-admin/pages/StoreAssignmentsPage";
import PlatformSettingsPage from "../../features/super-admin/pages/PlatformSettingsPage";
import AuditLogsPage from "../../features/super-admin/pages/AuditLogsPage";

export const renderSuperAdminRoutes = () => (
  <>
    {/* Dedicated Super Admin Login */}
    <Route
      path="/super-admin/login"
      element={<PublicRoute portalType="super-admin" element={<SuperAdminLogin />} />}
    />

    {/* Protected Super Admin Control Center */}
    <Route
      element={
        <ProtectedRoute
          element={SuperAdminLayout}
          allowedRoles={["SuperAdministrator"]}
        />
      }
    >
      <Route path="/super-admin" element={<Navigate to="/super-admin/dashboard" replace />} />
      <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
      <Route path="/super-admin/applications" element={<ApplicationsQueuePage />} />
      <Route path="/super-admin/stores" element={<StoresManagementPage />} />
      <Route path="/super-admin/stores/:id" element={<StoreDetailsPage />} />
      <Route path="/super-admin/admins" element={<AdminsDirectoryPage />} />
      <Route path="/super-admin/assignments" element={<StoreAssignmentsPage />} />
      <Route path="/super-admin/settings" element={<PlatformSettingsPage />} />
      <Route path="/super-admin/audit-logs" element={<AuditLogsPage />} />
    </Route>

    {/* Legacy redirection */}
    <Route
      path="/store-settings"
      element={<Navigate to="/super-admin/dashboard" replace />}
    />
  </>
);

export default renderSuperAdminRoutes;
