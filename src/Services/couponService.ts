import axios from "axios";
import {
  Coupon,
  ValidateCouponRequest,
  ValidateCouponResponse,
  CreateCouponPayload,
} from "../Types/Interface/ICoupon";
import { getStoredToken } from "../Utils/Helper/authHelpers";
import { resolveActiveTenantSlug } from "../Utils/tenantHelper";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  content?: T;
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "https://localhost:44314";

const couponApi = axios.create({
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
      throw new Error(response.message || response.error || "The coupon operation failed.");
    }
    return response.content as T;
  }
  return data as T;
};

export async function fetchActiveCoupons(): Promise<Coupon[]> {
  try {
    const response = await couponApi.get<ApiResponse<Coupon[]> | Coupon[]>(
      "/api/Coupons",
      { headers: getHeaders() }
    );
    return readResponseContent<Coupon[]>(response.data) || [];
  } catch (error: any) {
    console.warn("Failed to load active coupons", error);
    return [];
  }
}

export async function validateCouponApi(
  code: string,
  subtotal: number
): Promise<ValidateCouponResponse> {
  const payload: ValidateCouponRequest = { code, subtotal };
  try {
    const response = await couponApi.post<
      ApiResponse<ValidateCouponResponse> | ValidateCouponResponse
    >("/api/Coupons/validate", payload, { headers: getHeaders() });

    return readResponseContent<ValidateCouponResponse>(response.data);
  } catch (error: any) {
    const errMsg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Invalid or expired coupon.";
    throw new Error(errMsg);
  }
}

export async function createCouponApi(
  payload: CreateCouponPayload,
  token?: string | null
): Promise<Coupon> {
  const response = await couponApi.post<ApiResponse<Coupon> | Coupon>(
    "/api/Coupons",
    payload,
    { headers: getHeaders(token) }
  );
  return readResponseContent<Coupon>(response.data);
}

export async function deactivateCouponApi(
  id: number,
  token?: string | null
): Promise<void> {
  await couponApi.delete(`/api/Coupons/${id}`, {
    headers: getHeaders(token),
  });
}
