import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import "./StoreAdminLayout.css";
import brandLogoLight from "../../assets/brand/dukaanonline-logo-light.svg";
import brandIcon from "../../assets/brand/dukaanonline-icon.svg";
import { useAuth } from "../../Pages/Login/useAuth";
import { useTenant } from "../../Context/TenantContext";
import {
  FaTachometerAlt,
  FaBoxOpen,
  FaThList,
  FaWarehouse,
  FaShoppingBag,
  FaUsers,
  FaChartLine,
  FaPalette,
  FaUserCircle,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaBars,
  FaExternalLinkAlt,
  FaStore,
} from "react-icons/fa";

export const StoreAdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { email, role, tenantSlug: authTenantSlug, logout } = useAuth();
  const { tenant, activeSlug } = useTenant();
  const navigate = useNavigate();

  const effectiveSlug = activeSlug || authTenantSlug || "default";
  const storeDisplayName = tenant?.storeName || (effectiveSlug !== "default" ? effectiveSlug.replace(/-/g, " ") : "Store");

  const handleSignOut = () => {
    logout();
    navigate(`/admin/login?store=${effectiveSlug}`);
  };

  const navItems = [
    {
      to: "/admin/dashboard",
      label: "Store Dashboard",
      icon: <FaTachometerAlt className="m-nav-icon" />,
    },
    {
      to: "/admin/products",
      label: "Product Catalog",
      icon: <FaBoxOpen className="m-nav-icon" />,
    },
    {
      to: "/admin/categories",
      label: "Categories",
      icon: <FaThList className="m-nav-icon" />,
    },
    {
      to: "/admin/inventory",
      label: "Inventory Health",
      icon: <FaWarehouse className="m-nav-icon" />,
    },
    {
      to: "/admin/orders",
      label: "Orders & Fulfillment",
      icon: <FaShoppingBag className="m-nav-icon" />,
    },
    {
      to: "/admin/customers",
      label: "Customers",
      icon: <FaUsers className="m-nav-icon" />,
    },
    {
      to: "/admin/analytics",
      label: "Sales Analytics",
      icon: <FaChartLine className="m-nav-icon" />,
    },
    {
      to: "/admin/store-settings",
      label: "Store Branding & Settings",
      icon: <FaPalette className="m-nav-icon" />,
    },
    {
      to: "/admin/profile",
      label: "Admin Profile",
      icon: <FaUserCircle className="m-nav-icon" />,
    },
  ];

  return (
    <div className="store-admin-layout">
      {/* Merchant Admin Sidebar */}
      <aside
        className={`m-sidebar ${collapsed ? "collapsed" : ""} ${
          mobileOpen ? "mobile-open" : ""
        }`}
      >
        <div className="m-sidebar-header">
          <Link to="/admin/dashboard" className="m-sidebar-brand">
            {collapsed ? (
              <img
                src={brandIcon}
                alt="DukaanOnline"
                style={{ width: "32px", height: "32px" }}
              />
            ) : (
              <>
                <img
                  src={brandLogoLight}
                  alt="DukaanOnline"
                  className="m-sidebar-logo"
                />
                <span className="m-badge-pill">STORE ADMIN</span>
              </>
            )}
          </Link>
          <button
            className="m-sidebar-toggle-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
          </button>
        </div>

        {/* Active Store Context Card */}
        {!collapsed && (
          <div className="m-store-card">
            <div className="m-store-info-top">
              <span className="m-store-label">Active Store</span>
              <span className="m-store-live-dot">● Active</span>
            </div>
            <h4 className="m-store-name" title={storeDisplayName}>
              {storeDisplayName}
            </h4>
            <span className="m-store-slug">/{effectiveSlug}</span>
          </div>
        )}

        <nav className="m-sidebar-nav">
          {!collapsed && (
            <div className="m-nav-section-title">Store Management</div>
          )}
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `m-nav-item ${isActive ? "active" : ""}`
              }
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && <span className="m-nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="m-sidebar-footer">
          <button
            className="m-nav-item"
            style={{ background: "none", border: "none", width: "100%", cursor: "pointer" }}
            onClick={handleSignOut}
            title={collapsed ? "Sign Out" : undefined}
          >
            <FaSignOutAlt className="m-nav-icon" style={{ color: "#ef4444" }} />
            {!collapsed && <span className="m-nav-label">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content & Top Bar */}
      <div className="m-main-wrapper">
        <header className="m-topbar">
          <div className="m-topbar-left">
            <button
              className="m-topbar-mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <FaBars />
            </button>
            <div className="m-store-badge">
              <FaStore className="m-store-badge-icon" />
              <span>
                <strong>{storeDisplayName}</strong> ({effectiveSlug})
              </span>
            </div>
          </div>

          <div className="m-topbar-right">
            <a
              href={`/store/${effectiveSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-view-storefront"
              title="Open customer storefront in a new tab"
            >
              <FaExternalLinkAlt size={12} />
              <span>View Live Storefront</span>
            </a>

            <div className="m-user-chip">
              <div className="m-user-avatar">
                {(email || "A")[0].toUpperCase()}
              </div>
              <div className="m-user-info">
                <span className="m-user-email">{email || "Merchant Admin"}</span>
                <span className="m-user-role-label">
                  {role === "SuperAdministrator" ? "Super Admin" : "Store Admin"}
                </span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="m-logout-btn"
              title="Sign Out"
            >
              <FaSignOutAlt size={12} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        <main className="m-content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StoreAdminLayout;
