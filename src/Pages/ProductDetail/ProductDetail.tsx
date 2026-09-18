import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../../Shared/Loader";
import ProductCard from "../../Components/ProductCard/ProductCard";
import "./ProductDetail.css";
import { AppDispatch, RootState } from "../../Store/ConfigureStore";
import {
  Product,
  ProductVariant,
  ProductVariantSize
} from "../../Types/Interface/IProduct";
import { jwtDecode } from "jwt-decode";
import { CartItem } from "../../Types/Interface/ICart";
import { GenericResponse } from "../../Types/Interface/IGenericResponse";
import { useToast } from "../../Utils/Helper/ToastNotifications";
import {
  addToCart,
  fetchCart,
  fetchProducts,
  updateCart,
  removeCart,
  setCartList
} from "../../Store/EntitySlices";
import { getCartCount } from "../../Utils/Helper/cartHelpers";

interface CustomerData {
  iss: string;
  sub: string;
  userId: string;
  lastName?: string;
}

const ProductDetail: React.FC = () => {
  const { showToast } = useToast();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [loading, setLoading] = useState<boolean>(true);
  const [customerId, setCustomerId] = useState<number | null>(null);

  const productData = useSelector(
    (state: RootState) => state?.products?.list || []
  ) as Product[];

  const cartItems = useSelector(
    (state: RootState) => state.cartItem.list
  ) as CartItem[];

  const productId = id ? parseInt(id, 10) : 0;
  const fetchProduct = productData.find((item) => item.productId === productId);

  const existingCartItem = cartItems.find(
    (item) => item.productId === fetchProduct?.productId
  );

  const [selectedColorVariant, setSelectedColorVariant] =
    useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductVariantSize | null>(
    null
  );
  const [sizeSelectionError, setSizeSelectionError] = useState<boolean>(false);

  /** 🔹 Sync local storage */
  const syncLocalStorage = (cart: CartItem[]) => {
    localStorage.setItem("cartItems", JSON.stringify(cart));
    const newCount = getCartCount(cart);
    localStorage.setItem("cartCount", newCount.toString());
  };

  /** 🔹 Hydrate products */
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        if (!productData.length) {
          await dispatch(fetchProducts(undefined));
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [dispatch, productData]);

  /** 🔹 Hydrate cart */
  useEffect(() => {
    const token = localStorage.getItem("auth");
    if (!token) return;

    try {
      const clientData = jwtDecode<CustomerData>(token);
      const id = Number(clientData.userId);
      setCustomerId(id);

      // Load cart from localStorage
      const localCart = localStorage.getItem("cartItems");
      if (localCart) {
        const parsed = JSON.parse(localCart) as CartItem[];
        dispatch(setCartList(parsed));
      }

      // Always fetch fresh cart
      dispatch(fetchCart({ customerId: id }))
        .unwrap()
        .then((res: GenericResponse<CartItem | CartItem[]>) => {
          if (res?.success && res?.content) {
            const cartItems = Array.isArray(res.content)
              ? res.content
              : [res.content];
            dispatch(setCartList(cartItems));
            syncLocalStorage(cartItems);
          }
        });
    } catch (err) {
      console.error("Error hydrating cart:", err);
    }
  }, [dispatch]);

  /** 🔹 Default variant */
  useEffect(() => {
    if (fetchProduct) {
      const defaultVariant = fetchProduct.productVariants?.[0];
      setSelectedColorVariant(defaultVariant || null);
      setSelectedImage(defaultVariant?.image?.[0] || null);
    }
  }, [fetchProduct]);

  const handleColorSelect = (variant: ProductVariant) => {
    setSelectedColorVariant(variant);
    setSelectedImage(variant?.image?.[0] || null);
    setSelectedSize(null);
  };

  const handleSizeSelect = (size: ProductVariantSize) => {
    setSelectedSize(size);
    setSizeSelectionError(false);
  };

  const handleAddToCart = async () => {
    if (!selectedSize || !fetchProduct || !selectedColorVariant) {
      setSizeSelectionError(true);
      return;
    }
    if (!customerId) {
      showToast("error", "Please login first.");
      navigate("/signin");
      return;
    }

    try {
      const entity: CartItem = {
        cartId: existingCartItem?.cartId || 0,
        customerId,
        productId: fetchProduct.productId,
        quantity: (existingCartItem?.quantity || 0) + 1
      };

      if (entity.quantity > 5) {
        return showToast("info", "You can only add up to 5 items.");
      }

      const response = (await dispatch(
        existingCartItem
          ? updateCart({ url: `/api/Cart/${entity.cartId}`, entity })
          : addToCart({ url: "/api/Cart", entity })
      ).unwrap()) as GenericResponse<CartItem | CartItem[]>;

      if (response.success) {
        await dispatch(fetchCart({ customerId }));
        const refreshedCart = (await dispatch(
          fetchCart({ customerId })
        ).unwrap()) as GenericResponse<CartItem[]>;
        if (refreshedCart.success && refreshedCart.content) {
          const cartArray = Array.isArray(refreshedCart.content)
            ? refreshedCart.content
            : [refreshedCart.content];
          dispatch(setCartList(cartArray));
          syncLocalStorage(cartArray);
        }
        showToast(
          "success",
          existingCartItem ? "Quantity updated!" : "Item added to cart!"
        );
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      showToast("error", "Could not add item to cart.");
    }
  };

  const handleDecreaseQuantity = async () => {
    if (!existingCartItem || !customerId) return;

    if (existingCartItem.quantity === 1) {
      try {
        const updatedCart = cartItems.filter(
          (item) => item.cartId !== existingCartItem.cartId
        );
        dispatch(setCartList(updatedCart));
        syncLocalStorage(updatedCart);

        const cartId = existingCartItem.cartId
        const response = (await dispatch(
          removeCart({cartId})
        ).unwrap()) as GenericResponse<CartItem[]>;

        if (response.success) showToast("info", "Item removed from cart");
      } catch {
        showToast("error", "Failed to remove item.");
      }
    } else {
      try {
        const updatedEntity: CartItem = {
          ...existingCartItem,
          quantity: existingCartItem.quantity - 1
        };

        const updatedCart = cartItems.map((item) =>
          item.cartId === updatedEntity.cartId ? updatedEntity : item
        );
        dispatch(setCartList(updatedCart));
        syncLocalStorage(updatedCart);

        const response = (await dispatch(
          updateCart({
            url: `/api/Cart/${updatedEntity.cartId}`,
            entity: updatedEntity
          })
        ).unwrap()) as GenericResponse<CartItem>;

        if (response.success) showToast("success", "Quantity updated!");
      } catch {
        showToast("error", "Failed to update quantity.");
      }
    }

    // 🔹 Refresh cart from backend
    await dispatch(fetchCart({ customerId }));
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    if (selectedSize) navigate("/cart");
  };

  const handleCardClick = (product: Product) => {
    navigate(`/product/${product.productId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="center-loader">
        <Loader />
      </div>
    );
  }

  if (!fetchProduct) return <div>Product not found</div>;

  const relatedProducts = productData.filter(
    (item) => item.productId !== fetchProduct.productId
  );

  return (
    <>
      <main className="product-detail-page">
        <section className="product-gallery" aria-label={`${fetchProduct.name} images`}>
          <div className="main-image">
            <img src={selectedImage || "/default-image.jpg"} alt={fetchProduct.name} />
          </div>
          <div className="thumbnail-images" aria-label="Choose a product image">
            {selectedColorVariant?.image?.map((img, index) => (
              <button
                key={index}
                className={`thumbnail ${selectedImage === img ? "thumbnail--active" : ""}`}
                onClick={() => setSelectedImage(img)}
                aria-label={`Show image ${index + 1}`}
              >
                <img src={img} alt="" />
              </button>
            ))}
          </div>
        </section>

        <section className="product-info">
          <p className="product-info__eyebrow">Style Thread collection</p>
          <div className="product-info__heading">
            <h1>{fetchProduct.name}</h1>
            {typeof selectedColorVariant?.discount === "number" && selectedColorVariant.discount > 0 && (
              <span className="product-info__discount">{selectedColorVariant.discount}% off</span>
            )}
          </div>
          <p className="product-info__description">{fetchProduct.description}</p>

          <div className="price" aria-label="Product price">
            <strong>₹{selectedColorVariant?.salePrice ?? selectedColorVariant?.price ?? "—"}</strong>
            {selectedColorVariant?.price != null && selectedColorVariant.price !== selectedColorVariant.salePrice && (
              <span className="original-price">₹{selectedColorVariant.price}</span>
            )}
            <span className="price-note">Inclusive of all taxes</span>
          </div>

          <div className="color-options">
            <div className="option-heading">
              <span>Colour</span>
              {selectedColorVariant?.colorName && <small>{selectedColorVariant.colorName}</small>}
            </div>
            <div className="color-swatches" role="list" aria-label="Available colours">
              {fetchProduct.productVariants?.map((variant, index) => (
                <button
                  key={index}
                  type="button"
                  className={`color-swatch ${selectedColorVariant?.productVariantId === variant.productVariantId ? "color-swatch--active" : ""}`}
                  onClick={() => handleColorSelect(variant)}
                  aria-label={`Select ${variant.colorName || `colour ${index + 1}`}`}
                  aria-pressed={selectedColorVariant?.productVariantId === variant.productVariantId}
                >
                  <img src={variant.image?.[0] || "/default-image.jpg"} alt="" />
                </button>
              ))}
            </div>
          </div>

          <div className="size-options">
            <div className="option-heading">
              <span>Choose size</span>
              <small>{selectedColorVariant?.inventory ?? 0} available</small>
            </div>
            <div className="sizes">
              {selectedColorVariant?.productVariantSizes?.map(
                (sizeObj, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`size ${
                      selectedSize?.sizeId === sizeObj.sizeId ? "selected" : ""
                    }`}
                    onClick={() => handleSizeSelect(sizeObj)}
                  >
                    {sizeObj.size.sizeName}
                  </button>
                )
              )}
            </div>
            {sizeSelectionError && (
              <p className="error-message">Please select a size.</p>
            )}
          </div>

          <div className="actions" aria-label="Purchase actions">
            {!existingCartItem || existingCartItem.quantity <= 0 ? (
              <>
                <button type="button" className="add-to-cart" onClick={handleAddToCart}>
                  Add to Cart
                </button>
                <button type="button" className="buy-now" onClick={handleBuyNow}>
                  Buy Now
                </button>
              </>
            ) : (
              <div className="quantity-control">
                <button type="button" onClick={handleDecreaseQuantity} aria-label="Remove one item">−</button>
                <span>{existingCartItem.quantity}</span>
                <button
                  onClick={handleAddToCart}
                  disabled={existingCartItem.quantity >= 5}
                  type="button"
                  aria-label="Add one item"
                >
                  +
                </button>
              </div>
            )}
          </div>

          <div className="accordion" aria-label="Product information">
            <details open>
              <summary>Details</summary>
              <p>{fetchProduct.description}</p>
            </details>
            <details>
              <summary>Shipping & Returns</summary>
              <p>Free returns within 30 days.</p>
            </details>
            <details>
              <summary>Specifications</summary>
              <ul>{/* optional specs */}</ul>
            </details>
          </div>
        </section>
      </main>

      <section className="related-products">
        <div className="related-products__heading">
          <div>
            <p>More to explore</p>
            <h2>You may also like</h2>
          </div>
        </div>
        <div className="rowDesign">
          {relatedProducts.map((product, index) => (
            <ProductCard
              key={index}
              product={product}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      </section>
    </>
  );
};

export default ProductDetail;
