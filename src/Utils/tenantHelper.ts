import axios from "axios";

const STORAGE_KEY = "stylethread_tenant_slug";

import { getStoredToken, decodeAuthToken } from "./Helper/authHelpers";

/**
 * Resolves active tenant slug from URL pathname, query, subdomain, token, or local storage.
 */
export function resolveActiveTenantSlug(): string {
  if (typeof window === "undefined") return "default";

  // 1. Check URL route path (e.g. /store/:slug/...)
  const pathMatch = window.location.pathname.match(/^\/store\/([^/?#]+)/i);
  if (pathMatch && pathMatch[1]) {
    const slug = pathMatch[1].trim().toLowerCase();
    if (slug !== "requests" && slug !== "settings") {
      localStorage.setItem(STORAGE_KEY, slug);
      return slug;
    }
  }

  // 2. Check URL query params (?tenant=xyz or ?store=xyz)
  const urlParams = new URLSearchParams(window.location.search);
  const queryTenant = urlParams.get("tenant") || urlParams.get("store");
  if (queryTenant && queryTenant.trim()) {
    const slug = queryTenant.trim().toLowerCase();
    localStorage.setItem(STORAGE_KEY, slug);
    return slug;
  }

  // 3. Check Subdomain (e.g. urbanthreads.stylethread.com)
  const host = window.location.hostname.toLowerCase();
  if (host !== "localhost" && host !== "127.0.0.1") {
    const parts = host.split(".");
    if (parts.length > 2 && parts[0] !== "www") {
      const subdomainSlug = parts[0];
      localStorage.setItem(STORAGE_KEY, subdomainSlug);
      return subdomainSlug;
    }
  }

  // 4. Check active authenticated user token
  const token = getStoredToken();
  if (token) {
    const payload = decodeAuthToken(token);
    if (payload?.tenant_slug && payload.tenant_slug.trim()) {
      const tokenSlug = payload.tenant_slug.trim().toLowerCase();
      localStorage.setItem(STORAGE_KEY, tokenSlug);
      return tokenSlug;
    }
  }

  // 5. Check LocalStorage fallback
  const storedSlug = localStorage.getItem(STORAGE_KEY);
  if (storedSlug && storedSlug.trim()) {
    return storedSlug.trim().toLowerCase();
  }

  return "default";
}

/**
 * Manually changes the active tenant slug in local storage and reloads/updates.
 */
export function setActiveTenantSlug(slug: string): void {
  if (typeof window === "undefined") return;
  const cleanSlug = slug.trim().toLowerCase();
  localStorage.setItem(STORAGE_KEY, cleanSlug);

  // Update URL search param seamlessly without full page reload if desired
  const url = new URL(window.location.href);
  if (cleanSlug === "default") {
    url.searchParams.delete("tenant");
    url.searchParams.delete("store");
  } else {
    url.searchParams.set("tenant", cleanSlug);
  }
  window.history.replaceState({}, "", url.toString());
}

/**
 * Global Axios interceptor ensuring every API request carries X-Tenant-Slug and Authorization headers.
 */
export function initTenantAxiosInterceptor(): void {
  axios.interceptors.request.use((config) => {
    const currentSlug = resolveActiveTenantSlug();
    if (currentSlug) {
      config.headers = config.headers || {};
      config.headers["X-Tenant-Slug"] = currentSlug;
    }
    const token = getStoredToken();
    if (token) {
      config.headers = config.headers || {};
      if (!config.headers["Authorization"]) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  });
}
