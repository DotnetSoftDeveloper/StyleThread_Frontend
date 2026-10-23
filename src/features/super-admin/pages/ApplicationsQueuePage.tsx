import React, { useState, useEffect } from "react";
import "./SuperAdminPages.css";
import {
  getStoreRequests,
  approveStoreRequest,
  rejectStoreRequest,
  requestStoreInformation,
  assignStoreAdmin,
  getEligibleAdmins,
} from "../../../Services/tenantService";
import {
  StoreRequest,
  StoreRequestStatus,
  EligibleAdminDto,
} from "../../../Types/Interface/ITenant";
import { useToast } from "../../../Utils/Helper/ToastNotifications";
import {
  FaSearch,
  FaCheck,
  FaTimes,
  FaQuestionCircle,
  FaSpinner,
  FaFilter,
  FaExclamationTriangle,
  FaRedo,
  FaStore,
  FaUserTie,
  FaGlobe,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaCalendarAlt,
  FaFileAlt,
  FaClipboardList,
  FaHourglassHalf,
  FaTimesCircle,
  FaCheckCircle,
} from "react-icons/fa";

export const ApplicationsQueuePage: React.FC = () => {
  const [requests, setRequests] = useState<StoreRequest[]>([]);
  const [admins, setAdmins] = useState<EligibleAdminDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Review Drawer / Modal
  const [selectedReq, setSelectedReq] = useState<StoreRequest | null>(null);
  const [activeTab, setActiveTab] = useState<"approve" | "info" | "reject">("approve");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form states for review
  const [selectedAdminId, setSelectedAdminId] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [inquiryNotes, setInquiryNotes] = useState<string>("");
  const [rejectReason, setRejectReason] = useState<string>("");
  const [confirmApprove, setConfirmApprove] = useState<boolean>(false);
  const [confirmReject, setConfirmReject] = useState<boolean>(false);

  const { showToast } = useToast();

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const reqs = await getStoreRequests();
      setRequests(Array.isArray(reqs) ? reqs : []);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to load store applications from platform service.";
      setError(msg);
      showToast("error", "Failed to load store applications.");
    } finally {
      setLoading(false);
    }

    // Load eligible admins independently
    try {
      const adminList = await getEligibleAdmins();
      setAdmins(Array.isArray(adminList) ? adminList : []);
    } catch {
      // Eligible admin lookup is non-blocking
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const openReviewModal = (req: StoreRequest, defaultTab: "approve" | "info" | "reject" = "approve") => {
    setSelectedReq(req);
    setActiveTab(defaultTab);
    setSelectedAdminId(req.assignedAdminUserId ? String(req.assignedAdminUserId) : "");
    setAdminNotes(req.adminNotes || "");
    setInquiryNotes(req.inquiryNotes || "");
    setRejectReason(req.rejectionReason || "");
    setConfirmApprove(false);
    setConfirmReject(false);
  };

  const closeModal = () => {
    setSelectedReq(null);
    setConfirmApprove(false);
    setConfirmReject(false);
  };

  const handleApprove = async () => {
    if (!selectedReq) return;
    if (!confirmApprove) {
      setConfirmApprove(true);
      return;
    }

    try {
      setSubmitting(true);
      await approveStoreRequest(selectedReq.storeRequestId, {
        adminNotes: adminNotes || "Approved by Super Administrator",
        assignAdminUserId: selectedAdminId ? Number(selectedAdminId) : undefined,
      });

      if (selectedAdminId) {
        try {
          await assignStoreAdmin(selectedReq.storeRequestId, {
            userId: Number(selectedAdminId),
          });
        } catch {
          // Handled by primary approve if passed
        }
      }

      showToast(
        "success",
        `Store application for "${selectedReq.storeName || selectedReq.businessName}" approved successfully!`
      );
      closeModal();
      loadRequests();
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to approve application.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReq) return;
    if (!rejectReason.trim()) {
      showToast("error", "Please provide a valid rejection reason.");
      return;
    }
    if (!confirmReject) {
      setConfirmReject(true);
      return;
    }

    try {
      setSubmitting(true);
      await rejectStoreRequest(selectedReq.storeRequestId, rejectReason.trim(), adminNotes);
      showToast(
        "success",
        `Application #${selectedReq.referenceNumber || selectedReq.storeRequestId} marked as rejected.`
      );
      closeModal();
      loadRequests();
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to reject application.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!selectedReq) return;
    if (!inquiryNotes.trim()) {
      showToast("error", "Please specify the required information for the applicant.");
      return;
    }

    try {
      setSubmitting(true);
      await requestStoreInformation(selectedReq.storeRequestId, inquiryNotes.trim(), adminNotes);
      showToast("success", "Information request dispatched to applicant.");
      closeModal();
      loadRequests();
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to dispatch info request.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusString = (req: StoreRequest) => {
    if (req.statusName) return req.statusName.toUpperCase();
    if (req.status === StoreRequestStatus.Approved) return "APPROVED";
    if (req.status === StoreRequestStatus.Rejected) return "REJECTED";
    if (req.status === StoreRequestStatus.InformationRequired) return "INFO_REQUIRED";
    if (req.status === StoreRequestStatus.UnderReview) return "UNDER_REVIEW";
    return "PENDING";
  };

  // KPI Calculations
  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => getStatusString(r) === "PENDING").length;
  const underReviewCount = requests.filter((r) => getStatusString(r) === "UNDER_REVIEW").length;
  const infoRequiredCount = requests.filter((r) => getStatusString(r) === "INFO_REQUIRED").length;
  const approvedCount = requests.filter((r) => getStatusString(r) === "APPROVED").length;
  const rejectedCount = requests.filter((r) => getStatusString(r) === "REJECTED").length;

  const filteredRequests = requests.filter((r) => {
    const statusMatch = statusFilter === "ALL" || getStatusString(r) === statusFilter;
    const q = searchQuery.toLowerCase();
    const queryMatch =
      !searchQuery ||
      (r.businessName && r.businessName.toLowerCase().includes(q)) ||
      (r.storeName && r.storeName.toLowerCase().includes(q)) ||
      (r.contactEmail && r.contactEmail.toLowerCase().includes(q)) ||
      (r.ownerFirstName && r.ownerFirstName.toLowerCase().includes(q)) ||
      (r.ownerLastName && r.ownerLastName.toLowerCase().includes(q)) ||
      (r.referenceNumber && r.referenceNumber.toLowerCase().includes(q)) ||
      (r.desiredSlug && r.desiredSlug.toLowerCase().includes(q));
    return statusMatch && queryMatch;
  });

  return (
    <div className="sa-page-container">
      {/* Header */}
      <div className="sa-page-header">
        <div className="sa-page-title-group">
          <h1>Store Application Queue</h1>
          <p>
            Review prospective merchant onboarding dossiers, request clarifying details,
            provision stores, and assign Store Administrators.
          </p>
        </div>
        <div className="sa-header-actions">
          <button
            onClick={loadRequests}
            className="btn-sa-secondary"
            disabled={loading}
            title="Refresh application queue"
          >
            <FaRedo className={loading ? "fa-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="sa-stats-grid">
        <div
          className={`sa-stat-card ${statusFilter === "ALL" ? "active-kpi" : ""}`}
          onClick={() => setStatusFilter("ALL")}
          style={{ cursor: "pointer" }}
        >
          <div className="sa-stat-icon-wrapper blue">
            <FaClipboardList />
          </div>
          <div>
            <div className="sa-stat-value">{totalCount}</div>
            <div className="sa-stat-label">Total Applications</div>
          </div>
        </div>

        <div
          className={`sa-stat-card ${statusFilter === "PENDING" ? "active-kpi" : ""}`}
          onClick={() => setStatusFilter("PENDING")}
          style={{ cursor: "pointer" }}
        >
          <div className="sa-stat-icon-wrapper orange">
            <FaHourglassHalf />
          </div>
          <div>
            <div className="sa-stat-value">{pendingCount}</div>
            <div className="sa-stat-label">Pending Review</div>
          </div>
        </div>

        <div
          className={`sa-stat-card ${statusFilter === "UNDER_REVIEW" ? "active-kpi" : ""}`}
          onClick={() => setStatusFilter("UNDER_REVIEW")}
          style={{ cursor: "pointer" }}
        >
          <div className="sa-stat-icon-wrapper blue">
            <FaFileAlt />
          </div>
          <div>
            <div className="sa-stat-value">{underReviewCount}</div>
            <div className="sa-stat-label">Under Review</div>
          </div>
        </div>

        <div
          className={`sa-stat-card ${statusFilter === "INFO_REQUIRED" ? "active-kpi" : ""}`}
          onClick={() => setStatusFilter("INFO_REQUIRED")}
          style={{ cursor: "pointer" }}
        >
          <div className="sa-stat-icon-wrapper teal">
            <FaQuestionCircle />
          </div>
          <div>
            <div className="sa-stat-value">{infoRequiredCount}</div>
            <div className="sa-stat-label">Info Required</div>
          </div>
        </div>

        <div
          className={`sa-stat-card ${statusFilter === "APPROVED" ? "active-kpi" : ""}`}
          onClick={() => setStatusFilter("APPROVED")}
          style={{ cursor: "pointer" }}
        >
          <div className="sa-stat-icon-wrapper emerald">
            <FaCheckCircle />
          </div>
          <div>
            <div className="sa-stat-value">{approvedCount}</div>
            <div className="sa-stat-label">Approved & Active</div>
          </div>
        </div>

        <div
          className={`sa-stat-card ${statusFilter === "REJECTED" ? "active-kpi" : ""}`}
          onClick={() => setStatusFilter("REJECTED")}
          style={{ cursor: "pointer" }}
        >
          <div className="sa-stat-icon-wrapper" style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
            <FaTimesCircle />
          </div>
          <div>
            <div className="sa-stat-value">{rejectedCount}</div>
            <div className="sa-stat-label">Rejected</div>
          </div>
        </div>
      </div>

      {/* Error Banner with Retry */}
      {error && !loading && (
        <div className="sa-error-banner">
          <div className="sa-error-content">
            <FaExclamationTriangle className="sa-error-icon" />
            <div>
              <strong>Error Loading Applications:</strong> {error}
            </div>
          </div>
          <button className="btn-retry" onClick={loadRequests}>
            <FaRedo size={12} />
            <span>Retry Loading</span>
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="sa-card">
        <div className="sa-card-header" style={{ padding: "1rem 1.5rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
            <FaFilter style={{ color: "#64748b", marginRight: "0.25rem" }} />
            {["ALL", "PENDING", "UNDER_REVIEW", "INFO_REQUIRED", "APPROVED", "REJECTED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: "0.4rem 0.85rem",
                  borderRadius: "9999px",
                  fontSize: "0.785rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: statusFilter === st ? "1px solid #0d9488" : "1px solid #e2e8f0",
                  backgroundColor: statusFilter === st ? "#0d9488" : "#f8fafc",
                  color: statusFilter === st ? "#ffffff" : "#475569",
                  transition: "all 0.15s",
                }}
              >
                {st.replace(/_/g, " ")}
              </button>
            ))}
          </div>

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
              placeholder="Search reference, store, email..."
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

        {/* Requests Table */}
        <div className="sa-table-responsive">
          <table className="sa-table">
            <thead>
              <tr>
                <th className="col-app-ref">Reference</th>
                <th className="col-app-store">Store / Brand</th>
                <th className="col-app-slug">Desired Slug</th>
                <th className="col-app-owner">Owner & Contact</th>
                <th className="col-app-scale">Scale</th>
                <th className="col-app-status">Status</th>
                <th className="col-app-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && requests.length === 0 ? (
                // Skeleton loading rows
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`skel-${idx}`}>
                    <td>
                      <div className="sa-skeleton-box" style={{ width: "90px" }} />
                    </td>
                    <td>
                      <div className="sa-skeleton-box" style={{ width: "130px" }} />
                      <div className="sa-skeleton-box sm" />
                    </td>
                    <td>
                      <div className="sa-skeleton-box" style={{ width: "80px" }} />
                    </td>
                    <td>
                      <div className="sa-skeleton-box" style={{ width: "110px" }} />
                      <div className="sa-skeleton-box sm" />
                    </td>
                    <td>
                      <div className="sa-skeleton-box" style={{ width: "65px" }} />
                    </td>
                    <td>
                      <div className="sa-skeleton-box pill" />
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div className="sa-skeleton-box" style={{ width: "70px", margin: "0 auto" }} />
                    </td>
                  </tr>
                ))
              ) : filteredRequests.length > 0 ? (
                filteredRequests.map((req) => {
                  const status = getStatusString(req);
                  const isPendingOrInfo = status === "PENDING" || status === "INFO_REQUIRED" || status === "UNDER_REVIEW";
                  return (
                    <tr key={req.storeRequestId}>
                      <td data-label="Reference" className="col-app-ref" title={req.referenceNumber || `#REQ-${req.storeRequestId}`}>
                        <strong style={{ fontFamily: "monospace", color: "#0f766e" }}>
                          {req.referenceNumber || `#REQ-${req.storeRequestId}`}
                        </strong>
                        <div style={{ fontSize: "0.725rem", color: "#94a3b8" }}>
                          {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : ""}
                        </div>
                      </td>

                      <td data-label="Store / Brand" className="col-app-store" title={req.businessName || req.storeName}>
                        <div style={{ fontWeight: 700, color: "#0f172a", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                          {req.businessName || req.storeName}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                          {req.businessCategory || "General Fashion"}
                        </div>
                      </td>

                      <td data-label="Desired Slug" className="col-app-slug" title={`/${req.desiredSlug || req.storeName?.toLowerCase()}`}>
                        <code style={{ color: "#ea580c" }}>
                          /{req.desiredSlug || req.storeName?.toLowerCase()}
                        </code>
                        {req.customDomain && (
                          <div style={{ fontSize: "0.7rem", color: "#64748b" }} title={req.customDomain}>
                            {req.customDomain}
                          </div>
                        )}
                      </td>

                      <td data-label="Owner & Contact" className="col-app-owner" title={`${req.ownerFirstName} ${req.ownerLastName} (${req.contactEmail})`}>
                        <div style={{ fontWeight: 600, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                          {req.ownerFirstName || req.ownerLastName ? `${req.ownerFirstName || ""} ${req.ownerLastName || ""}`.trim() : "Applicant"}
                        </div>
                        <div style={{ fontSize: "0.775rem", color: "#64748b", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                          {req.contactEmail || "—"}
                        </div>
                        {req.contactPhone && (
                          <div style={{ fontSize: "0.725rem", color: "#94a3b8" }}>
                            {req.contactPhone}
                          </div>
                        )}
                      </td>

                      <td data-label="Scale" className="col-app-scale">
                        <span style={{ fontSize: "0.8rem", color: "#475569" }}>
                          {req.estimatedInventoryScale || "Standard"}
                        </span>
                      </td>

                      <td data-label="Status" className="col-app-status">
                        <span
                          className={`sa-badge ${
                            status === "APPROVED"
                              ? "approved"
                              : status === "REJECTED"
                              ? "rejected"
                              : status === "INFO_REQUIRED"
                              ? "info-required"
                              : status === "UNDER_REVIEW"
                              ? "under-review"
                              : "pending"
                          }`}
                        >
                          {status.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td data-label="Actions" className="col-app-actions">
                        <button
                          className="btn-sa-primary btn-sa-sm"
                          onClick={() => openReviewModal(req, isPendingOrInfo ? "approve" : "approve")}
                          title="Inspect application dossier and manage decisions"
                        >
                          Review Dossier
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : null}

              {filteredRequests.length === 0 && !loading && !error && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                    No store applications found matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Application Dossier Review Modal */}
      {selectedReq && (
        <div className="sa-modal-overlay">
          <div className="sa-modal sa-modal-lg">
            <div className="sa-modal-header">
              <div>
                <h3 className="sa-modal-title">
                  Application Dossier #{selectedReq.referenceNumber || selectedReq.storeRequestId}
                </h3>
                <span
                  className={`sa-badge ${
                    getStatusString(selectedReq) === "APPROVED"
                      ? "approved"
                      : getStatusString(selectedReq) === "REJECTED"
                      ? "rejected"
                      : getStatusString(selectedReq) === "INFO_REQUIRED"
                      ? "info-required"
                      : getStatusString(selectedReq) === "UNDER_REVIEW"
                      ? "under-review"
                      : "pending"
                  }`}
                  style={{ marginTop: "0.35rem" }}
                >
                  Status: {getStatusString(selectedReq).replace(/_/g, " ")}
                </span>
              </div>
              <button
                onClick={closeModal}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "#64748b" }}
              >
                <FaTimes />
              </button>
            </div>

            <div className="sa-modal-body">
              {/* Detailed Dossier Grid */}
              <div className="sa-dossier-grid">
                <div className="sa-dossier-item">
                  <span className="sa-dossier-label"><FaBuilding /> Storefront / Business</span>
                  <span className="sa-dossier-value">{selectedReq.businessName || selectedReq.storeName || "—"}</span>
                </div>
                <div className="sa-dossier-item">
                  <span className="sa-dossier-label"><FaGlobe /> Desired Slug</span>
                  <span className="sa-dossier-value" style={{ color: "#ea580c" }}>
                    /{selectedReq.desiredSlug || "default"}
                  </span>
                </div>
                <div className="sa-dossier-item">
                  <span className="sa-dossier-label"><FaUserTie /> Applicant / Owner</span>
                  <span className="sa-dossier-value">
                    {selectedReq.ownerFirstName || selectedReq.ownerLastName
                      ? `${selectedReq.ownerFirstName || ""} ${selectedReq.ownerLastName || ""}`.trim()
                      : "Applicant"}
                  </span>
                </div>
                <div className="sa-dossier-item">
                  <span className="sa-dossier-label"><FaEnvelope /> Contact Email</span>
                  <span className="sa-dossier-value">{selectedReq.contactEmail || "—"}</span>
                </div>
                <div className="sa-dossier-item">
                  <span className="sa-dossier-label"><FaPhone /> Contact Phone</span>
                  <span className="sa-dossier-value">{selectedReq.contactPhone || "—"}</span>
                </div>
                <div className="sa-dossier-item">
                  <span className="sa-dossier-label"><FaStore /> Category & Scale</span>
                  <span className="sa-dossier-value">
                    {selectedReq.businessCategory || "Fashion"} ({selectedReq.estimatedInventoryScale || "Standard"})
                  </span>
                </div>
                <div className="sa-dossier-item">
                  <span className="sa-dossier-label"><FaCalendarAlt /> Submitted On</span>
                  <span className="sa-dossier-value">
                    {selectedReq.createdAt ? new Date(selectedReq.createdAt).toLocaleString() : "—"}
                  </span>
                </div>
                <div className="sa-dossier-item">
                  <span className="sa-dossier-label">Custom Domain</span>
                  <span className="sa-dossier-value">{selectedReq.customDomain || "Subpath Default"}</span>
                </div>
              </div>

              {/* Existing Notes Display */}
              {selectedReq.inquiryNotes && (
                <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", padding: "0.85rem 1rem", borderRadius: "8px", fontSize: "0.85rem" }}>
                  <strong style={{ color: "#1d4ed8" }}>Current Clarification Request:</strong>
                  <p style={{ margin: "0.25rem 0 0", color: "#1e3a8a" }}>{selectedReq.inquiryNotes}</p>
                </div>
              )}

              {selectedReq.rejectionReason && (
                <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", padding: "0.85rem 1rem", borderRadius: "8px", fontSize: "0.85rem" }}>
                  <strong style={{ color: "#b91c1c" }}>Rejection Reason:</strong>
                  <p style={{ margin: "0.25rem 0 0", color: "#7f1d1d" }}>{selectedReq.rejectionReason}</p>
                </div>
              )}

              {/* Review Decision Tabs */}
              <div className="sa-review-tabs">
                <button
                  type="button"
                  className={`sa-review-tab-btn ${activeTab === "approve" ? "active" : ""}`}
                  onClick={() => { setActiveTab("approve"); setConfirmApprove(false); }}
                >
                  <FaCheck />
                  <span>Approve & Provision</span>
                </button>
                <button
                  type="button"
                  className={`sa-review-tab-btn tab-info ${activeTab === "info" ? "active" : ""}`}
                  onClick={() => setActiveTab("info")}
                >
                  <FaQuestionCircle />
                  <span>Request Clarification</span>
                </button>
                <button
                  type="button"
                  className={`sa-review-tab-btn tab-reject ${activeTab === "reject" ? "active" : ""}`}
                  onClick={() => { setActiveTab("reject"); setConfirmReject(false); }}
                >
                  <FaTimes />
                  <span>Reject Application</span>
                </button>
              </div>

              {/* Tab 1: Approve */}
              {activeTab === "approve" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                      Assign Store Administrator
                    </label>
                    <select
                      value={selectedAdminId}
                      onChange={(e) => setSelectedAdminId(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.65rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.885rem",
                        backgroundColor: "#ffffff",
                      }}
                    >
                      <option value="">-- Assign Later --</option>
                      {admins.map((adm) => (
                        <option key={adm.userId} value={adm.userId}>
                          {adm.firstName} {adm.lastName} ({adm.email}) {adm.assignedStores?.length ? `[${adm.assignedStores.join(", ")}]` : ""}
                        </option>
                      ))}
                    </select>
                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      Grant administrative rights to this store for managing products and orders.
                    </span>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                      Approval Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Internal verification notes (optional)..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.65rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.885rem",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>

                  {confirmApprove && (
                    <div className="sa-confirm-box">
                      <FaExclamationTriangle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
                      <div>
                        <strong>Confirmation Required:</strong> Approving this application will immediately provision
                        the tenant workspace <code>/{selectedReq.desiredSlug}</code> and grant live access. Click "Confirm & Provision Store" below to proceed.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Request Info */}
              {activeTab === "info" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <p style={{ margin: 0, fontSize: "0.885rem", color: "#475569" }}>
                    The applicant can review this inquiry and resubmit documentation through the
                    Track Application portal.
                  </p>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                      Clarification Details *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Specify what details or documents are required (e.g. proof of business registration, corrected catalog)..."
                      value={inquiryNotes}
                      onChange={(e) => setInquiryNotes(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.65rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.885rem",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: Reject */}
              {activeTab === "reject" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <p style={{ margin: 0, fontSize: "0.885rem", color: "#b91c1c" }}>
                    Specify the justification for rejecting this application. The applicant will be notified of this reason.
                  </p>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem" }}>
                      Rejection Reason *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Reason for rejection (e.g. Ineligible category, invalid business registration)..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.65rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.885rem",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>

                  {confirmReject && (
                    <div className="sa-confirm-box" style={{ backgroundColor: "#fef2f2", borderColor: "#fecaca", color: "#991b1b" }}>
                      <FaExclamationTriangle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
                      <div>
                        <strong>Confirm Rejection:</strong> Are you sure you want to reject this application?
                        Click "Confirm Rejection" below to finalize.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="sa-modal-footer">
              <button className="btn-sa-secondary" onClick={closeModal} disabled={submitting}>
                Cancel
              </button>

              {activeTab === "approve" && (
                <button
                  className="btn-sa-primary"
                  onClick={handleApprove}
                  disabled={submitting}
                >
                  {submitting ? <FaSpinner className="fa-spin" /> : <FaCheck />}
                  <span>{confirmApprove ? "Confirm & Provision Store" : "Approve Application"}</span>
                </button>
              )}

              {activeTab === "info" && (
                <button
                  className="btn-sa-orange"
                  onClick={handleRequestInfo}
                  disabled={submitting}
                >
                  {submitting ? <FaSpinner className="fa-spin" /> : <FaQuestionCircle />}
                  <span>Dispatch Information Request</span>
                </button>
              )}

              {activeTab === "reject" && (
                <button
                  className="btn-sa-primary"
                  style={{ backgroundColor: "#dc2626" }}
                  onClick={handleReject}
                  disabled={submitting}
                >
                  {submitting ? <FaSpinner className="fa-spin" /> : <FaTimes />}
                  <span>{confirmReject ? "Confirm Rejection" : "Reject Application"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsQueuePage;
