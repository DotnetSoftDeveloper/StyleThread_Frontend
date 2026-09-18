import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getCartCount } from "../Utils/Helper/cartHelpers";
import { CartItem } from "../Types/Interface/ICart";
import { initialState } from "../Types/Interface/CartState";

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.cartCount = getCartCount(action.payload);
    },
    clearCart: (state) => {
      state.items = [];
      state.cartCount = 0;
    }
  }
});

export const { setCartItems, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
