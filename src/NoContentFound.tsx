import Lottie from "lottie-react";
import React from "react";
import { Link } from "react-router-dom";
import noContnt from "./Assests/404Error.json";
import { useTenant } from "./Context/TenantContext";
import { useAuth } from "./Pages/Login/useAuth";
import { FaArrowLeft, FaShieldAlt } from "react-icons/fa";
import "./NoContentFound.css";

const NoContentFound: React.FC = () => {
  const { activeSlug, tenant } = useTenant();
  const { role } = useAuth();

  const isSuperAdmin = role === "SuperAdministrator";
  const isStoreAdmin = role === "Administrator" || role === "StoreAdmin" || role === "Seller" || role === "StoreSeller";
  const storeName = tenant?.storeName || "Store";

  let returnPath = "/";
  let returnLabel = "Return to Home";
  if (isSuperAdmin) {
    returnPath = "/super-admin/dashboard";
    returnLabel = "Return to Super Admin Dashboard";
  } else if (isStoreAdmin) {
    returnPath = "/admin/dashboard";
    returnLabel = "Return to Store Admin Dashboard";
  } else if (activeSlug) {
    returnPath = `/store/${activeSlug}`;
    returnLabel = `Return to ${storeName} Storefront`;
  }

  return (
    <div className="noContent-container">
      <div className="noContent-card">
        <Lottie
          animationData={noContnt}
          loop={true}
          className="noContent-animation"
        />
        <h1 className="noContent-title">Page Not Found (404)</h1>
        <p className="noContent-desc">
          The page you are looking for doesn't exist, has been moved, or you don't have permission to access it.
        </p>

        <div className="noContent-actions">
          <Link to={returnPath} className="noContent-btn noContent-btn--primary">
            {isSuperAdmin ? <FaShieldAlt /> : <FaArrowLeft />} {returnLabel}
          </Link>
          {!isSuperAdmin && !isStoreAdmin && (
            <Link to="/admin/login" className="noContent-btn noContent-btn--secondary">
              Merchant Admin Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoContentFound;
