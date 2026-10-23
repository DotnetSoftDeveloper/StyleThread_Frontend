import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";
import {
  FaStore,
  FaBoxes,
  FaTruck,
  FaCreditCard,
  FaChartLine,
  FaUsersCog,
  FaArrowRight,
  FaCheck,
  FaLayerGroup,
} from "react-icons/fa";

export const ServicesPage: React.FC = () => {
  const services = [
    {
      icon: <FaStore />,
      title: "Turnkey Online Storefronts",
      badge: "Store Experience",
      desc: "Instant public-facing e-commerce storefront deployed on your chosen sub-path slug or custom domain, styled with your brand's colors and logos.",
      features: [
        "SEO-friendly canonical URLs",
        "Responsive mobile-first shopping UX",
        "Configurable hero banners and announcements",
        "Custom domain mapping support",
      ],
    },
    {
      icon: <FaBoxes />,
      title: "Catalog & Inventory Management",
      badge: "Product Operations",
      desc: "Robust product management enabling multi-variant sizing, color schemes, high-resolution media galleries, and automated stock deduction.",
      features: [
        "Real-time inventory levels and SKU tracking",
        "Low-stock email and dashboard alerts",
        "Categorization and dynamic search indexing",
        "Bulk inventory restocking controls",
      ],
    },
    {
      icon: <FaTruck />,
      title: "Order Logistics & Fulfillment",
      badge: "Fulfillment",
      desc: "End-to-end fulfillment pipeline from customer checkout to shipping label generation, order status updates, and customer notifications.",
      features: [
        "Order status workflow (Pending, Processing, Shipped, Delivered)",
        "Customer shipping and billing address capture",
        "Automated printable PDF order invoices",
        "Tracking number assignment and updates",
      ],
    },
    {
      icon: <FaCreditCard />,
      title: "Integrated Payment Processing",
      badge: "Fintech",
      desc: "Pre-integrated with Razorpay to accept credit cards, debit cards, UPI, net banking, and digital wallets with zero setup friction.",
      features: [
        "Instant payment confirmation and order capture",
        "Automated failed payment retries",
        "Encrypted payment payloads and PCI DSS compliance",
        "Direct merchant payout settlements",
      ],
    },
    {
      icon: <FaChartLine />,
      title: "Real-Time Sales Analytics",
      badge: "Intelligence",
      desc: "Gain deep visibility into your sales velocity, popular categories, conversion funnels, and repeat customer retention rates.",
      features: [
        "Daily, weekly, and monthly revenue metrics",
        "Top-selling product leaderboards",
        "Average order value (AOV) tracking",
        "Exportable CSV sales summaries",
      ],
    },
    {
      icon: <FaUsersCog />,
      title: "Role-Based Merchant Access",
      badge: "Governance",
      desc: "Delegate responsibility safely with distinct Store Administrator and Store Seller roles, preventing unauthorized access.",
      features: [
        "Store Admin full-configuration permissions",
        "Store Seller listing & fulfillment access",
        "Detailed audit logging of administrative changes",
        "Multi-store access for enterprise merchants",
      ],
    },
  ];

  return (
    <div className="landing-page-root">
      {/* Hero */}
      <section className="hero-section" style={{ padding: "4rem 0 3.5rem" }}>
        <div className="landing-container">
          <div className="hero-badge">
            <FaLayerGroup /> Platform Capabilities
          </div>
          <h1 className="hero-title">
            Enterprise Services for{" "}
            <span className="hero-highlight">Every Stage</span> of Growth
          </h1>
          <p className="hero-subtitle">
            DukaanOnline provides the full suite of e-commerce capabilities
            designed to eliminate operational friction and accelerate your sales.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="features-section">
        <div className="landing-container">
          <div className="features-grid">
            {services.map((svc, idx) => (
              <div key={idx} className={`feature-card ${idx % 2 === 1 ? "orange" : ""}`}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <div className="feature-icon-wrapper" style={{ marginBottom: 0 }}>
                    {svc.icon}
                  </div>
                  <span className="showcase-badge">{svc.badge}</span>
                </div>
                <h3 className="feature-title">{svc.title}</h3>
                <p className="feature-text" style={{ marginBottom: "1.25rem" }}>
                  {svc.desc}
                </p>
                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "1rem", marginTop: "auto" }}>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {svc.features.map((item, fIdx) => (
                      <li key={fIdx} style={{ fontSize: "0.85rem", color: "#475569", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <FaCheck size={11} style={{ color: "#0d9488", flexShrink: 0 }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner-section">
        <div className="landing-container">
          <h2 className="cta-banner-title">Ready to Experience DukaanOnline?</h2>
          <p className="cta-banner-text">
            Start with our 3-step merchant onboarding application today.
          </p>
          <div className="hero-cta-group" style={{ marginBottom: 0 }}>
            <Link to="/apply" className="btn-hero-primary">
              <span>Apply for a Store</span>
              <FaArrowRight />
            </Link>
            <Link to="/pricing" className="btn-hero-secondary">
              <span>Explore Plans</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
