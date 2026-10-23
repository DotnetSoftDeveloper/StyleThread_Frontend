import React, { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaStore,
  FaLock,
  FaEnvelope,
  FaExclamationTriangle,
  FaArrowRight,
  FaShieldAlt,
  FaEye,
  FaEyeSlash,
  FaSpinner,
} from "react-icons/fa";
import { authService } from "../../Services/authService";
import { setStoredAuth } from "../../Utils/Helper/authHelpers";
import { useAuth } from "../Login/useAuth";
import { useTenant } from "../../Context/TenantContext";
import { useToast } from "../../Utils/Helper/ToastNotifications";
import "./StoreAdminLogin.css";
import brandLogo from "../../assets/brand/dukaanonline-logo.svg";

export const StoreAdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const { switchTenant } = useTenant();
  const { showToast } = useToast();

  const [email, setEmail] = useState("admin@urbanthreads.com");
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
      // Store authorization strictly resolved by backend claims from email and password
      const res = await authService.storeAdminLogin({
        email: email.trim(),
        password: password,
      });

      if (res.success && res.content?.token) {
        setStoredAuth(res.content.token);
        setToken(res.content.token);

        const targetStore = res.content.activeStoreSlug || "default";
        await switchTenant(targetStore);

        showToast(
          "success",
          `Signed in as Store Administrator for ${res.content.activeStoreName || targetStore}!`
        );

        navigate("/admin/dashboard");
      } else {
        setError(res.message || "Store administrator authentication failed.");
        showToast("error", res.message || "Login failed");
      }
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message ||
        (err.response?.status === 403
          ? "Access Denied: You do not have Store Administrator privileges."
          : "Unable to connect to store administration service.");
      setError(errMsg);
      showToast("error", errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="storeadmin-login-wrapper">
      <div className="storeadmin-login-card">
        {/* Brand Logo */}
        <div className="storeadmin-brand-header">
          <Link to="/" title="DukaanOnline Platform">
            <img src={brandLogo} alt="DukaanOnline" className="storeadmin-logo-img" />
          </Link>
        </div>

        {/* Portal Badge & Header */}
        <div className="storeadmin-header">
          <div className="storeadmin-badge">
            <FaStore className="storeadmin-badge-icon" />
            <span>MERCHANT CONTROL PORTAL</span>
          </div>
          <h1 className="storeadmin-title">Store Admin Sign In</h1>
          <p className="storeadmin-subtitle">
            Sign in to manage your storefront catalog, inventory, order processing, and branding.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="storeadmin-error-box" role="alert">
            <FaExclamationTriangle className="storeadmin-error-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="storeadmin-form" noValidate>
          <div className="storeadmin-input-group">
            <label htmlFor="storeadmin-email">Administrator Email</label>
            <div className="storeadmin-input-field">
              <FaEnvelope className="storeadmin-field-icon" />
              <input
                id="storeadmin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yourstore.com"
                disabled={loading}
              />
            </div>
          </div>

          <div className="storeadmin-input-group">
            <div className="storeadmin-label-row">
              <label htmlFor="storeadmin-password">Password</label>
            </div>
            <div className="storeadmin-input-field">
              <FaLock className="storeadmin-field-icon" />
              <input
                id="storeadmin-password"
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
                className="storeadmin-password-toggle"
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
            className="storeadmin-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner className="fa-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Merchant Dashboard</span>
                <FaArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Verified Merchant Hint */}
        <div className="storeadmin-hint-box">
          <span className="storeadmin-hint-label">Demo Merchant Account:</span>
          <code>admin@urbanthreads.com / Admin@123</code>
        </div>

        {/* Footer Navigation */}
        <div className="storeadmin-footer-links">
          <div className="storeadmin-link-item">
            <span>Platform Super Admin?</span>
            <Link to="/super-admin/login" className="storeadmin-portal-link">
              <FaShieldAlt size={13} />
              <span>Go to Super Admin Portal</span>
            </Link>
          </div>
          <div className="storeadmin-link-item">
            <span>Customer looking to shop?</span>
            <Link to="/store/default" className="storeadmin-portal-link">
              <span>Visit Customer Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreAdminLogin;
