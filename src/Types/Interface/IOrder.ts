export interface OrderItemDetails {
  productId: number;
  productVariantId?: number;
  productName: string;
  productDescription?: string;
  quantity: number;
  price: number;
  colorName?: string;
  sizeName?: string;
  imageUrl?: string;
}

export interface CustomerOrder {
  orderId: number;
  customerId: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  orderDate: string;
  total: number;
  subtotal?: number;
  shippingCost?: number;
  tax?: number;
  status: string;
  deliveryAddress?: string;
  razorpayOrderId?: string;
  paymentId?: string;
  currency?: string;
  trackingNumber?: string;
  courier?: string;
  shippedAt?: string;
  deliveredAt?: string;
  estimatedDeliveryDate?: string;
  cancellationReason?: string;
  couponCode?: string;
  discount?: number;
  items?: OrderItemDetails[];
  orderItems?: OrderItemDetails[];
}

export interface CreateOrderRequest {
  customerId: number;
  orderDate: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  tax: number;
  status: string;
  deliveryAddress: string;
  razorpayOrderId: string;
  paymentId: string;
  currency: string;
  couponCode?: string;
  discount?: number;
  items: OrderItemDetails[];
}

export interface UpdateOrderStatusPayload {
  status: string;
  courier?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  reason?: string;
}

export interface CancelOrderPayload {
  reason?: string;
}

export interface TrackingMilestone {
  key: string;
  title: string;
  description: string;
  timestamp?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface OrderTrackingInfo {
  orderId: number;
  currentStatus: string;
  courier?: string;
  trackingNumber?: string;
  orderDate: string;
  shippedAt?: string;
  deliveredAt?: string;
  estimatedDeliveryDate?: string;
  cancellationReason?: string;
  milestones: TrackingMilestone[];
}
