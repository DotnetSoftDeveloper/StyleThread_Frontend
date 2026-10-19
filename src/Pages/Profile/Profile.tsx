import React, { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBriefcase,
  FaCalendarAlt,
  FaCheckCircle,
  FaChevronRight,
  FaEdit,
  FaEnvelope,
  FaHome,
  FaIdBadge,
  FaLock,
  FaMapMarkedAlt,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaPlus,
  FaReceipt,
  FaRegUser,
  FaSave,
  FaShieldAlt,
  FaShoppingBag,
  FaSignOutAlt,
  FaStar,
  FaSyncAlt,
  FaTimes,
  FaTrash,
  FaTruck,
  FaUserCheck,
  FaUserEdit
} from "react-icons/fa";
import "./Profile.css";
import profileImage from "../../Assests/people.png";
import Loader from "../../Shared/Loader";
import { useToast } from "../../Utils/Helper/ToastNotifications";
import { getCustomerOrders } from "../../Services/orderService";
import { CustomerOrder, OrderItemDetails } from "../../Types/Interface/IOrder";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../Store/ConfigureStore";
import { useAuth } from "../Login/useAuth";
import { getStoredToken, clearStoredAuth } from "../../Utils/Helper/authHelpers";
import { clearCartList } from "../../Store/EntitySlices";

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

type ProfileTab = "personal" | "addresses" | "orders";

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

