import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaArrowLeft,
  FaCheck,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaCopy,
  FaSearch,
} from "react-icons/fa";
import { toast } from "react-toastify";
import {
  checkSlugAvailability,
  submitStoreApplication,
} from "../../../Services/tenantService";
import { CreateStoreRequestDto, StoreRequest } from "../../../Types/Interface/ITenant";
import "./StoreApplicationPage.css";

const StoreApplicationPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRequest, setSubmittedRequest] = useState<StoreRequest | null>(null);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);

  // Form Fields
  const [formData, setFormData] = useState<CreateStoreRequestDto>({
    businessName: "",
    businessCategory: "Fashion & Apparel",
    taxIdOrRegistrationNumber: "",
    businessAddress: "",
    websiteOrSocialUrl: "",
    estimatedInventoryScale: "100 - 500 SKUs",
    storeName: "",
    desiredSlug: "",
    customDomain: "",
    businessDescription: "",
    ownerFirstName: "",
    ownerLastName: "",
    contactEmail: "",
    contactPhone: "",
  });

  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);

  // Slug Availability State
  const [slugStatus, setSlugStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({
    checking: false,
    available: null,
    message: "",
  });

  const sanitizeSlug = (val: string) => {
    return val
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Live Slug Check
  const verifySlug = useCallback(async (slugToCheck: string) => {
    if (!slugToCheck || slugToCheck.length < 3) {
      setSlugStatus({
        checking: false,
        available: null,
        message: "Slug must be at least 3 characters long.",
      });
      return;
    }

    setSlugStatus({ checking: true, available: null, message: "Checking availability..." });
    try {
      const res = await checkSlugAvailability(slugToCheck);
      setSlugStatus({
        checking: false,
        available: res.available,
        message: res.available ? "Slug is available!" : res.reason || "Slug is taken.",
      });
    } catch (err: any) {
      setSlugStatus({
        checking: false,
        available: null,
        message: "Unable to verify slug right now.",
      });
    }
  }, []);

  useEffect(() => {
    if (!formData.desiredSlug || currentStep !== 2) return;
    const timer = setTimeout(() => {
      verifySlug(formData.desiredSlug);
    }, 450);
    return () => clearTimeout(timer);
  }, [formData.desiredSlug, currentStep, verifySlug]);

  // Auto-generate slug from store name if desiredSlug is empty
  const handleStoreNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => {
      const autoSlug = !prev.desiredSlug || prev.desiredSlug === sanitizeSlug(prev.storeName)
        ? sanitizeSlug(name)
        : prev.desiredSlug;
      return {
        ...prev,
        storeName: name,
        desiredSlug: autoSlug,
      };
    });
  };

  // Step Nav Validations
  const validateStep1 = () => {
    if (!formData.businessName.trim()) {
      toast.error("Please enter your legal or trading business name.");
      return false;
    }
    if (!formData.businessCategory.trim()) {
      toast.error("Please choose a primary business category.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.storeName.trim()) {
      toast.error("Please specify your public storefront name.");
      return false;
    }
    if (!formData.desiredSlug.trim() || formData.desiredSlug.length < 3) {
      toast.error("Please provide a valid store slug (at least 3 characters).");
      return false;
    }
    if (slugStatus.available === false) {
      toast.error("The selected store slug is not available. Please choose another one.");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.ownerFirstName.trim() || !formData.ownerLastName.trim()) {
      toast.error("Please enter the primary owner/representative name.");
      return false;
    }
    if (!formData.contactEmail.trim() || !formData.contactEmail.includes("@")) {
      toast.error("Please enter a valid business contact email.");
      return false;
    }
    if (!formData.contactPhone.trim()) {
      toast.error("Please enter a valid contact phone number.");
      return false;
    }
    if (!acceptedTerms) {
      toast.error("Please accept the StyleThread platform terms and seller policies.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setIsSubmitting(true);
    try {
      const response = await submitStoreApplication(formData);
      setSubmittedRequest(response);
      toast.success("Store application submitted successfully!");
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        "Failed to submit application. Please check your inputs and try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyReferenceToClipboard = () => {
    if (!submittedRequest?.referenceNumber) return;
    navigator.clipboard.writeText(submittedRequest.referenceNumber);
    setCopiedRef(true);
    toast.info("Reference number copied to clipboard!");
    setTimeout(() => setCopiedRef(false), 2500);
  };

  return (
    <div className="store-application-page">
      <div className="application-wrapper">
        {/* Header */}
        <div className="application-header">
          <h1>Register Your Storefront</h1>
          <p>
            Join the StyleThread network of fashion retailers. Fill out your business credentials
            below to receive approval and a dedicated storefront URL.
          </p>
        </div>

        {/* Stepper Navigation (Only when not submitted) */}
        {!submittedRequest && (
          <div className="stepper-nav">
            <div className={`step-item ${currentStep === 1 ? "active" : currentStep > 1 ? "completed" : ""}`}>
              <div className="step-circle">{currentStep > 1 ? <FaCheck /> : "1"}</div>
              <span className="step-label">Business Profile</span>
            </div>

            <div className={`step-item ${currentStep === 2 ? "active" : currentStep > 2 ? "completed" : ""}`}>
              <div className="step-circle">{currentStep > 2 ? <FaCheck /> : "2"}</div>
              <span className="step-label">Store Identity</span>
            </div>

            <div className={`step-item ${currentStep === 3 ? "active" : ""}`}>
              <div className="step-circle">3</div>
              <span className="step-label">Owner Contact</span>
            </div>
          </div>
        )}

        {/* Application Card */}
        <div className="application-card">
          {submittedRequest ? (
            /* Success State */
            <div className="application-success-card">
              <div className="success-icon-badge">
                <FaCheck />
              </div>
              <h2>Application Submitted Successfully!</h2>
              <p className="subtitle">
                Thank you, <strong>{submittedRequest.ownerFirstName}</strong>. Your storefront
                application for <strong>{submittedRequest.storeName}</strong> has been logged in
                our approval queue.
              </p>

              <div className="reference-display-box">
                <div className="ref-row">
                  <span className="ref-label">Reference Number:</span>
                  <span className="ref-val">{submittedRequest.referenceNumber}</span>
                </div>
                <div className="ref-row">
                  <span className="ref-label">Target Storefront URL:</span>
                  <span className="ref-val slug-text">
                    /store/{submittedRequest.desiredSlug}
                  </span>
                </div>
                <div className="ref-row">
                  <span className="ref-label">Status:</span>
                  <span className="ref-val" style={{ color: "#d97706" }}>
                    Pending Review
                  </span>
                </div>
                <div className="ref-row">
                  <span className="ref-label">Contact Email:</span>
                  <span className="ref-val slug-text">{submittedRequest.contactEmail}</span>
                </div>
              </div>

              <div className="success-actions">
                <button
                  type="button"
                  className="btn-wizard-prev"
                  onClick={copyReferenceToClipboard}
                >
                  <FaCopy /> {copiedRef ? "Copied!" : "Copy Reference Number"}
                </button>
                <Link
                  to={`/apply/status?ref=${encodeURIComponent(
                    submittedRequest.referenceNumber
                  )}&email=${encodeURIComponent(submittedRequest.contactEmail)}`}
                  className="btn-wizard-next"
                >
                  <FaSearch /> Track Application Status
                </Link>
                <Link to="/" className="btn-wizard-prev">
                  Back to Homepage
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* STEP 1: Business Profile */}
              {currentStep === 1 && (
                <div className="step-pane">
                  <div className="step-pane-header">
                    <h2>Step 1: Business & Legal Profile</h2>
                    <p>Enter information regarding your legal business entity and operations.</p>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label htmlFor="businessName">
                        Legal Business Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="businessName"
                        name="businessName"
                        className="form-input"
                        placeholder="e.g. Aurora Apparel Private Limited"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="businessCategory">
                        Business Category <span className="required">*</span>
                      </label>
                      <select
                        id="businessCategory"
                        name="businessCategory"
                        className="form-select"
                        value={formData.businessCategory}
                        onChange={handleInputChange}
                      >
                        <option value="Fashion & Apparel">Fashion & Apparel</option>
                        <option value="Luxury Designer Wear">Luxury Designer Wear</option>
                        <option value="Streetwear & Denim">Streetwear & Denim</option>
                        <option value="Ethnic & Traditional">Ethnic & Traditional</option>
                        <option value="Athleisure & Sportswear">Athleisure & Sportswear</option>
                        <option value="Footwear & Accessories">Footwear & Accessories</option>
                        <option value="Textiles & Home Lifestyle">Textiles & Home Lifestyle</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label htmlFor="taxIdOrRegistrationNumber">
                        Tax ID / GSTIN / Business Registration
                      </label>
                      <input
                        type="text"
                        id="taxIdOrRegistrationNumber"
                        name="taxIdOrRegistrationNumber"
                        className="form-input"
                        placeholder="e.g. 29ABCDE1234F1Z5 or EIN"
                        value={formData.taxIdOrRegistrationNumber || ""}
                        onChange={handleInputChange}
                      />
                      <span className="form-hint">Used for verification and automated tax invoicing.</span>
                    </div>

                    <div className="form-group">
                      <label htmlFor="estimatedInventoryScale">Estimated Inventory Scale</label>
                      <select
                        id="estimatedInventoryScale"
                        name="estimatedInventoryScale"
                        className="form-select"
                        value={formData.estimatedInventoryScale || "100 - 500 SKUs"}
                        onChange={handleInputChange}
                      >
                        <option value="Under 50 SKUs">Under 50 SKUs (Boutique / Artisan)</option>
                        <option value="50 - 200 SKUs">50 - 200 SKUs (Emerging Label)</option>
                        <option value="200 - 1000 SKUs">200 - 1,000 SKUs (Retail Brand)</option>
                        <option value="1000+ SKUs">1,000+ SKUs (Enterprise Fleet)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="websiteOrSocialUrl">Existing Website or Instagram URL</label>
                    <input
                      type="url"
                      id="websiteOrSocialUrl"
                      name="websiteOrSocialUrl"
                      className="form-input"
                      placeholder="e.g. https://instagram.com/yourbrand"
                      value={formData.websiteOrSocialUrl || ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="businessAddress">Registered Office Address</label>
                    <textarea
                      id="businessAddress"
                      name="businessAddress"
                      className="form-textarea"
                      placeholder="Street, City, State, Pincode/Zip, Country"
                      value={formData.businessAddress || ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="wizard-actions">
                    <Link to="/" className="btn-wizard-prev">
                      Cancel
                    </Link>
                    <button type="button" className="btn-wizard-next" onClick={handleNext}>
                      Continue to Storefront Setup <FaArrowRight />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Storefront Identity & Slug */}
              {currentStep === 2 && (
                <div className="step-pane">
                  <div className="step-pane-header">
                    <h2>Step 2: Storefront Identity & URL</h2>
                    <p>Customize how customers will see and access your online store.</p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="storeName">
                      Storefront Public Display Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="storeName"
                      name="storeName"
                      className="form-input"
                      placeholder="e.g. Aurora Boutique"
                      value={formData.storeName}
                      onChange={handleStoreNameChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="desiredSlug">
                      Desired Store Slug (URL identifier) <span className="required">*</span>
                    </label>
                    <div className="slug-input-wrapper">
                      <span className="slug-prefix">stylethread.com/store/</span>
                      <input
                        type="text"
                        id="desiredSlug"
                        name="desiredSlug"
                        className="slug-input-field"
                        placeholder="aurora-boutique"
                        value={formData.desiredSlug}
                        onChange={(e) => {
                          const sanitized = sanitizeSlug(e.target.value);
                          setFormData((prev) => ({ ...prev, desiredSlug: sanitized }));
                        }}
                        required
                      />
                    </div>

                    {/* Slug Status Display */}
                    {slugStatus.checking && (
                      <div className="slug-status-badge checking">
                        <FaSpinner className="fa-spin" /> {slugStatus.message}
                      </div>
                    )}
                    {!slugStatus.checking && slugStatus.available === true && (
                      <div className="slug-status-badge available">
                        <FaCheckCircle /> {slugStatus.message}
                      </div>
                    )}
                    {!slugStatus.checking && slugStatus.available === false && (
                      <div className="slug-status-badge unavailable">
                        <FaTimesCircle /> {slugStatus.message}
                      </div>
                    )}
                    <span className="form-hint">
                      Use letters, numbers, and hyphens only. This will be your permanent primary storefront URL.
                    </span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="customDomain">Custom Domain (Optional)</label>
                    <input
                      type="text"
                      id="customDomain"
                      name="customDomain"
                      className="form-input"
                      placeholder="e.g. shop.auroraboutique.com"
                      value={formData.customDomain || ""}
                      onChange={handleInputChange}
                    />
                    <span className="form-hint">
                      You can map a custom apex domain or subdomain to your store after approval.
                    </span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="businessDescription">Brand Story & Store Description</label>
                    <textarea
                      id="businessDescription"
                      name="businessDescription"
                      className="form-textarea"
                      placeholder="Briefly describe your design ethos, product lines, and target audience..."
                      value={formData.businessDescription || ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="wizard-actions">
                    <button type="button" className="btn-wizard-prev" onClick={handleBack}>
                      <FaArrowLeft /> Back
                    </button>
                    <button
                      type="button"
                      className="btn-wizard-next"
                      onClick={handleNext}
                      disabled={slugStatus.available === false}
                    >
                      Continue to Contact Details <FaArrowRight />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Owner Contact & Agreement */}
              {currentStep === 3 && (
                <div className="step-pane">
                  <div className="step-pane-header">
                    <h2>Step 3: Owner & Representative Details</h2>
                    <p>
                      Enter official contact details for store governance, order notifications, and
                      Super Admin assignment.
                    </p>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label htmlFor="ownerFirstName">
                        First Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="ownerFirstName"
                        name="ownerFirstName"
                        className="form-input"
                        placeholder="e.g. Elena"
                        value={formData.ownerFirstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="ownerLastName">
                        Last Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="ownerLastName"
                        name="ownerLastName"
                        className="form-input"
                        placeholder="e.g. Rostova"
                        value={formData.ownerLastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label htmlFor="contactEmail">
                        Official Contact Email <span className="required">*</span>
                      </label>
                      <input
                        type="email"
                        id="contactEmail"
                        name="contactEmail"
                        className="form-input"
                        placeholder="owner@yourbrand.com"
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        required
                      />
                      <span className="form-hint">
                        Application status updates, review notifications, and admin invites will be
                        sent to this address.
                      </span>
                    </div>

                    <div className="form-group">
                      <label htmlFor="contactPhone">
                        Direct Phone Number <span className="required">*</span>
                      </label>
                      <input
                        type="tel"
                        id="contactPhone"
                        name="contactPhone"
                        className="form-input"
                        placeholder="+91 98765 43210"
                        value={formData.contactPhone}
                        onChange={handleInputChange}
                        required
                      />
                      <span className="form-hint">Used for urgent verification and courier logistics.</span>
                    </div>
                  </div>

                  <div className="terms-checkbox-group">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      required
                    />
                    <label htmlFor="acceptTerms">
                      I declare that all business information provided is accurate and authentic. I
                      agree to the StyleThread Multi-Tenant Commerce Merchant Agreement, Acceptable
                      Use Policy, and Razorpay payment settlement standards.
                    </label>
                  </div>

                  <div className="wizard-actions">
                    <button
                      type="button"
                      className="btn-wizard-prev"
                      onClick={handleBack}
                      disabled={isSubmitting}
                    >
                      <FaArrowLeft /> Back
                    </button>
                    <button
                      type="submit"
                      className="btn-wizard-next"
                      disabled={isSubmitting || !acceptedTerms}
                    >
                      {isSubmitting ? (
                        <>
                          <FaSpinner className="fa-spin" /> Submitting Application...
                        </>
                      ) : (
                        <>
                          <FaCheckCircle /> Submit Store Application
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreApplicationPage;
