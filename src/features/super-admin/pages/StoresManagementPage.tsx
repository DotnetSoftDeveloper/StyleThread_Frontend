import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./SuperAdminPages.css";
import {
  getAllTenants,
  createTenant,
} from "../../../Services/tenantService";
import {
  Tenant,
  TenantStatus,
  CreateTenantRequest,
} from "../../../Types/Interface/ITenant";
import { useToast } from "../../../Utils/Helper/ToastNotifications";
import {
  FaPlus,
  FaSearch,
  FaExternalLinkAlt,
  FaTimes,
  FaSpinner,
  FaCogs,
} from "react-icons/fa";

export const StoresManagementPage: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Create Store Modal
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [newStore, setNewStore] = useState<CreateTenantRequest>({
    storeName: "",
    slug: "",
    customDomain: "",
    primaryColor: "#0f766e",
    accentColor: "#ea580c",
    logoUrl: "",
  });

  const { showToast } = useToast();

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const data = await getAllTenants();
      setTenants(Array.isArray(data) ? data : []);
    } catch (err: any) {
      showToast("error", "Failed to retrieve store directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStore.storeName || !newStore.slug) {
      showToast("error", "Store Name and Slug are required.");
      return;
    }
    try {
      setCreating(true);
      await createTenant(newStore);
      showToast("success", `Store "${newStore.storeName}" provisioned successfully!`);
      setShowCreateModal(false);
      setNewStore({
        storeName: "",
        slug: "",
        customDomain: "",
        primaryColor: "#0f766e",
        accentColor: "#ea580c",
        logoUrl: "",
      });
      fetchTenants();
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to create store.");
    } finally {
      setCreating(false);
    }
  };

  const filteredTenants = tenants.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.storeName && t.storeName.toLowerCase().includes(q)) ||
      (t.slug && t.slug.toLowerCase().includes(q)) ||
      (t.customDomain && t.customDomain.toLowerCase().includes(q))
    );
  });

  return (
    <div className="sa-page-container">
      {/* Header */}
      <div className="sa-page-header">
        <div className="sa-page-title-group">
          <h1>Platform Store Directory</h1>
          <p>
            Manage all hosted storefronts, inspect tenant domains, configure branding,
            and manually provision new stores.
          </p>
        </div>
        <div className="sa-header-actions">
          <button
            className="btn-sa-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <FaPlus />
            <span>Direct Provision Store</span>
          </button>
        </div>
      </div>

      {/* Directory Table */}
      <div className="sa-card">
        <div className="sa-card-header">
          <h2 className="sa-card-title">Registered Storefronts ({filteredTenants.length})</h2>
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
              placeholder="Search by name, slug, domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                <th className="col-store-id">ID</th>
                <th className="col-store-name">Storefront Name</th>
                <th className="col-store-slug">Slug URL</th>
                <th className="col-store-domain">Custom Domain</th>
                <th className="col-store-status">Status</th>
                <th className="col-store-created">Created</th>
                <th className="col-store-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map((t) => (
                <tr key={t.tenantId}>
                  <td data-label="ID" className="col-store-id">
                    <span style={{ fontFamily: "monospace", color: "#64748b" }}>
                      #{t.tenantId}
                    </span>
                  </td>
                  <td data-label="Storefront Name" className="col-store-name">
                    <strong>{t.storeName}</strong>
                  </td>
                  <td data-label="Slug URL" className="col-store-slug">
                    <code style={{ color: "#0d9488" }}>/{t.slug}</code>
                  </td>
                  <td data-label="Custom Domain" className="col-store-domain">
                    {t.customDomain ? (
                      <code>{t.customDomain}</code>
                    ) : (
                      <span style={{ color: "#94a3b8" }}>Default Subpath</span>
                    )}
                  </td>
                  <td data-label="Status" className="col-store-status">
                    <span className={`sa-badge ${t.status === TenantStatus.Active ? "active" : "rejected"}`}>
                      {t.status === TenantStatus.Active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td data-label="Created" className="col-store-created">
                    {t.createdAt
                      ? new Date(t.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td data-label="Actions" className="col-store-actions">
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Link
                        to={`/super-admin/stores/${t.tenantId}`}
                        className="btn-sa-secondary btn-sa-sm"
                        title="Manage Store Details"
                      >
                        <FaCogs size={10} />
                        <span>Manage</span>
                      </Link>
                      <a
                        href={`/store/${t.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-sa-secondary btn-sa-sm"
                        title="View Live Storefront"
                      >
                        <FaExternalLinkAlt size={10} />
                        <span>Live</span>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTenants.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                    No stores found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Direct Provision Store Modal */}
      {showCreateModal && (
        <div className="sa-modal-overlay">
          <div className="sa-modal">
            <div className="sa-modal-header">
              <h3 className="sa-modal-title">Provision New Store</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateStore}>
              <div className="sa-modal-body">
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                    Store Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Urban Threads"
                    value={newStore.storeName}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                      setNewStore({ ...newStore, storeName: name, slug: newStore.slug || slug });
                    }}
                    style={{
                      width: "100%",
                      padding: "0.65rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                    Store Slug *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. urban-threads"
                    value={newStore.slug}
                    onChange={(e) => setNewStore({ ...newStore, slug: e.target.value.toLowerCase() })}
                    style={{
                      width: "100%",
                      padding: "0.65rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.9rem",
                    }}
                  />
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    Storefront will be hosted at /store/{newStore.slug || "slug"}
                  </span>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                    Custom Domain (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. shop.urbanthreads.com"
                    value={newStore.customDomain || ""}
                    onChange={(e) => setNewStore({ ...newStore, customDomain: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.65rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                      Primary Brand Color
                    </label>
                    <input
                      type="color"
                      value={newStore.primaryColor}
                      onChange={(e) => setNewStore({ ...newStore, primaryColor: e.target.value })}
                      style={{ width: "100%", height: "40px", borderRadius: "8px", border: "1px solid #cbd5e1", cursor: "pointer" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                      Accent Color
                    </label>
                    <input
                      type="color"
                      value={newStore.accentColor}
                      onChange={(e) => setNewStore({ ...newStore, accentColor: e.target.value })}
                      style={{ width: "100%", height: "40px", borderRadius: "8px", border: "1px solid #cbd5e1", cursor: "pointer" }}
                    />
                  </div>
                </div>
              </div>

              <div className="sa-modal-footer">
                <button
                  type="button"
                  className="btn-sa-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-sa-primary"
                  disabled={creating}
                >
                  {creating ? <FaSpinner className="fa-spin" /> : <FaPlus />}
                  <span>Provision Store</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoresManagementPage;
