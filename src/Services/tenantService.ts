import axios from "axios";
import {
  Tenant,
  TenantSettings,
  CreateTenantRequest,
  UpdateTenantSettingsRequest,
  StoreRequest,
  CreateStoreRequestDto,
  ResubmitStoreRequestDto,
  ReviewStoreRequestDto,
  AssignStoreAdminDto,
  StoreApplicationStatusDto,
  CheckSlugResult,
  EligibleAdminDto,
  TenantMembership,
  StoreAssignRoleDto,
  TenantAuditLogDto,
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
 * Check if a proposed store slug is available or already claimed/reserved.
 */
export async function checkSlugAvailability(slug: string): Promise<CheckSlugResult> {
  const response = await tenantApi.get<CheckSlugResult>("/api/Tenant/requests/check-slug", {
    params: { slug },
  });
  return response.data;
}

/**
 * Submit an onboarding application for a new storefront (Public).
 */
export async function submitStoreApplication(
  request: CreateStoreRequestDto
): Promise<StoreRequest> {
  const response = await tenantApi.post<StoreRequest>("/api/Tenant/apply", request);
  return response.data;
}

/**
 * Legacy wrapper for submitStoreRequest
 */
export async function submitStoreRequest(
  request: CreateStoreRequestDto
): Promise<StoreRequest> {
  return submitStoreApplication(request);
}

/**
 * Check live status of an onboarding application (Public).
 */
export async function getApplicationStatus(
  referenceNumber: string,
  email: string
): Promise<StoreApplicationStatusDto> {
  const response = await tenantApi.get<StoreApplicationStatusDto>("/api/Tenant/requests/status", {
    params: { referenceNumber, email },
  });
  return response.data;
}

/**
 * Applicant resubmits application after information requested (Public).
 */
export async function resubmitApplication(
  referenceNumber: string,
  request: ResubmitStoreRequestDto
): Promise<StoreApplicationStatusDto> {
  const response = await tenantApi.put<StoreApplicationStatusDto>(
    `/api/Tenant/requests/${encodeURIComponent(referenceNumber)}/resubmit`,
    request
  );
  return response.data;
}

/**
 * Fetch store applications. SuperAdministrator sees all; Administrator sees own.
 */
export async function getStoreRequests(
  status?: string,
  search?: string
): Promise<StoreRequest[]> {
  const response = await tenantApi.get<StoreRequest[]>("/api/Tenant/requests", {
    params: { status, search },
  });
  return response.data;
}

/**
 * Fetch a single store application by ID.
 */
export async function getStoreRequestById(id: number): Promise<StoreRequest> {
  const response = await tenantApi.get<StoreRequest>(`/api/Tenant/requests/${id}`);
  return response.data;
}

/**
 * Request additional information from applicant (SuperAdministrator).
 */
export async function requestStoreInformation(
  requestId: number,
  inquiryNotes: string,
  adminNotes?: string
): Promise<StoreRequest> {
  const payload: ReviewStoreRequestDto = { inquiryNotes, adminNotes };
  const response = await tenantApi.post<StoreRequest>(
    `/api/Tenant/requests/${requestId}/request-info`,
    payload
  );
  return response.data;
}

/**
 * Approve a pending store request and provision tenant (SuperAdministrator).
 */
export async function approveStoreRequest(
  requestId: number,
  reviewDto?: ReviewStoreRequestDto | string
): Promise<StoreRequest> {
  const payload: ReviewStoreRequestDto =
    typeof reviewDto === "string"
      ? { notes: reviewDto, adminNotes: reviewDto }
      : reviewDto || {};
  const response = await tenantApi.post<StoreRequest>(
    `/api/Tenant/requests/${requestId}/approve`,
    payload
  );
  return response.data;
}

/**
 * Reject a pending store request with reason (SuperAdministrator).
 */
export async function rejectStoreRequest(
  requestId: number,
  rejectionReason: string,
  adminNotes?: string
): Promise<StoreRequest> {
  const payload: ReviewStoreRequestDto = {
    rejectionReason,
    adminNotes,
    notes: rejectionReason,
  };
  const response = await tenantApi.post<StoreRequest>(
    `/api/Tenant/requests/${requestId}/reject`,
    payload
  );
  return response.data;
}

/**
 * Assign StoreAdmin to an approved store application (SuperAdministrator).
 */
export async function assignStoreAdmin(
  requestId: number,
  data: AssignStoreAdminDto
): Promise<StoreRequest> {
  const response = await tenantApi.post<StoreRequest>(
    `/api/Tenant/requests/${requestId}/assign-admin`,
    data
  );
  return response.data;
}

/**
 * Retrieve eligible platform users who can be assigned as StoreAdmin.
 */
export async function getEligibleAdmins(): Promise<EligibleAdminDto[]> {
  const response = await tenantApi.get<EligibleAdminDto[]>("/api/Tenant/eligible-admins");
  return response.data;
}

/**
 * Retrieves all memberships for a specific tenant.
 */
export async function getTenantMemberships(tenantId: number): Promise<TenantMembership[]> {
  const response = await tenantApi.get<TenantMembership[]>(`/api/Tenant/${tenantId}/memberships`);
  return response.data;
}

/**
 * Assigns or updates a store role for a user.
 */
export async function assignTenantRole(
  tenantId: number,
  data: StoreAssignRoleDto
): Promise<TenantMembership> {
  const response = await tenantApi.post<TenantMembership>(
    `/api/Tenant/${tenantId}/assign-role`,
    data
  );
  return response.data;
}

/**
 * Revokes a store role from a user.
 */
export async function revokeTenantRole(
  tenantId: number,
  data: StoreAssignRoleDto
): Promise<{ success: boolean; message: string }> {
  const response = await tenantApi.post<{ success: boolean; message: string }>(
    `/api/Tenant/${tenantId}/revoke-role`,
    data
  );
  return response.data;
}

/**
 * Retrieves audit logs for a specific tenant.
 */
export async function getTenantAuditLogs(tenantId: number): Promise<TenantAuditLogDto[]> {
  const response = await tenantApi.get<TenantAuditLogDto[]>(`/api/Tenant/${tenantId}/audit-logs`);
  return response.data;
}

/**
 * Retrieves platform-wide audit logs (SuperAdministrator only).
 */
export async function getAllAuditLogs(): Promise<TenantAuditLogDto[]> {
  const response = await tenantApi.get<TenantAuditLogDto[]>("/api/Tenant/audit-logs");
  return response.data;
}
