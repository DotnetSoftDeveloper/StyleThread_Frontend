import React, { useState } from "react";
import "./../../Pages/Cart/Cart.css";
import "./AddressSelection.css";
import { useToast } from "../../Utils/Helper/ToastNotifications";

interface Props {
  addresses: string[];
  selectedAddress: string | null;
  onSelect: (addr: string | null) => void;
  onSaveAddress: (addr: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const AddressSelection: React.FC<Props> = ({
  addresses,
  selectedAddress,
  onSelect,
  onSaveAddress,
  onNext,
  onBack
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    pincode: "",
    locality: "",
    addressLine1: "",
    city: "",
    state: "",
    landmark: "",
    alternatePhone: "",
    locationTypeTag: "HOME"
  });

    const { showToast } = useToast();

  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    const { fullName, phone, pincode, locality, addressLine1, city, state } =
      formData;

    if (
      !fullName ||
      !phone ||
      phone.length !== 10 ||
      !pincode ||
      pincode.length !== 6 ||
      !locality ||
      !addressLine1 ||
      !city ||
      !state
    ) {
      showToast("error", "Please select the address where you want to deliver the product.")
      // alert("Please fill in all required fields correctly.");
      return;
    }

    const formattedAddress = `${fullName}, ${phone}, ${addressLine1}, ${locality}, ${city}, ${state} - ${pincode}, Landmark: ${
      formData.landmark || "N/A"
    }, Alt Phone: ${formData.alternatePhone || "N/A"}, Type: ${
      formData.locationTypeTag
    }`;

    onSaveAddress(formattedAddress);
    onSelect(formattedAddress);

    setFormData({
      fullName: "",
      phone: "",
      pincode: "",
      locality: "",
      addressLine1: "",
      city: "",
      state: "",
      landmark: "",
      alternatePhone: "",
      locationTypeTag: "HOME"
    });

    setIsAddingNew(false);
    onNext();
  };

