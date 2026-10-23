import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./Pages/Login/useAuth";

interface PublicRouteProps {
  element: React.ComponentType | React.ReactElement;
  redirectTo?: string;
  portalType?: "super-admin" | "store-admin" | "customer";
}

/**
 * Route wrapper that prevents authenticated users from accessing
 * redundant guest-only pages like /signin, /signup, /forgot-password.
 * If user already has an active token matching the portal scope, redirects them to their dashboard.
 */
const PublicRoute: React.FC<PublicRouteProps> = ({
  element,
  redirectTo,
  portalType = "customer"
}) => {
  const { token, role, tenantRole, tenantSlug } = useAuth();

  if (token) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    if (portalType === "super-admin") {
      // Only redirect if already authenticated as SuperAdministrator
      if (role === "SuperAdministrator") {
        return <Navigate to="/store-settings" replace />;
      }
      // Otherwise, allow user to log in as Super Admin
      return React.isValidElement(element) ? element : React.createElement(element);
    }

    if (portalType === "store-admin") {
      // Only redirect if already authenticated as StoreAdmin / Administrator
      if (role === "Administrator" || role === "SuperAdministrator" || tenantRole === "StoreAdmin") {
        const slug = tenantSlug || "default";
        return <Navigate to={role === "SuperAdministrator" ? "/store-settings" : `/store/${slug}/store-settings`} replace />;
      }
      // Otherwise, allow user to log in as Store Admin
      return React.isValidElement(element) ? element : React.createElement(element);
    }

    // Default customer guest route (/store/:storeSlug/signin, signup, etc.)
    if (role === "SuperAdministrator") {
      return <Navigate to="/store-settings" replace />;
    }

    if (role === "Administrator" || tenantRole === "StoreAdmin") {
      const slug = tenantSlug || "default";
      return <Navigate to={`/store/${slug}/store-settings`} replace />;
    }

    if (role === "Seller" || role === "StoreSeller" || tenantRole === "StoreSeller") {
      const slug = tenantSlug || "default";
      return <Navigate to={`/store/${slug}/orders`} replace />;
    }

    const slug = tenantSlug || "default";
    return <Navigate to={`/store/${slug}`} replace />;
  }

  return React.isValidElement(element) ? element : React.createElement(element);
};

export default PublicRoute;
