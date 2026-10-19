import axios from "axios";

const STORAGE_KEY = "stylethread_tenant_slug";

/**
 * Resolves active tenant slug from URL query, subdomain, or local storage.
 */
export function resolveActiveTenantSlug(): string {
  if (typeof window === "undefined") return "default";

  // 1. Check URL query params (?tenant=xyz or ?store=xyz)
  const urlParams = new URLSearchParams(window.location.search);
  const queryTenant = urlParams.get("tenant") || urlParams.get("store");
  if (queryTenant && queryTenant.trim()) {
    const slug = queryTenant.trim().toLowerCase();
    localStorage.setItem(STORAGE_KEY, slug);
    return slug;
  }

  // 2. Check Subdomain (e.g. urbanthreads.stylethread.com)
  const host = window.location.hostname.toLowerCase();
  if (host !== "localhost" && host !== "127.0.0.1") {
    const parts = host.split(".");
    if (parts.length > 2 && parts[0] !== "www") {
      const subdomainSlug = parts[0];
      localStorage.setItem(STORAGE_KEY, subdomainSlug);
      return subdomainSlug;
    }
  }

  // 3. Check LocalStorage fallback
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
 * Global Axios interceptor ensuring every API request carries X-Tenant-Slug header.
 */
export function initTenantAxiosInterceptor(): void {
  axios.interceptors.request.use((config) => {
    const currentSlug = resolveActiveTenantSlug();
    if (currentSlug) {
      config.headers = config.headers || {};
      config.headers["X-Tenant-Slug"] = currentSlug;
    }
    return config;
  });
}
