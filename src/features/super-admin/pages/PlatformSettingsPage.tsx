import React, { useState } from "react";
import "./SuperAdminPages.css";
import { useToast } from "../../../Utils/Helper/ToastNotifications";
import {
  FaSlidersH,
  FaShieldAlt,
  FaSave,
  FaCheckCircle,
} from "react-icons/fa";

export const PlatformSettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState({
    platformName: "DukaanOnline",
    defaultCurrency: "INR",
    supportEmail: "support@dukaanonline.com",
    complianceReviewWindowHours: 48,
    enableSelfServiceRegistration: true,
    maintenanceMode: false,
    enforceStrictTenantIsolation: true,
    pciComplianceLevel: "Level 1 Tokenized Gateway",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast("success", "Global platform configurations saved successfully.");
    }, 400);
  };

  return (
    <div className="sa-page-container">
      {/* Header */}
      <div className="sa-page-header">
        <div className="sa-page-title-group">
          <h1>Platform Global Settings</h1>
          <p>
            Configure global defaults, security policies, onboarding parameters, and
            system maintenance options.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        {/* General Settings */}
        <div className="sa-card">
          <div className="sa-card-header">
            <h2 className="sa-card-title">
              <FaSlidersH style={{ color: "#0d9488", marginRight: "0.5rem" }} />
              General Platform Defaults
            </h2>
          </div>
          <div className="sa-card-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                Platform Brand Name
              </label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                Default Platform Currency
              </label>
              <select
                value={settings.defaultCurrency}
                onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
              >
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - United States Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                Platform Escalation Email
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                Review SLA Window (Hours)
              </label>
              <input
                type="number"
                value={settings.complianceReviewWindowHours}
                onChange={(e) => setSettings({ ...settings, complianceReviewWindowHours: Number(e.target.value) })}
                style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
              />
            </div>
          </div>
        </div>

        {/* Security & Multi-Tenancy */}
        <div className="sa-card">
          <div className="sa-card-header">
            <h2 className="sa-card-title">
              <FaShieldAlt style={{ color: "#ea580c", marginRight: "0.5rem" }} />
              Security & Isolation Policies
            </h2>
          </div>
          <div className="sa-card-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "10px" }}>
              <div>
                <strong style={{ color: "#0f172a" }}>Enforce Strict Tenant Isolation</strong>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                  Intercept all database commands with X-Tenant-Slug header validation and SQL query tenant filters.
                </p>
              </div>
              <span className="sa-badge active">
                <FaCheckCircle size={10} /> Active Enforced
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "10px" }}>
              <div>
                <strong style={{ color: "#0f172a" }}>Maintenance Sweep Mode</strong>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                  Temporarily pause checkout and store configuration modifications across all tenants for upgrades.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                style={{ transform: "scale(1.3)", cursor: "pointer" }}
              />
            </div>
          </div>
        </div>

        <div>
          <button type="submit" className="btn-sa-primary" disabled={saving}>
            <FaSave />
            <span>Save Platform Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlatformSettingsPage;
