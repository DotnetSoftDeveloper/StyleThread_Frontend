import React from "react";
import "./StoreAdminPages.css";
import { useAuth } from "../../../Pages/Login/useAuth";
import { useTenant } from "../../../Context/TenantContext";
import { FaSignOutAlt } from "react-icons/fa";

export const StoreAdminProfilePage: React.FC = () => {
  const { email, role, tenantRole, userId, logout } = useAuth();
  const { tenant, activeSlug } = useTenant();

  return (
    <div className="store-admin-page-container">
      <div className="store-admin-page-header">
        <div className="store-admin-page-title-group">
          <h1>Merchant Administrator Profile</h1>
          <p>
            Your account credentials, assigned storefront privileges, and session management.
          </p>
        </div>
      </div>

      <div className="store-admin-card" style={{ maxWidth: "700px" }}>
        <div className="store-admin-card-header">
          <h2 className="store-admin-card-title">Account Details</h2>
        </div>
        <div className="store-admin-card-body" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--brand-teal, #0d9488), var(--brand-teal-dark, #0f766e))",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.85rem",
                fontWeight: 800,
              }}
            >
              {(email || "A")[0].toUpperCase()}
            </div>
            <div>
              <h3 style={{ margin: "0 0 0.25rem", color: "#0f172a", fontSize: "1.25rem" }}>
                {email || "Merchant Administrator"}
              </h3>
              <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                Account ID: <code>{userId || "—"}</code>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", borderTop: "1px solid #e2e8f0", paddingTop: "1.5rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                Assigned Storefront
              </label>
              <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a", marginTop: "0.25rem" }}>
                {tenant?.storeName || activeSlug || "Default Store"}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#0d9488", fontFamily: "monospace" }}>
                /{activeSlug || "default"}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                Effective Platform Role
              </label>
              <div style={{ marginTop: "0.25rem" }}>
                <span className="sa-badge info-required">
                  {tenantRole || role || "StoreAdmin"}
                </span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "1.5rem" }}>
            <button
              onClick={logout}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.65rem 1.25rem",
                borderRadius: "8px",
                border: "1px solid #ef4444",
                backgroundColor: "#fef2f2",
                color: "#ef4444",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              <FaSignOutAlt />
              <span>Sign Out of Store Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreAdminProfilePage;
