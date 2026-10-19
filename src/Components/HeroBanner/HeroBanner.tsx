import React from "react";
import "./HeroBanner.css";
import { useTenant } from "../../Context/TenantContext";
import { FaArrowRight, FaShieldAlt, FaTruck, FaUndo, FaTag } from "react-icons/fa";

interface HeroBannerProps {
  onExploreClick?: () => void;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreClick }) => {
  const { tenant, settings } = useTenant();

  const storeName = tenant?.storeName || "Style Thread";
  const heroTitle = settings?.heroTitle?.trim() || "Redefine Your Everyday Style";
  const heroSubtitle =
    settings?.heroSubtitle?.trim() ||
    "Curated contemporary apparel designed for comfort, confidence, and effortless elegance. Hand-picked fabrics tailored for every occasion.";
  const bannerImage = settings?.bannerImageUrl?.trim();
  const freeShippingThreshold = settings?.freeShippingThreshold ?? 500;
  const currency = settings?.currency || "INR";
  const currencySymbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : `${currency} `;

  const scrollToProducts = () => {
    if (onExploreClick) {
      onExploreClick();
      return;
    }
    const filterPanel = document.querySelector(".home-filter-panel") || document.querySelector(".home-products-panel");
    if (filterPanel) {
      filterPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="tenant-hero" aria-label="Storefront Hero Banner">
      <div className="tenant-hero__container">
        {/* Left: Text & CTAs */}
        <div className="tenant-hero__content">
          <div className="tenant-hero__badge">
            <span className="tenant-hero__badge-dot" />
            <span className="tenant-hero__badge-text">Welcome to {storeName}</span>
          </div>

          <h1 className="tenant-hero__title">{heroTitle}</h1>

          <p className="tenant-hero__subtitle">{heroSubtitle}</p>

          {/* Promotion / Free Shipping Pill */}
          <div className="tenant-hero__promo-pill">
            <FaTag className="tenant-hero__promo-icon" aria-hidden="true" />
            <span>
              Special Offer: Free delivery on all orders above{" "}
              <strong>
                {currencySymbol}
                {freeShippingThreshold}
              </strong>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="tenant-hero__actions">
            <button
              type="button"
              className="tenant-hero__btn-primary"
              onClick={scrollToProducts}
            >
              <span>Explore Collection</span>
              <FaArrowRight className="tenant-hero__btn-icon" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="tenant-hero__btn-secondary"
              onClick={scrollToProducts}
            >
              Latest Arrivals
            </button>
          </div>

          {/* Value Props / Trust Indicators */}
          <div className="tenant-hero__perks">
            <div className="tenant-hero__perk-item">
              <FaTruck className="tenant-hero__perk-icon" aria-hidden="true" />
              <span>Fast Shipping</span>
            </div>
            <div className="tenant-hero__perk-divider" />
            <div className="tenant-hero__perk-item">
              <FaShieldAlt className="tenant-hero__perk-icon" aria-hidden="true" />
              <span>100% Genuine</span>
            </div>
            <div className="tenant-hero__perk-divider" />
            <div className="tenant-hero__perk-item">
              <FaUndo className="tenant-hero__perk-icon" aria-hidden="true" />
              <span>Easy Exchanges</span>
            </div>
          </div>
        </div>

        {/* Right: Visual Artwork / Banner Image */}
        <div className="tenant-hero__media">
          {bannerImage ? (
            <div className="tenant-hero__image-wrapper">
              <img
                src={bannerImage}
                alt={`${storeName} Collection`}
                className="tenant-hero__image"
                onError={(e) => {
                  // Fallback gracefully to placeholder artwork if invalid URL
                  (e.target as HTMLElement).style.display = "none";
                  const fallback = (e.target as HTMLElement).parentElement?.querySelector(".tenant-hero__image-fallback");
                  if (fallback) (fallback as HTMLElement).style.display = "flex";
                }}
              />
              <div className="tenant-hero__image-fallback" style={{ display: "none" }}>
                <div className="tenant-hero__art-card">
                  <div className="tenant-hero__art-logo-pill">{storeName}</div>
                  <h3>Signature Clothing</h3>
                  <p>Quality Crafted Essentials</p>
                </div>
              </div>
              <div className="tenant-hero__floating-card">
                <span className="tenant-hero__floating-tag">Verified Store</span>
                <span className="tenant-hero__floating-name">{storeName}</span>
              </div>
            </div>
          ) : (
            <div className="tenant-hero__art-wrapper">
              <div className="tenant-hero__art-card">
                <div className="tenant-hero__art-pattern" />
                <div className="tenant-hero__art-badge">New Season</div>
                <div className="tenant-hero__art-logo-pill">{storeName}</div>
                <h3 className="tenant-hero__art-heading">Contemporary Apparel</h3>
                <p className="tenant-hero__art-sub">Tailored perfection designed for the modern wardrobe</p>
                <div className="tenant-hero__art-chips">
                  <span>Premium Cotton</span>
                  <span>Modern Fits</span>
                  <span>All Sizes</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
