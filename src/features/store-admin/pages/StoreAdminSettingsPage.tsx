import React, { useEffect, useState } from "react";
import "./StoreAdminPages.css";
import { useTenant } from "../../../Context/TenantContext";
import { UpdateTenantSettingsRequest } from "../../../Types/Interface/ITenant";
import { useToast } from "../../../Utils/Helper/ToastNotifications";
import {
  FaPalette,
  FaSave,
  FaBullhorn,
  FaShippingFast,
  FaExternalLinkAlt,
  FaSpinner,
} from "react-icons/fa";

export const StoreAdminSettingsPage: React.FC = () => {
  const { settings, activeSlug, updateSettings } = useTenant();
  const { showToast } = useToast();
  const [saving, setSaving] = useState<boolean>(false);

  const [formData, setFormData] = useState<UpdateTenantSettingsRequest>({
    primaryColor: "#0f766e",
    accentColor: "#ea580c",
    supportEmail: "",
    supportPhone: "",
    heroTitle: "",
    heroSubtitle: "",
    instagramUrl: "",
    facebookUrl: "",
    freeShippingThreshold: 999,
    defaultShippingFee: 50,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        primaryColor: settings.primaryColor || "#0f766e",
        accentColor: settings.accentColor || "#ea580c",
        supportEmail: settings.supportEmail || "",
        supportPhone: settings.supportPhone || "",
        heroTitle: settings.heroTitle || "",
        heroSubtitle: settings.heroSubtitle || "",
        instagramUrl: settings.instagramUrl || "",
        facebookUrl: settings.facebookUrl || "",
        freeShippingThreshold: settings.freeShippingThreshold || 999,
        defaultShippingFee: settings.defaultShippingFee || 50,
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateSettings(formData);
      showToast("success", "Store settings and branding saved successfully!");
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  const effectiveSlug = activeSlug || "default";

  return (
    <div className="store-admin-page-container">
      <div className="store-admin-page-header">
        <div className="store-admin-page-title-group">
          <h1>Store Branding & Visual Configuration</h1>
          <p>
            Customize your store colors, promotional announcements, hero banners, and contact information.
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
            <span>Preview Live Store</span>
          </a>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        {/* Colors & Visual Theme */}
        <div className="store-admin-card">
          <div className="store-admin-card-header">
            <h2 className="store-admin-card-title">
              <FaPalette style={{ color: "#0d9488", marginRight: "0.5rem" }} />
              Theme Colors & Palette
            </h2>
          </div>
          <div className="store-admin-card-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                Primary Brand Color
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="color"
                  value={formData.primaryColor || "#0f766e"}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  style={{ width: "42px", height: "42px", borderRadius: "8px", border: "1px solid #cbd5e1", cursor: "pointer" }}
                />
                <input
                  type="text"
                  value={formData.primaryColor || "#0f766e"}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  style={{ flex: 1, padding: "0.6rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", fontFamily: "monospace" }}
                />
              </div>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Applied to navigation bar, buttons, and headers</span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                Accent Color
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="color"
                  value={formData.accentColor || "#ea580c"}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  style={{ width: "42px", height: "42px", borderRadius: "8px", border: "1px solid #cbd5e1", cursor: "pointer" }}
                />
                <input
                  type="text"
                  value={formData.accentColor || "#ea580c"}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  style={{ flex: 1, padding: "0.6rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", fontFamily: "monospace" }}
                />
              </div>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Applied to sale badges, price highlights, and CTAs</span>
            </div>
          </div>
        </div>

        {/* Hero Banner & Announcement */}
        <div className="store-admin-card">
          <div className="store-admin-card-header">
            <h2 className="store-admin-card-title">
              <FaBullhorn style={{ color: "#ea580c", marginRight: "0.5rem" }} />
              Hero Banner & Social Presence
            </h2>
          </div>
          <div className="store-admin-card-body" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                  Storefront Hero Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Autumn Streetwear Essentials"
                  value={formData.heroTitle || ""}
                  onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                  Storefront Hero Subtitle
                </label>
                <input
                  type="text"
                  placeholder="e.g. Premium handcrafted urban designs made in India."
                  value={formData.heroSubtitle || ""}
                  onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                  Instagram Profile URL
                </label>
                <input
                  type="url"
                  placeholder="https://instagram.com/yourbrand"
                  value={formData.instagramUrl || ""}
                  onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                  Facebook Page URL
                </label>
                <input
                  type="url"
                  placeholder="https://facebook.com/yourbrand"
                  value={formData.facebookUrl || ""}
                  onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Shipping & Support */}
        <div className="store-admin-card">
          <div className="store-admin-card-header">
            <h2 className="store-admin-card-title">
              <FaShippingFast style={{ color: "#3b82f6", marginRight: "0.5rem" }} />
              Shipping Policy & Merchant Support
            </h2>
          </div>
          <div className="store-admin-card-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                Free Shipping Threshold (₹)
              </label>
              <input
                type="number"
                value={formData.freeShippingThreshold || 999}
                onChange={(e) => setFormData({ ...formData, freeShippingThreshold: Number(e.target.value) })}
                style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                Customer Support Email
              </label>
              <input
                type="email"
                placeholder="support@yourbrand.com"
                value={formData.supportEmail || ""}
                onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                Support Phone / WhatsApp
              </label>
              <input
                type="text"
                placeholder="+91 9876543210"
                value={formData.supportPhone || ""}
                onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
                style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
              />
            </div>
          </div>
        </div>

        <div>
          <button type="submit" className="btn-sa-primary" disabled={saving}>
            {saving ? <FaSpinner className="fa-spin" /> : <FaSave />}
            <span>Save Storefront Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default StoreAdminSettingsPage;
