export type ReturnStatus =
  | "Requested"
  | "Approved"
  | "Rejected"
  | "Received"
  | "Refunded"
  | "Disputed"
  | "DisputeResolved";

export type ReturnType = "Refund" | "Exchange";

export interface ReturnItemResponseDto {
  returnRequestItemId: number;
  orderItemId: number;
  productId: number;
  productName: string;
  productVariantId?: number | null;
  quantity: number;
  unitPrice: number;
  imageUrl?: string | null;
}

export interface ReturnResponseDto {
  returnRequestId: number;
  tenantId: number;
  orderId: number;
  customerId: number;
  customerName?: string | null;
  customerEmail?: string | null;
  reason: string;
  customerNotes?: string | null;
  proofImageUrl?: string | null;
  returnType: string; // "Refund" or "Exchange"
  status: ReturnStatus;
  refundAmount: number;
  refundTransactionId?: string | null;
  exchangeSizeRequested?: string | null;
  merchantNotes?: string | null;
  adminNotes?: string | null;
  requestedAt: string;
  approvedAt?: string | null;
  receivedAt?: string | null;
  resolvedAt?: string | null;
  items: ReturnItemResponseDto[];
}

export interface CreateReturnItemPayload {
  orderItemId: number;
  productVariantId?: number | null;
  quantity: number;
}

export interface CreateReturnRequestPayload {
  orderId: number;
  reason: string;
  customerNotes?: string;
  proofImageUrl?: string;
  returnType: number; // 1 for Refund, 2 for Exchange
  exchangeSizeRequested?: string;
  items: CreateReturnItemPayload[];
}

export interface ReviewReturnPayload {
  notes?: string;
}

export interface EscalateDisputePayload {
  disputeReason: string;
}

export interface ArbitrateDisputePayload {
  decision: "Refund" | "UpholdRejection";
  decisionNotes: string;
}
