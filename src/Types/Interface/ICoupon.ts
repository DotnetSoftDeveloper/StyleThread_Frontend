export interface Coupon {
  couponId: number;
  code: string;
  description: string;
  discountType: number; // 1: Percentage, 2: Fixed
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number | null;
  validUntil: string;
  timesUsed?: number;
  usageLimit?: number | null;
}

export interface ValidateCouponRequest {
  code: string;
  subtotal: number;
}

export interface ValidateCouponResponse {
  couponId: number;
  code: string;
  description: string;
  discountType: number;
  discountValue: number;
  discountAmount: number;
  newSubtotal: number;
}

export interface CreateCouponPayload {
  code: string;
  description?: string;
  discountType: number;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number | null;
  validFrom?: string;
  validUntil?: string;
  usageLimit?: number | null;
}
