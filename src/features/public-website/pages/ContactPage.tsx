import React, { useState } from "react";
import "./LandingPage.css";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaPaperPlane,
  FaHeadset,
} from "react-icons/fa";
import { useToast } from "../../../Utils/Helper/ToastNotifications";

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    businessName: "",
    subject: "Merchant Onboarding Inquiry",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      showToast("error", "Please complete all required fields.");
      return;
    }
    setSubmitted(true);
    showToast("success", "Thank you for reaching out! A platform specialist will respond shortly.");
  };

  return (
    <div className="landing-page-root">
      {/* Hero */}
      <section className="hero-section" style={{ padding: "4rem 0 3.5rem" }}>
        <div className="landing-container">
          <div className="hero-badge">
            <FaHeadset /> Merchant Support
          </div>
          <h1 className="hero-title">
            We’re Here to Help You <span className="hero-highlight">Grow</span>
          </h1>
          <p className="hero-subtitle">
            Have questions about store onboarding, enterprise integrations, or custom domains?
            Our team is available 6 days a week to assist.
          </p>
        </div>
      </section>

      {/* Main Grid: Form + Info */}
      <section className="features-section" style={{ backgroundColor: "#ffffff" }}>
        <div className="landing-container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "3.5rem",
              alignItems: "flex-start",
            }}
          >
            {/* Contact Details Column */}
            <div>
              <span className="section-tag">Direct Channels</span>
              <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 1rem" }}>
                Reach the DukaanOnline Team
              </h2>
              <p style={{ color: "#475569", lineHeight: 1.65, marginBottom: "2rem" }}>
                Whether you are evaluating our platform for your boutique or need assistance
                with an existing application, we look forward to connecting with you.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      backgroundColor: "var(--brand-teal-50, #f0fdfa)",
                      color: "var(--brand-teal, #0d9488)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                      flexShrink: 0,
                    }}
                  >
                    <FaEnvelope />
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 0.25rem", color: "#0f172a", fontSize: "1rem" }}>Email Inquiries</h4>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
                      support@dukaanonline.com<br />
                      onboarding@dukaanonline.com
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      backgroundColor: "var(--brand-orange-50, #fff7ed)",
                      color: "var(--brand-orange, #ea580c)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                      flexShrink: 0,
                    }}
                  >
                    <FaPhoneAlt />
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 0.25rem", color: "#0f172a", fontSize: "1rem" }}>Phone Support</h4>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
                      Toll Free: +91 (800) 123-4567<br />
                      Direct Desk: +91 (80) 4567-8900
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      backgroundColor: "var(--brand-teal-50, #f0fdfa)",
                      color: "var(--brand-teal, #0d9488)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                      flexShrink: 0,
                    }}
                  >
                    <FaClock />
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 0.25rem", color: "#0f172a", fontSize: "1rem" }}>Support Hours</h4>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
                      Monday – Saturday: 9:00 AM – 7:00 PM IST<br />
                      Emergency Escalations: 24/7 Monitoring
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      backgroundColor: "var(--brand-teal-50, #f0fdfa)",
                      color: "var(--brand-teal, #0d9488)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                      flexShrink: 0,
                    }}
                  >
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 0.25rem", color: "#0f172a", fontSize: "1rem" }}>Headquarters</h4>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
                      DukaanOnline Commerce Technologies<br />
                      Outer Ring Road, Bengaluru, Karnataka, India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Column */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                padding: "2.5rem",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <h3 style={{ fontSize: "1.45rem", fontWeight: 800, color: "#0f172a", margin: "0 0 1rem" }}>
                Send Us a Message
              </h3>

              {submitted ? (
                <div style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
                  <FaCheckCircle size={48} style={{ color: "#10b981", marginBottom: "1rem" }} />
                  <h4 style={{ fontSize: "1.25rem", color: "#0f172a", margin: "0 0 0.5rem" }}>
                    Message Dispatched!
                  </h4>
                  <p style={{ color: "#475569", fontSize: "0.95rem" }}>
                    Our merchant success team has received your message and will respond within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", businessName: "", subject: "Merchant Onboarding Inquiry", message: "" });
                    }}
                    style={{
                      marginTop: "1rem",
                      padding: "0.5rem 1rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#1e293b", marginBottom: "0.35rem" }}>
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "0.65rem 0.85rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.9rem",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#1e293b", marginBottom: "0.35rem" }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. john@yourbrand.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "0.65rem 0.85rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.9rem",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#1e293b", marginBottom: "0.35rem" }}>
                      Business / Store Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Urban Threads Apparel"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "0.65rem 0.85rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.9rem",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#1e293b", marginBottom: "0.35rem" }}>
                      Message or Inquiry *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tell us about your brand, product scale, or question..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "0.65rem 0.85rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.9rem",
                        outline: "none",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1.5rem",
                      borderRadius: "10px",
                      backgroundColor: "var(--brand-teal, #0d9488)",
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(13, 148, 136, 0.25)",
                    }}
                  >
                    <FaPaperPlane size={13} />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
