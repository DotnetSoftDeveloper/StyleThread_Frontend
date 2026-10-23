import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FaChartLine,
  FaCoins,
  FaShoppingBag,
  FaStore,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSyncAlt,
  FaPaperPlane,
  FaBoxes,
  FaTrophy,
  FaWarehouse,
  FaCogs,
} from "react-icons/fa";
import {
  PlatformAnalyticsDto,
  SellerAnalyticsDto,
  LowStockItemDto,
  TrendPointDto,
  BackgroundJobStatusDto,
} from "../../Types/Interface/IAnalytics";
import {
  fetchPlatformAnalytics,
  fetchSellerAnalytics,
  fetchLowStockItems,
  triggerStockAlertEmail,
  fetchBackgroundJobStatus,
  triggerBackgroundJobNow,
} from "../../Services/analyticsService";
import { useAuth } from "../Login/useAuth";
import { useTenant } from "../../Context/TenantContext";
import { useToast } from "../../Utils/Helper/ToastNotifications";
import Loader from "../../Shared/Loader";
import "./AnalyticsDashboard.css";

const AnalyticsDashboard: React.FC = () => {
  const { role, token } = useAuth();
  const { tenant } = useTenant();
  const { showToast } = useToast();

  const isSuperAdminOrAdmin = role === "SuperAdministrator" || role === "Administrator";

  // Tab mode: 'platform' or 'store'
  const [activeMode, setActiveMode] = useState<"platform" | "store">(
    isSuperAdminOrAdmin ? "platform" : "store"
  );

  const [loading, setLoading] = useState<boolean>(true);
  const [sendingAlert, setSendingAlert] = useState<boolean>(false);
  const [runningJobNow, setRunningJobNow] = useState<boolean>(false);

  const [platformData, setPlatformData] = useState<PlatformAnalyticsDto | null>(null);
  const [sellerData, setSellerData] = useState<SellerAnalyticsDto | null>(null);
  const [lowStockItems, setLowStockItems] = useState<LowStockItemDto[]>([]);
  const [backgroundJobStatus, setBackgroundJobStatus] = useState<BackgroundJobStatusDto | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const promises: Promise<any>[] = [
        fetchSellerAnalytics(token),
        fetchLowStockItems(token),
      ];

      if (isSuperAdminOrAdmin) {
        promises.push(fetchPlatformAnalytics(token));
        promises.push(fetchBackgroundJobStatus(token));
      }

      const results = await Promise.allSettled(promises);

      // Seller Analytics
      if (results[0].status === "fulfilled") {
        setSellerData(results[0].value);
      }

      // Low Stock Items
      if (results[1].status === "fulfilled") {
        setLowStockItems(results[1].value);
      }

      // Platform Analytics
      if (isSuperAdminOrAdmin && results[2]?.status === "fulfilled") {
        setPlatformData(results[2].value);
      }

      // Background Jobs Status
      if (isSuperAdminOrAdmin && results[3]?.status === "fulfilled") {
        setBackgroundJobStatus(results[3].value);
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  }, [token, isSuperAdminOrAdmin, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Triggering Background Operations Sweep
  const handleRunJobNow = async () => {
    setRunningJobNow(true);
    try {
      const res = await triggerBackgroundJobNow(token);
      if (res.success) {
        showToast("success", res.summary || "Background operations completed successfully!");
        const updated = await fetchBackgroundJobStatus(token);
        setBackgroundJobStatus(updated);
      } else {
        showToast("warning", res.summary || "Background job reported an issue.");
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to trigger background operations.");
    } finally {
      setRunningJobNow(false);
    }
  };

  // Handle Dispatching Low-Stock Alert Digest Email
  const handleTriggerAlertEmail = async () => {
    setSendingAlert(true);
    try {
      const res = await triggerStockAlertEmail(token);
      if (res.success) {
        showToast("success", res.message || "Low-stock alert email sent successfully!");
      } else {
        showToast("warning", res.message || "Could not dispatch alert email.");
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to send stock alert email.");
    } finally {
      setSendingAlert(false);
    }
  };

  // Trend computation for dynamic scaling in chart
  const currentTrend: TrendPointDto[] = useMemo(() => {
    if (activeMode === "platform") {
      return platformData?.monthlyTrend || [];
    }
    return sellerData?.salesTrend || [];
  }, [activeMode, platformData, sellerData]);

  const maxTrendAmount = useMemo(() => {
    if (!currentTrend.length) return 1;
    const maxVal = Math.max(...currentTrend.map((t) => t.amount));
    return maxVal > 0 ? maxVal : 1;
  }, [currentTrend]);

  // Order Status Distribution calculation
  const statusDistribution: Record<string, number> = useMemo(() => {
    if (activeMode === "platform") {
      return platformData?.orderStatusDistribution || {};
    }
    return sellerData?.orderStatusDistribution || {};
  }, [activeMode, platformData, sellerData]);

  const totalStatusOrders = useMemo(() => {
    return Object.values(statusDistribution).reduce((sum, count) => sum + count, 0);
  }, [statusDistribution]);

  const getStatusFillClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "fill-paid";
      case "processing":
        return "fill-processing";
      case "dispatched":
      case "in transit":
        return "fill-dispatched";
      case "delivered":
        return "fill-delivered";
      case "cancelled":
        return "fill-cancelled";
      default:
        return "fill-paid";
    }
  };

  if (loading) {
    return (
      <div className="analytics-dashboard">
        <Loader />
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <div className="analytics-header">
        <div className="analytics-header__left">
          <h1>Business Intelligence & Analytics</h1>
          <p>
            {activeMode === "platform"
              ? "Platform-wide executive metrics, gross merchandise volume & merchant leaderboards."
              : `Store-level performance, daily revenue trends & inventory health for ${
                  tenant?.storeName || "My Store"
                }.`}
          </p>
        </div>

        <div className="analytics-header__actions">
          {lowStockItems.length > 0 && (
            <button
              className="btn-analytics-action btn-analytics-action--warning"
              onClick={handleTriggerAlertEmail}
              disabled={sendingAlert}
              title="Dispatch automated low-stock HTML digest to merchant"
            >
              <FaPaperPlane />
              {sendingAlert ? "Sending Alert..." : "Send Low-Stock Alert"}
            </button>
          )}

          <button
            className="btn-analytics-action btn-analytics-action--secondary"
            onClick={loadData}
            title="Refresh analytics data"
          >
            <FaSyncAlt /> Refresh
          </button>
        </div>
      </div>

      {/* Mode Switcher (For Platform Admins) */}
      {isSuperAdminOrAdmin && (
        <div className="analytics-mode-tabs">
          <button
            className={`analytics-mode-tab ${
              activeMode === "platform" ? "analytics-mode-tab--active" : ""
            }`}
            onClick={() => setActiveMode("platform")}
          >
            <FaChartLine /> Platform Executive BI
          </button>
          <button
            className={`analytics-mode-tab ${
              activeMode === "store" ? "analytics-mode-tab--active" : ""
            }`}
            onClick={() => setActiveMode("store")}
          >
            <FaStore /> Store Performance
          </button>
        </div>
      )}

      {/* Low-Stock Alert Banner if critical items exist */}
      {lowStockItems.length > 0 ? (
        <div className="analytics-alert-banner">
          <div className="analytics-alert-banner__content">
            <FaExclamationTriangle />
            <span>
              <strong>Inventory Alert:</strong> {lowStockItems.length} product SKU variant(s)
              have critically low or depleted inventory (&le; 5 units remaining).
            </span>
          </div>
          <button
            className="btn-analytics-action btn-analytics-action--warning"
            onClick={handleTriggerAlertEmail}
            disabled={sendingAlert}
          >
            <FaPaperPlane /> Dispatch Email Digest
          </button>
        </div>
      ) : (
        <div
          className="analytics-alert-banner"
          style={{ background: "#ecfdf5", borderColor: "#a7f3d0" }}
        >
          <div
            className="analytics-alert-banner__content"
            style={{ color: "#065f46" }}
          >
            <FaCheckCircle />
            <span>
              <strong>Inventory Healthy:</strong> All apparel SKUs maintain healthy stock
              levels (&gt; 5 units). No automated alert needed.
            </span>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      {activeMode === "platform" && platformData && (
        <div className="analytics-kpi-grid">
          <div className="analytics-kpi-card">
            <div className="analytics-kpi-icon analytics-kpi-icon--emerald">
              <FaCoins />
            </div>
            <div className="analytics-kpi-info">
              <span className="analytics-kpi-title">Gross Merchandise Value</span>
              <span className="analytics-kpi-val">
                ₹{platformData.grossMerchandiseValue.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="analytics-kpi-sub">Total across all tenants</span>
            </div>
          </div>

          <div className="analytics-kpi-card">
            <div className="analytics-kpi-icon analytics-kpi-icon--blue">
              <FaChartLine />
            </div>
            <div className="analytics-kpi-info">
              <span className="analytics-kpi-title">Platform Revenue (5%)</span>
              <span className="analytics-kpi-val">
                ₹{platformData.platformRevenue.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="analytics-kpi-sub">Platform take-rate cut</span>
            </div>
          </div>

          <div className="analytics-kpi-card">
            <div className="analytics-kpi-icon analytics-kpi-icon--violet">
              <FaShoppingBag />
            </div>
            <div className="analytics-kpi-info">
              <span className="analytics-kpi-title">Total Orders</span>
              <span className="analytics-kpi-val">{platformData.totalOrders}</span>
              <span className="analytics-kpi-sub">
                {platformData.completedOrders} Delivered &bull; {platformData.cancelledOrders} Cancelled
              </span>
            </div>
          </div>

          <div className="analytics-kpi-card">
            <div className="analytics-kpi-icon analytics-kpi-icon--amber">
              <FaStore />
            </div>
            <div className="analytics-kpi-info">
              <span className="analytics-kpi-title">Merchant Stores</span>
              <span className="analytics-kpi-val">
                {platformData.activeStores} / {platformData.totalStores}
              </span>
              <span className="analytics-kpi-sub">Active / Registered tenants</span>
            </div>
          </div>

          <div className="analytics-kpi-card">
            <div className="analytics-kpi-icon analytics-kpi-icon--rose">
              <FaBoxes />
            </div>
            <div className="analytics-kpi-info">
              <span className="analytics-kpi-title">Apparel Catalog</span>
              <span className="analytics-kpi-val">{platformData.totalProducts}</span>
              <span className="analytics-kpi-sub">
                {platformData.totalStockUnits.toLocaleString()} Stock Units
              </span>
            </div>
          </div>
        </div>
      )}

      {activeMode === "store" && sellerData && (
        <div className="analytics-kpi-grid">
          <div className="analytics-kpi-card">
            <div className="analytics-kpi-icon analytics-kpi-icon--emerald">
              <FaCoins />
            </div>
            <div className="analytics-kpi-info">
              <span className="analytics-kpi-title">Store Revenue</span>
              <span className="analytics-kpi-val">
                ₹{sellerData.totalRevenue.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="analytics-kpi-sub">Excludes cancelled orders</span>
            </div>
          </div>

          <div className="analytics-kpi-card">
            <div className="analytics-kpi-icon analytics-kpi-icon--blue">
              <FaShoppingBag />
            </div>
            <div className="analytics-kpi-info">
              <span className="analytics-kpi-title">Total Orders</span>
              <span className="analytics-kpi-val">{sellerData.totalOrders}</span>
              <span className="analytics-kpi-sub">All-time received</span>
            </div>
          </div>

          <div className="analytics-kpi-card">
            <div className="analytics-kpi-icon analytics-kpi-icon--violet">
              <FaChartLine />
            </div>
            <div className="analytics-kpi-info">
              <span className="analytics-kpi-title">Average Order Value</span>
              <span className="analytics-kpi-val">
                ₹{sellerData.averageOrderValue.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="analytics-kpi-sub">AOV per placed cart</span>
            </div>
          </div>

          <div className="analytics-kpi-card">
            <div className="analytics-kpi-icon analytics-kpi-icon--amber">
              <FaWarehouse />
            </div>
            <div className="analytics-kpi-info">
              <span className="analytics-kpi-title">Active Variants</span>
              <span className="analytics-kpi-val">
                {sellerData.inventoryHealth.totalVariants}
              </span>
              <span className="analytics-kpi-sub">
                {sellerData.inventoryHealth.inStockVariants} in-stock (&gt;5)
              </span>
            </div>
          </div>

          <div className="analytics-kpi-card">
            <div className="analytics-kpi-icon analytics-kpi-icon--rose">
              <FaBoxes />
            </div>
            <div className="analytics-kpi-info">
              <span className="analytics-kpi-title">Low / Out of Stock</span>
              <span className="analytics-kpi-val">
                {sellerData.inventoryHealth.lowStockVariants +
                  sellerData.inventoryHealth.outOfStockVariants}
              </span>
              <span className="analytics-kpi-sub">
                {sellerData.inventoryHealth.outOfStockVariants} completely depleted
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Two-Column Section: Sales Trend & Order Status Distribution */}
      <div className="analytics-two-col">
        {/* Sales Trend Chart */}
        <div className="analytics-card">
          <div className="analytics-card__header">
            <h3 className="analytics-card__title">
              <FaChartLine />
              {activeMode === "platform"
                ? "Monthly Revenue Trend (Last 6 Months)"
                : "Daily Sales Trend (Last 14 Days)"}
            </h3>
            <span className="analytics-card__badge">Revenue (₹)</span>
          </div>

          <div className="analytics-chart-container">
            <div className="analytics-bar-chart">
              {currentTrend.map((point, index) => {
                const heightPercent =
                  point.amount > 0
                    ? Math.max(6, Math.round((point.amount / maxTrendAmount) * 100))
                    : 4;

                return (
                  <div key={index} className="analytics-bar-column">
                    <div className="analytics-chart-tooltip">
                      <span>₹{point.amount.toLocaleString("en-IN")}</span>
                      <span>{point.orderCount} order(s)</span>
                    </div>
                    <div
                      className="analytics-bar"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="analytics-bar-label">{point.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="analytics-card">
          <div className="analytics-card__header">
            <h3 className="analytics-card__title">
              <FaShoppingBag /> Order Status Breakdown
            </h3>
            <span className="analytics-card__badge">{totalStatusOrders} Total</span>
          </div>

          <div className="status-breakdown-list">
            {Object.entries(statusDistribution).map(([status, count]) => {
              const percentage =
                totalStatusOrders > 0
                  ? Math.round((count / totalStatusOrders) * 100)
                  : 0;

              return (
                <div key={status} className="status-breakdown-item">
                  <div className="status-breakdown-row">
                    <span>{status}</span>
                    <span>
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="status-progress-track">
                    <div
                      className={`status-progress-fill ${getStatusFillClass(status)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Platform Mode: Tenant Leaderboard */}
      {activeMode === "platform" && platformData && (
        <div className="analytics-card" style={{ marginBottom: "2rem" }}>
          <div className="analytics-card__header">
            <h3 className="analytics-card__title">
              <FaTrophy style={{ color: "#f59e0b" }} /> Tenant Performance Leaderboard
            </h3>
            <span className="analytics-card__badge">
              {platformData.tenantLeaderboard.length} Stores
            </span>
          </div>

          <div className="analytics-table-container">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Store / Merchant</th>
                  <th>Store Slug</th>
                  <th style={{ textAlign: "right" }}>Total Orders</th>
                  <th style={{ textAlign: "right" }}>Active Products</th>
                  <th style={{ textAlign: "right" }}>Gross Merchandise Value</th>
                </tr>
              </thead>
              <tbody>
                {platformData.tenantLeaderboard.map((tenantItem, index) => (
                  <tr key={tenantItem.tenantId}>
                    <td>
                      <strong>#{index + 1}</strong>
                    </td>
                    <td>
                      <strong>{tenantItem.storeName}</strong>
                    </td>
                    <td>
                      <code>{tenantItem.slug}</code>
                    </td>
                    <td style={{ textAlign: "right" }}>{tenantItem.totalOrders}</td>
                    <td style={{ textAlign: "right" }}>{tenantItem.activeProducts}</td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "#059669" }}>
                      ₹{tenantItem.grossMerchandiseValue.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Platform Mode: Automated Background Operations & Cron Worker */}
      {activeMode === "platform" && (
        <div className="analytics-card" style={{ marginBottom: "2rem" }}>
          <div className="analytics-card__header">
            <h3 className="analytics-card__title">
              <FaCogs style={{ color: "#3b82f6" }} /> Automated Background Operations &amp; Cron Worker
            </h3>
            <span
              className={`stock-badge ${
                backgroundJobStatus?.isRunning
                  ? "stock-badge--low"
                  : backgroundJobStatus?.isEnabled
                  ? "stock-badge--healthy"
                  : "stock-badge--out"
              }`}
            >
              {backgroundJobStatus?.isRunning
                ? "● Running Cycle..."
                : backgroundJobStatus?.isEnabled
                ? "● Scheduled & Active"
                : "● Disabled"}
            </span>
          </div>

          <div className="cron-telemetry-grid">
            <div className="cron-telemetry-item">
              <span className="cron-telemetry-label">Execution Cadence</span>
              <span className="cron-telemetry-val">
                Every {backgroundJobStatus?.intervalHours ?? 24} Hours
              </span>
              <span className="cron-telemetry-sub">Native ASP.NET Core BackgroundService</span>
            </div>
            <div className="cron-telemetry-item">
              <span className="cron-telemetry-label">Last Operations Sweep</span>
              <span className="cron-telemetry-val">
                {backgroundJobStatus?.lastRunUtc
                  ? new Date(backgroundJobStatus.lastRunUtc).toLocaleString()
                  : "Pending Initial Run"}
              </span>
              <span className="cron-telemetry-sub">UTC Timestamp</span>
            </div>
            <div className="cron-telemetry-item">
              <span className="cron-telemetry-label">Next Scheduled Run</span>
              <span className="cron-telemetry-val">
                {backgroundJobStatus?.nextRunUtc
                  ? new Date(backgroundJobStatus.nextRunUtc).toLocaleString()
                  : "N/A"}
              </span>
              <span className="cron-telemetry-sub">Automated Timer Tick</span>
            </div>
            <div className="cron-telemetry-item">
              <span className="cron-telemetry-label">Total Cycles Completed</span>
              <span className="cron-telemetry-val">
                {backgroundJobStatus?.runCount ?? 0}
              </span>
              <span className="cron-telemetry-sub">Operational Sweeps</span>
            </div>
          </div>

          {backgroundJobStatus?.lastExecutionSummary && (
            <div className="cron-summary-banner">
              <FaCheckCircle style={{ color: "#10b981", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong>Latest Run Summary:</strong>
                <p>{backgroundJobStatus.lastExecutionSummary}</p>
              </div>
            </div>
          )}

          {backgroundJobStatus?.lastError && (
            <div className="cron-error-banner">
              <FaExclamationTriangle style={{ color: "#ef4444", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong>Worker Alert:</strong>
                <p>{backgroundJobStatus.lastError}</p>
              </div>
            </div>
          )}

          <div className="cron-action-footer">
            <button
              type="button"
              className="btn-cron-run"
              onClick={handleRunJobNow}
              disabled={runningJobNow || backgroundJobStatus?.isRunning}
            >
              <FaSyncAlt className={runningJobNow ? "spin" : ""} />
              <span>{runningJobNow ? "Running Operations Sweep..." : "Run Operations Sweep Now"}</span>
            </button>
            <span className="cron-action-hint">
              Manually triggers multi-tenant low-stock scans and expired coupon cleanups across all active stores.
            </span>
          </div>
        </div>
      )}

      {/* Store Mode: Top-Selling SKUs */}
      {activeMode === "store" && sellerData && (
        <div className="analytics-card" style={{ marginBottom: "2rem" }}>
          <div className="analytics-card__header">
            <h3 className="analytics-card__title">
              <FaTrophy style={{ color: "#f59e0b" }} /> Top-Selling Apparel SKUs
            </h3>
            <span className="analytics-card__badge">By Gross Revenue</span>
          </div>

          {sellerData.topSellingProducts.length > 0 ? (
            <div className="analytics-table-container">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style={{ textAlign: "right" }}>Units Sold</th>
                    <th style={{ textAlign: "right" }}>Total Revenue</th>
                    <th style={{ textAlign: "right" }}>Remaining Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {sellerData.topSellingProducts.map((p) => (
                    <tr key={p.productId}>
                      <td>
                        <div className="table-product-cell">
                          <img
                            src={p.imageUrl || "/default-image.jpg"}
                            alt={p.productName}
                            className="table-product-thumb"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://placehold.co/80x80/f1f5f9/475569?text=Apparel";
                            }}
                          />
                          <div>
                            <strong>{p.productName}</strong>
                            <div style={{ fontSize: "0.76rem", color: "#64748b" }}>
                              SKU #{p.productId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>
                        {p.unitsSold}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: "#059669" }}>
                        ₹{p.revenue.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <span
                          className={`stock-badge ${
                            p.remainingStock > 5
                              ? "stock-badge--healthy"
                              : p.remainingStock > 0
                              ? "stock-badge--low"
                              : "stock-badge--out"
                          }`}
                        >
                          {p.remainingStock} in stock
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="analytics-empty-state">
              <FaShoppingBag />
              <p>No sales recorded yet for top products ranking.</p>
            </div>
          )}
        </div>
      )}

      {/* Inventory Health & Low-Stock Alert Center */}
      <div className="analytics-card">
        <div className="analytics-card__header">
          <h3 className="analytics-card__title">
            <FaWarehouse /> Inventory Health & Low-Stock Alert Center
          </h3>
          <span className="analytics-card__badge">Threshold: &le; 5 units</span>
        </div>

        {lowStockItems.length > 0 ? (
          <div className="analytics-table-container">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Product / Variant</th>
                  <th>Color</th>
                  <th>Size</th>
                  <th style={{ textAlign: "right" }}>Price</th>
                  <th style={{ textAlign: "right" }}>Stock Status</th>
                  <th style={{ textAlign: "right" }}>Quick Action</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item) => (
                  <tr key={item.productVariantId}>
                    <td>
                      <div className="table-product-cell">
                        <img
                          src={item.imageUrl || "/default-image.jpg"}
                          alt={item.productName}
                          className="table-product-thumb"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://placehold.co/80x80/f1f5f9/475569?text=Item";
                          }}
                        />
                        <div>
                          <strong>{item.productName}</strong>
                          <div style={{ fontSize: "0.76rem", color: "#64748b" }}>
                            Variant #{item.productVariantId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{item.colorName || "Standard"}</td>
                    <td>{item.sizeName || "Universal"}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>
                      ₹{item.price.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span
                        className={`stock-badge ${
                          item.currentInventory === 0
                            ? "stock-badge--out"
                            : "stock-badge--low"
                        }`}
                      >
                        {item.currentInventory === 0
                          ? "Out of Stock (0)"
                          : `CRITICAL: ${item.currentInventory} left`}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link to="/productList" className="link-restock">
                        Restock &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="analytics-empty-state">
            <FaCheckCircle style={{ color: "#10b981" }} />
            <p>All product variants currently have healthy inventory levels (&gt; 5 units).</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
