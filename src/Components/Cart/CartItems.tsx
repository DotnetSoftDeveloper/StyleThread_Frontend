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
import NoImageFound from "./../../Assests/NoImageFound.jpg";
import { Product } from "../../Types/Interface/IProduct";
import { useNavigate } from "react-router-dom";

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

      if (response.success && response.content) {
        const updatedItem = response.content;
        const updatedCart = cartItems.map((item) =>
          item.cartId === updatedItem.cartId ? updatedItem : item
        );

        dispatch(setCartList(updatedCart));
        syncLocalStorage(updatedCart);
        showToast("success", "Quantity updated successfully!");
      }
    } catch {
      showToast("error", "Failed to update quantity.");
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
    const token = localStorage.getItem("auth");
    if (!token) {
      setErrorMessage("Please log in to view your cart.");
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

        {cartItems.length > 0 ? (
          <div className="cart-items-list">
            {cartItems.map((item, index) => {
              let product: Product | undefined;

              if (Array.isArray(products)) {
                product = products.find(
                  (p: Product) => p.productId === item.productId
                );
              } else {
                product =
                  products.productId === item.productId ? products : undefined;
              }

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
                      src={
                        product?.productVariants?.find(
                          (x) => x.productId == item.productId
                        )?.image[0] || NoImageFound
                      }
                      alt={product?.name || `Product #${item.productId}`}
                      className="cart-item-image"
                    />
                    <div className="cart-item-details">
                      <h4>{product?.name || `Product #${item.productId}`}</h4>
                      <p>
                        ₹
                        {product?.productVariants?.find(
                          (x) => x.productId == item.productId
                        )?.price || 100}
                      </p>
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
                          disabled={item.quantity === 5}
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
                  {/* </div>
                  </div> */}

                  <div className="cart-item-total">
                    <span>Item total</span>
                    <strong>
                      ₹
                      {(
                        (product?.productVariants?.find(
                          (x) => x.productId == item.productId
                        )?.price || 100) * item.quantity
                      ).toFixed(2)}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-cart">
            <img
              src="https://assets9.lottiefiles.com/packages/lf20_j1adxtyb.json" // Example Lottie animation
              alt="Empty Cart"
              className="empty-cart-animation"
            />
            <h3>Your cart is empty</h3>
            <p>Looks like you haven’t added anything yet.</p>
            <button
              className="explore-btn"
              onClick={() => navigate("/home")}
            >
              Explore Products →
            </button>
          </div>
        )}
      </div>

      <div className="cart-footer">
        <button className="place-order-btn" onClick={onNext}>
          Place Order →
        </button>
      </div>
    </div>
  );
};

export default CartItems;
