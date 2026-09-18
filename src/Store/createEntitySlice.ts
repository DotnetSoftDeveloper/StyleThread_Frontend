import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  Draft
} from "@reduxjs/toolkit";
import axios, { Method } from "axios";
import { GenericResponse } from "../Types/Interface/IGenericResponse";

export interface EntityState<T> {
  list: T | T[]; // ✅ always an array
  loading: boolean;
  error: string | null;
}

// 🔹 Generic async thunk factory
export const createEntityThunk = <T>(
  name: string,
  url: string,
  method: Method = "GET"
) =>
  createAsyncThunk<GenericResponse<T | T[]>, unknown | void>(
    `${name}/${method.toLowerCase()}`,
    async (payload, { rejectWithValue }) => {
      try {
        // ✅ standardize on 'auth', fallback to 'token' if needed
        const token =
          localStorage.getItem("auth") ?? localStorage.getItem("token") ?? "";

        const response = await axios.request<GenericResponse<T | T[]>>({
          baseURL: "https://localhost:44314",
          url,
          method,
          headers: {
            Authorization: token ? `Bearer ${token}` : ""
          },
          ...(method === "GET" || method === "DELETE"
            ? { params: payload } // send query params for GET/DELETE
            : { data: payload }) // send body for POST/PUT
        });

        return response.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          return rejectWithValue(err.response?.data ?? err.message);
        }
        return rejectWithValue("Unexpected error");
      }
    }
  );

// 🔹 Slice factory
export function createEntitySlice<T>(name: string) {
  const initialState: EntityState<T> = {
    list: [],
    loading: false,
    error: null
  };

  const slice = createSlice({
    name,
    initialState,
    reducers: {
      setList: (state, action: PayloadAction<T[]>) => {
        state.list = action.payload as Draft<T[]>;
      },
      clearList: (state) => {
        state.list = [];
      }
    },
    extraReducers: (builder) => {
      builder
        // Pending
        .addMatcher(
          (action) =>
            action.type.startsWith(name) && action.type.endsWith("/pending"),
          (state) => {
            state.loading = true;
            state.error = null;
          }
        )
        // Fulfilled
        .addMatcher(
          (action) =>
            action.type.startsWith(name) && action.type.endsWith("/fulfilled"),
          (state, action: PayloadAction<GenericResponse<T | T[]>>) => {
            state.loading = false;
            const { success, content } = action.payload ?? {};
            if (success && content) {
              // ✅ normalize to array
              state.list = Array.isArray(content)
                ? (content as Draft<T[]>)
                : ([content] as Draft<T[]>);
            } else {
              state.list = [];
            }
          }
        )
        // Rejected
        .addMatcher(
          (action): action is PayloadAction<{ errorMessage?: string }> =>
            action.type.startsWith(name) && action.type.endsWith("/rejected"),
          (state, action) => {
            state.loading = false;
            state.error =
              (action.payload as { errorMessage?: string })?.errorMessage ||
              "Something went wrong";
          }
        );
    }
  });

  return slice;
}
