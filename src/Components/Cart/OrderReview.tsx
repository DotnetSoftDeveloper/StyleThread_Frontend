import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartItem } from "../../Types/Interface/ICart";
import "./OrderReview.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../Store/ConfigureStore";
import { Product } from "../../Types/Interface/IProduct";
import { DropdownOptions } from "../../Types/Interface/DropDown";
import {
  getPaymentErrorMessage,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../../Services/paymentService";
import { RazorpayConstructor } from "../../Types/Interface/Razorpay";
import { useToast } from "../../Utils/Helper/ToastNotifications";
import { clearCartList, removeCart } from "../../Store/EntitySlices";
import { GenericResponse } from "../../Types/Interface/IGenericResponse";

type ProductVariantWithColor = Product["productVariants"][number] & {
  color?: { colorName?: string };
};

interface Props {
  cartItems: CartItem[];
  total: number;
  address: string | null;
  onBack: () => void;
}

const OrderReview: React.FC<Props> = ({
  cartItems,
  total,
  address,
  onBack
}) => {
  // const cartState = useSelector((state: RootState) => state.cartItem);

  const products = useSelector(
    (state: RootState) => state?.products?.list || []
  ) as Product[];
  const dropdowns = useSelector((state: RootState) => {
    const list = state.addProducts?.list;
    return (Array.isArray(list) ? list[0] : list) as DropdownOptions | undefined;
  });
  const { showToast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentNeedsReview, setPaymentNeedsReview] = useState(false);
  const paymentInProgress = useRef(false);
  const checkoutCompleted = useRef(false);

  const completePaymentAttempt = () => {
    paymentInProgress.current = false;
    setIsProcessingPayment(false);
  };

  const clearPaidCart = async (): Promise<boolean> => {
    try {
      const results = await Promise.all(
        cartItems.map(async ({ cartId }) => {
          const response = (await dispatch(removeCart({ cartId })).unwrap()) as GenericResponse<unknown>;
          return response.success;
        }),
      );

      if (!results.every(Boolean)) return false;

      dispatch(clearCartList());
      localStorage.setItem("cartItems", "[]");
      localStorage.setItem("cartCount", "0");
      return true;
    } catch {
      return false;
    }
  };

  const handlePayment = async () => {
    if (paymentInProgress.current || paymentNeedsReview) return;

    const amount = Math.round(total * 100);
    if (!Number.isSafeInteger(amount) || amount < 1) {
      showToast("error", "The order total is invalid. Please refresh and try again.");
      return;
    }

    const Razorpay = (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay;
    if (!Razorpay) {
      showToast("error", "Razorpay Checkout could not be loaded. Please check your connection and try again.");
      return;
    }

    paymentInProgress.current = true;
    checkoutCompleted.current = false;
    setIsProcessingPayment(true);

    try {
      const order = await createRazorpayOrder({
        amount,
        currency: "INR",
        receipt: `checkout-${Date.now()}`,
      });

      const razorpay = new Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Style Thread",
        description: "Order payment",
        order_id: order.orderId,
        handler: async (paymentResponse) => {
          checkoutCompleted.current = true;
          try {
            const verification = await verifyRazorpayPayment({
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });

            if (!verification.verified) {
              setPaymentNeedsReview(true);
              showToast("error", "Payment could not be verified. Please contact support before trying again.");
              return;
            }

            const cartCleared = await clearPaidCart();
            if (!cartCleared) {
              setPaymentNeedsReview(true);
              showToast("error", "Payment was verified, but the cart could not be cleared. Please contact support and do not pay again.");
              return;
            }

            showToast("success", "Payment verified successfully.");
            navigate("/thank-you", {
              replace: true,
              state: { paymentId: verification.paymentId },
            });
          } catch (error) {
            setPaymentNeedsReview(true);
            showToast("error", getPaymentErrorMessage(error, "Payment verification failed. Please contact support before trying again."));
          } finally {
            completePaymentAttempt();
          }
        },
        modal: {
          ondismiss: () => {
            if (paymentInProgress.current && !checkoutCompleted.current) {
              completePaymentAttempt();
              showToast("info", "Payment was cancelled.");
            }
          },
        },
        theme: { color: "#1d4ed8" },
      });

      razorpay.on("payment.failed", (response) => {
        completePaymentAttempt();
        showToast("error", response.error?.description || response.error?.reason || "Payment failed. Please try again.");
      });
      razorpay.open();
    } catch (error) {
      completePaymentAttempt();
      showToast("error", getPaymentErrorMessage(error, "Unable to start payment. Please try again."));
    }
  };

  return (
    <section className="order-review">
      <div className="order-review__header">
        <div>
          <p className="order-review__eyebrow">Almost there</p>
          <h2 className="order-review__heading">Review your order</h2>
          <p className="order-review__subheading">Confirm your details before completing payment.</p>
        </div>
        <span className="order-review__secure">✓ Secure checkout</span>
      </div>
      <div className="order-review__address">
        <div className="order-review__address-icon">⌖</div>
        <div>
          <span className="order-review__address-label">Delivering to</span>
          <strong>{address || <em>Address not provided</em>}</strong>
        </div>
      </div>

      <div className="order-review__items">
        {cartItems.map((cartItem, index) => {
          // Find the Product
          const product = products.find(
            (p) => p.productId === cartItem.productId
          );
          // Find the Variant
          const variant = product?.productVariants.find(
            (v) => v.productId === cartItem.productId
          ) as ProductVariantWithColor | undefined;
          // Find the Size
          const sizeObj = variant?.productVariantSizes.find(
            (s) => s.productVariantId === variant.productVariantId
          );
          const colorName =
            variant?.colorName ??
            variant?.color?.colorName ??
            dropdowns?.color?.find((color) => color.colorId === variant?.colorId)
              ?.colorName ??
            "Not specified";

          return (
            <div className="order-review__item-card" key={cartItem.cartId} style={{ animationDelay: `${index * 70}ms` }}>
              <img
                src={variant?.image[0] || "/default-product.png"}
                alt={product?.name}
                className="order-review__item-image"
              />
              <div className="order-review__item-details">
                <div className="order-review__item-heading">
                  <h4 className="order-review__item-title">{product?.name || "Product"}</h4>
                  <span className="order-review__item-quantity">Qty {cartItem.quantity}</span>
                </div>
                <p className="order-review__item-desc">{product?.description}</p>
                <div className="order-review__item-meta">
                  <div className="order-review__meta-item">
                    <span>Price</span>
                    <strong>₹{variant?.salePrice ?? variant?.price ?? "N/A"}</strong>
                  </div>
                  <div className="order-review__meta-item">
                    <span>Size</span>
                    <strong>{sizeObj?.size.sizeName || "—"}</strong>
                  </div>
                  <div className="order-review__meta-item">
                    <span>Colour</span>
                    <strong>{colorName}</strong>
                  </div>
                  <div className="order-review__meta-item order-review__meta-item--total">
                    <span>Item total</span>
                    <strong>₹{((variant?.salePrice ?? variant?.price ?? 0) * cartItem.quantity).toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="order-review__footer">
        <button
          className="order-review__btn order-review__btn--back"
          onClick={onBack}
          disabled={isProcessingPayment}
        >
          Back
        </button>
        <button
          className="order-review__btn order-review__btn--pay"
          onClick={handlePayment}
          disabled={isProcessingPayment || paymentNeedsReview}
        >
          {paymentNeedsReview
              ? "Verification pending"
              : isProcessingPayment
                ? "Processing payment…"
                : `Pay ₹${total.toFixed(2)}`}
        </button>
      </div>
    </section>
  );
};

export default OrderReview;
