import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { AppDispatch, RootState } from "../../Store/ConfigureStore";
import { CartItem } from "../../Types/Interface/ICart";
import CartItems from "../../Components/Cart/CartItems";
import AddressSelection from "../../Components/Cart/AddressSelection";
import OrderReview from "../../Components/Cart/OrderReview";
import RatesBreakdown from "../../Components/Cart/RatesBreakdown";
import Lottie from "lottie-react";
import emptyCart from "./../../Assests/NoCartItem.json";
import "./Cart.css";
import { Product } from "../../Types/Interface/IProduct";
import { fetchCart, fetchProducts, setCartList } from "../../Store/EntitySlices";
import { getStoredToken } from "../../Utils/Helper/authHelpers";
import { getCartCount } from "../../Utils/Helper/cartHelpers";
import { GenericResponse } from "../../Types/Interface/IGenericResponse";

type Step = "cart" | "address" | "review";

interface CustomerTokenPayload {
  userId: string;
  sub: string;
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { storeSlug } = useParams<{ storeSlug?: string }>();
  const currentStoreSlug = storeSlug || "default";
  const dispatch = useDispatch<AppDispatch>();

  const [loading, setLoading] = useState<boolean>(true);
  const [step, setStep] = useState<Step>("cart");
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  const cartItems: CartItem[] = useSelector(
    (state: RootState) => (state.cartItem?.list as CartItem[]) || []
  );

  const products = useSelector(
    (state: RootState) => state?.products?.list || []
  ) as Product[];

  // Demo addresses
  const [addresses, setAddresses] = useState<string[]>([
    "123 Main Street, New York, NY 10001, USA",
    "456 Park Avenue, San Francisco, CA 94107, USA"
  ]);

  // Sync cart to localStorage
  const syncLocalStorage = (cart: CartItem[]) => {
    localStorage.setItem("cartItems", JSON.stringify(cart));
    const newCount = getCartCount(cart);
    localStorage.setItem("cartCount", newCount.toString());
  };

  // Hydrate cart and products on mount
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      navigate(`/store/${currentStoreSlug}/signin`);
      return;
    }

    try {
      const payload = jwtDecode<CustomerTokenPayload>(token);
      const customerId = Number(payload.userId);

      // 1. Initial cached local items if available
      const localCart = localStorage.getItem("cartItems");
      if (localCart) {
        try {
          const parsed = JSON.parse(localCart) as CartItem[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            dispatch(setCartList(parsed));
          }
        } catch {
          // ignore corrupted local storage
        }
      }

      // 2. Fetch fresh cart from server
      const loadData = async () => {
        try {
          const res = (await dispatch(
            fetchCart({ customerId })
          ).unwrap()) as GenericResponse<CartItem[] | CartItem>;

          if (res?.success && res.content) {
            const list = Array.isArray(res.content) ? res.content : [res.content];
            dispatch(setCartList(list));
            syncLocalStorage(list);
          } else if (res?.success && !res.content) {
            dispatch(setCartList([]));
            syncLocalStorage([]);
          }
        } catch (err) {
          console.error("Failed to fetch fresh cart:", err);
        }

        // 3. Ensure products are loaded for pricing and images
        if (!products || products.length === 0) {
          try {
            await dispatch(fetchProducts(undefined));
          } catch (err) {
            console.error("Failed to load products for cart:", err);
          }
        }

        setLoading(false);
      };

      loadData();
    } catch (err) {
      console.error("Error decoding token in Cart:", err);
      setLoading(false);
    }
  }, [dispatch, navigate]);

  // Price calculations
  const subtotal = (cartItems || []).reduce((sum, cartItem) => {
    const product = Array.isArray(products)
      ? products.find((p) => p.productId === cartItem.productId)
      : undefined;

    const variant = product?.productVariants?.[0];
    const price = variant?.salePrice ?? variant?.price ?? 100;
    return sum + (cartItem.quantity * price);
  }, 0);

  const shippingCost = subtotal > 500 || subtotal === 0 ? 0 : 50;
  const tax = subtotal * 0.18;
  const total = subtotal + shippingCost + tax;

  // Loading state
  if (loading) {
    return (
      <div className="cart-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#4b5563", fontSize: "1.1rem", fontWeight: 500 }}>Loading your bag...</p>
        </div>
      </div>
    );
  }

  // Empty Cart UI (only when confirmed loaded and empty)
  if (!loading && (!cartItems || cartItems.length === 0)) {
    return (
      <div className="empty-cart" style={{ minHeight: "65vh" }}>
        <div className="empty-cart-content">
          <Lottie
            animationData={emptyCart}
            loop={true}
            className="empty-cart-animation"
          />

          <h2>Your Cart is Empty</h2>
          <p>Looks like you haven’t added anything to your cart yet.</p>

          <button
            className="explore-btn"
            onClick={() => navigate(`/store/${currentStoreSlug}`)}
          >
            Explore Products
          </button>
        </div>
      </div>
    );
  }

  const hasOutOfStockItems = cartItems.some((item) => {
    const prod = Array.isArray(products)
      ? products.find((p) => p.productId === item.productId)
      : undefined;
    const v = prod?.productVariants?.[0];
    const stock = v?.inventory ?? 0;
    return stock <= 0 || item.quantity > stock;
  });

  const handleProceedToAddress = () => {
    if (hasOutOfStockItems) {
      return;
    }
    setStep("address");
  };

  return (
    <div className="cart-page">
      <header className="cart-page__header">
        <div>
          <p className="cart-page__eyebrow">Secure checkout</p>
          <h1>Your shopping bag</h1>
          <p className="cart-page__subtitle">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} ready for checkout
          </p>
        </div>
        <ol className="checkout-steps" aria-label="Checkout progress">
          {[
            ["cart", "Bag"],
            ["address", "Delivery"],
            ["review", "Review"]
          ].map(([stepName, label], index) => (
            <li
              key={stepName}
              className={step === stepName ? "is-active" : index < ["cart", "address", "review"].indexOf(step) ? "is-complete" : ""}
            >
              <span>{index + 1}</span>
              {label}
            </li>
          ))}
        </ol>
      </header>
      <div className="cart-main">
        {step === "cart" && (
          <CartItems cartItems={cartItems} onNext={handleProceedToAddress} />
        )}

        {step === "address" && (
          <AddressSelection
            addresses={addresses}
            selectedAddress={selectedAddress}
            onSelect={setSelectedAddress}
            onSaveAddress={(addr) => setAddresses([...addresses, addr])}
            onNext={() => setStep("review")}
            onBack={() => setStep("cart")}
          />
        )}

        {step === "review" && (
          <OrderReview
            cartItems={cartItems}
            total={total}
            subtotal={subtotal}
            shippingCost={shippingCost}
            tax={tax}
            address={selectedAddress}
            onBack={() => setStep("address")}
          />
        )}
      </div>

      {/* Sidebar for rates breakdown */}
      <div className="cart-sidebar">
        <RatesBreakdown
          subtotal={subtotal}
          shippingCost={shippingCost}
          tax={tax}
          total={total}
        />
      </div>
    </div>
  );
};

export default Cart;
