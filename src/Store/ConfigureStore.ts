import { configureStore } from "@reduxjs/toolkit";
import entityReducers from "./EntitySlices"; // default export map

const store = configureStore({
  reducer: {
    ...entityReducers
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
