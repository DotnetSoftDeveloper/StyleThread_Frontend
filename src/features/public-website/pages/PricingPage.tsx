import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";
import {
  FaCheck,
  FaArrowRight,
  FaShieldAlt,
  FaStore,
  FaRocket,
  FaTag,
} from "react-icons/fa";

export const PricingPage: React.FC = () => {
  const [annualBilling, setAnnualBilling] = useState(false);

  const plans = [
    {
      name: "Starter Merchant",
      badge: "Emerging Brands",
      priceMonthly: 1499,
      priceAnnual: 1199,
      description: "Ideal for boutique labels and independent designers launching their first digital storefront.",
      features: [
        "Dedicated Store URL (/store/yourbrand)",
        "Up to 250 Active Products",
        "100% Isolated Tenant Database",
        "Integrated Razorpay Payments",
        "1 Store Admin Account",
        "Email Support (24h response)",
        "Standard Analytics Dashboard",
      ],
      popular: false,
      ctaText: "Apply with Starter",
    },
    {
      name: "Growth Professional",
      badge: "Most Popular",
      priceMonthly: 3999,
      priceAnnual: 3199,
      description: "For expanding apparel brands requiring custom branding, unlimited products, and seller delegation.",
      features: [
        "Everything in Starter, plus:",
        "Unlimited Active Products & Variants",
        "Custom Domain Mapping Support",
        "Up to 5 Team Member Accounts (Admins & Sellers)",
        "Priority Onboarding (< 24h approval)",
        "Real-Time Low-Stock Warnings & Webhooks",
        "Advanced Revenue & Sales Analytics",
        "Dedicated Support Specialist",
      ],
      popular: true,
      ctaText: "Apply with Growth",
    },
    {
      name: "Enterprise Multi-Brand",
      badge: "Large Retailers",
      priceMonthly: 9999,
      priceAnnual: 7999,
      description: "For enterprise apparel groups and wholesale distributors managing multiple storefronts and high volume.",
      features: [
        "Everything in Growth, plus:",
        "Multiple Storefronts under 1 Master Account",
        "Unlimited Staff & Fulfillment Roles",
        "Dedicated Account Director",
        "Custom SLA (99.99% Uptime Guarantee)",
        "Direct ERP & Warehouse API Integrations",
        "Quarterly Architecture & Performance Reviews",
      ],
      popular: false,
      ctaText: "Contact Enterprise",
    },
  ];

  return (
    <div className="landing-page-root">
      {/* Hero */}
      <section className="hero-section" style={{ padding: "4rem 0 3.5rem" }}>
        <div className="landing-container">
          <div className="hero-badge">
            <FaTag /> Transparent Pricing
          </div>
          <h1 className="hero-title">
            Simple, Transparent Plans with{" "}
            <span className="hero-highlight">Zero</span>
            <span className="hero-accent"> Hidden Fees</span>
          </h1>
          <p className="hero-subtitle">
            Scale your brand with predictable infrastructure costs. All plans include
            full tenant isolation, payment integration, and turnkey provisioning.
          </p>

          {/* Billing Switch */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "1rem",
              padding: "0.5rem 1rem",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "9999px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <span
              style={{
                fontSize: "0.9rem",
                fontWeight: !annualBilling ? 700 : 500,
                color: !annualBilling ? "var(--brand-teal-700, #0f766e)" : "#64748b",
                cursor: "pointer",
              }}
              onClick={() => setAnnualBilling(false)}
            >
              Monthly Billing
            </span>
            <button
              onClick={() => setAnnualBilling(!annualBilling)}
              style={{
                width: "48px",
                height: "26px",
                borderRadius: "9999px",
                background: annualBilling ? "var(--brand-teal, #0d9488)" : "#cbd5e1",
                border: "none",
                position: "relative",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              aria-label="Toggle annual billing"
            >
              <span
                style={{
                  position: "absolute",
                  top: "3px",
                  left: annualBilling ? "25px" : "3px",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: "#ffffff",
                  transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }}
              />
            </button>
            <span
              style={{
                fontSize: "0.9rem",
                fontWeight: annualBilling ? 700 : 500,
                color: annualBilling ? "var(--brand-teal-700, #0f766e)" : "#64748b",
                cursor: "pointer",
              }}
              onClick={() => setAnnualBilling(true)}
            >
              Annual Billing{" "}
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#ea580c",
                  fontWeight: 700,
                  backgroundColor: "#fff7ed",
                  padding: "0.15rem 0.45rem",
                  borderRadius: "9999px",
                }}
              >
                Save 20%
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="features-section" style={{ backgroundColor: "#f8fafc" }}>
        <div className="landing-container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "2.5rem",
              alignItems: "stretch",
            }}
          >
            {plans.map((plan, idx) => {
              const currentPrice = annualBilling ? plan.priceAnnual : plan.priceMonthly;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    border: plan.popular
                      ? "2px solid var(--brand-teal, #0d9488)"
                      : "1px solid #e2e8f0",
                    padding: "2.5rem",
                    boxShadow: plan.popular
                      ? "0 12px 30px rgba(13, 148, 136, 0.15)"
                      : "var(--shadow-sm)",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                  }}
                >
                  {plan.popular && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-14px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        backgroundColor: "var(--brand-teal, #0d9488)",
                        color: "#ffffff",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        padding: "0.25rem 0.85rem",
                        borderRadius: "9999px",
                      }}
                    >
                      {plan.badge}
                    </div>
                  )}

                  <h3 style={{ fontSize: "1.45rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.5rem" }}>
                    {plan.name}
                  </h3>
                  <p style={{ fontSize: "0.9rem", color: "#64748b", margin: "0 0 1.5rem" }}>
                    {plan.description}
                  </p>

                  <div style={{ marginBottom: "1.75rem" }}>
                    <span style={{ fontSize: "2.5rem", fontWeight: 800, color: "#0f172a" }}>
                      ₹{currentPrice.toLocaleString()}
                    </span>
                    <span style={{ fontSize: "0.9rem", color: "#64748b" }}> / month</span>
                    {annualBilling && (
                      <div style={{ fontSize: "0.75rem", color: "#0d9488", fontWeight: 600, marginTop: "0.25rem" }}>
                        Billed annually (₹{(currentPrice * 12).toLocaleString()}/yr)
                      </div>
                    )}
                  </div>

                  <Link
                    to="/apply"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      padding: "0.85rem",
                      borderRadius: "10px",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      textDecoration: "none",
                      marginBottom: "2rem",
                      transition: "all 0.2s",
                      backgroundColor: plan.popular
                        ? "var(--brand-orange, #ea580c)"
                        : "#f1f5f9",
                      color: plan.popular ? "#ffffff" : "#1e293b",
                    }}
                  >
                    <span>{plan.ctaText}</span>
                    <FaArrowRight size={12} />
                  </Link>

                  <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "1.5rem", marginTop: "auto" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Plan Features
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} style={{ fontSize: "0.875rem", color: "#475569", display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                          <FaCheck size={12} style={{ color: "#0d9488", marginTop: "3px", flexShrink: 0 }} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust & Guarantee */}
      <section className="roadmap-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-tag">Peace of Mind</span>
            <h2 className="section-title">The DukaanOnline Guarantee</h2>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <FaShieldAlt />
              </div>
              <h3 className="feature-title">No Revenue Percentage Cuts</h3>
              <p className="feature-text">
                Unlike traditional marketplaces that charge 15% to 30% on every sale,
                DukaanOnline charges zero commission. You retain 100% of your margins.
              </p>
            </div>
            <div className="feature-card orange">
              <div className="feature-icon-wrapper">
                <FaStore />
              </div>
              <h3 className="feature-title">No Lock-In Contracts</h3>
              <p className="feature-text">
                Switch or cancel your subscription whenever you wish. You can export
                your complete catalog, customer database, and order records at any time.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <FaRocket />
              </div>
              <h3 className="feature-title">Guaranteed Fast Provisioning</h3>
              <p className="feature-text">
                Our Super Admin team reviews and approves stores within 48 hours or your
                first month on the platform is completely free.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
