import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./SuperAdminPages.css";
import { getEligibleAdmins } from "../../../Services/tenantService";
import { EligibleAdminDto } from "../../../Types/Interface/ITenant";
import { useToast } from "../../../Utils/Helper/ToastNotifications";
import {
  FaSearch,
  FaUserShield,
  FaEnvelope,
} from "react-icons/fa";

export const AdminsDirectoryPage: React.FC = () => {
  const [admins, setAdmins] = useState<EligibleAdminDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { showToast } = useToast();

  useEffect(() => {
    let mounted = true;
    const fetchAdmins = async () => {
      try {
        setLoading(true);
        const data = await getEligibleAdmins();
        if (mounted) {
          setAdmins(Array.isArray(data) ? data : []);
        }
      } catch (err: any) {
        showToast("error", "Failed to load administrator accounts.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAdmins();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredAdmins = admins.filter((adm) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const fullName = `${adm.firstName || ""} ${adm.lastName || ""}`.trim().toLowerCase();
    return (
      fullName.includes(q) ||
      (adm.email && adm.email.toLowerCase().includes(q)) ||
      (adm.assignedStores && adm.assignedStores.some((s) => s.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="sa-page-container">
      {/* Header */}
      <div className="sa-page-header">
        <div className="sa-page-title-group">
          <h1>Platform Administrators Directory</h1>
          <p>
            Inspect eligible administrative accounts across the platform and view
            their assigned storefronts.
          </p>
        </div>
        <div className="sa-header-actions">
          <Link to="/super-admin/assignments" className="btn-sa-primary">
            <FaUserShield />
            <span>Manage Store Assignments</span>
          </Link>
        </div>
      </div>

      {/* Directory Card */}
      <div className="sa-card">
        <div className="sa-card-header">
          <h2 className="sa-card-title">Eligible Administrators ({filteredAdmins.length})</h2>
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
              placeholder="Search by name, email, or store..."
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
                <th style={{ width: "24%" }}>Administrator</th>
                <th style={{ width: "26%" }}>Email Address</th>
                <th style={{ width: "20%" }}>Assigned Stores</th>
                <th style={{ width: "18%" }}>Roles & Privileges</th>
                <th style={{ width: "12%", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.map((adm) => (
                <tr key={adm.userId}>
                  <td data-label="Administrator">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: "#0d9488",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                        }}
                      >
                        {((adm.firstName || adm.email || "A")[0]).toUpperCase()}
                      </div>
                      <div>
                        <strong>{`${adm.firstName || ""} ${adm.lastName || ""}`.trim() || adm.email}</strong>
                        <div style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "monospace" }}>
                          ID: #{adm.userId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Email Address">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <FaEnvelope style={{ color: "#94a3b8" }} size={12} />
                      <span>{adm.email}</span>
                    </div>
                  </td>
                  <td data-label="Assigned Stores">
                    {adm.assignedStores && adm.assignedStores.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                        {adm.assignedStores.map((slug) => (
                          <span
                            key={slug}
                            style={{
                              backgroundColor: "#f0fdfa",
                              color: "#0f766e",
                              border: "1px solid #99f6e4",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              padding: "0.15rem 0.5rem",
                              borderRadius: "9999px",
                              fontFamily: "monospace",
                            }}
                          >
                            /{slug}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                        No stores currently assigned
                      </span>
                    )}
                  </td>
                  <td data-label="Roles & Privileges">
                    <div style={{ display: "flex", gap: "0.35rem" }}>
                      {adm.roles?.map((r) => (
                        <span key={r} className="sa-badge info-required">
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td data-label="Actions">
                    <Link
                      to="/super-admin/assignments"
                      className="btn-sa-secondary btn-sa-sm"
                      title="Manage Store Assignments"
                    >
                      <FaUserShield size={10} />
                      <span>Assign</span>
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredAdmins.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                    No administrators found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminsDirectoryPage;
