import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";
import {
  FaRocket,
  FaShieldAlt,
  FaStore,
  FaArrowRight,
  FaCreditCard,
  FaBoxes,
  FaUsersCog,
  FaSearch,
  FaExternalLinkAlt,
  FaFileInvoiceDollar,
} from "react-icons/fa";

export const LandingPage: React.FC = () => {
  const showcaseStores = [
    {
      name: "Urban Threads",
      slug: "urban-threads",
      category: "Streetwear & Contemporary",
      description: "Urban fashion curated for modern tastemakers with vibrant street aesthetics.",
    },
    {
      name: "Lucary",
      slug: "lucary",
      category: "Luxury Formalwear",
      description: "High-end artisanal apparel, bespoke tailoring, and elegant evening wear.",
    },
    {
      name: "StyleThread Official",
      slug: "default",
      category: "Flagship Apparel",
      description: "The platform's flagship store showcasing seasonal collections and trends.",
    },
  ];

  return (
    <div className="landing-page-root">
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="landing-container">
          <div className="hero-badge">
            <FaRocket /> Next-Generation Multi-Tenant Commerce
          </div>
          <h1 className="hero-title">
            Launch, Scale & Manage Your Store on{" "}
            <span className="hero-highlight">Dukaan</span>
            <span className="hero-accent">Online</span>
          </h1>
          <p className="hero-subtitle">
            The enterprise multi-tenant e-commerce platform for independent brands,
            merchants, and boutique manufacturers. Get your own isolated storefront,
            custom branding, and automated payments in under 48 hours.
          </p>

          <div className="hero-cta-group">
            <Link to="/apply" className="btn-hero-primary">
              <span>Apply for a Store</span>
              <FaArrowRight />
            </Link>
            <Link to="/apply/status" className="btn-hero-secondary">
              <FaSearch />
              <span>Track Application</span>
            </Link>
          </div>

          <div className="hero-stats-bar">
            <div className="hero-stat-card">
              <div className="hero-stat-number">99.98%</div>
              <div className="hero-stat-label">Platform Uptime</div>
            </div>
            <div className="hero-stat-card">
              <div className="hero-stat-number">&lt; 48 Hrs</div>
              <div className="hero-stat-label">Fast Onboarding</div>
            </div>
            <div className="hero-stat-card">
              <div className="hero-stat-number">100%</div>
              <div className="hero-stat-label">Tenant Isolation</div>
            </div>
            <div className="hero-stat-card">
              <div className="hero-stat-number">Instant</div>
              <div className="hero-stat-label">Order Settlement</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Features */}
      <section className="features-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-tag">Enterprise Architecture</span>
            <h2 className="section-title">Built for Modern Online Merchants</h2>
            <p className="section-desc">
              Everything you need to run a thriving e-commerce business without
              managing servers, devops, or complex database schemas.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <FaShieldAlt />
              </div>
              <h3 className="feature-title">Strict Tenant Isolation</h3>
              <p className="feature-text">
                Your catalog, customer data, and sales transactions are strictly
                isolated at the database and API middleware levels. Zero data
                leakage across stores.
              </p>
            </div>

            <div className="feature-card orange">
              <div className="feature-icon-wrapper">
                <FaStore />
              </div>
              <h3 className="feature-title">Custom Brand Identity</h3>
              <p className="feature-text">
                Define your primary and accent colors, upload custom logos, set
                promotional announcement banners, and configure your unique storefront slug.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <FaCreditCard />
              </div>
              <h3 className="feature-title">Turnkey Payment Gateway</h3>
              <p className="feature-text">
                Accept credit cards, debit cards, UPI, and digital wallets
                seamlessly through integrated payment processing with automatic settlements.
              </p>
            </div>

            <div className="feature-card orange">
              <div className="feature-icon-wrapper">
                <FaBoxes />
              </div>
              <h3 className="feature-title">Real-Time Inventory Health</h3>
              <p className="feature-text">
                Track stock across multiple product variants, receive automated
                low-inventory alerts, and prevent overselling during high-volume flash sales.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <FaUsersCog />
              </div>
              <h3 className="feature-title">Dedicated Merchant Portal</h3>
              <p className="feature-text">
                Manage your store with a dedicated Store Admin console. Process orders,
                update listings, manage staff roles, and download order manifests.
              </p>
            </div>

            <div className="feature-card orange">
              <div className="feature-icon-wrapper">
                <FaFileInvoiceDollar />
              </div>
              <h3 className="feature-title">Analytics & Invoicing</h3>
              <p className="feature-text">
                Visualize revenue velocity, top-performing product categories, customer
                retention rates, and automated PDF tax invoices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 4-Step Onboarding Roadmap */}
      <section className="roadmap-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-tag">How It Works</span>
            <h2 className="section-title">From Application to Live Store in 4 Steps</h2>
            <p className="section-desc">
              Our streamlined onboarding process ensures your brand is thoroughly
              vetted and equipped with dedicated infrastructure.
            </p>
          </div>

          <div className="roadmap-grid">
            <div className="roadmap-step-card">
              <div className="roadmap-step-number">1</div>
              <h3 className="roadmap-step-title">Submit Application</h3>
              <p className="roadmap-step-text">
                Complete our 3-step merchant application with your business details,
                desired store slug, and contact credentials.
              </p>
            </div>

            <div className="roadmap-step-card">
              <div className="roadmap-step-number">2</div>
              <h3 className="roadmap-step-title">Super Admin Review</h3>
              <p className="roadmap-step-text">
                Our platform compliance team reviews your business registration and
                verifies proposed storefront information within 24 to 48 hours.
              </p>
            </div>

            <div className="roadmap-step-card">
              <div className="roadmap-step-number">3</div>
              <h3 className="roadmap-step-title">Turnkey Provisioning</h3>
              <p className="roadmap-step-text">
                Upon approval, an Administrator is assigned to your store and your
                dedicated tenant workspace is automatically created.
              </p>
            </div>

            <div className="roadmap-step-card">
              <div className="roadmap-step-number">4</div>
              <h3 className="roadmap-step-title">Go Live & Scale</h3>
              <p className="roadmap-step-text">
                Log into your Store Admin console, upload your products, customize
                branding colors, and start accepting online orders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Storefront Showcase */}
      <section className="showcase-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-tag">Merchant Showcase</span>
            <h2 className="section-title">Stores Thriving on DukaanOnline</h2>
            <p className="section-desc">
              Explore live customer storefronts operating on our multi-tenant infrastructure.
            </p>
          </div>

          <div className="showcase-grid">
            {showcaseStores.map((store) => (
              <div key={store.slug} className="showcase-card">
                <div className="showcase-header">
                  <span className="showcase-badge">{store.category}</span>
                  <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                    /{store.slug}
                  </span>
                </div>
                <h3 className="showcase-name">{store.name}</h3>
                <p className="showcase-desc">{store.description}</p>
                <a
                  href={`/store/${store.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-visit-store"
                >
                  <span>Explore Live Store</span>
                  <FaExternalLinkAlt size={12} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Call To Action Banner */}
      <section className="cta-banner-section">
        <div className="landing-container">
          <h2 className="cta-banner-title">Ready to Launch Your Online Store?</h2>
          <p className="cta-banner-text">
            Join hundreds of thriving retail brands powered by DukaanOnline.
            Submit your store application in under 5 minutes.
          </p>
          <div className="hero-cta-group" style={{ marginBottom: 0 }}>
            <Link to="/apply" className="btn-hero-primary">
              <span>Start Your Application</span>
              <FaArrowRight />
            </Link>
            <Link to="/pricing" className="btn-hero-secondary">
              <span>View Pricing Plans</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
