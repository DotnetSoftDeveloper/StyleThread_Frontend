import React, { useRef, useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import axios, { AxiosError } from "axios";
import { useAuth } from "./useAuth";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar"; // Import LoadingBarRef
import "react-toastify/dist/ReactToastify.css";
// import { ToastContainer } from "react-toastify";
import { useToast } from "../../Utils/Helper/ToastNotifications";

// Define types for form data
interface FormData {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  address: string;
  phoneNumber: string;
}

// Define API Response type
interface ApiResponse {
  success: boolean;
  message?: string;
  content?: string;
}

interface AuthProps {
  mode: "signin" | "signup";
}

export const Auth: React.FC<AuthProps> = ({ mode }) => {
  const ref = useRef<LoadingBarRef | null>(null);
  const { setToken } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  

  // const isSignInInitial = mode === "signin";
  // const [isSignIn, setIsSignIn] = useState<boolean>(isSignInInitial);
  const isSignIn = mode === "signin";
  const [formData, setFormData] = useState<FormData>({
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    address: "",
    phoneNumber: ""
  });

  // const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    // Restrict phone number to 10 digits
    if (name === "phoneNumber" && value.length > 10) return;

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    // setError("");
    ref.current?.continuousStart();

    const apiUrl: string = isSignIn
      ? "https://localhost:44314/api/Auth/Login"
      : "https://localhost:44314/api/Auth/Register";

    const requestBody = {
      Entity: isSignIn
        ? {
          email: formData.email,
          password: formData.password
        }
        : { ...formData }
    };

    try {
      const response = await axios.post<ApiResponse>(apiUrl, requestBody);

      if (!response.data.success) {
        showToast("error", response.data.message || "Request failed");
      } else {
        const token: string | undefined = response.data.content;
        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("auth", JSON.stringify(response.data.content));
          setToken(token);

          showToast(
            "success",
            isSignIn ? "Sign In Successful" : "Sign Up Successful"
          );

          if (!isSignIn) {
            navigate("/confirm", { state: { email: formData.email } });
          } else {
            navigate("/home");
          }
        } else {
          showToast("success", response.data.message || "Operation successful");
        }
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      console.error("Error:", error);

      const errorMessage: string =
        error.response?.data?.message || "An error occurred. Please try again.";

      // setError(errorMessage);
      showToast("error", errorMessage);
    } finally {
      ref.current?.complete(); // Complete the loading bar
      setLoading(false);
    }
  };

  return (
    <div className={`auth-container ${isSignIn ? "auth-container--signin" : "auth-container--signup"}`}>
      <LoadingBar color="#f11946" ref={ref} />
      {/* <ToastContainer position="bottom-center" autoClose={5000} /> */}
      <div className="auth-left">
        <div className="quote-content">
          <p className="quote-label">A WISE QUOTE</p>
          <h1 className="quote-title">Get Everything You Want</h1>
          <p className="quote-subtitle">
            You can get everything you want if you work hard, trust the process,
            and stick to the plan.
          </p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-header">
          <h2>{isSignIn ? "Welcome Back" : "Create an Account"}</h2>
          <p className="auth-description">
            {isSignIn
              ? "Enter your email and password to access your account"
              : "Fill in the fields to create a new account"}
          </p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit} aria-busy={loading}>
          <fieldset className="auth-fieldset" disabled={loading}>
            {!isSignIn && (
              <div className="form-group">
                <label htmlFor="userName">User Name</label>
                <input
                  type="text"
                  id="userName"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  placeholder="Enter your user name"
                  required
                />
              </div>
            )}
            {!isSignIn && (
              <div className="form-group-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>
            )}
            <div className={isSignIn ? "form-group-stack" : "form-group-row"}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
            {!isSignIn && (
              <>
                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your address"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>
              </>
            )}
            {isSignIn && (
              <div className="auth-options">
                <div className="remember-me">
                  <input type="checkbox" id="remember" />
                  <label htmlFor="remember">Remember me</label>
                </div>

                <button
                  type="button"
                  className="link-button"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </fieldset>

          <button type="submit" className="btn-primary mt-2" disabled={loading}>
            {loading && <span className="auth-button-spinner" aria-hidden="true" />}
            {loading ? (isSignIn ? "Signing in..." : "Creating account...") : isSignIn ? "Sign In" : "Sign Up"}
          </button>
        </form>
        <p className="toggle-text">
          {isSignIn ? "Don’t have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="toggle-link"
            disabled={loading}
            onClick={() => navigate(isSignIn ? "/signup" : "/signin")}
          >
            {isSignIn ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
      
    </div>
  );
};
