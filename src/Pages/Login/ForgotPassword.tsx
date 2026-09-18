import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../Utils/Helper/ToastNotifications";
import Loader from "../../Components/Loader/Loader";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { showToast } = useToast();
    const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true)
      const response = await fetch("https://localhost:44314/api/Auth/ForgotPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }), // backend expects Email property
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast("success", data.message || "Reset link sent to your email.");
        navigate("/"); 
      } else {
        showToast("error", data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("error", "Unable to connect to server.");
      setLoading(false)
    }
    finally{
      setLoading(false)
    }
  };

  return (
    <div className="auth-container">
      {/* Left Section */}
      {loading && <Loader/>}
      <div className="auth-left">
        <div className="quote-content">
          <p className="quote-label">Reset Your Password</p>
          <h2 className="quote-title">No worries!</h2>
          <p className="quote-subtitle">
            Enter your email and we’ll send you instructions to reset your password.
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="auth-right">
        <div className="auth-header">
          <h2>Forgot Password</h2>
          <p className="auth-description">
            Enter the email address associated with your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Send Reset Link
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

export default ForgotPassword;
