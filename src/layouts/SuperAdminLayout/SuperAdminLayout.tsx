import React, { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import "./SuperAdminLayout.css";
import brandLogoLight from "../../assets/brand/dukaanonline-logo-light.svg";
import brandIcon from "../../assets/brand/dukaanonline-icon.svg";
import { useAuth } from "../../Pages/Login/useAuth";
import { getStoreRequests } from "../../Services/tenantService";
import {
  FaChartPie,
  FaClipboardList,
  FaStore,
  FaUsersCog,
  FaUserShield,
  FaSlidersH,
  FaHistory,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaBars,
  FaBell,
} from "react-icons/fa";

export const SuperAdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const { email, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchPending = async () => {
      try {
        const requests = await getStoreRequests("PENDING");
        if (isMounted && Array.isArray(requests)) {
          setPendingCount(requests.length);
        }
      } catch (err) {
        // Silently catch background badge error
      }
    };
    fetchPending();
    const interval = setInterval(fetchPending, 45000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleSignOut = () => {
    logout();
    navigate("/super-admin/login");
  };

  const navItems = [
    {
      to: "/super-admin/dashboard",
      label: "Platform Overview",
      icon: <FaChartPie className="sa-nav-icon" />,
    },
    {
      to: "/super-admin/applications",
      label: "Application Queue",
      icon: <FaClipboardList className="sa-nav-icon" />,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      to: "/super-admin/stores",
      label: "Store Directory",
      icon: <FaStore className="sa-nav-icon" />,
    },
    {
      to: "/super-admin/admins",
      label: "Administrator Accounts",
      icon: <FaUsersCog className="sa-nav-icon" />,
    },
    {
      to: "/super-admin/assignments",
      label: "Store Assignments",
      icon: <FaUserShield className="sa-nav-icon" />,
    },
    {
      to: "/super-admin/settings",
      label: "Platform Settings",
      icon: <FaSlidersH className="sa-nav-icon" />,
    },
    {
      to: "/super-admin/audit-logs",
      label: "System Audit Logs",
      icon: <FaHistory className="sa-nav-icon" />,
    },
  ];

  return (
    <div className="super-admin-layout">
      {/* Super Admin Control Center Sidebar */}
      <aside
        className={`sa-sidebar ${collapsed ? "collapsed" : ""} ${
          mobileOpen ? "mobile-open" : ""
        }`}
      >
        <div className="sa-sidebar-header">
          <Link to="/super-admin/dashboard" className="sa-sidebar-brand">
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
                  className="sa-sidebar-logo"
                />
                <span className="sa-badge-pill">SUPER ADMIN</span>
              </>
            )}
          </Link>
          <button
            className="sa-sidebar-toggle-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
          </button>
        </div>

        <nav className="sa-sidebar-nav">
          {!collapsed && (
            <div className="sa-nav-section-title">Platform Operations</div>
          )}
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sa-nav-item ${isActive ? "active" : ""}`
              }
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && (
                <>
                  <span className="sa-nav-label">{item.label}</span>
                  {item.badge !== null && (
                    <span className="sa-nav-count-badge">{item.badge}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sa-sidebar-footer">
          <button
            className="sa-nav-item"
            style={{ background: "none", border: "none", width: "100%", cursor: "pointer" }}
            onClick={handleSignOut}
            title={collapsed ? "Sign Out" : undefined}
          >
            <FaSignOutAlt className="sa-nav-icon" style={{ color: "#ef4444" }} />
            {!collapsed && <span className="sa-nav-label">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content & Top Bar */}
      <div className="sa-main-wrapper">
        <header className="sa-topbar">
          <div className="sa-topbar-left">
            <button
              className="sa-topbar-mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <FaBars />
            </button>
            <div className="sa-health-indicator">
              <span className="sa-pulse-dot"></span>
              <span>All Systems Operational</span>
            </div>
          </div>

          <div className="sa-topbar-right">
            {pendingCount > 0 && (
              <Link
                to="/super-admin/applications"
                className="sa-applications-pill"
              >
                <FaBell size={12} />
                <span>{pendingCount} Pending Application{pendingCount > 1 ? "s" : ""}</span>
              </Link>
            )}

            <div className="sa-user-chip">
              <div className="sa-user-avatar">
                {(email || "S")[0].toUpperCase()}
              </div>
              <div className="sa-user-info">
                <span className="sa-user-email">{email || "Super Administrator"}</span>
                <span className="sa-user-role-label">Super Admin</span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="sa-logout-btn"
              title="Sign Out"
            >
              <FaSignOutAlt size={12} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        <main className="sa-content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
