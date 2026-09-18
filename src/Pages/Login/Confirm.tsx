import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
// import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Confirm.css";
import { useToast } from "../../Utils/Helper/ToastNotifications";
;

interface LocationState {
  email?: string;
}

const Confirm: React.FC = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [resending, setResending] = useState(false);
  const {showToast}=useToast()

  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as LocationState)?.email;

  useEffect(() => {
    console.log("location state:", location.state);
  }, [location]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timerId = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [resendTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      showToast("error", "Email is missing. Please register again.");
      navigate("/signup");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "https://localhost:44314/api/Auth/ConfirmEmail",
        {
          email,
          otp
        }
      );

      if (response.data.success) {
        showToast("success", "Email confirmed successfully. Please login.");
        navigate("/signin");
      } else {
        showToast("error", response.data.message || "Invalid OTP.");
      }
    } catch (error) {
      console.error("Email confirmation error:", error);
      showToast("error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      showToast("error", "Email is missing. Please register again.");
      return;
    }

    setResending(true);
    try {
      const response = await axios.post(
        "https://localhost:44314/api/Auth/ResendOtp",
        {
          email
        }
      );

      if (response.data.success) {
        showToast("success", "OTP resent to your email.");
        setResendTimer(60); // restart countdown
      } else {
        showToast("error", response.data.message || "Could not resend OTP.");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      showToast("error", "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="confirm-container">
      {/* <ToastContainer position="bottom-center" /> */}
      <div className="confirm-box">
        <div className="confirm-header">
          <h2>Email Confirmation</h2>
          <p>Enter the OTP sent to your email address.</p>
        </div>
        <form className="confirm-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="otp">OTP</label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              required
            />
          </div>
          <button className="btn-submit" type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        <div className="resend-section">
          <button
            className="btn-resend"
            onClick={handleResendOtp}
            disabled={resendTimer > 0 || resending}
          >
            {resending
              ? "Resending..."
              : resendTimer > 0
              ? `Resend OTP in ${resendTimer}s`
              : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Confirm;
