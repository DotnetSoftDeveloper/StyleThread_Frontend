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
  items: OrderItemDetails[];
}