  return (
    <div className="address-screen">
      <div className="address-screen__heading">
        <div>
          <h2>Delivery address</h2>
          <p>Choose where you would like your order delivered.</p>
        </div>
        <span className="address-screen__secure">Secure delivery</span>
      </div>

      <div className="address-list">
        {addresses.map((addr, idx) => (
          <div
            key={idx}
            className={`address-option ${selectedAddress === addr ? "is-selected" : ""}`}
          >
            <input
              type="radio"
              name="address"
              value={addr}
              checked={selectedAddress === addr}
              onChange={() => {
                onSelect(addr);
                setIsAddingNew(false);
              }}
            />
            <label>{addr}</label>
          </div>
        ))}
        <div className="address-option address-option--new">
          <button
            className="addNewAddress"
            onClick={() => {
              if (isAddingNew) {
                setIsAddingNew(false);
              } else {
                onSelect(null);
                setIsAddingNew(true);
              }
            }}
          >
            {isAddingNew ? "× Cancel New Address" : "+ Add New Address"}
          </button>
        </div>

        {/* ✅ New address form shows below, but doesn’t hide old ones */}
        {isAddingNew && (
          <div className="address-form">
            <div className="address-form__header">
              <div className="address-form__icon">+</div>
              <div>
                <h3>Add a new address</h3>
                <p>Enter the details for your delivery location.</p>
              </div>
            </div>
            <div className="form-fields">
              {/* Full Name + Mobile */}
              <div className="form-row">
                <div className="input-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    maxLength={100}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Mobile Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              {/* Pincode + City + State */}
              <div className="form-row">
                <div className="input-group">
                  <label>Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    maxLength={6}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>City / District</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group select-group">
                  <label>State</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>
                      {" "}
                      --Select State--{" "}
                    </option>{" "}
                    <option value="Andaman & Nicobar Islands">
                      {" "}
                      Andaman & Nicobar Islands{" "}
                    </option>{" "}
                    <option value="Andhra Pradesh">Andhra Pradesh</option>{" "}
                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>{" "}
                    <option value="Assam">Assam</option>{" "}
                    <option value="Bihar">Bihar</option>{" "}
                    <option value="Chandigarh">Chandigarh</option>{" "}
                    <option value="Chhattisgarh">Chhattisgarh</option>{" "}
                    <option value="Dadra & Nagar Haveli & Daman & Diu">
                      {" "}
                      Dadra & Nagar Haveli & Daman & Diu{" "}
                    </option>{" "}
                    <option value="Delhi">Delhi</option>{" "}
                    <option value="Goa">Goa</option>{" "}
                    <option value="Gujarat">Gujarat</option>{" "}
                    <option value="Haryana">Haryana</option>{" "}
                    <option value="Himachal Pradesh">Himachal Pradesh</option>{" "}
                    <option value="Jammu & Kashmir">Jammu & Kashmir</option>{" "}
                    <option value="Jharkhand">Jharkhand</option>{" "}
                    <option value="Karnataka">Karnataka</option>{" "}
                    <option value="Kerala">Kerala</option>{" "}
                    <option value="Ladakh">Ladakh</option>{" "}
                    <option value="Lakshadweep">Lakshadweep</option>{" "}
                    <option value="Madhya Pradesh">Madhya Pradesh</option>{" "}
                    <option value="Maharashtra">Maharashtra</option>{" "}
                    <option value="Manipur">Manipur</option>{" "}
                    <option value="Meghalaya">Meghalaya</option>{" "}
                    <option value="Mizoram">Mizoram</option>{" "}
                    <option value="Nagaland">Nagaland</option>{" "}
                    <option value="Odisha">Odisha</option>{" "}
                    <option value="Puducherry">Puducherry</option>{" "}
                    <option value="Punjab">Punjab</option>{" "}
                    <option value="Rajasthan">Rajasthan</option>{" "}
                    <option value="Sikkim">Sikkim</option>{" "}
                    <option value="Tamil Nadu">Tamil Nadu</option>{" "}
                    <option value="Telangana">Telangana</option>{" "}
                    <option value="Tripura">Tripura</option>{" "}
                    <option value="Uttarakhand">Uttarakhand</option>{" "}
                    <option value="Uttar Pradesh">Uttar Pradesh</option>{" "}
                    <option value="West Bengal">West Bengal</option>
                  </select>
                </div>
              </div>

              {/* Locality */}
              <div className="input-group">
                <label>Locality</label>
                <input
                  type="text"
                  placeholder="Near famous location.."
                  name="locality"
                  value={formData.locality}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Address */}
              <div className="input-group textarea-group">
                <label>Address (Area and Street)</label>
                <textarea
                  name="addressLine1"
                  placeholder="House No., street 1, street 2, Distt , State..."
                  rows={3}
                  value={formData.addressLine1}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Landmark + Alternate Phone */}
              <div className="form-row">
                <div className="input-group">
                  <label>Landmark (Optional)</label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group">
                  <label>Alternate Phone (Optional)</label>
                  <input
                    type="tel"
                    name="alternatePhone"
                    value={formData.alternatePhone}
                    onChange={handleChange}
                    maxLength={10}
                  />
                </div>
              </div>

              {/* Address Type */}
              <fieldset className="address-type">
                <legend>Save address as</legend>
                <label className={formData.locationTypeTag === "HOME" ? "is-active" : ""}>
                  <input
                    type="radio"
                    name="locationTypeTag"
                    value="HOME"
                    checked={formData.locationTypeTag === "HOME"}
                    onChange={handleChange}
                  />
                  <span><strong>Home</strong><small>All-day delivery</small></span>
                </label>
                <label className={formData.locationTypeTag === "WORK" ? "is-active" : ""}>
                  <input
                    type="radio"
                    name="locationTypeTag"
                    value="WORK"
                    checked={formData.locationTypeTag === "WORK"}
                    onChange={handleChange}
                  />
                  <span><strong>Work</strong><small>Delivery 10 AM – 5 PM</small></span>
                </label>
              </fieldset>
            </div>

            <div className="address-actions">
              <button
                className="address-action address-action--secondary"
                type="button"
                onClick={() => setIsAddingNew(false)}
              >
                Cancel
              </button>
              <button className="address-action address-action--primary" onClick={handleSave}>
                Save & Continue
              </button>
            </div>
          </div>
        )}
        {!isAddingNew &&(
            <div className="address-actions address-actions--selection">
          <button className="address-action address-action--secondary" onClick={onBack}>
            Back
          </button>
          <button
            className="address-action address-action--primary"
            disabled={!selectedAddress}
            onClick={onNext}
          >
            Deliver Here
          </button>
        </div>
        )}
        
      </div>
    </div>
  );
};

export default AddressSelection;

