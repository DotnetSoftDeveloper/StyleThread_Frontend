import React, { useEffect, useRef, useState } from "react";
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
import { createCustomerOrder, validateCartForCheckout } from "../../Services/orderService";
import { CreateOrderRequest, OrderItemDetails } from "../../Types/Interface/IOrder";
import { getStoredToken } from "../../Utils/Helper/authHelpers";
import {
  Coupon,
  ValidateCouponResponse,
} from "../../Types/Interface/ICoupon";
import {
  fetchActiveCoupons,
  validateCouponApi,
} from "../../Services/couponService";

type ProductVariantWithColor = Product["productVariants"][number] & {
  color?: { colorName?: string };
};

interface Props {
  cartItems: CartItem[];
  total: number;
  subtotal: number;
  shippingCost: number;
  tax: number;
  address: string | null;
  onBack: () => void;
}

const OrderReview: React.FC<Props> = ({
  cartItems,
  subtotal,
  shippingCost,
  tax,
  address,
  onBack,
}) => {
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
  const [failedPaymentId, setFailedPaymentId] = useState<string | null>(null);
  const paymentInProgress = useRef(false);
  const checkoutCompleted = useRef(false);
  const authToken = getStoredToken();

  // Coupon Engine States
  const [couponInput, setCouponInput] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<ValidateCouponResponse | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [couponLoading, setCouponLoading] = useState<boolean>(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchActiveCoupons().then((coupons) => {
      if (isMounted) setAvailableCoupons(coupons);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim();
    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await validateCouponApi(code, subtotal);
      setAppliedCoupon(res);
      setCouponInput("");
      showToast("success", `Coupon '${res.code}' applied! Saved ₹${res.discountAmount.toFixed(2)}`);
    } catch (err: any) {
      setCouponError(err.message || "Failed to apply coupon.");
      showToast("error", err.message || "Failed to apply coupon.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    showToast("info", "Coupon removed.");
  };

  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const finalTotal = Math.max(0, subtotal - discountAmount) + shippingCost + tax;

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

  const getOrderItems = (): OrderItemDetails[] =>
    cartItems.map((cartItem) => {
      const product = products.find((p) => p.productId === cartItem.productId);
      const variant = product?.productVariants.find(
        (item) => item.productId === cartItem.productId
      ) as ProductVariantWithColor | undefined;
      const sizeObj = variant?.productVariantSizes.find(
        (item) => item.productVariantId === variant.productVariantId
      );
      const colorName =
        variant?.colorName ??
        variant?.color?.colorName ??
        dropdowns?.color?.find((color) => color.colorId === variant?.colorId)
          ?.colorName ??
        "Not specified";
      const price = variant?.salePrice ?? variant?.price ?? 0;

      return {
        productId: cartItem.productId,
        productVariantId: variant?.productVariantId,
        productName: product?.name || "Product",
        productDescription: product?.description,
        quantity: cartItem.quantity,
        price,
        colorName,
        sizeName: sizeObj?.size.sizeName || "Not specified",
        imageUrl: variant?.image[0],
      };
    });

  const saveVerifiedOrder = async (
    razorpayOrderId: string,
    paymentId: string,
  ) => {
    const customerId = cartItems[0]?.customerId;
    if (!customerId || !address) {
      throw new Error("Missing customer or delivery details for this order.");
    }

    const orderPayload: CreateOrderRequest = {
      customerId,
      orderDate: new Date().toISOString(),
      total: finalTotal,
      subtotal,
      shippingCost,
      tax,
      status: "Paid",
      deliveryAddress: address,
      razorpayOrderId,
      paymentId,
      currency: "INR",
      couponCode: appliedCoupon?.code,
      discount: discountAmount,
      items: getOrderItems(),
    };

    return createCustomerOrder(orderPayload, authToken);
  };

  const handlePayment = async () => {
    if (paymentInProgress.current || paymentNeedsReview) return;

    const amount = Math.round(finalTotal * 100);
    if (!Number.isSafeInteger(amount) || amount < 1) {
      showToast("error", "The order total is invalid. Please refresh and try again.");
      return;
    }

    if (!address) {
      showToast("error", "Please select a delivery address before payment.");
      return;
    }

    const Razorpay = (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay;
    if (!Razorpay) {
      showToast("error", "Razorpay Checkout could not be loaded. Please check your connection and try again.");
      return;
    }

    const customerId = cartItems[0]?.customerId;
    if (!customerId) {
      showToast("error", "Unable to verify customer session. Please sign in again.");
      return;
    }

    paymentInProgress.current = true;
    checkoutCompleted.current = false;
    setIsProcessingPayment(true);

    try {
      // 1. Authoritative server-side pre-payment validation
      const validation = await validateCartForCheckout(customerId, authToken);
      if (!validation.isValid) {
        completePaymentAttempt();
        showToast("error", validation.message || "Some items in your bag are out of stock or unavailable.");
        return;
      }

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
        description: appliedCoupon
          ? `Order payment (Coupon ${appliedCoupon.code} applied)`
          : "Order payment",
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
              setFailedPaymentId(paymentResponse.razorpay_payment_id || null);
              showToast("error", "Payment could not be verified. Please contact support before trying again.");
              return;
            }

            const savedOrder = await saveVerifiedOrder(
              verification.orderId,
              verification.paymentId,
            );

            const cartCleared = await clearPaidCart();
            if (!cartCleared) {
              setPaymentNeedsReview(true);
              setFailedPaymentId(verification.paymentId || null);
              showToast("error", "Payment was verified, but the cart could not be cleared. Please contact support and do not pay again.");
              return;
            }

            showToast("success", "Payment verified and order placed successfully!");
            navigate("/thank-you", {
              replace: true,
              state: { orderId: savedOrder.orderId, paymentId: verification.paymentId },
            });
          } catch (error) {
            setPaymentNeedsReview(true);
            setFailedPaymentId(paymentResponse.razorpay_payment_id || null);
            showToast(
              "error",
              error instanceof Error
                ? error.message
                : getPaymentErrorMessage(error, "Payment was verified, but the order could not be saved. Please contact support before trying again."),
            );
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
      {paymentNeedsReview && failedPaymentId && (
        <div 
          className="order-review__recovery-alert"
          style={{
            background: "#fee2e2",
            border: "1px solid #ef4444",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "20px",
            color: "#991b1b"
          }}
          role="alert"
        >
          <h4 style={{ margin: "0 0 6px 0", fontSize: "1.05rem", fontWeight: 700 }}>
            ⚠️ Payment Received – Finalizing Order Requires Support
          </h4>
          <p style={{ margin: "0 0 8px 0", fontSize: "0.95rem" }}>
            Your payment of <strong>₹{finalTotal.toFixed(2)}</strong> was received by Razorpay (Payment Reference: <code>{failedPaymentId}</code>), but our server encountered an error while saving your order.
          </p>
          <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600 }}>
            Please <strong>DO NOT</strong> attempt to pay again. Please reach out to support at <em>support@stylethread.com</em> quoting your Payment Reference for immediate fulfillment or refund.
          </p>
        </div>
      )}

      <div className="order-review__header">
        <div>
          <p className="order-review__eyebrow">Almost there</p>
          <h2 className="order-review__heading">Review your order</h2>
          <p className="order-review__subheading">Confirm your details and promo codes before completing payment.</p>
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

      {/* Cart Items List */}
      <div className="order-review__items">
        {cartItems.map((cartItem, index) => {
          const product = products.find((p) => p.productId === cartItem.productId);
          const variant = product?.productVariants.find(
            (v) => v.productId === cartItem.productId
          ) as ProductVariantWithColor | undefined;
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

      {/* Promotional Coupons Section */}
      <div className="order-review__coupon-section">
        <div className="order-review__coupon-header">
          <span className="order-review__coupon-icon">🏷️</span>
          <div>
            <strong>Coupons & Promotional Offers</strong>
            <p>Save more on your order with an exclusive store promo code</p>
          </div>
        </div>

        {appliedCoupon ? (
          <div className="order-review__coupon-applied">
            <div className="order-review__coupon-applied-info">
              <span className="applied-tag">✓ PROMO APPLIED</span>
              <strong>{appliedCoupon.code}</strong>
              <span className="applied-savings">
                You saved <strong>₹{appliedCoupon.discountAmount.toFixed(2)}</strong>!
              </span>
            </div>
            <button
              type="button"
              className="order-review__coupon-remove-btn"
              onClick={handleRemoveCoupon}
              title="Remove coupon"
            >
              Remove ✕
            </button>
          </div>
        ) : (
          <div className="order-review__coupon-form">
            <div className="order-review__coupon-input-group">
              <input
                type="text"
                placeholder="Enter promo code (e.g. STYLE20)"
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value.toUpperCase());
                  if (couponError) setCouponError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyCoupon();
                  }
                }}
                className="order-review__coupon-input"
                disabled={couponLoading}
              />
              <button
                type="button"
                className="order-review__coupon-btn"
                onClick={() => handleApplyCoupon()}
                disabled={couponLoading || !couponInput.trim()}
              >
                {couponLoading ? "Checking…" : "Apply Code"}
              </button>
            </div>
            {couponError && <p className="order-review__coupon-error">{couponError}</p>}
          </div>
        )}

        {/* Available Offers Chips */}
        {availableCoupons.length > 0 && !appliedCoupon && (
          <div className="order-review__offers-drawer">
            <span className="offers-drawer-title">Available Offers:</span>
            <div className="offers-chips">
              {availableCoupons.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  className="offer-chip"
                  onClick={() => handleApplyCoupon(c.code)}
                  disabled={couponLoading}
                  title={c.description}
                >
                  <span className="offer-chip-code">{c.code}</span>
                  <span className="offer-chip-desc">
                    {c.discountType === 1 ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pricing Summary Breakdown */}
      <div className="order-review__summary-card">
        <div className="order-review__summary-row">
          <span>Bag Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="order-review__summary-row order-review__summary-row--discount">
            <span>Coupon Discount ({appliedCoupon?.code})</span>
            <span className="discount-value">-₹{discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="order-review__summary-row">
          <span>Delivery Charges</span>
          <span>{shippingCost === 0 ? "FREE" : `₹${shippingCost.toFixed(2)}`}</span>
        </div>
        <div className="order-review__summary-row">
          <span>Estimated Taxes (18%)</span>
          <span>₹{tax.toFixed(2)}</span>
        </div>
        <div className="order-review__summary-row order-review__summary-row--total">
          <span>Total Payable</span>
          <strong>₹{finalTotal.toFixed(2)}</strong>
        </div>
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
              : `Pay ₹${finalTotal.toFixed(2)}`}
        </button>
      </div>
    </section>
  );
};

export default OrderReview;
