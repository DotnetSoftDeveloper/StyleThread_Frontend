import React, { useEffect, useState } from "react";
import "./StoreAdminPages.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../Store/ConfigureStore";
import { fetchDropdowns, fetchProducts } from "../../../Store/EntitySlices";
import { Product } from "../../../Types/Interface/IProduct";
import { FaSearch, FaBoxOpen, FaTag } from "react-icons/fa";

export const StoreAdminCategoriesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [search, setSearch] = useState("");

  const productState = useSelector((state: RootState) => state.products);
  const products: Product[] = Array.isArray(productState.list) ? productState.list : [];
  const dropdownState = useSelector((state: RootState) => state.addProducts);
  const dropdowns = Array.isArray(dropdownState.list) ? dropdownState.list[0] : (dropdownState.list as any);

  useEffect(() => {
    dispatch(fetchDropdowns({}));
    dispatch(fetchProducts({}));
  }, [dispatch]);

  const categories = dropdowns?.categories || [
    { categoryId: 1, name: "Men's Apparel" },
    { categoryId: 2, name: "Women's Apparel" },
    { categoryId: 3, name: "Outerwear & Jackets" },
    { categoryId: 4, name: "Accessories" },
    { categoryId: 5, name: "Footwear" },
  ];

  const getProductCount = (categoryName: string) => {
    return products.filter(
      (p: Product) =>
        (p as any).category?.toLowerCase() === categoryName.toLowerCase() ||
        (p as any).categoryName?.toLowerCase() === categoryName.toLowerCase()
    ).length;
  };

  const filtered = categories.filter((c: any) =>
    (c.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="store-admin-page-container">
      <div className="store-admin-page-header">
        <div className="store-admin-page-title-group">
          <h1>Product Categories</h1>
          <p>
            Organize catalog groupings, navigation hierarchies, and filter tags for your store.
          </p>
        </div>
      </div>

      <div className="store-admin-card">
        <div className="store-admin-card-header">
          <h2 className="store-admin-card-title">Configured Categories ({filtered.length})</h2>
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
              placeholder="Search category name..."
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

        <div style={{ padding: "1.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
          {filtered.map((cat: any) => {
            const count = getProductCount(cat.name);
            return (
              <div
                key={cat.categoryId}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "1.25rem",
                  backgroundColor: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <FaTag style={{ color: "#0d9488" }} size={13} />
                    <strong style={{ fontSize: "1rem", color: "#0f172a" }}>{cat.name}</strong>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>
                    Category ID #{cat.categoryId}
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor: "#f0fdfa",
                    color: "#0f766e",
                    border: "1px solid #99f6e4",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    padding: "0.25rem 0.65rem",
                    borderRadius: "9999px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  <FaBoxOpen size={11} />
                  <span>{count} products</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StoreAdminCategoriesPage;
