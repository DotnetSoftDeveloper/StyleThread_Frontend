import React from "react";
import { Link } from "react-router-dom";
import "./StoreAdminPages.css";
import ProductList from "../../../Components/ProductList/ProductList";
import { useTenant } from "../../../Context/TenantContext";
import { FaPlus } from "react-icons/fa";

export const StoreAdminProductsPage: React.FC = () => {
  const { activeSlug } = useTenant();
  const effectiveSlug = activeSlug || "default";

  return (
    <div className="store-admin-page-container">
      <div className="store-admin-page-header">
        <div className="store-admin-page-title-group">
          <h1>Product Catalog</h1>
          <p>
            Manage all active products, variant SKUs, inventory levels, and prices
            for your storefront.
          </p>
        </div>
        <div className="store-admin-header-actions">
          <Link
            to="/admin/products/new"
            className="btn-sa-primary"
          >
            <FaPlus />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      <div className="store-admin-card" style={{ padding: "1rem" }}>
        <ProductList />
      </div>
    </div>
  );
};

export default StoreAdminProductsPage;
