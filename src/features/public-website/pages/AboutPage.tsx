import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";
import {
  FaShieldAlt,
  FaRocket,
  FaStore,
  FaArrowRight,
  FaAward,
  FaChartLine,
} from "react-icons/fa";

export const AboutPage: React.FC = () => {
  return (
    <div className="landing-page-root">
      {/* Hero Section */}
      <section className="hero-section" style={{ padding: "4rem 0 3.5rem" }}>
        <div className="landing-container">
          <div className="hero-badge">
            <FaAward /> About DukaanOnline
          </div>
          <h1 className="hero-title">
            Empowering Modern Retailers with{" "}
            <span className="hero-highlight">Enterprise</span>
            <span className="hero-accent"> Infrastructure</span>
          </h1>
          <p className="hero-subtitle">
            DukaanOnline was born from a simple belief: every retail business,
            from boutique designers to established distributors, deserves
            world-class e-commerce infrastructure without the burden of custom
            server engineering.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="features-section" style={{ backgroundColor: "#ffffff" }}>
        <div className="landing-container">
          <div className="features-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div className="feature-card" style={{ padding: "3rem" }}>
              <div className="feature-icon-wrapper">
                <FaRocket />
              </div>
              <h2 className="feature-title" style={{ fontSize: "1.6rem" }}>Our Mission</h2>
              <p className="feature-text" style={{ fontSize: "1.05rem", lineHeight: "1.7" }}>
                To bridge the gap between offline retail excellence and high-speed
                digital commerce. We provide turnkey storefront provisioning, isolated
                inventory management, and enterprise data security so merchants can focus
                on building relationships with their customers.
              </p>
            </div>

            <div className="feature-card orange" style={{ padding: "3rem" }}>
              <div className="feature-icon-wrapper">
                <FaShieldAlt />
              </div>
              <h2 className="feature-title" style={{ fontSize: "1.6rem" }}>Our Architecture</h2>
              <p className="feature-text" style={{ fontSize: "1.05rem", lineHeight: "1.7" }}>
                Built on modern cloud-native principles, DukaanOnline enforces 100%
                tenant isolation at both the database query layer and HTTP middleware.
                Each store enjoys independent product catalogs, separate order pipelines,
                and dedicated administrative permissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="features-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-tag">Core Principles</span>
            <h2 className="section-title">Why Merchants Choose DukaanOnline</h2>
            <p className="section-desc">
              We stand apart through our commitment to performance, reliability, and merchant autonomy.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <FaShieldAlt />
              </div>
              <h3 className="feature-title">Data Sovereignty</h3>
              <p className="feature-text">
                Your customer lists, transaction histories, and inventory figures belong
                exclusively to you. We never monetize or cross-pollinate merchant data.
              </p>
            </div>

            <div className="feature-card orange">
              <div className="feature-icon-wrapper">
                <FaStore />
              </div>
              <h3 className="feature-title">Brand Uniqueness</h3>
              <p className="feature-text">
                No cookie-cutter templates. Your storefront reflects your distinctive brand identity
                with customizable color schemes, typography, and banner announcements.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <FaChartLine />
              </div>
              <h3 className="feature-title">Built to Scale</h3>
              <p className="feature-text">
                Whether processing 10 orders a day or 10,000 during festival sales, our
                elastic backend scales automatically to maintain sub-second page loads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="cta-banner-section">
        <div className="landing-container">
          <h2 className="cta-banner-title">Build Your Future on DukaanOnline</h2>
          <p className="cta-banner-text">
            Submit your store application today and join the modern multi-tenant commerce revolution.
          </p>
          <div className="hero-cta-group" style={{ marginBottom: 0 }}>
            <Link to="/apply" className="btn-hero-primary">
              <span>Apply for a Store</span>
              <FaArrowRight />
            </Link>
            <Link to="/contact" className="btn-hero-secondary">
              <span>Contact Platform Team</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
