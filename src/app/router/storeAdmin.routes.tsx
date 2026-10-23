import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../../ProtectedRoute";
import PublicRoute from "../../PublicRoute";
import StoreAdminLogin from "../../Pages/Admin/StoreAdminLogin";
import StoreAdminLayout from "../../layouts/StoreAdminLayout/StoreAdminLayout";
import StoreAdminDashboard from "../../features/store-admin/pages/StoreAdminDashboard";
import StoreAdminProductsPage from "../../features/store-admin/pages/StoreAdminProductsPage";
import StoreAdminCategoriesPage from "../../features/store-admin/pages/StoreAdminCategoriesPage";
import StoreAdminInventoryPage from "../../features/store-admin/pages/StoreAdminInventoryPage";
import StoreAdminOrdersPage from "../../features/store-admin/pages/StoreAdminOrdersPage";
import StoreAdminCustomersPage from "../../features/store-admin/pages/StoreAdminCustomersPage";
import StoreAdminAnalyticsPage from "../../features/store-admin/pages/StoreAdminAnalyticsPage";
import StoreAdminSettingsPage from "../../features/store-admin/pages/StoreAdminSettingsPage";
import StoreAdminProfilePage from "../../features/store-admin/pages/StoreAdminProfilePage";
import AddProduct from "../../Pages/AddProduct/AddProduct";

export const renderStoreAdminRoutes = () => (
  <>
    {/* Dedicated Store Admin Login */}
    <Route
      path="/admin/login"
      element={<PublicRoute portalType="store-admin" element={<StoreAdminLogin />} />}
    />

    {/* Protected Store Admin Portal */}
    <Route
      element={
        <ProtectedRoute
          element={StoreAdminLayout}
          allowedRoles={["SuperAdministrator", "Administrator", "StoreAdmin"]}
        />
      }
    >
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<StoreAdminDashboard />} />
      <Route path="/admin/products" element={<StoreAdminProductsPage />} />
      <Route path="/admin/products/new" element={<AddProduct />} />
      <Route path="/admin/products/edit/:id" element={<AddProduct />} />
      <Route path="/admin/categories" element={<StoreAdminCategoriesPage />} />
      <Route path="/admin/inventory" element={<StoreAdminInventoryPage />} />
      <Route path="/admin/orders" element={<StoreAdminOrdersPage />} />
      <Route path="/admin/customers" element={<StoreAdminCustomersPage />} />
      <Route path="/admin/analytics" element={<StoreAdminAnalyticsPage />} />
      <Route path="/admin/store-settings" element={<StoreAdminSettingsPage />} />
      <Route path="/admin/profile" element={<StoreAdminProfilePage />} />
    </Route>

    {/* Legacy Redirections */}
    <Route path="/addProduct" element={<Navigate to="/admin/products/new" replace />} />
    <Route path="/productList" element={<Navigate to="/admin/products" replace />} />
    <Route
      path="/store/:storeSlug/store-settings"
      element={<Navigate to="/admin/store-settings" replace />}
    />
    <Route
      path="/store/:storeSlug/admin"
      element={<Navigate to="/admin/dashboard" replace />}
    />
  </>
);

export default renderStoreAdminRoutes;
