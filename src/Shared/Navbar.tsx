import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Pages/Login/useAuth";
import { useDispatch, useSelector } from "react-redux";
import "./Navbar.css";
import { AppDispatch, RootState } from "../Store/ConfigureStore";
import shoppingCart from "../Assests/online-shopping.png";
import peopleIcon from "../Assests/people.png";
import stylethread from "../Assests/STW_Logo.png";
import { CartItem } from "../Types/Interface/ICart";
import { fetchCart, clearCartList } from "../Store/EntitySlices";
import { fetchWishlistIds, clearWishlist } from "../Store/WishlistSlice";
import { jwtDecode } from "jwt-decode";
import { FaSearch, FaBars, FaTimes, FaHeart } from "react-icons/fa"; // 🔍 Menu & heart icons
import { useTenant } from "../Context/TenantContext";

interface CustomerData {
  iss: string;
  sub: string;
  userId: string;
  lastName?: string;
}

const Navbar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, role, tenantRole } = useAuth();
  const { tenant, settings, activeSlug } = useTenant();
  const navigate = useNavigate();
  const location = useLocation();

  const isStoreAdminUser =
    role === "Administrator" ||
    role === "SuperAdministrator" ||
    role === "StoreAdmin" ||
    tenantRole === "StoreAdmin";

  const currentSlug = activeSlug || "default";
  const storePrefix = `/store/${currentSlug}`;
  const homePath = storePrefix;
  const cartPath = `${storePrefix}/cart`;
  const wishlistPath = `${storePrefix}/wishlist`;
  const profilePath = `${storePrefix}/profile`;
  const signinPath = `${storePrefix}/signin`;
  const aboutPath = `${storePrefix}/about`;

  const cartItems = useSelector(
    (state: RootState) => (state.cartItem?.list as CartItem[]) || [],
  );
  const cartCount = cartItems.reduce(
    (sum, item) => sum + (item.quantity ?? 0),
    0,
  );
  const wishlistCount = useSelector(
    (state: RootState) => state.wishlist?.itemIds?.length ?? 0
  );

  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const navRef = useRef<HTMLElement | null>(null);

  // Dynamically measure navbar height and expose to CSS as --navbar-height
  useEffect(() => {
    const updateNavbarHeight = () => {
      if (navRef.current) {
        const height = Math.round(navRef.current.getBoundingClientRect().height);
        if (height > 0) {
          document.documentElement.style.setProperty("--navbar-height", `${height}px`);
        }
      }
    };

    updateNavbarHeight();

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && navRef.current) {
      observer = new ResizeObserver(() => {
        updateNavbarHeight();
      });
      observer.observe(navRef.current);
    }

    window.addEventListener("resize", updateNavbarHeight);
    document.body.classList.add("has-navbar");

    return () => {
      window.removeEventListener("resize", updateNavbarHeight);
      if (observer) {
        observer.disconnect();
      }
      document.body.classList.remove("has-navbar");
      document.documentElement.style.removeProperty("--navbar-height");
    };
  }, [location.pathname, showMobileSearch, isMenuOpen]);

  // ✅ On login: fetch cart & wishlist | On logout: clear cart & wishlist
  useEffect(() => {
    if (token) {
      const clientData = jwtDecode<CustomerData>(token);
      const id = Number(clientData.userId);
      dispatch(fetchCart({ customerId: id }));
      dispatch(fetchWishlistIds());
    } else {
      dispatch(clearCartList());
      dispatch(clearWishlist());
    }
  }, [token, dispatch]);

  const handleCartClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    if (!token) {
      event.preventDefault();
      navigate(signinPath);
    } else {
      navigate(cartPath);
    }
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTerm = searchTerm.trim();
    const params = new URLSearchParams();

    if (trimmedTerm) {
      params.set("search", trimmedTerm);
    }

    navigate({ pathname: homePath, search: params.toString() });
    setShowMobileSearch(false);
  };

  return (
    <div>
      <nav ref={navRef} className="navbar navbar-expand-lg navbar-light bg-light">
        {/* Left Section */}
        <div className="navbar-left">
          <div className="ST-Logo">
            <Link to={homePath} className="nav-link">
              <img
                src={settings?.logoUrl || stylethread}
                alt={`${tenant?.storeName || "Style Thread"} Logo`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = stylethread;
                }}
              />
            </Link>
          </div>
          <Link to={homePath} className="nav-link">
            <div className="logo-text">{tenant?.storeName || "Style Thread"}</div>
          </Link>
          <div className="desktop-nav">
            <Link to={homePath}>Home</Link>
            <Link to={aboutPath}>About</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>

        {/* Center Section */}
        <div className="navbar-center">
          {/* Desktop Search */}
          <form className="searchbox desktop-search" onSubmit={handleSearch} role="search">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              maxLength={100}
              placeholder="Search by name, SKU or description..."
              className="input"
              aria-label="Search products"
            />
            <button type="submit" className="search-submit" aria-label="Search products">
              <FaSearch aria-hidden="true" />
            </button>
          </form>

          {/* Mobile Search */}
          <div className="mobile-search">
            {!showMobileSearch ? (
              <FaSearch
                className="search-icon"
                onClick={() => setShowMobileSearch(true)}
              />
            ) : (
              <form className="mobile-search-form" onSubmit={handleSearch} role="search">
                <input
                  autoFocus
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  maxLength={100}
                  placeholder="Search products..."
                  className="input expanded"
                  aria-label="Search products"
                />
                <button type="submit" className="mobile-search-submit" aria-label="Search products">
                  <FaSearch aria-hidden="true" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="navbar-right">
          <div className="wishlist-icon">
            <Link
              to={wishlistPath}
              title="My Wishlist"
              className="wishlist-nav-link"
              onClick={(e) => {
                if (!token) {
                  e.preventDefault();
                  navigate(signinPath);
                }
              }}
            >
              <FaHeart className="wishlist-nav-heart" />
              {wishlistCount > 0 && <span className="wishlist-count">{wishlistCount}</span>}
            </Link>
          </div>

          <div className="cart-icon">
            <Link to={cartPath} onClick={handleCartClick}>
              <img src={shoppingCart} alt="Shopping Cart" />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </Link>
          </div>

          {token ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {isStoreAdminUser && (
                <Link
                  to="/admin/dashboard"
                  style={{
                    textDecoration: "none",
                    color: "#ffffff",
                    backgroundColor: "var(--brand-teal, #0d9488)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: "6px",
                    letterSpacing: "0.02em",
                  }}
                  title="Switch to Store Admin Portal"
                >
                  Admin Portal
                </Link>
              )}
              <div className="profile-icon">
                <Link to={profilePath} title="My Profile">
                  <img src={peopleIcon} alt="Profile Icon" />
                </Link>
              </div>
            </div>
          ) : (
            <Link
              to={signinPath}
              style={{
                textDecoration: "none",
                color: "#1f2937",
                fontWeight: 600,
                fontSize: "0.9rem",
                padding: "6px 14px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                backgroundColor: "#fff"
              }}
            >
              Sign In
            </Link>
          )}

          {/* Mobile Hamburger */}
          <div className="mobile-menu-icon">
            {isMenuOpen ? (
              <FaTimes onClick={() => setIsMenuOpen(false)} />
            ) : (
              <FaBars onClick={() => setIsMenuOpen(true)} />
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <Link to={homePath} onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>
          <Link to={aboutPath} onClick={() => setIsMenuOpen(false)}>
            About
          </Link>
          <Link to="/contact" onClick={() => setIsMenuOpen(false)}>
            Contact
          </Link>
          <Link to={wishlistPath} onClick={() => setIsMenuOpen(false)}>
            Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
          </Link>
          {token ? (
            <Link to={profilePath} onClick={() => setIsMenuOpen(false)}>
              My Profile
            </Link>
          ) : (
            <Link to={signinPath} onClick={() => setIsMenuOpen(false)}>
              Sign In
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;
