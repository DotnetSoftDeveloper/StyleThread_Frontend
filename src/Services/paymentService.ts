import axios from "axios";
import {
  RazorpayOrderRequest,
  RazorpayOrderResponse,
  RazorpayPaymentVerificationRequest,
  RazorpayPaymentVerificationResponse,
} from "../Types/Interface/Razorpay";

// This matches the current development base URL while allowing Vite deployments
// to configure VITE_API_BASE_URL without putting payment credentials in the client.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "https://localhost:44314";

const paymentApi = axios.create({
  baseURL: apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

export async function createRazorpayOrder(
  request: RazorpayOrderRequest,
): Promise<RazorpayOrderResponse> {
  const response = await paymentApi.post<RazorpayOrderResponse>(
    "/api/Payment/razorpay/orders",
    request,
  );

  return response.data;
}

export async function verifyRazorpayPayment(
  request: RazorpayPaymentVerificationRequest,
): Promise<RazorpayPaymentVerificationResponse> {
  const response = await paymentApi.post<RazorpayPaymentVerificationResponse>(
    "/api/Payment/razorpay/verify",
    request,
  );

  return response.data;
}

export function getPaymentErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback;

  const data = error.response?.data;
  if (typeof data === "object" && data !== null && "message" in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  return fallback;
}
