import React from "react";
import "./Footer.css";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <div className="footer-container">
      <div className="footer-content">
        <div className="footer-section">
          <h4 className="footer-heading">About Us</h4>
          <p className="footer-text">
            We are a company focused on delivering quality products.
          </p>
        </div>
        <div className="footer-section">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li>
              <Link to="/home" className="nav-link">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="nav-link">
                About
              </Link>
            </li>
            <li>
              <a href="#services" className="footer-link">
                Services
              </a>
            </li>
            <li>
              <a href="#contact" className="footer-link">
                Contact
              </a>
            </li>
          </ul>
        </div>
        <div className="footer-section">
          <h4 className="footer-heading">Follow Us</h4>
          <ul className="footer-social-links">
            <li>
              <a href="https://www.facebook.com/profile.php?id=100022509591442" target="_blank"
                rel="noopener noreferrer" className="footer-social-link">
                Facebook
              </a>
            </li>
            <li>
              <a href="https://twitter.com" className="footer-social-link">
                Twitter
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/s_a_c_h_i_n__t_h_a_k_u_r/" target="_blank"
                rel="noopener noreferrer" className="footer-social-link">
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-bottom-text">
          © 2025 StyleThread. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
