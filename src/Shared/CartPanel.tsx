import React from "react";
import { FaTrash } from "react-icons/fa";

// Define the Cart Item interface
interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

// Define Props Interface for CartPanel
interface CartPanelProps {
  cartItems: CartItem[];
  onClose: () => void;
  removeFromCart?: (productId: number) => void; // Optional remove function
}

const CartPanel: React.FC<CartPanelProps> = ({ cartItems, onClose, removeFromCart }) => {
  const handleCheckout = () => {
    alert("Proceeding to Checkout...");
  };

  return (
    <div className="cart-panel">
      <div className="cart-panel-header">
        <h2>Shopping Cart</h2>
        <button className="close-panel-btn" onClick={onClose}>
          ✖
        </button>
      </div>
      <div className="cart-panel-content">
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          cartItems.map((item) => (
            <div className="cart-item" key={item.productId}>
              <img src={item.image} alt={item.name} className="cart-item-image" />
              <div className="cart-item-details">
                <h4>{item.name}</h4>
                <p>₹{item.price}</p>
                <p>Quantity: {item.quantity}</p>
              </div>
              {removeFromCart && (
                <button className="remove-btn" onClick={() => removeFromCart(item.productId)}>
                  <FaTrash />
                </button>
              )}
            </div>
          ))
        )}
      </div>
      {cartItems.length > 0 && (
        <div className="cart-panel-footer">
          <button className="checkout-btn" onClick={handleCheckout}>
            Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPanel;
