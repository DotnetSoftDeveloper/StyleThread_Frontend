import React, { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import "./PublicLayout.css";
import brandLogo from "../../assets/brand/dukaanonline-logo.svg";
import brandLogoLight from "../../assets/brand/dukaanonline-logo-light.svg";
import {
  FaBars,
  FaTimes,
  FaRocket,
  FaSearch,
  FaShieldAlt,
  FaStore,
  FaArrowRight,
  FaCheckCircle,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";

export const PublicLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="public-layout-container">
      {/* Platform Navigation Bar */}
      <header className="public-header">
        <div className="public-header-inner">
          {/* DukaanOnline Brand Logo */}
          <Link to="/" className="public-brand-link" onClick={closeMenu}>
            <img
              src={brandLogo}
              alt="DukaanOnline"
              className="public-brand-logo"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav>
            <ul className="public-nav-links">
              <li>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `public-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  Overview
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/services"
                  className={({ isActive }) =>
                    `public-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  Services
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/how-it-works"
                  className={({ isActive }) =>
                    `public-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  How It Works
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/pricing"
                  className={({ isActive }) =>
                    `public-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  Pricing
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `public-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  About
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/faq"
                  className={({ isActive }) =>
                    `public-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  FAQ
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    `public-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  Contact
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* Header Action CTAs (Strictly public and merchant sign-in) */}
          <div className="public-header-actions">
            <Link to="/apply/status" className="btn-track-status">
              <FaSearch size={12} />
              <span>Track Application</span>
            </Link>
            <Link to="/admin/login" className="btn-merchant-signin" title="Store Owner Portal Login">
              <FaStore size={12} />
              <span>Merchant Sign In</span>
            </Link>
            <Link to="/apply" className="btn-apply-cta">
              <FaRocket size={13} />
              <span>Apply for a Store</span>
            </Link>
            <button
              className="public-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="public-mobile-menu">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `public-nav-link ${isActive ? "active" : ""}`
              }
              onClick={closeMenu}
            >
              Overview
            </NavLink>
            <NavLink
              to="/services"
              className={({ isActive }) =>
                `public-nav-link ${isActive ? "active" : ""}`
              }
              onClick={closeMenu}
            >
              Services
            </NavLink>
            <NavLink
              to="/how-it-works"
              className={({ isActive }) =>
                `public-nav-link ${isActive ? "active" : ""}`
              }
              onClick={closeMenu}
            >
              How It Works
            </NavLink>
            <NavLink
              to="/pricing"
              className={({ isActive }) =>
                `public-nav-link ${isActive ? "active" : ""}`
              }
              onClick={closeMenu}
            >
              Pricing
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `public-nav-link ${isActive ? "active" : ""}`
              }
              onClick={closeMenu}
            >
              About
            </NavLink>
            <NavLink
              to="/faq"
              className={({ isActive }) =>
                `public-nav-link ${isActive ? "active" : ""}`
              }
              onClick={closeMenu}
            >
              FAQ
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `public-nav-link ${isActive ? "active" : ""}`
              }
              onClick={closeMenu}
            >
              Contact
            </NavLink>

            <div className="public-mobile-menu-actions">
              <Link
                to="/apply/status"
                className="btn-track-status"
                onClick={closeMenu}
              >
                <FaSearch size={12} />
                <span>Track Application</span>
              </Link>
              <Link
                to="/admin/login"
                className="btn-merchant-signin"
                onClick={closeMenu}
              >
                <FaStore size={12} />
                <span>Merchant Sign In</span>
              </Link>
              <Link
                to="/apply"
                className="btn-apply-cta"
                onClick={closeMenu}
              >
                <FaRocket size={13} />
                <span>Apply for a Store</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="public-main-content">
        <Outlet />
      </main>

      {/* Platform Public Footer */}
      <footer className="public-footer">
        <div className="public-footer-inner">
          <div className="public-footer-grid">
            {/* Column 1: Brand & Identity */}
            <div className="public-footer-brand-col">
              <img
                src={brandLogoLight}
                alt="DukaanOnline"
                className="public-footer-logo"
              />
              <p className="public-footer-tagline">
                The enterprise multi-tenant e-commerce platform empowering businesses
                to launch, manage, and scale branded online storefronts with turnkey
                infrastructure.
              </p>
              <div className="public-footer-badges">
                <span className="footer-badge">
                  <FaShieldAlt size={11} /> 100% Tenant Isolation
                </span>
                <span className="footer-badge">
                  <FaCheckCircle size={11} /> 99.9% Uptime SLA
                </span>
                <span className="footer-badge">
                  <FaStore size={11} /> Turnkey Provisioning
                </span>
              </div>
            </div>

            {/* Column 2: Platform Links */}
            <div className="public-footer-col">
              <h4 className="public-footer-title">Platform</h4>
              <ul className="public-footer-links">
                <li>
                  <Link to="/services" className="public-footer-link">
                    <FaArrowRight size={10} /> Services & Capabilities
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="public-footer-link">
                    <FaArrowRight size={10} /> How It Works
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="public-footer-link">
                    <FaArrowRight size={10} /> Pricing & Plans
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="public-footer-link">
                    <FaArrowRight size={10} /> About DukaanOnline
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="public-footer-link">
                    <FaArrowRight size={10} /> Frequently Asked Questions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Merchants */}
            <div className="public-footer-col">
              <h4 className="public-footer-title">For Store Owners</h4>
              <ul className="public-footer-links">
                <li>
                  <Link to="/apply" className="public-footer-link">
                    <FaArrowRight size={10} /> Apply for an Online Store
                  </Link>
                </li>
                <li>
                  <Link to="/apply/status" className="public-footer-link">
                    <FaArrowRight size={10} /> Track Application Status
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="public-footer-link">
                    <FaArrowRight size={10} /> Merchant Inquiries
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="public-footer-link">
                    <FaArrowRight size={10} /> Onboarding Roadmap
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact & Support */}
            <div className="public-footer-col">
              <h4 className="public-footer-title">Get in Touch</h4>
              <ul className="public-footer-links">
                <li className="public-footer-link">
                  <FaEnvelope size={12} /> support@dukaanonline.com
                </li>
                <li className="public-footer-link">
                  <FaPhoneAlt size={12} /> +91 (800) 123-4567
                </li>
                <li className="public-footer-link">
                  <FaMapMarkerAlt size={12} /> DukaanOnline Tech Hub, India
                </li>
                <li className="public-footer-link">
                  <span>Mon – Sat: 9:00 AM – 7:00 PM IST</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom Legal Bar */}
          <div className="public-footer-bottom">
            <div>
              &copy; {new Date().getFullYear()} DukaanOnline. All rights reserved.
              Enterprise Multi-Tenant E-Commerce.
            </div>
            <div className="public-footer-legal-links">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/contact">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
