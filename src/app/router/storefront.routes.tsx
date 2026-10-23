import React from "react";
import { Route, Navigate, useParams } from "react-router-dom";
import ProtectedRoute from "../../ProtectedRoute";
import PublicRoute from "../../PublicRoute";
import StorefrontLayout from "../../layouts/StorefrontLayout/StorefrontLayout";
import Home from "../../Pages/Home/Home";
import { Auth } from "../../Pages/Login/Auth";
import ForgotPassword from "../../Pages/Login/ForgotPassword";
import ResetPassword from "../../Pages/Login/ResetPassword";
import About from "../../Pages/About/About";
import ThankYou from "../../Pages/ThankYou/ThankYou";
import ProductDetail from "../../Pages/ProductDetail/ProductDetail";
import Cart from "../../Pages/Cart/Cart";
import Profile from "../../Pages/Profile/Profile";
import Wishlist from "../../Pages/Wishlist/Wishlist";
import AddProduct from "../../Pages/AddProduct/AddProduct";
import SellerOrders from "../../Pages/Seller/SellerOrders";
import AnalyticsDashboard from "../../Pages/Analytics/AnalyticsDashboard";
import ProductList from "../../Components/ProductList/ProductList";
import Confirm from "../../Pages/Login/Confirm";
import { useTenant } from "../../Context/TenantContext";

const LegacyProductRedirect: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { activeSlug } = useTenant();
  return <Navigate to={`/store/${activeSlug || "default"}/product/${id}`} replace />;
};

const LegacyEditProductRedirect: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/admin/products/edit/${id}`} replace />;
};

export const renderStorefrontRoutes = () => (
  <>
    {/* Client Storefronts wrapped in StorefrontLayout */}
    <Route element={<StorefrontLayout />}>
      <Route path="/store/:storeSlug" element={<Home />} />
      <Route
        path="/store/:storeSlug/signin"
        element={<PublicRoute element={<Auth mode="signin" />} />}
      />
      <Route
        path="/store/:storeSlug/signup"
        element={<PublicRoute element={<Auth mode="signup" />} />}
      />
      <Route
        path="/store/:storeSlug/forgot-password"
        element={<PublicRoute element={<ForgotPassword />} />}
      />
      <Route
        path="/store/:storeSlug/reset-password"
        element={<PublicRoute element={<ResetPassword />} />}
      />
      <Route path="/store/:storeSlug/about" element={<About />} />
      <Route path="/store/:storeSlug/thank-you" element={<ThankYou />} />

      {/* Product views */}
      <Route path="/store/:storeSlug/product/:id" element={<ProductDetail />} />
      <Route path="/store/:storeSlug/productDetail/:id" element={<ProductDetail />} />

      {/* Customer Account & Cart */}
      <Route
        path="/store/:storeSlug/cart"
        element={
          <ProtectedRoute
            element={Cart}
            allowedRoles={["SuperAdministrator", "Administrator", "Seller", "Visitor", "StoreAdmin", "StoreSeller", "StoreCustomer"]}
          />
        }
      />
      <Route
        path="/store/:storeSlug/profile"
        element={
          <ProtectedRoute
            element={Profile}
            allowedRoles={["SuperAdministrator", "Administrator", "Seller", "Visitor", "StoreAdmin", "StoreSeller", "StoreCustomer"]}
          />
        }
      />
      <Route
        path="/store/:storeSlug/wishlist"
        element={
          <ProtectedRoute
            element={Wishlist}
            allowedRoles={["SuperAdministrator", "Administrator", "Seller", "Visitor", "StoreAdmin", "StoreSeller", "StoreCustomer"]}
          />
        }
      />

      {/* Legacy store operations redirected to dedicated Store Admin Portal */}
      <Route path="/store/:storeSlug/addProduct" element={<Navigate to="/admin/products/new" replace />} />
      <Route path="/store/:storeSlug/editProduct/:id" element={<LegacyEditProductRedirect />} />
      <Route path="/store/:storeSlug/orders" element={<Navigate to="/admin/orders" replace />} />
      <Route path="/store/:storeSlug/analytics" element={<Navigate to="/admin/analytics" replace />} />
      <Route path="/store/:storeSlug/productList" element={<Navigate to="/admin/products" replace />} />
    </Route>

    {/* Registration confirmation */}
    <Route path="/confirm" element={<Confirm />} />

    {/* Legacy unscoped store shortcuts cleanly mapped to store-scoped routes or admin portal */}
    <Route path="/signin" element={<Navigate to="/store/default/signin" replace />} />
    <Route path="/signup" element={<Navigate to="/store/default/signup" replace />} />
    <Route path="/forgot-password" element={<Navigate to="/store/default/forgot-password" replace />} />
    <Route path="/reset-password" element={<Navigate to="/store/default/reset-password" replace />} />
    <Route path="/thank-you" element={<Navigate to="/store/default/thank-you" replace />} />
    <Route path="/seller/orders" element={<Navigate to="/admin/orders" replace />} />
    <Route path="/seller/analytics" element={<Navigate to="/admin/analytics" replace />} />
    <Route path="/productList" element={<Navigate to="/admin/products" replace />} />
    <Route path="/addProduct" element={<Navigate to="/admin/products/new" replace />} />
    <Route path="/editProduct/:id" element={<LegacyEditProductRedirect />} />
    <Route path="/profile" element={<Navigate to="/store/default/profile" replace />} />
    <Route path="/wishlist" element={<Navigate to="/store/default/wishlist" replace />} />
    <Route path="/product/:id" element={<LegacyProductRedirect />} />
    <Route path="/productDetail/:id" element={<LegacyProductRedirect />} />
    <Route path="/cart" element={<Navigate to="/store/default/cart" replace />} />
  </>
);

export default renderStorefrontRoutes;
