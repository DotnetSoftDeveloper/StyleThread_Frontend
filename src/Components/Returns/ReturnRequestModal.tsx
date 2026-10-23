import React, { useState } from "react";
import { CustomerOrder, OrderItemDetails } from "../../Types/Interface/IOrder";
import {
  ReturnResponseDto,
  CreateReturnItemPayload,
  CreateReturnRequestPayload,
} from "../../Types/Interface/IReturn";
import { createReturnRequest } from "../../Services/returnService";
import {
  FaTimes,
  FaUndo,
  FaExchangeAlt,
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaImage,
} from "react-icons/fa";
import "./ReturnRequestModal.css";

interface ReturnRequestModalProps {
  order: CustomerOrder;
  onClose: () => void;
  onSuccess: (returnReq: ReturnResponseDto) => void;
}

const COMMON_REASONS = [
  "Fit or Sizing Issue",
  "Received Damaged or Defective Item",
  "Item Different from Description / Images",
  "Poor Material / Quality Issue",
  "Received Wrong Item or Color",
  "Arrived Too Late",
  "Changed Mind / No Longer Needed",
];

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({
  order,
  onClose,
  onSuccess,
}) => {
  const items: OrderItemDetails[] = order.items ?? order.orderItems ?? [];

  // Selected items state: map of orderItemId -> quantity to return
  const [selectedItems, setSelectedItems] = useState<{ [orderItemId: number]: number }>(() => {
    // Default select all items with max quantity
    const initial: { [key: number]: number } = {};
    items.forEach((item) => {
      initial[item.productId] = item.quantity; // Note: if orderItemId is available or productId
    });
    return initial;
  });

  const [returnType, setReturnType] = useState<"refund" | "exchange">("refund");
  const [exchangeSize, setExchangeSize] = useState<string>("M");
  const [reason, setReason] = useState<string>(COMMON_REASONS[0]);
  const [customerNotes, setCustomerNotes] = useState<string>("");
  const [proofImageUrl, setProofImageUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleItemSelection = (itemId: number, maxQty: number) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (next[itemId]) {
        delete next[itemId];
      } else {
        next[itemId] = maxQty;
      }
      return next;
    });
  };

  const handleQtyChange = (itemId: number, qty: number, maxQty: number) => {
    const validQty = Math.max(1, Math.min(qty, maxQty));
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: validQty,
    }));
  };

  // Calculate estimated refund for selected items
  const calculatedRefund = items.reduce((sum, item) => {
    const selectedQty = selectedItems[item.productId] || 0;
    return sum + item.price * selectedQty;
  }, 0);

  const selectedCount = Object.keys(selectedItems).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (selectedCount === 0) {
      setErrorMessage("Please select at least one item to return or exchange.");
      return;
    }

    if (returnType === "exchange" && !exchangeSize) {
      setErrorMessage("Please choose your desired replacement size.");
      return;
    }

    try {
      setIsSubmitting(true);

      const itemsPayload: CreateReturnItemPayload[] = [];
      items.forEach((it) => {
        const qty = selectedItems[it.productId];
        if (qty && qty > 0) {
          itemsPayload.push({
            orderItemId: it.productId, // backend maps OrderItem by ID or productId
            productVariantId: it.productVariantId ?? null,
            quantity: qty,
          });
        }
      });

      const payload: CreateReturnRequestPayload = {
        orderId: order.orderId,
        reason,
        customerNotes: customerNotes.trim() || undefined,
        proofImageUrl: proofImageUrl.trim() || undefined,
        returnType: returnType === "exchange" ? 2 : 1,
        exchangeSizeRequested: returnType === "exchange" ? exchangeSize : undefined,
        items: itemsPayload,
      };

      const res = await createReturnRequest(payload);
      onSuccess(res);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit return request. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="return-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="return-modal-title"
    >
      <div className="return-modal-container">
        {/* Modal Header */}
        <div className="return-modal-header">
          <div>
            <div className="return-modal-badge">
              <FaShieldAlt aria-hidden="true" />
              <span>15-Day Return Guarantee</span>
            </div>
            <h2 id="return-modal-title" className="return-modal-title">
              Request Return or Exchange
            </h2>
            <p className="return-modal-subtitle">
              Order #{order.orderId} • Delivered on{" "}
              {order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : "recent date"}
            </p>
          </div>
          <button
            type="button"
            className="return-modal-close"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
          >
            <FaTimes aria-hidden="true" />
          </button>
        </div>

        {errorMessage && (
          <div className="return-modal-error">
            <FaExclamationTriangle aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="return-modal-body">
          {/* Step 1: Return Type Options */}
          <div className="return-field-group">
            <label className="return-field-label">Resolution Preference</label>
            <div className="return-type-cards">
              <button
                type="button"
                className={`return-type-card ${returnType === "refund" ? "is-active" : ""}`}
                onClick={() => setReturnType("refund")}
              >
                <div className="return-type-icon">
                  <FaUndo />
                </div>
                <div className="return-type-info">
                  <strong>Standard Refund</strong>
                  <span>Refund payment back to your original payment method.</span>
                </div>
              </button>

              <button
                type="button"
                className={`return-type-card ${returnType === "exchange" ? "is-active" : ""}`}
                onClick={() => setReturnType("exchange")}
              >
                <div className="return-type-icon">
                  <FaExchangeAlt />
                </div>
                <div className="return-type-info">
                  <strong>Size Exchange</strong>
                  <span>Swap garment size while keeping the same style.</span>
                </div>
              </button>
            </div>
          </div>

          {/* If Size Exchange: choose target size */}
          {returnType === "exchange" && (
            <div className="return-field-group return-size-selection">
              <label className="return-field-label">Preferred Replacement Size</label>
              <div className="return-size-chips">
                {AVAILABLE_SIZES.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    className={`return-size-chip ${exchangeSize === sz ? "is-active" : ""}`}
                    onClick={() => setExchangeSize(sz)}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Item Selection */}
          <div className="return-field-group">
            <div className="return-field-header-row">
              <label className="return-field-label">Select Items to Return</label>
              <span className="return-selection-count">
                {selectedCount} of {items.length} item(s) selected
              </span>
            </div>

            <div className="return-items-list">
              {items.map((it) => {
                const isSelected = !!selectedItems[it.productId];
                const currentQty = selectedItems[it.productId] || 1;

                return (
                  <div
                    key={it.productId}
                    className={`return-item-row ${isSelected ? "is-selected" : ""}`}
                  >
                    <label className="return-item-checkbox-container">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleItemSelection(it.productId, it.quantity)}
                      />
                      <span className="return-item-checkmark" />
                    </label>

                    {it.imageUrl ? (
                      <img
                        src={it.imageUrl}
                        alt={it.productName}
                        className="return-item-img"
                      />
                    ) : (
                      <div className="return-item-img-placeholder">
                        <FaImage />
                      </div>
                    )}

                    <div className="return-item-meta">
                      <span className="return-item-name">{it.productName}</span>
                      <span className="return-item-specs">
                        {it.sizeName ? `Size: ${it.sizeName}` : ""}{" "}
                        {it.colorName ? `• Color: ${it.colorName}` : ""}
                      </span>
                      <strong className="return-item-price">
                        ₹{it.price.toLocaleString("en-IN")}
                      </strong>
                    </div>

                    {isSelected && it.quantity > 1 && (
                      <div className="return-item-qty-control">
                        <label>Qty:</label>
                        <select
                          value={currentQty}
                          onChange={(e) =>
                            handleQtyChange(it.productId, parseInt(e.target.value, 10), it.quantity)
                          }
                        >
                          {Array.from({ length: it.quantity }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Reason */}
          <div className="return-field-group">
            <label className="return-field-label" htmlFor="return-reason-select">
              Reason for Return / Exchange
            </label>
            <select
              id="return-reason-select"
              className="return-input-select"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              {COMMON_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Step 4: Customer Notes */}
          <div className="return-field-group">
            <label className="return-field-label" htmlFor="return-notes">
              Additional Details (Optional)
            </label>
            <textarea
              id="return-notes"
              className="return-input-textarea"
              rows={3}
              placeholder="Please provide any helpful context regarding fit, defects, or reason for return..."
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
            />
          </div>

          {/* Step 5: Proof Image (Optional) */}
          <div className="return-field-group">
            <label className="return-field-label" htmlFor="return-proof-img">
              Proof Image URL (Optional - Recommended for damaged/defective items)
            </label>
            <input
              id="return-proof-img"
              type="url"
              className="return-input-text"
              placeholder="https://example.com/item-photo.jpg"
              value={proofImageUrl}
              onChange={(e) => setProofImageUrl(e.target.value)}
            />
          </div>

          {/* Estimated Refund Summary Banner */}
          {returnType === "refund" && selectedCount > 0 && (
            <div className="return-refund-summary">
              <span>Estimated Refund Amount:</span>
              <strong className="return-refund-val">
                ₹{calculatedRefund.toLocaleString("en-IN")}
              </strong>
            </div>
          )}

          {/* Actions */}
          <div className="return-modal-actions">
            <button
              type="button"
              className="return-btn return-btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="return-btn return-btn-submit"
              disabled={isSubmitting || selectedCount === 0}
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <FaCheckCircle aria-hidden="true" />
                  <span>
                    Submit {returnType === "exchange" ? "Exchange" : "Return"} Request
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
