import { createAction, Middleware, Dispatch } from "@reduxjs/toolkit";
import axios, { Method } from "axios";

// Define API action types with strong typing
export const apiCallBegan = createAction<ApiCallBeganPayload>("api/callBegan");
export const apiCallSuccess = createAction<unknown>("api/callSuccess");
export const apiCallFailed = createAction<string>("api/callFailed");

interface ApiCallBeganPayload<T = unknown> {
  url: string;
  method?: Method;
  data?: T;
  onStart?: string;
  onSuccess?: string;
  onError?: string;
}

// Corrected middleware type definition
const api: Middleware<object,unknown, Dispatch> = ({ dispatch }) => (next) => async (action: unknown) => {
  // Ensure action has a 'type' before proceeding
  if (!action || typeof action !== "object" || !("type" in action)) {
    return next(action);
  }

  // Ensure it's an API call action with payload
  if (action.type !== apiCallBegan.type || !("payload" in action)) {
    return next(action);
  }

  // Type assertion for strong typing
  const { url, method, data, onStart, onSuccess, onError } = action.payload as ApiCallBeganPayload;

  if (onStart) dispatch({ type: onStart });

  next(action);

  // Retrieve token from localStorage
  const token = localStorage.getItem("token");

  try {
    const response = await axios.request({
      baseURL: "https://localhost:44314",
      url,
      method,
      data,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch(apiCallSuccess(response.data));
    if (onSuccess) dispatch({ type: onSuccess, payload: response.data });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    dispatch(apiCallFailed(errorMessage));
    if (onError) dispatch({ type: onError, payload: errorMessage });
  }
};

export default api;
