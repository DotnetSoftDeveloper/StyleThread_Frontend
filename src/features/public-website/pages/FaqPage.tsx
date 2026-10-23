import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";
import {
  FaQuestionCircle,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaArrowRight,
} from "react-icons/fa";

export const FaqPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const categories = ["ALL", "Onboarding", "Branding & Storefront", "Payments", "Security & Data"];

  const faqs = [
    {
      category: "Onboarding",
      q: "How long does it take for my store application to be reviewed and approved?",
      a: "Our Super Administrator team reviews applications within 24 to 48 hours. Once approved and an Admin is assigned, your store is instantly accessible via your customized URL.",
    },
    {
      category: "Onboarding",
      q: "What documents or information do I need to submit during application?",
      a: "You need your legal business name, brand summary, primary contact email, mobile phone number, owner details, and desired storefront slug.",
    },
    {
      category: "Onboarding",
      q: "How can I check the live status of my application?",
      a: "Use our public 'Track Application' portal (/apply/status) using the unique reference tracking number (e.g., REQ-XXXXXX) and contact email provided during submission.",
    },
    {
      category: "Branding & Storefront",
      q: "Can I connect my own custom domain to my storefront?",
      a: "Yes! All stores receive an immediate sub-path URL (e.g. dukaanonline.com/store/yourbrand), and you can configure your own custom domain (e.g. www.yourbrand.com) in your store settings after approval.",
    },
    {
      category: "Branding & Storefront",
      q: "Can I customize the colors, logos, and banners of my store?",
      a: "Absolutely. Through your dedicated Store Admin console, you can customize your brand's primary and accent colors, upload high-resolution logos, and create announcement banners without touching code.",
    },
    {
      category: "Payments",
      q: "What payment gateways are supported?",
      a: "Every store has an integrated Razorpay payment gateway supporting credit cards, debit cards, UPI, net banking, and digital wallets with automated settlement directly to your business account.",
    },
    {
      category: "Payments",
      q: "Does DukaanOnline take a percentage commission on my sales?",
      a: "No! DukaanOnline charges zero transaction commission. You only pay standard gateway interchange processing fees and your platform subscription plan.",
    },
    {
      category: "Security & Data",
      q: "How does multi-tenant data isolation work?",
      a: "DukaanOnline uses enterprise-grade multi-tenant architecture. Every catalog, customer address book, order history, inventory record, and discount code is strictly scoped by Tenant ID with cross-tenant IDOR protection enforced in the backend middleware.",
    },
    {
      category: "Security & Data",
      q: "Can other stores see my customers, products, or sales numbers?",
      a: "Never. Tenant boundaries are strictly verified on every single database query and API call. No store has access to another tenant's metrics or customers.",
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCat = activeCategory === "ALL" || faq.category === activeCategory;
    const matchesSearch =
      faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const toggleFaq = (idx: number) => {
    if (openIndices.includes(idx)) {
      setOpenIndices(openIndices.filter((i) => i !== idx));
    } else {
      setOpenIndices([...openIndices, idx]);
    }
  };

  return (
    <div className="landing-page-root">
      {/* Hero */}
      <section className="hero-section" style={{ padding: "4rem 0 3rem" }}>
        <div className="landing-container">
          <div className="hero-badge">
            <FaQuestionCircle /> Help & Guidance
          </div>
          <h1 className="hero-title">
            Frequently Asked <span className="hero-highlight">Questions</span>
          </h1>
          <p className="hero-subtitle">
            Find answers to common questions about onboarding, store branding,
            payments, tenant isolation, and platform features.
          </p>

          {/* Search Bar */}
          <div
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "12px",
              padding: "0.6rem 1rem",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <FaSearch style={{ color: "#94a3b8", marginRight: "0.75rem" }} />
            <input
              type="text"
              placeholder="Search by keyword (e.g. approval, domain, payment)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontSize: "0.95rem",
                color: "#0f172a",
              }}
            />
          </div>
        </div>
      </section>

      {/* Category Pills & FAQ Accordion */}
      <section className="features-section" style={{ backgroundColor: "#ffffff" }}>
        <div className="landing-container" style={{ maxWidth: "900px" }}>
          {/* Category Filter Pills */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              justifyContent: "center",
              marginBottom: "2.5rem",
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "0.45rem 1rem",
                  borderRadius: "9999px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: activeCategory === cat ? "1px solid #0d9488" : "1px solid #e2e8f0",
                  backgroundColor: activeCategory === cat ? "#0d9488" : "#f8fafc",
                  color: activeCategory === cat ? "#ffffff" : "#475569",
                  transition: "all 0.2s",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Accordion list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {filteredFaqs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                No questions found matching your search. Try different terms or contact our support team.
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openIndices.includes(idx);
                return (
                  <div
                    key={idx}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      backgroundColor: isOpen ? "#f8fafc" : "#ffffff",
                      overflow: "hidden",
                      transition: "all 0.2s",
                    }}
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "1.25rem 1.5rem",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        gap: "1rem",
                      }}
                    >
                      <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a" }}>
                        {faq.q}
                      </span>
                      <span style={{ color: isOpen ? "#0d9488" : "#94a3b8", flexShrink: 0 }}>
                        {isOpen ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                      </span>
                    </button>
                    {isOpen && (
                      <div
                        style={{
                          padding: "0 1.5rem 1.25rem",
                          color: "#475569",
                          fontSize: "0.95rem",
                          lineHeight: 1.65,
                          borderTop: "1px solid #edf2f7",
                          paddingTop: "1rem",
                        }}
                      >
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Still Have Questions CTA */}
      <section className="cta-banner-section">
        <div className="landing-container">
          <h2 className="cta-banner-title">Still Have Questions?</h2>
          <p className="cta-banner-text">
            Our merchant onboarding team is here to assist you with any questions.
          </p>
          <div className="hero-cta-group" style={{ marginBottom: 0 }}>
            <Link to="/contact" className="btn-hero-primary">
              <span>Contact Us</span>
              <FaArrowRight />
            </Link>
            <Link to="/apply" className="btn-hero-secondary">
              <span>Apply for a Store</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FaqPage;
