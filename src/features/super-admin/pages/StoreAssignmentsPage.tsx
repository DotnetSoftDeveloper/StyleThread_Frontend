import React, { useState, useEffect } from "react";
import "./SuperAdminPages.css";
import {
  getAllTenants,
  getEligibleAdmins,
  getTenantMemberships,
  assignTenantRole,
  revokeTenantRole,
} from "../../../Services/tenantService";
import {
  Tenant,
  EligibleAdminDto,
  TenantMembership,
} from "../../../Types/Interface/ITenant";
import { useToast } from "../../../Utils/Helper/ToastNotifications";
import {
  FaUserShield,
  FaStore,
  FaUserPlus,
  FaTrash,
  FaSpinner,
} from "react-icons/fa";

export const StoreAssignmentsPage: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [admins, setAdmins] = useState<EligibleAdminDto[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);
  const [memberships, setMemberships] = useState<TenantMembership[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMembers, setLoadingMembers] = useState<boolean>(false);
  const [assigning, setAssigning] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    userEmail: "",
    role: "StoreAdmin",
  });

  const { showToast } = useToast();

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        setLoading(true);
        const [tenantList, adminList] = await Promise.all([
          getAllTenants(),
          getEligibleAdmins(),
        ]);
        if (mounted) {
          setTenants(Array.isArray(tenantList) ? tenantList : []);
          setAdmins(Array.isArray(adminList) ? adminList : []);
          if (tenantList.length > 0) {
            setSelectedTenantId(tenantList[0].tenantId);
          }
        }
      } catch (err: any) {
        showToast("error", "Failed to initialize assignments console.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedTenantId) return;
    let mounted = true;
    const fetchMembers = async () => {
      try {
        setLoadingMembers(true);
        const list = await getTenantMemberships(selectedTenantId);
        if (mounted) {
          setMemberships(Array.isArray(list) ? list : []);
        }
      } catch (err: any) {
        showToast("error", "Failed to load store memberships.");
      } finally {
        if (mounted) setLoadingMembers(false);
      }
    };
    fetchMembers();
    return () => {
      mounted = false;
    };
  }, [selectedTenantId]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantId || !formData.userEmail) {
      showToast("error", "Please select a user email.");
      return;
    }
    try {
      setAssigning(true);
      await assignTenantRole(selectedTenantId, {
        email: formData.userEmail,
        role: formData.role,
      });
      showToast("success", `Assigned ${formData.role} to ${formData.userEmail}.`);
      setFormData({ userEmail: "", role: "StoreAdmin" });
      const list = await getTenantMemberships(selectedTenantId);
      setMemberships(list);
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to assign role.");
    } finally {
      setAssigning(false);
    }
  };

  const handleRevoke = async (email: string, role: string) => {
    if (!selectedTenantId) return;
    if (!window.confirm(`Revoke ${role} permissions for ${email}?`)) return;
    try {
      await revokeTenantRole(selectedTenantId, { email, role });
      showToast("success", `Revoked ${role} from ${email}.`);
      const list = await getTenantMemberships(selectedTenantId);
      setMemberships(list);
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to revoke role.");
    }
  };

  const currentTenant = tenants.find((t) => t.tenantId === selectedTenantId);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <FaSpinner className="fa-spin" size={32} style={{ color: "#0d9488" }} />
        <p style={{ color: "#64748b", marginTop: "1rem" }}>Loading store assignments...</p>
      </div>
    );
  }

  return (
    <div className="sa-page-container">
      {/* Header */}
      <div className="sa-page-header">
        <div className="sa-page-title-group">
          <h1>Store Assignments Console</h1>
          <p>
            Assign, reassign, or revoke administrative roles and seller permissions
            for each hosted storefront.
          </p>
        </div>
      </div>

      {/* Main Grid: Store Selector & Assignment Form | Current Memberships */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "1.75rem", alignItems: "flex-start" }}>
        {/* Assign Role Panel */}
        <div className="sa-card">
          <div className="sa-card-header">
            <h2 className="sa-card-title">
              <FaStore style={{ color: "#0d9488", marginRight: "0.5rem" }} />
              Select Storefront
            </h2>
          </div>
          <div className="sa-card-body" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                Target Store
              </label>
              <select
                value={selectedTenantId || ""}
                onChange={(e) => setSelectedTenantId(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "0.65rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.9rem",
                }}
              >
                {tenants.map((t) => (
                  <option key={t.tenantId} value={t.tenantId}>
                    {t.storeName} (/{t.slug})
                  </option>
                ))}
              </select>
            </div>

            {currentTenant && (
              <div
                style={{
                  backgroundColor: "#f8fafc",
                  borderRadius: "10px",
                  padding: "1rem",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Selected Store:</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
                  {currentTenant.storeName}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#0d9488", fontFamily: "monospace" }}>
                  /{currentTenant.slug} &bull; ID #{currentTenant.tenantId}
                </div>
              </div>
            )}

            <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "0.5rem 0" }} />

            <form onSubmit={handleAssign} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "#0f172a" }}>
                Assign New Staff Role
              </h3>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                  Administrator Email *
                </label>
                <input
                  type="email"
                  required
                  list="eligible-admin-list"
                  placeholder="e.g. admin@urbanthreads.com"
                  value={formData.userEmail}
                  onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.65rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.9rem",
                  }}
                />
                <datalist id="eligible-admin-list">
                  {admins.map((adm) => (
                    <option key={adm.userId} value={adm.email}>
                      {`${adm.firstName || ""} ${adm.lastName || ""}`.trim() || adm.email}
                    </option>
                  ))}
                </datalist>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                  Store Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.65rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.9rem",
                  }}
                >
                  <option value="StoreAdmin">Store Administrator (Full store control)</option>
                  <option value="StoreSeller">Store Seller (Products & Orders)</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn-sa-primary"
                disabled={assigning}
              >
                {assigning ? <FaSpinner className="fa-spin" /> : <FaUserPlus />}
                <span>Grant Store Access</span>
              </button>
            </form>
          </div>
        </div>

        {/* Current Memberships Table */}
        <div className="sa-card">
          <div className="sa-card-header">
            <h2 className="sa-card-title">
              <FaUserShield style={{ color: "#ea580c", marginRight: "0.5rem" }} />
              Current Assigned Staff ({memberships.length})
            </h2>
          </div>
          <div className="sa-table-responsive">
            <table className="sa-table">
              <thead>
                <tr>
                  <th style={{ width: "42%" }}>User / Email</th>
                  <th style={{ width: "23%" }}>Role</th>
                  <th style={{ width: "20%" }}>Assigned Date</th>
                  <th style={{ width: "15%", textAlign: "center" }}>Revoke</th>
                </tr>
              </thead>
              <tbody>
                {memberships.map((m) => (
                  <tr key={m.tenantUserMembershipId}>
                    <td data-label="User / Email">
                      <strong>{m.email}</strong>
                      {(m.firstName || m.lastName) && (
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {`${m.firstName || ""} ${m.lastName || ""}`.trim()}
                        </div>
                      )}
                    </td>
                    <td data-label="Role">
                      <span className="sa-badge info-required">{m.role}</span>
                    </td>
                    <td data-label="Assigned Date">
                      {m.assignedAt
                        ? new Date(m.assignedAt).toLocaleDateString()
                        : "Active"}
                    </td>
                    <td data-label="Revoke" style={{ textAlign: "center" }}>
                      <button
                        className="btn-sa-secondary btn-sa-sm"
                        style={{ color: "#ef4444" }}
                        onClick={() => handleRevoke(m.email, m.role)}
                        title="Revoke Role Access"
                      >
                        <FaTrash size={10} />
                        <span>Revoke</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {memberships.length === 0 && !loadingMembers && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                      No staff members assigned to {currentTenant?.storeName || "this store"} yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreAssignmentsPage;
