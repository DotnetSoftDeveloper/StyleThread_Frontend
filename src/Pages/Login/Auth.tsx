import React, { useRef, useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import "./Auth.css";
import axios, { AxiosError } from "axios";
import { useAuth } from "./useAuth";
import { useTenant } from "../../Context/TenantContext";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";
import "react-toastify/dist/ReactToastify.css";
import { useToast } from "../../Utils/Helper/ToastNotifications";
import { setStoredAuth } from "../../Utils/Helper/authHelpers";

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
  content?: string | { token?: string };
}

interface AuthProps {
  mode: "signin" | "signup";
}

export const Auth: React.FC<AuthProps> = ({ mode }) => {
  const ref = useRef<LoadingBarRef | null>(null);
  const { token, setToken } = useAuth();
  const { storeSlug } = useParams<{ storeSlug?: string }>();
  const { tenant, settings, switchTenant } = useTenant();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const isSignIn = mode === "signin";
  const targetSlug = storeSlug || tenant?.slug || "default";

  useEffect(() => {
    if (storeSlug && storeSlug !== tenant?.slug) {
      switchTenant(storeSlug);
    }
  }, [storeSlug, tenant?.slug, switchTenant]);

  const [formData, setFormData] = useState<FormData>({
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    address: "",
    phoneNumber: ""
  });

  const [loading, setLoading] = useState<boolean>(false);

  if (token) {
    return <Navigate to={`/store/${storeSlug || "default"}`} replace />;
  }

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
    ref.current?.continuousStart();

    const effectiveSlug = targetSlug || "default";
    const apiUrl: string = isSignIn
      ? `https://localhost:44314/api/store/${effectiveSlug}/auth/login`
      : `https://localhost:44314/api/store/${effectiveSlug}/auth/register`;

    const requestBody = isSignIn
      ? { email: formData.email, password: formData.password }
      : {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          address: formData.address,
          phoneNumber: formData.phoneNumber
        };

    try {
      const response = await axios.post<ApiResponse>(apiUrl, requestBody);

      if (!response.data.success) {
        showToast("error", response.data.message || "Request failed");
      } else {
        const rawContent = response.data.content;
        const authToken: string | undefined = typeof rawContent === "string" 
          ? rawContent 
          : rawContent?.token;

        if (authToken) {
          setStoredAuth(authToken);
          setToken(authToken);

          showToast(
            "success",
            isSignIn ? `Signed in to ${tenant?.storeName || "Store"}!` : "Account Created Successfully!"
          );

          if (!isSignIn) {
            navigate("/confirm", { state: { email: formData.email, storeSlug: storeSlug || "default" } });
          } else {
            navigate(`/store/${storeSlug || "default"}`);
          }
        } else {
          showToast("success", response.data.message || "Operation successful");
        }
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      console.error("Error:", error);

      const errorMessage: string =
        error.response?.data?.message || "An error occurred. Please try again.";

      showToast("error", errorMessage);
    } finally {
      ref.current?.complete();
      setLoading(false);
    }
  };

  return (
    <div className={`auth-container ${isSignIn ? "auth-container--signin" : "auth-container--signup"}`}>
      <LoadingBar color="#f11946" ref={ref} />
      <div className="auth-left">
        <div className="quote-content">
          {settings?.logoUrl && (
            <div style={{ marginBottom: "1.5rem" }}>
              <img
                src={settings.logoUrl}
                alt={tenant?.storeName || "Store Logo"}
                style={{ maxHeight: "60px", maxWidth: "180px", objectFit: "contain" }}
              />
            </div>
          )}
          <p className="quote-label" style={{ letterSpacing: "2px", textTransform: "uppercase" }}>
            {tenant?.storeName ? `${tenant.storeName} OFFICIAL STORE` : "A WISE QUOTE"}
          </p>
          <h1 className="quote-title">
            {settings?.heroTitle || "Get Everything You Want"}
          </h1>
          <p className="quote-subtitle">
            {settings?.heroSubtitle || "You can get everything you want if you work hard, trust the process, and stick to the plan."}
          </p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-header">
          <h2>{isSignIn ? `Welcome to ${tenant?.storeName || "Style Thread"}` : `Join ${tenant?.storeName || "Style Thread"}`}</h2>
          <p className="auth-description">
            {isSignIn
              ? `Sign in to access your ${tenant?.storeName || "Style Thread"} account`
              : `Create an account to shop at ${tenant?.storeName || "Style Thread"}`}
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
            onClick={() => navigate(isSignIn ? `/store/${storeSlug || "default"}/signup` : `/store/${storeSlug || "default"}/signin`)}
          >
            {isSignIn ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
      
    </div>
  );
};
