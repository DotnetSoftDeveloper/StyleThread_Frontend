import { configureStore } from "@reduxjs/toolkit";
import entityReducers from "./EntitySlices"; // default export map
import wishlistReducer from "./WishlistSlice";

const store = configureStore({
  reducer: {
    ...entityReducers,
    wishlist: wishlistReducer,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
