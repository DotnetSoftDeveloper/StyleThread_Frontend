import { CartItem } from "../../Types/Interface/ICart";


export const getCartCount = (cartItems: CartItem[]): number => {
  return cartItems.reduce((total, item) => total + item.quantity, 0);
};