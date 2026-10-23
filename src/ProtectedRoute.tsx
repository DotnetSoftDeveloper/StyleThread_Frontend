import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./Pages/Login/useAuth";
import NoContentFound from "./NoContentFound";
import { useEffect, useRef, useState } from "react";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";
import React from "react";
import { useToast } from "./Utils/Helper/ToastNotifications";

interface ProtectedRouteProps {
  element?: React.ComponentType<any> | React.FC<any>;
  children?: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element: Element,
  children,
  allowedRoles
}) => {
  const { role, tenantRole, token } = useAuth();
  const location = useLocation();
  const loadingRef = useRef<LoadingBarRef | null>(null);
  const [redirect, setRedirect] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!token) {
      loadingRef.current?.continuousStart();
      showToast("error", "Please sign in to access this area.");
      const timer = setTimeout(() => {
        loadingRef.current?.complete();
        setRedirect(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [token, showToast]);

  if (!token) {
    if (redirect) {
      const path = location.pathname;

      // Platform Super Admin routes
      if (path.startsWith("/super-admin") || path === "/store-settings") {
        return <Navigate to="/super-admin/login" replace />;
      }

      // Merchant / Store Admin routes
      if (path.includes("/admin") || (allowedRoles.includes("StoreAdmin") && !allowedRoles.includes("Visitor"))) {
        const storeMatch = path.match(/^\/store\/([^/?#]+)/i);
        const query = storeMatch ? `?store=${storeMatch[1]}` : "";
        return <Navigate to={`/admin/login${query}`} replace />;
      }

      // Store-scoped customer routes
      const storeMatch = path.match(/^\/store\/([^/?#]+)/i);
      const storeSlug = storeMatch ? storeMatch[1] : "default";
      return <Navigate to={`/store/${storeSlug}/signin`} replace />;
    }

    return <LoadingBar color="#f11946" ref={loadingRef} />;
  }

  // Check role-based permission
  const userRoles = [role, tenantRole].filter(Boolean) as string[];
  const hasAccess = allowedRoles.some((r) => userRoles.includes(r));
  if (!hasAccess) {
    return <NoContentFound />;
  }

  return (
    <>
      <LoadingBar color="#f11946" ref={loadingRef} />
      {Element ? <Element /> : children}
    </>
  );
};

export default ProtectedRoute;
