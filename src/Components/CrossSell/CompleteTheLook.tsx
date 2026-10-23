import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../Store/ConfigureStore";
import { Product } from "../../Types/Interface/IProduct";
import "./CompleteTheLook.css";

interface CompleteTheLookProps {
  currentProduct: Product;
}

const CompleteTheLook: React.FC<CompleteTheLookProps> = ({ currentProduct }) => {
  const navigate = useNavigate();
  const allProducts = useSelector(
    (state: RootState) => (state?.products?.list as Product[]) || []
  );

  // Filter out the current product
  const otherProducts = allProducts.filter(
    (p) => p.productId !== currentProduct.productId
  );

  if (otherProducts.length === 0) {
    return null;
  }

  // Pick complementary items: prefer different category or brand if available, up to 3
  const complementaryItems = otherProducts
    .sort((a, b) => {
      // Prioritize items from different category
      const aDiff = a.categoryId !== currentProduct.categoryId ? 1 : 0;
      const bDiff = b.categoryId !== currentProduct.categoryId ? 1 : 0;
      return bDiff - aDiff;
    })
    .slice(0, 3);

  if (complementaryItems.length === 0) return null;

  // Calculate bundle price
  const currentPrice =
    currentProduct.productVariants?.[0]?.salePrice ??
    currentProduct.productVariants?.[0]?.price ??
    0;

  const bundleTotal = complementaryItems.reduce((acc, item) => {
    const itemPrice =
      item.productVariants?.[0]?.salePrice ??
      item.productVariants?.[0]?.price ??
      0;
    return acc + itemPrice;
  }, currentPrice);

  return (
    <section className="complete-look-section" aria-label="Complete the look">
      <div className="complete-look-header">
        <div>
          <span className="complete-look-tag">✨ Curated Stylist Pairing</span>
          <h3 className="complete-look-title">Complete the Look</h3>
          <p className="complete-look-desc">
            Handpicked garments and styling pieces designed to complement your selection.
          </p>
        </div>
        <div className="bundle-offer-badge">
          <span>Get 20% OFF</span> on full outfit with coupon <strong>STYLE20</strong>
        </div>
      </div>

      <div className="complete-look-grid">
        {complementaryItems.map((item) => {
          const variant = item.productVariants?.[0];
          const imgUrl = variant?.image?.[0] || "/default-image.jpg";
          const price = variant?.salePrice ?? variant?.price ?? 0;
          const originalPrice = variant?.price;

          return (
            <div
              key={item.productId}
              className="look-item-card"
              onClick={() => {
                navigate(`/product/${item.productId}`);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigate(`/product/${item.productId}`);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            >
              <div className="look-image-wrapper">
                <img src={imgUrl} alt={item.name} className="look-item-img" />
                <span className="look-pair-badge">Pair with this</span>
              </div>
              <div className="look-item-details">
                <span className="look-item-brand">
                  {item.brandId ? `Designer Edition` : "Style Thread"}
                </span>
                <h4 className="look-item-name">{item.name}</h4>
                <div className="look-item-price-row">
                  <span className="look-item-price">₹{price.toFixed(2)}</span>
                  {originalPrice && originalPrice > price && (
                    <span className="look-item-original">
                      ₹{originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="look-view-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/product/${item.productId}`);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  View Piece →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bundle-summary-bar">
        <div className="bundle-info">
          <strong>Curated Wardrobe Bundle ({complementaryItems.length + 1} items)</strong>
          <span>
            Combined estimated value: <strong>₹{bundleTotal.toFixed(2)}</strong> (Use <strong>STYLE20</strong> at checkout to save up to ₹500)
          </span>
        </div>
      </div>
    </section>
  );
};

export default CompleteTheLook;
