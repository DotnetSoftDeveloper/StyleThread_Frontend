import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaRocket,
  FaShieldAlt,
  FaStore,
  FaArrowRight,
  FaGlobe,
  FaChartLine,
  FaCreditCard,
  FaBoxes,
  FaUsersCog,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaSearch,
} from "react-icons/fa";
import "./BusinessLandingPage.css";

const BusinessLandingPage: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      q: "How long does it take for my store application to be reviewed and approved?",
      a: "Our Super Administrator team reviews applications within 24 to 48 hours. Once approved and an Admin is assigned, your store is instantly accessible via your customized URL.",
    },
    {
      q: "Can I connect my own custom domain to my storefront?",
      a: "Yes! All stores receive an immediate sub-path URL (e.g. stylethread.com/store/yourbrand), and you can configure your own custom domain (e.g. www.yourbrand.com) in your store settings after approval.",
    },
    {
      q: "What payment gateways are supported?",
      a: "Every store has an integrated Razorpay payment gateway supporting credit cards, debit cards, UPI, net banking, and digital wallets with automated settlement directly to your business account.",
    },
    {
      q: "How does tenant data isolation work?",
      a: "StyleThread uses enterprise-grade multi-tenant architecture. Every catalog, customer address book, order history, inventory record, and discount code is strictly scoped by Tenant ID with cross-tenant IDOR protection enforced in the backend middleware.",
    },
    {
      q: "What administrative roles are available for my team?",
      a: "Each store can have assigned Store Admins (full catalog, settings, orders, and branding control) and Store Sellers (product management and order fulfillment), keeping operational roles distinct.",
    },
  ];

  return (
    <div className="business-landing">
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="landing-container">
          <div className="hero-badge">
            <FaRocket /> Next-Generation Multi-Tenant Commerce
          </div>
          <h1 className="hero-title">
            Launch & Scale Your Fashion Brand on{" "}
            <span className="hero-gradient-text">StyleThread</span>
          </h1>
          <p className="hero-subtitle">
            The enterprise multi-tenant platform built for independent fashion labels,
            boutiques, and apparel manufacturers. Get your isolated storefront, custom
            branding, and automated payment settlement in 48 hours.
          </p>

          <div className="hero-actions">
            <Link to="/apply" className="btn-primary-launch">
              Launch Your Storefront <FaArrowRight />
            </Link>
            <Link to="/apply/status" className="btn-secondary-status">
              <FaSearch /> Check Application Status
            </Link>
          </div>

          <div className="hero-trust-metrics">
            <div className="trust-item">
              <h4>99.98%</h4>
              <p>Platform Uptime</p>
            </div>
            <div className="trust-item">
              <h4>&lt; 48 Hrs</h4>
              <p>Average Onboarding Time</p>
            </div>
            <div className="trust-item">
              <h4>100%</h4>
              <p>Isolated Tenant Data</p>
            </div>
            <div className="trust-item">
              <h4>Instant</h4>
              <p>Payment Settlement</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Features */}
      <section className="features-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-tag">Enterprise Capabilities</span>
            <h2 className="section-title">Everything Your Brand Needs to Sell Online</h2>
            <p className="section-desc">
              From isolated data security to customizable storefront themes, StyleThread handles the
              technology so you can focus on designing and selling.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <FaShieldAlt />
              </div>
              <h3>Strict Multi-Tenant Isolation</h3>
              <p>
                Each brand operates in an isolated environment with cryptographic role tokens,
                preventing data crossover and ensuring confidential business metrics.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <FaGlobe />
              </div>
              <h3>Dedicated URL & Custom Domains</h3>
              <p>
                Access your store instantly at <code>/store/:slug</code> with full support for
                custom domain mapping, SSL certificate provisioning, and SEO optimization.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <FaBoxes />
              </div>
              <h3>Variant & Inventory Matrix</h3>
              <p>
                Manage apparel sizes, colors, and stock levels seamlessly with automated low-stock
                alerts and SKU-level inventory reservation upon checkout.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <FaCreditCard />
              </div>
              <h3>Turnkey Payments & Logistics</h3>
              <p>
                Integrated Razorpay payment processing, localized tax calculation, configurable
                free-shipping thresholds, and standard courier partner integrations.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <FaChartLine />
              </div>
              <h3>Real-Time Analytics & Reporting</h3>
              <p>
                Track gross sales, net revenue, average order value, conversion funnels, and top
                selling apparel lines with interactive administrative charts.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <FaUsersCog />
              </div>
              <h3>Granular Role Delegation</h3>
              <p>
                Assign Store Admins and Store Sellers with tailored permissions for catalog
                curation, order fulfillment, and customer return disputes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Onboarding Workflow */}
      <section className="workflow-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-tag">Simple 4-Step Process</span>
            <h2 className="section-title">How Your Storefront Goes Live</h2>
            <p className="section-desc">
              We ensure every storefront meets quality and authenticity standards through our
              transparent review and activation pipeline.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Submit Application</h3>
              <p>
                Provide your business details, tax ID, desired storefront slug, and owner contact.
                Receive an instant tracking reference number.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Super Admin Review</h3>
              <p>
                Our platform compliance team verifies business authenticity. If needed, we request
                clarifications directly through your tracking portal.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Admin Assignment</h3>
              <p>
                Upon approval, the Super Admin assigns a dedicated Store Administrator account with
                full store management credentials.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Storefront Activated</h3>
              <p>
                Your storefront transitions to Active status. Upload your catalog, configure branding
                colors, and accept orders worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Live Store Showcase */}
      <section className="showcase-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-tag">Featured Storefronts</span>
            <h2 className="section-title">Brands Thriving on StyleThread</h2>
            <p className="section-desc">
              Experience the performance and distinct branding of active stores running on our
              multi-tenant infrastructure.
            </p>
          </div>

          <div className="showcase-grid">
            <div className="showcase-card">
              <div
                className="showcase-preview"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80')",
                }}
              >
                <span className="showcase-badge">Flagship Store</span>
              </div>
              <div className="showcase-body">
                <h3>Style Thread Classic</h3>
                <p>
                  Contemporary apparel, timeless essentials, and everyday fashion staples with
                  curated seasonal collections.
                </p>
                <Link to="/store/default" className="btn-visit-store">
                  <FaStore /> Visit Storefront
                </Link>
              </div>
            </div>

            <div className="showcase-card">
              <div
                className="showcase-preview"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80')",
                }}
              >
                <span className="showcase-badge">Streetwear & Denim</span>
              </div>
              <div className="showcase-body">
                <h3>Urban Threads</h3>
                <p>
                  Modern urban streetwear, oversized tees, raw denim, and bold accessories for the
                  next generation of fashion forward youth.
                </p>
                <Link to="/store/urban-threads" className="btn-visit-store">
                  <FaStore /> Visit Storefront
                </Link>
              </div>
            </div>

            <div className="showcase-card">
              <div
                className="showcase-preview"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80')",
                }}
              >
                <span className="showcase-badge">Bespoke & Lifestyle</span>
              </div>
              <div className="showcase-body">
                <h3>Lucary Interior</h3>
                <p>
                  Luxurious lifestyle textiles, organic lounge attire, and designer interior
                  accent garments crafted with sustainable cotton.
                </p>
                <Link to="/store/lucary" className="btn-visit-store">
                  <FaStore /> Visit Storefront
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Pricing Plans */}
      <section className="pricing-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-tag">Transparent Pricing</span>
            <h2 className="section-title">Plans Scaled to Your Business Size</h2>
            <p className="section-desc">
              Transparent platform rates with zero hidden server maintenance fees or surprise charges.
            </p>
          </div>

          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Boutique Starter</h3>
                <p className="pricing-desc">
                  Ideal for emerging creators and single-designer boutiques.
                </p>
              </div>
              <div className="pricing-cost">
                <span className="amount">₹0</span>
                <span className="period">/ month + 2% per order</span>
              </div>
              <ul className="pricing-features">
                <li>
                  <FaCheckCircle /> Dedicated <code>/store/:slug</code> URL
                </li>
                <li>
                  <FaCheckCircle /> Up to 250 Active Products
                </li>
                <li>
                  <FaCheckCircle /> Integrated Razorpay Gateway
                </li>
                <li>
                  <FaCheckCircle /> 1 Store Admin & 2 Seller Accounts
                </li>
                <li>
                  <FaCheckCircle /> Standard Email Support
                </li>
              </ul>
              <Link to="/apply" className="btn-pricing-cta outline">
                Apply as Boutique
              </Link>
            </div>

            <div className="pricing-card featured">
              <span className="popular-tag">Most Popular</span>
              <div className="pricing-header">
                <h3>Growth Brand</h3>
                <p className="pricing-desc">
                  Engineered for established retail labels and high-volume apparel brands.
                </p>
              </div>
              <div className="pricing-cost">
                <span className="amount">₹3,999</span>
                <span className="period">/ month + 1% per order</span>
              </div>
              <ul className="pricing-features">
                <li>
                  <FaCheckCircle /> Custom Domain Mapping (www.brand.com)
                </li>
                <li>
                  <FaCheckCircle /> Unlimited Products & Variant Matrix
                </li>
                <li>
                  <FaCheckCircle /> Real-Time Analytics Dashboard
                </li>
                <li>
                  <FaCheckCircle /> 5 Store Admins & Unlimited Sellers
                </li>
                <li>
                  <FaCheckCircle /> Priority 24/7 Technical Support
                </li>
              </ul>
              <Link to="/apply" className="btn-pricing-cta primary">
                Apply for Growth Plan
              </Link>
            </div>

            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Enterprise Fleet</h3>
                <p className="pricing-desc">
                  For multi-brand retail houses and international fashion conglomerates.
                </p>
              </div>
              <div className="pricing-cost">
                <span className="amount">₹9,999</span>
                <span className="period">/ month + 0.5% per order</span>
              </div>
              <ul className="pricing-features">
                <li>
                  <FaCheckCircle /> Multi-Store Fleet Management
                </li>
                <li>
                  <FaCheckCircle /> Dedicated Database Isolation Cluster
                </li>
                <li>
                  <FaCheckCircle /> Custom ERP & Inventory Sync APIs
                </li>
                <li>
                  <FaCheckCircle /> 99.99% Guaranteed SLA Uptime
                </li>
                <li>
                  <FaCheckCircle /> Dedicated Customer Success Manager
                </li>
              </ul>
              <Link to="/apply" className="btn-pricing-cta outline">
                Contact Enterprise Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="faq-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-tag">Got Questions?</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-desc">
              Everything you need to know about opening and operating a storefront on StyleThread.
            </p>
          </div>

          <div className="faq-list">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="faq-item">
                  <button
                    className="faq-question"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                  {isOpen && <p className="faq-answer">{faq.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Final Banner CTA */}
      <section className="cta-banner-section">
        <div className="landing-container">
          <h2>Ready to Launch Your Digital Fashion Empire?</h2>
          <p>
            Join hundreds of visionary apparel brands growing their revenue with StyleThread's
            cutting-edge commerce platform.
          </p>
          <div className="hero-actions">
            <Link to="/apply" className="btn-primary-launch">
              Get Started Now <FaArrowRight />
            </Link>
            <Link to="/apply/status" className="btn-secondary-status">
              Track Existing Application
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BusinessLandingPage;
