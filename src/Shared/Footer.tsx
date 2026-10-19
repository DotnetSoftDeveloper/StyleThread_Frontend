import React from "react";
import "./Footer.css";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaShieldAlt,
  FaTruck,
  FaEnvelope,
  FaPhone
} from "react-icons/fa";
import { useTenant } from "../Context/TenantContext";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { tenant, settings } = useTenant();

  const storeName = tenant?.storeName || "Style Thread";
  const currencySymbol = settings?.currency === "INR" || !settings?.currency ? "₹" : `${settings.currency} `;
  const freeShippingThreshold = settings?.freeShippingThreshold ?? 500;

  return (
    <footer className="footer-container" role="contentinfo">
      <div className="footer-content">
        {/* Brand & Mission Column */}
        <div className="footer-section footer-section--brand">
          <div className="footer-brand-title">{storeName}</div>
          <p className="footer-text">
            Discover contemporary clothing and curated fashion collections. Quality apparel designed for everyday elegance and comfort.
          </p>
          <div className="footer-trust-badges">
            <span className="footer-trust-badge">
              <FaShieldAlt aria-hidden="true" />
              <span>100% Genuine</span>
            </span>
            <span className="footer-trust-badge">
              <FaTruck aria-hidden="true" />
              <span>Free Shipping &gt; {currencySymbol}{freeShippingThreshold}</span>
            </span>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="footer-section">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li>
              <Link to="/home" className="footer-link">Home</Link>
            </li>
            <li>
              <Link to="/about" className="footer-link">About Us</Link>
            </li>
            <li>
              <Link to="/contact" className="footer-link">Contact & Support</Link>
            </li>
            <li>
              <Link to="/profile" className="footer-link">My Account & Orders</Link>
            </li>
          </ul>
        </div>

        {/* Collections Column */}
        <div className="footer-section">
          <h4 className="footer-heading">Collections</h4>
          <ul className="footer-links">
            <li>
              <Link to="/home" className="footer-link">All Products</Link>
            </li>
            <li>
              <Link to="/home" className="footer-link">Men's Apparel</Link>
            </li>
            <li>
              <Link to="/home" className="footer-link">Women's Fashion</Link>
            </li>
            <li>
              <Link to="/home" className="footer-link">Baby & Kids</Link>
            </li>
            <li>
              <Link to="/home" className="footer-link">Sports & Activewear</Link>
            </li>
          </ul>
        </div>

        {/* Social & Connect Column */}
        <div className="footer-section">
          <h4 className="footer-heading">Connect With Us</h4>
          <p className="footer-text footer-text--sub">
            Follow our journey on social media for new seasonal drops, sales, and style guides.
          </p>
          {(settings?.supportEmail || settings?.supportPhone) && (
            <div className="footer-contact-info" style={{ marginBottom: "1rem", fontSize: "0.85rem", color: "#cbd5e1" }}>
              {settings.supportEmail && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                  <FaEnvelope aria-hidden="true" style={{ color: "var(--tenant-accent, #38bdf8)" }} />
                  <a href={`mailto:${settings.supportEmail}`} style={{ color: "#e2e8f0", textDecoration: "none" }}>
                    {settings.supportEmail}
                  </a>
                </div>
              )}
              {settings.supportPhone && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FaPhone aria-hidden="true" style={{ color: "var(--tenant-accent, #38bdf8)" }} />
                  <a href={`tel:${settings.supportPhone}`} style={{ color: "#e2e8f0", textDecoration: "none" }}>
                    {settings.supportPhone}
                  </a>
                </div>
              )}
            </div>
          )}
          <div className="footer-social-row">
            <a
              href={settings?.facebookUrl || "https://facebook.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-circle"
              aria-label="Facebook"
            >
              <FaFacebookF aria-hidden="true" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-circle"
              aria-label="Twitter"
            >
              <FaTwitter aria-hidden="true" />
            </a>
            <a
              href={settings?.instagramUrl || "https://instagram.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-circle"
              aria-label="Instagram"
            >
              <FaInstagram aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Legal Strip */}
      <div className="footer-bottom">
        <p className="footer-bottom-text">
          © {currentYear} {storeName}. All rights reserved.
        </p>
        <div className="footer-bottom-links">
          <span>Privacy Policy</span>
          <span className="dot">•</span>
          <span>Terms of Service</span>
          <span className="dot">•</span>
          <span>Shipping & Returns</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
