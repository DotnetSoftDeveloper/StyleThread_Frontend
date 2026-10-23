import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaMinus, FaPlus, FaTrash } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";

import "./CartItems.css";
import { AppDispatch, RootState } from "../../Store/ConfigureStore";
import {
  fetchCart,
  removeCart,
  setCartList,
  updateCart
} from "../../Store/EntitySlices";
import { GenericResponse } from "../../Types/Interface/IGenericResponse";
import { CartItem } from "../../Types/Interface/ICart";
import { useToast } from "../../Utils/Helper/ToastNotifications";
import { getCartCount } from "../../Utils/Helper/cartHelpers";
import { Product } from "../../Types/Interface/IProduct";
import { useNavigate, useParams } from "react-router-dom";
import { getStoredToken } from "../../Utils/Helper/authHelpers";
import NoImageFound from "./../../Assests/NoImageFound.jpg";

interface CustomerData {
  iss: string;
  lastName?: string;
  sub: string;
  userId: string;
}

interface Props {
  cartItems: CartItem[];
  onNext: () => void;
}

const CartItems: React.FC<Props> = ({ cartItems, onNext }) => {
  const navigate = useNavigate();
  const { storeSlug } = useParams<{ storeSlug?: string }>();
  const currentStoreSlug = storeSlug || "default";
  const ref = useRef<LoadingBarRef | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const cartState = useSelector((state: RootState) => state.cartItem);
  const products = useSelector((state: RootState) => state.products.list);
  // adjust based on how you store products in redux

  const [loading, setLoading] = useState<boolean>(cartState.loading);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);

  /** 🔹 Sync local storage for cart state */
  const syncLocalStorage = (cart: CartItem[]) => {
    localStorage.setItem("cartItems", JSON.stringify(cart));
    const newCount = getCartCount(cart);
    localStorage.setItem("cartCount", newCount.toString());
  };

  /** 🔹 Update cart item quantity */
  const handleQuantityChange = async (
    cartId: number,
    productId: number,
    newQty: number
  ) => {
    if (newQty < 1 || newQty > 5) {
      return showToast("error", "Quantity must be between 1 and 5.");
    }

    try {
      const response = (await dispatch(
        updateCart({
          url: "/api/Cart",
          entity: { cartId, customerId, productId, quantity: newQty }
        })
      ).unwrap()) as GenericResponse<CartItem>;

      if (response && response.success && response.content) {
        const updatedItem = response.content;
        const updatedCart = cartItems.map((item) =>
          item.cartId === updatedItem.cartId ? updatedItem : item
        );

        dispatch(setCartList(updatedCart));
        syncLocalStorage(updatedCart);
        showToast("success", "Quantity updated successfully!");
      } else {
        showToast("error", response?.message || response?.error || "Failed to update quantity.");
      }
    } catch (err: any) {
      const msg = err?.message || err?.Message || "Failed to update quantity.";
      showToast("error", msg);
    } finally {
      ref.current?.complete();
      setLoading(false);
    }
  };

  /** 🔹 Remove cart item */
  const handleRemove = async (cartId: number) => {
    if (!customerId) return;

    try {
      const response = (await dispatch(
        removeCart({ cartId })
      ).unwrap()) as GenericResponse<CartItem[]>;
      if (response.success) {
        const updatedCart = cartItems.filter((item) => item.cartId !== cartId);
        dispatch(setCartList(updatedCart));
        syncLocalStorage(updatedCart);
        showToast("success", "Item removed from cart.");
      }
    } catch {
      showToast("error", "Failed to remove item.");
    } finally {
      ref.current?.complete();
      setLoading(false);
    }
  };

  /** 🔹 Decode token & fetch cart */
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setErrorMessage("Please log in to view your cart.");
      setLoading(false);
      return;
    }

    try {
      const clientData = jwtDecode<CustomerData>(token);
      const id = Number(clientData.userId);
      setCustomerId(id);

      const localCart = localStorage.getItem("cartItems");
      if (localCart) {
        const parsed = JSON.parse(localCart) as CartItem[];
        dispatch(setCartList(parsed));
      }

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
        })
        .catch(() => setErrorMessage("Failed to fetch cart."));
    } catch {
      setErrorMessage("Invalid session. Please log in again.");
    } finally {
      ref.current?.complete();
      setLoading(false);
    }
  }, [dispatch]);

  /** 🔹 Render states */
  if (loading) return <LoadingBar color="#f11946" ref={ref} />;
  if (errorMessage) return <p className="error">{errorMessage}</p>;

  const getProductForCartItem = (productId: number): Product | undefined => {
    if (Array.isArray(products)) {
      return products.find((p: Product) => p.productId === productId);
    }
    return (products as any)?.productId === productId ? (products as any) : undefined;
  };

  const hasAnyOutOfStockItems = cartItems.some((item) => {
    const product = getProductForCartItem(item.productId);
    const variant = product?.productVariants?.[0];
    const stock = variant?.inventory ?? 0;
    return stock <= 0 || item.quantity > stock;
  });

  return (
    <div>
      <div className="cart-items-section">
        <div className="cart-items-heading">
          <div>
            <h2>Items in your bag</h2>
            <p>Review your selections before delivery.</p>
          </div>
          <span className="cart-items-count">{cartItems.length} items</span>
        </div>

        {hasAnyOutOfStockItems && (
          <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", color: "#be123c", fontSize: "0.92rem", fontWeight: 500 }}>
            ⚠️ Some items in your bag are currently out of stock or exceed available quantity. Please adjust quantities or remove them to proceed.
          </div>
        )}

        {cartItems.length > 0 ? (
          <div className="cart-items-list">
            {cartItems.map((item, index) => {
              const product = getProductForCartItem(item.productId);
              const variant = product?.productVariants?.[0];
              const itemStock = variant?.inventory ?? 0;
              const isItemOutOfStock = itemStock <= 0;
              const isQuantityExceeded = !isItemOutOfStock && item.quantity > itemStock;

              const itemPrice = variant?.salePrice ?? variant?.price ?? 100;
              const itemImage = variant?.image?.[0] || NoImageFound;

              return (
                <div
                  className="cart-item"
                  key={item.cartId}
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <div
                    className="cart-item-info clickable"
                    onClick={() => navigate(`/product/${item.productId}`)}
                  >
                    <img
                      src={itemImage}
                      alt={product?.name || `Product #${item.productId}`}
                      className="cart-item-image"
                    />
                    <div className="cart-item-details">
                      <h4>{product?.name || `Product #${item.productId}`}</h4>
                      <p>₹{itemPrice}</p>
                      {isItemOutOfStock ? (
                        <span style={{ display: "inline-block", background: "#fee2e2", color: "#b91c1c", padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem", fontWeight: 700, marginTop: "4px" }}>
                          Out of Stock
                        </span>
                      ) : isQuantityExceeded ? (
                        <span style={{ display: "inline-block", background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem", fontWeight: 700, marginTop: "4px" }}>
                          ⚠️ Only {itemStock} available
                        </span>
                      ) : itemStock <= 5 ? (
                        <span style={{ display: "inline-block", background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem", fontWeight: 600, marginTop: "4px" }}>
                          ⚡ Only {itemStock} left in stock
                        </span>
                      ) : (
                        <span style={{ display: "inline-block", color: "#16a34a", fontSize: "0.8rem", fontWeight: 500, marginTop: "4px" }}>
                          ✓ In Stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="cart-item-actions">
                    <div className="quantity-control-group">
                      <span className="quantity-control-label">Quantity</span>
                      <div className="quantity-controls">
                        <button
                          aria-label="Decrease quantity"
                          onClick={() =>
                            handleQuantityChange(
                              item.cartId,
                              item.productId,
                              item.quantity - 1
                            )
                          }
                          disabled={item.quantity === 1}
                        >
                          <FaMinus />
                        </button>

                        <input type="number" value={item.quantity} readOnly aria-label="Quantity" />

                        <button
                          aria-label="Increase quantity"
                          onClick={() =>
                            handleQuantityChange(
                              item.cartId,
                              item.productId,
                              item.quantity + 1
                            )
                          }
                          disabled={item.quantity >= 5 || item.quantity >= itemStock || isItemOutOfStock}
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </div>
                    <button
                      className="delete-btn"
                      aria-label="Remove item"
                      title="Remove item"
                      onClick={() => handleRemove(item.cartId)}
                    >
                      <FaTrash />
                    </button>
                  </div>

                  <div className="cart-item-total">
                    <span>Item total</span>
                    <strong>
                      ₹{(itemPrice * item.quantity).toFixed(2)}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-cart">
            <img
              src="https://assets9.lottiefiles.com/packages/lf20_j1adxtyb.json"
              alt="Empty Cart"
              className="empty-cart-animation"
            />
            <h3>Your cart is empty</h3>
            <p>Looks like you haven’t added anything yet.</p>
            <button
              className="explore-btn"
              onClick={() => navigate(`/store/${currentStoreSlug}`)}
            >
              Explore Products →
            </button>
          </div>
        )}
      </div>

      <div className="cart-footer">
        <button 
          className="place-order-btn" 
          onClick={onNext}
          disabled={hasAnyOutOfStockItems}
          style={hasAnyOutOfStockItems ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
          title={hasAnyOutOfStockItems ? "Please remove or adjust out-of-stock items before placing your order" : undefined}
        >
          {hasAnyOutOfStockItems ? "Items Unavailable in Bag" : "Place Order →"}
        </button>
      </div>
    </div>
  );
};

export default CartItems;
