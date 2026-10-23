import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  FaBox,
  FaCheckCircle,
  FaClock,
  FaCoins,
  FaFileInvoice,
  FaPrint,
  FaRedo,
  FaSearch,
  FaShoppingBag,
  FaTimes,
  FaTruck,
  FaWarehouse,
  FaUndo,
  FaBalanceScale,
  FaExchangeAlt,
  FaImage,
} from "react-icons/fa";
import { CustomerOrder, UpdateOrderStatusPayload } from "../../Types/Interface/IOrder";
import {
  getSellerOrders,
  updateOrderStatus,
  cancelCustomerOrder,
} from "../../Services/orderService";
import {
  getSellerReturns,
  approveReturn,
  rejectReturn,
  receiveAndRefundReturn,
  arbitrateDispute,
} from "../../Services/returnService";
import { ReturnResponseDto } from "../../Types/Interface/IReturn";
import { useAuth } from "../Login/useAuth";
import { useToast } from "../../Utils/Helper/ToastNotifications";
import OrderTracker from "../../Components/OrderTracker/OrderTracker";
import Loader from "../../Shared/Loader";
import "./SellerOrders.css";

const COURIER_OPTIONS = [
  "BlueDart Express",
  "Delhivery Logistics",
  "FedEx India",
  "DTDC Express",
  "India Post Speed Post",
  "Shadowfax Courier",
  "Ekart Logistics",
  "Other / Custom Carrier",
];

