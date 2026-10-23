import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./StoreAdminPages.css";
import { useTenant } from "../../../Context/TenantContext";
import { useAuth } from "../../../Pages/Login/useAuth";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../Store/ConfigureStore";
import { fetchProducts } from "../../../Store/EntitySlices";
import { Product } from "../../../Types/Interface/IProduct";
import {
  FaBoxOpen,
  FaShoppingBag,
  FaPalette,
  FaChartLine,
  FaExternalLinkAlt,
  FaPlus,
  FaCheckCircle,
  FaWarehouse,
  FaArrowRight,
} from "react-icons/fa";

export const StoreAdminDashboard: React.FC = () => {
  const { tenant, activeSlug } = useTenant();
  const { email } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const productState = useSelector((state: RootState) => state.products);
  const products: Product[] = Array.isArray(productState.list) ? productState.list : [];

  const effectiveSlug = activeSlug || "default";
  const storeName = tenant?.storeName || (effectiveSlug !== "default" ? effectiveSlug.replace(/-/g, " ") : "Store");

  useEffect(() => {
    dispatch(fetchProducts({}));
  }, [dispatch, activeSlug]);

  const totalProducts = products.length;
  const totalStock = products.reduce((acc: number, p: Product) => {
    const stock = p.productVariants?.reduce((s: number, v: any) => s + (v.inventory || 0), 0) || 0;
    return acc + stock;
  }, 0);

  const lowStockCount = products.filter((p: Product) => {
    const stock = p.productVariants?.reduce((s: number, v: any) => s + (v.inventory || 0), 0) || 0;
    return stock < 10;
  }).length;

  return (
    <div className="store-admin-page-container">
      {/* Header */}
      <div className="store-admin-page-header">
        <div className="store-admin-page-title-group">
          <h1>{storeName} Overview</h1>
          <p>
            Welcome back, <strong>{email}</strong>. Manage your product catalog, fulfill
            orders, track inventory, and configure store branding.
          </p>
        </div>
        <div className="store-admin-header-actions">
          <a
            href={`/store/${effectiveSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-sa-secondary"
          >
            <FaExternalLinkAlt size={11} />
            <span>View Live Store</span>
          </a>
          <Link to="/admin/products" className="btn-sa-primary">
            <FaPlus />
            <span>Manage Products</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="store-admin-stats-grid">
        <div className="store-admin-stat-card">
          <div className="store-admin-stat-icon-wrapper teal">
            <FaBoxOpen />
          </div>
          <div>
            <div className="store-admin-stat-value">{totalProducts}</div>
            <div className="store-admin-stat-label">Active Products</div>
          </div>
        </div>

        <div className="store-admin-stat-card">
          <div className="store-admin-stat-icon-wrapper blue">
            <FaWarehouse />
          </div>
          <div>
            <div className="store-admin-stat-value">{totalStock}</div>
            <div className="store-admin-stat-label">Total Units in Stock</div>
          </div>
        </div>

        <div className="store-admin-stat-card">
          <div className="store-admin-stat-icon-wrapper orange">
            <FaShoppingBag />
          </div>
          <div>
            <div className="store-admin-stat-value">{lowStockCount}</div>
            <div className="store-admin-stat-label">Low Stock Alerts</div>
          </div>
        </div>

        <div className="store-admin-stat-card">
          <div className="store-admin-stat-icon-wrapper emerald">
            <FaCheckCircle />
          </div>
          <div>
            <div className="store-admin-stat-value">Active</div>
            <div className="store-admin-stat-label">Storefront Status</div>
          </div>
        </div>
      </div>

      {/* Store Quick Actions */}
      <div className="store-admin-card">
        <div className="store-admin-card-header">
          <h2 className="store-admin-card-title">Quick Actions</h2>
        </div>
        <div className="store-admin-card-body" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
          <Link
            to="/admin/products"
            style={{
              padding: "1.25rem",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
              textDecoration: "none",
              color: "#0f172a",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              transition: "transform 0.15s, border-color 0.15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <FaBoxOpen style={{ color: "#0d9488", fontSize: "1.25rem" }} />
              <FaArrowRight size={12} style={{ color: "#94a3b8" }} />
            </div>
            <strong style={{ fontSize: "1rem" }}>Product Catalog</strong>
            <span style={{ fontSize: "0.825rem", color: "#64748b" }}>
              Add new listings, manage variants, upload photos, and update prices.
            </span>
          </Link>

          <Link
            to="/admin/orders"
            style={{
              padding: "1.25rem",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
              textDecoration: "none",
              color: "#0f172a",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              transition: "transform 0.15s, border-color 0.15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <FaShoppingBag style={{ color: "#ea580c", fontSize: "1.25rem" }} />
              <FaArrowRight size={12} style={{ color: "#94a3b8" }} />
            </div>
            <strong style={{ fontSize: "1rem" }}>Orders & Fulfillment</strong>
            <span style={{ fontSize: "0.825rem", color: "#64748b" }}>
              Process incoming customer purchases, mark dispatched, and view manifests.
            </span>
          </Link>

          <Link
            to="/admin/analytics"
            style={{
              padding: "1.25rem",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
              textDecoration: "none",
              color: "#0f172a",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              transition: "transform 0.15s, border-color 0.15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <FaChartLine style={{ color: "#3b82f6", fontSize: "1.25rem" }} />
              <FaArrowRight size={12} style={{ color: "#94a3b8" }} />
            </div>
            <strong style={{ fontSize: "1rem" }}>Sales Analytics</strong>
            <span style={{ fontSize: "0.825rem", color: "#64748b" }}>
              Track revenue velocity, best-performing categories, and growth curves.
            </span>
          </Link>

          <Link
            to="/admin/store-settings"
            style={{
              padding: "1.25rem",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
              textDecoration: "none",
              color: "#0f172a",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              transition: "transform 0.15s, border-color 0.15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <FaPalette style={{ color: "#8b5cf6", fontSize: "1.25rem" }} />
              <FaArrowRight size={12} style={{ color: "#94a3b8" }} />
            </div>
            <strong style={{ fontSize: "1rem" }}>Branding & Settings</strong>
            <span style={{ fontSize: "0.825rem", color: "#64748b" }}>
              Customize brand colors, store logos, banner announcements, and domain.
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StoreAdminDashboard;
