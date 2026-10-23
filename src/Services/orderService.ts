import axios from "axios";
import {
  CreateOrderRequest,
  CustomerOrder,
  UpdateOrderStatusPayload,
  OrderTrackingInfo,
} from "../Types/Interface/IOrder";
import { getStoredToken } from "../Utils/Helper/authHelpers";
import { resolveActiveTenantSlug } from "../Utils/tenantHelper";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  content?: T;
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "https://localhost:44314";

const orderApi = axios.create({
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
      throw new Error(response.message || response.error || "The order request failed.");
    }

    return response.content as T;
  }

  return data as T;
};

export async function createCustomerOrder(
  request: CreateOrderRequest,
  token?: string | null,
): Promise<CustomerOrder> {
  const response = await orderApi.post<ApiResponse<CustomerOrder> | CustomerOrder>(
    "/api/Orders",
    request,
    { headers: getHeaders(token) },
  );

  return readResponseContent<CustomerOrder>(response.data);
}

export async function getCustomerOrders(token?: string | null): Promise<CustomerOrder[]> {
  const response = await orderApi.get<ApiResponse<CustomerOrder[]> | CustomerOrder[]>(
    "/api/Orders",
    { headers: getHeaders(token) },
  );

  const orders = readResponseContent<CustomerOrder[]>(response.data);
  return Array.isArray(orders) ? orders : [];
}

export async function getSellerOrders(
  status?: string,
  search?: string,
  token?: string | null,
): Promise<CustomerOrder[]> {
  const params = new URLSearchParams();
  if (status && status !== "all") params.append("status", status);
  if (search && search.trim()) params.append("search", search.trim());

  const queryString = params.toString() ? `?${params.toString()}` : "";
  const response = await orderApi.get<ApiResponse<CustomerOrder[]> | CustomerOrder[]>(
    `/api/Orders/seller${queryString}`,
    { headers: getHeaders(token) },
  );

  const orders = readResponseContent<CustomerOrder[]>(response.data);
  return Array.isArray(orders) ? orders : [];
}

export async function updateOrderStatus(
  orderId: number,
  payload: UpdateOrderStatusPayload,
  token?: string | null,
): Promise<CustomerOrder> {
  const response = await orderApi.put<ApiResponse<CustomerOrder> | CustomerOrder>(
    `/api/Orders/${orderId}/status`,
    payload,
    { headers: getHeaders(token) },
  );

  return readResponseContent<CustomerOrder>(response.data);
}

export async function cancelCustomerOrder(
  orderId: number,
  reason?: string,
  token?: string | null,
): Promise<CustomerOrder> {
  const response = await orderApi.post<ApiResponse<CustomerOrder> | CustomerOrder>(
    `/api/Orders/${orderId}/cancel`,
    { reason },
    { headers: getHeaders(token) },
  );

  return readResponseContent<CustomerOrder>(response.data);
}

export async function getOrderTracking(
  orderId: number,
  token?: string | null,
): Promise<OrderTrackingInfo> {
  const response = await orderApi.get<ApiResponse<OrderTrackingInfo> | OrderTrackingInfo>(
    `/api/Orders/${orderId}/tracking`,
    { headers: getHeaders(token) },
  );

  return readResponseContent<OrderTrackingInfo>(response.data);
}

export interface CartValidationItem {
  cartId: number;
  productId: number;
  productName: string;
  requestedQuantity: number;
  availableStock: number;
  currentPrice: number;
  isAvailable: boolean;
  status: "Available" | "OutOfStock" | "InsufficientStock" | "NotFound";
  message: string;
}

export interface CartValidationResult {
  isValid: boolean;
  message: string;
  items: CartValidationItem[];
}

export async function validateCartForCheckout(
  customerId: number,
  token?: string | null,
): Promise<CartValidationResult> {
  const response = await orderApi.get<ApiResponse<CartValidationResult> | CartValidationResult>(
    `/api/Cart/validate?customerId=${customerId}`,
    { headers: getHeaders(token) },
  );

  return readResponseContent<CartValidationResult>(response.data);
}
