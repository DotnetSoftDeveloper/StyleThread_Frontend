import React, { useEffect, useState } from "react";
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
import { jwtDecode } from "jwt-decode";
import { FaSearch, FaBars, FaTimes } from "react-icons/fa"; // 🔍 Menu icons
import { useTenant } from "../Context/TenantContext";

interface CustomerData {
  iss: string;
  sub: string;
  userId: string;
  lastName?: string;
}

const Navbar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, role } = useAuth();
  const { tenant, settings } = useTenant();
  const navigate = useNavigate();
  const location = useLocation();

  const cartItems = useSelector(
    (state: RootState) => (state.cartItem?.list as CartItem[]) || [],
  );
  const cartCount = cartItems.reduce(
    (sum, item) => sum + (item.quantity ?? 0),
    0,
  );

  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setSearchTerm(new URLSearchParams(location.search).get("search") ?? "");
  }, [location.search]);

  // ✅ On login: fetch cart | On logout: clear cart
  useEffect(() => {
    if (token) {
      const clientData = jwtDecode<CustomerData>(token);
      const id = Number(clientData.userId);
      dispatch(fetchCart({ customerId: id }));
    } else {
      dispatch(clearCartList());
    }
  }, [token, dispatch]);

  const handleCartClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    if (!token) {
      event.preventDefault();
      navigate("/signin");
    } else {
      navigate("/cart");
    }
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTerm = searchTerm.trim();
    const params = new URLSearchParams();

    if (trimmedTerm) {
      params.set("search", trimmedTerm);
    }

    navigate({ pathname: "/home", search: params.toString() });
    setShowMobileSearch(false);
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        {/* Left Section */}
        <div className="navbar-left">
          <div className="ST-Logo">
            <Link to="/home" className="nav-link">
              <img
                src={settings?.logoUrl || stylethread}
                alt={`${tenant?.storeName || "Style Thread"} Logo`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = stylethread;
                }}
              />
            </Link>
          </div>
          <Link to="/home" className="nav-link">
            <div className="logo-text">{tenant?.storeName || "Style Thread"}</div>
          </Link>
          <div className="desktop-nav">
            <Link to="/home">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>

            {(role === "Administrator" || role === "SuperAdministrator" || role === "Seller") && (
              <Link to="/productList">Products</Link>
            )}
            {(role === "Administrator" || role === "SuperAdministrator") && (
              <Link to="/store-settings">Store Settings</Link>
            )}
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
          <div className="cart-icon">
            <Link to="/cart" onClick={handleCartClick}>
              <img src={shoppingCart} alt="Shopping Cart" />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </Link>
          </div>

          {token ? (
            <div className="profile-icon">
              <Link to="/profile" title="My Profile">
                <img src={peopleIcon} alt="Profile Icon" />
              </Link>
            </div>
          ) : (
            <Link
              to="/signin"
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
          <Link to="/home" onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>
          <Link to="/about" onClick={() => setIsMenuOpen(false)}>
            About
          </Link>
          <Link to="/contact" onClick={() => setIsMenuOpen(false)}>
            Contact
          </Link>
          {(role === "Administrator" || role === "SuperAdministrator" || role === "Seller") && (
            <Link to="/productList" onClick={() => setIsMenuOpen(false)}>
              Products
            </Link>
          )}
          {(role === "Administrator" || role === "SuperAdministrator") && (
            <Link to="/store-settings" onClick={() => setIsMenuOpen(false)}>
              Store Settings
            </Link>
          )}
          {token ? (
            <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
              My Profile
            </Link>
          ) : (
            <Link to="/signin" onClick={() => setIsMenuOpen(false)}>
              Sign In
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;
