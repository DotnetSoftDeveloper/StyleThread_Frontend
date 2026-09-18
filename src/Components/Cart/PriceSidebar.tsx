import React from "react";
import './PriceSidebar.css';
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { CartItem } from "../../Types/Interface/ICart";

// interface ListedCartItem {
//   price: number;
//   cuttedPrice: number;
//   quantity: number;
// }

interface PriceSidebarProps {
  cartItems: CartItem[];
}

interface CustomerData {
  iss: string;
  lastName?: string;
  sub: string;
}

const PriceSidebar: React.FC<PriceSidebarProps> = ({ cartItems }) => {
  //   const [subtotal, setSubtotal] = useState<number>(0);
    const shippingCost: number = 50;

  const totalOriginalPrice = cartItems.reduce(
    (sum, item) => sum + 100 * item.quantity,
    0
  );

  const totalDiscount = cartItems.reduce(
    (sum, item) =>
      sum + (100 * item.quantity - 1000 * item.quantity),
    0
  );

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + 100 * item.quantity,
    0
  );

    const handleCheckout = async () => {
      try {
        const token = localStorage.getItem("auth");
        if (!token) {
          alert("Client information is missing. Please log in.");
          return;
        }

        let clientData: CustomerData;
        try {
          clientData = jwtDecode<CustomerData>(token);
        } catch (error) {
          console.error("Invalid token", error);
          alert("Session expired. Please log in again.");
          localStorage.removeItem("auth");
          return;
        }

      //   if (typeof subtotal !== "number" || typeof shippingCost !== "number") {
      //     console.error("Subtotal or shippingCost is not defined properly.");
      //     alert("Invalid cart details. Please refresh and try again.");
      //     return;
      //   }

        const payload = {
          amount: 100 + shippingCost,
          referenceId: `order-${Date.now()}`,
          description: "Payment for Order",
          customer: {
            name: `${clientData.iss} ${clientData.lastName || ""}`,
            contact: "",
            email: clientData.sub
          },
          reminderEnable: true,
          callbackUrl: "http://localhost:3000/home",
          callbackMethod: "get"
        };

        console.log("Sending checkout request with payload:", payload);

        const response = await axios.post(
          "https://localhost:44314/api/Payment/GetPaymentLink",
          payload,
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );

        if (response.status === 200 && response.data.content) {
          console.log("Order Response:", response.data);
          const paymentLink = response.data.content.shortUrl;
          if (paymentLink) {
            window.open(paymentLink, "_blank");
          } else {
            alert("Invalid payment link received.");
          }
        } else {
          console.error("Unexpected API response:", response.data);
          alert("Failed to create order. Please try again.");
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error(
            "Error during checkout:",
            error.response?.data || error.message
          );
          alert(
            `Checkout error: ${
              error.response?.data?.message || "Please try again."
            }`
          );
        } else {
          console.error("Unexpected error:", error);
          alert("An unknown error occurred. Please try again.");
        }
      }
    };

  return (
    <div className="price-sidebar">
      <div className="price-box">
        <h1 className="price-title">Price Details</h1>

        <div className="price-content">
          <p className="price-row">
            Price ({cartItems.length} item{cartItems.length > 1 ? "s" : ""})
            <span>₹{totalOriginalPrice.toLocaleString()}</span>
          </p>

          <p className="price-row">
            Discount
            <span className="green-text">
              - ₹{totalDiscount.toLocaleString()}
            </span>
          </p>

          <p className="price-row">
            Delivery Charges <span className="green-text">FREE</span>
          </p>

          <div className="divider"></div>

          <p className="price-total">
            Total Amount <span>₹{totalAmount.toLocaleString()}</span>
          </p>

          <div className="divider"></div>

          <p className="green-text">
            You will save ₹{totalDiscount.toLocaleString()} on this order
          </p>

          <button className="checkout-btn" onClick={handleCheckout}>
              ₹{(totalAmount.toLocaleString())} CHECKOUT →
            </button>
        </div>
      </div>
    </div>
  );
};

export default PriceSidebar;
