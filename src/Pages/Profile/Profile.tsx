import React, { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt, FaRegUser, FaSave, FaTimes, FaUserEdit } from "react-icons/fa";
import "./Profile.css";
import profileImage from "../../Assests/people.png";
import Loader from "../../Shared/Loader";
import { useToast } from "../../Utils/Helper/ToastNotifications";

interface CustomerProfile {
  customerId: number;
  userName: string;
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  address: string;
  phoneNumber: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  content?: T;
}

interface TokenPayload {
  userId?: string;
  sub?: string;
}

type ProfileField = "userName" | "firstName" | "lastName" | "email" | "address" | "phoneNumber";

const emptyProfile: CustomerProfile = {
  customerId: 0,
  userName: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  address: "",
  phoneNumber: ""
};

const getStoredToken = () => {
  const token = localStorage.getItem("auth") ?? localStorage.getItem("token");
  if (!token) return null;

  try {
    return JSON.parse(token) as string;
  } catch {
    return token;
  }
};

const getInitials = (profile: CustomerProfile | null) => {
  if (!profile) return "ST";
  const first = profile.firstName?.charAt(0) ?? "";
  const last = profile.lastName?.charAt(0) ?? "";
  return `${first}${last || profile.userName?.charAt(0) || ""}`.toUpperCase() || "ST";
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [formData, setFormData] = useState<CustomerProfile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(() => getStoredToken(), []);
  const fullName = `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim() || profile?.userName || "Style Thread customer";

  useEffect(() => {
    if (!token) {
      navigate("/signin");
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get<ApiResponse<CustomerProfile>>(
          "https://localhost:44314/api/Auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!response.data.success || !response.data.content) {
          throw new Error(response.data.message || "Unable to load your profile.");
        }

        const loadedProfile = {
          ...emptyProfile,
          ...response.data.content,
          password: ""
        };

        setProfile(loadedProfile);
        setFormData(loadedProfile);
      } catch (err) {
        try {
          await fetchProfileFallback();
          return;
        } catch (fallbackError) {
          const errorMessage = axios.isAxiosError(err)
            ? err.response?.data?.message || "Unable to load your profile."
            : fallbackError instanceof Error
              ? fallbackError.message
              : "Unable to load your profile.";

          setError(errorMessage);
          showToast("error", errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchProfileFallback = async () => {
      const decoded = jwtDecode<TokenPayload>(token);
      const userId = Number(decoded.userId);

      const response = await axios.get<CustomerProfile[]>("https://localhost:44314/api/Auth", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const currentCustomer = response.data.find((customer) => {
        const customerRecord = customer as CustomerProfile & { id?: number };
        return Number(customerRecord.customerId || customerRecord.id) === userId;
      });

      if (!currentCustomer) {
        throw new Error("Unable to find your profile.");
      }

      const loadedProfile = {
        ...emptyProfile,
        ...currentCustomer,
        customerId: currentCustomer.customerId || (currentCustomer as CustomerProfile & { id?: number }).id || userId,
        password: ""
      };

      setProfile(loadedProfile);
      setFormData(loadedProfile);
    };

    fetchProfile();
  }, [navigate, showToast, token]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    if (name === "phoneNumber" && value.length > 10) return;

    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleCancel = () => {
    if (profile) {
      setFormData(profile);
    }
    setIsEditing(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || saving) return;

    setSaving(true);
    setError(null);

    try {
      const payload: CustomerProfile = {
        ...formData,
        password: formData.password || "ProfileUpdate@123"
      };

      const response = await axios.put<ApiResponse<string>>(
        "https://localhost:44314/api/Auth/me",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Unable to update your profile.");
      }

      const updatedProfile = {
        ...formData,
        password: ""
      };

      setProfile(updatedProfile);
      setFormData(updatedProfile);
      setIsEditing(false);
      showToast("success", "Profile updated successfully.");
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || "Unable to update your profile."
        : err instanceof Error
          ? err.message
          : "Unable to update your profile.";

      setError(errorMessage);
      showToast("error", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const renderField = (label: string, name: ProfileField, type = "text") => (
    <label className="profile-form-field">
      <span>{label}</span>
      <input
        type={type}
        name={name}
        value={formData[name] ?? ""}
        onChange={handleChange}
        disabled={!isEditing || saving}
        required={["userName", "firstName", "email", "address", "phoneNumber"].includes(name)}
      />
    </label>
  );

  if (loading) {
    return (
      <main className="profile-page profile-page--loading">
        <Loader />
      </main>
    );
  }

  if (error && !profile) {
    return (
      <main className="profile-page">
        <section className="profile-error">
          <h1>Profile unavailable</h1>
          <p>{error}</p>
          <button type="button" onClick={() => navigate("/signin")}>
            Sign in again
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <section className="profile-shell">
        <aside className="profile-summary">
          <div className="profile-avatar-wrap">
            <img src={profileImage} alt="" className="profile-avatar-img" />
            <span className="profile-avatar-initials">{getInitials(profile)}</span>
          </div>
          <h1>{fullName}</h1>
          <p>{profile?.email}</p>
          <div className="profile-status">Active customer</div>
        </aside>

        <section className="profile-panel">
          <div className="profile-panel-header">
            <div>
              <p>Account</p>
              <h2>Personal details</h2>
            </div>
            {!isEditing ? (
              <button type="button" className="profile-action-btn" onClick={() => setIsEditing(true)}>
                <FaUserEdit aria-hidden="true" />
                Edit
              </button>
            ) : (
              <button type="button" className="profile-action-btn profile-action-btn--secondary" onClick={handleCancel} disabled={saving}>
                <FaTimes aria-hidden="true" />
                Cancel
              </button>
            )}
          </div>

          <div className="profile-info-grid">
            <div className="profile-info-item">
              <FaRegUser aria-hidden="true" />
              <div>
                <span>Name</span>
                <strong>{fullName}</strong>
              </div>
            </div>
            <div className="profile-info-item">
              <FaEnvelope aria-hidden="true" />
              <div>
                <span>Email</span>
                <strong>{profile?.email}</strong>
              </div>
            </div>
            <div className="profile-info-item">
              <FaPhoneAlt aria-hidden="true" />
              <div>
                <span>Phone</span>
                <strong>{profile?.phoneNumber || "Not added"}</strong>
              </div>
            </div>
            <div className="profile-info-item">
              <FaMapMarkerAlt aria-hidden="true" />
              <div>
                <span>Address</span>
                <strong>{profile?.address || "Not added"}</strong>
              </div>
            </div>
          </div>

          <form className="profile-form" onSubmit={handleSubmit}>
            <fieldset disabled={!isEditing || saving}>
              <div className="profile-form-grid">
                {renderField("User name", "userName")}
                {renderField("First name", "firstName")}
                {renderField("Last name", "lastName")}
                {renderField("Email address", "email", "email")}
                {renderField("Phone number", "phoneNumber", "tel")}
                <label className="profile-form-field profile-form-field--wide">
                  <span>Address</span>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing || saving}
                    required
                    rows={4}
                  />
                </label>
              </div>
            </fieldset>

            {isEditing && (
              <div className="profile-form-actions">
                <button type="submit" className="profile-save-btn" disabled={saving}>
                  <FaSave aria-hidden="true" />
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            )}
          </form>
        </section>
      </section>
    </main>
  );
};

export default Profile;
