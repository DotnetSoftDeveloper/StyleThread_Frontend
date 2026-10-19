import { createContext, useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { getStoredToken, clearStoredAuth } from "../../Utils/Helper/authHelpers";

// Define the shape of the AuthContext
interface AuthContextType {
  token: string | null;
  role: string | null;
  setToken: (token: string | null) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [role, setRole] = useState<string | null>(null);
  const navigate = useNavigate();

  // Decode JWT token
  const decodeToken = (token: string | null): { exp: number; role?: string | string[] } | null => {
    if (!token) return null;
    try {
      const cleanToken = token.startsWith('"') && token.endsWith('"') ? token.slice(1, -1) : token;
      const payload = JSON.parse(atob(cleanToken.split(".")[1]));
      return payload;
    } catch (error) {
      console.error("Invalid token:", error);
      return null;
    }
  };

  // Check if token is expired
  const isTokenExpired = useCallback((token: string | null): boolean => {
    if (!token) return true;
    const payload = decodeToken(token);
    return payload ? payload.exp < Math.floor(Date.now() / 1000) : true;
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    const dupToken = token;
    clearStoredAuth();
    setToken(null);
    setRole(null);
    if (dupToken != null || dupToken === "User registered successfully.") {
      navigate("/signin");
    }
  }, [navigate, token]);

  // Automatically log out if token is expired
  useEffect(() => {
    if (isTokenExpired(token)) {
      handleLogout();
    }
  }, [token, isTokenExpired, handleLogout]); // ✅ Now included in dependencies

  // Periodic check for token expiration
  useEffect(() => {
    const interval = setInterval(() => {
      if (isTokenExpired(token)) {
        handleLogout();
      }
    }, 60 * 1000); // Check every minute
  
    return () => clearInterval(interval);
  }, [token, isTokenExpired, handleLogout]);

  // Update role whenever token changes
  useEffect(() => {
    if (token) {
      const payload = decodeToken(token);
      const userRole = Array.isArray(payload?.role) ? payload.role[0] : payload?.role;
      setRole(userRole || null);
    } else {
      setRole(null);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, role, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}
