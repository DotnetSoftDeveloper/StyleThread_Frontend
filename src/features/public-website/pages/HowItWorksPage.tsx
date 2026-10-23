import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";
import {
  FaWpforms,
  FaUserCheck,
  FaCogs,
  FaRocket,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      num: "01",
      icon: <FaWpforms />,
      title: "Step 1: Submit Your Store Application",
      subtitle: "Takes approximately 3 to 5 minutes",
      description:
        "Visit our online application portal. Enter your legal business name, brand summary, owner contact details, and test the real-time availability of your desired store slug (e.g. dukaanonline.com/store/yourbrand).",
      details: [
        "Real-time slug availability check with automated validation",
        "Business category and catalog scope declaration",
        "Owner identity and verification contact info",
        "Unique application reference tracking number generated immediately",
      ],
    },
    {
      num: "02",
      icon: <FaUserCheck />,
      title: "Step 2: Super Admin Verification",
      subtitle: "Processed within 24 to 48 hours",
      description:
        "Our platform compliance team reviews the submitted application dossier. Super Admins verify business legitimacy, review legal entity details, and ensure brand integrity.",
      details: [
        "Centralized Super Admin review queue with priority filtering",
        "Direct inquiry channel if clarifying information is required",
        "Real-time application status tracker accessible via reference number",
        "Instant notification upon approval decision",
      ],
    },
    {
      num: "03",
      icon: <FaCogs />,
      title: "Step 3: Turnkey Store Provisioning & Admin Assignment",
      subtitle: "Automated instant infrastructure setup",
      description:
        "Once approved, our multi-tenant provisioning engine registers the tenant database partitions, establishes catalog indexes, and the Super Admin assigns a designated Store Administrator.",
      details: [
        "Dedicated isolated tenant workspace provisioned",
        "Store Administrator account assigned and linked to store slug",
        "Default branding settings and color palettes initialized",
        "Secure administrative login credentials generated",
      ],
    },
    {
      num: "04",
      icon: <FaRocket />,
      title: "Step 4: Launch Your Storefront & Accept Orders",
      subtitle: "Start selling immediately",
      description:
        "The store owner logs into their dedicated Store Admin portal, uploads their catalog of products and variants, fine-tunes storefront colors, and begins accepting orders from online shoppers.",
      details: [
        "Dedicated Store Admin portal at /admin/login",
        "Live customer storefront immediately available at /store/:slug",
        "Integrated payment gateway ready for customer checkouts",
        "Full order fulfillment, tracking, and analytics dashboard",
      ],
    },
  ];

  return (
    <div className="landing-page-root">
      {/* Hero */}
      <section className="hero-section" style={{ padding: "4rem 0 3.5rem" }}>
        <div className="landing-container">
          <div className="hero-badge">
            <FaRocket /> End-to-End Workflow
          </div>
          <h1 className="hero-title">
            How <span className="hero-highlight">Dukaan</span>
            <span className="hero-accent">Online</span> Works
          </h1>
          <p className="hero-subtitle">
            From initial application submission to a live, fully-branded online store,
            our streamlined onboarding workflow guarantees quality, security, and speed.
          </p>
        </div>
      </section>

      {/* Steps detailed breakdown */}
      <section className="features-section" style={{ backgroundColor: "#ffffff" }}>
        <div className="landing-container">
          <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
            {steps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr",
                  gap: "2.5rem",
                  padding: "2.5rem",
                  backgroundColor: idx % 2 === 1 ? "#f8fafc" : "#ffffff",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "60px",
                      height: "60px",
                      borderRadius: "14px",
                      background: idx % 2 === 1 ? "var(--brand-orange, #ea580c)" : "var(--brand-teal, #0d9488)",
                      color: "#ffffff",
                      fontSize: "1.75rem",
                      fontWeight: 800,
                      marginBottom: "1rem",
                    }}
                  >
                    {step.num}
                  </div>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.5rem" }}>
                    {step.title}
                  </h3>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--brand-orange, #ea580c)" }}>
                    {step.subtitle}
                  </div>
                </div>

                <div>
                  <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "#475569", marginBottom: "1.5rem" }}>
                    {step.description}
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    {step.details.map((detail, dIdx) => (
                      <div key={dIdx} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.9rem", color: "#334155" }}>
                        <FaCheckCircle style={{ color: "#0d9488", marginTop: "3px", flexShrink: 0 }} />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner-section">
        <div className="landing-container">
          <h2 className="cta-banner-title">Ready to Begin Your Onboarding?</h2>
          <p className="cta-banner-text">
            Submit your store application today or check the status of an existing submission.
          </p>
          <div className="hero-cta-group" style={{ marginBottom: 0 }}>
            <Link to="/apply" className="btn-hero-primary">
              <span>Apply for a Store</span>
              <FaArrowRight />
            </Link>
            <Link to="/apply/status" className="btn-hero-secondary">
              <span>Track Application Status</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;
