import React, { useEffect, useState } from "react";
import "./StoreAdminPages.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../Store/ConfigureStore";
import { fetchProducts } from "../../../Store/EntitySlices";
import { Product } from "../../../Types/Interface/IProduct";
import {
  FaSearch,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

interface InventoryItem {
  variantId: number;
  productId: number;
  productTitle: string;
  category: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  inventory: number;
  image: string;
}

export const StoreAdminInventoryPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "LOW" | "OUT">("ALL");

  const productState = useSelector((state: RootState) => state.products);
  const products: Product[] = Array.isArray(productState.list) ? productState.list : [];
  const loading = productState.loading;

  useEffect(() => {
    dispatch(fetchProducts({}));
  }, [dispatch]);

  // Flatten all product variants into SKU items
  const inventoryItems: InventoryItem[] = (products || []).flatMap((product: Product) =>
    (product.productVariants || []).map((v: any) => ({
      variantId: v.productVariantId || 0,
      productId: product.productId || 0,
      productTitle: product.name || "",
      category: (product as any).category || (product as any).categoryName || "",
      sku: v.sku || `SKU-${product.productId}-${v.size}-${v.color}`,
      size: v.size || "",
      color: v.color || "",
      price: v.price || 0,
      inventory: v.inventory ?? 0,
      image: v.productImages?.[0]?.imageUrl || "",
    }))
  );

  const filteredItems = inventoryItems.filter((item: InventoryItem) => {
    const matchesFilter =
      filter === "ALL"
        ? true
        : filter === "LOW"
        ? item.inventory > 0 && item.inventory < 10
        : item.inventory <= 0;

    const matchesSearch =
      !search ||
      item.productTitle.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.color.toLowerCase().includes(search.toLowerCase()) ||
      item.size.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const outOfStockCount = inventoryItems.filter((i: InventoryItem) => i.inventory <= 0).length;
  const lowStockCount = inventoryItems.filter((i: InventoryItem) => i.inventory > 0 && i.inventory < 10).length;
  const healthyCount = inventoryItems.filter((i: InventoryItem) => i.inventory >= 10).length;

  return (
    <div className="store-admin-page-container">
      {/* Header */}
      <div className="store-admin-page-header">
        <div className="store-admin-page-title-group">
          <h1>Inventory Health & Stock Levels</h1>
          <p>
            Monitor real-time SKU stock across sizing variants, track depletion rates,
            and prevent customer stockouts.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="store-admin-stats-grid">
        <div className="store-admin-stat-card">
          <div className="store-admin-stat-icon-wrapper emerald">
            <FaCheckCircle />
          </div>
          <div>
            <div className="store-admin-stat-value">{healthyCount}</div>
            <div className="store-admin-stat-label">Healthy Stock (10+ Units)</div>
          </div>
        </div>

        <div className="store-admin-stat-card">
          <div className="store-admin-stat-icon-wrapper orange">
            <FaExclamationTriangle />
          </div>
          <div>
            <div className="store-admin-stat-value">{lowStockCount}</div>
            <div className="store-admin-stat-label">Low Stock Warning (&lt; 10)</div>
          </div>
        </div>

        <div className="store-admin-stat-card">
          <div className="store-admin-stat-icon-wrapper blue" style={{ color: "#ef4444", backgroundColor: "#fef2f2", borderColor: "#fecaca" }}>
            <FaTimesCircle />
          </div>
          <div>
            <div className="store-admin-stat-value" style={{ color: "#ef4444" }}>
              {outOfStockCount}
            </div>
            <div className="store-admin-stat-label">Out of Stock (0 Units)</div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="store-admin-card">
        <div className="store-admin-card-header">
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => setFilter("ALL")}
              style={{
                padding: "0.4rem 0.85rem",
                borderRadius: "9999px",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                border: filter === "ALL" ? "1px solid #0d9488" : "1px solid #e2e8f0",
                backgroundColor: filter === "ALL" ? "#0d9488" : "#f8fafc",
                color: filter === "ALL" ? "#ffffff" : "#475569",
              }}
            >
              All Variants ({inventoryItems.length})
            </button>
            <button
              onClick={() => setFilter("LOW")}
              style={{
                padding: "0.4rem 0.85rem",
                borderRadius: "9999px",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                border: filter === "LOW" ? "1px solid #ea580c" : "1px solid #e2e8f0",
                backgroundColor: filter === "LOW" ? "#ea580c" : "#f8fafc",
                color: filter === "LOW" ? "#ffffff" : "#475569",
              }}
            >
              Low Stock ({lowStockCount})
            </button>
            <button
              onClick={() => setFilter("OUT")}
              style={{
                padding: "0.4rem 0.85rem",
                borderRadius: "9999px",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                border: filter === "OUT" ? "1px solid #ef4444" : "1px solid #e2e8f0",
                backgroundColor: filter === "OUT" ? "#ef4444" : "#f8fafc",
                color: filter === "OUT" ? "#ffffff" : "#475569",
              }}
            >
              Out of Stock ({outOfStockCount})
            </button>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "0.4rem 0.75rem",
              minWidth: "260px",
            }}
          >
            <FaSearch style={{ color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Search product, SKU, color..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: "0.85rem",
                width: "100%",
              }}
            />
          </div>
        </div>

        <div className="sa-table-responsive">
          <table className="sa-table">
            <thead>
              <tr>
                <th style={{ width: "25%" }}>Product</th>
                <th style={{ width: "15%" }}>SKU</th>
                <th style={{ width: "15%" }}>Variant Spec</th>
                <th style={{ width: "15%" }}>Unit Price</th>
                <th style={{ width: "15%" }}>Stock Quantity</th>
                <th style={{ width: "15%" }}>Inventory Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.variantId}>
                  <td data-label="Product">
                    <strong>{item.productTitle}</strong>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      {item.category || "General"}
                    </div>
                  </td>
                  <td data-label="SKU">
                    <code style={{ color: "#0f766e" }}>{item.sku}</code>
                  </td>
                  <td data-label="Variant Spec">
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Size: {item.size}</span>
                      <span style={{ fontSize: "0.8rem", color: "#64748b" }}>•</span>
                      <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Color: {item.color}</span>
                    </div>
                  </td>
                  <td data-label="Unit Price">
                    <strong>₹{item.price?.toFixed(2)}</strong>
                  </td>
                  <td data-label="Stock Quantity">
                    <strong style={{ fontSize: "1.05rem" }}>{item.inventory}</strong> units
                  </td>
                  <td data-label="Inventory Status">
                    {item.inventory <= 0 ? (
                      <span className="sa-badge rejected">
                        <FaTimesCircle size={10} /> Out of Stock
                      </span>
                    ) : item.inventory < 10 ? (
                      <span className="sa-badge pending">
                        <FaExclamationTriangle size={10} /> Low Stock
                      </span>
                    ) : (
                      <span className="sa-badge active">
                        <FaCheckCircle size={10} /> In Stock
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                    No variants found matching the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StoreAdminInventoryPage;
