import React from "react";
import "./Footer.css";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaShieldAlt,
  FaTruck
} from "react-icons/fa";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-container" role="contentinfo">
      <div className="footer-content">
        {/* Brand & Mission Column */}
        <div className="footer-section footer-section--brand">
          <div className="footer-brand-title">Style Thread</div>
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
              <span>Fast Shipping</span>
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
          <div className="footer-social-row">
            <a
              href="https://facebook.com"
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
              href="https://instagram.com"
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
          © {currentYear} Style Thread. All rights reserved.
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
