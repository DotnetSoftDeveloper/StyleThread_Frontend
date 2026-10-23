import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./SuperAdminPages.css";
import {
  getAllTenants,
  getCurrentTenant,
  updateCurrentTenantSettings,
  getTenantMemberships,
  assignTenantRole,
  revokeTenantRole,
  getTenantAuditLogs,
  getEligibleAdmins,
} from "../../../Services/tenantService";
import {
  Tenant,
  TenantMembership,
  TenantAuditLogDto,
  EligibleAdminDto,
  UpdateTenantSettingsRequest,
} from "../../../Types/Interface/ITenant";
import { useToast } from "../../../Utils/Helper/ToastNotifications";
import {
  FaArrowLeft,
  FaPalette,
  FaUsersCog,
  FaHistory,
  FaSave,
  FaExternalLinkAlt,
  FaUserPlus,
  FaTrash,
  FaSpinner,
  FaTimes,
  FaCheck,
} from "react-icons/fa";

export const StoreDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [memberships, setMemberships] = useState<TenantMembership[]>([]);
  const [auditLogs, setAuditLogs] = useState<TenantAuditLogDto[]>([]);
  const [admins, setAdmins] = useState<EligibleAdminDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);

  // Settings form
  const [branding, setBranding] = useState<UpdateTenantSettingsRequest>({
    primaryColor: "#0f766e",
    accentColor: "#ea580c",
    supportEmail: "",
    supportPhone: "",
    heroTitle: "",
    heroSubtitle: "",
  });
  const [customDomain, setCustomDomain] = useState<string>("");

  // Assign Role Modal
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
  const [assignData, setAssignData] = useState({ email: "", role: "StoreAdmin" });
  const [assigning, setAssigning] = useState<boolean>(false);

  const { showToast } = useToast();

  const loadStoreData = async () => {
    try {
      setLoading(true);
      const all = await getAllTenants();
      const target = all.find((t) => String(t.tenantId) === id);
      if (!target) {
        showToast("error", "Store not found.");
        navigate("/super-admin/stores");
        return;
      }
      setTenant(target);
      setCustomDomain(target.customDomain || "");

      // Load full settings for this tenant
      try {
        const fullTenant = await getCurrentTenant(target.slug);
        if (fullTenant.settings) {
          setBranding({
            primaryColor: fullTenant.settings.primaryColor || "#0f766e",
            accentColor: fullTenant.settings.accentColor || "#ea580c",
            supportEmail: fullTenant.settings.supportEmail || "",
            supportPhone: fullTenant.settings.supportPhone || "",
            heroTitle: fullTenant.settings.heroTitle || "",
            heroSubtitle: fullTenant.settings.heroSubtitle || "",
          });
        }
      } catch {
        // Fallback to basic tenant props
      }

      // Load memberships, audit logs, and eligible admins
      const [mList, logs, eligible] = await Promise.all([
        getTenantMemberships(target.tenantId).catch(() => []),
        getTenantAuditLogs(target.tenantId).catch(() => []),
        getEligibleAdmins().catch(() => []),
      ]);

      setMemberships(Array.isArray(mList) ? mList : []);
      setAuditLogs(Array.isArray(logs) ? logs : []);
      setAdmins(Array.isArray(eligible) ? eligible : []);
    } catch (err: any) {
      showToast("error", "Failed to load store details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStoreData();
  }, [id]);

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    try {
      setSavingSettings(true);
      await updateCurrentTenantSettings(branding, tenant.slug);
      showToast("success", "Store settings and branding updated successfully!");
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to update store settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !assignData.email) return;
    try {
      setAssigning(true);
      await assignTenantRole(tenant.tenantId, {
        email: assignData.email,
        role: assignData.role,
      });
      showToast("success", `Role ${assignData.role} assigned to ${assignData.email}.`);
      setShowAssignModal(false);
      setAssignData({ email: "", role: "StoreAdmin" });
      const mList = await getTenantMemberships(tenant.tenantId);
      setMemberships(mList);
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to assign role.");
    } finally {
      setAssigning(false);
    }
  };

  const handleRevokeRole = async (email: string, role: string) => {
    if (!tenant) return;
    if (!window.confirm(`Revoke ${role} access from ${email}?`)) return;
    try {
      await revokeTenantRole(tenant.tenantId, { email, role });
      showToast("success", `Revoked ${role} role from ${email}.`);
      const mList = await getTenantMemberships(tenant.tenantId);
      setMemberships(mList);
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to revoke role.");
    }
  };

  if (loading || !tenant) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <FaSpinner className="fa-spin" size={32} style={{ color: "#0d9488" }} />
        <p style={{ color: "#64748b", marginTop: "1rem" }}>Loading store details...</p>
      </div>
    );
  }

  return (
    <div className="sa-page-container">
      {/* Header */}
      <div className="sa-page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link to="/super-admin/stores" className="btn-sa-secondary btn-sa-sm">
            <FaArrowLeft />
            <span>Store Directory</span>
          </Link>
          <div className="sa-page-title-group">
            <h1>{tenant.storeName}</h1>
            <p>
              Tenant ID #{tenant.tenantId} &bull; Slug: <code>/{tenant.slug}</code>
            </p>
          </div>
        </div>
        <div className="sa-header-actions">
          <a
            href={`/store/${tenant.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-sa-secondary"
          >
            <FaExternalLinkAlt size={11} />
            <span>View Live Storefront</span>
          </a>
        </div>
      </div>

      {/* Grid: Branding / Settings + Team Members */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.75rem" }}>
        {/* Branding & Store Settings Form */}
        <div className="sa-card">
          <div className="sa-card-header">
            <h2 className="sa-card-title">
              <FaPalette style={{ color: "#0d9488", marginRight: "0.5rem" }} />
              Store Branding & Settings
            </h2>
          </div>
          <form onSubmit={handleSaveBranding} className="sa-card-body" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                  Primary Color
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input
                    type="color"
                    value={branding.primaryColor || "#0f766e"}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                    style={{ width: "42px", height: "42px", borderRadius: "8px", border: "1px solid #cbd5e1", cursor: "pointer" }}
                  />
                  <input
                    type="text"
                    value={branding.primaryColor || "#0f766e"}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                    style={{ flex: 1, padding: "0.6rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", fontFamily: "monospace" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                  Accent Color
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input
                    type="color"
                    value={branding.accentColor || "#ea580c"}
                    onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                    style={{ width: "42px", height: "42px", borderRadius: "8px", border: "1px solid #cbd5e1", cursor: "pointer" }}
                  />
                  <input
                    type="text"
                    value={branding.accentColor || "#ea580c"}
                    onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                    style={{ flex: 1, padding: "0.6rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", fontFamily: "monospace" }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                Custom Domain
              </label>
              <input
                type="text"
                placeholder="e.g. shop.urbanthreads.com"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                  Support Email
                </label>
                <input
                  type="email"
                  value={branding.supportEmail || ""}
                  onChange={(e) => setBranding({ ...branding, supportEmail: e.target.value })}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                  Support Phone
                </label>
                <input
                  type="text"
                  value={branding.supportPhone || ""}
                  onChange={(e) => setBranding({ ...branding, supportPhone: e.target.value })}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-sa-primary"
              style={{ alignSelf: "flex-start", marginTop: "0.5rem" }}
              disabled={savingSettings}
            >
              {savingSettings ? <FaSpinner className="fa-spin" /> : <FaSave />}
              <span>Save Store Branding</span>
            </button>
          </form>
        </div>

        {/* Assigned Staff & Administrators */}
        <div className="sa-card">
          <div className="sa-card-header">
            <h2 className="sa-card-title">
              <FaUsersCog style={{ color: "#ea580c", marginRight: "0.5rem" }} />
              Assigned Staff ({memberships.length})
            </h2>
            <button
              className="btn-sa-primary btn-sa-sm"
              onClick={() => setShowAssignModal(true)}
            >
              <FaUserPlus size={11} />
              <span>Assign Staff</span>
            </button>
          </div>
          <div className="sa-table-responsive">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>User Email</th>
                  <th>Role</th>
                  <th>Revoke</th>
                </tr>
              </thead>
              <tbody>
                {memberships.map((m) => (
                  <tr key={m.tenantUserMembershipId}>
                    <td>
                      <strong>{m.email}</strong>
                      {(m.firstName || m.lastName) && (
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {`${m.firstName || ""} ${m.lastName || ""}`.trim()}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="sa-badge info-required">{m.role}</span>
                    </td>
                    <td>
                      <button
                        className="btn-sa-secondary btn-sa-sm"
                        style={{ color: "#ef4444" }}
                        onClick={() => handleRevokeRole(m.email, m.role)}
                        title="Revoke Role"
                      >
                        <FaTrash size={10} />
                      </button>
                    </td>
                  </tr>
                ))}
                {memberships.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                      No staff members directly assigned yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Store Audit Trail */}
      <div className="sa-card">
        <div className="sa-card-header">
          <h2 className="sa-card-title">
            <FaHistory style={{ color: "#64748b", marginRight: "0.5rem" }} />
            Store Activity Audit Trail
          </h2>
        </div>
        <div className="sa-table-responsive">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Operator</th>
                <th>Details</th>
                <th>IP Address</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.auditLogId}>
                  <td>
                    <strong style={{ color: "#0f766e" }}>{log.action}</strong>
                  </td>
                  <td>{log.actorEmail || "System"}</td>
                  <td style={{ fontSize: "0.825rem", color: "#475569" }}>{log.details || "—"}</td>
                  <td>
                    <span style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                      {log.ipAddress || "—"}
                    </span>
                  </td>
                  <td>
                    {log.createdAt
                      ? new Date(log.createdAt).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
              {auditLogs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                    No audit records logged for this store.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Role Modal */}
      {showAssignModal && (
        <div className="sa-modal-overlay">
          <div className="sa-modal">
            <div className="sa-modal-header">
              <h3 className="sa-modal-title">Assign Store Role</h3>
              <button onClick={() => setShowAssignModal(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleAssignRole}>
              <div className="sa-modal-body">
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                    Select User Email *
                  </label>
                  <input
                    type="email"
                    required
                    list="admin-email-options"
                    placeholder="e.g. admin@urbanthreads.com"
                    value={assignData.email}
                    onChange={(e) => setAssignData({ ...assignData, email: e.target.value })}
                    style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                  />
                  <datalist id="admin-email-options">
                    {admins.map((adm) => (
                      <option key={adm.userId} value={adm.email}>
                        {`${adm.firstName || ""} ${adm.lastName || ""}`.trim() || adm.email}
                      </option>
                    ))}
                  </datalist>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                    Role to Grant *
                  </label>
                  <select
                    value={assignData.role}
                    onChange={(e) => setAssignData({ ...assignData, role: e.target.value })}
                    style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                  >
                    <option value="StoreAdmin">Store Administrator (Full store control)</option>
                    <option value="StoreSeller">Store Seller (Products & Orders)</option>
                  </select>
                </div>
              </div>
              <div className="sa-modal-footer">
                <button type="button" className="btn-sa-secondary" onClick={() => setShowAssignModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-sa-primary" disabled={assigning}>
                  {assigning ? <FaSpinner className="fa-spin" /> : <FaCheck />}
                  <span>Assign Membership</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreDetailsPage;
