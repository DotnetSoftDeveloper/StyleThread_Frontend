import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./SuperAdminPages.css";
import {
  getAllTenants,
  getStoreRequests,
  getEligibleAdmins,
} from "../../../Services/tenantService";
import {
  Tenant,
  TenantStatus,
  StoreRequest,
  StoreRequestStatus,
  EligibleAdminDto,
} from "../../../Types/Interface/ITenant";
import {
  FaStore,
  FaClipboardList,
  FaUsersCog,
  FaCheckCircle,
  FaArrowRight,
  FaPlus,
  FaExternalLinkAlt,
} from "react-icons/fa";

export const SuperAdminDashboard: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [requests, setRequests] = useState<StoreRequest[]>([]);
  const [admins, setAdmins] = useState<EligibleAdminDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [tenantList, reqList, adminList] = await Promise.all([
          getAllTenants().catch(() => []),
          getStoreRequests().catch(() => []),
          getEligibleAdmins().catch(() => []),
        ]);
        if (mounted) {
          setTenants(Array.isArray(tenantList) ? tenantList : []);
          setRequests(Array.isArray(reqList) ? reqList : []);
          setAdmins(Array.isArray(adminList) ? adminList : []);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchDashboardData();
    return () => {
      mounted = false;
    };
  }, []);

  const pendingRequests = requests.filter(
    (r) =>
      r.status === StoreRequestStatus.Pending ||
      (r.statusName && r.statusName.toUpperCase() === "PENDING")
  );
  const activeTenants = tenants.filter(
    (t) => t.status === TenantStatus.Active
  );

  return (
    <div className="sa-page-container">
      {/* Page Header */}
      <div className="sa-page-header">
        <div className="sa-page-title-group">
          <h1>Platform Operations Overview</h1>
          <p>
            Real-time status of multi-tenant storefronts, pending onboarding
            applications, and administrative assignments.
          </p>
        </div>
        <div className="sa-header-actions">
          <Link to="/super-admin/applications" className="btn-sa-orange">
            <FaClipboardList />
            <span>Review Applications ({pendingRequests.length})</span>
          </Link>
          <Link to="/super-admin/stores" className="btn-sa-primary">
            <FaPlus />
            <span>Manage Stores</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="sa-stats-grid">
        <div className="sa-stat-card">
          <div className="sa-stat-icon-wrapper teal">
            <FaStore />
          </div>
          <div>
            <div className="sa-stat-value">{tenants.length}</div>
            <div className="sa-stat-label">Total Storefronts</div>
          </div>
        </div>

        <div className="sa-stat-card">
          <div className="sa-stat-icon-wrapper orange">
            <FaClipboardList />
          </div>
          <div>
            <div className="sa-stat-value">{pendingRequests.length}</div>
            <div className="sa-stat-label">Pending Applications</div>
          </div>
        </div>

        <div className="sa-stat-card">
          <div className="sa-stat-icon-wrapper emerald">
            <FaCheckCircle />
          </div>
          <div>
            <div className="sa-stat-value">{activeTenants.length}</div>
            <div className="sa-stat-label">Active Stores</div>
          </div>
        </div>

        <div className="sa-stat-card">
          <div className="sa-stat-icon-wrapper blue">
            <FaUsersCog />
          </div>
          <div>
            <div className="sa-stat-value">{admins.length}</div>
            <div className="sa-stat-label">Eligible Administrators</div>
          </div>
        </div>
      </div>

      {/* Recent Applications Requiring Attention */}
      <div className="sa-card">
        <div className="sa-card-header">
          <h2 className="sa-card-title">Recent Store Applications</h2>
          <Link to="/super-admin/applications" className="btn-sa-secondary btn-sa-sm">
            <span>View All Applications</span>
            <FaArrowRight size={10} />
          </Link>
        </div>
        <div className="sa-table-responsive">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Business Name</th>
                <th>Desired Slug</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.slice(0, 5).map((req) => {
                const status = (req.statusName || (req.status === StoreRequestStatus.Approved ? "APPROVED" : req.status === StoreRequestStatus.Rejected ? "REJECTED" : req.status === StoreRequestStatus.InformationRequired ? "INFO_REQUIRED" : "PENDING")).toUpperCase();
                return (
                  <tr key={req.storeRequestId}>
                    <td>
                      <strong style={{ fontFamily: "monospace", color: "#0f766e" }}>
                        {req.referenceNumber || `#REQ-${req.storeRequestId}`}
                      </strong>
                    </td>
                    <td>
                      <strong>{req.businessName || req.storeName}</strong>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        {req.businessCategory || "General"}
                      </div>
                    </td>
                    <td>
                      <code style={{ color: "#ea580c" }}>
                        /{req.desiredSlug || req.storeName?.toLowerCase()}
                      </code>
                    </td>
                    <td>
                      <div>{req.contactEmail}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        {req.contactPhone || "—"}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`sa-badge ${
                          status === "APPROVED"
                            ? "approved"
                            : status === "REJECTED"
                            ? "rejected"
                            : status === "INFO_REQUIRED"
                            ? "info-required"
                            : "pending"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td>
                      {req.createdAt
                        ? new Date(req.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <Link
                        to="/super-admin/applications"
                        className="btn-sa-secondary btn-sa-sm"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {requests.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                    No store applications currently submitted.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stores Directory Preview */}
      <div className="sa-card">
        <div className="sa-card-header">
          <h2 className="sa-card-title">Registered Storefronts</h2>
          <Link to="/super-admin/stores" className="btn-sa-secondary btn-sa-sm">
            <span>Manage All Stores</span>
            <FaArrowRight size={10} />
          </Link>
        </div>
        <div className="sa-table-responsive">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Storefront</th>
                <th>Slug</th>
                <th>Custom Domain</th>
                <th>Status</th>
                <th>Created</th>
                <th>Preview</th>
              </tr>
            </thead>
            <tbody>
              {tenants.slice(0, 5).map((t) => (
                <tr key={t.tenantId}>
                  <td>
                    <strong>{t.storeName}</strong>
                  </td>
                  <td>
                    <code style={{ color: "#0d9488" }}>/{t.slug}</code>
                  </td>
                  <td>{t.customDomain || <span style={{ color: "#94a3b8" }}>Standard Subpath</span>}</td>
                  <td>
                    <span className={`sa-badge ${t.status === TenantStatus.Active ? "active" : "rejected"}`}>
                      {t.status === TenantStatus.Active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td>
                    {t.createdAt
                      ? new Date(t.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    <a
                      href={`/store/${t.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-sa-secondary btn-sa-sm"
                      title="Open storefront in new tab"
                    >
                      <FaExternalLinkAlt size={10} />
                      <span>Live Store</span>
                    </a>
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                    No tenants registered yet.
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

export default SuperAdminDashboard;
