import { CartItem } from "./ICart";

export interface CartState {
  items: CartItem[];
  cartCount: number;
  loading: boolean;
  error: string | null;
}

// Initial state
export const initialState: CartState = {
  items: [],
  cartCount: 0,
  loading: false,
  error: null,
};