const SellerOrders: React.FC = () => {
  const { showToast } = useToast();
  const { role } = useAuth();
  const isPlatformAdmin = role === "SuperAdministrator" || role === "Administrator";

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Returns & Disputes State
  const [returnsList, setReturnsList] = useState<ReturnResponseDto[]>([]);
  const [returnsLoading, setReturnsLoading] = useState(false);
  const [returnSubFilter, setReturnSubFilter] = useState<string>("ALL");
  const [selectedReturn, setSelectedReturn] = useState<ReturnResponseDto | null>(null);

  // Return review form state
  const [reviewNotes, setReviewNotes] = useState<string>("");
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  const [arbitrationDecision, setArbitrationDecision] = useState<"Refund" | "UpholdRejection">("Refund");
  const [arbitrationNotes, setArbitrationNotes] = useState<string>("");

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [fulfillingOrder, setFulfillingOrder] = useState<CustomerOrder | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<CustomerOrder | null>(null);

  // Fulfillment form state
  const [courier, setCourier] = useState<string>(COURIER_OPTIONS[0]);
  const [customCourier, setCustomCourier] = useState<string>("");
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>("");
  const [cancelReason, setCancelReason] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSellerOrders(activeTab, searchTerm);
      setOrders(data);
    } catch {
      showToast("error", "Failed to fetch merchant orders.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm, showToast]);

  const fetchReturns = useCallback(async () => {
    setReturnsLoading(true);
    try {
      const data = await getSellerReturns(
        returnSubFilter === "ALL" ? undefined : returnSubFilter,
        searchTerm
      );
      setReturnsList(data);
    } catch {
      showToast("error", "Failed to fetch return records.");
    } finally {
      setReturnsLoading(false);
    }
  }, [returnSubFilter, searchTerm, showToast]);

  useEffect(() => {
    if (activeTab === "returns") {
      fetchReturns();
    } else {
      fetchOrders();
    }
  }, [activeTab, fetchOrders, fetchReturns]);

  // KPI Metrics calculation
  const metrics = useMemo(() => {
    const total = orders.length;
    const needsFulfillment = orders.filter((o) => {
      const s = o.status.toLowerCase();
      return s === "paid" || s === "placed" || s === "pending" || s === "processing";
    }).length;
    const inTransit = orders.filter((o) => {
      const s = o.status.toLowerCase();
      return s === "dispatched" || s === "in transit" || s === "shipped";
    }).length;
    const delivered = orders.filter((o) => o.status.toLowerCase() === "delivered").length;
    const revenue = orders
      .filter((o) => o.status.toLowerCase() !== "cancelled")
      .reduce((sum, o) => sum + (o.total || 0), 0);

    return { total, needsFulfillment, inTransit, delivered, revenue };
  }, [orders]);

  // Open Fulfillment Dialog
  const handleOpenFulfillModal = (order: CustomerOrder) => {
    setFulfillingOrder(order);
    setCourier(COURIER_OPTIONS[0]);
    setCustomCourier("");
    // Generate helpful random tracking code suggestion
    const randomAwb = `ST-${order.orderId}-${Math.floor(100000 + Math.random() * 900000)}`;
    setTrackingNumber(randomAwb);

    const etaDate = new Date();
    etaDate.setDate(etaDate.getDate() + 3);
    setEstimatedDelivery(etaDate.toISOString().split("T")[0]);
  };

  // Submit Status Change to Dispatched
  const handleConfirmFulfillment = async () => {
    if (!fulfillingOrder) return;
    const finalCourier =
      courier === "Other / Custom Carrier" ? customCourier.trim() : courier;

    if (!finalCourier) {
      showToast("error", "Please specify a carrier name.");
      return;
    }
    if (!trackingNumber.trim()) {
      showToast("error", "Please enter a tracking / AWB number.");
      return;
    }

    setActionLoading(true);
    try {
      const payload: UpdateOrderStatusPayload = {
        status: "Dispatched",
        courier: finalCourier,
        trackingNumber: trackingNumber.trim(),
        estimatedDeliveryDate: estimatedDelivery ? new Date(estimatedDelivery).toISOString() : undefined,
      };

      const updated = await updateOrderStatus(fulfillingOrder.orderId, payload);
      showToast("success", `Order #${updated.orderId} dispatched via ${finalCourier}!`);
      setFulfillingOrder(null);
      fetchOrders();
    } catch {
      showToast("error", "Failed to update order fulfillment status.");
    } finally {
      setActionLoading(false);
    }
  };

  // Quick Status Transition (e.g., Mark Processing, Mark Delivered)
  const handleQuickStatusChange = async (orderId: number, nextStatus: string) => {
    try {
      await updateOrderStatus(orderId, { status: nextStatus });
      showToast("success", `Order #${orderId} marked as ${nextStatus}.`);
      fetchOrders();
    } catch {
      showToast("error", `Failed to set status to ${nextStatus}.`);
    }
  };

  // Submit Order Cancellation
  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    setActionLoading(true);
    try {
      await cancelCustomerOrder(cancellingOrder.orderId, cancelReason || "Cancelled by seller");
      showToast("success", `Order #${cancellingOrder.orderId} cancelled and stock restored.`);
      setCancellingOrder(null);
      setCancelReason("");
      fetchOrders();
    } catch {
      showToast("error", "Failed to cancel order.");
    } finally {
      setActionLoading(false);
    }
  };

  // Returns Action Handlers
  const handleOpenReturnModal = (ret: ReturnResponseDto) => {
    setSelectedReturn(ret);
    setReviewNotes("");
    setIsRejecting(false);
    setArbitrationDecision("Refund");
    setArbitrationNotes("");
  };

  const handleApproveReturn = async () => {
    if (!selectedReturn) return;
    try {
      setActionLoading(true);
      const updated = await approveReturn(selectedReturn.returnRequestId, {
        notes: reviewNotes.trim() || undefined,
      });
      showToast(
        "success",
        `Return #${updated.returnRequestId} approved. Customer notified with return instructions.`
      );
      setSelectedReturn(updated);
      fetchReturns();
    } catch (err: any) {
      showToast("error", err?.message || "Failed to approve return request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectReturn = async () => {
    if (!selectedReturn) return;
    if (!reviewNotes.trim()) {
      showToast("error", "Please provide a reason for rejecting this return.");
      return;
    }
    try {
      setActionLoading(true);
      const updated = await rejectReturn(selectedReturn.returnRequestId, reviewNotes.trim());
      showToast("success", `Return #${updated.returnRequestId} rejected.`);
      setSelectedReturn(updated);
      setIsRejecting(false);
      fetchReturns();
    } catch (err: any) {
      showToast("error", err?.message || "Failed to reject return request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReceiveAndRefund = async () => {
    if (!selectedReturn) return;
    try {
      setActionLoading(true);
      const updated = await receiveAndRefundReturn(selectedReturn.returnRequestId, {
        notes: reviewNotes.trim() || undefined,
      });
      showToast(
        "success",
        `Garment receipt confirmed! Product inventory replenished and digital refund of ₹${updated.refundAmount} issued.`
      );
      setSelectedReturn(updated);
      fetchReturns();
    } catch (err: any) {
      showToast("error", err?.message || "Failed to process receipt & refund.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleArbitrateDispute = async () => {
    if (!selectedReturn) return;
    if (!arbitrationNotes.trim()) {
      showToast("error", "Please provide administrative arbitration notes.");
      return;
    }
    try {
      setActionLoading(true);
      const updated = await arbitrateDispute(selectedReturn.returnRequestId, {
        decision: arbitrationDecision,
        decisionNotes: arbitrationNotes.trim(),
      });
      showToast(
        "success",
        `Dispute #${updated.returnRequestId} arbitrated: ${
          arbitrationDecision === "Refund" ? "Refund Granted & Stock Restored" : "Rejection Upheld"
        }.`
      );
      setSelectedReturn(updated);
      fetchReturns();
    } catch (err: any) {
      showToast("error", err?.message || "Failed to arbitrate dispute.");
    } finally {
      setActionLoading(false);
    }
  };

  const getReturnBadgeClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === "requested") return "seller-status-badge--processing";
    if (s === "approved") return "seller-status-badge--dispatched";
    if (s === "received") return "seller-status-badge--in_transit";
    if (s === "refunded") return "seller-status-badge--delivered";
    if (s === "disputed") return "seller-status-badge--paid";
    if (s === "rejected") return "seller-status-badge--cancelled";
    return "seller-status-badge--paid";
  };

  const getStatusBadgeClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === "cancelled") return "seller-status-badge--cancelled";
    if (s === "delivered") return "seller-status-badge--delivered";
    if (s === "dispatched" || s === "shipped") return "seller-status-badge--dispatched";
    if (s === "in transit") return "seller-status-badge--in_transit";
    if (s === "processing") return "seller-status-badge--processing";
    return "seller-status-badge--paid";
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="seller-orders-page">
      {/* Page Header */}
      <div className="seller-orders-header">
        <div>
          <h1 className="seller-orders-header__title">Order Fulfillment Hub</h1>
          <p className="seller-orders-header__desc">
            Manage shipments, update tracking numbers, and fulfill customer purchases.
          </p>
        </div>
        <div className="seller-orders-header__actions">
          <button
            type="button"
            className="btn-refresh"
            onClick={fetchOrders}
            title="Refresh order records"
          >
            <FaRedo /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="seller-kpi-grid">
        <div className="seller-kpi-card">
          <div className="seller-kpi-card__icon seller-kpi-card__icon--blue">
            <FaBox />
          </div>
          <div>
            <div className="seller-kpi-card__val">{metrics.total}</div>
            <div className="seller-kpi-card__label">Total Orders</div>
          </div>
        </div>

        <div className="seller-kpi-card">
          <div className="seller-kpi-card__icon seller-kpi-card__icon--amber">
            <FaClock />
          </div>
          <div>
            <div className="seller-kpi-card__val">{metrics.needsFulfillment}</div>
            <div className="seller-kpi-card__label">Needs Dispatch</div>
          </div>
        </div>

        <div className="seller-kpi-card">
          <div className="seller-kpi-card__icon seller-kpi-card__icon--indigo">
            <FaTruck />
          </div>
          <div>
            <div className="seller-kpi-card__val">{metrics.inTransit}</div>
            <div className="seller-kpi-card__label">In Transit</div>
          </div>
        </div>

        <div className="seller-kpi-card">
          <div className="seller-kpi-card__icon seller-kpi-card__icon--green">
            <FaCheckCircle />
          </div>
          <div>
            <div className="seller-kpi-card__val">{metrics.delivered}</div>
            <div className="seller-kpi-card__label">Delivered</div>
          </div>
        </div>

        <div className="seller-kpi-card">
          <div className="seller-kpi-card__icon seller-kpi-card__icon--slate">
            <FaCoins />
          </div>
          <div>
            <div className="seller-kpi-card__val">₹{metrics.revenue.toLocaleString("en-IN")}</div>
            <div className="seller-kpi-card__label">Gross Revenue</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="seller-toolbar">
        <div className="seller-toolbar__tabs">
          {[
            { id: "all", label: "All Orders" },
            { id: "paid", label: "Paid / Placed" },
            { id: "processing", label: "Processing" },
            { id: "dispatched", label: "Dispatched" },
            { id: "delivered", label: "Delivered" },
            { id: "cancelled", label: "Cancelled" },
            { id: "returns", label: "Returns & Disputes" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`seller-tab-btn ${activeTab === tab.id ? "seller-tab-btn--active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="seller-toolbar__search">
          <FaSearch className="seller-toolbar__search-icon" />
          <input
            type="search"
            className="seller-toolbar__search-input"
            placeholder={
              activeTab === "returns"
                ? "Search returns by ID, customer..."
                : "Search by ID, Customer, AWB..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Card (Orders or Returns) */}
      <div className="seller-table-card">
        {activeTab === "returns" ? (
          <div>
            {/* Returns Sub-Filter Chips */}
            <div className="seller-returns-subfilters">
              {[
                { id: "ALL", label: "All Returns" },
                { id: "Requested", label: "Pending Review" },
                { id: "Approved", label: "Awaiting Item" },
                { id: "Refunded", label: "Refunded & Restocked" },
                { id: "Disputed", label: "Disputes" },
                { id: "Rejected", label: "Rejected" },
              ].map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  className={`seller-subfilter-chip ${
                    returnSubFilter === sub.id ? "seller-subfilter-chip--active" : ""
                  }`}
                  onClick={() => setReturnSubFilter(sub.id)}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {returnsLoading ? (
              <div style={{ padding: "4rem 0" }}>
                <Loader />
              </div>
            ) : returnsList.length === 0 ? (
              <div className="seller-empty-state">
                <FaUndo className="seller-empty-icon" />
                <h3 className="seller-empty-title">No return requests found</h3>
                <p className="seller-empty-sub">
                  {searchTerm
                    ? `No return records matching "${searchTerm}".`
                    : "No return or dispute records for this filter status."}
                </p>
              </div>
            ) : (
              <div className="seller-table-responsive">
                <table className="seller-table">
                  <thead>
                    <tr>
                      <th style={{ width: "12%" }}>Return ID</th>
                      <th style={{ width: "18%" }}>Order & Customer</th>
                      <th style={{ width: "18%" }}>Products</th>
                      <th style={{ width: "10%" }}>Type</th>
                      <th style={{ width: "16%" }}>Reason / Note</th>
                      <th style={{ width: "10%" }}>Status</th>
                      <th style={{ width: "10%" }}>Refund</th>
                      <th style={{ width: "6%", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnsList.map((ret) => {
                      const firstItem = ret.items[0];
                      return (
                        <tr key={ret.returnRequestId}>
                          {/* ID & Date */}
                          <td data-label="Return ID">
                            <div className="seller-order-id-col">
                              <span className="seller-order-id">#RET-{ret.returnRequestId}</span>
                              <span className="seller-order-date">{formatDate(ret.requestedAt)}</span>
                            </div>
                          </td>

                          {/* Customer & Order */}
                          <td data-label="Order & Customer">
                            <div className="seller-customer-name">
                              {ret.customerName || `Customer #${ret.customerId}`}
                            </div>
                            <div className="seller-customer-sub">
                              Order #{ret.orderId} • {ret.customerEmail || "No email"}
                            </div>
                          </td>

                          {/* Products */}
                          <td data-label="Products">
                            <div className="seller-items-preview">
                              {firstItem?.imageUrl ? (
                                <img
                                  src={firstItem.imageUrl}
                                  alt=""
                                  className="seller-item-thumb"
                                />
                              ) : (
                                <div className="seller-item-thumb-fallback">
                                  <FaImage />
                                </div>
                              )}
                              <div>
                                <span className="seller-items-count">
                                  {firstItem?.productName || `Item #${firstItem?.productId}`}
                                  {ret.items.length > 1 && ` +${ret.items.length - 1} more`}
                                </span>
                                <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                                  Qty: {ret.items.reduce((s, it) => s + it.quantity, 0)}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Type */}
                          <td data-label="Type">
                            <span
                              className={`seller-status-badge ${
                                ret.returnType === "Exchange"
                                  ? "seller-status-badge--dispatched"
                                  : "seller-status-badge--paid"
                              }`}
                            >
                              {ret.returnType === "Exchange" ? (
                                <>
                                  <FaExchangeAlt style={{ marginRight: "0.25rem" }} />
                                  <span>Exchange ({ret.exchangeSizeRequested || "Size"})</span>
                                </>
                              ) : (
                                <>
                                  <FaUndo style={{ marginRight: "0.25rem" }} />
                                  <span>Refund</span>
                                </>
                              )}
                            </span>
                          </td>

                          {/* Reason */}
                          <td data-label="Reason / Note" style={{ maxWidth: "220px" }}>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: "0.86rem",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              title={ret.reason}
                            >
                              {ret.reason}
                            </div>
                            {ret.customerNotes && (
                              <div
                                style={{
                                  fontSize: "0.78rem",
                                  color: "#64748b",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                                title={ret.customerNotes}
                              >
                                {ret.customerNotes}
                              </div>
                            )}
                          </td>

                          {/* Status */}
                          <td data-label="Status">
                            <div className={`seller-status-badge ${getReturnBadgeClass(ret.status)}`}>
                              <span className="seller-status-dot" />
                              <span>{ret.status}</span>
                            </div>
                          </td>

                          {/* Amount */}
                          <td data-label="Refund">
                            <strong style={{ color: "#059669", fontWeight: 700 }}>
                              ₹{ret.refundAmount.toLocaleString("en-IN")}
                            </strong>
                          </td>

                          {/* Actions */}
                          <td data-label="Actions" style={{ textAlign: "right" }}>
                            <button
                              type="button"
                              className="btn-action-primary"
                              onClick={() => handleOpenReturnModal(ret)}
                            >
                              Review & Process
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : loading ? (
          <div style={{ padding: "4rem 0" }}>
            <Loader />
          </div>
        ) : orders.length === 0 ? (
          <div className="seller-empty-state">
            <FaWarehouse className="seller-empty-icon" />
            <h3 className="seller-empty-title">No orders found</h3>
            <p className="seller-empty-sub">
              {searchTerm
                ? `No orders match query "${searchTerm}".`
                : "No customer orders matching the selected status filter."}
            </p>
          </div>
        ) : (
          <div className="seller-table-responsive">
            <table className="seller-table">
              <thead>
                <tr>
                  <th style={{ width: "12%" }}>Order ID</th>
                  <th style={{ width: "20%" }}>Customer</th>
                  <th style={{ width: "22%" }}>Products</th>
                  <th style={{ width: "11%" }}>Total</th>
                  <th style={{ width: "11%" }}>Status</th>
                  <th style={{ width: "12%" }}>Fulfillment Info</th>
                  <th style={{ width: "12%", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const items = order.items ?? order.orderItems ?? [];
                  const firstItem = items[0];
                  const s = order.status.toLowerCase();

                  return (
                    <tr key={order.orderId}>
                      {/* ID & Date */}
                      <td data-label="Order ID">
                        <div className="seller-order-id-col">
                          <span className="seller-order-id">#{order.orderId}</span>
                          <span className="seller-order-date">{formatDate(order.orderDate)}</span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td data-label="Customer">
                        <div className="seller-customer-name">
                          {order.customerName || `Customer #${order.customerId}`}
                        </div>
                        <div className="seller-customer-sub" title={order.deliveryAddress}>
                          {order.customerEmail || order.deliveryAddress || "Standard Delivery"}
                        </div>
                      </td>

                      {/* Products */}
                      <td data-label="Products">
                        <div className="seller-items-preview">
                          {firstItem?.imageUrl ? (
                            <img
                              src={firstItem.imageUrl}
                              alt={firstItem.productName}
                              className="seller-item-thumb"
                            />
                          ) : (
                            <div className="seller-item-thumb-fallback">
                              <FaShoppingBag />
                            </div>
                          )}
                          <span className="seller-items-count">
                            {firstItem?.productName || "Product"}
                            {items.length > 1 && ` +${items.length - 1} more`}
                          </span>
                        </div>
                      </td>

                      {/* Price */}
                      <td data-label="Total">
                        <span className="seller-price">₹{order.total.toFixed(2)}</span>
                      </td>

                      {/* Status */}
                      <td data-label="Status">
                        <span className={`seller-status-badge ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>

                      {/* Fulfillment Tracking */}
                      <td data-label="Fulfillment Info">
                        {order.courier ? (
                          <div className="seller-tracking-pill">
                            <span className="seller-tracking-courier">{order.courier}</span>
                            <span className="seller-tracking-num">
                              {order.trackingNumber || "No AWB"}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Unassigned</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td data-label="Actions" style={{ textAlign: "right" }}>
                        <div className="seller-actions-col" style={{ justifyContent: "flex-end" }}>
                          {/* If Paid: Start Processing */}
                          {(s === "paid" || s === "placed" || s === "pending") && (
                            <button
                              type="button"
                              className="btn-action-primary"
                              onClick={() => handleQuickStatusChange(order.orderId, "Processing")}
                            >
                              Process
                            </button>
                          )}

                          {/* If Processing: Dispatch & Track */}
                          {s === "processing" && (
                            <button
                              type="button"
                              className="btn-action-primary"
                              onClick={() => handleOpenFulfillModal(order)}
                            >
                              Dispatch
                            </button>
                          )}

                          {/* If Dispatched: Mark In Transit or Delivered */}
                          {s === "dispatched" && (
                            <>
                              <button
                                type="button"
                                className="btn-action-secondary"
                                onClick={() => handleQuickStatusChange(order.orderId, "In Transit")}
                              >
                                In Transit
                              </button>
                              <button
                                type="button"
                                className="btn-action-primary"
                                onClick={() => handleQuickStatusChange(order.orderId, "Delivered")}
                              >
                                Deliver
                              </button>
                            </>
                          )}

                          {s === "in transit" && (
                            <button
                              type="button"
                              className="btn-action-primary"
                              onClick={() => handleQuickStatusChange(order.orderId, "Delivered")}
                            >
                              Mark Delivered
                            </button>
                          )}

                          {/* View Details Modal */}
                          <button
                            type="button"
                            className="btn-action-secondary"
                            onClick={() => setSelectedOrder(order)}
                            title="View order details and packing slip"
                          >
                            <FaFileInvoice /> Slip
                          </button>

                          {/* Cancel if eligible */}
                          {s !== "delivered" && s !== "cancelled" && (
                            <button
                              type="button"
                              className="btn-action-secondary"
                              style={{ color: "#dc2626", borderColor: "#fecaca" }}
                              onClick={() => setCancellingOrder(order)}
                              title="Cancel order and restore stock"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DISPATCH / FULFILLMENT MODAL */}
      {fulfillingOrder && (
        <div className="seller-modal-backdrop">
          <div className="seller-modal-card">
            <div className="seller-modal-header">
              <h3 className="seller-modal-title">
                Dispatch Order #{fulfillingOrder.orderId}
              </h3>
              <button
                type="button"
                className="seller-modal-close"
                onClick={() => setFulfillingOrder(null)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="seller-modal-body">
              <div className="seller-form-group">
                <label className="seller-form-label">Logistics / Courier Partner</label>
                <select
                  className="seller-form-select"
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                >
                  {COURIER_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {courier === "Other / Custom Carrier" && (
                <div className="seller-form-group">
                  <label className="seller-form-label">Carrier Name</label>
                  <input
                    type="text"
                    className="seller-form-input"
                    placeholder="e.g. Local Courier Express"
                    value={customCourier}
                    onChange={(e) => setCustomCourier(e.target.value)}
                  />
                </div>
              )}

              <div className="seller-form-group">
                <label className="seller-form-label">Tracking / AWB Number</label>
                <input
                  type="text"
                  className="seller-form-input"
                  placeholder="Enter tracking number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>

              <div className="seller-form-group">
                <label className="seller-form-label">Estimated Delivery Date</label>
                <input
                  type="date"
                  className="seller-form-input"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                />
              </div>

              <p style={{ fontSize: "0.82rem", color: "#64748b", margin: "0" }}>
                Confirming will notify <strong>{fulfillingOrder.customerName || "the customer"}</strong> via
                automated email with tracking code and courier dispatch updates.
              </p>
            </div>

            <div className="seller-modal-footer">
              <button
                type="button"
                className="btn-action-secondary"
                onClick={() => setFulfillingOrder(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-action-primary"
                onClick={handleConfirmFulfillment}
                disabled={actionLoading}
              >
                {actionLoading ? "Dispatching..." : "Confirm & Dispatch"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL ORDER MODAL */}
      {cancellingOrder && (
        <div className="seller-modal-backdrop">
          <div className="seller-modal-card">
            <div className="seller-modal-header">
              <h3 className="seller-modal-title" style={{ color: "#dc2626" }}>
                Cancel Order #{cancellingOrder.orderId}
              </h3>
              <button
                type="button"
                className="seller-modal-close"
                onClick={() => setCancellingOrder(null)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="seller-modal-body">
              <p style={{ color: "#334155", fontSize: "0.9rem" }}>
                Are you sure you want to cancel this order? This action will restore all items back to
                available store stock and notify the customer of the cancellation.
              </p>

              <div className="seller-form-group">
                <label className="seller-form-label">Reason for Cancellation</label>
                <textarea
                  className="seller-form-textarea"
                  rows={3}
                  placeholder="e.g. Customer requested cancellation / Item out of stock"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
            </div>

            <div className="seller-modal-footer">
              <button
                type="button"
                className="btn-action-secondary"
                onClick={() => setCancellingOrder(null)}
                disabled={actionLoading}
              >
                Keep Order
              </button>
              <button
                type="button"
                className="btn-action-primary"
                style={{ background: "#dc2626" }}
                onClick={handleConfirmCancel}
                disabled={actionLoading}
              >
                {actionLoading ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER DETAILS & PACKING SLIP MODAL */}
      {selectedOrder && (
        <div className="seller-modal-backdrop">
          <div className="seller-modal-card seller-modal-card--lg">
            <div className="seller-modal-header">
              <div>
                <h3 className="seller-modal-title">
                  Packing Slip — Order #{selectedOrder.orderId}
                </h3>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  Placed on {formatDate(selectedOrder.orderDate)} • Status: {selectedOrder.status}
                </span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <button
                  type="button"
                  className="btn-action-secondary"
                  onClick={() => window.print()}
                  title="Print Packing Slip"
                >
                  <FaPrint /> Print
                </button>
                <button
                  type="button"
                  className="seller-modal-close"
                  onClick={() => setSelectedOrder(null)}
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="seller-modal-body">
              {/* Timeline Stepper */}
              <OrderTracker
                orderId={selectedOrder.orderId}
                initialStatus={selectedOrder.status}
                courier={selectedOrder.courier}
                trackingNumber={selectedOrder.trackingNumber}
                cancellationReason={selectedOrder.cancellationReason}
              />

              {/* Customer & Address Details */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  margin: "1.5rem 0",
                  padding: "1rem",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div>
                  <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#475569", textTransform: "uppercase" }}>
                    Customer Details
                  </h4>
                  <p style={{ margin: "0 0 0.25rem", fontWeight: 700 }}>
                    {selectedOrder.customerName || `Customer ID #${selectedOrder.customerId}`}
                  </p>
                  {selectedOrder.customerEmail && (
                    <p style={{ margin: "0 0 0.25rem", color: "#64748b", fontSize: "0.85rem" }}>
                      Email: {selectedOrder.customerEmail}
                    </p>
                  )}
                  {selectedOrder.customerPhone && (
                    <p style={{ margin: "0", color: "#64748b", fontSize: "0.85rem" }}>
                      Phone: {selectedOrder.customerPhone}
                    </p>
                  )}
                </div>

                <div>
                  <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#475569", textTransform: "uppercase" }}>
                    Delivery Destination
                  </h4>
                  <p style={{ margin: "0", fontSize: "0.85rem", color: "#334155", lineHeight: "1.5" }}>
                    {selectedOrder.deliveryAddress || "Standard residential shipping destination recorded."}
                  </p>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <h4 style={{ margin: "1.5rem 0 0.75rem", fontSize: "0.95rem", fontWeight: 700 }}>
                Package Items ({selectedOrder.items?.length || selectedOrder.orderItems?.length || 0})
              </h4>
              <table className="seller-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th style={{ textAlign: "center" }}>Qty</th>
                    <th style={{ textAlign: "right" }}>Unit Price</th>
                    <th style={{ textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedOrder.items ?? selectedOrder.orderItems ?? []).map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong>{item.productName}</strong>
                        {(item.colorName || item.sizeName) && (
                          <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                            {[item.colorName, item.sizeName].filter(Boolean).join(" • ")}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: "center" }}>{item.quantity}</td>
                      <td style={{ textAlign: "right" }}>₹{item.price.toFixed(2)}</td>
                      <td style={{ textAlign: "right", fontWeight: 700 }}>
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total Summary */}
              <div
                style={{
                  textAlign: "right",
                  marginTop: "1rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid #e2e8f0",
                }}
              >
                {selectedOrder.discount && selectedOrder.discount > 0 ? (
                  <div style={{ fontSize: "0.9rem", color: "#059669", fontWeight: 600, marginBottom: "0.35rem" }}>
                    Coupon Discount ({selectedOrder.couponCode || "PROMO"}): -₹{selectedOrder.discount.toFixed(2)}
                  </div>
                ) : null}
                <span style={{ fontSize: "1rem", color: "#475569" }}>Total Order Amount: </span>
                <strong style={{ fontSize: "1.25rem", color: "#0f172a" }}>
                  ₹{selectedOrder.total.toFixed(2)}
                </strong>
              </div>
            </div>

            <div className="seller-modal-footer">
              <button
                type="button"
                className="btn-action-primary"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RETURN INSPECTION & REVIEW MODAL */}
      {selectedReturn && (
        <div className="seller-modal-backdrop">
          <div className="seller-modal-card seller-modal-card--lg">
            <div className="seller-modal-header">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                  <span className="seller-order-id">RETURN #{selectedReturn.returnRequestId}</span>
                  <div className={`seller-status-badge ${getReturnBadgeClass(selectedReturn.status)}`}>
                    <span className="seller-status-dot" />
                    <span>{selectedReturn.status}</span>
                  </div>
                </div>
                <h3 className="seller-modal-title" style={{ fontSize: "1.25rem" }}>
                  Return for Order #{selectedReturn.orderId}
                </h3>
              </div>
              <button
                type="button"
                className="seller-modal-close"
                onClick={() => setSelectedReturn(null)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="seller-modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
              {/* Customer & Preference Info */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                  padding: "1rem",
                  background: "#f8fafc",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  marginBottom: "1.25rem",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                    Customer
                  </span>
                  <div style={{ fontWeight: 600, color: "#0f172a" }}>
                    {selectedReturn.customerName || `Customer #${selectedReturn.customerId}`}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                    {selectedReturn.customerEmail || "No email"}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                    Requested Date
                  </span>
                  <div style={{ fontWeight: 600, color: "#0f172a" }}>
                    {formatDate(selectedReturn.requestedAt)}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                    Order Date: #{selectedReturn.orderId}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                    Resolution Preference
                  </span>
                  <div style={{ fontWeight: 700, color: "#2563eb" }}>
                    {selectedReturn.returnType === "Exchange"
                      ? `Size Exchange (${selectedReturn.exchangeSizeRequested || "Different Size"})`
                      : "Standard Refund"}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#059669", fontWeight: 600 }}>
                    Refund Value: ₹{selectedReturn.refundAmount.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              {/* Garment Items list */}
              <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.95rem", color: "#0f172a" }}>
                Items Requested for Return ({selectedReturn.items.length})
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
                {selectedReturn.items.map((it) => (
                  <div
                    key={it.returnRequestItemId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.85rem",
                      padding: "0.75rem",
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  >
                    {it.imageUrl ? (
                      <img
                        src={it.imageUrl}
                        alt=""
                        style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "6px" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          background: "#f1f5f9",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#94a3b8",
                        }}
                      >
                        <FaImage />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#0f172a" }}>
                        {it.productName}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                        Product #{it.productId} • Quantity to Return: <strong>{it.quantity}</strong>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                        ₹{it.unitPrice.toFixed(2)} each
                      </div>
                      <strong style={{ fontSize: "0.92rem", color: "#0f172a" }}>
                        ₹{(it.unitPrice * it.quantity).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Claim & Proof Image */}
              <div
                style={{
                  padding: "1rem",
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "10px",
                  marginBottom: "1.25rem",
                }}
              >
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1e40af", marginBottom: "0.25rem" }}>
                  Customer Reason: {selectedReturn.reason}
                </div>
                {selectedReturn.customerNotes && (
                  <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#1e3a8a", lineHeight: 1.4 }}>
                    {selectedReturn.customerNotes}
                  </p>
                )}
                {selectedReturn.proofImageUrl && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1e40af", display: "block" }}>
                      Customer Proof Image:
                    </span>
                    <a
                      href={selectedReturn.proofImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        fontSize: "0.8rem",
                        color: "#2563eb",
                        marginTop: "0.25rem",
                        textDecoration: "underline",
                      }}
                    >
                      <FaImage /> View Attached Photo
                    </a>
                  </div>
                )}
              </div>

              {/* Recorded Notes */}
              {selectedReturn.merchantNotes && (
                <div
                  style={{
                    padding: "0.85rem 1rem",
                    background: "#f8fafc",
                    borderLeft: "3px solid #64748b",
                    borderRadius: "4px",
                    marginBottom: "1.25rem",
                    fontSize: "0.85rem",
                  }}
                >
                  <strong>Merchant Recorded Notes:</strong> {selectedReturn.merchantNotes}
                </div>
              )}

              {selectedReturn.adminNotes && (
                <div
                  style={{
                    padding: "0.85rem 1rem",
                    background: "#f0fdfa",
                    borderLeft: "3px solid #0d9488",
                    borderRadius: "4px",
                    marginBottom: "1.25rem",
                    fontSize: "0.85rem",
                    color: "#134e4a",
                  }}
                >
                  <strong>Administrator Arbitration Notes:</strong> {selectedReturn.adminNotes}
                </div>
              )}

              {/* Dynamic Action Box based on Status */}
              {selectedReturn.status === "Requested" && (
                <div
                  style={{
                    padding: "1rem",
                    background: "#ffffff",
                    border: "1.5px solid #cbd5e1",
                    borderRadius: "10px",
                  }}
                >
                  <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.95rem", color: "#0f172a" }}>
                    Review & Decide Return Request
                  </h4>
                  <p style={{ margin: "0 0 0.75rem", fontSize: "0.82rem", color: "#64748b" }}>
                    Approve with instructions for the customer to ship back, or reject if the request violates your store policy.
                  </p>

                  <div style={{ marginBottom: "0.75rem" }}>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                      {isRejecting ? "Rejection Reason (Required)" : "Instructions / Merchant Notes (Optional)"}
                    </label>
                    <textarea
                      rows={2}
                      className="seller-modal-textarea"
                      placeholder={
                        isRejecting
                          ? "Explain why this return cannot be accepted..."
                          : "e.g., Return approved. Please dispatch garments to Warehouse A..."
                      }
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                    {isRejecting ? (
                      <>
                        <button
                          type="button"
                          className="btn-action-secondary"
                          onClick={() => {
                            setIsRejecting(false);
                            setReviewNotes("");
                          }}
                          disabled={actionLoading}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn-action-primary"
                          style={{ backgroundColor: "#dc2626", borderColor: "#dc2626" }}
                          onClick={handleRejectReturn}
                          disabled={actionLoading || !reviewNotes.trim()}
                        >
                          {actionLoading ? "Rejecting..." : "Confirm Rejection"}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn-action-secondary"
                          style={{ color: "#dc2626", borderColor: "#fecaca" }}
                          onClick={() => {
                            setIsRejecting(true);
                            setReviewNotes("");
                          }}
                          disabled={actionLoading}
                        >
                          Reject Return...
                        </button>
                        <button
                          type="button"
                          className="btn-action-primary"
                          style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
                          onClick={handleApproveReturn}
                          disabled={actionLoading}
                        >
                          {actionLoading ? "Approving..." : "Approve Return"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {selectedReturn.status === "Approved" && (
                <div
                  style={{
                    padding: "1rem",
                    background: "#f0fdf4",
                    border: "1.5px solid #86efac",
                    borderRadius: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                    <FaWarehouse style={{ fontSize: "1.5rem", color: "#16a34a", marginTop: "0.2rem" }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: "0 0 0.25rem", color: "#166534", fontSize: "0.95rem" }}>
                        Confirm Physical Item Receipt & Process Refund
                      </h4>
                      <p style={{ margin: "0 0 0.75rem", fontSize: "0.82rem", color: "#14532d", lineHeight: 1.4 }}>
                        Once you receive the package at your warehouse, click below to confirm receipt. This will
                        automatically restore <strong>+{selectedReturn.items.reduce((s, it) => s + it.quantity, 0)} inventory unit(s)</strong> back
                        to your catalog and trigger an immediate digital refund of <strong>₹{selectedReturn.refundAmount.toFixed(2)}</strong> via Razorpay.
                      </p>

                      <div style={{ marginBottom: "0.75rem" }}>
                        <textarea
                          rows={2}
                          className="seller-modal-textarea"
                          placeholder="Optional warehouse inspection notes (e.g., tags intact, original packaging checked)..."
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                        />
                      </div>

                      <button
                        type="button"
                        className="btn-action-primary"
                        style={{
                          backgroundColor: "#16a34a",
                          borderColor: "#16a34a",
                          padding: "0.6rem 1.25rem",
                          fontWeight: 700,
                        }}
                        onClick={handleReceiveAndRefund}
                        disabled={actionLoading}
                      >
                        {actionLoading ? "Processing Refund..." : "Confirm Receipt & Issue Refund"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {selectedReturn.status === "Disputed" && (
                <div
                  style={{
                    padding: "1rem",
                    background: "#fffbeb",
                    border: "1.5px solid #fde68a",
                    borderRadius: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                    <FaBalanceScale style={{ fontSize: "1.5rem", color: "#d97706", marginTop: "0.2rem" }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: "0 0 0.25rem", color: "#92400e", fontSize: "0.95rem" }}>
                        Platform Dispute Escalation
                      </h4>
                      <p style={{ margin: "0 0 0.75rem", fontSize: "0.82rem", color: "#78350f", lineHeight: 1.4 }}>
                        The customer disputed the rejection of this return.
                      </p>

                      {isPlatformAdmin ? (
                        <div>
                          <div style={{ marginBottom: "0.75rem" }}>
                            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#92400e", marginBottom: "0.25rem" }}>
                              Arbitration Determination:
                            </label>
                            <select
                              value={arbitrationDecision}
                              onChange={(e) => setArbitrationDecision(e.target.value as any)}
                              className="seller-modal-input"
                              style={{ maxWidth: "300px" }}
                            >
                              <option value="Refund">Grant Refund (Restock & Refund)</option>
                              <option value="UpholdRejection">Uphold Seller Rejection</option>
                            </select>
                          </div>

                          <div style={{ marginBottom: "0.75rem" }}>
                            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#92400e", marginBottom: "0.25rem" }}>
                              Arbitration Rationale (Required):
                            </label>
                            <textarea
                              rows={2}
                              className="seller-modal-textarea"
                              placeholder="Explain the administrative ruling (visible to customer and merchant)..."
                              value={arbitrationNotes}
                              onChange={(e) => setArbitrationNotes(e.target.value)}
                            />
                          </div>

                          <button
                            type="button"
                            className="btn-action-primary"
                            style={{
                              backgroundColor: "#d97706",
                              borderColor: "#b45309",
                              padding: "0.6rem 1.25rem",
                              fontWeight: 700,
                            }}
                            onClick={handleArbitrateDispute}
                            disabled={actionLoading || !arbitrationNotes.trim()}
                          >
                            {actionLoading ? "Arbitrating..." : "Submit Administrative Determination"}
                          </button>
                        </div>
                      ) : (
                        <p style={{ margin: 0, fontSize: "0.82rem", color: "#78350f" }}>
                          Platform administrators are currently reviewing the case and inspecting submitted evidence. You will be notified once resolved.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedReturn.status === "Refunded" && (
                <div
                  style={{
                    padding: "1rem",
                    background: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.85rem",
                  }}
                >
                  <FaCheckCircle style={{ fontSize: "1.5rem", color: "#10b981", flexShrink: 0 }} />
                  <div>
                    <h4 style={{ margin: "0 0 0.15rem", color: "#065f46", fontSize: "0.95rem" }}>
                      Refund Completed & Inventory Replenished
                    </h4>
                    <p style={{ margin: 0, fontSize: "0.82rem", color: "#047857" }}>
                      Disbursed Amount: <strong>₹{selectedReturn.refundAmount.toFixed(2)}</strong> • Razorpay Transaction ID:{" "}
                      <code>{selectedReturn.refundTransactionId || "N/A"}</code>
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="seller-modal-footer">
              <button
                type="button"
                className="btn-action-secondary"
                onClick={() => setSelectedReturn(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
