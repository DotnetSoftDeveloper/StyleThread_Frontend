import axios from "axios";
import {
  Tenant,
  TenantSettings,
  CreateTenantRequest,
  UpdateTenantSettingsRequest,
  StoreRequest,
  CreateStoreRequestDto,
  ReviewStoreRequestDto,
} from "../Types/Interface/ITenant";
import { resolveActiveTenantSlug } from "../Utils/tenantHelper";
import { getStoredToken } from "../Utils/Helper/authHelpers";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "https://localhost:44314";

const tenantApi = axios.create({
  baseURL: apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

// Attach X-Tenant-Slug and auth token to tenantApi requests
tenantApi.interceptors.request.use((config) => {
  const currentSlug = resolveActiveTenantSlug();
  if (currentSlug) {
    config.headers["X-Tenant-Slug"] = currentSlug;
  }
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Fetch current tenant storefront styling and branding.
 */
export async function getCurrentTenant(slug?: string): Promise<Tenant> {
  const targetSlug = slug || resolveActiveTenantSlug();
  const response = await tenantApi.get<Tenant>("/api/Tenant/current", {
    headers: {
      "X-Tenant-Slug": targetSlug,
    },
    params: {
      tenant: targetSlug,
    },
  });
  return response.data;
}

/**
 * Update active tenant branding, styling colors, and store settings.
 */
export async function updateCurrentTenantSettings(
  request: UpdateTenantSettingsRequest,
  slug?: string
): Promise<TenantSettings> {
  const targetSlug = slug || resolveActiveTenantSlug();
  const response = await tenantApi.put<TenantSettings>(
    "/api/Tenant/settings",
    request,
    {
      headers: {
        "X-Tenant-Slug": targetSlug,
      },
      params: {
        tenant: targetSlug,
      },
    }
  );
  return response.data;
}

/**
 * List all tenants on the platform (superadmin or tenant switcher).
 */
export async function getAllTenants(): Promise<Tenant[]> {
  const response = await tenantApi.get<Tenant[]>("/api/Tenant");
  return response.data;
}

/**
 * Provision a brand-new tenant/store on the platform (SuperAdministrator only).
 */
export async function createTenant(request: CreateTenantRequest): Promise<Tenant> {
  const response = await tenantApi.post<Tenant>("/api/Tenant", request);
  return response.data;
}

/**
 * Submit an application/request for a new store to Super Administrator.
 */
export async function submitStoreRequest(
  request: CreateStoreRequestDto
): Promise<StoreRequest> {
  const response = await tenantApi.post<StoreRequest>("/api/Tenant/request-store", request);
  return response.data;
}

/**
 * Fetch store requests. SuperAdministrator sees all; Administrator sees own.
 */
export async function getStoreRequests(): Promise<StoreRequest[]> {
  const response = await tenantApi.get<StoreRequest[]>("/api/Tenant/requests");
  return response.data;
}

/**
 * Approve a pending store request and provision the new tenant.
 */
export async function approveStoreRequest(
  requestId: number,
  notes?: string
): Promise<StoreRequest> {
  const payload: ReviewStoreRequestDto = { notes, adminNotes: notes };
  const response = await tenantApi.post<StoreRequest>(
    `/api/Tenant/requests/${requestId}/approve`,
    payload
  );
  return response.data;
}

/**
 * Reject a pending store request with notes/reason.
 */
export async function rejectStoreRequest(
  requestId: number,
  notes?: string
): Promise<StoreRequest> {
  const payload: ReviewStoreRequestDto = { notes, adminNotes: notes };
  const response = await tenantApi.post<StoreRequest>(
    `/api/Tenant/requests/${requestId}/reject`,
    payload
  );
  return response.data;
}

