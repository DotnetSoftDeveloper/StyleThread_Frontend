import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  FaSearch,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaStore,
  FaSpinner,
  FaPaperPlane,
  FaArrowLeft,
} from "react-icons/fa";
import { toast } from "react-toastify";
import {
  getApplicationStatus,
  resubmitApplication,
} from "../../Services/tenantService";
import {
  StoreApplicationStatusDto,
  StoreRequestStatus,
  ResubmitStoreRequestDto,
} from "../../Types/Interface/ITenant";
import "./ApplicationStatusPage.css";

const ApplicationStatusPage: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const [refInput, setRefInput] = useState<string>(searchParams.get("ref") || "");
  const [emailInput, setEmailInput] = useState<string>(searchParams.get("email") || "");
  const [loading, setLoading] = useState<boolean>(false);
  const [application, setApplication] = useState<StoreApplicationStatusDto | null>(null);

  // Resubmission State (for InformationRequired)
  const [resubmitData, setResubmitData] = useState<{
    businessName: string;
    businessAddress: string;
    websiteOrSocialUrl: string;
    taxIdOrRegistrationNumber: string;
    contactPhone: string;
    applicantNotes: string;
  }>({
    businessName: "",
    businessAddress: "",
    websiteOrSocialUrl: "",
    taxIdOrRegistrationNumber: "",
    contactPhone: "",
    applicantNotes: "",
  });
  const [isResubmitting, setIsResubmitting] = useState<boolean>(false);

  const handleLookup = async (referenceNum: string, email: string) => {
    if (!referenceNum.trim() || !email.trim()) {
      toast.error("Please provide both Reference Number and Contact Email.");
      return;
    }

    setLoading(true);
    try {
      const data = await getApplicationStatus(referenceNum.trim(), email.trim());
      setApplication(data);
      setResubmitData((prev) => ({
        ...prev,
        businessName: data.businessName || "",
      }));
    } catch (err: any) {
      setApplication(null);
      const msg =
        err.response?.data?.message ||
        "No application found matching the reference number and email.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const qRef = searchParams.get("ref");
    const qEmail = searchParams.get("email");
    if (qRef && qEmail) {
      handleLookup(qRef, qEmail);
    }
  }, [location.search]);

  const onLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLookup(refInput, emailInput);
  };

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application) return;

    if (!resubmitData.applicantNotes.trim()) {
      toast.error("Please enter a response note addressing the requested information.");
      return;
    }

    setIsResubmitting(true);
    try {
      const payload: ResubmitStoreRequestDto = {
        referenceNumber: application.referenceNumber,
        contactEmail: emailInput.trim(),
        businessName: resubmitData.businessName || undefined,
        businessAddress: resubmitData.businessAddress || undefined,
        websiteOrSocialUrl: resubmitData.websiteOrSocialUrl || undefined,
        taxIdOrRegistrationNumber: resubmitData.taxIdOrRegistrationNumber || undefined,
        contactPhone: resubmitData.contactPhone || undefined,
        applicantNotes: resubmitData.applicantNotes,
      };

      const updated = await resubmitApplication(application.referenceNumber, payload);
      setApplication(updated);
      toast.success("Additional details submitted! Your application is now Under Review.");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Failed to submit updated details. Please check and try again.";
      toast.error(msg);
    } finally {
      setIsResubmitting(false);
    }
  };

  const renderStatusPill = (status: StoreRequestStatus) => {
    switch (status) {
      case StoreRequestStatus.Pending:
        return (
          <span className="status-pill pending">
            <FaClock /> Pending Approval
          </span>
        );
      case StoreRequestStatus.UnderReview:
        return (
          <span className="status-pill under-review">
            <FaSpinner className="fa-spin" /> Under Review
          </span>
        );
      case StoreRequestStatus.InformationRequired:
        return (
          <span className="status-pill info-required">
            <FaExclamationTriangle /> Information Required
          </span>
        );
      case StoreRequestStatus.Approved:
        return (
          <span className="status-pill approved">
            <FaCheckCircle /> Approved
          </span>
        );
      case StoreRequestStatus.Rejected:
        return (
          <span className="status-pill rejected">
            <FaTimesCircle /> Rejected
          </span>
        );
      default:
        return <span className="status-pill">{status}</span>;
    }
  };

  return (
    <div className="status-page">
      <div className="status-container">
        {/* Lookup Box */}
        <div className="status-lookup-card">
          <div className="status-lookup-header">
            <h1>Track Storefront Application</h1>
            <p>Enter your application tracking reference and contact email to view current status.</p>
          </div>

          <form className="status-lookup-form" onSubmit={onLookupSubmit}>
            <div className="lookup-field">
              <label htmlFor="refNumber">Reference Number</label>
              <input
                type="text"
                id="refNumber"
                placeholder="e.g. APP-20261021-9B4F"
                value={refInput}
                onChange={(e) => setRefInput(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div className="lookup-field">
              <label htmlFor="contactEmail">Contact Email</label>
              <input
                type="email"
                id="contactEmail"
                placeholder="owner@yourbrand.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-lookup-submit" disabled={loading}>
              {loading ? (
                <>
                  <FaSpinner className="fa-spin" /> Searching...
                </>
              ) : (
                <>
                  <FaSearch /> Lookup Status
                </>
              )}
            </button>
          </form>
        </div>

        {/* Application Status Result */}
        {application && (
          <div className="status-result-card">
            <div className="status-result-header">
              <div className="status-title-group">
                <h2>{application.storeName}</h2>
                <p>
                  Reference: <strong>{application.referenceNumber}</strong> &bull; Submitted on{" "}
                  {new Date(application.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>{renderStatusPill(application.status)}</div>
            </div>

            {/* Core Info Grid */}
            <div className="status-info-grid">
              <div className="info-item">
                <span className="info-item-label">Business Name</span>
                <span className="info-item-value">{application.businessName}</span>
              </div>
              <div className="info-item">
                <span className="info-item-label">Storefront Slug</span>
                <span className="info-item-value">/store/{application.desiredSlug}</span>
              </div>
              <div className="info-item">
                <span className="info-item-label">Category</span>
                <span className="info-item-value">{application.businessCategory}</span>
              </div>
            </div>

            {/* Status-Specific Feedback & Guidance */}
            {application.status === StoreRequestStatus.Pending && (
              <div className="status-callout info">
                <h4>
                  <FaClock /> Application Queued for Review
                </h4>
                <p>
                  Your storefront application has been safely received. Our Super Administrator
                  compliance team is verifying business details and domain reservation. Standard
                  review takes 24 to 48 hours.
                </p>
              </div>
            )}

            {application.status === StoreRequestStatus.UnderReview && (
              <div className="status-callout info">
                <h4>
                  <FaSpinner className="fa-spin" /> In Active Review
                </h4>
                <p>
                  Your resubmitted details are currently being evaluated by our team. You will
                  receive an email once your tenant environment is provisioned and approved.
                </p>
              </div>
            )}

            {application.status === StoreRequestStatus.InformationRequired && (
              <div className="status-callout warning">
                <h4>
                  <FaExclamationTriangle /> Additional Information Required
                </h4>
                <p style={{ marginBottom: "12px" }}>
                  <strong>Administrator Note:</strong>{" "}
                  {application.inquiryNotes ||
                    "Please provide additional verification documents or business details."}
                </p>
                <p>
                  Use the resubmission form below to update your information and reply to the review
                  team.
                </p>

                {/* Resubmission Form */}
                <form className="resubmission-box" onSubmit={handleResubmit}>
                  <h3>Submit Requested Information</h3>
                  <p className="resubmit-sub">
                    Update any requested fields and include your response notes below.
                  </p>

                  <div className="form-group" style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>
                      Response to Reviewer <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="Explain the clarifications or updates provided..."
                      value={resubmitData.applicantNotes}
                      onChange={(e) =>
                        setResubmitData((prev) => ({ ...prev, applicantNotes: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                      marginBottom: "16px",
                    }}
                  >
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>
                        Tax ID / GSTIN
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Updated registration number"
                        value={resubmitData.taxIdOrRegistrationNumber}
                        onChange={(e) =>
                          setResubmitData((prev) => ({
                            ...prev,
                            taxIdOrRegistrationNumber: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Direct phone"
                        value={resubmitData.contactPhone}
                        onChange={(e) =>
                          setResubmitData((prev) => ({ ...prev, contactPhone: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-resubmit-save"
                    disabled={isResubmitting}
                  >
                    {isResubmitting ? (
                      <>
                        <FaSpinner className="fa-spin" /> Submitting Updates...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane /> Submit Clarification & Resubmit
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {application.status === StoreRequestStatus.Approved && (
              <div className="status-callout success">
                <h4>
                  <FaCheckCircle /> Storefront Approved!
                </h4>
                <p style={{ marginBottom: "16px" }}>
                  Congratulations! Your application has been approved. Your dedicated storefront has
                  been provisioned and assigned an administrator.
                </p>
                {application.createdTenantSlug && (
                  <div style={{ marginTop: "16px" }}>
                    <Link
                      to={`/store/${application.createdTenantSlug}`}
                      className="btn-launch-live-store"
                    >
                      <FaStore /> Enter Storefront (/store/{application.createdTenantSlug})
                    </Link>
                  </div>
                )}
              </div>
            )}

            {application.status === StoreRequestStatus.Rejected && (
              <div className="status-callout danger">
                <h4>
                  <FaTimesCircle /> Application Not Approved
                </h4>
                <p style={{ marginBottom: "12px" }}>
                  <strong>Reason:</strong>{" "}
                  {application.rejectionReason ||
                    application.adminNotes ||
                    "Application does not meet current platform merchant criteria."}
                </p>
                <p>
                  You are welcome to resolve the issues and submit a fresh application.
                </p>
                <div style={{ marginTop: "16px" }}>
                  <Link to="/apply" className="btn-wizard-prev">
                    Submit New Application
                  </Link>
                </div>
              </div>
            )}

            <div style={{ marginTop: "32px", textAlign: "center" }}>
              <Link to="/" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: 600 }}>
                <FaArrowLeft /> Back to StyleThread Business Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationStatusPage;
