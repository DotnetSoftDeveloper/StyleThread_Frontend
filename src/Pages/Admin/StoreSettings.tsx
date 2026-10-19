import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import "./StoreSettings.css";
import { useTenant } from "../../Context/TenantContext";
import { useAuth } from "../Login/useAuth";
import {
  getAllTenants,
  createTenant,
  getStoreRequests,
  submitStoreRequest,
  approveStoreRequest,
  rejectStoreRequest,
} from "../../Services/tenantService";
import {
  Tenant,
  UpdateTenantSettingsRequest,
  CreateTenantRequest,
  StoreRequest,
  CreateStoreRequestDto,
  StoreRequestStatus,
} from "../../Types/Interface/ITenant";
import { useToast } from "../../Utils/Helper/ToastNotifications";
import {
  FaStore,
  FaPalette,
  FaBullhorn,
  FaShippingFast,
  FaSave,
  FaPlus,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaTimes,
  FaLayerGroup,
  FaSpinner,
  FaClipboardList,
  FaCheck,
  FaClock,
  FaBan,
} from "react-icons/fa";
import { Link } from "react-router-dom";

export const StoreSettings: React.FC = () => {
  const { tenant, settings, activeSlug, switchTenant, updateSettings } = useTenant();
  const { role } = useAuth();
  const { showToast } = useToast();

  const isSuperAdmin = role === "SuperAdministrator";
  const isPlatformAdmin = role === "Administrator";

  const [allTenants, setAllTenants] = useState<Tenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    "branding" | "identity" | "hero" | "policies" | "requests"
  >("branding");

  // Onboard new tenant modal state (Super Admin direct creation)
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [creatingTenant, setCreatingTenant] = useState<boolean>(false);
  const [newTenantData, setNewTenantData] = useState<CreateTenantRequest>({
    storeName: "",
    slug: "",
    customDomain: "",
    primaryColor: "#0f172a",
    accentColor: "#2563eb",
    logoUrl: "",
  });

  // Store requests state (Platform Admin request / Super Admin review)
  const [storeRequests, setStoreRequests] = useState<StoreRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState<boolean>(false);
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);
  const [submittingRequest, setSubmittingRequest] = useState<boolean>(false);
  const [newRequestData, setNewRequestData] = useState<CreateStoreRequestDto>({
    storeName: "",
    desiredSlug: "",
    businessDescription: "",
    contactEmail: "",
    contactPhone: "",
  });
  const [reviewModal, setReviewModal] = useState<{
    open: boolean;
    request: StoreRequest | null;
    action: "approve" | "reject";
    notes: string;
  }>({
    open: false,
    request: null,
    action: "approve",
    notes: "",
  });
  const [reviewing, setReviewing] = useState<boolean>(false);

  // Settings form state
  const [formData, setFormData] = useState<UpdateTenantSettingsRequest>({
    primaryColor: "#111827",
    accentColor: "#1d4ed8",
    backgroundColor: "#f8fafc",
    logoUrl: "",
    faviconUrl: "",
    bannerImageUrl: "",
    heroTitle: "",
    heroSubtitle: "",
    supportEmail: "",
    supportPhone: "",
    instagramUrl: "",
    facebookUrl: "",
    currency: "INR",
    freeShippingThreshold: 500,
    defaultShippingFee: 50,
    taxPercentage: 18,
  });

  // Populate form with active tenant's settings
  useEffect(() => {
    if (settings) {
      setFormData({
        primaryColor: settings.primaryColor || "#111827",
        accentColor: settings.accentColor || "#1d4ed8",
        backgroundColor: settings.backgroundColor || "#f8fafc",
        logoUrl: settings.logoUrl || "",
        faviconUrl: settings.faviconUrl || "",
        bannerImageUrl: settings.bannerImageUrl || "",
        heroTitle: settings.heroTitle || "",
        heroSubtitle: settings.heroSubtitle || "",
        supportEmail: settings.supportEmail || "",
        supportPhone: settings.supportPhone || "",
        instagramUrl: settings.instagramUrl || "",
        facebookUrl: settings.facebookUrl || "",
        currency: settings.currency || "INR",
        freeShippingThreshold: settings.freeShippingThreshold ?? 500,
        defaultShippingFee: settings.defaultShippingFee ?? 50,
        taxPercentage: settings.taxPercentage ?? 18,
      });
    }
  }, [settings]);

  // Load all tenants for the switcher dropdown
  useEffect(() => {
    const fetchTenantsList = async () => {
      try {
        setLoadingTenants(true);
        const list = await getAllTenants();
        setAllTenants(list);
      } catch (err) {
        console.warn("Could not fetch full tenant list:", err);
      } finally {
        setLoadingTenants(false);
      }
    };

    fetchTenantsList();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleNewTenantChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "storeName") {
      // Auto-suggest slug from store name if user hasn't explicitly edited slug
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setNewTenantData((prev) => ({
        ...prev,
        storeName: value,
        slug: prev.slug === "" || prev.slug === generatedSlug.slice(0, -1) ? generatedSlug : prev.slug,
      }));
    } else {
      setNewTenantData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateSettings(formData);
      showToast("success", `Store settings updated successfully for "${tenant?.storeName || activeSlug}"!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update store settings";
      showToast("error", msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTenant = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTenantData.storeName.trim() || !newTenantData.slug.trim()) {
      showToast("warning", "Please provide a Store Name and a unique Store Slug.");
      return;
    }

    try {
      setCreatingTenant(true);
      const created = await createTenant({
        ...newTenantData,
        slug: newTenantData.slug.trim().toLowerCase(),
      });
      showToast("success", `New store "${created.storeName}" created successfully!`);
      setAllTenants((prev) => [...prev, created]);
      setShowCreateModal(false);
      // Automatically switch to the newly created store
      await switchTenant(created.slug);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create new store";
      showToast("error", msg);
    } finally {
      setCreatingTenant(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      const list = await getStoreRequests();
      setStoreRequests(list);
    } catch (err) {
      console.warn("Could not fetch store requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const pendingRequestsCount = storeRequests.filter(
    (r) => r.status === StoreRequestStatus.Pending || (r as any).status === 1
  ).length;

  const handleRequestDataChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "storeName") {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setNewRequestData((prev) => ({
        ...prev,
        storeName: value,
        desiredSlug:
          prev.desiredSlug === "" || prev.desiredSlug === generatedSlug.slice(0, -1)
            ? generatedSlug
            : prev.desiredSlug,
      }));
    } else {
      setNewRequestData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmitStoreRequest = async (e: FormEvent) => {
    e.preventDefault();
    if (!newRequestData.storeName.trim() || !newRequestData.desiredSlug.trim()) {
      showToast("warning", "Please provide a Store Name and a Desired Slug.");
      return;
    }

    try {
      setSubmittingRequest(true);
      const created = await submitStoreRequest({
        ...newRequestData,
        desiredSlug: newRequestData.desiredSlug.trim().toLowerCase(),
      });
      showToast("success", `Store request for "${created.storeName}" submitted successfully!`);
      setShowRequestModal(false);
      setNewRequestData({
        storeName: "",
        desiredSlug: "",
        businessDescription: "",
        contactEmail: "",
        contactPhone: "",
      });
      await fetchRequests();
      setActiveTab("requests");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit store request";
      showToast("error", msg);
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleReviewAction = async (e: FormEvent) => {
    e.preventDefault();
    if (!reviewModal.request) return;

    try {
      setReviewing(true);
      if (reviewModal.action === "approve") {
        await approveStoreRequest(
          reviewModal.request.storeRequestId,
          reviewModal.notes
        );
        showToast(
          "success",
          `Store "${reviewModal.request.storeName}" has been approved and provisioned!`
        );
        const updatedTenants = await getAllTenants();
        setAllTenants(updatedTenants);
      } else {
        await rejectStoreRequest(
          reviewModal.request.storeRequestId,
          reviewModal.notes
        );
        showToast(
          "info",
          `Store request for "${reviewModal.request.storeName}" has been rejected.`
        );
      }
      setReviewModal({ open: false, request: null, action: "approve", notes: "" });
      await fetchRequests();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to review store request";
      showToast("error", msg);
    } finally {
      setReviewing(false);
    }
  };

  const handleTenantSwitch = async (slug: string) => {
    if (slug === activeSlug) return;
    try {
      await switchTenant(slug);
      showToast("info", `Switched active storefront to: ${slug}`);
    } catch (err) {
      showToast("error", `Could not switch to store "${slug}"`);
    }
  };

  return (
    <div className="store-settings-page">
      {/* Page Header */}
      <div className="store-settings-header">
        <div className="store-settings-header__title-block">
          <div className="store-settings-header__badge">
            <FaLayerGroup /> Multi-Tenant Merchant Portal
          </div>
          <h1 className="store-settings-header__title">Store Branding & Customization</h1>
          <p className="store-settings-header__subtitle">
            Configure visual themes, custom logos, hero banners, and shipping policies for your storefront.
          </p>
        </div>

        {/* Tenant Switcher & Actions */}
        <div className="store-settings-header__actions">
          <div className="tenant-picker">
            <label className="tenant-picker__label" htmlFor="tenant-select">
              Active Store:
            </label>
            <select
              id="tenant-select"
              className="tenant-picker__select"
              value={activeSlug}
              disabled={loadingTenants}
              onChange={(e) => handleTenantSwitch(e.target.value)}
            >
              <option value="default">Default Store (Style Thread)</option>
              {allTenants
                .filter((t) => t.slug !== "default")
                .map((t) => (
                  <option key={t.tenantId} value={t.slug}>
                    {t.storeName} ({t.slug})
                  </option>
                ))}
            </select>
          </div>

          {isSuperAdmin && (
            <button
              type="button"
              className="store-settings-btn store-settings-btn--secondary"
              onClick={() => setShowCreateModal(true)}
              title="Provision a new store directly (Super Admin)"
            >
              <FaPlus /> <span>Direct Onboard Store</span>
            </button>
          )}

          {isPlatformAdmin && (
            <button
              type="button"
              className="store-settings-btn store-settings-btn--secondary"
              onClick={() => setShowRequestModal(true)}
              title="Apply for a new store to Super Admin"
            >
              <FaPlus /> <span>Request New Store</span>
            </button>
          )}

          <Link
            to={`/home?tenant=${activeSlug}`}
            target="_blank"
            className="store-settings-btn store-settings-btn--preview"
          >
            <FaExternalLinkAlt /> <span>View Storefront</span>
          </Link>
        </div>
      </div>

      {/* Main Settings Container */}
      <div className="store-settings-layout">
        {/* Navigation Tabs */}
        <nav className="store-settings-nav" aria-label="Settings Sections">
          <button
            type="button"
            className={`store-settings-nav__item ${activeTab === "branding" ? "active" : ""}`}
            onClick={() => setActiveTab("branding")}
          >
            <FaPalette />
            <span>Theme & Colors</span>
          </button>
          <button
            type="button"
            className={`store-settings-nav__item ${activeTab === "hero" ? "active" : ""}`}
            onClick={() => setActiveTab("hero")}
          >
            <FaBullhorn />
            <span>Hero & Banner</span>
          </button>
          <button
            type="button"
            className={`store-settings-nav__item ${activeTab === "identity" ? "active" : ""}`}
            onClick={() => setActiveTab("identity")}
          >
            <FaStore />
            <span>Store Profile</span>
          </button>
          <button
            type="button"
            className={`store-settings-nav__item ${activeTab === "policies" ? "active" : ""}`}
            onClick={() => setActiveTab("policies")}
          >
            <FaShippingFast />
            <span>Shipping & Taxes</span>
          </button>
          <button
            type="button"
            className={`store-settings-nav__item ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            <FaClipboardList />
            <span>{isSuperAdmin ? "Store Requests" : "My Requests"}</span>
            {isSuperAdmin && pendingRequestsCount > 0 && (
              <span className="requests-count-badge">{pendingRequestsCount}</span>
            )}
          </button>
        </nav>

        {/* Settings Form Body */}
        <form className="store-settings-content" onSubmit={handleSaveSettings}>
          {/* 1. Theme & Colors Tab */}
          {activeTab === "branding" && (
            <div className="store-settings-panel">
              <div className="store-settings-panel__header">
                <h2>Visual Theme & Branding</h2>
                <p>Customize the color scheme and logos that shoppers see across your entire storefront.</p>
              </div>

              <div className="store-settings-grid">
                {/* Primary Color */}
                <div className="store-settings-field">
                  <label htmlFor="primaryColor">Primary Brand Color</label>
                  <span className="field-hint">Used for headers, primary buttons, and key brand elements.</span>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      id="primaryColorPicker"
                      name="primaryColor"
                      value={formData.primaryColor || "#111827"}
                      onChange={handleInputChange}
                      className="color-picker-box"
                    />
                    <input
                      type="text"
                      id="primaryColor"
                      name="primaryColor"
                      value={formData.primaryColor || ""}
                      onChange={handleInputChange}
                      placeholder="#111827"
                      className="store-settings-input"
                    />
                  </div>
                </div>

                {/* Accent Color */}
                <div className="store-settings-field">
                  <label htmlFor="accentColor">Accent Highlight Color</label>
                  <span className="field-hint">Used for links, active badges, and accent buttons.</span>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      id="accentColorPicker"
                      name="accentColor"
                      value={formData.accentColor || "#1d4ed8"}
                      onChange={handleInputChange}
                      className="color-picker-box"
                    />
                    <input
                      type="text"
                      id="accentColor"
                      name="accentColor"
                      value={formData.accentColor || ""}
                      onChange={handleInputChange}
                      placeholder="#1d4ed8"
                      className="store-settings-input"
                    />
                  </div>
                </div>

                {/* Background Color */}
                <div className="store-settings-field">
                  <label htmlFor="backgroundColor">Page Background Color</label>
                  <span className="field-hint">Background canvas for product catalog and main views.</span>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      id="backgroundColorPicker"
                      name="backgroundColor"
                      value={formData.backgroundColor || "#f8fafc"}
                      onChange={handleInputChange}
                      className="color-picker-box"
                    />
                    <input
                      type="text"
                      id="backgroundColor"
                      name="backgroundColor"
                      value={formData.backgroundColor || ""}
                      onChange={handleInputChange}
                      placeholder="#f8fafc"
                      className="store-settings-input"
                    />
                  </div>
                </div>

                {/* Logo URL */}
                <div className="store-settings-field">
                  <label htmlFor="logoUrl">Brand Logo URL</label>
                  <span className="field-hint">Public image URL displayed in the top navigation bar.</span>
                  <input
                    type="url"
                    id="logoUrl"
                    name="logoUrl"
                    value={formData.logoUrl || ""}
                    onChange={handleInputChange}
                    placeholder="https://example.com/logo.png"
                    className="store-settings-input"
                  />
                  {formData.logoUrl && (
                    <div className="media-preview-box">
                      <span className="media-preview-label">Logo Preview:</span>
                      <img
                        src={formData.logoUrl}
                        alt="Logo preview"
                        className="logo-preview-img"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Favicon URL */}
                <div className="store-settings-field">
                  <label htmlFor="faviconUrl">Store Favicon URL</label>
                  <span className="field-hint">Browser tab icon (16x16 or 32x32 PNG/ICO).</span>
                  <input
                    type="url"
                    id="faviconUrl"
                    name="faviconUrl"
                    value={formData.faviconUrl || ""}
                    onChange={handleInputChange}
                    placeholder="https://example.com/favicon.ico"
                    className="store-settings-input"
                  />
                </div>
              </div>

              {/* Live Interactive Palette Preview Card */}
              <div className="live-preview-card">
                <div className="live-preview-card__header">
                  <span className="live-preview-tag">Live Component Theme Preview</span>
                  <span className="live-preview-info">
                    Previewing {tenant?.storeName || activeSlug}
                  </span>
                </div>
                <div
                  className="live-preview-card__stage"
                  style={{ backgroundColor: formData.backgroundColor || "#f8fafc" }}
                >
                  <div
                    className="preview-navbar"
                    style={{ backgroundColor: formData.primaryColor || "#111827" }}
                  >
                    <div className="preview-nav-brand">
                      {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt="logo" className="preview-mini-logo" />
                      ) : (
                        <span className="preview-logo-placeholder">✦</span>
                      )}
                      <span>{tenant?.storeName || "My Clothing Brand"}</span>
                    </div>
                    <div className="preview-nav-links">
                      <span>Home</span>
                      <span>Catalog</span>
                      <span style={{ color: formData.accentColor || "#38bdf8" }}>New Drops</span>
                    </div>
                  </div>

                  <div className="preview-body">
                    <div className="preview-card-item">
                      <div className="preview-card-thumb" />
                      <h4>Signature Linen Shirt</h4>
                      <div className="preview-card-footer">
                        <span className="preview-price">₹1,499</span>
                        <button
                          type="button"
                          className="preview-btn-accent"
                          style={{ backgroundColor: formData.accentColor || "#1d4ed8" }}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>

                    <div className="preview-card-item">
                      <div className="preview-card-thumb" />
                      <h4>Slim Chino Trouser</h4>
                      <div className="preview-card-footer">
                        <span className="preview-price">₹2,199</span>
                        <button
                          type="button"
                          className="preview-btn-primary"
                          style={{ backgroundColor: formData.primaryColor || "#111827" }}
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Hero & Banner Tab */}
          {activeTab === "hero" && (
            <div className="store-settings-panel">
              <div className="store-settings-panel__header">
                <h2>Hero Section & Promo Banners</h2>
                <p>Craft a compelling headline and upload striking campaign banners for your storefront home page.</p>
              </div>

              <div className="store-settings-grid">
                {/* Hero Title */}
                <div className="store-settings-field full-width">
                  <label htmlFor="heroTitle">Hero Headline</label>
                  <span className="field-hint">The main headline shoppers see when landing on your store.</span>
                  <input
                    type="text"
                    id="heroTitle"
                    name="heroTitle"
                    value={formData.heroTitle || ""}
                    onChange={handleInputChange}
                    placeholder="e.g. Redefine Your Everyday Style"
                    className="store-settings-input"
                  />
                </div>

                {/* Hero Subtitle */}
                <div className="store-settings-field full-width">
                  <label htmlFor="heroSubtitle">Hero Subtitle</label>
                  <span className="field-hint">Supporting description highlighting fabric quality and brand values.</span>
                  <textarea
                    id="heroSubtitle"
                    name="heroSubtitle"
                    rows={3}
                    value={formData.heroSubtitle || ""}
                    onChange={handleInputChange}
                    placeholder="e.g. Curated contemporary apparel designed for comfort, confidence, and effortless elegance."
                    className="store-settings-textarea"
                  />
                </div>

                {/* Banner Image URL */}
                <div className="store-settings-field full-width">
                  <label htmlFor="bannerImageUrl">Banner Image URL</label>
                  <span className="field-hint">Recommended resolution: 1200x800 or 1600x900.</span>
                  <input
                    type="url"
                    id="bannerImageUrl"
                    name="bannerImageUrl"
                    value={formData.bannerImageUrl || ""}
                    onChange={handleInputChange}
                    placeholder="https://images.unsplash.com/photo-1441986300917-64674bd600d8"
                    className="store-settings-input"
                  />
                  {formData.bannerImageUrl && (
                    <div className="banner-preview-box">
                      <span className="media-preview-label">Banner Preview:</span>
                      <img
                        src={formData.bannerImageUrl}
                        alt="Hero Banner Preview"
                        className="banner-preview-img"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. Store Identity Tab */}
          {activeTab === "identity" && (
            <div className="store-settings-panel">
              <div className="store-settings-panel__header">
                <h2>Store Profile & Contact Information</h2>
                <p>Public contact details shown in the storefront footer and order receipts.</p>
              </div>

              <div className="store-settings-grid">
                <div className="store-settings-field">
                  <label>Store Name</label>
                  <input
                    type="text"
                    disabled
                    value={tenant?.storeName || ""}
                    className="store-settings-input disabled"
                    title="Store name is managed via Tenant registration"
                  />
                  <span className="field-hint">Brand name registered for this tenant.</span>
                </div>

                <div className="store-settings-field">
                  <label>Store Identifier (Slug)</label>
                  <input
                    type="text"
                    disabled
                    value={activeSlug}
                    className="store-settings-input disabled"
                  />
                  <span className="field-hint">Used in URLs: ?tenant={activeSlug} or {activeSlug}.yourdomain.com</span>
                </div>

                <div className="store-settings-field">
                  <label htmlFor="supportEmail">Customer Support Email</label>
                  <input
                    type="email"
                    id="supportEmail"
                    name="supportEmail"
                    value={formData.supportEmail || ""}
                    onChange={handleInputChange}
                    placeholder="support@yourbrand.com"
                    className="store-settings-input"
                  />
                </div>

                <div className="store-settings-field">
                  <label htmlFor="supportPhone">Customer Support Phone</label>
                  <input
                    type="tel"
                    id="supportPhone"
                    name="supportPhone"
                    value={formData.supportPhone || ""}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    className="store-settings-input"
                  />
                </div>

                <div className="store-settings-field">
                  <label htmlFor="instagramUrl">Instagram Profile URL</label>
                  <input
                    type="url"
                    id="instagramUrl"
                    name="instagramUrl"
                    value={formData.instagramUrl || ""}
                    onChange={handleInputChange}
                    placeholder="https://instagram.com/yourbrand"
                    className="store-settings-input"
                  />
                </div>

                <div className="store-settings-field">
                  <label htmlFor="facebookUrl">Facebook Page URL</label>
                  <input
                    type="url"
                    id="facebookUrl"
                    name="facebookUrl"
                    value={formData.facebookUrl || ""}
                    onChange={handleInputChange}
                    placeholder="https://facebook.com/yourbrand"
                    className="store-settings-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. Shipping & Taxes Tab */}
          {activeTab === "policies" && (
            <div className="store-settings-panel">
              <div className="store-settings-panel__header">
                <h2>Commerce, Shipping & Tax Rules</h2>
                <p>Define shipping fees, free delivery qualifications, and tax percentages.</p>
              </div>

              <div className="store-settings-grid">
                <div className="store-settings-field">
                  <label htmlFor="currency">Storefront Currency</label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency || "INR"}
                    onChange={handleInputChange}
                    className="store-settings-input"
                  >
                    <option value="INR">INR (₹ - Indian Rupee)</option>
                    <option value="USD">USD ($ - US Dollar)</option>
                    <option value="EUR">EUR (€ - Euro)</option>
                    <option value="GBP">GBP (£ - British Pound)</option>
                  </select>
                </div>

                <div className="store-settings-field">
                  <label htmlFor="freeShippingThreshold">Free Shipping Minimum Cart Value</label>
                  <span className="field-hint">Orders meeting or exceeding this amount receive free delivery.</span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    id="freeShippingThreshold"
                    name="freeShippingThreshold"
                    value={formData.freeShippingThreshold ?? 500}
                    onChange={handleInputChange}
                    className="store-settings-input"
                  />
                </div>

                <div className="store-settings-field">
                  <label htmlFor="defaultShippingFee">Standard Shipping Fee</label>
                  <span className="field-hint">Applied to orders below the free shipping threshold.</span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    id="defaultShippingFee"
                    name="defaultShippingFee"
                    value={formData.defaultShippingFee ?? 50}
                    onChange={handleInputChange}
                    className="store-settings-input"
                  />
                </div>

                <div className="store-settings-field">
                  <label htmlFor="taxPercentage">Tax Percentage (%)</label>
                  <span className="field-hint">GST or sales tax rate applied to products.</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    id="taxPercentage"
                    name="taxPercentage"
                    value={formData.taxPercentage ?? 18}
                    onChange={handleInputChange}
                    className="store-settings-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. Store Access Requests Tab */}
          {activeTab === "requests" && (
            <div className="store-settings-panel">
              <div
                className="store-settings-panel__header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <h2>
                    {isSuperAdmin
                      ? "Store Access & Provisioning Requests"
                      : "My Store Access Requests"}
                  </h2>
                  <p>
                    {isSuperAdmin
                      ? "Review and approve store onboarding applications submitted by Platform Administrators."
                      : "Track your applications to launch new stores. Super Administrators review and provision your requests."}
                  </p>
                </div>
                {isPlatformAdmin && (
                  <button
                    type="button"
                    className="store-settings-btn store-settings-btn--secondary"
                    onClick={() => setShowRequestModal(true)}
                  >
                    <FaPlus /> <span>Submit New Request</span>
                  </button>
                )}
              </div>

              <div className="requests-container">
                {loadingRequests ? (
                  <div className="requests-empty-state">
                    <FaSpinner
                      className="spin"
                      style={{ fontSize: "2rem", marginBottom: "0.5rem" }}
                    />
                    <p>Loading store requests...</p>
                  </div>
                ) : storeRequests.length === 0 ? (
                  <div className="requests-empty-state">
                    <FaClipboardList
                      style={{
                        fontSize: "2.5rem",
                        color: "#94a3b8",
                        marginBottom: "0.75rem",
                      }}
                    />
                    <h3>No Store Requests Found</h3>
                    <p>
                      {isSuperAdmin
                        ? "There are no pending or reviewed store requests at this time."
                        : "You haven't submitted any store access requests yet."}
                    </p>
                    {isPlatformAdmin && (
                      <button
                        type="button"
                        className="store-settings-btn store-settings-btn--secondary"
                        onClick={() => setShowRequestModal(true)}
                      >
                        <FaPlus /> <span>Apply for Store Access</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="requests-list">
                    {storeRequests.map((req) => {
                      const isPending =
                        req.status === StoreRequestStatus.Pending ||
                        (req as any).status === 1;
                      const isApproved =
                        req.status === StoreRequestStatus.Approved ||
                        (req as any).status === 2;
                      const isRejected =
                        req.status === StoreRequestStatus.Rejected ||
                        (req as any).status === 3;

                      return (
                        <div key={req.storeRequestId} className="request-card">
                          <div className="request-card__header">
                            <div>
                              <h3 className="request-card__title">
                                {req.storeName}
                                <span className="request-card__slug">
                                  ?tenant={req.desiredSlug}
                                </span>
                              </h3>
                              <div className="request-card__meta">
                                <span>
                                  Requester: <strong>{req.requesterEmail}</strong>
                                </span>
                                <span>
                                  Submitted:{" "}
                                  {new Date(req.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div>
                              {isPending && (
                                <span className="status-badge status-badge--pending">
                                  <FaClock /> Pending Review
                                </span>
                              )}
                              {isApproved && (
                                <span className="status-badge status-badge--approved">
                                  <FaCheck /> Approved{" "}
                                  {req.createdTenantId
                                    ? `(Tenant #${req.createdTenantId})`
                                    : ""}
                                </span>
                              )}
                              {isRejected && (
                                <span className="status-badge status-badge--rejected">
                                  <FaBan /> Rejected
                                </span>
                              )}
                            </div>
                          </div>

                          {req.businessDescription && (
                            <div className="request-card__body">
                              <p className="request-card__desc">
                                {req.businessDescription}
                              </p>
                            </div>
                          )}

                          <div className="request-card__details">
                            <div className="request-detail-item">
                              <span className="request-detail-item__label">
                                Contact Email
                              </span>
                              <span className="request-detail-item__value">
                                {req.contactEmail || req.requesterEmail}
                              </span>
                            </div>
                            <div className="request-detail-item">
                              <span className="request-detail-item__label">
                                Contact Phone
                              </span>
                              <span className="request-detail-item__value">
                                {req.contactPhone || "Not provided"}
                              </span>
                            </div>
                            <div className="request-detail-item">
                              <span className="request-detail-item__label">
                                Reviewed On
                              </span>
                              <span className="request-detail-item__value">
                                {req.reviewedAt
                                  ? new Date(req.reviewedAt).toLocaleDateString()
                                  : "Awaiting Review"}
                              </span>
                            </div>
                          </div>

                          {req.adminNotes && (
                            <div className="request-card__notes">
                              <div className="request-card__notes-title">
                                Admin Feedback / Review Notes:
                              </div>
                              <div>{req.adminNotes}</div>
                            </div>
                          )}

                          {isSuperAdmin && isPending && (
                            <div className="request-card__actions">
                              <button
                                type="button"
                                className="store-req-btn store-req-btn--approve"
                                onClick={() =>
                                  setReviewModal({
                                    open: true,
                                    request: req,
                                    action: "approve",
                                    notes:
                                      "Approved. Store provisioned with default theme and configuration.",
                                  })
                                }
                              >
                                <FaCheck /> <span>Approve & Provision</span>
                              </button>
                              <button
                                type="button"
                                className="store-req-btn store-req-btn--reject"
                                onClick={() =>
                                  setReviewModal({
                                    open: true,
                                    request: req,
                                    action: "reject",
                                    notes: "",
                                  })
                                }
                              >
                                <FaBan /> <span>Reject Request</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Submit Footer - Only for Settings tabs */}
          {activeTab !== "requests" && (
            <div className="store-settings-footer">
              <div className="store-settings-footer__info">
                <FaCheckCircle className="footer-status-icon" />
                <span>
                  Changes apply instantly to storefront visitors on{" "}
                  <strong>{tenant?.storeName || activeSlug}</strong>.
                </span>
              </div>
              <button
                type="submit"
                className="store-settings-btn store-settings-btn--save"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <FaSpinner className="spin" />
                    <span>Saving Settings...</span>
                  </>
                ) : (
                  <>
                    <FaSave />
                    <span>Save Store Settings</span>
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Onboard New Tenant Modal (Super Admin only) */}
      {showCreateModal && (
        <div className="store-modal-overlay">
          <div
            className="store-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="store-modal__header">
              <h2 id="modal-title">Direct Onboard Merchant Store</h2>
              <button
                type="button"
                className="store-modal__close-btn"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateTenant}>
              <div className="store-modal__body">
                <div className="store-settings-field">
                  <label htmlFor="newStoreName">Brand / Store Name *</label>
                  <input
                    type="text"
                    id="newStoreName"
                    name="storeName"
                    required
                    value={newTenantData.storeName}
                    onChange={handleNewTenantChange}
                    placeholder="e.g. Silk & Cotton Apparel"
                    className="store-settings-input"
                  />
                </div>

                <div className="store-settings-field">
                  <label htmlFor="newSlug">Store Slug (Unique Subdomain / Path) *</label>
                  <input
                    type="text"
                    id="newSlug"
                    name="slug"
                    required
                    value={newTenantData.slug}
                    onChange={handleNewTenantChange}
                    placeholder="e.g. silk-cotton"
                    className="store-settings-input"
                  />
                  <span className="field-hint">
                    Storefront will be available at: ?tenant=
                    {newTenantData.slug || "your-slug"}
                  </span>
                </div>

                <div className="store-settings-field">
                  <label htmlFor="newCustomDomain">Custom Domain (Optional)</label>
                  <input
                    type="text"
                    id="newCustomDomain"
                    name="customDomain"
                    value={newTenantData.customDomain}
                    onChange={handleNewTenantChange}
                    placeholder="e.g. www.silkcotton.com"
                    className="store-settings-input"
                  />
                </div>

                <div className="color-row">
                  <div className="store-settings-field">
                    <label>Initial Primary Color</label>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        name="primaryColor"
                        value={newTenantData.primaryColor}
                        onChange={handleNewTenantChange}
                        className="color-picker-box"
                      />
                      <input
                        type="text"
                        name="primaryColor"
                        value={newTenantData.primaryColor}
                        onChange={handleNewTenantChange}
                        className="store-settings-input"
                      />
                    </div>
                  </div>

                  <div className="store-settings-field">
                    <label>Initial Accent Color</label>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        name="accentColor"
                        value={newTenantData.accentColor}
                        onChange={handleNewTenantChange}
                        className="color-picker-box"
                      />
                      <input
                        type="text"
                        name="accentColor"
                        value={newTenantData.accentColor}
                        onChange={handleNewTenantChange}
                        className="store-settings-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="store-modal__footer">
                <button
                  type="button"
                  className="store-settings-btn store-settings-btn--cancel"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="store-settings-btn store-settings-btn--save"
                  disabled={creatingTenant}
                >
                  {creatingTenant ? (
                    <>
                      <FaSpinner className="spin" />
                      <span>Provisioning Store...</span>
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      <span>Create Storefront</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Platform Admin Request Store Modal */}
      {showRequestModal && (
        <div className="store-modal-overlay">
          <div
            className="store-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="request-modal-title"
          >
            <div className="store-modal__header">
              <h2 id="request-modal-title">Apply for Store Access</h2>
              <button
                type="button"
                className="store-modal__close-btn"
                onClick={() => setShowRequestModal(false)}
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmitStoreRequest}>
              <div className="store-modal__body">
                <div className="store-settings-field">
                  <label htmlFor="reqStoreName">Brand / Store Name *</label>
                  <input
                    type="text"
                    id="reqStoreName"
                    name="storeName"
                    required
                    value={newRequestData.storeName}
                    onChange={handleRequestDataChange}
                    placeholder="e.g. Modern Silk & Cotton"
                    className="store-settings-input"
                  />
                </div>

                <div className="store-settings-field">
                  <label htmlFor="reqSlug">
                    Desired Store Slug (Unique URL Path) *
                  </label>
                  <input
                    type="text"
                    id="reqSlug"
                    name="desiredSlug"
                    required
                    value={newRequestData.desiredSlug}
                    onChange={handleRequestDataChange}
                    placeholder="e.g. modern-silk"
                    className="store-settings-input"
                  />
                  <span className="field-hint">
                    Storefront will be available at: ?tenant=
                    {newRequestData.desiredSlug || "your-slug"}
                  </span>
                </div>

                <div className="store-settings-field">
                  <label htmlFor="reqDesc">Business Concept & Description</label>
                  <textarea
                    id="reqDesc"
                    name="businessDescription"
                    rows={3}
                    value={newRequestData.businessDescription}
                    onChange={handleRequestDataChange}
                    placeholder="Describe your clothing catalog, target audience, and brand story..."
                    className="store-settings-textarea"
                  />
                </div>

                <div className="store-settings-field">
                  <label htmlFor="reqContactEmail">Contact Email</label>
                  <input
                    type="email"
                    id="reqContactEmail"
                    name="contactEmail"
                    value={newRequestData.contactEmail}
                    onChange={handleRequestDataChange}
                    placeholder="store-admin@stylethread.com"
                    className="store-settings-input"
                  />
                </div>

                <div className="store-settings-field">
                  <label htmlFor="reqContactPhone">Contact Phone</label>
                  <input
                    type="tel"
                    id="reqContactPhone"
                    name="contactPhone"
                    value={newRequestData.contactPhone}
                    onChange={handleRequestDataChange}
                    placeholder="+91 98765 43210"
                    className="store-settings-input"
                  />
                </div>
              </div>

              <div className="store-modal__footer">
                <button
                  type="button"
                  className="store-settings-btn store-settings-btn--cancel"
                  onClick={() => setShowRequestModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="store-settings-btn store-settings-btn--save"
                  disabled={submittingRequest}
                >
                  {submittingRequest ? (
                    <>
                      <FaSpinner className="spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      <span>Submit for Super Admin Approval</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Super Admin Review Confirmation Modal */}
      {reviewModal.open && reviewModal.request && (
        <div className="store-modal-overlay">
          <div
            className="store-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-modal-title"
          >
            <div className="store-modal__header">
              <h2 id="review-modal-title">
                {reviewModal.action === "approve"
                  ? "Approve Store Request"
                  : "Reject Store Request"}
              </h2>
              <button
                type="button"
                className="store-modal__close-btn"
                onClick={() =>
                  setReviewModal({
                    open: false,
                    request: null,
                    action: "approve",
                    notes: "",
                  })
                }
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleReviewAction}>
              <div className="store-modal__body">
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.95rem",
                    color: "#334155",
                    lineHeight: 1.5,
                  }}
                >
                  {reviewModal.action === "approve" ? (
                    <>
                      Are you sure you want to approve store{" "}
                      <strong>"{reviewModal.request.storeName}"</strong> (
                      <code>?tenant={reviewModal.request.desiredSlug}</code>)? This
                      will automatically provision a new storefront.
                    </>
                  ) : (
                    <>
                      Are you sure you want to reject store request{" "}
                      <strong>"{reviewModal.request.storeName}"</strong>? Please
                      provide feedback or reason below for the requester.
                    </>
                  )}
                </p>

                <div className="store-settings-field">
                  <label htmlFor="reviewNotes">
                    {reviewModal.action === "approve"
                      ? "Approval / Welcome Notes (Optional)"
                      : "Rejection Reason *"}
                  </label>
                  <textarea
                    id="reviewNotes"
                    required={reviewModal.action === "reject"}
                    rows={3}
                    value={reviewModal.notes}
                    onChange={(e) =>
                      setReviewModal((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder={
                      reviewModal.action === "approve"
                        ? "e.g. Welcome to Style Thread Platform! Default settings and catalog configured."
                        : "e.g. Desired slug conflicts with existing brand trademark. Please re-apply with alternate name."
                    }
                    className="store-settings-textarea"
                  />
                </div>
              </div>

              <div className="store-modal__footer">
                <button
                  type="button"
                  className="store-settings-btn store-settings-btn--cancel"
                  onClick={() =>
                    setReviewModal({
                      open: false,
                      request: null,
                      action: "approve",
                      notes: "",
                    })
                  }
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`store-req-btn ${
                    reviewModal.action === "approve"
                      ? "store-req-btn--approve"
                      : "store-req-btn--reject"
                  }`}
                  disabled={reviewing}
                >
                  {reviewing ? (
                    <>
                      <FaSpinner className="spin" />
                      <span>Processing...</span>
                    </>
                  ) : reviewModal.action === "approve" ? (
                    <>
                      <FaCheck />
                      <span>Confirm & Provision Store</span>
                    </>
                  ) : (
                    <>
                      <FaBan />
                      <span>Confirm Rejection</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreSettings;
