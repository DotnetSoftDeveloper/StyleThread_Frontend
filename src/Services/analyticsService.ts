import axios from "axios";
import {
  PlatformAnalyticsDto,
  SellerAnalyticsDto,
  LowStockItemDto,
  StockAlertTriggerResponse,
  BackgroundJobStatusDto,
  BackgroundJobExecutionResultDto,
} from "../Types/Interface/IAnalytics";
import { getStoredToken } from "../Utils/Helper/authHelpers";
import { resolveActiveTenantSlug } from "../Utils/tenantHelper";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  content?: T;
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "https://localhost:44314";

const analyticsApi = axios.create({
  baseURL: apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

const getHeaders = (token?: string | null) => {
  const authToken = token || getStoredToken();
  const slug = resolveActiveTenantSlug();
  return {
    "Content-Type": "application/json",
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(slug ? { "X-Tenant-Slug": slug } : {}),
  };
};

const readResponseContent = <T>(data: ApiResponse<T> | T): T => {
  if (typeof data === "object" && data !== null && "success" in data) {
    const response = data as ApiResponse<T>;
    if (!response.success) {
      throw new Error(response.message || response.error || "The analytics request failed.");
    }
    return response.content as T;
  }
  return data as T;
};

export async function fetchPlatformAnalytics(token?: string | null): Promise<PlatformAnalyticsDto> {
  const response = await analyticsApi.get<ApiResponse<PlatformAnalyticsDto>>(
    "/api/Analytics/platform",
    { headers: getHeaders(token) }
  );
  return readResponseContent<PlatformAnalyticsDto>(response.data);
}

export async function fetchSellerAnalytics(token?: string | null): Promise<SellerAnalyticsDto> {
  const response = await analyticsApi.get<ApiResponse<SellerAnalyticsDto>>(
    "/api/Analytics/seller",
    { headers: getHeaders(token) }
  );
  return readResponseContent<SellerAnalyticsDto>(response.data);
}

export async function fetchLowStockItems(token?: string | null): Promise<LowStockItemDto[]> {
  const response = await analyticsApi.get<ApiResponse<LowStockItemDto[]>>(
    "/api/Analytics/low-stock",
    { headers: getHeaders(token) }
  );
  return readResponseContent<LowStockItemDto[]>(response.data) || [];
}

export async function triggerStockAlertEmail(token?: string | null): Promise<{
  success: boolean;
  message: string;
  content?: StockAlertTriggerResponse;
}> {
  const response = await analyticsApi.post<ApiResponse<StockAlertTriggerResponse>>(
    "/api/Analytics/stock-alerts/trigger",
    {},
    { headers: getHeaders(token) }
  );
  return {
    success: response.data.success,
    message: response.data.message || "Alert email processed.",
    content: response.data.content,
  };
}

export async function fetchBackgroundJobStatus(token?: string | null): Promise<BackgroundJobStatusDto> {
  const response = await analyticsApi.get<ApiResponse<BackgroundJobStatusDto>>(
    "/api/Analytics/background-jobs/status",
    { headers: getHeaders(token) }
  );
  return readResponseContent<BackgroundJobStatusDto>(response.data);
}

export async function triggerBackgroundJobNow(token?: string | null): Promise<BackgroundJobExecutionResultDto> {
  const response = await analyticsApi.post<ApiResponse<BackgroundJobExecutionResultDto>>(
    "/api/Analytics/background-jobs/run-now",
    {},
    { headers: getHeaders(token) }
  );
  return readResponseContent<BackgroundJobExecutionResultDto>(response.data);
}

