import React, { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaShieldAlt,
  FaLock,
  FaEnvelope,
  FaExclamationTriangle,
  FaArrowRight,
  FaServer,
  FaStore,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
  FaSpinner,
} from "react-icons/fa";
import { authService } from "../../Services/authService";
import { setStoredAuth } from "../../Utils/Helper/authHelpers";
import { useAuth } from "../Login/useAuth";
import { useToast } from "../../Utils/Helper/ToastNotifications";
import "./SuperAdminLogin.css";
import brandLogo from "../../assets/brand/dukaanonline-logo.svg";

export const SuperAdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState("superadmin@platform.com");
  const [password, setPassword] = useState("Admin@123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      const res = await authService.superAdminLogin({ email: email.trim(), password });

      if (res.success && res.content?.token) {
        setStoredAuth(res.content.token);
        setToken(res.content.token);

        showToast("success", `Welcome, Super Administrator ${res.content.firstName || ""}!`);
        navigate("/super-admin/dashboard");
      } else {
        setError(res.message || "Authentication failed. Invalid platform credentials.");
        showToast("error", res.message || "Super Admin authentication failed");
      }
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message ||
        (err.response?.status === 403
          ? "Access Denied: This portal requires Platform Super Administrator privileges."
          : "Unable to connect to authentication gateway.");
      setError(errMsg);
      showToast("error", errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="superadmin-login-wrapper">
      <div className="superadmin-login-card">
        {/* Brand Logo Header */}
        <div className="superadmin-brand-header">
          <Link to="/" title="DukaanOnline Platform">
            <img src={brandLogo} alt="DukaanOnline" className="superadmin-logo-img" />
          </Link>
        </div>

        {/* Portal Header */}
        <div className="superadmin-header">
          <div className="superadmin-badge">
            <FaShieldAlt className="superadmin-badge-icon" />
            <span>PLATFORM CONTROL CENTER</span>
          </div>
          <h1 className="superadmin-title">Super Admin Portal</h1>
          <p className="superadmin-subtitle">
            Centralized infrastructure, multi-store provisioning, and global platform security.
          </p>
        </div>

        {/* Security Notice */}
        <div className="superadmin-notice">
          <FaServer className="superadmin-notice-icon" />
          <div>
            <strong>Restricted Administrative Gateway</strong>
            <p>Access is restricted strictly to root platform administrators. Store-level admins must use the Store Admin portal.</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="superadmin-error-box" role="alert">
            <FaExclamationTriangle className="superadmin-error-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="superadmin-form" noValidate>
          <div className="superadmin-input-group">
            <label htmlFor="superadmin-email">Platform Admin Email</label>
            <div className="superadmin-input-field">
              <FaEnvelope className="superadmin-field-icon" />
              <input
                id="superadmin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@platform.com"
                disabled={loading}
              />
            </div>
          </div>

          <div className="superadmin-input-group">
            <label htmlFor="superadmin-password">Administrative Password</label>
            <div className="superadmin-input-field">
              <FaLock className="superadmin-field-icon" />
              <input
                id="superadmin-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={loading}
              />
              <button
                type="button"
                className="superadmin-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="superadmin-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner className="fa-spin" />
                <span>Authenticating Session...</span>
              </>
            ) : (
              <>
                <span>Authenticate Platform Session</span>
                <FaArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Fast Reference Credentials */}
        <div className="superadmin-creds-hint">
          <div className="superadmin-creds-title">
            <FaCheckCircle size={14} color="#10b981" />
            <span>Verified Platform Super Admin:</span>
          </div>
          <code>superadmin@platform.com / Admin@123</code>
        </div>

        {/* Footer Navigation */}
        <div className="superadmin-footer-links">
          <div className="superadmin-link-item">
            <span>Store Administrator?</span>
            <Link to="/admin/login" className="superadmin-portal-link">
              <FaStore size={14} />
              <span>Go to Store Admin Portal</span>
            </Link>
          </div>
          <div className="superadmin-link-item">
            <span>Customer Storefront?</span>
            <Link to="/store/default" className="superadmin-portal-link">
              <span>Visit StyleThread Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
