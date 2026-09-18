import React from "react";

interface RatesBreakdownProps {
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
}

const RatesBreakdown: React.FC<RatesBreakdownProps> = ({
  subtotal,
  shippingCost,
  tax,
  total,
}) => {
  return (
    <div className="rates-breakdown">
      <h3>Order summary</h3>
      <p><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></p>
      <p><span>Delivery</span><span>{shippingCost === 0 ? "Free" : `₹${shippingCost.toFixed(2)}`}</span></p>
      <p><span>Tax (18%)</span><span>₹{tax.toFixed(2)}</span></p>
      <hr />
      <h4><span>Total</span><span>₹{total.toFixed(2)}</span></h4>
      <p className="rates-breakdown__note">Taxes and delivery are included at checkout.</p>
    </div>
  );
};

export default RatesBreakdown;
