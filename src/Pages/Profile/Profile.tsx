import React, { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaEdit,
  FaEnvelope,
  FaHome,
  FaMapMarkedAlt,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaPlus,
  FaRegUser,
  FaSave,
  FaStar,
  FaTimes,
  FaTrash,
  FaUserEdit
} from "react-icons/fa";
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

type ProfileField = "userName" | "firstName" | "lastName" | "email" | "address" | "phoneNumber";
type ProfileTab = "personal" | "addresses";

interface CustomerAddress {
  customerAddressId: number;
  customerId: number;
  fullName: string;
  phone: string;
  pincode: string;
  locality: string;
  addressLine1: string;
  city: string;
  state: string;
  landmark?: string;
  alternatePhone?: string;
  locationTypeTag: "HOME" | "WORK";
  isDefault: boolean;
}

type AddressFormData = Omit<CustomerAddress, "customerAddressId" | "customerId" | "isDefault"> & {
  isDefault: boolean;
};

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

const emptyAddressForm: AddressFormData = {
  fullName: "",
  phone: "",
  pincode: "",
  locality: "",
  addressLine1: "",
  city: "",
  state: "",
  landmark: "",
  alternatePhone: "",
  locationTypeTag: "HOME",
  isDefault: false
};

const indianStates = [
  "Andaman & Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra & Nagar Haveli & Daman & Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttarakhand",
  "Uttar Pradesh",
  "West Bengal"
];

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
  const [activeTab, setActiveTab] = useState<ProfileTab>("personal");
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [addressesLoaded, setAddressesLoaded] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addressFormData, setAddressFormData] = useState<AddressFormData>(emptyAddressForm);

  const token = useMemo(() => getStoredToken(), []);
  const fullName = `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim() || profile?.userName || "Style Thread customer";
  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

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
        const errorMessage = axios.isAxiosError(err)
          ? err.response?.data?.message || "Unable to load your profile."
          : err instanceof Error
            ? err.message
            : "Unable to load your profile.";

        setError(errorMessage);
        showToast("error", errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, showToast, token]);

  const fetchAddresses = useCallback(async () => {
    if (!token) return;

    setAddressLoading(true);
    try {
      const response = await axios.get<ApiResponse<CustomerAddress[]>>(
        "https://localhost:44314/api/CustomerAddresses",
        {
          headers: authHeaders
        }
      );

      if (!response.data.success || !response.data.content) {
        throw new Error(response.data.message || "Unable to load addresses.");
      }

      setAddresses(response.data.content);
      setAddressesLoaded(true);
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || "Unable to load addresses."
        : err instanceof Error
          ? err.message
          : "Unable to load addresses.";

      showToast("error", errorMessage);
    } finally {
      setAddressLoading(false);
    }
  }, [authHeaders, showToast, token]);

  useEffect(() => {
    if (activeTab === "addresses" && !addressesLoaded && !addressLoading) {
      fetchAddresses();
    }
  }, [activeTab, addressLoading, addressesLoaded, fetchAddresses]);

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

  const createAddressDefaults = (): AddressFormData => ({
    ...emptyAddressForm,
    fullName: fullName === "Style Thread customer" ? "" : fullName,
    phone: profile?.phoneNumber ?? "",
    isDefault: addresses.length === 0
  });

  const resetAddressForm = () => {
    setAddressFormData(createAddressDefaults());
    setEditingAddressId(null);
    setIsAddressFormOpen(false);
  };

  const handleAddAddress = () => {
    setAddressFormData(createAddressDefaults());
    setEditingAddressId(null);
    setIsAddressFormOpen(true);
  };

  const handleEditAddress = (address: CustomerAddress) => {
    setAddressFormData({
      fullName: address.fullName,
      phone: address.phone,
      pincode: address.pincode,
      locality: address.locality,
      addressLine1: address.addressLine1,
      city: address.city,
      state: address.state,
      landmark: address.landmark ?? "",
      alternatePhone: address.alternatePhone ?? "",
      locationTypeTag: address.locationTypeTag,
      isDefault: address.isDefault
    });
    setEditingAddressId(address.customerAddressId);
    setIsAddressFormOpen(true);
  };

  const handleAddressChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    if ((name === "phone" || name === "alternatePhone") && value.length > 10) return;
    if (name === "pincode" && value.length > 6) return;

    setAddressFormData((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleAddressDefaultChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAddressFormData((current) => ({
      ...current,
      isDefault: event.target.checked
    }));
  };

  const validateAddress = () => {
    const { fullName: name, phone, pincode, locality, addressLine1, city, state } = addressFormData;
    if (!name || !phone || phone.length !== 10 || !pincode || pincode.length !== 6 || !locality || !addressLine1 || !city || !state) {
      showToast("error", "Please fill all required address fields correctly.");
      return false;
    }

    return true;
  };

  const handleAddressSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || addressSaving || !validateAddress()) return;

    setAddressSaving(true);

    try {
      const request = editingAddressId
        ? axios.put<ApiResponse<CustomerAddress>>(
            `https://localhost:44314/api/CustomerAddresses/${editingAddressId}`,
            addressFormData,
            { headers: authHeaders }
          )
        : axios.post<ApiResponse<CustomerAddress>>(
            "https://localhost:44314/api/CustomerAddresses",
            addressFormData,
            { headers: authHeaders }
          );

      const response = await request;
      if (!response.data.success || !response.data.content) {
        throw new Error(response.data.message || "Unable to save address.");
      }

      await fetchAddresses();
      resetAddressForm();
      showToast("success", response.data.message || "Address saved successfully.");
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || "Unable to save address."
        : err instanceof Error
          ? err.message
          : "Unable to save address.";

      showToast("error", errorMessage);
    } finally {
      setAddressSaving(false);
    }
  };

  const handleSetDefaultAddress = async (addressId: number) => {
    if (!token || addressSaving) return;

    setAddressSaving(true);
    try {
      const response = await axios.put<ApiResponse<CustomerAddress>>(
        `https://localhost:44314/api/CustomerAddresses/${addressId}/default`,
        null,
        { headers: authHeaders }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Unable to update default address.");
      }

      await fetchAddresses();
      showToast("success", response.data.message || "Default address updated.");
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || "Unable to update default address."
        : err instanceof Error
          ? err.message
          : "Unable to update default address.";

      showToast("error", errorMessage);
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (!token || addressSaving) return;

    setAddressSaving(true);
    try {
      const response = await axios.delete<ApiResponse<string>>(
        `https://localhost:44314/api/CustomerAddresses/${addressId}`,
        { headers: authHeaders }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Unable to delete address.");
      }

      await fetchAddresses();
      if (editingAddressId === addressId) {
        resetAddressForm();
      }
      showToast("success", response.data.message || "Address deleted successfully.");
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || "Unable to delete address."
        : err instanceof Error
          ? err.message
          : "Unable to delete address.";

      showToast("error", errorMessage);
    } finally {
      setAddressSaving(false);
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

  const renderPersonalDetails = () => (
    <>
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
    </>
  );

  const renderAddressForm = () => (
    <form className="profile-address-form" onSubmit={handleAddressSubmit}>
      <div className="address-form__header">
        <div className="address-form__icon">{editingAddressId ? <FaEdit aria-hidden="true" /> : <FaPlus aria-hidden="true" />}</div>
        <div>
          <h3>{editingAddressId ? "Edit address" : "Add a new address"}</h3>
          <p>Enter the details for your delivery location.</p>
        </div>
      </div>

      <div className="profile-address-form-grid">
        <label className="profile-form-field">
          <span>Full name</span>
          <input name="fullName" value={addressFormData.fullName} onChange={handleAddressChange} maxLength={100} required />
        </label>
        <label className="profile-form-field">
          <span>Mobile number</span>
          <input name="phone" type="tel" value={addressFormData.phone} onChange={handleAddressChange} maxLength={10} required />
        </label>
        <label className="profile-form-field">
          <span>Pincode</span>
          <input name="pincode" value={addressFormData.pincode} onChange={handleAddressChange} maxLength={6} required />
        </label>
        <label className="profile-form-field">
          <span>City / District</span>
          <input name="city" value={addressFormData.city} onChange={handleAddressChange} required />
        </label>
        <label className="profile-form-field">
          <span>State</span>
          <select name="state" value={addressFormData.state} onChange={handleAddressChange} required>
            <option value="" disabled>
              Select state
            </option>
            {indianStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>
        <label className="profile-form-field">
          <span>Locality</span>
          <input name="locality" value={addressFormData.locality} onChange={handleAddressChange} required />
        </label>
        <label className="profile-form-field profile-form-field--wide">
          <span>Address (area and street)</span>
          <textarea name="addressLine1" value={addressFormData.addressLine1} onChange={handleAddressChange} rows={3} required />
        </label>
        <label className="profile-form-field">
          <span>Landmark</span>
          <input name="landmark" value={addressFormData.landmark ?? ""} onChange={handleAddressChange} />
        </label>
        <label className="profile-form-field">
          <span>Alternate phone</span>
          <input name="alternatePhone" type="tel" value={addressFormData.alternatePhone ?? ""} onChange={handleAddressChange} maxLength={10} />
        </label>
      </div>

      <fieldset className="profile-address-type">
        <legend>Save address as</legend>
        <label className={addressFormData.locationTypeTag === "HOME" ? "is-active" : ""}>
          <input
            type="radio"
            name="locationTypeTag"
            value="HOME"
            checked={addressFormData.locationTypeTag === "HOME"}
            onChange={handleAddressChange}
          />
          <span>Home</span>
        </label>
        <label className={addressFormData.locationTypeTag === "WORK" ? "is-active" : ""}>
          <input
            type="radio"
            name="locationTypeTag"
            value="WORK"
            checked={addressFormData.locationTypeTag === "WORK"}
            onChange={handleAddressChange}
          />
          <span>Work</span>
        </label>
      </fieldset>

      <label className="profile-default-toggle">
        <input type="checkbox" checked={addressFormData.isDefault} onChange={handleAddressDefaultChange} />
        <span>Set as default delivery address</span>
      </label>

      <div className="profile-form-actions">
        <button type="button" className="profile-action-btn profile-action-btn--secondary" onClick={resetAddressForm} disabled={addressSaving}>
          Cancel
        </button>
        <button type="submit" className="profile-save-btn" disabled={addressSaving}>
          <FaSave aria-hidden="true" />
          {addressSaving ? "Saving..." : editingAddressId ? "Update address" : "Save address"}
        </button>
      </div>
    </form>
  );

  const renderAddressCard = (address: CustomerAddress) => (
    <article key={address.customerAddressId} className={`profile-address-card ${address.isDefault ? "is-default" : ""}`}>
      <div className="profile-address-card__top">
        <div>
          <span className="profile-address-tag">{address.locationTypeTag}</span>
          {address.isDefault && <span className="profile-address-default">Default</span>}
        </div>
        <div className="profile-address-card__actions">
          {!address.isDefault && (
            <button type="button" onClick={() => handleSetDefaultAddress(address.customerAddressId)} disabled={addressSaving}>
              <FaStar aria-hidden="true" />
              Set default
            </button>
          )}
          <button type="button" onClick={() => handleEditAddress(address)} disabled={addressSaving}>
            <FaEdit aria-hidden="true" />
            Edit
          </button>
          <button type="button" className="is-danger" onClick={() => handleDeleteAddress(address.customerAddressId)} disabled={addressSaving}>
            <FaTrash aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>
      <h3>{address.fullName}</h3>
      <p>{address.phone}</p>
      <p>
        {address.addressLine1}, {address.locality}, {address.city}, {address.state} - {address.pincode}
      </p>
      {address.landmark && <p>Landmark: {address.landmark}</p>}
      {address.alternatePhone && <p>Alternate phone: {address.alternatePhone}</p>}
    </article>
  );

  const renderManageAddresses = () => (
    <>
      <div className="profile-panel-header">
        <div>
          <p>Delivery</p>
          <h2>Manage addresses</h2>
        </div>
        <button type="button" className="profile-action-btn" onClick={handleAddAddress} disabled={addressSaving}>
          <FaPlus aria-hidden="true" />
          Add address
        </button>
      </div>

      {addressLoading ? (
        <div className="profile-address-empty">Loading addresses...</div>
      ) : (
        <div className="profile-address-list">
          {addresses.length > 0 ? addresses.map(renderAddressCard) : <div className="profile-address-empty">No saved addresses yet.</div>}
        </div>
      )}

      {isAddressFormOpen && renderAddressForm()}
    </>
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
          <nav className="profile-side-nav" aria-label="Profile sections">
            <button type="button" className={activeTab === "personal" ? "is-active" : ""} onClick={() => setActiveTab("personal")}>
              <FaHome aria-hidden="true" />
              Personal details
            </button>
            <button type="button" className={activeTab === "addresses" ? "is-active" : ""} onClick={() => setActiveTab("addresses")}>
              <FaMapMarkedAlt aria-hidden="true" />
              Manage addresses
            </button>
          </nav>
        </aside>

        <section className="profile-panel">
          {activeTab === "personal" ? renderPersonalDetails() : renderManageAddresses()}
        </section>
      </section>
    </main>
  );
};

export default Profile;
