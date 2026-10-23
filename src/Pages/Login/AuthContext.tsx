import { createContext, useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { getStoredToken, clearStoredAuth } from "../../Utils/Helper/authHelpers";

// Define the shape of the AuthContext
interface AuthContextType {
  token: string | null;
  role: string | null;
  tenantSlug: string | null;
  tenantRole: string | null;
  userId: string | null;
  email: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [role, setRole] = useState<string | null>(null);
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [tenantRole, setTenantRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  // Decode JWT token
  const decodeToken = useCallback((token: string | null): { 
    exp: number; 
    role?: string | string[]; 
    tenant_slug?: string; 
    tenant_id?: string; 
    tenant_role?: string; 
    userId?: string; 
    email?: string;
  } | null => {
    if (!token) return null;
    try {
      const cleanToken = token.startsWith('"') && token.endsWith('"') ? token.slice(1, -1) : token;
      const payload = JSON.parse(atob(cleanToken.split(".")[1]));
      return payload;
    } catch (error) {
      console.error("Invalid token:", error);
      return null;
    }
  }, []);

  // Check if token is expired (returns false when no token is present)
  const isTokenExpired = useCallback((token: string | null): boolean => {
    if (!token) return false;
    const payload = decodeToken(token);
    if (!payload || !payload.exp) return true;
    return payload.exp < Math.floor(Date.now() / 1000);
  }, [decodeToken]);

  // User-initiated logout (navigates away)
  const handleLogout = useCallback(() => {
    const priorRole = role;
    const priorTenantSlug = tenantSlug;
    const priorTenantRole = tenantRole;

    clearStoredAuth();
    setToken(null);
    setRole(null);
    setTenantSlug(null);
    setTenantRole(null);
    setUserId(null);
    setEmail(null);

    if (priorRole === "SuperAdministrator") {
      navigate("/super-admin/login");
    } else if (priorRole === "Administrator" || priorTenantRole === "StoreAdmin") {
      const query = priorTenantSlug ? `?store=${priorTenantSlug}` : "";
      navigate(`/admin/login${query}`);
    } else {
      const slug = priorTenantSlug || "default";
      navigate(`/store/${slug}`);
    }
  }, [navigate, role, tenantSlug, tenantRole]);

  // Session clearing for expired tokens (does NOT force unwanted navigation on page load)
  const clearExpiredSession = useCallback(() => {
    clearStoredAuth();
    setToken(null);
    setRole(null);
    setTenantSlug(null);
    setTenantRole(null);
    setUserId(null);
    setEmail(null);
  }, []);

  // Automatically clear session if an existing token expires
  useEffect(() => {
    if (token && isTokenExpired(token)) {
      clearExpiredSession();
    }
  }, [token, isTokenExpired, clearExpiredSession]);

  // Periodic check for token expiration
  useEffect(() => {
    const interval = setInterval(() => {
      if (token && isTokenExpired(token)) {
        clearExpiredSession();
      }
    }, 60 * 1000); // Check every minute
  
    return () => clearInterval(interval);
  }, [token, isTokenExpired, clearExpiredSession]);

  // Update role & tenant context whenever token changes
  useEffect(() => {
    if (token) {
      const payload = decodeToken(token);
      const userRole = Array.isArray(payload?.role) ? payload.role[0] : payload?.role;
      setRole(userRole || null);
      setTenantSlug(payload?.tenant_slug || null);
      setTenantRole(payload?.tenant_role || null);
      setUserId(payload?.userId || null);
      setEmail(payload?.email || null);
    } else {
      setRole(null);
      setTenantSlug(null);
      setTenantRole(null);
      setUserId(null);
      setEmail(null);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, role, tenantSlug, tenantRole, userId, email, setToken, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}
