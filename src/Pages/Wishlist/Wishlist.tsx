import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaHeart, FaTrash, FaShoppingBag, FaArrowRight } from "react-icons/fa";
import { RootState, AppDispatch } from "../../Store/ConfigureStore";
import { fetchWishlist, removeWishlistItem } from "../../Store/WishlistSlice";
import { WishlistItem } from "../../Types/Interface/IWishlist";
import { useToast } from "../../Utils/Helper/ToastNotifications";
import { getStoredToken } from "../../Utils/Helper/authHelpers";
import Loader from "../../Shared/Loader";
import "./Wishlist.css";

const Wishlist: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { storeSlug } = useParams<{ storeSlug?: string }>();
  const currentStoreSlug = storeSlug || "default";
  const { showToast } = useToast();

  const { items, loading } = useSelector((state: RootState) => state.wishlist);
  const token = getStoredToken();

  useEffect(() => {
    if (!token) {
      showToast("info", "Please sign in to view your wishlist.");
      navigate(`/store/${currentStoreSlug}/signin`);
      return;
    }
    dispatch(fetchWishlist());
  }, [dispatch, token, navigate, currentStoreSlug]);

  const handleRemove = async (e: React.MouseEvent, item: WishlistItem) => {
    e.stopPropagation();
    try {
      await dispatch(removeWishlistItem(item.productId)).unwrap();
      showToast("info", `${item.productName} removed from wishlist`);
    } catch {
      showToast("error", "Could not remove item from wishlist");
    }
  };

  const handleMoveToProduct = (item: WishlistItem) => {
    navigate(`/store/${currentStoreSlug}/product/${item.productId}`);
  };

  if (loading && items.length === 0) {
    return <Loader />;
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <div>
          <h1>My Wishlist</h1>
          <span className="wishlist-count-badge">
            {items.length} {items.length === 1 ? "item" : "items"} saved
          </span>
        </div>
        <Link to={`/store/${currentStoreSlug}`} className="wishlist-explore-btn" style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}>
          Continue Shopping <FaArrowRight />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="wishlist-empty">
          <FaHeart className="wishlist-empty-icon" />
          <h2>Your wishlist is empty</h2>
          <p>Explore our fashion collections and click the heart icon on any style to save it for later.</p>
          <Link to={`/store/${currentStoreSlug}`} className="wishlist-explore-btn">
            Explore Collections
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {items.map((item) => {
            const hasSale = item.salePrice != null && item.salePrice > 0 && item.salePrice < item.price;
            const currentPrice = hasSale ? item.salePrice : item.price;

            return (
              <div
                key={item.wishlistId}
                className="wishlist-card"
                onClick={() => handleMoveToProduct(item)}
              >
                <div className="wishlist-image-container">
                  <img
                    src={item.imageUrl || "/default-image.jpg"}
                    alt={item.productName}
                    className="wishlist-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/default-image.jpg";
                    }}
                  />
                  <button
                    type="button"
                    className="wishlist-remove-btn"
                    onClick={(e) => handleRemove(e, item)}
                    title="Remove from Wishlist"
                    aria-label={`Remove ${item.productName} from Wishlist`}
                  >
                    <FaTrash size={13} />
                  </button>
                </div>

                <div className="wishlist-card-content">
                  {item.brandName && <span className="wishlist-brand">{item.brandName}</span>}
                  <h3 className="wishlist-title" title={item.productName}>
                    {item.productName}
                  </h3>

                  <div className="wishlist-pricing">
                    <span className="wishlist-price">₹{currentPrice?.toFixed(2)}</span>
                    {hasSale && (
                      <span className="wishlist-original-price">₹{item.price.toFixed(2)}</span>
                    )}
                  </div>

                  <div className="wishlist-stock-status">
                    {!item.inStock ? (
                      <span className="stock-out">● Out of Stock</span>
                    ) : item.inventory <= 5 ? (
                      <span className="stock-low">⚡ Only {item.inventory} left in stock!</span>
                    ) : (
                      <span className="stock-in">✓ In Stock</span>
                    )}
                  </div>

                  <div className="wishlist-actions">
                    <button
                      type="button"
                      className="wishlist-move-cart-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveToProduct(item);
                      }}
                    >
                      <FaShoppingBag size={14} /> View & Select Size
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
