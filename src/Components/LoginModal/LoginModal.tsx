import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { FaEnvelope, FaLock, FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../../Pages/Login/useAuth";
import { useToast } from "../../Utils/Helper/ToastNotifications";
import "./LoginModal.css";

interface ApiResponse {
  success: boolean;
  message?: string;
  content?: string;
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const navigate = useNavigate();
  const { storeSlug } = useParams<{ storeSlug?: string }>();
  const currentStoreSlug = storeSlug || "default";
  const { setToken } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Close modal on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setErrorMessage(null);

    const apiUrl = "https://localhost:44314/api/Auth/Login";
    const requestBody = {
      Entity: {
        email: email.trim(),
        password
      }
    };

    try {
      const response = await axios.post<ApiResponse>(apiUrl, requestBody);

      if (!response.data.success) {
        const msg = response.data.message || "Invalid credentials. Please try again.";
        setErrorMessage(msg);
        showToast("error", msg);
      } else {
        const token: string | undefined = response.data.content;
        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("auth", JSON.stringify(token));
          setToken(token);

          showToast("success", "Sign in successful! Welcome back.");
          if (onSuccess) {
            onSuccess();
          }
          onClose();
        } else {
          showToast("success", response.data.message || "Login successful");
          onClose();
        }
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      const msg = error.response?.data?.message || "Unable to sign in. Please verify your connection.";
      setErrorMessage(msg);
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div
      className="login-modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div className="login-modal-card">
        {/* Close Button */}
        <button
          type="button"
          className="login-modal-close"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <FaTimes aria-hidden="true" />
        </button>

        {/* Modal Header */}
        <div className="login-modal-header">
          <span className="login-modal-badge">Style Thread</span>
          <h2 id="login-modal-title">Welcome to Style Thread</h2>
          <p>Sign in to access your orders, saved addresses, and exclusive member deals.</p>
        </div>

        {/* Error message alert */}
        {errorMessage && (
          <div className="login-modal-error" role="alert">
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="login-modal-form" onSubmit={handleSubmit}>
          <div className="login-input-group">
            <label htmlFor="login-modal-email">Email Address</label>
            <div className="login-input-wrapper">
              <FaEnvelope className="login-input-icon" aria-hidden="true" />
              <input
                id="login-modal-email"
                type="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                autoComplete="email"
                autoFocus
                disabled={loading}
              />
            </div>
          </div>

          <div className="login-input-group">
            <div className="login-label-row">
              <label htmlFor="login-modal-password">Password</label>
              <button
                type="button"
                className="login-forgot-link"
                onClick={() => handleNavigate("/forgot-password")}
                tabIndex={0}
              >
                Forgot Password?
              </button>
            </div>
            <div className="login-input-wrapper">
              <FaLock className="login-input-icon" aria-hidden="true" />
              <input
                id="login-modal-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="login-spinner" aria-hidden="true" />
                <span>Signing in...</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Modal Footer */}
        <div className="login-modal-footer">
          <p className="login-signup-prompt">
            Don't have an account?{" "}
            <button
              type="button"
              className="login-link-btn"
              onClick={() => handleNavigate(`/store/${currentStoreSlug}/signup`)}
            >
              Sign Up
            </button>
          </p>
          <div className="login-guest-separator">
            <span>or</span>
          </div>
          <button
            type="button"
            className="login-guest-btn"
            onClick={onClose}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
