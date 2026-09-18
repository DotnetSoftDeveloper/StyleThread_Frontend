export interface RazorpayOrderRequest {
  /** Amount in the currency's smallest unit (paise for INR). */
  amount: number;
  receipt?: string;
  currency?: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  receipt?: string;
}

export interface RazorpayPaymentVerificationRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayPaymentVerificationResponse {
  verified: boolean;
  orderId: string;
  paymentId: string;
}

export interface RazorpayCheckoutResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayCheckoutResponse) => void | Promise<void>;
  modal?: {
    ondismiss: () => void;
  };
  theme?: {
    color: string;
  };
}

export interface RazorpayPaymentFailure {
  error?: {
    description?: string;
    reason?: string;
  };
}

export interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", callback: (response: RazorpayPaymentFailure) => void) => void;
}

export type RazorpayConstructor = new (
  options: RazorpayCheckoutOptions,
) => RazorpayInstance;
