import React from "react";
import "./LandingPage.css";
import { FaShieldAlt, FaFileContract } from "react-icons/fa";

export const PrivacyPage: React.FC = () => {
  return (
    <div className="landing-page-root">
      <section className="hero-section" style={{ padding: "4rem 0 3rem" }}>
        <div className="landing-container">
          <div className="hero-badge">
            <FaShieldAlt /> Privacy & Security
          </div>
          <h1 className="hero-title">Privacy Policy</h1>
          <p className="hero-subtitle">
            Effective Date: January 1, 2026. How DukaanOnline safeguards your business and customer data.
          </p>
        </div>
      </section>

      <section className="features-section" style={{ backgroundColor: "#ffffff" }}>
        <div className="landing-container" style={{ maxWidth: "860px", color: "#334155", lineHeight: 1.75 }}>
          <h3 style={{ color: "#0f172a", fontSize: "1.35rem", marginTop: 0 }}>1. Multi-Tenant Data Sovereignty</h3>
          <p>
            DukaanOnline provides multi-tenant e-commerce platform services. Every tenant's catalog, customer
            records, order transactions, and administrative configuration are strictly segmented. We do not sell,
            license, or aggregate your proprietary transaction figures for external advertising.
          </p>

          <h3 style={{ color: "#0f172a", fontSize: "1.35rem", marginTop: "2rem" }}>2. Information Collected</h3>
          <p>
            When you register a store on DukaanOnline, we collect business registration numbers, legal entity names,
            contact email addresses, mobile numbers, and payment configuration credentials. When customers make
            purchases through your store, we capture shipping addresses and contact details solely to fulfill transactions.
          </p>

          <h3 style={{ color: "#0f172a", fontSize: "1.35rem", marginTop: "2rem" }}>3. Payment Gateway Security</h3>
          <p>
            All payment card and UPI transactions are processed through tokenized PCI-DSS Level 1 compliant gateway
            infrastructure (Razorpay). DukaanOnline never stores raw credit card numbers or banking passwords on our servers.
          </p>

          <h3 style={{ color: "#0f172a", fontSize: "1.35rem", marginTop: "2rem" }}>4. Data Retention & Export</h3>
          <p>
            Store owners maintain complete ownership of their catalogs and sales data. Upon account termination or
            cancellation, you have the right to request a complete CSV/JSON archive of your store data.
          </p>
        </div>
      </section>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <div className="landing-page-root">
      <section className="hero-section" style={{ padding: "4rem 0 3rem" }}>
        <div className="landing-container">
          <div className="hero-badge">
            <FaFileContract /> Terms of Service
          </div>
          <h1 className="hero-title">Terms of Service</h1>
          <p className="hero-subtitle">
            Effective Date: January 1, 2026. Governing your usage of the DukaanOnline platform.
          </p>
        </div>
      </section>

      <section className="features-section" style={{ backgroundColor: "#ffffff" }}>
        <div className="landing-container" style={{ maxWidth: "860px", color: "#334155", lineHeight: 1.75 }}>
          <h3 style={{ color: "#0f172a", fontSize: "1.35rem", marginTop: 0 }}>1. Merchant Agreement</h3>
          <p>
            By applying for a store and operating a storefront on DukaanOnline, you agree to comply with all
            applicable retail regulations, consumer protection standards, and tax reporting requirements.
          </p>

          <h3 style={{ color: "#0f172a", fontSize: "1.35rem", marginTop: "2rem" }}>2. Application Review & Approval</h3>
          <p>
            Submission of an application does not guarantee storefront provisioning. DukaanOnline Super Administrators
            reserve the right to request additional documentation, reject applications violating platform standards,
            or suspend stores exhibiting fraudulent behavior.
          </p>

          <h3 style={{ color: "#0f172a", fontSize: "1.35rem", marginTop: "2rem" }}>3. Prohibited Content & Goods</h3>
          <p>
            Merchants may not sell counterfeit fashion apparel, illegal substances, copyright-infringing materials,
            or weapons. Any store found violating these terms will be immediately suspended without refund.
          </p>

          <h3 style={{ color: "#0f172a", fontSize: "1.35rem", marginTop: "2rem" }}>4. Service Level & Uptime</h3>
          <p>
            DukaanOnline strives for a 99.9% uptime availability for all hosted client storefronts. Scheduled maintenance
            windows will be communicated in advance via the Store Admin dashboard.
          </p>
        </div>
      </section>
    </div>
  );
};
