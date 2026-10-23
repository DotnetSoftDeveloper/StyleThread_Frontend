import React from "react";
import "./StoreAdminPages.css";
import SellerOrders from "../../../Pages/Seller/SellerOrders";

export const StoreAdminOrdersPage: React.FC = () => {
  return (
    <div className="store-admin-page-container">
      <div className="store-admin-page-header">
        <div className="store-admin-page-title-group">
          <h1>Store Orders & Fulfillment</h1>
          <p>
            Process customer purchases, generate invoices, update courier tracking,
            and handle returns and exchanges.
          </p>
        </div>
      </div>

      <div className="store-admin-card" style={{ padding: "0.5rem" }}>
        <SellerOrders />
      </div>
    </div>
  );
};

export default StoreAdminOrdersPage;
