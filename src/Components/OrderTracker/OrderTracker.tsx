import React, { useEffect, useState } from "react";
import {
  FaCheck,
  FaTruck,
  FaBoxOpen,
  FaTimesCircle,
  FaCalendarCheck,
  FaCopy,
  FaCheckCircle,
} from "react-icons/fa";
import { getOrderTracking } from "../../Services/orderService";
import { OrderTrackingInfo } from "../../Types/Interface/IOrder";
import "./OrderTracker.css";

interface Props {
  orderId: number;
  initialStatus?: string;
  courier?: string;
  trackingNumber?: string;
  cancellationReason?: string;
}

const OrderTracker: React.FC<Props> = ({
  orderId,
  initialStatus,
  courier,
  trackingNumber,
  cancellationReason,
}) => {
  const [tracking, setTracking] = useState<OrderTrackingInfo | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getOrderTracking(orderId)
      .then((data) => {
        if (isMounted) setTracking(data);
      })
      .catch(() => {
        // Fallback to initial props if network fails
      });
    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const status = tracking?.currentStatus || initialStatus || "Paid";
  const isCancelled = status.toLowerCase() === "cancelled";
  const activeCourier = tracking?.courier || courier;
  const activeTrackingNumber = tracking?.trackingNumber || trackingNumber;
  const activeReason = tracking?.cancellationReason || cancellationReason;

  const handleCopy = () => {
    if (activeTrackingNumber) {
      navigator.clipboard.writeText(activeTrackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusTagClass = () => {
    const s = status.toLowerCase();
    if (s === "cancelled") return "order-tracker__status-tag--cancelled";
    if (s === "delivered") return "order-tracker__status-tag--delivered";
    if (s === "dispatched" || s === "shipped") return "order-tracker__status-tag--dispatched";
    if (s === "in transit" || s === "intransit") return "order-tracker__status-tag--in_transit";
    if (s === "processing") return "order-tracker__status-tag--processing";
    return "order-tracker__status-tag--placed";
  };

  const milestones = tracking?.milestones || [];
  const completedCount = milestones.filter((m) => m.isCompleted).length;
  const totalCount = milestones.length > 1 ? milestones.length - 1 : 1;
  const fillPercentage = Math.min(100, Math.max(0, ((completedCount - 1) / totalCount) * 100));

  const formatTime = (ts?: string) => {
    if (!ts) return "";
    try {
      const d = new Date(ts);
      return d.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="order-tracker">
      {/* Header */}
      <div className="order-tracker__header">
        <div className="order-tracker__title-row">
          <FaTruck className="order-tracker__icon" />
          <h4 className="order-tracker__title">Fulfillment & Delivery Progress</h4>
        </div>
        <span className={`order-tracker__status-tag ${getStatusTagClass()}`}>
          {status}
        </span>
      </div>

      {/* Cancelled State */}
      {isCancelled ? (
        <div className="order-tracker__cancelled-box">
          <FaTimesCircle className="order-tracker__cancelled-icon" />
          <div>
            <h5 className="order-tracker__cancelled-title">Order Cancelled</h5>
            <p className="order-tracker__cancelled-desc">
              {activeReason || "This order was cancelled. Items have been restocked to inventory."}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Stepper */}
          <div className="order-tracker__stepper">
            <div className="order-tracker__track-line">
              <div
                className="order-tracker__track-fill"
                style={{ width: `${fillPercentage}%` }}
              />
            </div>

            {milestones.map((m, idx) => (
              <div
                key={m.key}
                className={`order-tracker__step ${
                  m.isCompleted ? "order-tracker__step--completed" : ""
                } ${m.isCurrent ? "order-tracker__step--current" : ""}`}
              >
                <div className="order-tracker__circle">
                  {m.isCompleted ? <FaCheck /> : idx + 1}
                </div>
                <div className="order-tracker__step-title">{m.title}</div>
                {m.timestamp && (
                  <div className="order-tracker__step-time">
                    {formatTime(m.timestamp)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Logistics Courier & Tracking Number Banner */}
          {activeCourier && (
            <div className="order-tracker__dispatch-info">
              <div className="order-tracker__courier-details">
                <FaBoxOpen className="order-tracker__courier-icon" />
                <div>
                  <p className="order-tracker__courier-name">
                    Carrier: {activeCourier}
                  </p>
                  {activeTrackingNumber && (
                    <p className="order-tracker__tracking-num">
                      AWB / Tracking:{" "}
                      <span className="order-tracker__tracking-code">
                        {activeTrackingNumber}
                      </span>
                      <button
                        type="button"
                        className="order-tracker__copy-btn"
                        onClick={handleCopy}
                        title="Copy tracking number"
                      >
                        {copied ? (
                          <>
                            <FaCheckCircle style={{ color: "#10b981" }} /> Copied
                          </>
                        ) : (
                          <>
                            <FaCopy /> Copy
                          </>
                        )}
                      </button>
                    </p>
                  )}
                </div>
              </div>

              {tracking?.estimatedDeliveryDate && (
                <div className="order-tracker__eta">
                  <FaCalendarCheck />
                  <span>
                    Est. Delivery: {formatTime(tracking.estimatedDeliveryDate)}
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrderTracker;
