import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../../Utils/Helper/ToastNotifications";

const ResetPassword: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // extract query params
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email") || "";
  const token = queryParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const [loading, setLoading] = useState(false);

  // validate fields
  const validate = () => {
    const newErrors: typeof errors = {};

    if (!newPassword) {
      newErrors.newPassword = "New password is required.";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required.";
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return; // stop if invalid

    try {
      setLoading(true);
      const response = await fetch("https://localhost:44314/api/Auth/ResetPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          token,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast("success", data.message || "Password reset successful!");
        navigate("/");
      } else {
        showToast("error", data.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("error", "Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left Section */}
      <div className="auth-left">
        <div className="quote-content">
          <p className="quote-label">Create New Password</p>
          <h2 className="quote-title">Secure your account</h2>
          <p className="quote-subtitle">
            Enter and confirm your new password below.
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="auth-right">
        <div className="auth-header">
          <h2>Reset Password</h2>
          <p className="auth-description">
            Enter your new password for <strong>{email}</strong>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onBlur={validate} // validate on blur
              required
              placeholder="Enter new password"
            />
            {errors.newPassword && (
              <p className="error-text">{errors.newPassword}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={validate} // validate on blur
              required
              placeholder="Confirm new password"
            />
            {errors.confirmPassword && (
              <p className="error-text">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/")}
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
