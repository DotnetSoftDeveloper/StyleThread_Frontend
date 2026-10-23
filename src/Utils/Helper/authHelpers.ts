export interface DecodedAuthToken {
  sub?: string;
  email?: string;
  userId?: string;
  role?: string | string[];
  tenant_id?: string;
  tenant_slug?: string;
  tenant_role?: string;
  exp?: number;
}

export const decodeAuthToken = (token: string | null): DecodedAuthToken | null => {
  if (!token) return null;
  try {
    const cleanToken = token.startsWith('"') && token.endsWith('"') ? token.slice(1, -1) : token;
    const parts = cleanToken.split(".");
    if (parts.length < 2) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
};

export const clearStoredAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("auth");
  localStorage.removeItem("cartItems");
  localStorage.removeItem("cartCount");
  localStorage.removeItem("stylethread_tenant_slug");
  localStorage.removeItem("stylethread_tenant_role");
  sessionStorage.removeItem("stylethread_tenant_slug");
  sessionStorage.removeItem("hasSeenLoginModal");
};

export const getStoredToken = (): string | null => {
  let token: string | null = localStorage.getItem("token") || localStorage.getItem("auth");
  if (!token) return null;

  // Clean if wrapped in extra quotes from previous JSON.stringify
  if (token.startsWith('"') && token.endsWith('"')) {
    try {
      const parsed = JSON.parse(token);
      token = typeof parsed === "string" ? parsed : token.slice(1, -1);
    } catch {
      token = token.slice(1, -1);
    }
  }

  if (!token || token === "null" || token === "undefined") {
    return null;
  }

  // Check if token has expired; if so, clear it silently
  const payload = decodeAuthToken(token);
  if (payload?.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    clearStoredAuth();
    return null;
  }

  return token;
};

export const setStoredAuth = (token: string) => {
  let cleanToken = token;
  if (cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
    try {
      const parsed = JSON.parse(cleanToken);
      cleanToken = typeof parsed === "string" ? parsed : cleanToken.slice(1, -1);
    } catch {
      cleanToken = cleanToken.slice(1, -1);
    }
  }
  localStorage.setItem("token", cleanToken);
  localStorage.setItem("auth", cleanToken);

  const payload = decodeAuthToken(cleanToken);
  if (payload?.tenant_slug) {
    localStorage.setItem("stylethread_tenant_slug", payload.tenant_slug);
  }
  if (payload?.tenant_role) {
    localStorage.setItem("stylethread_tenant_role", payload.tenant_role);
  }
};

export const getStoredTenantSlug = (): string | null => {
  return localStorage.getItem("stylethread_tenant_slug");
};

export const getStoredTenantRole = (): string | null => {
  return localStorage.getItem("stylethread_tenant_role");
};
