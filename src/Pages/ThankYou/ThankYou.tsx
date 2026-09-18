import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ThankYou.css";

interface ThankYouLocationState {
  paymentId?: string;
}

const ThankYou: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ThankYouLocationState | null;
  const paymentId = state?.paymentId;

  return (
    <main className="thank-you" aria-labelledby="thank-you-title">
      <div className="thank-you__glow thank-you__glow--one" />
      <div className="thank-you__glow thank-you__glow--two" />
      <div className="thank-you__confetti" aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => (
          <span key={index} style={{ "--confetti-index": index } as React.CSSProperties} />
        ))}
      </div>

      <section className="thank-you__card">
        <div className="thank-you__checkmark" aria-hidden="true">
          <svg viewBox="0 0 52 52" role="presentation">
            <circle cx="26" cy="26" r="24" />
            <path d="m15 27 7 7 15-16" />
          </svg>
        </div>
        <p className="thank-you__eyebrow">Payment complete</p>
        <h1 id="thank-you-title">Thank you for your order!</h1>
        <p className="thank-you__message">
          Your payment has been verified. We’ll begin preparing your Style Thread order shortly.
        </p>
        {paymentId && (
          <p className="thank-you__reference">
            Payment reference <strong>••••{paymentId.slice(-8)}</strong>
          </p>
        )}
        <button className="thank-you__button" onClick={() => navigate("/home")}>
          Continue shopping
        </button>
      </section>
    </main>
  );
};

export default ThankYou;
