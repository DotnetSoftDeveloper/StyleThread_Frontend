import React from "react";
import "./StoreAdminPages.css";
import AnalyticsDashboard from "../../../Pages/Analytics/AnalyticsDashboard";

export const StoreAdminAnalyticsPage: React.FC = () => {
  return (
    <div className="store-admin-page-container">
      <div className="store-admin-page-header">
        <div className="store-admin-page-title-group">
          <h1>Sales Analytics & Revenue Metrics</h1>
          <p>
            Track daily gross sales, order conversion velocities, top-selling apparel,
            and low-inventory warning triggers.
          </p>
        </div>
      </div>

      <div className="store-admin-card" style={{ padding: "0.5rem" }}>
        <AnalyticsDashboard />
      </div>
    </div>
  );
};

export default StoreAdminAnalyticsPage;
