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
  requestStoreInformation,
  assignStoreAdmin,
  getEligibleAdmins,
  getTenantMemberships,
  assignTenantRole,
  revokeTenantRole,
  getTenantAuditLogs,
  getAllAuditLogs,
} from "../../Services/tenantService";
import {
  Tenant,
  UpdateTenantSettingsRequest,
  CreateTenantRequest,
  StoreRequest,
  CreateStoreRequestDto,
  StoreRequestStatus,
  EligibleAdminDto,
  TenantMembership,
  TenantAuditLogDto,
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
  FaUsers,
  FaUserPlus,
  FaUserShield,
  FaHistory,
  FaTrash,
  FaExclamationTriangle,
  FaUserCog,
  FaQuestionCircle,
} from "react-icons/fa";
import { Link } from "react-router-dom";

export const StoreSettings: React.FC = () => {
  const { tenant, settings, activeSlug, switchTenant, updateSettings } = useTenant();
  const { role, tenantRole } = useAuth();
  const { showToast } = useToast();

  const isSuperAdmin = role === "SuperAdministrator";
  const isPlatformAdmin = role === "Administrator";
  const isStoreAdmin = role === "StoreAdmin" || tenantRole === "StoreAdmin";
  const canManageMembers = isSuperAdmin || isStoreAdmin;

  const [allTenants, setAllTenants] = useState<Tenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    "branding" | "identity" | "hero" | "policies" | "requests" | "memberships" | "audit"
  >("branding");

  // Store Memberships state
  const [memberships, setMemberships] = useState<TenantMembership[]>([]);
  const [loadingMemberships, setLoadingMemberships] = useState<boolean>(false);
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
  const [assigningRole, setAssigningRole] = useState<boolean>(false);
  const [newMembership, setNewMembership] = useState<{ email: string; role: string }>({
    email: "",
    role: "StoreSeller",
  });
  const [revokingId, setRevokingId] = useState<number | null>(null);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<TenantAuditLogDto[]>([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState<boolean>(false);

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
    businessName: "",
    businessCategory: "Fashion & Apparel",
    storeName: "",
    desiredSlug: "",
    businessDescription: "",
    contactEmail: "",
    contactPhone: "",
    ownerFirstName: "",
    ownerLastName: "",
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

  // Enhanced Store Requests Filter & Admin Assignment State
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>("ALL");
  const [requestSearchTerm, setRequestSearchTerm] = useState<string>("");
  const [eligibleAdmins, setEligibleAdmins] = useState<EligibleAdminDto[]>([]);
  const [loadingEligibleAdmins, setLoadingEligibleAdmins] = useState<boolean>(false);

  // Request Information Modal
  const [infoModal, setInfoModal] = useState<{
    open: boolean;
    request: StoreRequest | null;
    inquiryNotes: string;
    adminNotes: string;
  }>({
    open: false,
    request: null,
    inquiryNotes: "",
    adminNotes: "",
  });

  // Assign Admin Modal (for standalone admin assignment to approved stores)
  const [assignAdminModal, setAssignAdminModal] = useState<{
    open: boolean;
    request: StoreRequest | null;
    mode: "existing" | "new";
    selectedUserId: number | "";
    newAdminEmail: string;
    newAdminFirstName: string;
    newAdminLastName: string;
    newAdminPassword: string;
  }>({
    open: false,
    request: null,
    mode: "existing",
    selectedUserId: "",
    newAdminEmail: "",
    newAdminFirstName: "",
    newAdminLastName: "",
    newAdminPassword: "StoreAdmin@123!",
  });

  // Comprehensive Approve & Provision Modal
  const [approveModal, setApproveModal] = useState<{
    open: boolean;
    request: StoreRequest | null;
    adminNotes: string;
    assignMode: "applicant" | "existing" | "new" | "defer";
    selectedUserId: number | "";
    newAdminEmail: string;
    newAdminFirstName: string;
    newAdminLastName: string;
    newAdminPassword: string;
  }>({
    open: false,
    request: null,
    adminNotes: "Approved by Super Administrator. Turnkey storefront provisioned.",
    assignMode: "applicant",
    selectedUserId: "",
    newAdminEmail: "",
    newAdminFirstName: "",
    newAdminLastName: "",
    newAdminPassword: "StoreAdmin@123!",
  });

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

  const filteredRequests = storeRequests.filter((req) => {
    if (requestStatusFilter !== "ALL") {
      const statusNum =
        requestStatusFilter === "PENDING" ? 1 :
        requestStatusFilter === "INFO_REQUIRED" ? 4 :
        requestStatusFilter === "UNDER_REVIEW" ? 5 :
        requestStatusFilter === "APPROVED" ? 2 :
        requestStatusFilter === "REJECTED" ? 3 : -1;

      const reqStatusNum = typeof req.status === "number" ? req.status :
        req.status === StoreRequestStatus.Pending ? 1 :
        req.status === StoreRequestStatus.Approved ? 2 :
        req.status === StoreRequestStatus.Rejected ? 3 :
        req.status === StoreRequestStatus.InformationRequired ? 4 :
        req.status === StoreRequestStatus.UnderReview ? 5 : -1;

      if (reqStatusNum !== statusNum) return false;
    }

    if (requestSearchTerm.trim()) {
      const q = requestSearchTerm.toLowerCase();
      const refMatch = req.referenceNumber?.toLowerCase().includes(q);
      const nameMatch = req.storeName?.toLowerCase().includes(q);
      const bizMatch = req.businessName?.toLowerCase().includes(q);
      const slugMatch = req.desiredSlug?.toLowerCase().includes(q);
      const emailMatch = (req.contactEmail || req.requesterEmail)?.toLowerCase().includes(q);
      const ownerMatch = `${req.ownerFirstName || ""} ${req.ownerLastName || ""}`.toLowerCase().includes(q);
      if (!refMatch && !nameMatch && !bizMatch && !slugMatch && !emailMatch && !ownerMatch) {
        return false;
      }
    }

    return true;
  });

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
        businessName: "",
        businessCategory: "Fashion & Apparel",
        storeName: "",
        desiredSlug: "",
        businessDescription: "",
        contactEmail: "",
        contactPhone: "",
        ownerFirstName: "",
        ownerLastName: "",
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

  const fetchEligibleAdminsList = async () => {
    if (!isSuperAdmin) return;
    try {
      setLoadingEligibleAdmins(true);
      const list = await getEligibleAdmins();
      setEligibleAdmins(list);
    } catch (err) {
      console.warn("Could not fetch eligible admins:", err);
    } finally {
      setLoadingEligibleAdmins(false);
    }
  };

  const handleRequestInfoSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!infoModal.request) return;
    if (!infoModal.inquiryNotes.trim()) {
      showToast("warning", "Please provide inquiry notes detailing the needed info.");
      return;
    }

    try {
      setReviewing(true);
      await requestStoreInformation(
        infoModal.request.storeRequestId,
        infoModal.inquiryNotes,
        infoModal.adminNotes
      );
      showToast(
        "info",
        `Requested additional info for application #${infoModal.request.referenceNumber || infoModal.request.storeRequestId}.`
      );
      setInfoModal({ open: false, request: null, inquiryNotes: "", adminNotes: "" });
      await fetchRequests();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to request information";
      showToast("error", msg);
    } finally {
      setReviewing(false);
    }
  };

  const handleApproveAndAssignSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!approveModal.request) return;

    try {
      setReviewing(true);
      const req = approveModal.request;
      const reviewPayload: any = {
        adminNotes: approveModal.adminNotes,
        notes: approveModal.adminNotes,
      };

      if (approveModal.assignMode === "applicant") {
        if (req.requesterUserId && req.requesterUserId > 0) {
          reviewPayload.assignAdminUserId = req.requesterUserId;
        } else {
          reviewPayload.createNewAdmin = true;
          reviewPayload.adminEmail = req.contactEmail;
          reviewPayload.adminFirstName = req.ownerFirstName || "Store";
          reviewPayload.adminLastName = req.ownerLastName || "Owner";
          reviewPayload.adminPassword = "StoreAdmin@123!";
        }
      } else if (approveModal.assignMode === "existing") {
        if (!approveModal.selectedUserId) {
          showToast("warning", "Please select an existing platform user to assign as admin.");
          setReviewing(false);
          return;
        }
        reviewPayload.assignAdminUserId = Number(approveModal.selectedUserId);
      } else if (approveModal.assignMode === "new") {
        if (!approveModal.newAdminEmail || !approveModal.newAdminPassword) {
          showToast("warning", "Please provide email and password for the new admin account.");
          setReviewing(false);
          return;
        }
        reviewPayload.createNewAdmin = true;
        reviewPayload.adminEmail = approveModal.newAdminEmail;
        reviewPayload.adminFirstName = approveModal.newAdminFirstName || req.ownerFirstName;
        reviewPayload.adminLastName = approveModal.newAdminLastName || req.ownerLastName;
        reviewPayload.adminPassword = approveModal.newAdminPassword;
      }
      // "defer": leaves store as SetupPending

      await approveStoreRequest(req.storeRequestId, reviewPayload);
      showToast("success", `Store "${req.storeName}" has been approved!`);
      const updatedTenants = await getAllTenants();
      setAllTenants(updatedTenants);
      setApproveModal({
        open: false,
        request: null,
        adminNotes: "",
        assignMode: "applicant",
        selectedUserId: "",
        newAdminEmail: "",
        newAdminFirstName: "",
        newAdminLastName: "",
        newAdminPassword: "StoreAdmin@123!",
      });
      await fetchRequests();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to approve store request";
      showToast("error", msg);
    } finally {
      setReviewing(false);
    }
  };

  const handleAssignAdminSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!assignAdminModal.request) return;

    try {
      setReviewing(true);
      const req = assignAdminModal.request;
      let payload: any = {};
      if (assignAdminModal.mode === "existing") {
        if (!assignAdminModal.selectedUserId) {
          showToast("warning", "Please select an administrator user.");
          setReviewing(false);
          return;
        }
        payload = { userId: Number(assignAdminModal.selectedUserId) };
      } else {
        if (!assignAdminModal.newAdminEmail || !assignAdminModal.newAdminPassword) {
          showToast("warning", "Please enter new admin email and password.");
          setReviewing(false);
          return;
        }
        payload = {
          createNew: true,
          email: assignAdminModal.newAdminEmail,
          firstName: assignAdminModal.newAdminFirstName || req.ownerFirstName,
          lastName: assignAdminModal.newAdminLastName || req.ownerLastName,
          password: assignAdminModal.newAdminPassword,
        };
      }

      await assignStoreAdmin(req.storeRequestId, payload);
      showToast("success", `StoreAdmin successfully assigned to "${req.storeName}"! Storefront is now Active.`);
      const updatedTenants = await getAllTenants();
      setAllTenants(updatedTenants);
      setAssignAdminModal({
        open: false,
        request: null,
        mode: "existing",
        selectedUserId: "",
        newAdminEmail: "",
        newAdminFirstName: "",
        newAdminLastName: "",
        newAdminPassword: "StoreAdmin@123!",
      });
      await fetchRequests();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to assign admin";
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

  const fetchMemberships = async () => {
    if (!tenant?.tenantId) return;
    try {
      setLoadingMemberships(true);
      const list = await getTenantMemberships(tenant.tenantId);
      setMemberships(list);
    } catch (err: unknown) {
      console.warn("Could not fetch memberships:", err);
    } finally {
      setLoadingMemberships(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setLoadingAuditLogs(true);
      if (isSuperAdmin && activeSlug === "default") {
        const list = await getAllAuditLogs();
        setAuditLogs(list);
      } else if (tenant?.tenantId) {
        const list = await getTenantAuditLogs(tenant.tenantId);
        setAuditLogs(list);
      }
    } catch (err: unknown) {
      console.warn("Could not fetch audit logs:", err);
    } finally {
      setLoadingAuditLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === "requests") {
      fetchRequests();
      if (isSuperAdmin) {
        fetchEligibleAdminsList();
      }
    } else if (activeTab === "memberships") {
      fetchMemberships();
    } else if (activeTab === "audit") {
      fetchAuditLogs();
    }
  }, [activeTab, tenant?.tenantId, activeSlug, isSuperAdmin]);

  const handleAssignRole = async (e: FormEvent) => {
    e.preventDefault();
    if (!tenant?.tenantId || !newMembership.email.trim()) {
      showToast("warning", "Please provide a valid user email.");
      return;
    }

    try {
      setAssigningRole(true);
      const res = await assignTenantRole(tenant.tenantId, {
        email: newMembership.email.trim(),
        role: newMembership.role,
      });
      showToast(
        "success",
        `Role "${res.role}" assigned to "${res.email}" for store "${tenant.storeName}"!`
      );
      setShowAssignModal(false);
      setNewMembership({ email: "", role: "StoreSeller" });
      await fetchMemberships();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to assign role";
      showToast("error", msg);
    } finally {
      setAssigningRole(false);
    }
  };

  const handleRevokeRole = async (userId: number, roleToRevoke: string, email: string) => {
    if (!tenant?.tenantId) return;
    if (
      !window.confirm(
        `Are you sure you want to revoke the "${roleToRevoke}" role from ${email}?`
      )
    ) {
      return;
    }

    try {
      setRevokingId(userId);
      const res = await revokeTenantRole(tenant.tenantId, {
        userId,
        role: roleToRevoke,
      });
      showToast("info", res.message || `Role revoked from ${email}.`);
      await fetchMemberships();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to revoke role";
      showToast("error", msg);
    } finally {
      setRevokingId(null);
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
            to={`/store/${activeSlug || "default"}`}
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
          {canManageMembers && (
            <button
              type="button"
              className={`store-settings-nav__item ${activeTab === "memberships" ? "active" : ""}`}
              onClick={() => setActiveTab("memberships")}
            >
              <FaUsers />
              <span>Store Members</span>
            </button>
          )}
          {(isSuperAdmin || canManageMembers) && (
            <button
              type="button"
              className={`store-settings-nav__item ${activeTab === "audit" ? "active" : ""}`}
              onClick={() => setActiveTab("audit")}
            >
              <FaHistory />
              <span>Security & Audit</span>
            </button>
          )}
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
                      ? "Review, clarify, approve, and assign store administrators for merchant storefront applications."
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

              {/* Status Filter Pills & Search Bar */}
              <div className="requests-filter-bar">
                <div className="requests-filter-pills">
                  {[
                    { id: "ALL", label: "All Applications", count: storeRequests.length },
                    {
                      id: "PENDING",
                      label: "Pending",
                      count: storeRequests.filter(
                        (r) => r.status === StoreRequestStatus.Pending || (r as any).status === 1
                      ).length,
                    },
                    {
                      id: "INFO_REQUIRED",
                      label: "Info Required",
                      count: storeRequests.filter(
                        (r) => r.status === StoreRequestStatus.InformationRequired || (r as any).status === 4
                      ).length,
                    },
                    {
                      id: "UNDER_REVIEW",
                      label: "Under Review",
                      count: storeRequests.filter(
                        (r) => r.status === StoreRequestStatus.UnderReview || (r as any).status === 5
                      ).length,
                    },
                    {
                      id: "APPROVED",
                      label: "Approved",
                      count: storeRequests.filter(
                        (r) => r.status === StoreRequestStatus.Approved || (r as any).status === 2
                      ).length,
                    },
                    {
                      id: "REJECTED",
                      label: "Rejected",
                      count: storeRequests.filter(
                        (r) => r.status === StoreRequestStatus.Rejected || (r as any).status === 3
                      ).length,
                    },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      className={`filter-pill-btn ${requestStatusFilter === filter.id ? "active" : ""}`}
                      onClick={() => setRequestStatusFilter(filter.id)}
                    >
                      {filter.label} ({filter.count})
                    </button>
                  ))}
                </div>

                <div className="requests-search-box">
                  <input
                    type="text"
                    placeholder="Search by ref #, store, name, or email..."
                    value={requestSearchTerm}
                    onChange={(e) => setRequestSearchTerm(e.target.value)}
                  />
                </div>
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
                ) : filteredRequests.length === 0 ? (
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
                      {requestSearchTerm || requestStatusFilter !== "ALL"
                        ? "No applications match your search or filter criteria."
                        : isSuperAdmin
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
                    {filteredRequests.map((req) => {
                      const isPending =
                        req.status === StoreRequestStatus.Pending ||
                        (req as any).status === 1;
                      const isInfoRequired =
                        req.status === StoreRequestStatus.InformationRequired ||
                        (req as any).status === 4;
                      const isUnderReview =
                        req.status === StoreRequestStatus.UnderReview ||
                        (req as any).status === 5;
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
                              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.35rem" }}>
                                {req.referenceNumber && (
                                  <span
                                    style={{
                                      fontFamily: "monospace",
                                      fontWeight: 700,
                                      fontSize: "0.85rem",
                                      background: "#0f172a",
                                      color: "#ffffff",
                                      padding: "0.2rem 0.55rem",
                                      borderRadius: "4px",
                                      letterSpacing: "0.05em",
                                    }}
                                  >
                                    {req.referenceNumber}
                                  </span>
                                )}
                                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                                  Submitted {new Date(req.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <h3 className="request-card__title">
                                {req.storeName}
                                <span className="request-card__slug">
                                  /store/{req.desiredSlug}
                                </span>
                              </h3>
                              <div className="request-card__meta" style={{ marginTop: "0.3rem" }}>
                                <span>
                                  Applicant: <strong>{req.ownerFirstName} {req.ownerLastName}</strong> ({req.contactEmail || req.requesterEmail})
                                </span>
                                {req.businessName && (
                                  <span>
                                    Legal Entity: <strong>{req.businessName}</strong>
                                  </span>
                                )}
                              </div>
                            </div>

                            <div>
                              {isPending && (
                                <span className="status-badge status-badge--pending">
                                  <FaClock /> Pending Review
                                </span>
                              )}
                              {isUnderReview && (
                                <span className="status-badge status-badge--under-review">
                                  <FaHistory /> Under Review (Resubmitted)
                                </span>
                              )}
                              {isInfoRequired && (
                                <span className="status-badge status-badge--info-required">
                                  <FaExclamationTriangle /> Info Required
                                </span>
                              )}
                              {isApproved && (
                                <span className="status-badge status-badge--approved">
                                  <FaCheck /> Approved {req.assignedAdminUserId ? "(Active)" : "(Awaiting Admin)"}
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
                                Category & Scale
                              </span>
                              <span className="request-detail-item__value">
                                {req.businessCategory || "General Retail"} • {req.estimatedInventoryScale || "Standard"}
                              </span>
                            </div>
                            <div className="request-detail-item">
                              <span className="request-detail-item__label">
                                Tax ID / Reg Number
                              </span>
                              <span className="request-detail-item__value">
                                {req.taxIdOrRegistrationNumber || "Not provided"}
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
                                Business Address
                              </span>
                              <span className="request-detail-item__value">
                                {req.businessAddress || "Not provided"}
                              </span>
                            </div>
                            {req.websiteOrSocialUrl && (
                              <div className="request-detail-item">
                                <span className="request-detail-item__label">
                                  Website / Social Link
                                </span>
                                <span className="request-detail-item__value">
                                  <a
                                    href={req.websiteOrSocialUrl.startsWith("http") ? req.websiteOrSocialUrl : `https://${req.websiteOrSocialUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: "#2563eb", textDecoration: "underline" }}
                                  >
                                    {req.websiteOrSocialUrl}
                                  </a>
                                </span>
                              </div>
                            )}
                            {req.customDomain && (
                              <div className="request-detail-item">
                                <span className="request-detail-item__label">
                                  Requested Custom Domain
                                </span>
                                <span className="request-detail-item__value">
                                  {req.customDomain}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Clarification Inquiry Notes Banner */}
                          {req.inquiryNotes && (
                            <div
                              style={{
                                background: "#fffbeb",
                                border: "1px solid #fde68a",
                                borderRadius: "8px",
                                padding: "0.85rem 1rem",
                                color: "#92400e",
                                fontSize: "0.85rem",
                              }}
                            >
                              <div style={{ fontWeight: 700, marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                <FaQuestionCircle /> Super Admin Information Request:
                              </div>
                              <div>{req.inquiryNotes}</div>
                              {req.resubmittedAt && (
                                <div style={{ fontSize: "0.75rem", color: "#b45309", marginTop: "0.35rem" }}>
                                  Applicant resubmitted response on {new Date(req.resubmittedAt).toLocaleString()}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Admin Notes */}
                          {req.adminNotes && (
                            <div className="request-card__notes">
                              <div className="request-card__notes-title">
                                Admin Feedback / Internal Notes:
                              </div>
                              <div>{req.adminNotes}</div>
                            </div>
                          )}

                          {/* Rejection Reason */}
                          {req.rejectionReason && (
                            <div
                              style={{
                                background: "#fef2f2",
                                borderLeft: "3px solid #ef4444",
                                padding: "0.75rem 1rem",
                                borderRadius: "0 8px 8px 0",
                                fontSize: "0.85rem",
                                color: "#991b1b",
                              }}
                            >
                              <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>
                                Rejection Reason:
                              </div>
                              <div>{req.rejectionReason}</div>
                            </div>
                          )}

                          {/* Storefront / Tenant Info */}
                          {req.createdTenantId && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                background: "#f0fdf4",
                                border: "1px solid #bbf7d0",
                                borderRadius: "8px",
                                padding: "0.75rem 1rem",
                                fontSize: "0.85rem",
                                color: "#166534",
                              }}
                            >
                              <div>
                                <strong>Provisioned Tenant: #{req.createdTenantId}</strong> ({req.desiredSlug})
                                {req.assignedAdminUserId ? (
                                  <span style={{ marginLeft: "0.75rem", color: "#15803d" }}>
                                    ✓ Admin Assigned (User #{req.assignedAdminUserId})
                                  </span>
                                ) : (
                                  <span style={{ marginLeft: "0.75rem", color: "#b45309", fontWeight: 600 }}>
                                    ⚠ Awaiting Admin Assignment (Setup Pending)
                                  </span>
                                )}
                              </div>
                              <Link
                                to={`/store/${req.desiredSlug}`}
                                target="_blank"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.35rem",
                                  fontWeight: 600,
                                  color: "#16a34a",
                                }}
                              >
                                <span>Visit Store</span> <FaExternalLinkAlt style={{ fontSize: "0.75rem" }} />
                              </Link>
                            </div>
                          )}

                          {/* Action Buttons */}
                          {isSuperAdmin && (
                            <div className="request-card__actions">
                              {(isPending || isUnderReview) && (
                                <>
                                  <button
                                    type="button"
                                    className="store-req-btn store-req-btn--approve"
                                    onClick={() => {
                                      fetchEligibleAdminsList();
                                      setApproveModal({
                                        open: true,
                                        request: req,
                                        adminNotes: `Approved by Super Admin on ${new Date().toLocaleDateString()}. Storefront provisioned.`,
                                        assignMode: "applicant",
                                        selectedUserId: "",
                                        newAdminEmail: req.contactEmail || "",
                                        newAdminFirstName: req.ownerFirstName || "Store",
                                        newAdminLastName: req.ownerLastName || "Owner",
                                        newAdminPassword: "StoreAdmin@123!",
                                      });
                                    }}
                                  >
                                    <FaCheck /> <span>Approve & Assign Admin</span>
                                  </button>

                                  <button
                                    type="button"
                                    className="store-req-btn store-req-btn--info"
                                    onClick={() =>
                                      setInfoModal({
                                        open: true,
                                        request: req,
                                        inquiryNotes: req.inquiryNotes || "",
                                        adminNotes: req.adminNotes || "",
                                      })
                                    }
                                  >
                                    <FaQuestionCircle /> <span>Request Information</span>
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
                                    <FaBan /> <span>Reject</span>
                                  </button>
                                </>
                              )}

                              {isInfoRequired && (
                                <>
                                  <button
                                    type="button"
                                    className="store-req-btn store-req-btn--info"
                                    onClick={() =>
                                      setInfoModal({
                                        open: true,
                                        request: req,
                                        inquiryNotes: req.inquiryNotes || "",
                                        adminNotes: req.adminNotes || "",
                                      })
                                    }
                                  >
                                    <FaQuestionCircle /> <span>Update Request Inquiry</span>
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
                                    <FaBan /> <span>Reject</span>
                                  </button>
                                </>
                              )}

                              {isApproved && !req.assignedAdminUserId && (
                                <button
                                  type="button"
                                  className="store-req-btn store-req-btn--assign"
                                  onClick={() => {
                                    fetchEligibleAdminsList();
                                    setAssignAdminModal({
                                      open: true,
                                      request: req,
                                      mode: "existing",
                                      selectedUserId: "",
                                      newAdminEmail: req.contactEmail || "",
                                      newAdminFirstName: req.ownerFirstName || "",
                                      newAdminLastName: req.ownerLastName || "",
                                      newAdminPassword: "StoreAdmin@123!",
                                    });
                                  }}
                                >
                                  <FaUserCog /> <span>Assign Store Admin & Activate</span>
                                </button>
                              )}
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

          {/* 6. Store Memberships Tab */}
          {activeTab === "memberships" && (
            <div className="store-settings-panel">
              <div className="memberships-header-row">
                <div className="store-settings-panel__header" style={{ marginBottom: 0 }}>
                  <h2>Store Team & Access Control</h2>
                  <p>
                    Manage administrator, seller, and staff memberships for{" "}
                    <strong>{tenant?.storeName || activeSlug}</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  className="store-settings-btn store-settings-btn--secondary"
                  onClick={() => setShowAssignModal(true)}
                  style={{ background: "#2563eb", color: "#ffffff", border: "none" }}
                >
                  <FaUserPlus /> <span>Assign Store Role</span>
                </button>
              </div>

              {loadingMemberships ? (
                <div className="requests-loading">
                  <FaSpinner className="spin" />
                  <span>Loading store memberships...</span>
                </div>
              ) : memberships.length === 0 ? (
                <div className="requests-empty">
                  <FaUsers className="requests-empty__icon" />
                  <h3>No Members Found</h3>
                  <p>No explicit roles have been assigned to this storefront yet.</p>
                </div>
              ) : (
                <div className="members-table-wrapper">
                  <table className="members-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Store Role</th>
                        <th>Status</th>
                        <th>Assigned Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {memberships.map((m) => {
                        const roleClass =
                          m.role === "StoreAdmin"
                            ? "role-badge--admin"
                            : m.role === "StoreSeller"
                            ? "role-badge--seller"
                            : "role-badge--customer";

                        return (
                          <tr key={m.tenantUserMembershipId}>
                            <td>
                              <div style={{ fontWeight: 600, color: "#0f172a" }}>
                                {m.firstName || m.lastName
                                  ? `${m.firstName || ""} ${m.lastName || ""}`.trim()
                                  : m.email}
                              </div>
                              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                                {m.email}
                              </div>
                            </td>
                            <td>
                              <span className={`role-badge ${roleClass}`}>
                                <FaUserShield style={{ fontSize: "0.75rem" }} />
                                {m.role}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`status-badge ${
                                  m.status === "Active"
                                    ? "status-badge--approved"
                                    : "status-badge--rejected"
                                }`}
                              >
                                {m.status}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontSize: "0.85rem", color: "#475569" }}>
                                {new Date(m.assignedAt).toLocaleDateString()}
                              </div>
                              {m.assignedByEmail && (
                                <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                                  by {m.assignedByEmail}
                                </div>
                              )}
                            </td>
                            <td>
                              {m.status === "Active" && (
                                <button
                                  type="button"
                                  className="btn-revoke"
                                  disabled={revokingId === m.userId}
                                  onClick={() => handleRevokeRole(m.userId, m.role, m.email)}
                                >
                                  {revokingId === m.userId ? (
                                    <FaSpinner className="spin" />
                                  ) : (
                                    <FaTrash />
                                  )}
                                  <span>Revoke</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 7. Store Audit Trail Tab */}
          {activeTab === "audit" && (
            <div className="store-settings-panel">
              <div className="store-settings-panel__header">
                <h2>Security & Store Audit Trail</h2>
                <p>
                  Immutable history of role assignments, configuration updates, and store lifecycle
                  events for <strong>{tenant?.storeName || activeSlug}</strong>.
                </p>
              </div>

              {loadingAuditLogs ? (
                <div className="requests-loading">
                  <FaSpinner className="spin" />
                  <span>Loading audit log entries...</span>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="requests-empty">
                  <FaHistory className="requests-empty__icon" />
                  <h3>No Audit Logs Recorded</h3>
                  <p>Security and role actions for this store will appear here.</p>
                </div>
              ) : (
                <div className="members-table-wrapper">
                  <table className="members-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Actor</th>
                        <th>Store</th>
                        <th>Action</th>
                        <th>Details</th>
                        <th>IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.auditLogId}>
                          <td style={{ whiteSpace: "nowrap", fontSize: "0.8rem", color: "#64748b" }}>
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td style={{ fontWeight: 600, color: "#0f172a" }}>
                            {log.actorEmail || `User #${log.actorUserId || "System"}`}
                          </td>
                          <td style={{ fontSize: "0.85rem", color: "#2563eb" }}>
                            {log.tenantSlug || `#${log.tenantId}`}
                          </td>
                          <td>
                            <span className="audit-action-badge">{log.action}</span>
                          </td>
                          <td style={{ fontSize: "0.85rem", color: "#334155", maxWidth: "300px" }}>
                            {log.details || "—"}
                          </td>
                          <td style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                            {log.ipAddress || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Form Submit Footer - Only for Settings tabs */}
          {activeTab !== "requests" && activeTab !== "memberships" && activeTab !== "audit" && (
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

      {/* Super Admin Request Information Modal */}
      {infoModal.open && infoModal.request && (
        <div className="store-modal-overlay">
          <div className="store-modal" role="dialog" aria-modal="true" aria-labelledby="info-modal-title">
            <div className="store-modal__header">
              <h2 id="info-modal-title">Request Information from Applicant</h2>
              <button
                type="button"
                className="store-modal__close-btn"
                onClick={() => setInfoModal({ open: false, request: null, inquiryNotes: "", adminNotes: "" })}
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleRequestInfoSubmit}>
              <div className="store-modal__body">
                <p style={{ margin: 0, fontSize: "0.95rem", color: "#334155", lineHeight: 1.5 }}>
                  Request additional details, documents, or clarifications for{" "}
                  <strong>"{infoModal.request.storeName}"</strong> (Ref:{" "}
                  <code>{infoModal.request.referenceNumber || infoModal.request.storeRequestId}</code>).
                  The applicant will see this notification on their public tracking portal.
                </p>

                <div className="store-settings-field">
                  <label htmlFor="inquiryNotes">Inquiry / Clarification Required *</label>
                  <textarea
                    id="inquiryNotes"
                    required
                    rows={4}
                    value={infoModal.inquiryNotes}
                    onChange={(e) => setInfoModal((prev) => ({ ...prev, inquiryNotes: e.target.value }))}
                    placeholder="Specify exactly what information, identification, catalog details, or legal filings are required..."
                    className="store-settings-textarea"
                  />
                  <span className="field-hint">This text will be visible to the applicant on /apply/status.</span>
                </div>

                <div className="store-settings-field">
                  <label htmlFor="infoAdminNotes">Internal Admin Notes (Optional)</label>
                  <input
                    type="text"
                    id="infoAdminNotes"
                    value={infoModal.adminNotes}
                    onChange={(e) => setInfoModal((prev) => ({ ...prev, adminNotes: e.target.value }))}
                    placeholder="Internal memo for audit logs..."
                    className="store-settings-input"
                  />
                </div>
              </div>

              <div className="store-modal__footer">
                <button
                  type="button"
                  className="store-settings-btn store-settings-btn--cancel"
                  onClick={() => setInfoModal({ open: false, request: null, inquiryNotes: "", adminNotes: "" })}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="store-req-btn store-req-btn--info"
                  disabled={reviewing}
                >
                  {reviewing ? (
                    <>
                      <FaSpinner className="spin" />
                      <span>Sending Request...</span>
                    </>
                  ) : (
                    <>
                      <FaQuestionCircle />
                      <span>Send Information Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Super Admin Comprehensive Approve & Provision Modal */}
      {approveModal.open && approveModal.request && (
        <div className="store-modal-overlay">
          <div className="store-modal" style={{ maxWidth: "640px" }} role="dialog" aria-modal="true" aria-labelledby="approve-modal-title">
            <div className="store-modal__header">
              <h2 id="approve-modal-title">Approve & Provision Storefront</h2>
              <button
                type="button"
                className="store-modal__close-btn"
                onClick={() =>
                  setApproveModal({
                    open: false,
                    request: null,
                    adminNotes: "",
                    assignMode: "applicant",
                    selectedUserId: "",
                    newAdminEmail: "",
                    newAdminFirstName: "",
                    newAdminLastName: "",
                    newAdminPassword: "StoreAdmin@123!",
                  })
                }
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleApproveAndAssignSubmit}>
              <div className="store-modal__body">
                <div style={{ background: "#f8fafc", padding: "0.85rem 1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>
                    {approveModal.request.storeName}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.2rem" }}>
                    Slug: <code>/store/{approveModal.request.desiredSlug}</code> • Ref: <code>{approveModal.request.referenceNumber || approveModal.request.storeRequestId}</code>
                  </div>
                </div>

                <div className="store-settings-field">
                  <label>Store Administrator Assignment Strategy *</label>
                  <div className="admin-assign-box">
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      <label className="admin-assign-option">
                        <input
                          type="radio"
                          name="assignMode"
                          value="applicant"
                          checked={approveModal.assignMode === "applicant"}
                          onChange={() => setApproveModal((prev) => ({ ...prev, assignMode: "applicant" }))}
                        />
                        <div>
                          <strong>Assign Store Applicant as Admin</strong>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 400 }}>
                            Designate {approveModal.request.ownerFirstName} {approveModal.request.ownerLastName} ({approveModal.request.contactEmail || approveModal.request.requesterEmail}). Existing account will be promoted, or a fresh account created with initial password <code>StoreAdmin@123!</code>.
                          </div>
                        </div>
                      </label>

                      <label className="admin-assign-option">
                        <input
                          type="radio"
                          name="assignMode"
                          value="existing"
                          checked={approveModal.assignMode === "existing"}
                          onChange={() => setApproveModal((prev) => ({ ...prev, assignMode: "existing" }))}
                        />
                        <div>
                          <strong>Assign Existing Platform User</strong>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 400 }}>
                            Select an existing registered account and grant them the StoreAdmin role.
                          </div>
                        </div>
                      </label>

                      {approveModal.assignMode === "existing" && (
                        <div style={{ marginLeft: "1.5rem" }}>
                          {loadingEligibleAdmins ? (
                            <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Loading platform users...</div>
                          ) : (
                            <select
                              className="store-settings-input"
                              value={approveModal.selectedUserId}
                              onChange={(e) => setApproveModal((prev) => ({ ...prev, selectedUserId: Number(e.target.value) || "" }))}
                              required={approveModal.assignMode === "existing"}
                            >
                              <option value="">-- Select Platform User --</option>
                              {eligibleAdmins.map((u) => (
                                <option key={u.userId} value={u.userId}>
                                  {u.firstName} {u.lastName} ({u.email}) [{u.roles.join(", ") || "Customer"}]
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      )}

                      <label className="admin-assign-option">
                        <input
                          type="radio"
                          name="assignMode"
                          value="new"
                          checked={approveModal.assignMode === "new"}
                          onChange={() => setApproveModal((prev) => ({ ...prev, assignMode: "new" }))}
                        />
                        <div>
                          <strong>Create Fresh Store Administrator Account</strong>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 400 }}>
                            Provision a brand-new administrator account specifically for this store.
                          </div>
                        </div>
                      </label>

                      {approveModal.assignMode === "new" && (
                        <div style={{ marginLeft: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                          <input
                            type="text"
                            placeholder="First Name"
                            className="store-settings-input"
                            value={approveModal.newAdminFirstName}
                            onChange={(e) => setApproveModal((prev) => ({ ...prev, newAdminFirstName: e.target.value }))}
                            required
                          />
                          <input
                            type="text"
                            placeholder="Last Name"
                            className="store-settings-input"
                            value={approveModal.newAdminLastName}
                            onChange={(e) => setApproveModal((prev) => ({ ...prev, newAdminLastName: e.target.value }))}
                            required
                          />
                          <input
                            type="email"
                            placeholder="Admin Email"
                            className="store-settings-input"
                            style={{ gridColumn: "span 2" }}
                            value={approveModal.newAdminEmail}
                            onChange={(e) => setApproveModal((prev) => ({ ...prev, newAdminEmail: e.target.value }))}
                            required
                          />
                          <input
                            type="password"
                            placeholder="Temporary Password"
                            className="store-settings-input"
                            style={{ gridColumn: "span 2" }}
                            value={approveModal.newAdminPassword}
                            onChange={(e) => setApproveModal((prev) => ({ ...prev, newAdminPassword: e.target.value }))}
                            required
                          />
                        </div>
                      )}

                      <label className="admin-assign-option">
                        <input
                          type="radio"
                          name="assignMode"
                          value="defer"
                          checked={approveModal.assignMode === "defer"}
                          onChange={() => setApproveModal((prev) => ({ ...prev, assignMode: "defer" }))}
                        />
                        <div>
                          <strong>Defer Admin Assignment (Setup Pending)</strong>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 400 }}>
                            Provisions storefront in SetupPending state. Storefront remains inaccessible to shoppers until an admin is assigned later.
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="store-settings-field">
                  <label htmlFor="approveAdminNotes">Approval Notes / Welcome Message</label>
                  <textarea
                    id="approveAdminNotes"
                    rows={2}
                    value={approveModal.adminNotes}
                    onChange={(e) => setApproveModal((prev) => ({ ...prev, adminNotes: e.target.value }))}
                    className="store-settings-textarea"
                  />
                </div>
              </div>

              <div className="store-modal__footer">
                <button
                  type="button"
                  className="store-settings-btn store-settings-btn--cancel"
                  onClick={() =>
                    setApproveModal({
                      open: false,
                      request: null,
                      adminNotes: "",
                      assignMode: "applicant",
                      selectedUserId: "",
                      newAdminEmail: "",
                      newAdminFirstName: "",
                      newAdminLastName: "",
                      newAdminPassword: "StoreAdmin@123!",
                    })
                  }
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="store-req-btn store-req-btn--approve"
                  disabled={reviewing}
                >
                  {reviewing ? (
                    <>
                      <FaSpinner className="spin" />
                      <span>Provisioning Storefront...</span>
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      <span>Approve & Provision</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Super Admin Standalone Assign Admin Modal */}
      {assignAdminModal.open && assignAdminModal.request && (
        <div className="store-modal-overlay">
          <div className="store-modal" role="dialog" aria-modal="true" aria-labelledby="assign-admin-modal-title">
            <div className="store-modal__header">
              <h2 id="assign-admin-modal-title">Assign Store Administrator</h2>
              <button
                type="button"
                className="store-modal__close-btn"
                onClick={() =>
                  setAssignAdminModal({
                    open: false,
                    request: null,
                    mode: "existing",
                    selectedUserId: "",
                    newAdminEmail: "",
                    newAdminFirstName: "",
                    newAdminLastName: "",
                    newAdminPassword: "StoreAdmin@123!",
                  })
                }
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleAssignAdminSubmit}>
              <div className="store-modal__body">
                <p style={{ margin: 0, fontSize: "0.95rem", color: "#334155", lineHeight: 1.5 }}>
                  Assigning a Store Admin will transition <strong>"{assignAdminModal.request.storeName}"</strong> from SetupPending to <strong>Active</strong>, allowing shoppers to access the storefront.
                </p>

                <div className="store-settings-field">
                  <div className="admin-assign-options">
                    <label className="admin-assign-option">
                      <input
                        type="radio"
                        name="assignAdminMode"
                        value="existing"
                        checked={assignAdminModal.mode === "existing"}
                        onChange={() => setAssignAdminModal((prev) => ({ ...prev, mode: "existing" }))}
                      />
                      <span>Select Existing User</span>
                    </label>
                    <label className="admin-assign-option">
                      <input
                        type="radio"
                        name="assignAdminMode"
                        value="new"
                        checked={assignAdminModal.mode === "new"}
                        onChange={() => setAssignAdminModal((prev) => ({ ...prev, mode: "new" }))}
                      />
                      <span>Create New Account</span>
                    </label>
                  </div>

                  {assignAdminModal.mode === "existing" ? (
                    <div>
                      {loadingEligibleAdmins ? (
                        <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Loading platform users...</div>
                      ) : (
                        <select
                          className="store-settings-input"
                          value={assignAdminModal.selectedUserId}
                          onChange={(e) => setAssignAdminModal((prev) => ({ ...prev, selectedUserId: Number(e.target.value) || "" }))}
                          required
                        >
                          <option value="">-- Select Platform User --</option>
                          {eligibleAdmins.map((u) => (
                            <option key={u.userId} value={u.userId}>
                              {u.firstName} {u.lastName} ({u.email}) [{u.roles.join(", ") || "Customer"}]
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      <input
                        type="text"
                        placeholder="First Name"
                        className="store-settings-input"
                        value={assignAdminModal.newAdminFirstName}
                        onChange={(e) => setAssignAdminModal((prev) => ({ ...prev, newAdminFirstName: e.target.value }))}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        className="store-settings-input"
                        value={assignAdminModal.newAdminLastName}
                        onChange={(e) => setAssignAdminModal((prev) => ({ ...prev, newAdminLastName: e.target.value }))}
                        required
                      />
                      <input
                        type="email"
                        placeholder="Admin Email"
                        className="store-settings-input"
                        style={{ gridColumn: "span 2" }}
                        value={assignAdminModal.newAdminEmail}
                        onChange={(e) => setAssignAdminModal((prev) => ({ ...prev, newAdminEmail: e.target.value }))}
                        required
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        className="store-settings-input"
                        style={{ gridColumn: "span 2" }}
                        value={assignAdminModal.newAdminPassword}
                        onChange={(e) => setAssignAdminModal((prev) => ({ ...prev, newAdminPassword: e.target.value }))}
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="store-modal__footer">
                <button
                  type="button"
                  className="store-settings-btn store-settings-btn--cancel"
                  onClick={() =>
                    setAssignAdminModal({
                      open: false,
                      request: null,
                      mode: "existing",
                      selectedUserId: "",
                      newAdminEmail: "",
                      newAdminFirstName: "",
                      newAdminLastName: "",
                      newAdminPassword: "StoreAdmin@123!",
                    })
                  }
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="store-req-btn store-req-btn--assign"
                  disabled={reviewing}
                >
                  {reviewing ? (
                    <>
                      <FaSpinner className="spin" />
                      <span>Assigning...</span>
                    </>
                  ) : (
                    <>
                      <FaUserCog />
                      <span>Assign Admin & Activate</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Store Role Modal */}
      {showAssignModal && (
        <div className="store-modal-overlay">
          <div
            className="store-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="assign-role-title"
          >
            <div className="store-modal__header">
              <h2 id="assign-role-title">Assign Store Role</h2>
              <button
                type="button"
                className="store-modal__close-btn"
                onClick={() => setShowAssignModal(false)}
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleAssignRole}>
              <div className="store-modal__body">
                <div className="store-settings-field">
                  <label htmlFor="assignEmail">User Email Address *</label>
                  <input
                    type="email"
                    id="assignEmail"
                    required
                    value={newMembership.email}
                    onChange={(e) =>
                      setNewMembership((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="user@example.com"
                    className="store-settings-input"
                  />
                  <span className="field-hint">
                    The user must have an existing account on the platform.
                  </span>
                </div>

                <div className="store-settings-field">
                  <label htmlFor="assignRoleSelect">Store Role *</label>
                  <select
                    id="assignRoleSelect"
                    className="tenant-picker__select"
                    style={{ width: "100%" }}
                    value={newMembership.role}
                    onChange={(e) =>
                      setNewMembership((prev) => ({ ...prev, role: e.target.value }))
                    }
                  >
                    <option value="StoreSeller">StoreSeller (Manage products & inventory)</option>
                    <option value="StoreAdmin">StoreAdmin (Full store manager & settings)</option>
                    <option value="StoreCustomer">StoreCustomer (Verified store shopper)</option>
                  </select>
                </div>
              </div>

              <div className="store-modal__footer">
                <button
                  type="button"
                  className="store-settings-btn store-settings-btn--cancel"
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="store-settings-btn store-settings-btn--save"
                  disabled={assigningRole}
                >
                  {assigningRole ? (
                    <>
                      <FaSpinner className="spin" />
                      <span>Assigning...</span>
                    </>
                  ) : (
                    <>
                      <FaUserPlus />
                      <span>Assign Role</span>
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
