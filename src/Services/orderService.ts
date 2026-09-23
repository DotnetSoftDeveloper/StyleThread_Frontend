import axios from "axios";
import { CreateOrderRequest, CustomerOrder } from "../Types/Interface/IOrder";

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

const getAuthHeaders = (token?: string | null) => (
  token ? { Authorization: `Bearer ${token}` } : undefined
);

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
    { headers: getAuthHeaders(token) },
  );

  return readResponseContent<CustomerOrder>(response.data);
}

export async function getCustomerOrders(token?: string | null): Promise<CustomerOrder[]> {
  const response = await orderApi.get<ApiResponse<CustomerOrder[]> | CustomerOrder[]>(
    "/api/Orders",
    { headers: getAuthHeaders(token) },
  );

  const orders = readResponseContent<CustomerOrder[]>(response.data);
  return Array.isArray(orders) ? orders : [];
}
