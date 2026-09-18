// src/Store/EntitySlices.ts
import { createEntitySlice, createEntityThunk } from "./createEntitySlice";
import { Product } from "../Types/Interface/IProduct";
import { DropdownOptions } from "../Types/Interface/DropDown";
import { CartItem } from "../Types/Interface/ICart";

// --- Product ---
const productSlice = createEntitySlice<Product>("product");
export const fetchProducts = createEntityThunk<Product>(
  "product",
  "/api/products"
);

// --- Dropdowns ---
const addProductsSlice = createEntitySlice<DropdownOptions>("addProducts");
export const fetchDropdowns = createEntityThunk<DropdownOptions>(
  "addProducts",
  "/api/Products/GetAllAddProduct"
);

// --- Cart ---
const cartSlice = createEntitySlice<CartItem>("cart");

// ✅ fetch without params
export const fetchCart = createEntityThunk<CartItem>(
  "cart",
  "/api/cart",
  "GET"
);

export const addToCart = createEntityThunk<CartItem>(
  "cart",
  "/api/cart",
  "POST"
);

export const updateCart = createEntityThunk<CartItem>(
  "cart",
  "/api/cart",
  "PUT"
);

export const removeCart = createEntityThunk<CartItem>(
  "cart",
  "/api/cart",
  "DELETE"
);

export const { setList: setCartList, clearList: clearCartList } =
  cartSlice.actions;

// 🔹 Reducers
export const productReducer = productSlice.reducer;
export const addProductsReducer = addProductsSlice.reducer;
export const cartEntityReducer = cartSlice.reducer;

export default {
  products: productReducer,
  addProducts: addProductsReducer,
  cartItem: cartEntityReducer // ✅ matches state.cartItem.list
};