const getInitials = (profile: CustomerProfile | null) => {
  if (!profile) return "ST";
  const first = profile.firstName?.charAt(0) ?? "";
  const last = profile.lastName?.charAt(0) ?? "";
  return `${first}${last || profile.userName?.charAt(0) || ""}`.toUpperCase() || "ST";
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { role, setToken } = useAuth();
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

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const ordersRequestStarted = useRef(false);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);

  const token = useMemo(() => getStoredToken(), []);
  const fullName = `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim() || profile?.userName || "Style Thread Customer";
  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  // Handle Logout
  const handleLogout = () => {
    clearStoredAuth();
    sessionStorage.removeItem("hasSeenLoginModal");
    setToken(null);
    dispatch(clearCartList());
    navigate("/home");
    showToast("success", "You have been logged out.");
  };

  // Fetch initial profile
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

  // Fetch addresses
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

  // Background fetch of addresses for tab count
  useEffect(() => {
    if (token && !addressesLoaded && !addressLoading) {
      fetchAddresses();
    }
  }, [token, addressesLoaded, addressLoading, fetchAddresses]);

  // Fetch orders
  const fetchOrders = useCallback(async (forceRefresh = false) => {
    if (!token || ordersLoading) return;
    if (!forceRefresh && ordersRequestStarted.current) return;

    ordersRequestStarted.current = true;
    setOrdersLoading(true);
    try {
      const customerOrders = await getCustomerOrders(token);
      setOrders(customerOrders);
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || "Unable to load orders."
        : err instanceof Error
          ? err.message
          : "Unable to load orders.";

      showToast("error", errorMessage);
    } finally {
      setOrdersLoaded(true);
      setOrdersLoading(false);
    }
  }, [ordersLoading, showToast, token]);

  // Background fetch of orders for count
  useEffect(() => {
    if (token && !ordersLoaded) {
      fetchOrders();
    }
  }, [token, ordersLoaded, fetchOrders]);

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
    fullName: fullName === "Style Thread Customer" ? "" : fullName,
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
      showToast("error", "Please fill all required address fields with valid data.");
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

  const formatCurrency = (value?: number) => `₹${(value ?? 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  })}`;

  const formatOrderDate = (value?: string) => {
    if (!value) return "Date unavailable";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date unavailable";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const getOrderItems = (order: CustomerOrder): OrderItemDetails[] => order.items ?? order.orderItems ?? [];

  // ================= TAB 1: PERSONAL DETAILS =================
  const renderPersonalOverview = () => (
    <div className="profile-bento-grid">
      {/* Identity Card */}
      <div className="profile-card profile-card--identity">
        <div className="profile-card__header">
          <div className="profile-card__icon-box">
            <FaRegUser aria-hidden="true" />
          </div>
          <div>
            <span className="profile-card__eyebrow">Personal Identity</span>
            <h3 className="profile-card__title">Basic Details</h3>
          </div>
        </div>
        <div className="profile-card__body">
          <div className="profile-field-row">
            <span className="profile-field-label">Full Name</span>
            <span className="profile-field-value">{fullName}</span>
          </div>
          <div className="profile-field-row">
            <span className="profile-field-label">Username</span>
            <span className="profile-field-value profile-field-value--code">@{profile?.userName || "unknown"}</span>
          </div>
          <div className="profile-field-row">
            <span className="profile-field-label">Customer ID</span>
            <span className="profile-field-value">#{profile?.customerId || "0000"}</span>
          </div>
        </div>
      </div>

      {/* Contact Channels Card */}
      <div className="profile-card profile-card--contact">
        <div className="profile-card__header">
          <div className="profile-card__icon-box">
            <FaEnvelope aria-hidden="true" />
          </div>
          <div>
            <span className="profile-card__eyebrow">Communication</span>
            <h3 className="profile-card__title">Contact Information</h3>
          </div>
        </div>
        <div className="profile-card__body">
          <div className="profile-field-row">
            <span className="profile-field-label">Email Address</span>
            <div className="profile-field-group">
              <span className="profile-field-value">{profile?.email || "Not specified"}</span>
              <span className="profile-tag profile-tag--success">
                <FaCheckCircle aria-hidden="true" /> Verified
              </span>
            </div>
          </div>
          <div className="profile-field-row">
            <span className="profile-field-label">Mobile Number</span>
            <div className="profile-field-group">
              <span className="profile-field-value">
                {profile?.phoneNumber ? `+91 ${profile.phoneNumber}` : "Not added"}
              </span>
              {profile?.phoneNumber && (
                <span className="profile-tag profile-tag--info">Active</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Residence Card */}
      <div className="profile-card profile-card--full">
        <div className="profile-card__header">
          <div className="profile-card__icon-box">
            <FaMapMarkerAlt aria-hidden="true" />
          </div>
          <div>
            <span className="profile-card__eyebrow">Default Address</span>
            <h3 className="profile-card__title">Billing & Primary Residence</h3>
          </div>
        </div>
        <div className="profile-card__body">
          <p className="profile-card__address-text">
            {profile?.address || "No primary address registered yet. Please edit your profile to add your default residential address."}
          </p>
        </div>
      </div>

      {/* Account Security Card */}
      <div className="profile-card profile-card--security profile-card--full">
        <div className="profile-card__header">
          <div className="profile-card__icon-box">
            <FaShieldAlt aria-hidden="true" />
          </div>
          <div>
            <span className="profile-card__eyebrow">Security & Credentials</span>
            <h3 className="profile-card__title">Account Protection</h3>
          </div>
        </div>
        <div className="profile-card__security-content">
          <div className="profile-security-badge">
            <FaLock aria-hidden="true" />
            <div>
              <strong>Password Protection Active</strong>
              <p>Your password is securely hashed and protected with JWT token authentication.</p>
            </div>
          </div>
          <div className="profile-security-tier">
            <FaUserCheck aria-hidden="true" />
            <div>
              <strong>Verified Shopper</strong>
              <p>Standard consumer access with order placement & address management privileges.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPersonalForm = () => (
    <form className="profile-form-modern" onSubmit={handleSubmit}>
      <div className="profile-form-section">
        <h4 className="profile-form-section__title">
          <FaUserEdit aria-hidden="true" /> Personal Identity
        </h4>
        <div className="profile-form-grid">
          <div className="profile-input-group">
            <label htmlFor="field-username">Username <span className="req">*</span></label>
            <div className="profile-input-wrapper">
              <FaIdBadge className="profile-input-icon" aria-hidden="true" />
              <input
                id="field-username"
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                disabled={saving}
                placeholder="Choose username"
                required
              />
            </div>
          </div>

          <div className="profile-input-group">
            <label htmlFor="field-firstname">First Name <span className="req">*</span></label>
            <div className="profile-input-wrapper">
              <FaRegUser className="profile-input-icon" aria-hidden="true" />
              <input
                id="field-firstname"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={saving}
                placeholder="Enter first name"
                required
              />
            </div>
          </div>

          <div className="profile-input-group">
            <label htmlFor="field-lastname">Last Name</label>
            <div className="profile-input-wrapper">
              <FaRegUser className="profile-input-icon" aria-hidden="true" />
              <input
                id="field-lastname"
                type="text"
                name="lastName"
                value={formData.lastName ?? ""}
                onChange={handleChange}
                disabled={saving}
                placeholder="Enter last name"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="profile-form-section">
        <h4 className="profile-form-section__title">
          <FaPhoneAlt aria-hidden="true" /> Contact Details
        </h4>
        <div className="profile-form-grid">
          <div className="profile-input-group">
            <label htmlFor="field-email">Email Address <span className="req">*</span></label>
            <div className="profile-input-wrapper">
              <FaEnvelope className="profile-input-icon" aria-hidden="true" />
              <input
                id="field-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={saving}
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          <div className="profile-input-group">
            <label htmlFor="field-phone">Phone Number <span className="req">*</span></label>
            <div className="profile-input-wrapper">
              <FaPhoneAlt className="profile-input-icon" aria-hidden="true" />
              <input
                id="field-phone"
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                disabled={saving}
                placeholder="10-digit mobile number"
                maxLength={10}
                required
              />
            </div>
          </div>
        </div>
      </div>

      <div className="profile-form-section">
        <h4 className="profile-form-section__title">
          <FaMapMarkerAlt aria-hidden="true" /> Primary Address
        </h4>
        <div className="profile-input-group profile-input-group--full">
          <label htmlFor="field-address">Street / Delivery Address <span className="req">*</span></label>
          <textarea
            id="field-address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            disabled={saving}
            rows={4}
            placeholder="House/Flat number, building name, street and city"
            required
          />
        </div>
      </div>

      <div className="profile-form-actions">
        <button
          type="button"
          className="profile-btn profile-btn--secondary"
          onClick={handleCancel}
          disabled={saving}
        >
          <FaTimes aria-hidden="true" /> Cancel
        </button>
        <button
          type="submit"
          className="profile-btn profile-btn--primary"
          disabled={saving}
        >
          <FaSave aria-hidden="true" /> {saving ? "Saving Changes..." : "Save Profile"}
        </button>
      </div>
    </form>
  );

  const renderPersonalDetails = () => (
    <div className="profile-section-fade">
      <div className="profile-panel-header">
        <div>
          <span className="profile-panel-header__subtitle">Account Management</span>
          <h2 className="profile-panel-header__title">Personal Details</h2>
          <p className="profile-panel-header__desc">Review and update your personal information and contact settings.</p>
        </div>
        {!isEditing ? (
          <button
            type="button"
            className="profile-btn profile-btn--primary"
            onClick={() => setIsEditing(true)}
          >
            <FaEdit aria-hidden="true" /> Edit Profile
          </button>
        ) : (
          <button
            type="button"
            className="profile-btn profile-btn--secondary"
            onClick={handleCancel}
            disabled={saving}
          >
            <FaTimes aria-hidden="true" /> Discard
          </button>
        )}
      </div>

      {isEditing ? renderPersonalForm() : renderPersonalOverview()}
    </div>
  );

  // ================= TAB 2: MANAGE ADDRESSES =================
  const renderAddressForm = () => (
    <div className="profile-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) resetAddressForm(); }}>
      <form className="profile-address-modal" onSubmit={handleAddressSubmit}>
        <div className="profile-address-modal__header">
          <div className="profile-address-modal__header-info">
            <div className="profile-modal-icon-badge">
              {editingAddressId ? <FaEdit aria-hidden="true" /> : <FaPlus aria-hidden="true" />}
            </div>
            <div>
              <h3>{editingAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}</h3>
              <p>Ensure your orders arrive safely by providing accurate shipping information.</p>
            </div>
          </div>
          <button
            type="button"
            className="profile-modal-close-btn"
            onClick={resetAddressForm}
            aria-label="Close address form"
          >
            <FaTimes aria-hidden="true" />
          </button>
        </div>

        <div className="profile-address-modal__body">
          {/* Location Type Tag */}
          <div className="profile-address-type-selector">
            <span className="profile-label">Address Tag</span>
            <div className="profile-type-radios">
              <label className={`profile-type-pill ${addressFormData.locationTypeTag === "HOME" ? "is-selected" : ""}`}>
                <input
                  type="radio"
                  name="locationTypeTag"
                  value="HOME"
                  checked={addressFormData.locationTypeTag === "HOME"}
                  onChange={handleAddressChange}
                />
                <FaHome aria-hidden="true" />
                <span>Home (All Day Delivery)</span>
              </label>

              <label className={`profile-type-pill ${addressFormData.locationTypeTag === "WORK" ? "is-selected" : ""}`}>
                <input
                  type="radio"
                  name="locationTypeTag"
                  value="WORK"
                  checked={addressFormData.locationTypeTag === "WORK"}
                  onChange={handleAddressChange}
                />
                <FaBriefcase aria-hidden="true" />
                <span>Work (10 AM - 6 PM)</span>
              </label>
            </div>
          </div>

          <div className="profile-address-form-grid">
            <div className="profile-input-group">
              <label>Full Name <span className="req">*</span></label>
              <input
                name="fullName"
                value={addressFormData.fullName}
                onChange={handleAddressChange}
                maxLength={100}
                placeholder="Receiver's name"
                required
              />
            </div>

            <div className="profile-input-group">
              <label>10-Digit Mobile Number <span className="req">*</span></label>
              <input
                name="phone"
                type="tel"
                value={addressFormData.phone}
                onChange={handleAddressChange}
                maxLength={10}
                placeholder="e.g. 9876543210"
                required
              />
            </div>

            <div className="profile-input-group">
              <label>Pincode <span className="req">*</span></label>
              <input
                name="pincode"
                value={addressFormData.pincode}
                onChange={handleAddressChange}
                maxLength={6}
                placeholder="6-digit PIN code"
                required
              />
            </div>

            <div className="profile-input-group">
              <label>Locality / Area <span className="req">*</span></label>
              <input
                name="locality"
                value={addressFormData.locality}
                onChange={handleAddressChange}
                placeholder="e.g. Indiranagar, Sector 14"
                required
              />
            </div>

            <div className="profile-input-group profile-input-group--full">
              <label>Flat, House No., Building, Apartment <span className="req">*</span></label>
              <textarea
                name="addressLine1"
                value={addressFormData.addressLine1}
                onChange={handleAddressChange}
                rows={3}
                placeholder="Street address, building, suite, or flat number"
                required
              />
            </div>

            <div className="profile-input-group">
              <label>City / District <span className="req">*</span></label>
              <input
                name="city"
                value={addressFormData.city}
                onChange={handleAddressChange}
                placeholder="e.g. Mumbai, Bengaluru"
                required
              />
            </div>

            <div className="profile-input-group">
              <label>State <span className="req">*</span></label>
              <select
                name="state"
                value={addressFormData.state}
                onChange={handleAddressChange}
                required
              >
                <option value="" disabled>Select State</option>
                {indianStates.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div className="profile-input-group">
              <label>Landmark (Optional)</label>
              <input
                name="landmark"
                value={addressFormData.landmark ?? ""}
                onChange={handleAddressChange}
                placeholder="e.g. Near Metro Station"
              />
            </div>

            <div className="profile-input-group">
              <label>Alternate Mobile (Optional)</label>
              <input
                name="alternatePhone"
                type="tel"
                value={addressFormData.alternatePhone ?? ""}
                onChange={handleAddressChange}
                maxLength={10}
                placeholder="Optional backup phone"
              />
            </div>
          </div>

          <label className="profile-switch-row">
            <input
              type="checkbox"
              checked={addressFormData.isDefault}
              onChange={handleAddressDefaultChange}
            />
            <span className="profile-switch-indicator" />
            <span className="profile-switch-text">
              <strong>Make this my default delivery address</strong>
              <small>Orders will be automatically dispatched to this location.</small>
            </span>
          </label>
        </div>

        <div className="profile-address-modal__footer">
          <button
            type="button"
            className="profile-btn profile-btn--secondary"
            onClick={resetAddressForm}
            disabled={addressSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="profile-btn profile-btn--primary"
            disabled={addressSaving}
          >
            <FaSave aria-hidden="true" />
            {addressSaving ? "Saving..." : editingAddressId ? "Update Address" : "Save Address"}
          </button>
        </div>
      </form>
    </div>
  );

  const renderAddressCard = (address: CustomerAddress) => (
    <article
      key={address.customerAddressId}
      className={`profile-address-card-modern ${address.isDefault ? "is-default" : ""}`}
    >
      <div className="profile-address-card-modern__header">
        <div className="profile-address-badges">
          <span className={`profile-tag ${address.locationTypeTag === "WORK" ? "profile-tag--work" : "profile-tag--home"}`}>
            {address.locationTypeTag === "WORK" ? (
              <><FaBriefcase aria-hidden="true" /> Work</>
            ) : (
              <><FaHome aria-hidden="true" /> Home</>
            )}
          </span>
          {address.isDefault && (
            <span className="profile-tag profile-tag--default">
              <FaCheckCircle aria-hidden="true" /> Default Address
            </span>
          )}
        </div>

        <div className="profile-address-card-actions">
          {!address.isDefault && (
            <button
              type="button"
              className="profile-btn-icon"
              title="Set as Default"
              onClick={() => handleSetDefaultAddress(address.customerAddressId)}
              disabled={addressSaving}
            >
              <FaStar aria-hidden="true" />
              <span>Set Default</span>
            </button>
          )}
          <button
            type="button"
            className="profile-btn-icon"
            title="Edit Address"
            onClick={() => handleEditAddress(address)}
            disabled={addressSaving}
          >
            <FaEdit aria-hidden="true" />
            <span>Edit</span>
          </button>
          <button
            type="button"
            className="profile-btn-icon profile-btn-icon--danger"
            title="Delete Address"
            onClick={() => handleDeleteAddress(address.customerAddressId)}
            disabled={addressSaving}
          >
            <FaTrash aria-hidden="true" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="profile-address-card-modern__body">
        <h4 className="profile-address-name">{address.fullName}</h4>
        <div className="profile-address-phone">
          <FaPhoneAlt aria-hidden="true" />
          <span>+91 {address.phone}</span>
          {address.alternatePhone && (
            <span className="profile-address-phone-alt">| Alt: {address.alternatePhone}</span>
          )}
        </div>
        <p className="profile-address-lines">
          {address.addressLine1}, {address.locality}
        </p>
        <p className="profile-address-region">
          {address.city}, {address.state} - <strong>{address.pincode}</strong>
        </p>
        {address.landmark && (
          <p className="profile-address-landmark">
            <span className="label">Landmark:</span> {address.landmark}
          </p>
        )}
      </div>
    </article>
  );

  const renderManageAddresses = () => (
    <div className="profile-section-fade">
      <div className="profile-panel-header">
        <div>
          <span className="profile-panel-header__subtitle">Shipping & Delivery</span>
          <h2 className="profile-panel-header__title">Manage Addresses</h2>
          <p className="profile-panel-header__desc">
            Save multiple shipping destinations for speedy checkout across your home and office.
          </p>
        </div>
        <button
          type="button"
          className="profile-btn profile-btn--primary"
          onClick={handleAddAddress}
          disabled={addressSaving}
        >
          <FaPlus aria-hidden="true" /> Add New Address
        </button>
      </div>

      {addressLoading ? (
        <div className="profile-empty-state">
          <div className="profile-empty-state__icon">
            <FaSyncAlt className="spin" aria-hidden="true" />
          </div>
          <h3>Loading addresses...</h3>
          <p>Please wait while we retrieve your registered delivery points.</p>
        </div>
      ) : addresses.length > 0 ? (
        <div className="profile-addresses-grid">
          {addresses.map(renderAddressCard)}
        </div>
      ) : (
        <div className="profile-empty-state">
          <div className="profile-empty-state__icon">
            <FaMapMarkedAlt aria-hidden="true" />
          </div>
          <h3>No Saved Addresses Yet</h3>
          <p>Add your primary home or office address to enable quick 1-click checkout.</p>
          <button
            type="button"
            className="profile-btn profile-btn--primary"
            onClick={handleAddAddress}
          >
            <FaPlus aria-hidden="true" /> Add Your First Address
          </button>
        </div>
      )}

      {isAddressFormOpen && renderAddressForm()}
    </div>
  );

  // ================= TAB 3: ORDERS =================
  const getStatusBadgeClass = (status?: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes("delivered") || s.includes("paid") || s.includes("success")) {
      return "profile-status-badge--success";
    }
    if (s.includes("shipped") || s.includes("dispatch") || s.includes("transit")) {
      return "profile-status-badge--info";
    }
    if (s.includes("cancel") || s.includes("fail") || s.includes("refund")) {
      return "profile-status-badge--danger";
    }
    return "profile-status-badge--warning";
  };

  const renderOrderItem = (item: OrderItemDetails, index: number) => (
    <div className="profile-order-item-modern" key={`${item.productId}-${item.productVariantId ?? index}`}>
      <div className="profile-order-item-modern__thumb">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.productName} />
        ) : (
          <div className="profile-order-item-modern__fallback">
            <FaShoppingBag aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="profile-order-item-modern__info">
        <h5 className="profile-order-item-name">{item.productName}</h5>
        <div className="profile-order-item-chips">
          <span className="profile-chip">Qty: {item.quantity}</span>
          {item.sizeName && item.sizeName !== "Not specified" && (
            <span className="profile-chip">Size: {item.sizeName}</span>
          )}
          {item.colorName && item.colorName !== "Not specified" && (
            <span className="profile-chip">Color: {item.colorName}</span>
          )}
        </div>
      </div>

      <div className="profile-order-item-modern__price">
        <span className="unit-price">{formatCurrency(item.price)} each</span>
        <strong className="total-price">{formatCurrency(item.price * item.quantity)}</strong>
      </div>
    </div>
  );

  const renderOrderRow = (order: CustomerOrder) => {
    const items = getOrderItems(order);
    const firstItem = items[0];

    return (
      <div
        className="profile-order-row"
        key={order.orderId || order.paymentId}
        onClick={() => setSelectedOrder(order)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setSelectedOrder(order);
          }
        }}
      >
        <div className="profile-order-row__col profile-order-row__col--id">
          <div className="profile-order-row__icon">
            <FaReceipt aria-hidden="true" />
          </div>
          <div>
            <span className="profile-order-row__label">Order ID</span>
            <strong className="profile-order-row__value">#{order.orderId || "Pending"}</strong>
          </div>
        </div>

        <div className="profile-order-row__col profile-order-row__col--date">
          <span className="profile-order-row__label">Date Placed</span>
          <div className="profile-order-row__date-val">
            <FaCalendarAlt aria-hidden="true" />
            <span>{formatOrderDate(order.orderDate)}</span>
          </div>
        </div>

        <div className="profile-order-row__col profile-order-row__col--items">
          <span className="profile-order-row__label">Products</span>
          <div className="profile-order-row__items-preview">
            {firstItem?.imageUrl ? (
              <img src={firstItem.imageUrl} alt="" className="profile-order-row__thumb" />
            ) : (
              <div className="profile-order-row__thumb-fallback">
                <FaShoppingBag aria-hidden="true" />
              </div>
            )}
            <span>
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>
        </div>

        <div className="profile-order-row__col profile-order-row__col--status">
          <span className="profile-order-row__label">Status</span>
          <div className={`profile-status-badge ${getStatusBadgeClass(order.status)}`}>
            <span className="status-dot" />
            <span>{order.status || "Paid"}</span>
          </div>
        </div>

        <div className="profile-order-row__col profile-order-row__col--total">
          <span className="profile-order-row__label">Total Amount</span>
          <strong className="profile-order-row__total-value">{formatCurrency(order.total)}</strong>
        </div>

        <div className="profile-order-row__col profile-order-row__col--action">
          <button
            type="button"
            className="profile-order-details-btn"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedOrder(order);
            }}
          >
            <span>View Details</span>
            <FaChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  };

  const renderOrderDetailsModal = (order: CustomerOrder) => {
    const items = getOrderItems(order);
    const calculatedSubtotal =
      order.subtotal ??
      items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const shipping =
      order.shippingCost ??
      (order.total > calculatedSubtotal ? order.total - calculatedSubtotal : 0);
    const tax = order.tax ?? 0;

    return (
      <div
        className="profile-modal-backdrop"
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelectedOrder(null);
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-details-title"
      >
        <div className="profile-order-modal">
          {/* Modal Header */}
          <div className="profile-order-modal__header">
            <div>
              <div className="profile-order-modal__tag-row">
                <span className="profile-order-modal__badge">ORDER #{order.orderId || "Pending"}</span>
                <div className={`profile-status-badge ${getStatusBadgeClass(order.status)}`}>
                  <span className="status-dot" />
                  <span>{order.status || "Paid"}</span>
                </div>
              </div>
              <h3 id="order-details-title">Order Details</h3>
              <p className="profile-order-modal__date">
                <FaCalendarAlt aria-hidden="true" /> Placed on {formatOrderDate(order.orderDate)}
              </p>
            </div>
            <button
              type="button"
              className="profile-modal-close-btn"
              onClick={() => setSelectedOrder(null)}
              aria-label="Close order details"
            >
              <FaTimes aria-hidden="true" />
            </button>
          </div>

          <div className="profile-order-modal__body">
            {/* Items List */}
            <div className="profile-order-modal__section">
              <h4 className="profile-order-modal__section-title">
                <FaShoppingBag aria-hidden="true" /> Ordered Items ({items.length})
              </h4>
              <div className="profile-order-modal__items">
                {items.length > 0 ? (
                  items.map(renderOrderItem)
                ) : (
                  <p className="profile-order-empty-items">Product items information is currently unavailable.</p>
                )}
              </div>
            </div>

            {/* Delivery & Payment Metadata Grid */}
            <div className="profile-order-modal__meta-grid">
              <div className="profile-order-modal__meta-card">
                <div className="meta-icon">
                  <FaTruck aria-hidden="true" />
                </div>
                <div>
                  <span className="meta-label">Delivery Destination</span>
                  <p className="meta-value">{order.deliveryAddress || "Standard residential shipping address recorded."}</p>
                </div>
              </div>

              <div className="profile-order-modal__meta-card">
                <div className="meta-icon">
                  <FaShieldAlt aria-hidden="true" />
                </div>
                <div>
                  <span className="meta-label">Payment Information</span>
                  <p className="meta-value">
                    {order.paymentId ? `Transaction ID: ••••${order.paymentId.slice(-8)}` : "Verified Payment Processed"}
                  </p>
                  <span className="meta-sub">Paid securely via Online Gateway</span>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="profile-order-breakdown-card">
              <h4 className="profile-order-breakdown-title">
                <FaReceipt aria-hidden="true" /> Price Breakdown
              </h4>
              <div className="profile-order-breakdown-rows">
                <div className="breakdown-row">
                  <span>Items Subtotal</span>
                  <span>{formatCurrency(calculatedSubtotal)}</span>
                </div>
                <div className="breakdown-row">
                  <span>Shipping & Delivery Fee</span>
                  <span>{shipping > 0 ? formatCurrency(shipping) : <strong className="free-text">FREE</strong>}</span>
                </div>
                {tax > 0 && (
                  <div className="breakdown-row">
                    <span>Applicable Taxes (GST)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                )}
                <div className="breakdown-row breakdown-row--total">
                  <span>Grand Total Paid</span>
                  <strong className="total-amount">{formatCurrency(order.total)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="profile-order-modal__footer">
            <button
              type="button"
              className="profile-btn profile-btn--secondary"
              onClick={() => setSelectedOrder(null)}
            >
              Close
            </button>
            <Link
              to="/home"
              className="profile-btn profile-btn--primary"
              onClick={() => setSelectedOrder(null)}
            >
              Shop More Products
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const renderOrders = () => (
    <div className="profile-section-fade">
      <div className="profile-panel-header">
        <div>
          <span className="profile-panel-header__subtitle">Purchase History</span>
          <h2 className="profile-panel-header__title">My Orders</h2>
          <p className="profile-panel-header__desc">Review your past purchases, shipment statuses, and item summaries.</p>
        </div>
        <button
          type="button"
          className="profile-btn profile-btn--secondary"
          onClick={() => fetchOrders(true)}
          disabled={ordersLoading}
        >
          <FaSyncAlt className={ordersLoading ? "spin" : ""} aria-hidden="true" />
          <span>{ordersLoading ? "Updating..." : "Refresh Orders"}</span>
        </button>
      </div>

      {ordersLoading ? (
        <div className="profile-empty-state">
          <div className="profile-empty-state__icon">
            <FaSyncAlt className="spin" aria-hidden="true" />
          </div>
          <h3>Fetching your orders...</h3>
          <p>Please wait while we retrieve your order details.</p>
        </div>
      ) : orders.length > 0 ? (
        <div className="profile-orders-list">
          {orders.map(renderOrderRow)}
        </div>
      ) : (
        <div className="profile-empty-state">
          <div className="profile-empty-state__icon">
            <FaShoppingBag aria-hidden="true" />
          </div>
          <h3>No Orders Yet</h3>
          <p>You haven't placed any orders yet. Discover our latest collections and start shopping today.</p>
          <Link to="/home" className="profile-btn profile-btn--primary">
            Explore Products
          </Link>
        </div>
      )}

      {selectedOrder && renderOrderDetailsModal(selectedOrder)}
    </div>
  );

  // ================= MAIN SHELL =================
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
        <section className="profile-error-card">
          <div className="profile-error-card__icon">
            <FaShieldAlt aria-hidden="true" />
          </div>
          <h2>Profile Unavailable</h2>
          <p>{error}</p>
          <button
            type="button"
            className="profile-btn profile-btn--primary"
            onClick={() => navigate("/signin")}
          >
            Sign In Again
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-container">
        {/* SIDEBAR NAVIGATION & IDENTITY */}
        <aside className="profile-sidebar">
          <div className="profile-identity-card">
            <div className="profile-avatar-container">
              <img src={profileImage} alt={fullName} className="profile-avatar-img" />
              <div className="profile-avatar-badge">{getInitials(profile)}</div>
            </div>

            <h2 className="profile-user-name">{fullName}</h2>
            <p className="profile-user-email">{profile?.email}</p>

            <div className="profile-member-badge">
              <FaShieldAlt aria-hidden="true" />
              <span>
                {role === "SuperAdministrator"
                  ? "Platform Super Admin"
                  : role === "Administrator"
                  ? "Store Administrator"
                  : role === "Seller"
                  ? "Store Owner / Seller"
                  : "Verified Customer"}
              </span>
            </div>

            {/* Quick Metrics */}
            <div className="profile-quick-stats">
              <div className="profile-stat-box" onClick={() => setActiveTab("orders")}>
                <span className="stat-number">{orders.length}</span>
                <span className="stat-label">Orders</span>
              </div>
              <div className="profile-stat-divider" />
              <div className="profile-stat-box" onClick={() => setActiveTab("addresses")}>
                <span className="stat-number">{addresses.length}</span>
                <span className="stat-label">Addresses</span>
              </div>
            </div>
          </div>

          <nav className="profile-nav-menu" aria-label="Customer Profile Navigation">
            <button
              type="button"
              className={`profile-nav-item ${activeTab === "personal" ? "is-active" : ""}`}
              onClick={() => setActiveTab("personal")}
            >
              <div className="profile-nav-item__left">
                <FaRegUser aria-hidden="true" />
                <span>Personal Details</span>
              </div>
            </button>

            <button
              type="button"
              className={`profile-nav-item ${activeTab === "addresses" ? "is-active" : ""}`}
              onClick={() => setActiveTab("addresses")}
            >
              <div className="profile-nav-item__left">
                <FaMapMarkedAlt aria-hidden="true" />
                <span>Manage Addresses</span>
              </div>
              {addresses.length > 0 && (
                <span className="profile-nav-count">{addresses.length}</span>
              )}
            </button>

            <button
              type="button"
              className={`profile-nav-item ${activeTab === "orders" ? "is-active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              <div className="profile-nav-item__left">
                <FaShoppingBag aria-hidden="true" />
                <span>My Orders</span>
              </div>
              {orders.length > 0 && (
                <span className="profile-nav-count">{orders.length}</span>
              )}
            </button>

            {(role === "Administrator" || role === "SuperAdministrator" || role === "Seller") && (
              <>
                <div className="profile-nav-separator" />
                <button
                  type="button"
                  className="profile-nav-item"
                  onClick={() => navigate("/productList")}
                >
                  <div className="profile-nav-item__left">
                    <FaShoppingBag aria-hidden="true" />
                    <span>Manage Products</span>
                  </div>
                </button>
                {(role === "Administrator" || role === "SuperAdministrator") && (
                  <button
                    type="button"
                    className="profile-nav-item"
                    onClick={() => navigate("/store-settings")}
                  >
                    <div className="profile-nav-item__left">
                      <FaShieldAlt aria-hidden="true" />
                      <span>Store Settings</span>
                    </div>
                  </button>
                )}
              </>
            )}

            <div className="profile-nav-separator" />

            <button
              type="button"
              className="profile-nav-item profile-nav-item--logout"
              onClick={handleLogout}
            >
              <div className="profile-nav-item__left">
                <FaSignOutAlt aria-hidden="true" />
                <span>Sign Out</span>
              </div>
            </button>
          </nav>
        </aside>

        {/* MAIN ACTIVE TAB PANEL */}
        <section className="profile-main-panel">
          {activeTab === "personal" && renderPersonalDetails()}
          {activeTab === "addresses" && renderManageAddresses()}
          {activeTab === "orders" && renderOrders()}
        </section>
      </div>
    </main>
  );
};

export default Profile;
