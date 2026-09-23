import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../Store/ConfigureStore";
import { CartItem } from "../../Types/Interface/ICart";
import CartItems from "../../Components/Cart/CartItems";
import AddressSelection from "../../Components/Cart/AddressSelection";
import OrderReview from "../../Components/Cart/OrderReview";
import RatesBreakdown from "../../Components/Cart/RatesBreakdown";
import Lottie from "lottie-react";
import emptyCart from "./../../Assests/NoCartItem.json";
import "./Cart.css";
import { Product } from "../../Types/Interface/IProduct";

type Step = "cart" | "address" | "review";

const Cart: React.FC = () => {
  const cartItems: CartItem[] = useSelector(
    (state: RootState) => state.cartItem.list as CartItem[]
  );

  const [step, setStep] = useState<Step>("cart");
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const products = useSelector(
    (state: RootState) => state?.products?.list || []
  ) as Product[];

  const subtotal = cartItems.reduce((sum, cartItem) => {
  // Find product
  const product = products.find((p) => p.productId === cartItem.productId);

  // Find correct variant inside product
  const variant = product?.productVariants.find(
    (v) => v.productId === cartItem.productId // ✅ use variantId, not productId
  );

  // Add to subtotal
  return sum + (cartItem.quantity * (variant?.salePrice ?? 0));
}, 0);
  // ✅ Price calculations
  // const subtotal = cartItems.reduce(
  //   (sum, item) => sum + item.quantity * variant?.salePrice,
  //   0
  // );
  const shippingCost = subtotal > 500 ? 0 : 50;
  const tax = subtotal * 0.18;
  const total = subtotal + shippingCost + tax;

  // ✅ Demo addresses
  const [addresses, setAddresses] = useState<string[]>([
    "123 Main Street, New York, NY 10001, USA",
    "456 Park Avenue, San Francisco, CA 94107, USA"
  ]);

  // ✅ Empty Cart UI
  if (cartItems.length === 0) {
    return (
      <div className="empty-cart">
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
            onClick={() => (window.location.href = "/home")}
          >
            Explore Products
          </button>
        </div>
      </div>
    );
  }

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
          <CartItems cartItems={cartItems} onNext={() => setStep("address")} />
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

      {/* ✅ Sidebar for rates breakdown */}
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
