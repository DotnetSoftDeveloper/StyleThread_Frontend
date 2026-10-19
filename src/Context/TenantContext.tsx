import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Tenant, TenantSettings, UpdateTenantSettingsRequest } from "../Types/Interface/ITenant";
import { getCurrentTenant, updateCurrentTenantSettings } from "../Services/tenantService";
import {
  initTenantAxiosInterceptor,
  resolveActiveTenantSlug,
  setActiveTenantSlug,
} from "../Utils/tenantHelper";

interface TenantContextType {
  tenant: Tenant | null;
  settings: TenantSettings | null;
  loading: boolean;
  error: string | null;
  activeSlug: string;
  switchTenant: (newSlug: string) => Promise<void>;
  refreshTenant: () => Promise<void>;
  updateSettings: (req: UpdateTenantSettingsRequest) => Promise<TenantSettings>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

// Initialize global Axios interceptor once
initTenantAxiosInterceptor();

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSlug, setActiveSlugState] = useState<string>(() => resolveActiveTenantSlug());
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const applyThemeVariables = useCallback((settings?: TenantSettings | null, storeName?: string) => {
    if (!settings) return;

    const root = document.documentElement;
    if (settings.primaryColor) {
      root.style.setProperty("--tenant-primary", settings.primaryColor);
    }
    if (settings.accentColor) {
      root.style.setProperty("--tenant-accent", settings.accentColor);
    }
    if (settings.backgroundColor) {
      root.style.setProperty("--tenant-bg", settings.backgroundColor);
    }

    // Set dynamic page title
    if (storeName) {
      document.title = `${storeName} | Contemporary Clothing`;
    }

    // Set dynamic favicon if provided
    if (settings.faviconUrl) {
      let favicon = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!favicon) {
        favicon = document.createElement("link");
        favicon.rel = "icon";
        document.getElementsByTagName("head")[0].appendChild(favicon);
      }
      favicon.href = settings.faviconUrl;
    }
  }, []);

  const loadTenantData = useCallback(async (slugToLoad: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCurrentTenant(slugToLoad);
      setTenant(data);
      applyThemeVariables(data.settings, data.storeName);
    } catch (err: unknown) {
      console.error("Failed to load tenant storefront:", err);
      setError(err instanceof Error ? err.message : "Failed to load store settings");
    } finally {
      setLoading(false);
    }
  }, [applyThemeVariables]);

  useEffect(() => {
    loadTenantData(activeSlug);
  }, [activeSlug, loadTenantData]);

  const switchTenant = async (newSlug: string) => {
    setActiveTenantSlug(newSlug);
    setActiveSlugState(newSlug);
    await loadTenantData(newSlug);
  };

  const refreshTenant = async () => {
    await loadTenantData(activeSlug);
  };

  const updateSettingsHandler = async (req: UpdateTenantSettingsRequest): Promise<TenantSettings> => {
    const updated = await updateCurrentTenantSettings(req, activeSlug);
    setTenant((prev) =>
      prev
        ? {
            ...prev,
            settings: updated,
          }
        : null
    );
    applyThemeVariables(updated, tenant?.storeName);
    return updated;
  };

  return (
    <TenantContext.Provider
      value={{
        tenant,
        settings: tenant?.settings ?? null,
        loading,
        error,
        activeSlug,
        switchTenant,
        refreshTenant,
        updateSettings: updateSettingsHandler,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
};
