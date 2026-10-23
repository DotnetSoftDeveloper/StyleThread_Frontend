import React, { useState } from "react";
import { ReturnResponseDto } from "../../Types/Interface/IReturn";
import { escalateDispute } from "../../Services/returnService";
import { FaTimes, FaBalanceScale, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";

interface DisputeModalProps {
  returnRequest: ReturnResponseDto;
  onClose: () => void;
  onSuccess: (updated: ReturnResponseDto) => void;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  returnRequest,
  onClose,
  onSuccess,
}) => {
  const [disputeReason, setDisputeReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeReason.trim()) {
      setErrorMessage("Please explain why you are disputing this rejection.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      const res = await escalateDispute(returnRequest.returnRequestId, {
        disputeReason: disputeReason.trim(),
      });
      onSuccess(res);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to escalate dispute. Please try again."
      );
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
      aria-labelledby="dispute-modal-title"
    >
      <div className="return-modal-container" style={{ maxWidth: "540px" }}>
        <div className="return-modal-header">
          <div>
            <div
              className="return-modal-badge"
              style={{
                backgroundColor: "#fef3c7",
                color: "#92400e",
                borderColor: "#fde68a",
              }}
            >
              <FaBalanceScale aria-hidden="true" />
              <span>Platform Arbitration</span>
            </div>
            <h2 id="dispute-modal-title" className="return-modal-title">
              Escalate Return Dispute
            </h2>
            <p className="return-modal-subtitle">
              Return Request #{returnRequest.returnRequestId} • Order #{returnRequest.orderId}
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
          <div
            style={{
              padding: "0.85rem 1rem",
              backgroundColor: "#fef2f2",
              border: "1px solid #fee2e2",
              borderRadius: "12px",
              fontSize: "0.85rem",
              color: "#991b1b",
              lineHeight: 1.4,
            }}
          >
            <strong>Seller Rejection Note:</strong>{" "}
            {returnRequest.merchantNotes || "No specific reason provided by merchant."}
          </div>

          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0, lineHeight: 1.5 }}>
            Our platform arbitration team will review your case, inspect the original request,
            and make a binding determination. If approved by administrators, a refund will be
            automatically processed to your original payment method.
          </p>

          <div className="return-field-group">
            <label className="return-field-label" htmlFor="dispute-explanation">
              Why do you disagree with the rejection?
            </label>
            <textarea
              id="dispute-explanation"
              className="return-input-textarea"
              rows={4}
              placeholder="Explain the issue in detail (e.g., item arrived damaged before wear, package was never opened, tags are intact, etc.)..."
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              required
            />
          </div>

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
              style={{
                background: "linear-gradient(135deg, #d97706, #b45309)",
                borderColor: "#b45309",
              }}
              disabled={isSubmitting || !disputeReason.trim()}
            >
              {isSubmitting ? (
                "Escalating..."
              ) : (
                <>
                  <FaCheckCircle aria-hidden="true" />
                  <span>Escalate to Platform Admins</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
