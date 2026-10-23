import React, { useState, useEffect } from "react";
import './ProductCard.css';
import { Product } from "../../Types/Interface/IProduct";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../Store/ConfigureStore";
import { toggleWishlistAction } from "../../Store/WishlistSlice";
import { useToast } from "../../Utils/Helper/ToastNotifications";
import { getStoredToken } from "../../Utils/Helper/authHelpers";
import { useNavigate, useParams } from "react-router-dom";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { getRatingSummariesMap } from "../../Services/reviewService";
import { ProductRatingSummary } from "../../Types/Interface/IReview";

interface ProductCardProps{
  product: Product;
  colorOptions?: { colorId: number; colorName: string }[];
  onCardClick:(product: Product)=>void;
}

type ProductVariantWithColor = Product["productVariants"][number] & {
  color?: { colorName?: string };
};

const ProductCard:React.FC<ProductCardProps> = ({ product, colorOptions = [], onCardClick }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { storeSlug } = useParams<{ storeSlug?: string }>();
  const currentStoreSlug = storeSlug || "default";
  const { showToast } = useToast();
  const token = getStoredToken();

  const wishlistIds = useSelector((state: RootState) => state.wishlist?.itemIds || []);
  const isWishlisted = wishlistIds.includes(product.productId);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [ratingSummary, setRatingSummary] = useState<ProductRatingSummary | null>(null);
  const images = product?.productVariants?.[0]?.image || [];

  const totalStock = product?.productVariants?.reduce(
    (sum, v) => sum + (v.inventory ?? 0),
    0
  ) ?? 0;

  useEffect(() => {
    let isMounted = true;
    getRatingSummariesMap().then((map) => {
      if (isMounted && map[product.productId]) {
        setRatingSummary(map[product.productId]);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [product.productId]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (hovered && images.length > 1) {
      intervalId = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
      }, 1000); // Change image every second
    }

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [hovered, images.length]);

  const handleMouseEnter = () => setHovered(true);

  const handleMouseLeave = () => {
    setHovered(false);
    setCurrentImageIndex(0);
  };

  const handleClick = () => {
    onCardClick(product); // Pass the product object to the onCardClick function
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) {
      showToast("info", "Please sign in to save items to your wishlist.");
      navigate(`/store/${currentStoreSlug}/signin`);
      return;
    }

    try {
      const primaryVariant = product.productVariants?.[0];
      await dispatch(
        toggleWishlistAction({
          productId: product.productId,
          item: {
            wishlistId: 0,
            productId: product.productId,
            productName: product.name,
            productDescription: product.description,
            price: primaryVariant?.price ?? 0,
            salePrice: primaryVariant?.salePrice,
            imageUrl: primaryVariant?.image?.[0],
            inventory: totalStock,
            inStock: totalStock > 0
          }
        })
      ).unwrap();

      showToast(
        "success",
        isWishlisted ? "Removed from wishlist" : "Saved to your wishlist!"
      );
    } catch {
      showToast("error", "Failed to update wishlist");
    }
  };

  const variant = product?.productVariants?.[0] as ProductVariantWithColor | undefined;
  const colorName = variant?.colorName
    ?? variant?.color?.colorName
    ?? colorOptions.find((color) => color.colorId === variant?.colorId)?.colorName;

  return (
    <div
      className="card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Wishlist toggle button */}
      <button
        type="button"
        className={`card-wishlist-btn ${isWishlisted ? "card-wishlist-btn--active" : ""}`}
        onClick={handleWishlistToggle}
        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        {isWishlisted ? (
          <FaHeart className="card-wishlist-heart" />
        ) : (
          <FaRegHeart className="card-wishlist-heart" />
        )}
      </button>

      {/* Stock pill indicator */}
      {totalStock === 0 ? (
        <span className="card-stock-pill card-stock-pill--out">Sold Out</span>
      ) : totalStock <= 5 ? (
        <span className="card-stock-pill card-stock-pill--low">Only {totalStock} left</span>
      ) : null}

      {images.length > 0 && (
        <img
          className="card-img-top"
          src={images[currentImageIndex]}
          alt={product.name}
        />
      )}

      <div className="card-body product-card-body">
        <div className="card-meta-row">
          <span className="sponsored">Sponsored</span>
          {ratingSummary && ratingSummary.totalReviews > 0 ? (
            <span
              className="card-rating-badge"
              title={`${ratingSummary.averageRating} out of 5 (${ratingSummary.totalReviews} reviews)`}
            >
              <FaStar className="card-star-icon" />
              <span className="card-rating-num">{ratingSummary.averageRating.toFixed(1)}</span>
              <span className="card-rating-count">({ratingSummary.totalReviews})</span>
            </span>
          ) : (
            <span className="card-rating-badge card-rating-badge--new">
              <FaStar className="card-star-icon card-star-icon--muted" />
              <span className="card-rating-num">New</span>
            </span>
          )}
        </div>
        <p className="card-text">{product.description || product.name}</p>
        <p className="product-colour">Color: <span>{colorName || "Not specified"}</span></p>
        <div className="product-pricing">
          <span className="sale-price">₹{variant?.salePrice ?? "—"}</span>
          {variant?.price != null && <span className="original-price">₹{variant.price}</span>}
          {variant?.discount != null && <span className="discount">{variant.discount}% off</span>}
        </div>
        <span className="delivery-text">Free Delivery</span>
      </div>
    </div>
  );
};

export default ProductCard;
