import React from "react";
import axios from "axios";

// Define types for customer and payment response
interface Customer {
  name: string;
  contact: string;
  email: string;
}

interface PaymentResponse {
  paymentLink?: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: { order_id: string; payment_id: string; signature: string }) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    address: string;
  };
  theme: {
    color: string;
  };
}

interface RazorpayInstance {
  open: () => void;
}

const Payment: React.FC = () => {
  const amount = 500;
  const referenceId = "order-12345";
  const description = "Payment for Order";
  const customer: Customer = {
    name: "John Doe",
    contact: "9999999999",
    email: "john@example.com",
  };

  const handlePayment = async () => {
    try {
      // Step 1: Request payment link from the backend
      const response = await axios.post<PaymentResponse>(
        "https://localhost:44314/api/Payment/GetPaymentLink",
        {
          amount,
          referenceId,
          description,
          customer,
          reminderEnable: true,
          callbackUrl: "http://localhost:3000/home", // Replace with your actual callback URL
          callbackMethod: "POST",
        }
      );

      // Step 2: Open Razorpay checkout with payment link URL (if required)
      const paymentLink = response.data.paymentLink;
      if (paymentLink) {
        window.location.href = paymentLink;
        return;
      }

      // Razorpay integration for direct payment
      const options: RazorpayOptions = {
        key: "YOUR_KEY_ID", // Replace with your Razorpay Key ID
        amount: amount * 100, // Amount in paise
        currency: "INR",
        name: "Your Company Name",
        description,
        order_id: referenceId,
        handler: async (paymentResponse) => {
          try {
            const verificationResponse = await axios.post<{ message: string }>(
              "http://localhost:5000/api/payment/verify-payment",
              {
                orderId: paymentResponse.order_id,
                paymentId: paymentResponse.payment_id,
                signature: paymentResponse.signature,
              }
            );
            alert(verificationResponse.data.message); // Show success message
          } catch (err) {
            console.error("Payment verification failed", err);
            alert("Payment verification failed");
          }
        },
        prefill: {
          name: customer.name,
          email: customer.email,
          contact: customer.contact,
        },
        notes: {
          address: "Your address here",
        },
        theme: {
          color: "#F37254",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Payment initiation failed", err);
      alert("Payment initiation failed");
    }
  };

  return (
    <div>
      <h1>Pay {amount} INR</h1>
      <button onClick={handlePayment}>Pay Now</button>
    </div>
  );
};

export default Payment;
