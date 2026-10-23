import axios from "axios";
import {
  ReturnResponseDto,
  CreateReturnRequestPayload,
  ReviewReturnPayload,
  EscalateDisputePayload,
  ArbitrateDisputePayload,
} from "../Types/Interface/IReturn";
import { getStoredToken } from "../Utils/Helper/authHelpers";
import { resolveActiveTenantSlug } from "../Utils/tenantHelper";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  content?: T;
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "https://localhost:44314";

const returnApi = axios.create({
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
      throw new Error(response.message || response.error || "Return operation failed.");
    }
    return response.content as T;
  }
  return data as T;
};

export async function createReturnRequest(
  payload: CreateReturnRequestPayload,
  token?: string | null
): Promise<ReturnResponseDto> {
  const response = await returnApi.post<ApiResponse<ReturnResponseDto> | ReturnResponseDto>(
    "/api/Returns",
    payload,
    { headers: getHeaders(token) }
  );
  return readResponseContent<ReturnResponseDto>(response.data);
}

export async function getCustomerReturns(
  token?: string | null
): Promise<ReturnResponseDto[]> {
  const response = await returnApi.get<ApiResponse<ReturnResponseDto[]> | ReturnResponseDto[]>(
    "/api/Returns/customer",
    { headers: getHeaders(token) }
  );
  return readResponseContent<ReturnResponseDto[]>(response.data);
}

export async function getReturnByOrderId(
  orderId: number,
  token?: string | null
): Promise<ReturnResponseDto | null> {
  try {
    const response = await returnApi.get<ApiResponse<ReturnResponseDto> | ReturnResponseDto>(
      `/api/Returns/order/${orderId}`,
      { headers: getHeaders(token) }
    );
    return readResponseContent<ReturnResponseDto>(response.data);
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function getSellerReturns(
  status?: string,
  search?: string,
  token?: string | null
): Promise<ReturnResponseDto[]> {
  const params = new URLSearchParams();
  if (status && status !== "ALL") params.append("status", status);
  if (search) params.append("search", search);

  const url = `/api/Returns/seller${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await returnApi.get<ApiResponse<ReturnResponseDto[]> | ReturnResponseDto[]>(
    url,
    { headers: getHeaders(token) }
  );
  return readResponseContent<ReturnResponseDto[]>(response.data);
}

export async function approveReturn(
  returnId: number,
  payload?: ReviewReturnPayload,
  token?: string | null
): Promise<ReturnResponseDto> {
  const response = await returnApi.put<ApiResponse<ReturnResponseDto> | ReturnResponseDto>(
    `/api/Returns/${returnId}/approve`,
    payload || {},
    { headers: getHeaders(token) }
  );
  return readResponseContent<ReturnResponseDto>(response.data);
}

export async function rejectReturn(
  returnId: number,
  notes: string,
  token?: string | null
): Promise<ReturnResponseDto> {
  const response = await returnApi.put<ApiResponse<ReturnResponseDto> | ReturnResponseDto>(
    `/api/Returns/${returnId}/reject`,
    { notes },
    { headers: getHeaders(token) }
  );
  return readResponseContent<ReturnResponseDto>(response.data);
}

export async function receiveAndRefundReturn(
  returnId: number,
  payload?: ReviewReturnPayload,
  token?: string | null
): Promise<ReturnResponseDto> {
  const response = await returnApi.put<ApiResponse<ReturnResponseDto> | ReturnResponseDto>(
    `/api/Returns/${returnId}/receive-and-refund`,
    payload || {},
    { headers: getHeaders(token) }
  );
  return readResponseContent<ReturnResponseDto>(response.data);
}

export async function escalateDispute(
  returnId: number,
  payload: EscalateDisputePayload,
  token?: string | null
): Promise<ReturnResponseDto> {
  const response = await returnApi.put<ApiResponse<ReturnResponseDto> | ReturnResponseDto>(
    `/api/Returns/${returnId}/dispute`,
    payload,
    { headers: getHeaders(token) }
  );
  return readResponseContent<ReturnResponseDto>(response.data);
}

export async function arbitrateDispute(
  returnId: number,
  payload: ArbitrateDisputePayload,
  token?: string | null
): Promise<ReturnResponseDto> {
  const response = await returnApi.put<ApiResponse<ReturnResponseDto> | ReturnResponseDto>(
    `/api/Returns/${returnId}/arbitrate`,
    payload,
    { headers: getHeaders(token) }
  );
  return readResponseContent<ReturnResponseDto>(response.data);
}
